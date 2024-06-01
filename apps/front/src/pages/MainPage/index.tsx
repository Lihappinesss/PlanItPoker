import { useState, useRef, useCallback } from 'react';
import cx from 'classnames';

import Shapka from '@src/components/Shapka';
import Button from '@src/components/Button';
import CreateRoom from '@src/components/CreateRoom';
import RoomCard from '@src/components/RoomCard';
import Profile from '@components/Profile';

import {
  useCreateRoomMutation,
  useGetRoomsQuery,
  useDeleteRoomMutation
} from '@src/store/api/room';

import styles from './index.module.scss';


const MainPage = () => {
  const [isShowCreate, setShowCreate] = useState(false);
  const createAnchor = useRef<HTMLDivElement>(null);
  const [createRoom] = useCreateRoomMutation();
  const { data: rooms, refetch: refetchRooms } = useGetRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();
 
  const handleCreateRoom = useCallback((title: string) => {
    if (title) {
      createRoom({title}).then(() => {
        refetchRooms();
      });
      setShowCreate(false);
    }
  }, [createRoom, refetchRooms]);

  const handleCloseOverlay = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (createAnchor.current && createAnchor.current.contains(e.target as Node)) {
      return;
    }
    setShowCreate(false);
  };

  const handleDeleteRoom = useCallback((id: number) => {
    if (id) {
      deleteRoom({ id }).then(() => {
        refetchRooms();
      });
    }
  }, [deleteRoom, refetchRooms]);
  
  return (
    <div className={cx(styles.mainPage)}>
      <Shapka />
      <div className={styles.wrapper}>
        <Profile />
        <div className={styles.roomContainer}>
          <div className={styles.title}>Комнаты</div>
          {rooms && rooms.length > 0 && rooms.map((room, i) => (
            <div key ={i} className={styles.room}>
              <RoomCard
                title={room.title}
                id={room.id}
                handleDeleteRoom={handleDeleteRoom}
              />
            </div>
          ))}
          <div className={styles.button}>
            <Button
              type={0}
              size='l'
              handleClick={() => setShowCreate(true)}
            >
              Создать комнату
            </Button>
          </div>
        </div>
        {isShowCreate && (
          <div
            className={styles.overlay}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>):void => handleCloseOverlay(e)}
          >
            <div ref={createAnchor} className={styles.createRoom}>
              <CreateRoom handleClose={() => setShowCreate(false)} handleCreateRoom={handleCreateRoom} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
