import { Link } from 'react-router-dom';

import { VOTES } from '@src/constants';

import { ITaskVotingBoard } from './types';

import styles from './index.module.scss';

const regex = /(?<=browse\/).*/;


function TaskVotingBoard(props: ITaskVotingBoard) {
  const {
    currentTask,
    handleVote,
  } = props;

  return (
    <div className={styles.taskVotingBoard}>
      {currentTask?.link && (
        <Link to={currentTask?.link} className={styles.link}>
          {currentTask.link.match(regex) || currentTask.link}
        </Link>
      )}
      <div className={styles.select}>Оцените задачу</div>
      <div className={styles.votes}>
        {VOTES.map((vote, i) => (
          <button
            key={i}
            className={styles.vote}
            onClick={() => handleVote(i + 1)}
          >
            {vote}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TaskVotingBoard;