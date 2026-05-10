import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useRegisterMutation } from '@src/store/api/auth';
import type { UserRole } from '@src/store/api/auth/types';

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Auth from '@src/components/Layouts/Auth';

import styles from './index.module.scss';

interface FormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface ErrorState {
  common: string;
  email: string;
  username: string;
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
    role: 'voting',
  });

  const [error, setError] = useState<ErrorState>({
    common: '',
    email: '',
    username: '',
    password: '',
    role: '',
  });

  const [register] = useRegisterMutation();
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as UserRole) : value,
    }));

    setError((prev) => ({
      ...prev,
      [name]: '',
    }));
  }, []);

  const validateEmail = useCallback((email: string) => {
    return emailPattern.test(email);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return passwordPattern.test(password);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let errorMessage = '';

    if (name === 'email') {
      errorMessage = validateEmail(value)
        ? ''
        : 'Пожалуйста, введите корректный email.';
    } else if (name === 'password') {
      errorMessage = validatePassword(value)
        ? ''
        : 'Пароль должен содержать...';
    } else if (name === 'username') {
      errorMessage =
        value.length >= 6
          ? ''
          : 'Логин должен содержать минимум 6 символов';
    }

    setError((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  }, [validateEmail, validatePassword]);

  const handleRegister = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (
        !formData.email ||
        !formData.password ||
        !formData.username ||
        !formData.role
      ) {
        setError((prev) => ({
          ...prev,
          common: 'Пожалуйста, заполните все обязательные поля.',
        }));

        return;
      }

      const hasErrors = Object.values(error).some((err) => err !== '');

      if (hasErrors) {
        console.log('Ошибки валидации:', error);
        return;
      }

      await register(formData).unwrap();

      navigate('/');
    } catch (err) {
      setError((prev) => ({
        ...prev,
        common: 'Произошла ошибка при регистрации.',
      }));

      console.error('Register error:', err);
    }
  }, [formData, error, register, navigate]);

  return (
    <Auth>
      <form className={styles.signup} onSubmit={handleRegister}>
        <div className={styles.enter}>Регистрация</div>

        {error.common && <div className={styles.common}>{error.common}</div>}

        <Input
          label='Email'
          handleChange={handleChange}
          name='email'
          handleBlur={handleBlur}
          type='email'
        />

        {error.email && <div className={styles.error}>{error.email}</div>}

        <Input
          label='Пароль'
          handleChange={handleChange}
          name='password'
          handleBlur={handleBlur}
          type='password'
        />

        {error.password && <div className={styles.error}>{error.password}</div>}

        <Input
          label='Логин'
          handleChange={handleChange}
          name='username'
          handleBlur={handleBlur}
          type='text'
        />

        {error.username && <div className={styles.error}>{error.username}</div>}

        <label htmlFor='select-role' className={styles.label}>
          Роль
        </label>

        <div className={styles.changeRole}>
          <select
            value={formData.role}
            onChange={handleChange}
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

        <Button type={0} size='l' submit>
          Зарегистрироваться
        </Button>

        <Indent top={20} />

        <Button type={0} size='l'>
          <Link to='/login' className={styles.link}>
            Авторизоваться
          </Link>
        </Button>
      </form>
    </Auth>
  );
};

export default SignUp;