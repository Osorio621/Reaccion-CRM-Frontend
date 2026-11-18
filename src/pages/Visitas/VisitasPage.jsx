import { useState } from 'react';
import { 
  Pencil, 
  Plus, 
  Calendar, 
  Users, 
  Target, 
  Lightbulb,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useVisitas, useCreateVisita, useUpdateVisita } from '../../hooks/useVisitas';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import VisitaFormModal from './VisitaFormModal';
import VisitaDetalleModal from './VisitaDetalleModal';
import styles from './VisitasPage.module.css';

export default function VisitasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [detalleVisita, setDetalleVisita] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOportunidad, setFilterOportunidad] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useVisitas();
  const createVisita = useCreateVisita();
  const updateVisita = useUpdateVisita();

  const visitas = data?.contenido ?? data ?? [];

  const abrirNueva = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtrar visitas
  const filteredVisitas = visitas.filter(visita => {
    const matchesSearch = 
      (visita.prospectoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (visita.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (visita.objetivo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (visita.competenciaMencionada?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesFilter = 
      filterOportunidad === 'all' ? true :
      filterOportunidad === 'generada' ? visita.oportunidadGenerada :
      filterOportunidad === 'no-generada' ? !visita.oportunidadGenerada : true;
    
    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const getStats = () => {
    const total = visitas.length;
    const oportunidades = visitas.filter(v => v.oportunidadGenerada).length;
    const sinOportunidades = total - oportunidades;
    return { total, oportunidades, sinOportunidades };
  };

  const stats = getStats();

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(`${date}T12:00:00`);
    return d.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  // Obtener entidad visitada
  const getEntidadInfo = (row) => {
    const esProspecto = row.tipoEntidad === 'PROSPECTO';
    const nombre = esProspecto 
      ? row.prospectoNombre ?? `Prospecto #${row.prospectoId ?? '?'}`
      : row.clienteNombre ?? `Cliente #${row.clienteId ?? '?'}`;
    const tipo = esProspecto ? 'Prospecto' : 'Cliente';
    const icon = esProspecto ? <User size={14} /> : <Building2 size={14} />;
    return { nombre, tipo, icon, esProspecto };
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Calendar size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Visitas</h1>
            <p className={styles.pageSubtitle}>
              {visitas.length > 0 
                ? `${visitas.length} visita${visitas.length !== 1 ? 's' : ''} registrada${visitas.length !== 1 ? 's' : ''}`
                : 'No hay visitas registradas'
              }
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
            className={styles.refreshBtn}
          >
            <RefreshCw size={16} className={isRefreshing ? styles.spinning : ''} />
            Actualizar
          </Button>
          <Button 
            onClick={abrirNueva}
            className={styles.primaryBtn}
          >
            <Plus size={18} />
            Registrar visita
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {visitas.length > 0 && (
        <div className={styles.statsContainer}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statIcon}>📋</div>
            <div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total visitas</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statOportunidades}`}>
            <div className={styles.statIcon}>💡</div>
            <div>
              <div className={styles.statValue}>{stats.oportunidades}</div>
              <div className={styles.statLabel}>Oportunidades generadas</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statSinOportunidades}`}>
            <div className={styles.statIcon}>📌</div>
            <div>
              <div className={styles.statValue}>{stats.sinOportunidades}</div>
              <div className={styles.statLabel}>Sin oportunidades</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar - Search & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por cliente, prospecto, objetivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filterContainer}>
          <Filter size={18} className={styles.filterIcon} />
          <select
            value={filterOportunidad}
            onChange={(e) => setFilterOportunidad(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas</option>
            <option value="generada">Con oportunidad</option>
            <option value="no-generada">Sin oportunidad</option>
          </select>
          <ChevronDown size={14} className={styles.filterChevron} />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className={styles.errorContainer}>
          <ErrorMessage 
            message={extractErrorMessage(error)} 
            onRetry={refetch}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size={40} />
          <p>Cargando visitas...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>
              {filteredVisitas.length} visita{filteredVisitas.length !== 1 ? 's' : ''}
              {filterOportunidad !== 'all' && ` · ${filterOportunidad === 'generada' ? 'con oportunidad' : 'sin oportunidad'}`}
              {searchTerm && ` · buscando "${searchTerm}"`}
            </span>
          </div>
          <Table
            columns={[
              { 
                key: 'entidad', 
                header: 'Visitado',
                render: (row) => {
                  const info = getEntidadInfo(row);
                  return (
                    <div className={styles.entidadCell}>
                      <div className={styles.entidadAvatar}>
                        {info.esProspecto ? '👤' : '🏢'}
                      </div>
                      <div>
                        <div className={styles.entidadNombre}>{info.nombre}</div>
                        <div className={styles.entidadTipo}>
                          {info.icon}
                          {info.tipo}
                        </div>
                      </div>
                    </div>
                  );
                }
              },
              { 
                key: 'fecha', 
                header: 'Fecha',
                render: (row) => (
                  <div className={styles.dateCell}>
                    <Calendar size={14} className={styles.dateIcon} />
                    <span>{formatDate(row.fecha)}</span>
                  </div>
                )
              },
              { 
                key: 'objetivo', 
                header: 'Objetivo',
                render: (row) => (
                  <div className={styles.objetivoCell}>
                    <Target size={14} className={styles.objetivoIcon} />
                    <span>{row.objetivo}</span>
                  </div>
                )
              },
              { 
                key: 'necesidadDetectada', 
                header: 'Necesidad',
                render: (row) => row.necesidadDetectada || '—'
              },
              { 
                key: 'competenciaMencionada', 
                header: 'Competencia',
                render: (row) => row.competenciaMencionada || '—'
              },
              {
                key: 'oportunidadGenerada',
                header: 'Oportunidad',
                render: (row) => (
                  <span className={`${styles.oportunidadBadge} ${row.oportunidadGenerada ? styles.oportunidadSi : styles.oportunidadNo}`}>
                    {row.oportunidadGenerada ? (
                      <>
                        <CheckCircle size={14} />
                        Generada
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        No
                      </>
                    )}
                  </span>
                ),
              },
              { 
                key: 'compromiso', 
                header: 'Compromiso',
                render: (row) => (
                  <div className={styles.compromisoCell}>
                    <Clock size={14} className={styles.compromisoIcon} />
                    <span>{row.compromiso || '—'}</span>
                  </div>
                )
              },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <>
                    <button
                      type="button"
                      title="Ver detalle"
                      className={styles.iconBtn}
                      onClick={() => setDetalleVisita(row)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Editar visita"
                      className={styles.iconBtn}
                      onClick={() => {
                        setEditando(row);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                ),
              },
            ]}
            data={filteredVisitas}
            emptyMessage={
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📅</div>
                <h3>No hay visitas registradas</h3>
                <p>Comienza registrando tu primera visita.</p>
                <Button 
                  onClick={abrirNueva}
                  className={styles.emptyBtn}
                >
                  <Plus size={16} />
                  Registrar visita
                </Button>
              </div>
            }
            className={styles.tableModern}
          />
        </div>
      )}

      <VisitaFormModal
        open={formOpen}
        visita={editando}
        onClose={() => setFormOpen(false)}
        onCreate={createVisita}
        onUpdate={updateVisita}
      />

      <VisitaDetalleModal
        open={!!detalleVisita}
        visita={detalleVisita}
        onClose={() => setDetalleVisita(null)}
      />
    </div>
  );
}