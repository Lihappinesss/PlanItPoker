import WebSocket from 'ws';
import http from 'http';
import { Express } from 'express';
import session from 'express-session';
import type { IncomingMessage } from 'http';
import Task from './models/task';
import User from './models/user';

import {
  AddTasksPayload,
  ExtendedWebSocket,
  JoinRoomPayload,
  RemoveTaskPayload,
  RemoveTasksPayload,
  UpdateStoryPointPayload,
  VotePayload,
  WsRequest,
} from './types';

type SessionRequest = IncomingMessage & {
  session?: session.Session & Partial<session.SessionData> & {
    user?: {
      id: number;
    };
  };
};

const sendJson = (ws: ExtendedWebSocket, payload: unknown) => {
  ws.send(JSON.stringify(payload));
};

const parseRequest = (message: WebSocket.RawData): WsRequest | null => {
  try {
    const parsed = JSON.parse(message.toString()) as WsRequest;

    if (!parsed || typeof parsed.command !== 'string') {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
};

const getClientsInRoom = (
  connectedClients: Map<string, Set<ExtendedWebSocket>>,
  roomId: number
) =>
  Array.from(connectedClients.values())
    .flatMap((set) => Array.from(set))
    .filter((client) => client.roomId === roomId);

const getUniqueClientsInRoom = (
  connectedClients: Map<string, Set<ExtendedWebSocket>>,
  roomId: number
) => {
  const uniqueClientsMap = new Map<string, ExtendedWebSocket>();

  for (const socketSet of connectedClients.values()) {
    for (const client of socketSet) {
      if (client.roomId === roomId && !uniqueClientsMap.has(client.login)) {
        uniqueClientsMap.set(client.login, client);
      }
    }
  }

  return Array.from(uniqueClientsMap.values());
};

const broadcastToRoom = (
  wss: WebSocket.Server,
  roomId: number,
  payload: unknown,
  exclude?: ExtendedWebSocket
) => {
  const message = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    const extendedClient = client as ExtendedWebSocket;

    if (
      extendedClient.readyState === WebSocket.OPEN &&
      extendedClient.roomId === roomId &&
      extendedClient !== exclude
    ) {
      extendedClient.send(message);
    }
  });
};

const tryFinalizeVoting = async (
  wss: WebSocket.Server,
  connectedClients: Map<string, Set<ExtendedWebSocket>>,
  roomId: number,
  taskId?: number
) => {
  const uniqueClientsInRoom = getUniqueClientsInRoom(connectedClients, roomId);
  const votingClients = uniqueClientsInRoom.filter((client) => client.role === 'voting');

  if (votingClients.length === 0) {
    return;
  }

  const allVoted = votingClients.every((client) => client.vote !== undefined);

  if (!allVoted) {
    return;
  }

  const votesByUser = votingClients.map((client) => ({
    login: client.login,
    vote: client.vote,
    roomId,
  }));

  const total = votesByUser.reduce((sum, userVote) => sum + (userVote.vote || 0), 0);
  const storyPoint = parseFloat((total / votesByUser.length).toFixed(2));
  const roundedStoryPoint = Math.round(storyPoint);

  let targetTaskId = taskId;

  if (targetTaskId === undefined) {
    const currentTask = await Task.findOne({
      where: { roomId, status: 'pending', storyPoint: 0 },
      order: [['id', 'ASC']],
    });

    targetTaskId = currentTask?.id;
  }

  if (targetTaskId === undefined) {
    return;
  }

  await Task.update(
    { storyPoint: roundedStoryPoint },
    { where: { id: targetTaskId, roomId } }
  );

  broadcastToRoom(wss, roomId, {
    command: 'updateVotes',
    votes: votesByUser,
    storyPoint: roundedStoryPoint,
  });
};

const isJoinRoomPayload = (payload: unknown): payload is JoinRoomPayload => {
  const candidate = payload as JoinRoomPayload;

  return Boolean(
    candidate &&
    Number.isFinite(Number(candidate.roomId))
  );
};

const isVotePayload = (payload: unknown): payload is VotePayload => {
  const candidate = payload as VotePayload;

  return Boolean(
    candidate &&
    Number.isFinite(Number(candidate.vote)) &&
    Number.isFinite(Number(candidate.taskId)) &&
    Number.isFinite(Number(candidate.roomId))
  );
};

const isAddTasksPayload = (payload: unknown): payload is AddTasksPayload => {
  const candidate = payload as AddTasksPayload;

  return Boolean(
    candidate &&
    Array.isArray(candidate.tasks) &&
    candidate.tasks.every((task) => typeof task === 'string')
  );
};

