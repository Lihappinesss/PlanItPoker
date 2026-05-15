import { useGetUserInfoQuery } from '@src/store/api/auth';

import { IPlayerPoints } from './types';

import styles from './index.module.scss';


export default function PlayerPoints(props: IPlayerPoints) {
  const {
    usersVotes,
    observers,
    votingUsers,
    currentSt,
    handleNextTask,
  } = props;

  const { data } = useGetUserInfoQuery();
  const currentUser = data?.user;

  const allVoted = votingUsers.length > 0 && votingUsers.every((user) =>
    usersVotes.some((vote) => (
      vote.login === user.login && vote.vote !== undefined
    )),
  );

  return (
    <aside className={styles.rightSidebar}>
      <section className={styles.group}>
        <div className={styles.title}>Participants</div>

        <ul className={styles.list}>
          {votingUsers.length > 0 ? (
            votingUsers.map((participant) => {
              const userVote = usersVotes.find((vote) => (
                vote.login === participant.login
              ));

              const isCurrentUser = participant.login === currentUser?.username;

              let display: string | number = '—';

              if (allVoted) {
                display = userVote?.vote !== undefined ? userVote.vote : '—';
              } else if (userVote?.vote !== undefined) {
                display = isCurrentUser ? userVote.vote : '✓';
              }

              return (
                <li key={participant.login} className={styles.userItem}>
                  <span className={styles.login}>{participant.login}</span>
                  <span className={styles.userVote}>{display}</span>
                </li>
              );
            })
          ) : (
            <li className={styles.emptyText}>No participants yet</li>
          )}
        </ul>
      </section>

      {observers.length > 0 && (
        <section className={styles.group}>
          <div className={styles.title}>Observers</div>

          <ul className={styles.list}>
            {observers.map((observer) => (
              <li key={observer.login} className={styles.observerItem}>
                {observer.login}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.group}>
        <div className={styles.title}>Result</div>

        {currentSt ? (
          <div className={styles.result}>{currentSt}</div>
        ) : (
          <div className={styles.emptyText}>Waiting for votes</div>
        )}
      </section>

      {currentSt && (
        <button
          type='button'
          className={styles.nextButton}
          onClick={handleNextTask}
        >
          Next task
        </button>
      )}
    </aside>
  );
}
