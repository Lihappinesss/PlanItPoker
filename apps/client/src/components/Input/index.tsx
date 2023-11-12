import React from 'react';

import { IFormValues } from './inputType'; 

import styles from './index.module.scss';


const Input = ({ label, handleChange }: IFormValues) => {
  return (
    <label className={styles.label}>
      <input
        className={styles.input}
        placeholder={label}
        onChange={(e) => handleChange(e.target.value)}
      />
    </label>
  )
}

export default Input;
