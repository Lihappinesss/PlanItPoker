import plus from '@src/icons/plus.png'

import styles from './index.module.scss';

interface ITaskList {
  handleUpdateAdd: () => void,
}

function TaskList(props: ITaskList) {
  const {
    handleUpdateAdd,
  } = props;

  return (
    <div className={styles.taskList}>
      <div className={styles.header}>
        <div className={styles.activeTask}>Задачи</div>
        <div className={styles.finishedTask}>Завершенные</div>
        <button className={styles.add} onClick={() => handleUpdateAdd()}>
          <img src={plus} className={styles.plus} />
        </button>
      </div>
      <div>
        {['a1', 'a2'].map((task, i) => (
          <div className={styles.task} key={i}>
            <div>{task}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskList;
