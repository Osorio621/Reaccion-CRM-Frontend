import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  type = 'button',
  disabled,
  loading,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${styles.button} ${styles[variant]}`}
      {...props}
    >
      {loading ? 'Cargando…' : children}
    </button>
  );
}
