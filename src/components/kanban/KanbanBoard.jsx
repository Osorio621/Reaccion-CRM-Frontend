import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import styles from './KanbanBoard.module.css';

export default function KanbanBoard({ columnas, onMover, disabled = false }) {
  const [dragging, setDragging] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: disabled ? 999999 : 6 },
    })
  );

  const handleDragStart = ({ active }) => {
    const col = columnas.find((c) =>
      c.oportunidades?.some((o) => o.id === active.id)
    );
    setDragging(col?.oportunidades.find((o) => o.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    setDragging(null);
    if (disabled || !over) return;
    const origen = columnas.find((c) =>
      c.oportunidades?.some((o) => o.id === active.id)
    );
    if (!origen) return;

    const destinoId = over.data.current?.columnaId ?? over.id;
    const destino = columnas.find((c) => String(c.id) === String(destinoId));
    if (!destino || destino.id === origen.id) return;

    const oportunidad = origen.oportunidades.find((o) => o.id === active.id);
    onMover?.(oportunidad, destino.id);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {columnas.map((col) => (
          <KanbanColumn key={col.id} columna={col} />
        ))}
      </div>
      <DragOverlay>
        {dragging ? <KanbanCard oportunidad={dragging} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
