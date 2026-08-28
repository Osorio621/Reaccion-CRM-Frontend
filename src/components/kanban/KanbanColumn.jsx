import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import styles from './KanbanColumn.module.css';

const ACCENT_COLORS = [
  { bar: '#2563eb', badge: '#2563eb', soft: 'rgba(37, 99, 235, 0.12)' },
  { bar: '#0ea5e9', badge: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.12)' },
  { bar: '#059669', badge: '#059669', soft: 'rgba(5, 150, 105, 0.12)' },
  { bar: '#d97706', badge: '#d97706', soft: 'rgba(217, 119, 6, 0.12)' },
  { bar: '#dc2626', badge: '#dc2626', soft: 'rgba(220, 38, 38, 0.12)' },
  { bar: '#7c3aed', badge: '#7c3aed', soft: 'rgba(124, 58, 237, 0.12)' },
  { bar: '#db2777', badge: '#db2777', soft: 'rgba(219, 39, 119, 0.12)' },
];

export default function KanbanColumn({ columna }) {
  const oportunidades = columna.oportunidades ?? [];
  const { setNodeRef, isOver } = useDroppable({
    id: String(columna.id),
    data: { columnaId: columna.id },
  });

  const accent = ACCENT_COLORS[(columna.id - 1) % ACCENT_COLORS.length] || ACCENT_COLORS[0];

  const totalValor = oportunidades.reduce(
    (s, o) => s + Number(o.valor ?? 0),
    0
  );

  const totalPonderado = oportunidades.reduce((s, o) => {
    const p = Number(o.probabilidad);
    const val = Number(o.valor ?? 0);
    const prob = !isNaN(p) && p >= 0 && p <= 100 ? p / 100 : 1;
    return s + val * prob;
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={`${styles.columna} ${isOver ? styles.over : ''}`}
      style={{
        borderTop: `3px solid ${accent.bar}`,
        ['--col-accent']: accent.badge,
        ['--col-accent-soft']: accent.soft,
      }}
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.colDot}
            style={{ background: accent.badge }}
          />
          <span className={styles.titulo}>{columna.nombre}</span>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.esperado}
            title="Valor esperado (ponderado por probabilidad)"
          >
            Esp. ${Math.round(totalPonderado).toLocaleString('es-CO')}
          </span>
          <span className={styles.count} style={{
            background: accent.soft,
            color: accent.badge,
            borderColor: `${accent.badge}33`,
          }}>
            {oportunidades.length}
          </span>
        </div>
      </header>
      <SortableContext
        items={oportunidades.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.cards}>
          {oportunidades.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>＋</span>
              <span className={styles.emptyText}>Suelta aquí</span>
            </div>
          )}
          {oportunidades.map((o) => (
            <KanbanCard key={o.id} oportunidad={o} accent={accent} />
          ))}
        </div>
      </SortableContext>
      {oportunidades.length > 0 && (
        <footer className={styles.footer}>
          <span className={styles.footerLabel}>Total</span>
          <span className={styles.footerValue}>
            ${totalValor.toLocaleString('es-CO')}
          </span>
        </footer>
      )}
    </div>
  );
}
