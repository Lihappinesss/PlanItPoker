import { Link } from 'react-router-dom';

import { useGetAllTasksQuery } from '@src/store/api/task';

import styles from './index.module.scss';

export interface RoomCardProps {
  title: string;
  id: number;
  handleDeleteRoom: (id: number) => void;
}

const RoomCard = ({
  title,
  id,
  handleDeleteRoom,
}: RoomCardProps) => {
  const { data: tasks } = useGetAllTasksQuery({ roomId: id });

  const tasksCount = tasks?.length ?? 0;

  return (
    <article className={styles.roomCard}>
      <div className={styles.mainInfo}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.tasksBadge}>
          {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      <div className={styles.actions}>
        <button
          type='button'
          onClick={() => handleDeleteRoom(id)}
          className={styles.deleteButton}
          aria-label='Delete room'
        >
          Remove
        </button>

        <Link
          to={`/plan/${id}`}
          className={styles.openLink}
        >
          Open
        </Link>
      </div>
    </article>
  );
};

export default RoomCard;