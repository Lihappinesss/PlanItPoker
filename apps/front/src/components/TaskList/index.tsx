import { useState, useRef, useEffect, useCallback } from 'react';
import cx from 'classnames';

import Button from '@components/Button';
import Task from '@components/Task';

import { ITaskList } from './types';

import styles from './index.module.scss';


function TaskList(props: ITaskList) {
  const {
    tasks,
    setUnratedTasks,
    handleCreateTask,
    showUnratedTasks,
    handleRemoveTasks,
    handleRemoveTask,
    updateFilteredTasks,
    handleUpdateStoryPoint,
  } = props;

  const [openIndex, setOpenIndex] =useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [links, setLinks] = useState('');
  const [enteredLinks, setEnteredLinks] = useState<string[]>([]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    };

    if (openIndex !== null) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openIndex]);

  const handleSendTasks = useCallback((list: string[]) => {
    handleCreateTask(list);
    setShowAddTask(false);
    setLinks('');
  }, [handleCreateTask]);

  useEffect(() => {
    const inputLinks = links.split(/[\s,]+/).filter(link => link.trim() !== '');
    setEnteredLinks(inputLinks);
  }, [links]);

  return (
    <aside className={cx(
        styles.sidebar,
        showUnratedTasks && styles._showUnratedTasks,
        !showUnratedTasks && styles._showFinished,
        showAddTask && showUnratedTasks && styles._showAddTask,
        !showAddTask && showUnratedTasks && styles._hideAdd,
      )}
      >
      <div className={styles.header}>
        <button className={styles.activeTasks} onClick={() => setUnratedTasks(true)}>
          Активные
        </button>
        <button className={styles.finishedTasks} onClick={() => setUnratedTasks(false)}>
          Завершенные
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.contentColumn}>
          <Task
            tasks={tasks}
            updateFilteredTasks={updateFilteredTasks}
            openIndex={openIndex}
            handleRemoveTask={handleRemoveTask}
            handleUpdateStoryPoint={handleUpdateStoryPoint}
          />
          <div className={styles.addTask}>
            <div className={styles.addTaskControls}>
              <button className={cx(styles.btn, styles.addBtn)} onClick={() => setShowAddTask(true)}>
                Добавить задачу
              </button>
            </div>
            <button className={cx(styles.btn, styles.addBtn)} onClick={() => handleRemoveTasks()}>
              Удалить все задачи
            </button>

            <div className={styles.createTaskWrapper}>
              <textarea
                onChange={(e) => setLinks(e.target.value)}
                value={links}
                className={styles.textarea}
                placeholder='Добавьте задачу'
              />
              <div className={styles.createTaskBtns}>
                <Button
                  type={0}
                  size='xs'
                  handleClick={() => handleSendTasks(enteredLinks)}
                >
                  Сохранить
                </Button>
                <Button
                  type={1}
                  size='xs'
                  handleClick={() => setShowAddTask(false)}
                >
                  Отменить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default TaskList;
