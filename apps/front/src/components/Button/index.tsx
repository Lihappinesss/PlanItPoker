import { IButton } from './buttonTypes';
import types from './types';
import sizes from './sizes';

import styles from './index.module.scss';


const Button = (props: IButton) => {
  const {
    handleClick,
    type,
    size,
    submit,
    children,
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
    maxHeight,
    minWidth,
    fontWeight,
    fontSize,
    lineHeight,
  } = sizes[size];

  return (
    <button
      className={styles.button}
      {...handleClick && {onClick: () => handleClick()}}
      {...submit && {type: 'submit'}}
    >
      <style jsx={true} scoped>{`
        .${styles.button} {
          color: ${color};
          background: ${backgrounColor};
          border: 1px solid ${borderColor};
          border-radius: ${borderRadius}px;
          padding: ${padding};
          min-width: ${minWidth};
          max-height: ${maxHeight};
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
  );
};

export default Button;
