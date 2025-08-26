import React from 'react';
import styles from './AnimatedCirclesBackground.module.css';

const AnimatedCirclesBackground: React.FC = () => {
  return (
    <div className={styles.backgroundContainer}>
      <div className={`${styles.circle} ${styles.lime}`}></div>
      <div className={`${styles.circle} ${styles.red}`}></div>
      <div className={`${styles.circle} ${styles.magenta}`}></div>
      <div className={`${styles.circle} ${styles.blue}`}></div>
      <div className={`${styles.circle} ${styles.yellow}`}></div>
    </div>
  );
};

export default AnimatedCirclesBackground;