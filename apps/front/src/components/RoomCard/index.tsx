import { Link } from 'react-router-dom';

import { useGetAllTasksQuery } from '@src/store/api/task';

import styles from './index.module.scss';

export interface RoomCardProps {
  title: string;
  id: number;
  inviteCode: string;
  handleDeleteRoom: (id: number) => void;
}

const RoomCard = ({
  title,
  id,
  inviteCode,
  handleDeleteRoom,
}: RoomCardProps) => {
  const { data: tasks } = useGetAllTasksQuery({ roomId: id });

  const tasksCount = tasks?.length ?? 0;

  return (
    <article className={styles.roomCard}>
      <div className={styles.mainInfo}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.metaRow}>
            <span className={styles.tasksBadge}>
              {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
            </span>
            <button
              type='button'
              className={styles.inviteCode}
              onClick={() => navigator.clipboard.writeText(inviteCode)}
            >
              Code: {inviteCode}
            </button>
          </div>
        </div>
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
