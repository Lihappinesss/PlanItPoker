import React, { useState, Fragment, useCallback } from 'react';

import Input from '@src/components/Input';
import Button from '@src/components/Button';
import Indent from '@src/components/Indent';
import Shapka from '@src/components/Shapka';

import avatar from '../../icons/avatar.png';

import styles from './index.module.scss';


const Profile = () => {
  const [email, updateEmail] = useState('');
  const handleSave = useCallback(() => {
    console.log(email)
  }, []);

  return (
    <Fragment>
      <Shapka />
      <div className={styles.profile}>
        <div className={styles.logo}>
          <div className={styles.avatarWrapper}>
            <img className='styles.avatar' src={avatar} />
          </div>
          <div className={styles.member}>Участник</div>
        </div>
        <div className={styles.userInfo}>
          <Input label='логин' handleChange={updateEmail} />
          <Indent top={20} />
          <div className={styles.changeRole}>Сменить роль участника</div>
          <Input label='роль' handleChange={updateEmail} />
          <Indent top={20} />
          <div className={styles.changeRole}>Изменить пароль</div>
          <Input label='Старый пароль' handleChange={updateEmail} />
          <Indent top={10} />
          <Input label='Новый пароль' handleChange={updateEmail} />
          <Indent top={20} />
          <Button
            type={0}
            size='l'
            handleClick={handleSave}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </Fragment>
  )
}

export default Profile;
