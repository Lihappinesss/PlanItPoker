import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { dbConnect } from './db';
import routes from './routes';

import startWs from './ws';

const { SESSION_SECRET } = process.env;

dotenv.config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false,
    },
    proxy: true,
  })
);

routes(app);

startWs(app);

dbConnect();

app.use(express.static(path.join(__dirname, '../../apps/front')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../apps/front', 'index.html'));
});
