import { useState, useMemo } from 'react';
import {
  Pencil,
  Plus,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  BookOpen,
  Clock,
  Trash2,
  Shield,
  Database,
  FileText,
  ChevronRight,
  AlertTriangle,
  Hash,
  Layers,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuditoria } from '../../api/auditoria.api';
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
} from '../../hooks/useUsuarios';
import {
  useCatalogos,
  useCreateCatalogo,
  useUpdateCatalogo,
  useDeleteCatalogo,
} from '../../hooks/useCatalogos';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import UsuarioFormModal from './UsuarioFormModal';
import CatalogoFormModal from './CatalogoFormModal';
import styles from './AdminPage.module.css';

const TABS = [
  { id: 'usuarios', label: 'Usuarios', icon: UserPlus },
  { id: 'catalogos', label: 'Catálogos', icon: BookOpen },
  { id: 'auditoria', label: 'Auditoría', icon: Clock },
];

const ACCION_COLORS = {
  CREATE: { bg: '#dcfce7', text: '#166534', icon: Plus },
  INSERT: { bg: '#dcfce7', text: '#166534', icon: Plus },
  UPDATE: { bg: '#dbeafe', text: '#1e40af', icon: Pencil },
  DELETE: { bg: '#fee2e2', text: '#991b1b', icon: Trash2 },
  DELETE_LOGICO: { bg: '#fee2e2', text: '#991b1b', icon: Trash2 },
};

const TIPO_COLORS = {
  ETAPA_PIPELINE: { bg: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
  ETAPA_PROSPECTO: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  TIPO_CLIENTE: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  INDUSTRIA: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  ZONA_GEOGRAFICA: { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899' },
  RESULTADO_VISITA: { bg: '#e0e7ff', text: '#3730a3', dot: '#6366f1' },
  ORIGEN_PROSPECTO: { bg: '#ccfbf1', text: '#115e59', dot: '#14b8a6' },
  default: { bg: '#f3f4f6', text: '#374151', dot: '#6b7280' },
};

const AUDITORIA_FILTROS = [
  { value: 'all', label: 'Todas' },
  { value: 'INSERT', label: 'Creaciones' },
  { value: 'CREATE', label: 'Creaciones' },
  { value: 'UPDATE', label: 'Actualizaciones' },
  { value: 'DELETE', label: 'Eliminaciones' },
  { value: 'DELETE_LOGICO', label: 'Eliminaciones' },
];

function formatFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TABLAS_LABELS = {
  clientes: 'Cliente',
  oportunidades: 'Oportunidad',
  ventas: 'Venta',
  prospectos: 'Prospecto',
  visitas: 'Visita',
  seguimientos: 'Seguimiento',
  usuarios: 'Usuario',
  catalogos: 'Catálogo',
  contactos: 'Contacto',
  tickets: 'Ticket',
};

function traducirTabla(tabla) {
  if (!tabla) return '';
  return TABLAS_LABELS[String(tabla).toLowerCase()] || String(tabla);
}

const FIELDS_LABELS = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'Email',
  emailPrincipal: 'Email',
  emailCorporativo: 'Email corporativo',
  telefono: 'Teléfono',
  telefonoPrincipal: 'Teléfono',
  rol: 'Rol',
  activo: 'Estado',
  estado: 'Estado',
  password: 'Contraseña',
  valor: 'Valor',
  descripcion: 'Descripción',
  tipo: 'Tipo',
  codigo: 'Código',
  meta: 'Meta',
  ventaReal: 'Venta real',
  forecast: 'Forecast',
  monto: 'Monto',
  etapaId: 'Etapa',
  ejecutivoId: 'Ejecutivo',
  clienteId: 'Cliente',
  prospectoId: 'Prospecto',
  empresa: 'Empresa',
  razonSocial: 'Razón social',
  industriaId: 'Industria',
  zonaId: 'Zona',
};

function formatoValor(v) {
  if (v === null || v === undefined || v === '') return '(vacío)';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  return String(v);
}

function etiquetaCampo(campo) {
  const clave = String(campo).replace(/Id$/, '');
  return FIELDS_LABELS[clave] || FIELDS_LABELS[campo] || String(campo);
}

// Genera una descripción humana de lo que hizo el usuario
function descripcionAccion(row) {
  // 1. Si el backend ya manda descripción/mensaje, úsalo directo
  if (row.descripcion) return row.descripcion;
  if (row.mensaje && typeof row.mensaje === 'string') return row.mensaje;

  // 2. El backend manda campoModificado + valorAnterior/valorNuevo
  if (row.campoModificado) {
    const campo = etiquetaCampo(row.campoModificado);
    if (row.valorAnterior !== undefined && row.valorNuevo !== undefined) {
      return `Cambió ${campo}: ${formatoValor(row.valorAnterior)} → ${formatoValor(row.valorNuevo)}`;
    }
    return `Cambió ${campo}`;
  }

  const detalle = row.detalle;
  if (!detalle) return '';

  // 3. Detalle como string
  if (typeof detalle === 'string') return detalle;

  // 4. Detalle con claves de viejo/nuevo
  const partes = [];
  const hayClavesDirectas = Object.keys(detalle).length > 0;

  if (hayClavesDirectas) {
    // Buscar estructura {campo: {antes, despues}} o {campo: {old, new}}
    const entradas = Object.entries(detalle);
    const cambios = [];

    for (const [campo, valor] of entradas) {
      if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
        const antes = valor.antes ?? valor.old ?? valor.viejo ?? valor.de ?? valor.from;
        const despues = valor.despues ?? valor.new ?? valor.nuevo ?? valor.a ?? valor.to;
        if (antes !== undefined || despues !== undefined) {
          cambios.push(
            `${etiquetaCampo(campo)}: ${formatoValor(antes)} → ${formatoValor(despues)}`
          );
          continue;
        }
      }
      cambios.push(`${etiquetaCampo(campo)}: ${formatoValor(valor)}`);
    }

    if (cambios.length > 0) {
      const prefijo =
        row.accion === 'CREATE' || row.accion === 'INSERT'
          ? 'Se creó con los datos: '
          : row.accion === 'DELETE' || row.accion === 'DELETE_LOGICO'
          ? 'Se eliminó el registro. Datos: '
          : 'Cambios: ';
      partes.push(`${prefijo}${cambios.join('. ')}`);
    }
  }

  return partes.join(' ');
}

