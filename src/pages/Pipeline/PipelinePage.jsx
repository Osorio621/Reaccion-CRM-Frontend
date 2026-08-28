import { useMemo, useState } from 'react';
import { useOportunidades, useCambiarEtapa } from '../../hooks/useOportunidades';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import { useClientes } from '../../hooks/useClientes';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuthStore } from '../../store/authStore';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Select from '../../components/ui/Select';
import { extractErrorMessage } from '../../utils/errorHandler';
import { 
  GripVertical, 
  Briefcase, 
  Users, 
  CalendarDays, 
  RotateCcw, 
  Filter,
  TrendingUp,
  Sparkles,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react';
import styles from './PipelinePage.module.css';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo el tiempo' },
  { value: 'today', label: '📅 Cierran hoy' },
  { value: 'week', label: '📆 Cierran esta semana' },
  { value: 'month', label: '📊 Cierran este mes' },
  { value: 'quarter', label: '📈 Cierran este trimestre' },
];

function estaEnPeriodo(dateStr, period) {
  if (period === 'all' || !dateStr) return true;
  const date = new Date(dateStr);
  if (isNaN(date)) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);
  switch (period) {
    case 'today':
      return date.toDateString() === today.toDateString();
    case 'week': {
      const day = (today.getDay() + 6) % 7;
      start.setDate(today.getDate() - day);
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'month':
      start.setDate(1);
      end.setMonth(today.getMonth() + 1, 0);
      break;
    case 'quarter': {
      const q = Math.floor(today.getMonth() / 3);
      start.setMonth(q * 3, 1);
      end.setMonth(q * 3 + 3, 0);
      break;
    }
    default:
      return true;
  }
  return date >= start && date <= end;
}

