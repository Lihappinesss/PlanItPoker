import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import { dbConnect } from './db';
import routes from './routes';

import startWs from './ws';

dotenv.config();

const { SESSION_SECRET, NODE_ENV, CLIENT_URL } = process.env;

const app = express();
const isProduction = NODE_ENV === 'production';
const allowedOrigins = (CLIENT_URL || 'http://localhost:4200,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined');
}

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
  proxy: isProduction,
});

app.use(sessionMiddleware);

routes(app);

startWs(app, sessionMiddleware);

void dbConnect();

app.use(express.static(path.join(__dirname, '../../apps/front')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../apps/front', 'index.html'));
});
