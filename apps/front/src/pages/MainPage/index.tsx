import { useState, useRef } from 'react';

import Shapka from '@src/components/Shapka';
import CreateRoom from '@src/components/CreateRoom';
import RoomCard from '@src/components/RoomCard';
import Profile from '@components/Profile';
import PokerCardsIllustration from '@components/PokerCardsIllustration';

import {
  useCreateRoomMutation,
  useGetRoomsQuery,
  useDeleteRoomMutation,
  useJoinRoomMutation,
} from '@src/store/api/room';

import styles from './index.module.scss';


const MainPage = () => {
  const [isShowCreate, setShowCreate] = useState(false);
  const createAnchor = useRef<HTMLDivElement>(null);
  const [createRoom] = useCreateRoomMutation();
  const { data: rooms } = useGetRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [joinRoom] = useJoinRoomMutation();
  const [inviteCode, setInviteCode] = useState('');

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

  const handleJoinRoom = async () => {
    const normalizedCode = inviteCode.trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    await joinRoom({ inviteCode: normalizedCode }).unwrap();
    setInviteCode('');
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

            <div className={styles.headerActions}>
              <label className={styles.joinRoomField}>
                <span className={styles.joinRoomLabel}>Join by code</span>
                <div className={styles.joinRoomControls}>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className={styles.joinRoomInput}
                    placeholder='Enter invite code'
                  />
                  <button
                    type='button'
                    className={styles.joinRoomButton}
                    onClick={handleJoinRoom}
                    disabled={!inviteCode.trim()}
                  >
                    Join
                  </button>
                </div>
              </label>

              <button
                type='button'
                className={styles.createRoomButton}
                onClick={() => setShowCreate(true)}
              >
                <span className={styles.createRoomIcon}>+</span>
                Create Room
              </button>
            </div>
          </div>

          <div className={styles.roomsList}>
            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className={styles.room}>
                  <RoomCard
                    title={room.title}
                    id={room.id}
                    inviteCode={room.inviteCode}
                    handleDeleteRoom={handleDeleteRoom}
                  />
                </div>
              ))
            ) : (
              <div className={styles.emptyRooms}>
                <div className={styles.emptyTitle}>No rooms available</div>
                <p className={styles.emptyText}>
                  Create your first room, and it will appear here.
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
