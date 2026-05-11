import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useGetUserInfoQuery,
  useChangeDataMutation,
  useLogoutMutation,
  useCheckPasswordMutation,
} from '@src/store/api/auth';

import type { UserRole } from '@src/store/api/auth/types';

import Input from '@src/components/Input';
import Button from '@src/components/Button';

import styles from './index.module.scss';

interface FormData {
  username: string;
  role: UserRole;
  password: string;
  prevPassword: string;
}

const Profile = () => {
  const { data: userData } = useGetUserInfoQuery();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    role: 'watching',
    password: '',
    prevPassword: '',
  });

  const [error, setError] = useState('');

  const [updateUserData] = useChangeDataMutation();
  const [logout] = useLogoutMutation();
  const [checkPassword] = useCheckPasswordMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.user) {
      setFormData((prev) => ({
        ...prev,
        role: userData.user.role,
      }));
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as UserRole) : value,
    }));

    setError('');
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userData?.user) {
      setError('Пользователь не загружен');
      return;
    }

    try {
      await updateUserData({
        username: formData.username,
        role: formData.role,
        password: formData.password,
      }).unwrap();

      setError('');
    } catch (error) {
      setError('Произошла ошибка при сохранении данных');
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (error) {
      setError('Произошла ошибка при выходе');
    }
  };

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const response = await checkPassword({
        password: e.target.value,
      }).unwrap();

      setError(response.isSame ? '' : 'Пароли не совпадают');
    } catch (error) {
      setError('Произошла ошибка при проверке пароля');
    }
  };

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
          value={formData.role}
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
