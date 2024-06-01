import { Link } from 'react-router-dom';

import close from 'src/icons/close.png';

import { useGetAllTasksQuery } from '@src/store/api/task';

import styles from './index.module.scss';

export interface cardTypes {
  title: string,
  id: number,
  handleDeleteRoom: (id: number) => void,
}


const RoomCard = (props: cardTypes) => {
  const {
    title,
    id,
    handleDeleteRoom,
  } = props;

  const { data: tasks} = useGetAllTasksQuery({ roomId: id });

  return (
    <div className={styles.roomCard}>
      <div className={styles.container}>
        <div className={styles.key}>Название</div>
        <div className={styles.titleRoom}>{title}</div>
      </div>
      <div className={styles.container}>
        <div className={styles.key}>Задачи</div>
        <div className={styles.value}>{tasks?.length}</div>
      </div>
      <div className={styles.right}>
        <button onClick={() => handleDeleteRoom(id)} className={styles.button}>
          <img
            src={close}
            className={styles.close}
            alt='close'
          />
        </button>
        <Link to={`/plan/${id}`} className={styles.link}>Войти</Link>
      </div>
    </div>
  );
};

export default RoomCard;