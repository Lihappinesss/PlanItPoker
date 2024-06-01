export interface IButton {
  handleClick?: () => void,
  children: React.ReactNode,
  type: 0 | 1,
  size: 'l' | 's' | 'xs',
  submit?: boolean,
}