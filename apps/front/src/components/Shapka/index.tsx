import { Link } from 'react-router-dom';

import { useGetUserInfoQuery } from '@src/store/api/auth';

import styles from './index.module.scss';

const Shapka = () => {
  const { data } = useGetUserInfoQuery();

  const username = data?.user.username;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to='/' className={styles.logo}>
          <div className={styles.logoIcon}>PP</div>

          <div>
            <div className={styles.logoTitle}>PlanIt Poker</div>
            <div className={styles.logoSubtitle}>Agile planning workspace</div>
          </div>
        </Link>

        {username && (
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {username.slice(0, 1).toUpperCase()}
            </div>

            <div>
              <div className={styles.userLabel}>Team member</div>
              <div className={styles.username}>{username}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Shapka;