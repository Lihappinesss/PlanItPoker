import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import connectPgSimple from 'connect-pg-simple';

import { dbConnect, sessionPool } from './db';
import routes from './routes';

import startWs from './ws';

dotenv.config();

const {
  SESSION_SECRET,
  NODE_ENV,
  CLIENT_URL,
  TRUST_PROXY,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
  SESSION_COOKIE_SAME_SITE,
  SESSION_COOKIE_SECURE,
  SESSION_TABLE_NAME,
} = process.env;

const app = express();
const PostgresSessionStore = connectPgSimple(session);
const isProduction = NODE_ENV === 'production';
const allowedOrigins = (CLIENT_URL || 'http://localhost:4200,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const sessionCookieName = SESSION_COOKIE_NAME || 'connect.sid';

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const normalizeSameSite = (
  value: string | undefined
): 'lax' | 'strict' | 'none' => {
  if (value === 'strict' || value === 'none' || value === 'lax') {
    return value;
  }

  return isProduction ? 'none' : 'lax';
};

const cookieSecure = parseBoolean(SESSION_COOKIE_SECURE, isProduction);
const cookieSameSite = normalizeSameSite(SESSION_COOKIE_SAME_SITE);
const trustProxy = TRUST_PROXY !== undefined
  ? Number.isNaN(Number(TRUST_PROXY))
    ? TRUST_PROXY
    : Number(TRUST_PROXY)
  : isProduction ? 1 : false;

app.set('trust proxy', trustProxy);

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
  name: sessionCookieName,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PostgresSessionStore({
    pool: sessionPool,
    tableName: SESSION_TABLE_NAME || 'user_sessions',
    createTableIfMissing: true,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    ...(SESSION_COOKIE_DOMAIN ? { domain: SESSION_COOKIE_DOMAIN } : {}),
  },
  proxy: isProduction,
});

app.use(sessionMiddleware);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

routes(app);

startWs(app, sessionMiddleware);

void dbConnect();

app.use(express.static(path.join(__dirname, '../../apps/front')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../apps/front', 'index.html'));
});
