import { useState, MouseEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Auth from '@src/components/Layouts/Auth';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@src/store/api/auth';
import { setIsAuth } from '@src/store/authSlice';

import styles from './index.module.scss';

interface FormData {
  username: string;
  email?: string;
  password: string;
}


const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const [ login ] = useLoginMutation();
  const navigate = useNavigate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }, [formData]);

  const handleLogin = useCallback(async (e: MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      await login(formData);
      dispatch(setIsAuth(true));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [login, formData, dispatch, navigate]);

  return (
    <Auth>
      <form className={styles.signin} onSubmit={handleLogin}>
        <div className={styles.enter}>Вход</div>
        <Input
          label='Логин'
          name="username"
          handleChange={handleChange}
          type='text'
        />
        <Input
          label='Пароль'
          name='password'
          handleChange={handleChange}
          type='password'
        />
        <Button
          type={0}
          size='l'
          submit
        >
          Войти
        </Button>
        <Indent top={20} />
        <Button type={0} size='l'>
          <Link to='/register' className={styles.link}>Зарегистрироваться</Link>
        </Button>
      </form>
    </Auth>
  );
};

export default SignIn;
