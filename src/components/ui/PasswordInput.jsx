import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.css';

export default function PasswordInput({ label, error, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.wrapper}>
        <input
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${error ? styles.error : ''}`}
          {...props}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </label>
  );
}
