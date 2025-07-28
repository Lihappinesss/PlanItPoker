import { forwardRef, useRef } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

import Dropdown from '@components/Dropdown';

import { VOTES } from '@src/constants';

import deleteIcon from '@src/icons/delete.svg';

import { ITaskProps } from './types';

import styles from './index.module.scss';

const regex = /(?<=browse\/).*/;


const Task = forwardRef<HTMLLIElement, ITaskProps>((props) => {
  const {
    tasks,
    openIndex,
    handleRemoveTask,
    updateFilteredTasks,
    handleUpdateStoryPoint,
  } = props;

  const ref = useRef<HTMLLIElement | null>(null);

  const handleDragEnd = (result: DropResult) => {

    if (!result.destination) return;

    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    updateFilteredTasks(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId='taskList'>
        {(provided) => (
          <ul
            className={styles.tasks}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks?.map((task, i) => {
              const result = task.link.match(regex);
              const { id, link, storyPoint } = task;

              return (
                <Draggable key={id} draggableId={id.toString()} index={i}>
                  {(provided) => (
                    <li
                      className={cx(
                        styles.task,
                        !i && !task.storyPoint && styles._active
                      )}
                      ref={i === openIndex ? (node) => {
                        ref.current = node;
                        provided.innerRef(node);
                      } : provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Link
                        to={link}
                        className={styles.link}
                        target='_blank'
                      >
                        {result ? result[0] : link}
                      </Link>

                      <div className={styles.taskManage}>
                        <div className={styles.delete} onClick={() => handleRemoveTask(id)}>
                          <img
                            width={20}
                            height={20}
                            src={deleteIcon}
                            alt='delete task'
                          />
                        </div>

                          <Dropdown
                            contentPosition='right'
                            right='20px'
                            topPosition='75px'
                            trigger={
                              <button className={cx(styles.btn, styles.setSpBtn)}>
                                {storyPoint ? storyPoint : '-'}
                              </button>
                            }
                          >
                            <ul className={styles.stList}>
                              {VOTES.map((vote, index) => (
                                <li key={index}>
                                  <button className={cx(styles.stBtn, styles.btn)} onClick={() => handleUpdateStoryPoint(id, vote)}>{vote}</button>
                                </li>
                              ))}
                            </ul>
                          </Dropdown>
                        </div>
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
});

export default Task;