export default function PipelinePage() {
  const rol = useAuthStore((s) => s.rol);
  const puedeFiltrarEjecutivo = rol === 'ADMIN' || rol === 'GERENTE';

  const oportunidadesQuery = useOportunidades();
  const etapasQuery = useCatalogosPorTipo('ETAPA_PIPELINE');
  const clientesQuery = useClientes({ size: 100 });
  const usuariosQuery = useUsuarios();
  const cambiarEtapa = useCambiarEtapa();

  const [filtroEjecutivo, setFiltroEjecutivo] = useState('all');
  const [filtroPeriodo, setFiltroPeriodo] = useState('all');

  const isLoading =
    oportunidadesQuery.isLoading ||
    etapasQuery.isLoading ||
    clientesQuery.isLoading;
  const isError = oportunidadesQuery.isError || etapasQuery.isError;
  const error = oportunidadesQuery.error ?? etapasQuery.error;

  const columnas = useMemo(() => {
    const etapasRaw = Array.isArray(etapasQuery.data) ? etapasQuery.data : [];
    const clientesRaw = clientesQuery.data;
    const clientes = clientesRaw?.contenido ?? (Array.isArray(clientesRaw) ? clientesRaw : []);
    const clientePorId = Object.fromEntries(clientes.map((c) => [c.id, c.nombre]));

    const opsRaw = oportunidadesQuery.data?.contenido ?? oportunidadesQuery.data ?? [];
    const ops = (Array.isArray(opsRaw) ? opsRaw : []).map((o) => ({
      ...o,
      clienteNombre: clientePorId[o.clienteId] ?? `Cliente #${o.clienteId}`,
      fechaCierre: o.fechaEstimadaCierre,
    }));

    return [...etapasRaw]
      .sort((a, b) => (a.orden ?? a.id) - (b.orden ?? b.id))
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        orden: e.orden,
        oportunidades: ops.filter((o) => String(o.etapaId) === String(e.id)),
      }));
  }, [etapasQuery.data, clientesQuery.data, oportunidadesQuery.data]);

  const ejecutivosOptions = useMemo(() => {
    const usuariosRaw = usuariosQuery.data;
    const usuarios = usuariosRaw?.contenido ?? (Array.isArray(usuariosRaw) ? usuariosRaw : []);
    return usuarios
      .filter((u) => u.rol === 'EJECUTIVO')
      .map((u) => ({
        id: String(u.id),
        nombre: [u.nombre, u.apellido].filter(Boolean).join(' ') || `Ejecutivo #${u.id}`,
      }));
  }, [usuariosQuery.data]);

  const columnasFiltradas = useMemo(() => {
    return columnas.map((col) => ({
      ...col,
      oportunidades: col.oportunidades.filter((o) => {
        if (filtroEjecutivo !== 'all' && String(o.ejecutivoId) !== filtroEjecutivo) return false;
        if (!estaEnPeriodo(o.fechaCierre, filtroPeriodo)) return false;
        return true;
      }),
    }));
  }, [columnas, filtroEjecutivo, filtroPeriodo]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={40} />
        <p className={styles.loadingText}>Cargando pipeline de ventas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage 
          message={extractErrorMessage(error)} 
          onRetry={() => { 
            oportunidadesQuery.refetch(); 
            etapasQuery.refetch(); 
          }} 
        />
      </div>
    );
  }

  const hayFiltros = filtroEjecutivo !== 'all' || filtroPeriodo !== 'all';

  const totalOportunidades = columnasFiltradas.reduce(
    (acc, col) => acc + col.oportunidades.length,
    0
  );

  const totalValor = columnasFiltradas.reduce(
    (acc, col) =>
      acc + col.oportunidades.reduce((s, o) => s + Number(o.valor ?? 0), 0),
    0
  );

  const totalPonderado = columnasFiltradas.reduce(
    (acc, col) =>
      acc +
      col.oportunidades.reduce((s, o) => s + Number(o.valorPonderado ?? o.valor ?? 0), 0),
    0
  );

  // Calcular métricas de conversión
  const oportunidadesPorEtapa = columnasFiltradas.map(col => ({
    etapa: col.nombre,
    count: col.oportunidades.length,
    valor: col.oportunidades.reduce((s, o) => s + Number(o.valor ?? 0), 0)
  }));

  const totalEnPipeline = columnasFiltradas.reduce(
    (acc, col) => acc + col.oportunidades.length, 0
  );

  const etapasConDatos = columnasFiltradas.filter(col => col.oportunidades.length > 0);
  const tasaConversion = etapasConDatos.length > 0 
    ? Math.round((etapasConDatos[etapasConDatos.length - 1]?.oportunidades.length || 0) / totalEnPipeline * 100)
    : 0;

  const limpiarFiltros = () => {
    setFiltroEjecutivo('all');
    setFiltroPeriodo('all');
  };

  const handleMover = (oportunidad, nuevaEtapaId) => {
    cambiarEtapa.mutate({ 
      id: oportunidad.id, 
      data: { etapaNuevaId: Number(nuevaEtapaId) } 
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>📊</span>
              Pipeline de ventas
            </h1>
            <div className={styles.headerBadges}>
              <span className={`${styles.badge} ${styles.badgePrimary}`}>
                <Sparkles size={14} />
                {totalOportunidades} oportunidades
              </span>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                <Zap size={14} />
                {tasaConversion}% conversión
              </span>
            </div>
          </div>
          <p className={styles.subtitle}>
            <GripVertical size={14} className={styles.tipIcon} />
            Arrastra las tarjetas entre columnas para cambiar la etapa de cada oportunidad.
            {cambiarEtapa.isPending && (
              <span className={styles.loadingHint}>
                <span className={styles.loadingDot} />
                Actualizando etapa…
              </span>
            )}
          </p>
        </div>

        <div className={styles.pipelineSummary}>
          <div className={`${styles.summaryChip} ${styles.summaryChipPrimary}`}>
            <span className={styles.summaryChipLabel}>
              <TrendingUp size={12} />
              Valor total
            </span>
            <span className={styles.summaryChipValue}>
              ${totalValor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className={`${styles.summaryChip} ${styles.summaryChipAccent}`}>
            <span className={styles.summaryChipLabel}>
              <BarChart3 size={12} />
              Valor ponderado
            </span>
            <span className={styles.summaryChipValue}>
              ${Math.round(totalPonderado).toLocaleString('es-CO')}
            </span>
          </div>
          <div className={`${styles.summaryChip} ${styles.summaryChipInfo}`}>
            <span className={styles.summaryChipLabel}>
              <Briefcase size={12} />
              Oportunidades
            </span>
            <span className={styles.summaryChipValue}>{totalOportunidades}</span>
          </div>
          <div className={styles.summaryChip}>
            <span className={styles.summaryChipLabel}>
              <Clock size={12} />
              Etapas activas
            </span>
            <span className={styles.summaryChipValue}>
              {columnasFiltradas.filter(col => col.oportunidades.length > 0).length}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.filtersToolbar}>
        <div className={styles.filtersLeft}>
          <span className={styles.filtersBadge}>
            <Filter size={14} />
            Filtros
          </span>
          <div className={styles.filtersGroup}>
            {puedeFiltrarEjecutivo && (
              <div className={styles.filterField}>
                <Users size={14} className={styles.filterIcon} />
                <Select
                  aria-label="Filtrar por ejecutivo"
                  value={filtroEjecutivo}
                  onChange={(e) => setFiltroEjecutivo(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">👤 Todos los ejecutivos</option>
                  {ejecutivosOptions.map((ej) => (
                    <option key={ej.id} value={ej.id}>
                      {ej.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className={styles.filterField}>
              <CalendarDays size={14} className={styles.filterIcon} />
              <Select
                aria-label="Filtrar por periodo"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className={styles.filterSelect}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className={styles.filtersRight}>
          {hayFiltros && (
            <button type="button" className={styles.clearFiltersBtn} onClick={limpiarFiltros}>
              <RotateCcw size={14} />
              Limpiar filtros
            </button>
          )}
          <div className={styles.resultCount}>
            <span className={styles.resultDot} />
            {totalOportunidades} resultados
          </div>
        </div>
      </div>

      {cambiarEtapa.isError && (
        <ErrorMessage message={extractErrorMessage(cambiarEtapa.error)} />
      )}

      {/* Distribución de oportunidades por etapa */}
      {oportunidadesPorEtapa.some(etapa => etapa.count > 0) && (
        <div className={styles.distributionBar}>
          {oportunidadesPorEtapa.map((etapa, index) => (
            etapa.count > 0 && (
              <div 
                key={index}
                className={styles.distributionSegment}
                style={{ 
                  flex: etapa.count,
                  background: `hsl(${210 + index * 30}, 70%, 55%)`
                }}
                title={`${etapa.etapa}: ${etapa.count} oportunidades - $${etapa.valor.toLocaleString()}`}
              >
                <span className={styles.distributionLabel}>{etapa.etapa}</span>
                <span className={styles.distributionCount}>{etapa.count}</span>
              </div>
            )
          ))}
        </div>
      )}

      <div className={styles.boardWrapper}>
        <KanbanBoard
          columnas={columnasFiltradas}
          onMover={handleMover}
          disabled={cambiarEtapa.isPending}
        />
      </div>
    </div>
  );
}