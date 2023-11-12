import { buttonTypes } from './buttonTypes';
import types from './types';
import sizes from './sizes';

import styles from './index.module.scss';


const Button = (props: buttonTypes) => {
  const {
    handleClick,
    type,
    size,
    children
  } = props;

  const {
    backgrounColor,
    color,
    borderColor,
    hover,
  } = types[type];

  const {
    borderRadius,
    padding,
    minHeight,
    minWidth,
    fontWeight,
    fontSize,
    lineHeight,
  } = sizes[size];

  return (
    <button
      className={styles.button}
      onClick={() => handleClick()}
    >
      <style jsx>{`
        .${styles.button} {
          color: ${color};
          background: ${backgrounColor};
          border: 1px solid ${borderColor};
          border-radius: ${borderRadius}px;
          padding: ${padding};
          min-width: ${minWidth};
          min-height: ${minHeight};
          font-weight: ${fontWeight};
          font-size: ${fontSize};
          line-height: ${lineHeight};
        }
        .${styles.button}:hover {
          background: ${hover.backgrounColor};
          color: ${hover.color};
          border-color: ${hover.borderColor};
        }
      `}</style>
      {children}
    </button>
  )
}

export default Button;
