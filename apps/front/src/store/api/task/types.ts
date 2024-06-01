export interface ICreateTask {
  links: string[],
  roomId: number,
}

export interface Id {
  id: number
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

export interface IGetTask {
  roomId: number
}

export interface IUpdatedTask {
  roomId: number,
  storyPoint: number, 
  link: string,
}