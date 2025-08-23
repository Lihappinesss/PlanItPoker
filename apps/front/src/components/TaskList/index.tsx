import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

  const enteredLinks = useMemo(() =>
    links.split(/[\s,]+/).filter(link => link.trim() !== ''),
  [links]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSendTasks = useCallback((list: string[]) => {
    handleCreateTask(list);
    setShowAddTask(false);
    setLinks('');
  }, [handleCreateTask]);

  return (
    <aside className={cx(
        styles.sidebar,
        showAddTask && showUnratedTasks && styles._showAddTask,
      )}
      >
      <div className={styles.header}>
        <button
          className={cx(styles.tabButton, showUnratedTasks && styles._active)}
          onClick={() => setUnratedTasks(true)}
        >
          Активные
        </button>
        <button
          className={cx(styles.tabButton, !showUnratedTasks && styles._active)}
          onClick={() => setUnratedTasks(false)}
        >
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
          <div className={styles.issue}>
            {!showAddTask &&
              <div>
                {showUnratedTasks && (
                  <button className={cx(styles.btn, styles.addTask)} onClick={() => setShowAddTask(true)}>
                    Добавить задачу
                  </button>
                )}
                <button className={styles.btn} onClick={() => handleRemoveTasks()}>
                  Удалить все задачи
                </button>
              </div>
            }

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
