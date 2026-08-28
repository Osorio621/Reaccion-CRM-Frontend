import styles from './Input.module.css';

export default function Input({ label, error, ...props }) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </label>
  );
}
