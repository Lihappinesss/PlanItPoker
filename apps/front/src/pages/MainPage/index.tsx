import { useState, useRef } from 'react';
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
  const { data: rooms } = useGetRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();

  const handleCreateRoom = async (title: string) => {
    if (title) {
      await createRoom({ title }).unwrap();
      setShowCreate(false);
    }
  };

  const handleCloseOverlay = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (createAnchor.current && createAnchor.current.contains(e.target as Node)) {
      return;
    }
    setShowCreate(false);
  };

  const handleDeleteRoom = async (id: number) => {
    if (id) {
      await deleteRoom({ id }).unwrap();
    }
  };

  return (
    <div className={cx(styles.mainPage, 'relative min-h-screen overflow-hidden')}>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(232,106,51,0.16),transparent_34%),radial-gradient(circle_at_70%_10%,rgba(47,111,237,0.1),transparent_26%)]" />
      <Shapka />
      <div className={cx(styles.wrapper, 'app-shell relative pb-10 pt-6 md:pt-10')}>
        <Profile />
        <div className={cx(styles.roomContainer, 'board-panel')}>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent-deep/80">
                Workspace
              </div>
              <div className="section-title">Комнаты команды</div>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted md:text-base">
              Выберите активную комнату для обсуждения задач или создайте новую для следующей сессии планирования.
            </p>
          </div>
          {rooms && rooms.length > 0 && rooms.map((room) => (
            <div key={room.id} className={styles.room}>
              <RoomCard
                title={room.title}
                id={room.id}
                handleDeleteRoom={handleDeleteRoom}
              />
            </div>
          ))}
          <div className={cx(styles.button, 'pt-4')}>
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