const isRemoveTasksPayload = (payload: unknown): payload is RemoveTasksPayload => {
  const candidate = payload as RemoveTasksPayload;

  return Boolean(
    candidate &&
    Number.isFinite(Number(candidate.roomId)) &&
    Array.isArray(candidate.tasksForRemove)
  );
};

const isRemoveTaskPayload = (payload: unknown): payload is RemoveTaskPayload => {
  const candidate = payload as RemoveTaskPayload;

  return Boolean(
    candidate &&
    Number.isFinite(Number(candidate.roomId)) &&
    Number.isFinite(Number(candidate.taskForRemove))
  );
};

const isUpdateStoryPointPayload = (
  payload: unknown
): payload is UpdateStoryPointPayload => {
  const candidate = payload as UpdateStoryPointPayload;

  return Boolean(
    candidate &&
    Number.isFinite(Number(candidate.roomId)) &&
    Number.isFinite(Number(candidate.taskId)) &&
    typeof candidate.vote === 'number'
  );
};


function startWs(
  app: Express,
  sessionMiddleware: ReturnType<typeof session>
) {
  const server = http.createServer(app);

  const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3000);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocket.Server({ noServer: true });
  const connectedClients: Map<string, Set<ExtendedWebSocket>> = new Map();

  server.on('upgrade', (request, socket, head) => {
    sessionMiddleware(request as never, {} as never, () => {
      const sessionRequest = request as SessionRequest;
      const userId = sessionRequest.session?.user?.id;

      if (!userId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const extendedSocket = ws as ExtendedWebSocket;
        extendedSocket.userId = userId;
        wss.emit('connection', extendedSocket, request);
      });
    });
  });

  wss.on('connection', (ws: ExtendedWebSocket, request: IncomingMessage) => {
    let login = '';
    let roomId: number | undefined;
    let role = '';

    ws.on('message', async (message) => {
      const parsedRequest = parseRequest(message);

      if (!parsedRequest) {
        sendJson(ws, {
          command: 'error',
          message: 'Invalid WebSocket payload',
        });
        return;
      }

      if (parsedRequest.command === 'joinrRoom') {
        if (!isJoinRoomPayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for joinrRoom',
          });
          return;
        }

        const sessionRequest = request as SessionRequest;
        const userId = sessionRequest.session?.user?.id ?? ws.userId;

        if (!userId) {
          sendJson(ws, {
            command: 'error',
            message: 'Unauthorized WebSocket session',
          });
          return;
        }

        const user = await User.findByPk(userId);
        if (!user) {
          sendJson(ws, {
            command: 'error',
            message: 'User not found',
          });
          return;
        }

        roomId = Number(parsedRequest.payload.roomId);
        login = user.username;
        role = user.role;

        ws.userId = user.id;
        ws.login = login;
        ws.roomId = roomId;
        ws.role = role;
        ws.hasVoted = false;

        let userSockets = connectedClients.get(login);
        if (!userSockets) {
          userSockets = new Set<ExtendedWebSocket>();
          connectedClients.set(login, userSockets);
        }
        userSockets.add(ws);

        const clientsInRoom = getUniqueClientsInRoom(connectedClients, roomId).map((client) => ({
          login: client.login,
          roomId: client.roomId,
          role: client.role,
        }));

        broadcastToRoom(wss, roomId, {
          command: 'updateConnectedClients',
          clients: clientsInRoom,
        });
      }

      else if (parsedRequest.command === 'vote') {
        if (!isVotePayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for vote',
          });
          return;
        }

        const currentRoomId = ws.roomId;
        if (currentRoomId === undefined) {
          sendJson(ws, {
            command: 'error',
            message: 'User is not joined to a room',
          });
          return;
        }

        const vote = Number(parsedRequest.payload.vote);

        const userSockets = connectedClients.get(ws.login);
        if (!userSockets) return;

        const hasVoted = Array.from(userSockets).some(
          (client) => client.roomId === currentRoomId && client.vote !== undefined
        );

        if (hasVoted) return;

        userSockets.forEach((client) => {
          if (client.roomId === currentRoomId) {
            client.vote = vote;
            client.hasVoted = true;
          }
        });

        sendJson(ws, {
          command: 'ownVote',
          login: ws.login,
          vote,
          roomId: currentRoomId,
        });

        broadcastToRoom(wss, currentRoomId, {
          command: 'voteStatus',
          login: ws.login,
          roomId: currentRoomId,
          vote,
        }, ws);

        await tryFinalizeVoting(
          wss,
          connectedClients,
          currentRoomId,
          parsedRequest.payload.taskId
        );
      }

      else if (parsedRequest.command === 'addTasksRequest') {
        if (!isAddTasksPayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for addTasksRequest',
          });
          return;
        }

        if (!roomId) {
          console.error('Room ID is undefined.');
          return;
        }

        const newTasks = parsedRequest.payload.tasks;

        for (const taskLink of newTasks) {
          const [, created] = await Task.findOrCreate({
            where: { link: taskLink, roomId },
            defaults: {
              status: 'pending',
              storyPoint: 0,
            },
          });

          if (!created) {
            console.log(`Task ${taskLink} уже существует в комнате ${roomId}`);
          }
        }

        const tasks = await Task.findAll({ where: { roomId, status: 'pending' } });

        const taskMessage = JSON.stringify({
          command: 'tasksAdded',
          tasks: tasks.map(t => t.link),
        });

        broadcastToRoom(wss, roomId, JSON.parse(taskMessage));
      }

      else if (parsedRequest.command === 'proceedToNextTask') {
        if (!roomId) return;

        const currentRoomId = ws.roomId;
        if (currentRoomId === undefined) {
          sendJson(ws, {
            command: 'error',
            message: 'User is not joined to a room',
          });
          return;
        }

        const clientsInRoom = getClientsInRoom(connectedClients, currentRoomId);

        clientsInRoom.forEach(client => {
          client.vote = undefined;
          client.hasVoted = false;
        });

        const tasks = await Task.findAll({
          where: { roomId: Number(roomId), status: 'pending' },
          order: [['id', 'ASC']],
        });

        if (tasks.length === 0) return;

        const [firstTask, ...rest] = tasks;

        await firstTask.update({ status: 'finished' });

        const nextTaskMessage = JSON.stringify({
          command: 'proceedToNextTask',
          tasks: rest.map(t => t.link),
        });

        broadcastToRoom(wss, roomId, JSON.parse(nextTaskMessage));
      }

      else if (parsedRequest.command === 'removeTasks') {
        if (!isRemoveTasksPayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for removeTasks',
          });
          return;
        }

        const { roomId, tasksForRemove } = parsedRequest.payload;
        const taskIds = tasksForRemove.map((task: { id: number }) => task.id);

        try {
          await Task.destroy({
            where: {
              id: taskIds,
              roomId: roomId,
            },
          });

          const updateMessage = JSON.stringify({
            command: 'tasksRemoved',
            payload: {
              removedIds: taskIds,
            },
          });

          broadcastToRoom(wss, roomId, JSON.parse(updateMessage));
        } catch (error) {
          console.error('Error while removing tasks:', error);
        }
      }

      else if (parsedRequest.command === 'removeTask') {
        if (!isRemoveTaskPayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for removeTask',
          });
          return;
        }

        const { roomId, taskForRemove } = parsedRequest.payload;

        try {
          await Task.destroy({
            where: {
              id: taskForRemove,
              roomId: roomId,
            },
          });

          const updateMessage = JSON.stringify({
            command: 'taskRemoved',
            payload: {
              removedIds: taskForRemove,
            },
          });

          broadcastToRoom(wss, roomId, JSON.parse(updateMessage));
        } catch (error) {
          console.error('Error while removing tasks:', error);
        }
      }

      else if (parsedRequest.command === 'updateStoryPoint') {
        if (!isUpdateStoryPointPayload(parsedRequest.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for updateStoryPoint',
          });
          return;
        }

        const { roomId, taskId, vote } = parsedRequest.payload;

        try {
          await Task.update(
            { storyPoint: vote },
            { where: { id: taskId, roomId } }
          );

          const updateMessage = JSON.stringify({
            command: 'storyPointUpdated',
            payload: {
              taskId,
              roomId,
              storyPoint: vote
            }
          });

          broadcastToRoom(wss, roomId, JSON.parse(updateMessage));
        } catch (error) {
          console.error('Failed to update storyPoint:', error);
        }
      }

      else {
          sendJson(ws, {
            command: 'error',
            message: `Unsupported command: ${parsedRequest.command}`,
          });
      }
    });

    ws.on('close', async () => {
      try {
        if (!ws.login) return;

        const roomId = ws.roomId;
        if (!roomId) return;

        const clientSet = connectedClients.get(ws.login);

        if (clientSet) {
          clientSet.delete(ws);
          if (clientSet.size === 0) connectedClients.delete(ws.login);
        }

        const clientsInRoom = getUniqueClientsInRoom(connectedClients, roomId).map((client) => ({
          login: client.login,
          roomId: client.roomId,
          role: client.role,
        }));

        broadcastToRoom(wss, roomId, {
          command: 'updateConnectedClients',
          clients: clientsInRoom,
        });

        await tryFinalizeVoting(wss, connectedClients, roomId);
      } catch (error) {
        console.error('Error handling ws close:', error);
      }
    });
  });
}

export default startWs;
