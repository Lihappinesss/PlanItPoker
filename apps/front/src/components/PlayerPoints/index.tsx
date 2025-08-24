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

  return (
    <>
      <div className={styles.rightSidebar}>
        <div className={styles.group}>
          <div className={styles.title}>Участники</div>
          <ul>
            {votingUsers.length > 0 && votingUsers.map((participant, i: number) => {
              const user = usersVotes.filter(userVote => userVote.login === participant.login)[0];
              return (
                <li key={i}>
                  <span className={styles.login}>{participant.login}</span>
                  <span className={styles.userVote}>{user?.vote}</span>
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