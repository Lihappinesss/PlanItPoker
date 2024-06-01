export interface IUser {
  login: string,
  roomId: number,
  vote: number,
  role: string,
}

export interface ITask {
  createdAt: string,
  id: number,
  link: string,
  roomId: number,
  status: string,
  storyPoint: number,
  updatedAt: string
}

export interface IUserVote {
  login: string,
  roomId: number,
  vote: number
}