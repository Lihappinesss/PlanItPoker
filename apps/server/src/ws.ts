import WebSocket from 'ws';
import http from 'http';
import { Express } from 'express';
import Task from './models/task';

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

const isJoinRoomPayload = (payload: unknown): payload is JoinRoomPayload => {
  const candidate = payload as JoinRoomPayload;

  return Boolean(
    candidate &&
    typeof candidate.login === 'string' &&
    candidate.login.trim() &&
    typeof candidate.role === 'string' &&
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


function startWs(app: Express) {
  const server = http.createServer(app);

  const PORT = process.env.SERVER_PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocket.Server({ server });
  const connectedClients: Map<string, Set<ExtendedWebSocket>> = new Map();

  wss.on('connection', (ws: ExtendedWebSocket) => {
    let login = '';
    let roomId: number | undefined;
    let role = '';

    ws.on('message', async (message) => {
      const request = parseRequest(message);

      if (!request) {
        sendJson(ws, {
          command: 'error',
          message: 'Invalid WebSocket payload',
        });
        return;
      }

      if (request.command === 'joinrRoom') {
        if (!isJoinRoomPayload(request.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for joinrRoom',
          });
          return;
        }

        roomId = Number(request.payload.roomId);
        login = request.payload.login;
        role = request.payload.role;

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

      else if (request.command === 'vote') {
        if (!isVotePayload(request.payload)) {
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

        const vote = Number(request.payload.vote);

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

        const clientsInRoom = getClientsInRoom(connectedClients, currentRoomId);

        const uniqueLogins = Array.from(new Set(clientsInRoom.map((c) => c.login)));

        const votingLogins = Array.from(
          new Set(clientsInRoom.filter(c => c.role === 'voting').map(c => c.login))
        );

        const allVoted = votingLogins.every((login) =>
          clientsInRoom.some((c) => c.login === login && c.vote !== undefined)
        );

        if (allVoted) {
          const votesByUser = uniqueLogins.map((login) => {
            const voteClient = clientsInRoom.find((c) => c.login === login && c.vote !== undefined);
            return {
              login,
              vote: voteClient?.vote,
              roomId: currentRoomId,
            };
          });

          const total = votesByUser.reduce((sum, v) => sum + (v.vote || 0), 0);
          const storyPoint = parseFloat((total / votesByUser.length).toFixed(2));
          const roundedStoryPoint = Math.round(storyPoint);

          await Task.update(
            {
              storyPoint: roundedStoryPoint,
            },
            {
              where: { id: request.payload.taskId, roomId: request.payload.roomId },
            }
          );

          broadcastToRoom(wss, currentRoomId, {
            command: 'updateVotes',
            votes: votesByUser,
            storyPoint: roundedStoryPoint,
          });
        }
      }

      else if (request.command === 'addTasksRequest') {
        if (!isAddTasksPayload(request.payload)) {
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

        const newTasks = request.payload.tasks;

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

      else if (request.command === 'proceedToNextTask') {
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

      else if (request.command === 'removeTasks') {
        if (!isRemoveTasksPayload(request.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for removeTasks',
          });
          return;
        }

        const { roomId, tasksForRemove } = request.payload;
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

      else if (request.command === 'removeTask') {
        if (!isRemoveTaskPayload(request.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for removeTask',
          });
          return;
        }

        const { roomId, taskForRemove } = request.payload;

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

      else if (request.command === 'updateStoryPoint') {
        if (!isUpdateStoryPointPayload(request.payload)) {
          sendJson(ws, {
            command: 'error',
            message: 'Invalid payload for updateStoryPoint',
          });
          return;
        }

        const { roomId, taskId, vote } = request.payload;

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
          message: `Unsupported command: ${request.command}`,
        });
      }
    });

    ws.on('close', () => {
      try {
        if (!ws.login) return;

        const roomId = ws.roomId;
        if (!roomId) return;

        if (connectedClients.has(ws.login)) {
          const clientSet = connectedClients.get(ws.login)!;
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
      } catch (error) {
        console.error('Error handling ws close:', error);
      }
    });
  });
}

export default startWs;
