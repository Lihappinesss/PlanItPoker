import { useGetUserInfoQuery } from '@src/store/api/auth';

import Button from "@components/Button";

import { IPlayerPoints } from "./types";

import styles from './index.module.scss';


function PlayerPoints(props: IPlayerPoints) {
  const {
    usersVotes,
    observers,
    votingUsers,
    currentSt,
    handleNextTask,
  } = props;

  const { data } = useGetUserInfoQuery();
  const currentUser = data?.user;

  return (
    <>
      <div className={styles.rightSidebar}>
        <div className={styles.group}>
          <div className={styles.title}>Участники</div>
          <ul>
            {votingUsers.length > 0 && votingUsers.map((participant, i: number) => {
              const userVote = usersVotes.find(userVote => userVote.login === participant.login);
              const allVoted = votingUsers.every(u => usersVotes.some(v => v.login === u.login && v.vote !== undefined));
              const isCurrentUser = participant.login === currentUser?.username;

              let display: string | number = '—';

              if (allVoted) {
                display = userVote?.vote !== undefined ? userVote.vote : '—';
              } else {
                if (userVote?.vote !== undefined) {
                  if (isCurrentUser) {
                    display = userVote.vote;
                  } else {
                    display = '✅';
                  }
                }
              }

              return (
                <li key={i} className={styles.userItem}>
                  <span className={styles.login}>{participant.login}</span>
                  <span className={styles.userVote}>{display}</span>
                </li>
              );
            })}
          </ul>
        </div>
        {observers.length > 0 && (
          <div className={styles.group}>
            <div className={styles.title}>Наблюдатели</div>
            <ul>
              {observers.map((observer, i) => (
                <li key={i} className={styles.login}>{observer.login}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.group}>
          <div className={styles.title}>Результат</div>
          {currentSt && <div className={styles.result}>{currentSt}</div>}
        </div>


      </div>
      {currentSt && (
        <div className={styles.button}>
          <Button
            type={0}
            size='s'
            handleClick={() => handleNextTask()}
          >
            Следующая задача
          </Button>
        </div>
        )}
    </>
  );
}

export default PlayerPoints;