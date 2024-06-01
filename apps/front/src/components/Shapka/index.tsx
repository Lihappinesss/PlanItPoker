import { Link } from 'react-router-dom';

import { useGetUserInfoQuery } from '@src/store/api/auth';

import styles from './index.module.scss';


const Shapka = () => {
  const { data } = useGetUserInfoQuery();
  
  return (
    <div className={styles.shapka}>
      <Link to='/' className={styles.link}>
        <h1 className={styles.logo}>PokerPlan</h1>
      </Link>
      {data?.user.username && <div className={styles.name}>{data.user.username}</div>}
    </div>
  );
};

export default Shapka;
