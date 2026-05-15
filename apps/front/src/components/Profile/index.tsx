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
        username: userData.user.username,
        role: userData.user.role,
      }));
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
      setError('User data is not loaded');
      return;
    }

    try {
      await updateUserData({
        username: formData.username || userData.user.username,
        role: formData.role,
        password: formData.password,
      }).unwrap();

      setError('');
    } catch {
      setError('Something went wrong while saving your changes');
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch {
      setError('Something went wrong while signing out');
    }
  };

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;

    if (!password) {
      return;
    }

    try {
      const response = await checkPassword({
        password,
      }).unwrap();

      setError(response.isSame ? '' : 'Current password is incorrect');
    } catch {
      setError('Something went wrong while checking the password');
    }
  };

  return (
    <form className={styles.profile} onSubmit={handleSave}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile settings</h2>
        <p className={styles.subtitle}>
          Update your name, role and password.
        </p>
      </div>

      <div className={styles.field}>
        <Input
          label='Username'
          handleChange={handleChange}
          placeholder='Enter your username'
          name='username'
          type='text'
        />
      </div>

      <div className={styles.field}>
        <label htmlFor='select-role' className={styles.label}>
          Role
        </label>

        <div className={styles.selectWrapper}>
          <select
            onChange={handleChange}
            name='role'
            id='select-role'
            className={styles.select}
            value={formData.role}
          >
            <option value='watching'>Observer</option>
            <option value='voting'>Voter</option>
          </select>

          <svg className={styles.arrow}>
            <use xlinkHref='#select-arrow-down'></use>
          </svg>
        </div>
      </div>

      <div className={styles.field}>
        <Input
          label='Current password'
          handleChange={handleChange}
          name='prevPassword'
          type='password'
          handleBlur={handleBlur}
          placeholder='Enter current password'
        />
      </div>

      <div className={styles.field}>
        <Input
          label='New password'
          handleChange={handleChange}
          name='password'
          type='password'
          placeholder='Enter new password'
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button
          type='submit'
          className={styles.saveButton}
        >
          Save changes
        </button>

        <button
          type='button'
          className={styles.signOutButton}
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>

      <svg className={styles.sprites}>
        <symbol id='select-arrow-down' viewBox='0 0 10 6'>
          <polyline points='1 1 5 5 9 1'></polyline>
        </symbol>
      </svg>
    </form>
  );
};

export default Profile;