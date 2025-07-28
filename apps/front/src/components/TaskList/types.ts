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
  tasks: ITask[];
  setUnratedTasks: (type: boolean) => void;
  showUnratedTasks: boolean;
  handleCreateTask: (link: string[]) => void;
  handleRemoveTasks: () => void;
  handleRemoveTask: (id: number) => void;
  updateFilteredTasks: (tasks: [] | ITask[]) => void;
  handleUpdateStoryPoint: (id: number, vote: number) => void;
}
