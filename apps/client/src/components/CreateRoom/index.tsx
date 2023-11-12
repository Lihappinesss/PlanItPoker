import React, { useCallback } from 'react';

import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Input from '@src/components/Input';

import close from 'src/icons/close.png';

import styles from './index.module.scss';

interface CreateRoomTypes {
  handleClose: () => void,
}

const CreateRoom = ({ handleClose }:CreateRoomTypes) => {
  const handleChange = useCallback(() => {
    console.log(1);
  }, []);

  return (
    <div className={styles.create}>
      <div className={styles.title}>Создайте комнату</div>
      <Input
        label='Название комнаты'
        handleChange={handleChange}
      />
      <Indent top={15} />
      <label className={styles.remember}>
        <input type="checkbox" />
        Войти как наблюдающий
      </label>
      <Indent top={30} />
      <Button
        type={0}
        size='l'
        handleClick={() => handleClose()}
      >
        Создать комнату
      </Button>
      <img
        src={close}
        className={styles.close}
        onClick={handleClose}
      />
    </div>
  );
}

export default CreateRoom;