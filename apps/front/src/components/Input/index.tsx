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
      {label && <span className={styles.labelText}>{label}</span>}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cx(styles.input, className)}
      />
    </label>
  );
};

export default Input;
