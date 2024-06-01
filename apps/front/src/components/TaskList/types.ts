export interface ITask {
  createdAt: string;
  id: number;
  link: string;
  roomId: number;
  status: string;
  storyPoint: number;
  updatedAt: string;
}

export interface ITaskList {
  tasks?: ITask[] | undefined;
  setUnratedTasks: (type: boolean) => void;
  showUnratedTasks: boolean;
  handleMoveTask: (command: string, id: number) => void;
  handleCreateTask: (link: string[]) => void;
  handleRemoveTasks: () => void;
}
