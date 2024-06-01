import cx from 'classnames';

import { IFormValues } from './inputType'; 

import styles from './index.module.scss';


const Input = (props: IFormValues) => {
  const {
    label,
    handleChange,
    name,
    type,
    className,
    placeholder,
    handleBlur,
  } = props;

  return (
    <label htmlFor={name} className={styles.label}>
      {label}
      <input
        id={name}
        name={name}
        className={cx(styles.input, className)}
        onChange={(e) => handleChange(e)}
        type={type}
        placeholder={placeholder}
        {...handleBlur && {onBlur: (e) => handleBlur(e)}}
      />
    </label>
  );
};

export default Input;
