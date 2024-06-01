import { useCallback, useState } from 'react';

import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Input from '@src/components/Input';

import close from 'src/icons/close.png';

import styles from './index.module.scss';

interface CreateRoomTypes {
  handleClose: () => void,
  handleCreateRoom: (title: string) => void,
}


const CreateRoom = ({ handleClose, handleCreateRoom }: CreateRoomTypes) => {
  const [title, setTitle] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  return (
    <div className={styles.create}>
      <div className={styles.title}>Создайте комнату</div>
      <Input
        handleChange={handleChange}
        name='roomName'
        placeholder='Название комнаты'
        type='text'
      />
      <Indent top={30} />
      <Button
        type={0}
        size='l'
        handleClick={() => handleCreateRoom(title)}
      >
        Создать комнату
      </Button>
      <img
        src={close}
        className={styles.close}
        onClick={handleClose}
        alt='close'
      />
    </div>
  );
};

export default CreateRoom;