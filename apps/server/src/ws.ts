import WebSocket from 'ws';
import http from 'http';
import { Express } from 'express';
import Task from './models/task';

import { ExtendedWebSocket } from './types';


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
    let roomId: string | undefined;
    let role = '';

    ws.on('message', async (message: string) => {
      const request = JSON.parse(message);

      if (request.command === 'joinrRoom') {
        roomId = request.payload.roomId;
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

        const uniqueClientsMap = new Map<string, ExtendedWebSocket>();

        for (const socketSet of connectedClients.values()) {
          for (const client of socketSet) {
            if (client.roomId === roomId && !uniqueClientsMap.has(client.login)) {
              uniqueClientsMap.set(client.login, client);
            }
          }
        }

        const clientsInRoom = Array.from(uniqueClientsMap.values()).map(client => ({
          login: client.login,
          roomId: client.roomId,
          role: client.role,
        }));

        const updateMessage = JSON.stringify({
          command: 'updateConnectedClients',
          clients: clientsInRoom
        });

        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(updateMessage);
          }
        });
      }

      else if (request.command === 'vote') {
        const vote = Number(request.payload.vote);

        if (isNaN(vote)) return;

        const userSockets = connectedClients.get(ws.login);
        if (!userSockets) return;

        const hasVoted = Array.from(userSockets).some(
          (client) => client.roomId === ws.roomId && client.vote !== undefined
        );

        if (hasVoted) return;

        userSockets.forEach((client) => {
          if (client.roomId === ws.roomId) {
            client.vote = vote;
            client.hasVoted = true;
          }
        });

        ws.send(
          JSON.stringify({
            command: 'ownVote',
            login: ws.login,
            vote,
            roomId: ws.roomId,
          })
        );

        const voteStatusMessage = JSON.stringify({
          command: 'voteStatus',
          login: ws.login,
          roomId: ws.roomId,
          vote,
        });
        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.roomId === ws.roomId &&
            client !== ws
          ) {
            client.send(voteStatusMessage);
          }
        });

        const clientsInRoom = Array.from(connectedClients.values())
          .flatMap((set) => Array.from(set))
          .filter((client) => client.roomId === ws.roomId);

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
              roomId: ws.roomId,
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

          const voteMessage = JSON.stringify({
            command: 'updateVotes',
            votes: votesByUser,
            storyPoint: roundedStoryPoint,
          });

          wss.clients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
              client.send(voteMessage);
            }
          });
        }
      }

      else if (request.command === 'addTasksRequest') {
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

        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(taskMessage);
          }
        });
      }

      else if (request.command === 'proceedToNextTask') {
        if (!roomId) return;

        const clientsInRoom = Array.from(connectedClients.values())
          .flatMap(set => Array.from(set))
          .filter(client => client.roomId === ws.roomId);

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

        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(nextTaskMessage);
          }
        });
      }

      else if (request.command === 'removeTasks') {
        const { roomId, tasksForRemove } = request.payload;

        if (!Array.isArray(tasksForRemove)) {
          console.error('Invalid payload for removeTasks');
          return;
        }

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

          wss.clients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
              client.send(updateMessage);
            }
          });
        } catch (error) {
          console.error('Error while removing tasks:', error);
        }
      }

      else if (request.command === 'removeTask') {
        const { roomId, taskForRemove } = request.payload;


        if (!taskForRemove || !roomId) {
          console.error('Invalid payload for removeTasks');
          return;
        }

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

          wss.clients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
              client.send(updateMessage);
            }
          });
        } catch (error) {
          console.error('Error while removing tasks:', error);
        }
      }

      else if (request.command === 'updateStoryPoint') {
        const { roomId, taskId, vote } = request.payload;

        if (!roomId || !taskId || typeof vote !== 'number') {
          console.error('Invalid payload for updateStoryPoint');
          return;
        }

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

          wss.clients.forEach((client: ExtendedWebSocket) => {
            if (
              client.readyState === WebSocket.OPEN &&
              client.roomId === roomId
            ) {
              client.send(updateMessage);
            }
          });
        } catch (error) {
          console.error('Failed to update storyPoint:', error);
        }
      }

      else {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
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

        const uniqueClientsMap = new Map<string, ExtendedWebSocket>();
        for (const clientSet of connectedClients.values()) {
          for (const client of clientSet) {
            if (client.roomId === roomId && !uniqueClientsMap.has(client.login)) {
              uniqueClientsMap.set(client.login, client);
            }
          }
        }

        const clientsInRoom = Array.from(uniqueClientsMap.values()).map(client => ({
          login: client.login,
          roomId: client.roomId,
          role: client.role,
        }));

        const updateMessage = JSON.stringify({ command: 'updateConnectedClients', clients: clientsInRoom });

        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(updateMessage);
          }
        });
      } catch (error) {
        console.error('Error handling ws close:', error);
      }
    });
  });
}

export default startWs;
