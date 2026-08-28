import { CheckCircle2, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import styles from './Toaster.module.css';

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.tone] ?? ''}`}>
          {t.tone === 'error' ? (
            <XCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
