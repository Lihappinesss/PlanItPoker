

export interface IIssue {
  createdAt: string,
  id: number,
  link: string,
  roomId: number,
  status: string,
  storyPoint: number,
  updatedAt: string
}

export interface ITask {
  tasks: IIssue[] | undefined,
  openIndex: number | null,
  handleToggle: (i: number) => void,
  handleMoveTask: (operation: string, id: number) => void,
}
