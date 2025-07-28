import { ITask } from "@components/TaskList/types";

export interface IIssue {
  createdAt: string;
  id: number;
  link: string;
  roomId: number;
  status: string;
  storyPoint: number;
  updatedAt: string;
}

export interface ITaskProps {
  tasks: IIssue[] | [];
  openIndex: number | null;
  handleRemoveTask: (id: number) => void;
  updateFilteredTasks: (tasks: [] | ITask[]) => void;
  handleUpdateStoryPoint: (id: number, vote: number) => void;
}
