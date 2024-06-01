interface ITask {
  link: string,
}


export interface ITaskVotingBoard {
  currentTask: ITask | undefined,
  handleVote: (vote: number) => void
}