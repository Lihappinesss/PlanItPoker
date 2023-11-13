import { Link } from 'react-router-dom';

import user from 'src/icons/user.png';

import styles from './index.module.scss';


const Shapka = () => {
  return (
    <div className={styles.shapka}>
      <Link to='/' className={styles.link}>
        <h1 className={styles.logo}>PokerPlan</h1>
      </Link>
      <Link to='/profile' className={styles.link}>
        <div className={styles.name}>name</div>
        <div className={styles.avatar}>
          <img src={user} className={styles.img} />
        </div>
      </Link>
    </div>
  );
}

export default Shapka;
