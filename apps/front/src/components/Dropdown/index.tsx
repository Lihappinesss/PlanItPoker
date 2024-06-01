import { useState, useEffect, useRef } from 'react';
import cx from 'classnames';

import { IDropdownProps } from './types';

import styles from './index.module.scss';


function Dropdown(props: IDropdownProps) {
  const {
    trigger,
    contentPosition,
    topPosition,
    right,
    children,
  }= props;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div ref={dropdownRef} className={cx(styles.dropdown)}>
      <style jsx scoped>{`
        .${styles.dropdownContent} {
          &.dropdown--center {
            top: ${topPosition ? topPosition : ''};
            left: 50%;
            transform: translateX(-50%);
            position: absolute;
            z-index: 1;
            display: flex;
          }
          &.dropdown--right {
            top: ${topPosition ? topPosition : ''};
            right: ${right};
            position: absolute;
            z-index: 1;
            display: flex;
          }
        }
      `}</style>
      <div onClick={toggleDropdown}>
        {trigger}
      </div>
      {isOpen && (
        <div className={cx(`${styles.dropdownContent}`, [`dropdown--${contentPosition}`])}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
