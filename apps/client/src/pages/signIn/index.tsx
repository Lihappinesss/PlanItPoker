import React, { useState, MouseEvent, useCallback } from 'react';

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Auth from '@src/components/Layouts/Auth';

import styles from './index.module.scss';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  const handleClick = useCallback(() => {
    console.log(1)
  }, []);

  return (
    <Auth>
      <form className={styles.signin} onSubmit={handleSubmit}>
        <div className={styles.enter}>Вход</div>
        <Input
          label='email'
          handleChange={setEmail}
        />
        <Indent top={20} />
        <Input 
          label='password'
          handleChange={setPass}
        />
        <Indent top={15} />
        <label className={styles.remember}>
          <input type="checkbox" />
          Запомнить меня
        </label>
        <Indent top={20} />
        <Button
          type={0}
          size='l'
          handleClick={handleClick}
        >
          Войти
        </Button>
        <Indent top={20} />
        <Button
          type={1}
          size='l'
          handleClick={handleClick}
        >
          Зарегистрироваться
        </Button>
      </form>
    </Auth>
  )
}

export default SignIn;
