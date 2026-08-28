import styles from './Select.module.css';

export default function Select({ label, error, children, ...props }) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <select
        className={`${styles.select} ${error ? styles.error : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </label>
  );
}
