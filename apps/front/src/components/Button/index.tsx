import types from './types';
import sizes from './sizes';


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

  return (
    <button
      onClick={handleClick}
      type={submit ? 'submit' : 'button'}
      className='button'
    >
      {children}
      <style jsx>{`
        .button {
          width: 100%;
          max-width: ${maxWidth};
          padding: ${padding};
          font-size: ${fontSize};
          line-height: ${lineHeight};
          border-radius: ${borderRadius}px;
          color: ${color};
          background: ${backgrounColor};
          border: 1px solid ${borderColor};
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          transition: all 0.2s ease;

          &:hover {
            background: ${hover.backgrounColor};
            color: ${hover.color};
            border-color: ${hover.borderColor};
          }
        }

        @media (max-width: 768px) {
          .adaptiveButton {
            padding: 8px 16px;
            font-size: 15px;
            line-height: 22px;
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .adaptiveButton {
            padding: 6px 12px;
            font-size: 14px;
            line-height: 20px;
          }
        }
      `}</style>
    </button>
  );
};

export default Button;
