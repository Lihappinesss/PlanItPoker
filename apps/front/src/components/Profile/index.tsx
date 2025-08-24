import React, { useState, useCallback, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import {
  useGetUserInfoQuery,
  useChangeDataMutation,
  useLogoutMutation,
  useCheckPasswordMutation,
} from '@src/store/api/auth';
import { setIsAuth } from '@src/store/authSlice';

import Input from '@src/components/Input';
import Button from '@src/components/Button';

import styles from './index.module.scss';


const Profile = () => {
  const { data: userData } = useGetUserInfoQuery();
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    password: '',
    prevPassword: '',
  });
  const [error, setError] = useState('');
  const [updateUserData] = useChangeDataMutation();
  const [logout] = useLogoutMutation();
  const [checkPassword] = useCheckPasswordMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSave = useCallback(async (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userData?.user.id) {
      await updateUserData({ id: userData.user.id, ...formData });
      await logout();
      dispatch(setIsAuth(false));
      navigate('/login');
    }
  }, [formData, userData, updateUserData, navigate, logout, dispatch]);

  const handleLogout = useCallback(async () => {
    await logout();
    dispatch(setIsAuth(false));
    navigate('/login');
  }, [logout, navigate, dispatch]);

  const handleBlur = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData?.user.username) {
      const response = await checkPassword({
        username: userData.user.username,
        password: e.target.value,
      });

      if ('data' in response) {
        setError(response.data.isSame ? '' : 'Пароли не совпадают');
      } else if ('error' in response) {
        setError('Произошла ошибка при проверке пароля');
      }
    }
  }, [checkPassword, userData]);

  return (
    <form className={styles.profile} onSubmit={handleSave}>
      <Input
        label='Изменить логин'
        handleChange={handleChange}
        placeholder={userData?.user.username || 'логин'}
        name='username'
        type='text'
      />
      <label htmlFor='select-role' className={styles.label}>Изменить роль</label>
      <div className={styles.selectWrapper}>
        <select
          onChange={handleChange}
          name='role'
          id='select-role'
          className={styles.select}
        >
          <option value='watching'>Наблюдающий</option>
          <option value='voting'>Голосующий</option>
        </select>
        <svg className={styles.arrow}>
          <use xlinkHref='#select-arrow-down'></use>
        </svg>
      </div>

      <svg className={styles.sprites}>
        <symbol id='select-arrow-down' viewBox='0 0 10 6'>
          <polyline points='1 1 5 5 9 1'></polyline>
        </symbol>
      </svg>

      {error && <div className={styles.error}>{error}</div>}

      <Input
        label='Изменить пароль'
        handleChange={handleChange}
        name='prevPassword'
        type='password'
        handleBlur={handleBlur}
        placeholder='Старый пароль'
      />

      <Input
        handleChange={handleChange}
        name='password'
        type='password'
        placeholder='Новый пароль'
      />

      <div className={styles.buttonGroup}>
        <Button type={0} size='l' submit>Сохранить</Button>
        <Button type={1} size='l' handleClick={handleLogout}>Выйти</Button>
      </div>
    </form>
  );
};

export default Profile;