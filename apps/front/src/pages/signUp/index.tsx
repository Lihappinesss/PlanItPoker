import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useRegisterMutation } from '@src/store/api/auth';
import type { UserRole } from '@src/store/api/auth/types';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as UserRole) : value,
    }));

    setError((prev) => ({
      ...prev,
      common: '',
      [name]: '',
    }));
  };

  const validateEmail = (email: string) => emailPattern.test(email);

  const validatePassword = (password: string) => passwordPattern.test(password);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let errorMessage = '';

    if (name === 'email') {
      errorMessage = validateEmail(value)
        ? ''
        : 'Please enter a valid email address.';
    }

    if (name === 'password') {
      errorMessage = validatePassword(value)
        ? ''
        : 'Password must be at least 8 characters and include uppercase, lowercase and a number.';
    }

    if (name === 'username') {
      errorMessage = value.length >= 6
        ? ''
        : 'Username must be at least 6 characters.';
    }

    setError((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.username ||
      !formData.role
    ) {
      setError((prev) => ({
        ...prev,
        common: 'Please fill in all required fields.',
      }));

      return;
    }

    const hasErrors = Object.values(error).some((err) => err !== '');

    if (hasErrors) {
      return;
    }

    try {
      await register(formData).unwrap();
      navigate('/');
    } catch (err) {
      setError((prev) => ({
        ...prev,
        common: 'Something went wrong while creating your account.',
      }));

      console.error('Register error:', err);
    }
  };

  return (
    <div className={styles.signup}>
      <form className={styles.form} onSubmit={handleRegister}>
        <div className={styles.header}>
          <div className={styles.badge}>Get started</div>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.description}>
            Join your team workspace and start estimating tasks together.
          </p>
        </div>

        {error.common && (
          <div className={styles.common}>{error.common}</div>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Email</span>

          <input
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            name='email'
            type='email'
            placeholder='Enter your email'
            autoComplete='email'
          />
        </label>

        {error.email && <div className={styles.error}>{error.email}</div>}

        <label className={styles.field}>
          <span className={styles.label}>Password</span>

          <input
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            name='password'
            type='password'
            placeholder='Create a password'
            autoComplete='new-password'
          />
        </label>

        {error.password && <div className={styles.error}>{error.password}</div>}

        <label className={styles.field}>
          <span className={styles.label}>Username</span>

          <input
            className={styles.input}
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            name='username'
            type='text'
            placeholder='Choose a username'
            autoComplete='username'
          />
        </label>

        {error.username && <div className={styles.error}>{error.username}</div>}

        <label className={styles.field}>
          <span className={styles.label}>Role</span>

          <div className={styles.selectWrapper}>
            <select
              value={formData.role}
              onChange={handleChange}
              name='role'
              className={styles.select}
            >
              <option value='watching'>Observer</option>
              <option value='voting'>Voter</option>
            </select>

            <svg className={styles.arrow}>
              <use xlinkHref='#select-arrow-down'></use>
            </svg>
          </div>
        </label>

        <svg className={styles.sprites}>
          <symbol id='select-arrow-down' viewBox='0 0 10 6'>
            <polyline points='1 1 5 5 9 1'></polyline>
          </symbol>
        </svg>

        <button type='submit' className={styles.submitButton}>
          Create account
        </button>

        <div className={styles.footer}>
          <span>Already have an account?</span>

          <Link to='/login' className={styles.loginLink}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;