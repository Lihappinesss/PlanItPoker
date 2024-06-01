interface IUserVote {
  login: string;
  roomId: number;
  vote: number;
}

interface IVoitingUser {
  login: string;
  role: string;
  roomId: number;
}

export interface IPlayerPoints {
  usersVotes: IUserVote[];
  observers: IVoitingUser[];
  votingUsers: IVoitingUser[];
  currentSt: null | number;
  handleNextTask: () => void;
}
