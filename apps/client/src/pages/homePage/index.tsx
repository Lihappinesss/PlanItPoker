import { useState, useRef, useCallback, useEffect } from 'react';
import cx from 'classnames';

import Shapka from '@src/components/Shapka';
import Button from '@src/components/Button';
import CreateRoom from '@src/components/CreateRoom';
import RoomCard from '@src/components/RoomCard';

import styles from './index.module.scss';


const HomePage = () => {
  const [isShowCreate, setShowCreate] = useState(false);
  const createAnchor = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setShowCreate(false);
  }, []);

  const handleCloseOverlay = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (createAnchor.current && createAnchor.current.contains(e.target as Node)) {
      return;
    }
    setShowCreate(false);
  };

  useEffect(() => {
    return () => {
      setShowCreate(false);
    };
  }, []);

  return (
    <div className={cx(styles.homePage)}>
      <Shapka />
      <div className={styles.roomContainer}>
        <div className={styles.title}>Комнаты</div>
        <div className={styles.rooms}>
          {['front', 'back'].map((item, i) => (
            <div key ={i} className={styles.room}>
              <RoomCard title={item} tickets={i} />
            </div>
          ))}
        </div>
        <Button
          type={0}
          size='l'
          handleClick={() => setShowCreate(true)}
        >
          Создать комнату
        </Button>
      </div>
      {isShowCreate && (
        <div
          className={styles.overlay}
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>):void => handleCloseOverlay(e)}
        >
          <div ref={createAnchor}>
            <CreateRoom handleClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
