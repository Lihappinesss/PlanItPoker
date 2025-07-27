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
  vote: number;
  login: string;
  roomId?: string;
  role?: string;
  hasVoted: boolean;
  currentTask: string;
  roomTasks: Map<string, Set<string>>;
}
