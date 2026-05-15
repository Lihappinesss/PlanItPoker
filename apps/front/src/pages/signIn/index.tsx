import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@src/store/api/auth';

import styles from './index.module.scss';

interface FormData {
  username: string;
  email?: string;
  password: string;
}

interface FormData {
  username: string;
  password: string;
}

const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(formData).unwrap();
      navigate('/');
    } catch (error) {
      setErrorMessage('Invalid username or password');
      console.error('Login error:', error);
    }
  };

  return (
    <div className={styles.signin}>
      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.header}>
          <div className={styles.label}>Welcome back</div>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.description}>Enter your credentials to continue planning with your team.</p>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Username</span>

          <input
            className={styles.input}
            name='username'
            value={formData.username}
            onChange={handleChange}
            type='text'
            placeholder='Enter your username'
            autoComplete='username'
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Password</span>

          <input
            className={styles.input}
            name='password'
            value={formData.password}
            onChange={handleChange}
            type='password'
            placeholder='Enter your password'
            autoComplete='current-password'
          />
        </label>

        {errorMessage && (
          <div className={styles.error}>
            {errorMessage}
          </div>
        )}

        <button type='submit' className={styles.submitButton}>
          Sign in
        </button>

        <div className={styles.footer}>
          <span>Don’t have an account?</span>

          <Link to='/register' className={styles.registerLink}>
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn;