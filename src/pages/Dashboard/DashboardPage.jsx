import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useOportunidades } from '../../hooks/useOportunidades';
import { useSeguimientosVencidos } from '../../hooks/useSeguimientos';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import {
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronRight,
  Target,
  CalendarCheck,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  UserX,
} from 'lucide-react';
import styles from './DashboardPage.module.css';

const DEFAULT_CUMPLIMIENTO = [
  { ejecutivo: 'Juan Pérez', meta: 250000, real: 218500 },
  { ejecutivo: 'Ana López', meta: 280000, real: 302800 },
  { ejecutivo: 'Carlos Ruiz', meta: 220000, real: 165400 },
  { ejecutivo: 'Luis García', meta: 300000, real: 276000 },
  { ejecutivo: 'Marta Díaz', meta: 200000, real: 187300 },
];

const DEFAULT_VISITAS_SEMANALES = [
  { ejecutivo: 'Juan Pérez', realizadas: 8, planificadas: 12, mon: 2, tue: 2, wed: 1, thu: 2, fri: 1 },
  { ejecutivo: 'Ana López', realizadas: 5, planificadas: 10, mon: 1, tue: 1, wed: 1, thu: 1, fri: 1 },
  { ejecutivo: 'Carlos Ruiz', realizadas: 11, planificadas: 10, mon: 3, tue: 2, wed: 2, thu: 2, fri: 2 },
  { ejecutivo: 'Luis García', realizadas: 7, planificadas: 8, mon: 1, tue: 2, wed: 1, thu: 2, fri: 1 },
  { ejecutivo: 'Marta Díaz', realizadas: 3, planificadas: 9, mon: 1, tue: 0, wed: 1, thu: 1, fri: 0 },
];

function formatCurrency(n) {
  return `$${Number(n).toLocaleString('es-CO')}`;
}

function computeCumplimientoData(list = []) {
  return list.map((r) => {
    const meta = Number(r.meta) || 0;
    const real = Number(r.real) || 0;
    const porcentaje = meta > 0 ? Math.min(200, (real / meta) * 100) : 0;
    let estado = 'bajo';
    if (porcentaje >= 100) estado = 'meta';
    else if (porcentaje >= 80) estado = 'progreso';
    return {
      ...r,
      porcentaje,
      estado,
      meta,
      real,
    };
  });
}

