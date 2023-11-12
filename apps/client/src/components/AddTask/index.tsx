import { useCallback } from 'react';

import Input from '@src/components/Input';
import Button from '@src/components/Button';

import close from '../../icons/close.png';

import styles from './index.module.scss';

interface IAddTask {
  handleClose: () => void
}

function AddTask({ handleClose }: IAddTask) {
  const handleChange = useCallback(() => {
    console.log();
  }, []);
  const handleClick = useCallback(() => { 
    console.log();
  }, []);

  return (
    <div className={styles.addTask}>
      <div className={styles.title}>Добавьте задачу</div>
      <Input label='Ссылка' handleChange={handleChange}  />
      <div className={styles.buttons}>
        <Button
          type={0}
          size='l'
          handleClick={handleClick}
        >
          Добавить задачу
        </Button>
      </div>
      <img
        src={close}
        className={styles.close}
        onClick={handleClose}
      />
    </div>
  );
}

export default AddTask;