import { SessionData, Store } from 'express-session';
import { SyncOptions } from 'sequelize';

declare class SequelizeStore extends Store {
  sync(options?: SyncOptions): void
  touch: (sid: string, data: any, callback?: (err: any) => void) => void;
  stopExpiringSessions: () => void;
  get(sid: string, callback: (err: any, session?: SessionData | null) => void): void
  set(sid: string, session: SessionData, callback?: (err?: any) => void): void
  destroy(sid: string, callback?: (err?: any) => void): void
}