export default function DashboardPage() {
  const { data: resumen, isLoading, isError, error, refetch } = useDashboard();
  const oportunidadesQuery = useOportunidades();
  const { data: vencidos } = useSeguimientosVencidos();

  const pipelineStats = useMemo(() => {
    const ops = oportunidadesQuery.data?.contenido ?? oportunidadesQuery.data ?? [];
    const lista = Array.isArray(ops) ? ops : [];
    let total = 0;
    let cierranMes = 0;
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = hoy.getMonth();
    lista.forEach((o) => {
      total += Number(o.valor ?? 0);
      const fecha = o.fechaEstimadaCierre ?? o.fechaCierre;
      if (fecha) {
        const d = new Date(fecha);
        if (d.getFullYear() === y && d.getMonth() === m) cierranMes += 1;
      }
    });
    return { total, cierranMes };
  }, [oportunidadesQuery.data]);

  const cumplimiento = useMemo(() => {
    const raw = resumen?.cumplimientoEjecutivos?.length
      ? resumen.cumplimientoEjecutivos
      : DEFAULT_CUMPLIMIENTO;
    return computeCumplimientoData(raw);
  }, [resumen]);

  const visitasSemana = useMemo(
    () => (resumen?.visitasSemanaPorEjecutivo?.length ? resumen.visitasSemanaPorEjecutivo : DEFAULT_VISITAS_SEMANALES),
    [resumen]
  );

  const resumenCumplimiento = useMemo(() => {
    const metaTotal = cumplimiento.reduce((acc, c) => acc + c.meta, 0);
    const realTotal = cumplimiento.reduce((acc, c) => acc + c.real, 0);
    const cumplen = cumplimiento.filter((c) => c.porcentaje >= 100).length;
    return {
      metaTotal,
      realTotal,
      porcentaje: metaTotal > 0 ? (realTotal / metaTotal) * 100 : 0,
      cumplen,
      total: cumplimiento.length,
      promedio: cumplimiento.length > 0 
        ? cumplimiento.reduce((acc, c) => acc + c.porcentaje, 0) / cumplimiento.length 
        : 0,
    };
  }, [cumplimiento]);

  // Calcular tendencia del pipeline
  const tendenciaPipeline = useMemo(() => {
    const valor = pipelineStats.total;
    if (valor > 1000000) return { icon: ArrowUpRight, label: 'Alto', color: '#059669' };
    if (valor > 500000) return { icon: Minus, label: 'Medio', color: '#d97706' };
    return { icon: ArrowDownRight, label: 'Bajo', color: '#dc2626' };
  }, [pipelineStats.total]);

  if (isLoading || oportunidadesQuery.isLoading)
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Skeleton width={220} height={32} />
            <Skeleton width={340} height={18} />
          </div>
          <Skeleton width={120} height={36} radius={20} />
        </div>
        <div className={styles.kpis}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={120} radius={14} />
          ))}
        </div>
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <Skeleton width={260} height={22} style={{ marginBottom: 16 }} />
            <Skeleton height={240} radius={10} />
          </div>
          <div className={styles.card}>
            <Skeleton width={260} height={22} style={{ marginBottom: 16 }} />
            <Skeleton height={240} radius={10} />
          </div>
        </div>
        <div className={styles.card}>
          <Skeleton width={180} height={22} style={{ marginBottom: 16 }} />
          <Skeleton height={180} radius={10} />
        </div>
      </div>
    );
  
  if (isError)
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error?.response?.data?.mensaje} onRetry={refetch} />
      </div>
    );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>📊</span>
            Panel principal
          </h1>
          <p className={styles.pageSubtitle}>
            Vista general del rendimiento comercial y alertas que requieren tu atención.
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.updateBadge}>
            <Activity size={14} />
            Actualizado ahora
          </span>
        </div>
      </header>

      <section className={styles.kpis}>
        <Kpi
          label="Pipeline total"
          value={pipelineStats.total}
          format="currency"
          icon={Briefcase}
          tone="primary"
          trend={tendenciaPipeline}
        />
        <Kpi
          label="Ponderado esperado"
          value={resumen?.pipelinePonderado}
          format="currency"
          icon={TrendingUp}
          tone="success"
        />
        <Kpi
          label="Cierran este mes"
          value={pipelineStats.cierranMes}
          icon={CalendarDays}
          tone="info"
          suffix="ops"
        />
        <Kpi
          label="Seguimientos vencidos"
          value={resumen?.seguimientosVencidos}
          icon={AlertTriangle}
          tone="danger"
        />
      </section>

      <section className={styles.twoCol}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIconPrimary}>
                <Target size={18} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Cumplimiento mensual</h2>
                <p className={styles.cardSubtitle}>
                  Meta vs. ventas reales por ejecutivo
                </p>
              </div>
            </div>
            <div className={styles.teamSummary}>
              <div className={styles.teamTotal}>
                <span className={styles.teamPct}>{resumenCumplimiento.porcentaje.toFixed(0)}%</span>
                <span className={styles.teamLabel}>equipo</span>
              </div>
              <div className={styles.teamSub}>
                <span className={styles.teamNum}>
                  {resumenCumplimiento.cumplen}/{resumenCumplimiento.total}
                </span>
                <span className={styles.teamLabelText}>cumplen meta</span>
              </div>
              <div className={styles.teamAvg}>
                <span className={styles.teamAvgValue}>
                  {resumenCumplimiento.promedio.toFixed(0)}%
                </span>
                <span className={styles.teamAvgLabel}>promedio</span>
              </div>
            </div>
          </header>

          <div className={styles.cumpleList}>
            {cumplimiento.map((c, idx) => (
              <div key={`${c.ejecutivo}-${idx}`} className={styles.cumpleRow}>
                <div className={styles.cumpleHead}>
                  <div className={styles.cumpleUser}>
                    <div className={styles.cumpleAvatar} style={{ 
                      background: `hsl(${idx * 60 + 200}, 70%, 50%)` 
                    }}>
                      {c.ejecutivo.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className={styles.cumpleName}>{c.ejecutivo}</span>
                  </div>
                  <div className={styles.cumpleValues}>
                    <span className={styles.cumpleValue}>
                      {formatCurrency(c.real)}
                      <span className={styles.cumpleMetaTag}>/ {formatCurrency(c.meta)}</span>
                    </span>
                    <Badge
                      tone={c.estado === 'meta' ? 'success' : c.estado === 'progreso' ? 'info' : 'danger'}
                      className={styles.cumpleBadge}
                    >
                      {c.porcentaje.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className={styles.cumpleBarBg}>
                  <div
                    className={`${styles.cumpleBarFill} ${
                      c.estado === 'meta'
                        ? styles.cumpleBarMeta
                        : c.estado === 'progreso'
                          ? styles.cumpleBarProgreso
                          : styles.cumpleBarBajo
                    }`}
                    style={{ width: `${Math.min(100, c.porcentaje)}%` }}
                  />
                  {c.porcentaje >= 100 && (
                    <span
                      className={styles.cumpleMarker}
                      style={{ left: '100%' }}
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIconInfo}>
                <CalendarCheck size={18} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Visitas semanales</h2>
                <p className={styles.cardSubtitle}>
                  Realizadas vs planificadas por día
                </p>
              </div>
            </div>
            <div className={styles.visitaSummary}>
              <span className={styles.visitaSummaryTotal}>
                {visitasSemana.reduce((acc, v) => acc + v.realizadas, 0)}
                <span className={styles.visitaSummaryLabel}>/ total</span>
              </span>
            </div>
          </header>

          <div className={styles.visitaWeekHeader}>
            <span className={styles.visitaHeaderName}>Ejecutivo</span>
            <div className={styles.visitaDays}>
              <span>L</span>
              <span>M</span>
              <span>M</span>
              <span>J</span>
              <span>V</span>
            </div>
            <div className={styles.visitaTot}>Real / Plan</div>
          </div>

          <div className={styles.visitaList}>
            {visitasSemana.map((v, idx) => {
              const pct = v.planificadas > 0 ? (v.realizadas / v.planificadas) * 100 : 0;
              return (
                <div key={`${v.ejecutivo}-${idx}`} className={styles.visitaRow}>
                  <span className={styles.visitaName}>{v.ejecutivo}</span>
                  <div className={styles.visitaDaysBars}>
                    {['mon', 'tue', 'wed', 'thu', 'fri'].map((d) => (
                      <div key={d} className={styles.visitaDayCell}>
                        <div
                          className={styles.visitaDayBar}
                          style={{
                            height: `${Math.min(100, ((v[d] ?? 0) / Math.max(4, 1)) * 100)}%`,
                          }}
                        />
                        <span className={styles.visitaDayNum}>{v[d] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.visitaTotWrap}>
                    <div className={styles.visitaPill}>
                      <span
                        className={`${styles.visitaReal} ${
                          pct >= 80 ? styles.visitaOk : pct >= 50 ? styles.visitaMed : styles.visitaLow
                        }`}
                      >
                        {v.realizadas}
                      </span>
                      <span className={styles.visitaSep}>/</span>
                      <span className={styles.visitaPlan}>{v.planificadas}</span>
                    </div>
                    <div className={styles.visitaMiniBarBg}>
                      <div
                        className={`${styles.visitaMiniBarFill} ${
                          pct >= 80
                            ? styles.visitaBarOk
                            : pct >= 50
                              ? styles.visitaBarMed
                              : styles.visitaBarLow
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconDanger}>
              <Clock size={18} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Seguimientos vencidos</h2>
              <p className={styles.cardSubtitle}>
                Actividades pendientes que superaron su fecha de compromiso
              </p>
            </div>
          </div>
          <span className={styles.cardAction}>
            Ver todos <ChevronRight size={14} />
          </span>
        </header>
        <Table
          columns={[
            { 
              key: 'clienteNombre', 
              header: 'Cliente',
              className: styles.tableCliente 
            },
            { 
              key: 'asunto', 
              header: 'Asunto',
              className: styles.tableAsunto 
            },
            { 
              key: 'fechaCompromiso', 
              header: 'Fecha compromiso',
              className: styles.tableFecha 
            },
            {
              key: 'diasVencido',
              header: 'Días vencido',
              className: styles.tableDias,
              render: (row) => (
                <Badge tone="danger" className={styles.diasBadge}>
                  {row.diasVencido} días
                </Badge>
              ),
            },
          ]}
          data={vencidos?.contenido ?? vencidos}
          emptyMessage="🎉 Sin seguimientos vencidos"
          className={styles.table}
        />
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.cardIconWarning}>
              <UserX size={18} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Alertas de inactividad</h2>
              <p className={styles.cardSubtitle}>
                Clientes que no han tenido actividad reciente
              </p>
            </div>
          </div>
        </header>
        <Table
          columns={[
            { key: 'clienteNombre', header: 'Cliente' },
            {
              key: 'diasSinActividad',
              header: 'Días sin actividad',
              render: (row) => (
                <Badge tone={row.diasSinActividad > 60 ? 'danger' : 'warning'}>
                  {row.diasSinActividad} días
                </Badge>
              ),
            },
            { key: 'ultimaVisita', header: 'Última visita' },
            { key: 'ejecutivoNombre', header: 'Ejecutivo' },
          ]}
          data={resumen?.alertasInactividad ?? []}
          emptyMessage="✅ Todos los clientes activos"
          className={styles.table}
        />
      </section>
    </div>
  );
}

function Kpi({ label, value, format = 'number', tone = 'default', icon: Icon, trend, suffix = '' }) {
  const display = value == null
    ? '—'
    : format === 'currency'
      ? `$${Number(value).toLocaleString('es-CO')}`
      : Number(value).toLocaleString('es-CO');

  const toneClasses = {
    primary: styles.kpiPrimary,
    success: styles.kpiSuccess,
    info: styles.kpiInfo,
    danger: styles.kpiDanger,
    default: '',
  };

  const TrendIcon = trend?.icon;

  return (
    <div className={`${styles.kpi} ${toneClasses[tone] || ''}`}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIcon}>
          {Icon ? <Icon size={20} /> : null}
        </div>
        {trend && (
          <div className={styles.kpiTrend} style={{ color: trend.color }}>
            <TrendIcon size={14} />
            <span>{trend.label}</span>
          </div>
        )}
      </div>
      <div className={styles.kpiContent}>
        <span className={styles.kpiValue}>
          {display} {suffix && <span className={styles.kpiSuffix}>{suffix}</span>}
        </span>
        <span className={styles.kpiLabel}>{label}</span>
      </div>
    </div>
  );
}