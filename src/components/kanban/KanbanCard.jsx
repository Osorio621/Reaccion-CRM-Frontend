import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserCircle2, Percent, CalendarClock } from 'lucide-react';
import styles from './KanbanCard.module.css';

function dateDiffDays(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const ms = date.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function getEstadoSeguimiento(oportunidad) {
  const v = Number(oportunidad.diasVencidoSeguimiento ?? oportunidad.diasVencido ?? null);
  if (!isNaN(v) && v > 0) return { key: 'overdue', days: v, label: `${v} d venc` };
  const d = dateDiffDays(oportunidad.fechaCompromiso);
  if (d === 0) return { key: 'today', days: 0, label: 'Hoy' };
  if (d !== null && d < 0) return { key: 'overdue', days: -d, label: `${-d} d venc` };
  if (d !== null && d <= 2) return { key: 'soon', days: d, label: `${d} d` };
  return { key: 'ok', days: null, label: 'Al día' };
}

export default function KanbanCard({ oportunidad, overlay = false, accent }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oportunidad.id });

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const probabilidad = Number(oportunidad.probabilidad ?? null);
  const tieneProbabilidad = !isNaN(probabilidad) && probabilidad >= 0 && probabilidad <= 100;

  const probabilidadTone =
    tieneProbabilidad
      ? probabilidad >= 75
        ? 'high'
        : probabilidad >= 40
          ? 'medium'
          : 'low'
      : null;

  const cierreDias = useMemo(
    () => dateDiffDays(oportunidad.fechaCierre),
    [oportunidad.fechaCierre]
  );
  const cierreTone =
    cierreDias === null
      ? 'default'
      : cierreDias < 0
        ? 'danger'
        : cierreDias <= 7
          ? 'warning'
          : cierreDias <= 30
            ? 'ok'
            : 'default';

  const seguimiento = useMemo(() => getEstadoSeguimiento(oportunidad), [oportunidad]);

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={`${styles.card} ${overlay ? styles.overlayCard : ''}`}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
    >
      <div className={styles.cardTop}>
        <h4 className={styles.titulo}>
          {oportunidad.titulo ?? oportunidad.nombre}
        </h4>
        {tieneProbabilidad && (
          <span
            className={`${styles.probabilidad} ${
              probabilidadTone ? styles[`prob${probabilidadTone}`] : ''
            }`}
            title={`Probabilidad de cierre: ${probabilidad}%`}
          >
            <Percent size={10} />
            {probabilidad}
          </span>
        )}
      </div>

      <div className={styles.meta}>
        <span
          className={styles.valor}
          style={accent?.badge ? { color: accent.badge } : undefined}
        >
          ${Number(oportunidad.valor ?? 0).toLocaleString('es-CO')}
        </span>
      </div>

      <div className={styles.metaRow}>
        <div className={styles.fechaCierre} data-tone={cierreTone}>
          <CalendarClock size={12} />
          <span>
            {oportunidad.fechaCierre
              ? new Date(oportunidad.fechaCierre).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                })
              : 'Sin cierre'}
            {cierreDias !== null && (
              <em className={styles.diasChip}>
                {cierreDias < 0 ? `${-cierreDias}d atras` : cierreDias === 0 ? 'hoy' : `${cierreDias}d`}
              </em>
            )}
          </span>
        </div>
        <span
          className={`${styles.seguimientoBadge} ${styles[`seg${seguimiento.key}`]}`}
          title={`Seguimiento: ${seguimiento.label}`}
        >
          {seguimiento.key === 'overdue' && '🔴'}
          {seguimiento.key === 'today' && '🟠'}
          {seguimiento.key === 'soon' && '🟡'}
          {seguimiento.key === 'ok' && '✅'}
          <em>{seguimiento.label}</em>
        </span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cliente}>
          <UserCircle2 size={12} className={styles.clienteIcon} />
          {oportunidad.clienteNombre}
        </span>
        {oportunidad.ejecutivoNombre && (
          <span className={styles.ejecutivo} title={oportunidad.ejecutivoNombre}>
            {getInitials(oportunidad.ejecutivoNombre)}
          </span>
        )}
      </div>
    </article>
  );
}

function getInitials(nombre) {
  if (!nombre) return '';
  const parts = nombre.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (first + second).toUpperCase();
}

