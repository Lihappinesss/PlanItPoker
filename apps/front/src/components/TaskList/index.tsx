import { useState, useRef, useEffect } from 'react';
import cx from 'classnames';

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

  const enteredLinks = links
    .split(/[\s,]+/)
    .filter((link) => link.trim() !== '');

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSendTasks = (list: string[]) => {
    handleCreateTask(list);
    setShowAddTask(false);
    setLinks('');
  };

  return (
    <aside
      className={cx(
        styles.sidebar,
        showAddTask && showUnratedTasks && styles.showAddTask,
      )}
    >
      <div className={styles.header}>
        <button
          type='button'
          className={cx(styles.tabButton, showUnratedTasks && styles.active)}
          onClick={() => setUnratedTasks(true)}
        >
          Active
        </button>

        <button
          type='button'
          className={cx(styles.tabButton, !showUnratedTasks && styles.active)}
          onClick={() => setUnratedTasks(false)}
        >
          Completed
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
            {!showAddTask && (
              <div className={styles.actions}>
                {showUnratedTasks && (
                  <button
                    type='button'
                    className={cx(styles.actionButton, styles.primaryAction)}
                    onClick={() => setShowAddTask(true)}
                  >
                    Add task
                  </button>
                )}

                <button
                  type='button'
                  className={cx(styles.actionButton, styles.dangerAction)}
                  onClick={() => handleRemoveTasks()}
                >
                  Delete all
                </button>
              </div>
            )}

            <div className={styles.createTaskWrapper}>
              <textarea
                onChange={(e) => setLinks(e.target.value)}
                value={links}
                className={styles.textarea}
                placeholder='Paste task links or describe a task'
              />

              <div className={styles.createTaskBtns}>
                <button
                  type='button'
                  className={styles.saveButton}
                  onClick={() => handleSendTasks(enteredLinks)}
                >
                  Save
                </button>

                <button
                  type='button'
                  className={styles.cancelButton}
                  onClick={() => setShowAddTask(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default TaskList;
