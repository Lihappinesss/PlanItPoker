export interface ICreateRoom {
  title: string,
}

export interface IJoinRoom {
  inviteCode: string,
}

export interface IDeleteRoom {
  id: number
}

export interface IRoomsRes {
  id: number,
  title: string,
  inviteCode: string,
  ownerId: number,
}
