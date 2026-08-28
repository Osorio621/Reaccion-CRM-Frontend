import { useState } from 'react';
import styles from './Avatar.module.css';

export default function Avatar({ src, nombre = '', size = 28 }) {
  const [error, setError] = useState(false);
  const iniciales =
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase() || 'U';

  if (!src || error) {
    return (
      <span
        className={`${styles.avatar} ${styles.iniciales}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      >
        {iniciales}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={nombre || 'Foto de usuario'}
      className={styles.avatar}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}
