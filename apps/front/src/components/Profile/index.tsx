import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useGetUserInfoQuery,
  useChangeDataMutation,
  useLogoutMutation,
  useCheckPasswordMutation,
} from '@src/store/api/auth';

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

  const handleChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  },
  []
);

const handleSave = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!userData?.user?.id) {
    setError('Пользователь не загружен');
    return;
  }

  try {
    await updateUserData({
      id: userData.user.id,
      username: formData.username,
      role: formData.role,
      password: formData.password,
    }).unwrap();

    await logout().unwrap();
    navigate('/login');
  } catch (error) {
    setError('Произошла ошибка при сохранении данных');
  }
  }, [formData, userData, updateUserData, logout, navigate]);

const handleLogout = useCallback(async () => {
  try {
    await logout().unwrap();
    navigate('/login');
  } catch (error) {
    setError('Произошла ошибка при выходе');
  }
}, [logout, navigate]);

const handleBlur = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData?.user?.username) {
      setError('Пользователь не загружен');
      return;
    }

    try {
      const response = await checkPassword({
        password: e.target.value,
      }).unwrap();

      setError(response.isSame ? '' : 'Пароли не совпадают');
    } catch (error) {
      setError('Произошла ошибка при проверке пароля');
    }
  },
  [checkPassword, userData]
);

  return (
    <form className={styles.profile} onSubmit={handleSave}>
      <Input
        label='Изменить логин'
        handleChange={handleChange}
        placeholder={userData?.user?.username || 'логин'}
        name='username'
        type='text'
      />

      <label htmlFor='select-role' className={styles.label}>
        Изменить роль
      </label>

      <div className={styles.selectWrapper}>
        <select
          onChange={handleChange}
          name='role'
          id='select-role'
          className={styles.select}
          defaultValue={userData?.user?.role || 'watching'}
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
        <Button type={0} size='l' submit>
          Сохранить
        </Button>

        <Button type={1} size='l' handleClick={handleLogout}>
          Выйти
        </Button>
      </div>
    </form>
  );
};

export default Profile;