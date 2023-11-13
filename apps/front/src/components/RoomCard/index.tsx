import close from 'src/icons/close.png';

import styles from './index.module.scss';
import { cardTypes } from './cardTypes';


const RoomCard = (props: cardTypes) => {
  const {
    title,
    tickets
  } = props;

  return (
    <div className={styles.roomWrapper}>
      <div className={styles.container}>
        <div className={styles.key}>Название</div>
        <div className={styles.value}>{title}</div>
      </div>
      <div className={styles.container}>
        <div className={styles.key}>Задачи</div>
        <div className={styles.value}>{tickets}</div>
      </div>
      <img src={close} className={styles.close} />
    </div>
  );
}

export default RoomCard;