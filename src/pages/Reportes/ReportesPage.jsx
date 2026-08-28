import { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileJson,
  FileDown,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Users,
  ChevronDown,
  Database,
  Zap,
  TrendingUp,
  Briefcase,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { exportarReportes } from '../../api/reportes.api';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuthStore } from '../../store/authStore';
import { sanitizeErrorMessage } from '../../utils/errorHandler';
import styles from './ReportesPage.module.css';

const TIPOS = [
  { value: 'ventas', label: 'Ventas', icon: TrendingUp, desc: 'Periodo, Ejecutivo, Meta, Venta Real, Forecast, Cumplimiento', color: '#7c3aed' },
  { value: 'clientes', label: 'Clientes', icon: Users, desc: 'Nombre, Empresa, Email, Teléfono, Ejecutivo, Industria, Zona', color: '#2563eb' },
  { value: 'oportunidades', label: 'Oportunidades', icon: Briefcase, desc: 'Nombre, Cliente, Etapa, Valor, Probabilidad, Estado, Fecha Cierre', color: '#059669' },
  { value: 'pipeline', label: 'Pipeline', icon: Zap, desc: 'Etapa, Cantidad Oportunidades, Valor Total, Valor Ponderado', color: '#d97706' },
  { value: 'prospectos', label: 'Prospectos', icon: ClipboardList, desc: 'Nombre, Empresa, Email, Etapa, Origen, Fecha Creación', color: '#dc2626' },
];

const FORMATOS = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Hoja de cálculo', color: '#2563eb' },
  { value: 'json', label: 'JSON', icon: FileJson, desc: 'Estructurado', color: '#7c3aed' },
  { value: 'xlsx', label: 'Excel', icon: FileDown, desc: 'Microsoft Excel', color: '#059669' },
];

const ESTADOS_OPORTUNIDAD = [
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'GANADA', label: 'Ganada' },
  { value: 'PERDIDA', label: 'Perdida' },
  { value: 'CONGELADA', label: 'Congelada' },
];

const fmt = (d) => {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toISOString().slice(0, 10);
};

