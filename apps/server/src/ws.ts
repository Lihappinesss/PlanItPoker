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

        const clientsInRoom = Array.from(connectedClients.values())
          .flatMap((set) => Array.from(set))
          .filter((client) => client.roomId === ws.roomId);

        const uniqueLogins = Array.from(new Set(clientsInRoom.map((c) => c.login)));

        const allVoted = uniqueLogins.every((login) =>
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
              status: 'finished',
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

      else {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    });

    ws.on('close', () => {
      if (connectedClients.has(ws.login!)) {
        const clientSet = connectedClients.get(ws.login!)!;
        clientSet.delete(ws);
        if (clientSet.size === 0) connectedClients.delete(ws.login!);

        const clientsInRoom = Array.from(connectedClients.values())
          .flatMap(clientSet => Array.from(clientSet))
          .filter((client) => client.roomId === roomId)
          .reduce((uniqueClients, client) => {
            if (!uniqueClients.some(uClient => uClient.login === client.login)) {
              uniqueClients.push(client);
            }
            return uniqueClients;
          }, [] as ExtendedWebSocket[])
          .map((client) => ({ login: client.login, roomId: client.roomId, role: client.role }));

        const updateMessage = JSON.stringify({ command: 'connectedClients', clients: clientsInRoom });
        wss.clients.forEach((client: ExtendedWebSocket) => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(updateMessage);
          }
        });
      }
    });
  });
}

export default startWs;
