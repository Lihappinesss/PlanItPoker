import React, { useState, MouseEvent, useCallback } from "react";

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Auth from '@src/components/Layouts/Auth';

import styles from './index.module.scss';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleClick = useCallback(() => {
    console.log(1)
  }, []);

  return (
    <Auth>
      <form className={styles.signup} onSubmit={handleSubmit}>
        <div className={styles.enter}>Регистрация</div>
        <Input label='email' handleChange={setEmail} />
        <Indent top={20} />
        <Input label='пароль' handleChange={setPass} />
        <Indent top={20} />
        <Input label='имя' handleChange={setName} />
        <Indent top={20} />
        <Button
          type={0}
          size='l'
          handleClick={handleClick}
        >
          Зарегистрироваться
        </Button>
      </form>
    </Auth>
  )
}

export default SignUp;
