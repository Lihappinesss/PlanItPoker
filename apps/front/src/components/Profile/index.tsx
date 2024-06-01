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
import Indent from '@src/components/Indent';

import styles from './index.module.scss';

interface IFormData {
  username: string;
  role: string;
  password: string;
  prevPassword: string;
}


const Profile = () => {
  const { data: userData } = useGetUserInfoQuery();
  const [formData, setFormData] = useState<IFormData>({
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
      await updateUserData({
        id: userData?.user.id,
        ...formData,
      });
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
        username: userData?.user.username,
        password: e.target.value,
      });

      if ('data' in response) {
        const { isSame } = response.data;
        setError(isSame ? '' : 'Пароли не совпадают');
      } else if ('error' in response) {
        setError('Произошла ошибка при проверке пароля');
      }
    }
  }, [checkPassword, userData]);

  return (
    <form className={styles.profile} onSubmit={handleSave}>
      <div>
        <Input 
          label='Изменить логин'
          handleChange={(e) => handleChange(e)}
          placeholder={userData?.user.username || 'логин'}
          name='username'
          type='text'
        />
        <Indent top={20} />
        
        <label htmlFor='select-role' className={styles.label}>Изменить роль</label>
        <div className={styles.changeRole}>
          <select
            onChange={(e) => handleChange(e)}
            name='Изменить роль'
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

        {error && <div className={styles.error}>{error}</div>}
        <Input
          label='Изменить пароль'
          handleChange={(e) => handleChange(e)}
          name='prevPassword'
          type='password'
          handleBlur={handleBlur}
          placeholder='Старый пароль'
        />
        <Indent top={20} />
        <Input
          handleChange={(e) => handleChange(e)}
          name='password'
          type='password'
          placeholder='Новый пароль'
        />
        <Indent top={20} />
        <Button
          type={0}
          size='l'
          submit
        >
          Сохранить
        </Button>
        <Indent top={20} />
        <Button
          type={1}
          size='l'
          handleClick={handleLogout}
        >
          Выйти
        </Button>
      </div>
    </form>
  );
};

export default Profile;
