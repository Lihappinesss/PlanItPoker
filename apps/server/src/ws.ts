import WebSocket from 'ws';
import http from 'http';
import { Express } from 'express';

import { ExtendedWebSocket } from './types';


function startWs(app: Express) {
  const server = http.createServer(app);

  const PORT = process.env.SERVER_PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocket.Server({ server });
  const connectedClients: Set<ExtendedWebSocket> = new Set();

  wss.on('connection', (ws: ExtendedWebSocket) => {
    let login = '';
    let roomId;
    let vote = 0;
    let role = '';

    ws.on('message', async (message: string) => {
      const request = JSON.parse(message);

      if (request.command === 'getConnectedClients') {
        roomId = request.payload.roomId;
        login = request.payload.login;
        role = request.payload.role;
  
        ws.login = login;
        ws.roomId = roomId;
        ws.role = role;
        connectedClients.add(ws);

        const clientsInRoom = Array.from(connectedClients)
          .filter((client) => client?.roomId === roomId)
          .map((client) => ({
            login: client.login,
            roomId: client.roomId,
            role: client.role,
          }));

        ws.send(JSON.stringify({ command: 'connectedClients', clients: clientsInRoom }));
      } 
      else if (request.command === 'vote') {
        vote = request.payload.vote;

        connectedClients.forEach((client) => {
          if (client?.roomId === ws.roomId && client?.login === ws.login) {
            client.vote = vote;
          }
        });

        const allVoted = Array.from(connectedClients)
          .filter((client) => client.roomId === ws.roomId)
          .every((client) => client.vote !== undefined);

        if (allVoted) {
          const allVotes = Array.from(connectedClients)
            .filter((client) => client.roomId === ws.roomId)
            .map((client) => ({
              login: client.login,
              vote: client.vote,
              roomId: client.roomId
            }));
          
          wss.clients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
              client.send(JSON.stringify({ command: 'allVotes', votes: allVotes }));
            }
          });
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
      connectedClients.delete(ws);
    });
  });
}

export default startWs;