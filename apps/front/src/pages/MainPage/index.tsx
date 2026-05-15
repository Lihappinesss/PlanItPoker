import { useState, useRef } from 'react';

import Shapka from '@src/components/Shapka';
import CreateRoom from '@src/components/CreateRoom';
import RoomCard from '@src/components/RoomCard';
import Profile from '@components/Profile';
import PokerCardsIllustration from '@components/PokerCardsIllustration';

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
    <main className={styles.page}>
      <Shapka />

      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>
            Team Planning Workspace
          </h1>

          <p className={styles.description}>
            Create or join a room to estimate, collaborate and ship better software.
          </p>
        </div>

        <div><PokerCardsIllustration /></div>

      </section>

      <section className={styles.contentGrid}>
        <aside className={styles.profileCard}>
          <Profile />
        </aside>

        <section className={styles.workspaceCard}>
          <div className={styles.workspaceHeader}>
            <div>
              <div className={styles.sectionLabel}>Workspace</div>
              <h2 className={styles.sectionTitle}>Rooms</h2>
            </div>

            <button
              type='button'
              className={styles.createRoomButton}
              onClick={() => setShowCreate(true)}
            >
              <span className={styles.createRoomIcon}>+</span>
              Create Room
            </button>
          </div>

          <div className={styles.roomsList}>
            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className={styles.room}>
                  <RoomCard
                    title={room.title}
                    id={room.id}
                    handleDeleteRoom={handleDeleteRoom}
                  />
                </div>
              ))
            ) : (
              <div className={styles.emptyRooms}>
                <div className={styles.emptyTitle}>Пока нет комнат</div>
                <p className={styles.emptyText}>
                  Создай первую комнату, и она появится здесь.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>

      {isShowCreate && (
        <div
          className={styles.overlay}
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void =>
            handleCloseOverlay(e)
          }
        >
          <div ref={createAnchor} className={styles.createRoom}>
            <CreateRoom
              handleClose={() => setShowCreate(false)}
              handleCreateRoom={handleCreateRoom}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default MainPage;
