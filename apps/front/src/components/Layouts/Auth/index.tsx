import styles from './index.module.scss';

interface  IAuth {
  children: React.ReactNode
}

const Auth = ({children}: IAuth) => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>PokerPlan</h1>
      <div className={styles.loginWrap}>
        {children}
      </div>
    </div>
  );
};

export default Auth;
