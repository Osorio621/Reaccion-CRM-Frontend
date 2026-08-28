import styles from './Badge.module.css';

const TONES = ['default', 'success', 'warning', 'danger', 'info'];

export default function Badge({ tone = 'default', children }) {
  const cls = TONES.includes(tone) ? tone : 'default';
  return <span className={`${styles.badge} ${styles[cls]}`}>{children}</span>;
}
