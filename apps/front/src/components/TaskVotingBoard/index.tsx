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
    <section className={styles.taskVotingBoard}>
      <div className={styles.header}>

        {currentTask?.link ? (
          <Link
            to={currentTask.link}
            className={styles.link}
            target='_blank'
            rel='noreferrer'
          >
            {currentTask.link.match(regex)?.[0] || 'View task'}
          </Link>
        ) : (
          <p className={styles.emptyText}>
            Select or add a task to start voting.
          </p>
        )}
      </div>

      <div className={styles.votes}>
        {VOTES.map((vote, i) => (
          <button
            key={vote}
            type='button'
            className={styles.vote}
            onClick={() => handleVote(i + 1)}
            aria-label={`Vote ${vote}`}
          >
            {vote}
          </button>
        ))}
      </div>
    </section>
  );
}

export default TaskVotingBoard;