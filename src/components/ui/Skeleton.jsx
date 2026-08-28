import styles from './Skeleton.module.css';

export default function Skeleton({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}
