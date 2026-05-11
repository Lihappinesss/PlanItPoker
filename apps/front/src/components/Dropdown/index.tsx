import type { CSSProperties } from 'react';
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
  const dropdownStyle = {
    '--dropdown-top': topPosition !== undefined ? String(topPosition) : 'auto',
    '--dropdown-right': right !== undefined ? String(right) : 'auto',
  } as CSSProperties;

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
    <div ref={dropdownRef} className={styles.dropdown}>
      <div onClick={toggleDropdown}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cx(
            styles.dropdownContent,
            contentPosition === 'center' && styles.center,
            contentPosition === 'right' && styles.right
          )}
          style={dropdownStyle}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
