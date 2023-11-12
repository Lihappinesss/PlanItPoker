import { indenTypes } from './indentTypes';


const Indent = (props: indenTypes) => {
  const {
    top,
    bottom,
    right,
    left,
    children,
  } = props;

  return (
    <div
      style={{
        ...top && { marginTop: `${top}px` },
        ...bottom && { marginBottom: `${bottom}px` },
        ...left && { marginLeft: `${left}px` },
        ...right && { marginRight: `${right}px` },
      }}
    >
      {children}
    </div>
  )
}

export default Indent;
