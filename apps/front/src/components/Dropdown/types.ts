import { ReactNode } from 'react';

export interface IDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  contentPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  topPosition?: string | number | undefined;
  left?: string | number | undefined;
  right?: string | number | undefined;
  bottom?: string | number | undefined;
}