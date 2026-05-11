import WebSocket from 'ws';

export interface Vote {
  login: string;
  vote: number;
}

export interface ExtendedWebSocket extends WebSocket {
  _socket: {
    _peername: {
      address: string;
    };
  };
  userId?: number;
  vote?: number;
  login: string;
  roomId?: number;
  role?: string;
  hasVoted: boolean;
}

export interface JoinRoomPayload {
  roomId: number;
}

export interface VotePayload {
  vote: number;
  taskId: number;
  roomId: number;
}

export interface AddTasksPayload {
  tasks: string[];
  login: string;
}

export interface RemoveTasksPayload {
  roomId: number;
  tasksForRemove: Array<{ id: number }>;
}

export interface RemoveTaskPayload {
  roomId: number;
  taskForRemove: number;
}

export interface UpdateStoryPointPayload {
  roomId: number;
  taskId: number;
  vote: number;
}

export interface WsRequest<TPayload = unknown> {
  command: string;
  payload: TPayload;
}
