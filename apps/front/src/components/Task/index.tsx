import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import {
  useUpdateTaskMutation,
} from '@src/store/api/task';

import Dropdown from '@components/Dropdown';

import more from '@src/icons/more.svg';

import { VOTES } from '@src/constants';

import { ITask, IIssue } from './types';

import styles from './index.module.scss';

const regex = /(?<=browse\/).*/;


const Task = forwardRef<HTMLLIElement, ITask>((props, ref) => {
  const {
    tasks,
    openIndex,
    handleToggle,
    handleMoveTask,
  } = props;

  const [updateTask] = useUpdateTaskMutation();

  const updateSt = (task: IIssue, vote: number) => {
    updateTask({
      taskId: task.id,
      updatedTask: {
        roomId: task.roomId,
        storyPoint: vote,
        link: task.link,
      }
    });
  };

  return (
    <ul className={styles.tasks}>
      {tasks && tasks.length > 0 && 
        tasks.map((task, i: number) => {
          const result = task.link.match(regex);
          const {
            id,
            storyPoint,
            link
          } = task;

          return (
            <li className={cx(
              styles.task,
              !i && !task.storyPoint && styles._active)}
              key={i}
              {...i === openIndex && {ref: ref} }
            > 
              <div className={styles.moveTask}>
                <Dropdown
                  contentPosition='right'
                  topPosition='60px'
                  right='20px'
                  trigger={
                    <button className={cx(styles.moreBtn, styles.btn)} onClick={() => handleToggle(i)}>
                      <img src={more} alt='more' />
                    </button>
                  }
                >
                  <ul className={styles.taskMoveWrapper}>
                    <li className={styles.moveItem} onClick={() => handleMoveTask('top', id)}>
                      Переместить вверх
                    </li>
                    <li className={styles.moveItem} onClick={() => handleMoveTask('bottom', id)}>
                      Переместить вниз
                    </li>
                    <li className={styles.moveItem} onClick={() => handleMoveTask('remove', id)}>
                      Удалить
                    </li>
                  </ul>
                </Dropdown>
              </div>

              <div>
                <Link
                  to={link}
                  className={styles.link}
                  target='_blank'
                >
                  {result ? result[0] : link}
                </Link>
              </div>
              
              <div className={styles.sp}>
                <Dropdown
                  contentPosition='center'
                  topPosition='0'
                  trigger={
                    <button className={cx(styles.btn, styles.setSpBtn)}>
                      {storyPoint ? storyPoint : '-'}
                    </button>
                  }
                >
                  <ul className={styles.stList}>
                    {VOTES.map((vote, index) => (
                      <li key={index}>
                        <button className={cx(styles.stBtn, styles.btn)} onClick={() => updateSt(task, vote)}>{vote}</button>
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              </div>
            </li>
          );
      })}
    </ul>
  );
});

export default Task;
