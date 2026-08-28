import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Pencil,
  ChevronDown,
  Calendar,
  DollarSign,
  Zap,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useVentas, useCreateVenta, useUpdateVenta } from '../../hooks/useVentas';
import { useUsuarios } from '../../hooks/useUsuarios';
import MetaVsRealChart from '../../components/charts/MetaVsRealChart';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import VentaFormModal from './VentaFormModal';
import styles from './VentasPage.module.css';

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const MESES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatCOP = (v) => {
  if (v == null) return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  return `$${n.toLocaleString('es-CO')}`;
};

const getCumplimientoPct = (meta, real) => {
  const m = Number(meta);
  const r = Number(real);
  if (!m || isNaN(r) || m === 0) return null;
  return Math.round((r / m) * 100);
};

const getCumplimientoClass = (pct) => {
  if (pct === null) return styles.sinDatos;
  if (pct >= 100) return styles.cumpleSupera;
  if (pct >= 80) return styles.cumpleOk;
  return styles.cumpleBajo;
};

export default function VentasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEjecutivo, setFiltroEjecutivo] = useState('all');
  const [filtroMes, setFiltroMes] = useState('all');

  const { data, isLoading, isError, error, refetch } = useVentas();
  const usuariosQuery = useUsuarios();
  const createVenta = useCreateVenta();
  const updateVenta = useUpdateVenta();

  const ventas = data?.contenido ?? (Array.isArray(data) ? data : []);
  const usuariosRaw = usuariosQuery.data;
  const usuarios = usuariosRaw?.contenido ?? (Array.isArray(usuariosRaw) ? usuariosRaw : []);
  const ejecutivos = usuarios.filter((u) => u.rol === 'EJECUTIVO' || u.rol === 'GERENTE');

  const ventasFiltradas = useMemo(() => {
    let result = [...ventas];

    if (busqueda) {
      const q = busqueda.toLowerCase();
      result = result.filter(
        (v) =>
          (v.ejecutivoNombre ?? '').toLowerCase().includes(q) ||
          (v.notas ?? '').toLowerCase().includes(q)
      );
    }

    if (filtroEjecutivo !== 'all') {
      result = result.filter((v) => String(v.ejecutivoId) === filtroEjecutivo);
    }

    if (filtroMes !== 'all') {
      result = result.filter((v) => String(v.mes) === filtroMes);
    }

    result.sort((a, b) => {
      if (a.anio !== b.anio) return (b.anio ?? 0) - (a.anio ?? 0);
      return (b.mes ?? 0) - (a.mes ?? 0);
    });

    return result;
  }, [ventas, busqueda, filtroEjecutivo, filtroMes]);

  const chartData = useMemo(() => {
    const agrupado = {};
    ventas.forEach((v) => {
      const key = `${v.anio}-${String(v.mes ?? 1).padStart(2, '0')}`;
      if (!agrupado[key]) {
        agrupado[key] = { anio: v.anio, mes: v.mes, meta: 0, real: 0, forecast: 0 };
      }
      agrupado[key].meta += Number(v.meta) || 0;
      agrupado[key].real += Number(v.ventaReal) || 0;
      agrupado[key].forecast += Number(v.forecast) || 0;
    });

    return Object.values(agrupado)
      .sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return a.mes - b.mes;
      })
      .map((item) => ({
        mes: MESES[(item.mes ?? 1) - 1],
        meta: item.meta,
        real: item.real,
        forecast: item.forecast,
      }));
  }, [ventas]);

  const kpis = useMemo(() => {
    const totalMeta = ventas.reduce((s, v) => s + (Number(v.meta) || 0), 0);
    const totalReal = ventas.reduce((s, v) => s + (Number(v.ventaReal) || 0), 0);
    const totalForecast = ventas.reduce((s, v) => s + (Number(v.forecast) || 0), 0);
    const cumplimientos = ventas
      .map((v) => getCumplimientoPct(v.meta, v.ventaReal))
      .filter((c) => c !== null);
    const cumplimientoProm =
      cumplimientos.length > 0
        ? Math.round(cumplimientos.reduce((s, c) => s + c, 0) / cumplimientos.length)
        : null;

    return { totalMeta, totalReal, totalForecast, cumplimientoProm };
  }, [ventas]);

  const abrirNueva = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEdicion = (venta) => {
    setEditando(venta);
    setFormOpen(true);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Ventas</h1>
            <p className={styles.pageSubtitle}>
              Seguimiento de metas, ventas reales y forecast por ejecutivo
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
            Actualizar
          </button>
          <button type="button" className={styles.primaryBtn} onClick={abrirNueva}>
            <Plus size={16} />
            Registrar venta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsContainer}>
        <div className={`${styles.statCard} ${styles.statMeta}`}>
          <div className={`${styles.statIconBg} ${styles.statIconMeta}`}>
            <Target size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Meta total</span>
            <span className={styles.statValue}>{formatCOP(kpis.totalMeta)}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statReal}`}>
          <div className={`${styles.statIconBg} ${styles.statIconReal}`}>
            <DollarSign size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Venta real</span>
            <span className={styles.statValue}>{formatCOP(kpis.totalReal)}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statForecast}`}>
          <div className={`${styles.statIconBg} ${styles.statIconForecast}`}>
            <BarChart3 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Forecast total</span>
            <span className={styles.statValue}>{formatCOP(kpis.totalForecast)}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCumplimiento}`}>
          <div className={`${styles.statIconBg} ${styles.statIconCumplimiento}`}>
            <Award size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Cumplimiento prom.</span>
            <span className={`${styles.statValue} ${
              kpis.cumplimientoProm !== null
                ? kpis.cumplimientoProm >= 100
                  ? styles.cumpleColor
                  : kpis.cumplimientoProm >= 80
                  ? styles.okColor
                  : styles.noCumpleColor
                : ''
            }`}>
              {kpis.cumplimientoProm !== null ? `${kpis.cumplimientoProm}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {isError && (
        <ErrorMessage message={extractErrorMessage(error)} onRetry={refetch} />
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size={32} />
          <p>Cargando ventas...</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>
                <Zap size={16} className={styles.chartTitleIcon} />
                Meta vs Real vs Forecast
              </div>
              <span className={styles.chartPeriod}>
                {ventas.length} registros
              </span>
            </div>
            <MetaVsRealChart data={chartData} />
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por ejecutivo o notas..."
                className={styles.searchInput}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => setBusqueda('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.filterContainer}>
              <Filter size={16} className={styles.filterIcon} />
              <select
                className={styles.filterSelect}
                value={filtroEjecutivo}
                onChange={(e) => setFiltroEjecutivo(e.target.value)}
              >
                <option value="all">Todos los ejecutivos</option>
                {ejecutivos.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.nombre, u.apellido].filter(Boolean).join(' ')}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.filterChevron} />
            </div>

            <div className={styles.filterContainer}>
              <Calendar size={16} className={styles.filterIcon} />
              <select
                className={styles.filterSelect}
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="all">Todos los meses</option>
                {MESES_FULL.map((nombre, i) => (
                  <option key={i + 1} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.filterChevron} />
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            {ventasFiltradas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BarChart3 size={48} strokeWidth={1.5} className={styles.emptyIconLucide} />
                </div>
                <h3>No hay ventas registradas</h3>
                <p>
                  {busqueda || filtroEjecutivo !== 'all' || filtroMes !== 'all'
                    ? 'No se encontraron resultados con los filtros aplicados'
                    : 'Registra tu primera venta para comenzar el seguimiento'}
                </p>
                {!busqueda && filtroEjecutivo === 'all' && filtroMes === 'all' && (
                  <button type="button" className={styles.emptyBtn} onClick={abrirNueva}>
                    <Plus size={16} />
                    Registrar primera venta
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={styles.tableHeader}>
                  <span className={styles.tableTitle}>
                    {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <table className={styles.tableModern}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Periodo</th>
                      <th className={styles.th}>Ejecutivo</th>
                      <th className={`${styles.th} ${styles.thRight}`}>Meta</th>
                      <th className={`${styles.th} ${styles.thRight}`}>Venta real</th>
                      <th className={`${styles.th} ${styles.thRight}`}>Forecast</th>
                      <th className={`${styles.th} ${styles.thCenter}`}>Cumplimiento</th>
                      <th className={`${styles.th} ${styles.thRight}`}>Diferencia</th>
                      <th className={`${styles.th} ${styles.thCenter}`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasFiltradas.map((row) => {
                      const pct = getCumplimientoPct(row.meta, row.ventaReal);
                      const diferencia = (Number(row.ventaReal) || 0) - (Number(row.meta) || 0);

                      return (
                        <tr key={row.id} className={styles.tr}>
                          <td className={styles.td}>
                            <div className={styles.periodoCell}>
                              <Calendar size={14} className={styles.cellIcon} />
                              <span className={styles.periodoTexto}>
                                {MESES[(row.mes ?? 1) - 1]} {row.anio ?? ''}
                              </span>
                            </div>
                          </td>
                          <td className={styles.td}>
                            <span className={styles.ejecutivoTexto}>
                              {row.ejecutivoNombre ?? '—'}
                            </span>
                          </td>
                          <td className={`${styles.td} ${styles.tdRight}`}>
                            <span className={styles.montoMeta}>{formatCOP(row.meta)}</span>
                          </td>
                          <td className={`${styles.td} ${styles.tdRight}`}>
                            <span className={styles.montoReal}>{formatCOP(row.ventaReal)}</span>
                          </td>
                          <td className={`${styles.td} ${styles.tdRight}`}>
                            <span className={styles.montoForecast}>{formatCOP(row.forecast)}</span>
                          </td>
                          <td className={`${styles.td} ${styles.tdCenter}`}>
                            <span className={`${styles.cumplimientoBadge} ${getCumplimientoClass(pct)}`}>
                              {pct !== null ? (
                                <>
                                  {pct >= 100 ? (
                                    <CheckCircle size={12} />
                                  ) : pct >= 80 ? (
                                    <AlertCircle size={12} />
                                  ) : (
                                    <AlertCircle size={12} />
                                  )}
                                  {pct}%
                                </>
                              ) : (
                                '—'
                              )}
                            </span>
                          </td>
                          <td className={`${styles.td} ${styles.tdRight}`}>
                            <span className={
                              diferencia > 0
                                ? styles.diferenciaPositiva
                                : diferencia < 0
                                ? styles.diferenciaNegativa
                                : styles.sinDatos
                            }>
                              {diferencia !== 0
                                ? `${diferencia > 0 ? '+' : ''}${formatCOP(diferencia)}`
                                : '—'}
                            </span>
                          </td>
                          <td className={`${styles.td} ${styles.tdCenter}`}>
                            <button
                              type="button"
                              title="Editar venta"
                              className={styles.iconBtn}
                              onClick={() => abrirEdicion(row)}
                            >
                              <Pencil size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </>
      )}

      <VentaFormModal
        open={formOpen}
        venta={editando}
        onClose={() => setFormOpen(false)}
        onCreate={createVenta}
        onUpdate={updateVenta}
      />
    </div>
  );
}
