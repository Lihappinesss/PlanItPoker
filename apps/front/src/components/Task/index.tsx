import { useRef } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

import Dropdown from '@components/Dropdown';

import { VOTES } from '@src/constants';

import deleteIcon from '@src/icons/delete.svg';

import { ITaskProps } from './types';

import styles from './index.module.scss';

const regex = /(?<=browse\/).*/;


const Task = ((props: ITaskProps) => {
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
                        !i && !task.storyPoint && styles.active,
                      )}
                      ref={
                        i === openIndex
                          ? (node) => {
                              ref.current = node;
                              provided.innerRef(node);
                            }
                          : provided.innerRef
                      }
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Link
                        to={link}
                        className={styles.link}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {result ? result[0] : link}
                      </Link>

                      <div className={styles.taskManage}>
                        <Dropdown
                          contentPosition='right'
                          right='20px'
                          topPosition='75px'
                          trigger={
                            <button
                              type='button'
                              className={styles.storyPointButton}
                              aria-label='Set story point'
                              title='Set story point'
                            >
                              {storyPoint || '-'}
                            </button>
                          }
                        >
                          <ul className={styles.storyPointList}>
                            {VOTES.map((vote) => (
                              <li key={vote}>
                                <button
                                  type='button'
                                  className={styles.storyPointOption}
                                  onClick={() => handleUpdateStoryPoint(id, vote)}
                                >
                                  {vote}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Dropdown>

                        <button
                          type='button'
                          className={styles.deleteButton}
                          onClick={() => handleRemoveTask(id)}
                          aria-label='Delete task'
                          title='Delete task'
                        >
                          <img
                            width={16}
                            height={16}
                            src={deleteIcon}
                            alt=''
                            aria-hidden='true'
                          />
                        </button>
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
