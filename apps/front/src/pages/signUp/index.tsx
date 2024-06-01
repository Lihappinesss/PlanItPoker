import React, { useState, MouseEvent, useCallback } from "react";
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useRegisterMutation } from "@src/store/api/auth";
import { setIsAuth } from '@src/store/authSlice';

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Auth from '@src/components/Layouts/Auth';

import styles from './index.module.scss';

interface FormData {
  username: string;
  email: string;
  password: string;
  role: string;
}

const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;


const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [register] = useRegisterMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState({
    common: '',
    email: '',
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const validateEmail = useCallback((email: string) => {
    return emailPattern.test(email);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return passwordPattern.test(password);
  }, []);

  const handleBlur = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let errorMessage = '';

    if (name === 'email') {
      errorMessage = validateEmail(value) ? '' : 'Пожалуйста, введите корректный email.';
    } else if (name === 'password') {
      errorMessage = validatePassword(value) ? '' : 'Пароль должен содержать 8 символов, хотя бы одну строчную букву, одну заглавную букву и одну цифру';
    } else if (name === 'username') {
      errorMessage = value.length >= 6 ? '' : 'Логин должен содержать 6 букв';
    }

    setError(prev => ({
      ...prev,
      [name]: errorMessage,
    }));
  }, [validateEmail, validatePassword]);

  const handleRegister = async (e: MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (!formData.email || !formData.password || !formData.username || !formData.role) {
        setError(prev => ({
          ...prev,
          common: 'Пожалуйста, заполните все обязательные поля.',
        }));
        return;
      }

      if (Object.values(error).some(err => err !== '')) {
        return;
      }

      await register(formData);
      dispatch(setIsAuth(true));
      navigate('/');
    } catch (error) {
      setError(prev => ({
        ...prev,
        common: 'Произошла ошибка при регистрации.',
      }));
    }
  };

  return (
    <Auth>
      <form className={styles.signup} onSubmit={handleRegister}>
        <div className={styles.enter}>Регистрация</div>
        {error.common && <div className={styles.common}>{error.common}</div>}
        <Input
          label='Email'
          handleChange={(e) => handleChange(e)}
          name="email"
          handleBlur={(e) => handleBlur(e)}
          type='email'
        />
        {error.email && <div className={styles.error}>{error.email}</div>}
        <Indent top={20} />
        <Input
          label='Пароль'
          handleChange={(e) => handleChange(e)}
          name="password"
          handleBlur={(e) => handleBlur(e)}
          type='password'
        />
        {error.password && <div className={styles.error}>{error.password}</div>}
        <Indent top={20} />
        <Input
          label='Логин'
          handleChange={(e) => handleChange(e)}
          name='username'
          handleBlur={(e) => handleBlur(e)}
          type='text'
        />
        {error.username && <div className={styles.error}>{error.username}</div>}
        <Indent top={20} />
        <label htmlFor='select-role' className={styles.label}>Роль</label>
        <div className={styles.changeRole}>
          <select
            value={formData.role}
            onChange={(e) => handleChange(e)}
            name='role'
            id='select-role'
            className={styles.select}
          >
            <option value='watching'>Наблюдающий</option>
            <option value='voting'>Голосующий</option>
          </select>
          <svg>
            <use xlinkHref='#select-arrow-down'></use>
          </svg>
        </div>
        <svg className={styles.sprites}>
          <symbol id='select-arrow-down' viewBox='0 0 10 6'>
            <polyline points='1 1 5 5 9 1'></polyline>
          </symbol>
        </svg>
        <Indent top={20} />
        <Button
          type={0}
          size='l'
          submit
        >
          Зарегистрироваться
        </Button>
        <Indent top={20} />
        <Button type={0} size='l'>
          <Link to='/login' className={styles.link}>Авторизоваться</Link>
        </Button>
      </form>
    </Auth>
  );
};

export default SignUp;
