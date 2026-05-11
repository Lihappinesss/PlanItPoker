import type { CSSProperties } from 'react';

import types from './types';
import sizes from './sizes';
import styles from './index.module.scss';


export interface IButton {
  handleClick?: () => void,
  children: React.ReactNode,
  type: 0 | 1,
  size: 'l' | 's' | 'xs',
  submit?: boolean,
}


const Button = ({ handleClick, type = 0, size = 'l', submit, children }: IButton) => {
  const {
    backgrounColor,
    color,
    borderColor,
    hover
  } = types[type];

  const {
    padding,
    fontSize,
    lineHeight,
    borderRadius,
    maxWidth
  } = sizes[size];

  const buttonStyle = {
    '--button-max-width': maxWidth,
    '--button-padding': padding,
    '--button-font-size': fontSize,
    '--button-line-height': lineHeight,
    '--button-border-radius': `${borderRadius}px`,
    '--button-color': color,
    '--button-background': backgrounColor,
    '--button-border-color': borderColor,
    '--button-hover-background': hover.backgrounColor,
    '--button-hover-color': hover.color,
    '--button-hover-border-color': hover.borderColor,
  } as CSSProperties;

  return (
    <button
      onClick={handleClick}
      type={submit ? 'submit' : 'button'}
      className={styles.button}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button;