export default function ReportesPage() {
  const [tipo, setTipo] = useState('ventas');
  const [formato, setFormato] = useState('csv');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [ejecutivoId, setEjecutivoId] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exitoso, setExitoso] = useState(false);

  const rol = useAuthStore((s) => s.rol);
  const puedeFiltrarEjecutivo = rol === 'ADMIN' || rol === 'GERENTE';

  const usuariosQuery = useUsuarios();
  const usuariosRaw = usuariosQuery.data;
  const usuarios = usuariosRaw?.contenido ?? (Array.isArray(usuariosRaw) ? usuariosRaw : []);
  const ejecutivos = usuarios.filter((u) => u.rol === 'EJECUTIVO' || u.rol === 'GERENTE');

  const handleDescargar = async () => {
    setError(null);
    setExitoso(false);
    setLoading(true);

    const params = { formato, tipo };
    if (desde) params.desde = fmt(desde);
    if (hasta) params.hasta = fmt(hasta);
    if (puedeFiltrarEjecutivo && ejecutivoId) params.ejecutivoId = Number(ejecutivoId);
    if (tipo === 'oportunidades' && estado) params.estado = estado;

    try {
      await exportarReportes(params);
      setExitoso(true);
      setTimeout(() => setExitoso(false), 4000);
    } catch (err) {
      setError(sanitizeErrorMessage(err.message, tipo));
    } finally {
      setLoading(false);
    }
  };

  const tipoSeleccionado = TIPOS.find((t) => t.value === tipo);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Reportes</h1>
            <p className={styles.pageSubtitle}>
              Exporta datos del CRM en el formato que necesites
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {exitoso && (
            <span className={styles.successBadge}>
              <CheckCircle size={14} />
              ¡Descarga completada!
            </span>
          )}
        </div>
      </div>

      {/* Tipo de reporte */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <Database size={14} />
          <span>Tipo de reporte</span>
        </div>
        <div className={styles.tipoGrid}>
          {TIPOS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                className={`${styles.tipoCard} ${tipo === t.value ? styles.tipoActive : ''}`}
                onClick={() => setTipo(t.value)}
                style={tipo === t.value ? { borderColor: t.color, background: `${t.color}08` } : {}}
              >
                <div className={styles.tipoIcon} style={{ background: `${t.color}15`, color: t.color }}>
                  <Icon size={20} />
                </div>
                <div className={styles.tipoInfo}>
                  <span className={styles.tipoName}>{t.label}</span>
                  <span className={styles.tipoDesc}>{t.desc}</span>
                </div>
                {tipo === t.value && (
                  <div className={styles.tipoCheck} style={{ color: t.color }}>
                    <CheckCircle size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formato */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <FileDown size={14} />
          <span>Formato de archivo</span>
        </div>
        <div className={styles.formatoGrid}>
          {FORMATOS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                type="button"
                className={`${styles.formatoCard} ${formato === f.value ? styles.formatoActive : ''}`}
                onClick={() => setFormato(f.value)}
                style={formato === f.value ? { borderColor: f.color, background: `${f.color}08` } : {}}
              >
                <Icon size={22} style={{ color: f.color }} />
                <span className={styles.formatoLabel}>{f.label}</span>
                <span className={styles.formatoDesc}>{f.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <Filter size={14} />
          <span>Filtros</span>
        </div>
        <div className={styles.filtrosCard}>
          <div className={styles.filtrosGrid}>
            {/* Desde */}
            <div className={styles.filtroGroup}>
              <label className={styles.filtroLabel}>
                <Calendar size={14} />
                Desde
              </label>
              <input
                type="date"
                className={styles.filtroInput}
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>

            {/* Hasta */}
            <div className={styles.filtroGroup}>
              <label className={styles.filtroLabel}>
                <Calendar size={14} />
                Hasta
              </label>
              <input
                type="date"
                className={styles.filtroInput}
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>

            {/* Ejecutivo */}
            {puedeFiltrarEjecutivo && (
              <div className={styles.filtroGroup}>
                <label className={styles.filtroLabel}>
                  <UserCheck size={14} />
                  Ejecutivo
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.filtroSelect}
                    value={ejecutivoId}
                    onChange={(e) => setEjecutivoId(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {ejecutivos.map((u) => (
                      <option key={u.id} value={u.id}>
                        {[u.nombre, u.apellido].filter(Boolean).join(' ')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectChevron} />
                </div>
              </div>
            )}

            {/* Estado (solo oportunidades) */}
            {tipo === 'oportunidades' && (
              <div className={styles.filtroGroup}>
                <label className={styles.filtroLabel}>
                  <Briefcase size={14} />
                  Estado
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.filtroSelect}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {ESTADOS_OPORTUNIDAD.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectChevron} />
                </div>
              </div>
            )}
          </div>

          {/* Resumen de filtros */}
          <div className={styles.filtrosResumen}>
            <span className={styles.filtrosResumenLabel}>Exportarás:</span>
            <span className={styles.filtrosResumenValue}>
              {tipoSeleccionado?.label} en {formato.toUpperCase()}
              {desde ? ` desde ${desde}` : ''}
              {hasta ? ` hasta ${hasta}` : ''}
              {ejecutivoId && puedeFiltrarEjecutivo
                ? ` — ${ejecutivos.find((u) => String(u.id) === ejecutivoId)?.nombre ?? ''}`
                : ''}
              {estado ? ` — ${estado}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Botón descargar */}
      <div className={styles.downloadSection}>
        <button
          type="button"
          className={styles.downloadBtn}
          onClick={handleDescargar}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className={styles.btnSpinner} />
              Generando reporte...
            </>
          ) : (
            <>
              <Download size={18} />
              Descargar reporte
            </>
          )}
        </button>

        <div className={styles.downloadInfo}>
          <span>
            Formato: <strong>{formato.toUpperCase()}</strong>
          </span>
          <span className={styles.dot} />
          <span>
            Tipo: <strong>{tipoSeleccionado?.label}</strong>
          </span>
        </div>
      </div>

      {/* Nota */}
      <div className={styles.notaCard}>
        <AlertCircle size={16} className={styles.notaIcon} />
        <div className={styles.notaText}>
          <strong>Nota</strong>
          <span>
            Los reportes se generan en tiempo real con la información más reciente del sistema.
            {tipo === 'pipeline' && ' El pipeline solo muestra oportunidades ACTIVAS.'}
          </span>
        </div>
      </div>
    </div>
  );
}