function getTipoColor(tipo) {
  return TIPO_COLORS[tipo] || TIPO_COLORS.default;
}

export default function AdminPage() {
  const [tab, setTab] = useState('usuarios');
  const [usuarioForm, setUsuarioForm] = useState({ open: false, data: null });
  const [catalogoForm, setCatalogoForm] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filtroAccion, setFiltroAccion] = useState('all');
  const [filtroTipoCatalogo, setFiltroTipoCatalogo] = useState('all');
  const [expandedAuditId, setExpandedAuditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const {
    data: usuarios,
    isLoading: loadingUsuarios,
    refetch: refetchUsuarios,
  } = useUsuarios();
  const {
    data: catalogos,
    isLoading: loadingCatalogos,
    refetch: refetchCatalogos,
  } = useCatalogos();
  const {
    data: auditoria,
    isLoading: loadingAuditoria,
    refetch: refetchAuditoria,
  } = useQuery({
    queryKey: ['auditoria'],
    queryFn: () => getAuditoria().then((r) => r.data),
  });

  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const createCatalogo = useCreateCatalogo();
  const updateCatalogo = useUpdateCatalogo();
  const deleteCatalogo = useDeleteCatalogo();

  const usuariosList = Array.isArray(usuarios) ? usuarios : usuarios?.contenido ?? [];
  const catalogosList = Array.isArray(catalogos) ? catalogos : catalogos?.contenido ?? [];
  const auditoriaList = auditoria?.contenido ?? (Array.isArray(auditoria) ? auditoria : []);

  const usuariosActivos = usuariosList.filter((u) => u.activo).length;

  const tiposUnicos = useMemo(() => {
    const tipos = [...new Set(catalogosList.map((c) => c.tipo))];
    return tipos.sort();
  }, [catalogosList]);

  const conteoPorTipo = useMemo(() => {
    const map = {};
    catalogosList.forEach((c) => {
      map[c.tipo] = (map[c.tipo] || 0) + 1;
    });
    return map;
  }, [catalogosList]);

  const filteredUsuarios = usuariosList.filter((user) => {
    const matchesSearch =
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === 'all'
        ? true
        : filterActive === 'active'
          ? user.activo
          : !user.activo;
    return matchesSearch && matchesFilter;
  });

  const filteredCatalogos = catalogosList.filter((item) => {
    const matchesSearch =
      item.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo =
      filtroTipoCatalogo === 'all' || item.tipo === filtroTipoCatalogo;
    return matchesSearch && matchesTipo;
  });

  const filteredAuditoria = auditoriaList.filter((item) => {
    const matchesAccion =
      filtroAccion === 'all' || item.accion === filtroAccion;
    return matchesAccion;
  });

  const catalogosAgrupados = useMemo(() => {
    const map = {};
    filteredCatalogos.forEach((c) => {
      if (!map[c.tipo]) map[c.tipo] = [];
      map[c.tipo].push(c);
    });
    return map;
  }, [filteredCatalogos]);

  const handleRefresh = () => {
    if (tab === 'usuarios') refetchUsuarios();
    else if (tab === 'catalogos') refetchCatalogos();
    else refetchAuditoria();
  };

  const handleDeleteCatalogo = () => {
    if (!deleteConfirm) return;
    deleteCatalogo.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast.success('Catálogo eliminado');
        setDeleteConfirm(null);
      },
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  return (
    <div className={styles.page}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Shield size={28} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Panel de Administración</h1>
            <p className={styles.pageSubtitle}>
              Gestión de usuarios, catálogos y auditoría del sistema
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className={styles.refreshBtn}
          >
            <RefreshCw size={16} />
            Actualizar
          </Button>
          {tab === 'usuarios' && (
            <Button
              onClick={() => setUsuarioForm({ open: true, data: null })}
              className={styles.primaryBtn}
            >
              <Plus size={18} />
              Nuevo usuario
            </Button>
          )}
          {tab === 'catalogos' && (
            <Button
              onClick={() => setCatalogoForm({ open: true, data: null })}
              className={styles.primaryBtn}
            >
              <Plus size={18} />
              Nuevo catálogo
            </Button>
          )}
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiPrimary}`}>
          <div className={styles.kpiIcon}>
            <UserPlus size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{usuariosList.length}</span>
            <span className={styles.kpiLabel}>Usuarios totales</span>
          </div>
          <span className={styles.kpiBadge}>
            {usuariosActivos} activos
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiAccent}`}>
          <div className={styles.kpiIcon}>
            <Database size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{catalogosList.length}</span>
            <span className={styles.kpiLabel}>Catálogos</span>
          </div>
          <span className={styles.kpiBadge}>
            {tiposUnicos.length} tipos
          </span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiSuccess}`}>
          <div className={styles.kpiIcon}>
            <FileText size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{auditoriaList.length}</span>
            <span className={styles.kpiLabel}>Registros auditoría</span>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const count =
              id === 'usuarios'
                ? usuariosList.length
                : id === 'catalogos'
                  ? catalogosList.length
                  : auditoriaList.length;
            return (
              <button
                key={id}
                className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
                <span className={styles.tabBadge}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      {(tab === 'usuarios' || tab === 'catalogos') && (
        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={
                tab === 'usuarios'
                  ? 'Buscar por nombre, email o rol...'
                  : 'Buscar por tipo, nombre o código...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {tab === 'usuarios' && (
            <div className={styles.filterGroup}>
              <Filter size={16} className={styles.filterIconLeft} />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          )}

          {tab === 'catalogos' && (
            <div className={styles.filterGroup}>
              <Layers size={16} className={styles.filterIconLeft} />
              <select
                value={filtroTipoCatalogo}
                onChange={(e) => setFiltroTipoCatalogo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos los tipos</option>
                {tiposUnicos.map((t) => (
                  <option key={t} value={t}>
                    {t} ({conteoPorTipo[t]})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {tab === 'auditoria' && (
        <div className={styles.toolbar}>
          <div className={styles.auditFilters}>
            {AUDITORIA_FILTROS.map((f) => {
              const count =
                f.value === 'all'
                  ? auditoriaList.length
                  : auditoriaList.filter((a) => a.accion === f.value).length;
              return (
                <button
                  key={f.value}
                  className={`${styles.auditFilterBtn} ${filtroAccion === f.value ? styles.auditFilterActive : ''}`}
                  onClick={() => setFiltroAccion(f.value)}
                >
                  {f.label}
                  <span className={styles.auditFilterCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className={styles.content}>
        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <>
            {loadingUsuarios ? (
              <div className={styles.loadingContainer}>
                <Spinner size={36} />
                <p>Cargando usuarios...</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                  <span className={styles.tableTitle}>
                    {filteredUsuarios.length} usuario
                    {filteredUsuarios.length !== 1 ? 'es' : ''}
                    {filterActive !== 'all' &&
                      ` · ${filterActive === 'active' ? 'activos' : 'inactivos'}`}
                    {searchTerm && ` · "${searchTerm}"`}
                  </span>
                </div>
                <Table
                  columns={[
                    {
                      key: 'nombre',
                      header: 'Nombre',
                      render: (row) => (
                        <div className={styles.userCell}>
                          <div
                            className={styles.userAvatar}
                            style={{
                              background: `hsl(${(row.id ?? 0) * 47 % 360}, 60%, 55%)`,
                            }}
                          >
                            {row.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.userName}>
                              {row.nombre} {row.apellido ?? ''}
                            </div>
                            <div className={styles.userEmail}>{row.email}</div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'telefono',
                      header: 'Teléfono',
                      render: (row) => row.telefono || '—',
                    },
                    {
                      key: 'rol',
                      header: 'Rol',
                      render: (row) => (
                        <Badge
                          tone={
                            row.rol === 'ADMIN'
                              ? 'warning'
                              : row.rol === 'GERENTE'
                                ? 'info'
                                : 'secondary'
                          }
                        >
                          {row.rol}
                        </Badge>
                      ),
                    },
                    {
                      key: 'activo',
                      header: 'Estado',
                      render: (row) => (
                        <span
                          className={`${styles.statusBadge} ${row.activo ? styles.statusActive : styles.statusInactive}`}
                        >
                          <span className={styles.statusDot} />
                          {row.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      ),
                    },
                    {
                      key: 'acciones',
                      header: '',
                      render: (row) => (
                        <button
                          type="button"
                          title="Editar usuario"
                          className={styles.iconBtn}
                          onClick={() =>
                            setUsuarioForm({ open: true, data: row })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                      ),
                    },
                  ]}
                  data={filteredUsuarios}
                  emptyMessage="No se encontraron usuarios"
                />
              </div>
            )}
          </>
        )}

        {/* CATÁLOGOS AGRUPADOS POR TIPO */}
        {tab === 'catalogos' && (
          <>
            {loadingCatalogos ? (
              <div className={styles.loadingContainer}>
                <Spinner size={36} />
                <p>Cargando catálogos...</p>
              </div>
            ) : filteredCatalogos.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={48} />
                <p>No se encontraron catálogos</p>
              </div>
            ) : (
              <div className={styles.catalogGroups}>
                {Object.entries(catalogosAgrupados).map(([tipo, items]) => {
                  const tc = getTipoColor(tipo);
                  return (
                    <div key={tipo} className={styles.catalogGroup}>
                      <div
                        className={styles.catalogGroupHeader}
                        style={{ borderLeftColor: tc.dot }}
                      >
                        <div
                          className={styles.catalogGroupDot}
                          style={{ background: tc.dot }}
                        />
                        <span className={styles.catalogGroupTipo}>{tipo}</span>
                        <span
                          className={styles.catalogGroupCount}
                          style={{ background: tc.bg, color: tc.text }}
                        >
                          {items.length}
                        </span>
                      </div>
                      <div className={styles.catalogGroupItems}>
                        {items.map((item) => (
                          <div key={item.id} className={styles.catalogItem}>
                            <div className={styles.catalogItemLeft}>
                              <Hash size={14} className={styles.catalogItemIcon} style={{ color: tc.dot }} />
                              <div>
                                <span className={styles.catalogItemNombre}>
                                  {item.nombre}
                                </span>
                                {item.codigo && (
                                  <span className={styles.catalogItemCodigo}>
                                    {item.codigo}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={styles.catalogItemRight}>
                              <span
                                className={`${styles.catalogStatus} ${item.activo !== false ? styles.catalogActive : styles.catalogInactive}`}
                              >
                                {item.activo !== false ? 'Activo' : 'Inactivo'}
                              </span>
                              <button
                                type="button"
                                title="Editar catálogo"
                                className={styles.iconBtnSm}
                                onClick={() =>
                                  setCatalogoForm({ open: true, data: item })
                                }
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                title="Eliminar catálogo"
                                className={`${styles.iconBtnSm} ${styles.iconBtnDanger}`}
                                onClick={() => setDeleteConfirm(item)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* AUDITORÍA */}
        {tab === 'auditoria' && (
          <>
            {loadingAuditoria ? (
              <div className={styles.loadingContainer}>
                <Spinner size={36} />
                <p>Cargando auditoría...</p>
              </div>
            ) : filteredAuditoria.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={48} />
                <p>No hay registros de auditoría</p>
              </div>
            ) : (
              <div className={styles.auditTimeline}>
                {filteredAuditoria.map((row, idx) => {
                  const accionStyle = ACCION_COLORS[row.accion] || ACCION_COLORS.UPDATE;
                  const AccionIcon = accionStyle.icon;
                  const isExpanded = expandedAuditId === row.id;
                  return (
                    <div
                      key={row.id ?? idx}
                      className={`${styles.auditEntry} ${isExpanded ? styles.auditEntryExpanded : ''}`}
                    >
                      <div className={styles.auditTimelineLine}>
                        <div
                          className={styles.auditDot}
                          style={{ background: accionStyle.text }}
                        />
                        {idx < filteredAuditoria.length - 1 && (
                          <div className={styles.auditConnector} />
                        )}
                      </div>
                      <div className={styles.auditContent}>
                        <div
                          className={styles.auditHeader}
                          onClick={() =>
                            setExpandedAuditId(isExpanded ? null : row.id)
                          }
                        >
                          <div className={styles.auditHeaderLeft}>
                            <span
                              className={styles.accionBadge}
                              style={{
                                background: accionStyle.bg,
                                color: accionStyle.text,
                              }}
                            >
                              <AccionIcon size={12} />
                              {row.accion}
                            </span>
                            <span className={styles.auditEntidad}>
                              {traducirTabla(row.tablaNombre ?? row.entidad)}
                            </span>
                            {row.usuarioNombre && (
                              <span className={styles.auditUsuario}>
                                por {row.usuarioNombre}
                              </span>
                            )}
                          </div>
                          <div className={styles.auditHeaderRight}>
                            <span className={styles.auditFecha}>
                              {formatFecha(row.createdAt ?? row.fecha)}
                            </span>
                            <ChevronRight
                              size={16}
                              className={`${styles.auditChevron} ${isExpanded ? styles.auditChevronOpen : ''}`}
                            />
                          </div>
                        </div>
                        {descripcionAccion(row) && (
                          <div className={styles.auditDescripcion}>
                            {descripcionAccion(row)}
                          </div>
                        )}
                        {(row.campoModificado && JSON.stringify({ a: row.valorAnterior, n: row.valorNuevo }) !== '{"a":"","n":""}') && (
                          <div className={styles.auditDiff}>
                            <span className={styles.auditDiffOld}>
                              {formatoValor(row.valorAnterior)}
                            </span>
                            <span className={styles.auditDiffArrow}>→</span>
                            <span className={styles.auditDiffNew}>
                              {formatoValor(row.valorNuevo)}
                            </span>
                          </div>
                        )}
                        {isExpanded && (row.detalle || row.ipAddress) && (
                          <div className={styles.auditDetail}>
                            <div className={styles.auditMeta}>
                              {row.registroId != null && (
                                <span className={styles.auditMetaItem}>
                                  Registro #{row.registroId}
                                </span>
                              )}
                              {row.ipAddress && (
                                <span className={styles.auditMetaItem}>
                                  IP: {row.ipAddress}
                                </span>
                              )}
                            </div>
                            {row.detalle && (
                              <pre className={styles.auditJson}>
                                {typeof row.detalle === 'string'
                                  ? row.detalle
                                  : JSON.stringify(row.detalle, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODALS ===== */}
      <UsuarioFormModal
        open={usuarioForm.open}
        usuario={usuarioForm.data}
        onClose={() => setUsuarioForm({ open: false, data: null })}
        onCreate={createUsuario}
        onUpdate={updateUsuario}
      />

      <CatalogoFormModal
        open={catalogoForm.open}
        catalogo={catalogoForm.data}
        onClose={() => setCatalogoForm({ open: false, data: null })}
        onCreate={createCatalogo}
        onUpdate={updateCatalogo}
      />

      <Modal
        open={!!deleteConfirm}
        title="Eliminar catálogo"
        onClose={() => setDeleteConfirm(null)}
      >
        <div className={styles.deleteModal}>
          <div className={styles.deleteIcon}>
            <AlertTriangle size={32} />
          </div>
          <h3>¿Eliminar este catálogo?</h3>
          <p>
            Se eliminará{' '}
            <strong>
              {deleteConfirm?.nombre} ({deleteConfirm?.tipo})
            </strong>
            . Esta acción no se puede deshacer.
          </p>
          {deleteCatalogo.isError && (
            <ErrorMessage
              message={extractErrorMessage(deleteCatalogo.error)}
            />
          )}
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteCatalogo.isPending}
              onClick={handleDeleteCatalogo}
            >
              <Trash2 size={16} />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
