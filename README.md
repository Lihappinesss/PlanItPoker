# PlanitPoker
Interactive Planning Poker application for team task estimation. Supports participant roles, real-time synchronization via WebSocket, and stores data in PostgreSQL.

https://github.com/user-attachments/assets/82346a65-237f-4e23-a9e8-fbbcae6a628e


🚀 Features

Create rooms for voting

Support for roles: voter and observer

Real-time task voting

Display participant status (✔️ voted / ⬜ not voted)

Automatic calculation of Story Points after all votes are in

Task and result storage in PostgreSQL

🛠 Technologies

Frontend: React, TypeScript, WebSocket

Backend: Node.js, TypeScript, Express, WebSocket

Database: PostgreSQL + Sequelize ORM

Build: Webpack

Styles: CSS / Stylus

📦 Installation & Setup
1. Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

2. Install dependencies
npm install

3. Setup environment variables

Create a .env file in the project root:

DB_HOST=localhost

DB_PORT=5432

DB_USER=postgres

DB_PASSWORD=your_password

DB_NAME=planitpoker

PORT=3001

4. Start the server
npm run server

5. Start the client
npm run front


Access:

Server: http://localhost:3000

Client: http://localhost:4200
