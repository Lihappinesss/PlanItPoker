
import { useState, useCallback } from 'react';
import Shapka from '@src/components/Shapka';
import TaskList from '@src/components/TaskList';
// import Button from '@src/components/Button';
import AddTask from '@src/components/AddTask';
import ModalWindow from '@src/components/ModalWindow';

import styles from './index.module.scss';

const votes = [1, 2, 3, 4, 5, 6, 7, 8];


const Plan = () => {
  // const [isShowResult, updateIsShowResult] = useState(false);
  const [isShowAddTask, updateIsAddTask] = useState(false);

  const handleUpdateAdd = useCallback(() => {
    updateIsAddTask(true);
  }, []);

  const handleClose = useCallback(() => {
    updateIsAddTask(false);
  }, []);

  return (
    <>
      <Shapka />
      <main className={styles.main}>
        <div className={styles.poker}>
          <TaskList handleUpdateAdd={handleUpdateAdd} />
          <div className={styles.votesWrapper}>
            <div className={styles.select}>Выберите карту</div>
            <div className={styles.votes}>
              {votes.map((vote, i) => (
                <div key={i} className={styles.vote}>{vote}</div>
              ))}
            </div>
          </div>
          <div className={styles.team}>
            <ul className={styles.participants}>
              <li className={styles.teamTitle}>Участники</li>
              {['Уч1', 'Уч2'].map((participant, i) => (
                <li key={i} className={styles.participant}>{participant}</li>
              ))
              }
            </ul>
            <ul>
              <li className={styles.teamTitle}>Наблюдатели</li>
              {['наб1', 'наб2'].map((observer, i) => (
                <li key={i} className={styles.observers}>{observer}</li>
              ))}
            </ul>
          </div>
        </div>
        {isShowAddTask && (
          <ModalWindow
            window={AddTask}
            handleClose={handleClose}
            isShowWindow={isShowAddTask}
          />
        )}
      </main>
    </>
  );
}

export default Plan;