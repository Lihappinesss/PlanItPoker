import { Link } from 'react-router-dom';

import { useGetUserInfoQuery } from '@src/store/api/auth';

import styles from './index.module.scss';


const Shapka = () => {
  const { data } = useGetUserInfoQuery();
  
  return (
    <div className="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="app-shell">
        <div className={styles.shapka}>
          <Link to='/' className={styles.link}>
            <h1 className="font-display text-2xl font-bold tracking-[-0.05em] text-ink md:text-3xl">
              PlanIt Poker
            </h1>
          </Link>
          {data?.user.username && (
            <div className="rounded-full border border-black/10 bg-accent-soft px-4 py-2 text-sm font-medium text-ink shadow-sm">
              {data.user.username}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shapka;
