import React, {Fragment, useRef } from 'react';

import styles from './index.module.scss';


interface WindowComponentProps {
  handleClose: () => void;
}

interface IModalWindow {
  window: React.ComponentType<WindowComponentProps>;
  handleClose: () => void;
  isShowWindow: boolean;
}

const ModalWindow = (props: IModalWindow) => {
  const {
    window: Window,
    handleClose,
    isShowWindow,
  } = props;

  const createAnchor = useRef<HTMLDivElement>(null);

  const handleCloseOverlay = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (createAnchor.current && createAnchor.current.contains(e.target as Node)) {
      return;
    }
    handleClose();
  };

  return (
    <Fragment>
      {isShowWindow && (
        <div className={styles.overlay} onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>):void => handleCloseOverlay(e)}>
          <div ref={createAnchor}>
            <Window handleClose={handleClose} />
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default ModalWindow;
