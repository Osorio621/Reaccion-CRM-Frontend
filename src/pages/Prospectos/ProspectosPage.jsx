import { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  ArrowRightCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Target
} from 'lucide-react';
import {
  useProspectos,
  useCreateProspecto,
  useUpdateProspecto,
  useDeleteProspecto,
  useConvertirProspecto,
} from '../../hooks/useProspectos';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import { useAuthStore } from '../../store/authStore';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import ProspectoFormModal from './ProspectoFormModal';
import styles from './ProspectosPage.module.css';

function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return isNaN(d) ? '' : d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProspectosPage() {
  const rol = useAuthStore((s) => s.rol);
  const puedeEliminar = rol === 'ADMIN' || rol === 'GERENTE';
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aConvertir, setAConvertir] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useProspectos();
  const createProspecto = useCreateProspecto();
  const updateProspecto = useUpdateProspecto();
  const deleteProspecto = useDeleteProspecto();
  const convertir = useConvertirProspecto();

  const etapas = useCatalogosPorTipo('ETAPA_PROSPECTO');
  const listaEtapas = Array.isArray(etapas.data) ? etapas.data : [];
  const etapaPorId = Object.fromEntries(listaEtapas.map((c) => [c.id, c.nombre]));

  const contenido = data?.contenido ?? (Array.isArray(data) ? data : []);

  const nombreMostrado = (p) => p.nombre ?? p.empresa ?? `Prospecto #${p.id}`;

  const abrirNuevo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEdicion = (prospecto) => {
    setEditando(prospecto);
    setFormOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtrar prospectos
  const filteredProspectos = contenido.filter(prospecto => {
    const nombre = prospecto.nombre?.toLowerCase() || '';
    const empresa = prospecto.empresa?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = 
      nombre.includes(search) ||
      empresa.includes(search) ||
      prospecto.telefono?.includes(search) ||
      prospecto.email?.toLowerCase().includes(search);
    
    const matchesFilter = 
      filterEstado === 'all' ? true :
      filterEstado === 'convertido' ? prospecto.convertido :
      filterEstado === 'vencido' ? prospecto.accionVencida && !prospecto.convertido :
      filterEstado === 'activo' ? !prospecto.convertido && !prospecto.accionVencida : true;
    
    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const getStats = () => {
    const total = contenido.length;
    const convertidos = contenido.filter(p => p.convertido).length;
    const vencidos = contenido.filter(p => p.accionVencida && !p.convertido).length;
    const activos = total - convertidos - vencidos;
    return { total, convertidos, vencidos, activos };
  };

  const stats = getStats();

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Users size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Prospectos</h1>
            <p className={styles.pageSubtitle}>
              {contenido.length > 0 
                ? `${contenido.length} prospecto${contenido.length !== 1 ? 's' : ''} en seguimiento`
                : 'No hay prospectos registrados'
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
            onClick={abrirNuevo}
            className={styles.primaryBtn}
          >
            <Plus size={18} />
            Nuevo prospecto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {contenido.length > 0 && (
        <div className={styles.statsContainer}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statIcon}>📊</div>
            <div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total prospectos</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statActivos}`}>
            <div className={styles.statIcon}>🟢</div>
            <div>
              <div className={styles.statValue}>{stats.activos}</div>
              <div className={styles.statLabel}>Activos</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statVencidos}`}>
            <div className={styles.statIcon}>🔴</div>
            <div>
              <div className={styles.statValue}>{stats.vencidos}</div>
              <div className={styles.statLabel}>Vencidos</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statConvertidos}`}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <div className={styles.statValue}>{stats.convertidos}</div>
              <div className={styles.statLabel}>Convertidos</div>
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
            placeholder="Buscar por nombre, empresa, teléfono o email..."
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
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos</option>
            <option value="activo">Activos</option>
            <option value="vencido">Vencidos</option>
            <option value="convertido">Convertidos</option>
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
          <p>Cargando prospectos...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>
              {filteredProspectos.length} prospecto{filteredProspectos.length !== 1 ? 's' : ''}
              {filterEstado !== 'all' && ` · ${filterEstado === 'activo' ? 'activos' : filterEstado === 'vencido' ? 'vencidos' : 'convertidos'}`}
              {searchTerm && ` · buscando "${searchTerm}"`}
            </span>
          </div>
          <Table
            columns={[
              // ===== COLUMNA PROSPECTO CORREGIDA - SIN AVATAR =====
              { 
                key: 'nombre', 
                header: 'Prospecto',
                render: (row) => {
                  const empresa = row.empresa || 'Sin empresa';
                  const nombreContacto = row.nombre || '';
                  
                  return (
                    <div className={styles.prospectoCell}>
                      <div className={styles.prospectoInfo}>
                        <div className={styles.prospectoEmpresaPrincipal}>
                          <Building2 size={14} />
                          <span>{empresa}</span>
                        </div>
                        {nombreContacto && (
                          <div className={styles.prospectoContacto}>
                            {nombreContacto}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              },
              {
                key: 'etapa',
                header: 'Etapa',
                render: (row) => (
                  <Badge 
                    tone={row.convertido ? 'info' : 'neutral'}
                    className={styles.etapaBadge}
                  >
                    {etapaPorId[row.etapaId] ?? '—'}
                  </Badge>
                ),
              },
              {
                key: 'proximaAccion',
                header: 'Próxima acción',
                render: (row) => (
                  <div className={styles.accionCell}>
                    {row.proximaAccion ? (
                      <>
                        <Target size={14} className={styles.accionIcon} />
                        <div className={styles.accionContent}>
                          <span className={styles.accionTexto}>{row.proximaAccion}</span>
                          {row.fechaProximaAccion && (
                            <span className={styles.accionFecha}>
                              <Calendar size={12} />
                              {formatearFecha(row.fechaProximaAccion)}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className={styles.sinAccion}>—</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (row) => {
                  if (row.convertido) {
                    return (
                      <span className={`${styles.estadoBadge} ${styles.estadoConvertido}`}>
                        <CheckCircle size={14} />
                        Convertido
                      </span>
                    );
                  }
                  if (row.accionVencida) {
                    return (
                      <span className={`${styles.estadoBadge} ${styles.estadoVencido}`}>
                        <AlertCircle size={14} />
                        Vencido
                      </span>
                    );
                  }
                  return (
                    <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>
                      <Clock size={14} />
                      Al día
                    </span>
                  );
                },
              },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <div className={styles.actions}>
                    {!row.convertido && (
                      <>
                        <button
                          type="button"
                          title="Editar prospecto"
                          className={styles.iconBtn}
                          onClick={() => abrirEdicion(row)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Convertir a cliente"
                          className={`${styles.iconBtn} ${styles.iconSuccess}`}
                          onClick={() => setAConvertir(row)}
                        >
                          <ArrowRightCircle size={16} />
                        </button>
                        {puedeEliminar && (
                          <button
                            type="button"
                            title="Eliminar prospecto"
                            className={`${styles.iconBtn} ${styles.iconDanger}`}
                            disabled={deleteProspecto.isPending}
                            onClick={() => setAEliminar(row)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                    {row.convertido && (
                      <span className={styles.convertidoLabel}>✅ Convertido</span>
                    )}
                  </div>
                ),
              },
            ]}
            data={filteredProspectos}
            emptyMessage={
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👤</div>
                <h3>No hay prospectos</h3>
                <p>Comienza registrando tu primer prospecto.</p>
                <Button 
                  onClick={abrirNuevo}
                  className={styles.emptyBtn}
                >
                  <Plus size={16} />
                  Nuevo prospecto
                </Button>
              </div>
            }
            className={styles.tableModern}
          />
        </div>
      )}

      <ProspectoFormModal
        open={formOpen}
        prospecto={editando}
        onClose={() => setFormOpen(false)}
        onCreate={createProspecto}
        onUpdate={updateProspecto}
      />

      {/* Modal Convertir */}
      <Modal
        open={!!aConvertir}
        title="🔄 Convertir a cliente"
        onClose={() => setAConvertir(null)}
        className={styles.modalContent}
      >
        <div className={styles.modalBody}>
          <div className={styles.modalIcon}>
            <ArrowRightCircle size={48} className={styles.modalIconConvert} />
          </div>
          <h3 className={styles.modalTitle}>¿Convertir prospecto?</h3>
          <p className={styles.modalMessage}>
            Estás a punto de convertir a <strong>{aConvertir && nombreMostrado(aConvertir)}</strong> en cliente.
            <br />
            <span className={styles.modalNote}>
              Se creará el registro de cliente y el prospecto quedará marcado como convertido.
            </span>
          </p>
          {convertir.isError && (
            <ErrorMessage message={extractErrorMessage(convertir.error)} />
          )}
          <div className={styles.modalActions}>
            <Button 
              variant="secondary" 
              onClick={() => setAConvertir(null)}
              className={styles.modalCancelBtn}
            >
              Cancelar
            </Button>
            <Button
              loading={convertir.isPending}
              onClick={() =>
                convertir.mutate(aConvertir.id, {
                  onSuccess: () => {
                    toast.success('✅ Prospecto convertido a cliente');
                    setAConvertir(null);
                  },
                  onError: (error) => toast.error(extractErrorMessage(error)),
                })
              }
              className={styles.modalConfirmConvert}
            >
              <ArrowRightCircle size={18} />
              Convertir a cliente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        open={!!aEliminar}
        title="🗑️ Eliminar prospecto"
        onClose={() => setAEliminar(null)}
        className={styles.modalContent}
      >
        <div className={styles.modalBody}>
          <div className={styles.modalIcon}>
            <Trash2 size={48} className={styles.modalIconDelete} />
          </div>
          <h3 className={styles.modalTitle}>¿Eliminar prospecto?</h3>
          <p className={styles.modalMessage}>
            ¿Seguro que deseas eliminar a <strong>{aEliminar && nombreMostrado(aEliminar)}</strong>?
            <br />
            <span className={styles.modalNote}>
              Esta acción no se puede deshacer.
            </span>
          </p>
          {deleteProspecto.isError && (
            <ErrorMessage message={extractErrorMessage(deleteProspecto.error)} />
          )}
          <div className={styles.modalActions}>
            <Button 
              variant="secondary" 
              onClick={() => setAEliminar(null)}
              className={styles.modalCancelBtn}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteProspecto.isPending}
              onClick={() =>
                deleteProspecto.mutate(aEliminar.id, {
                  onSuccess: () => {
                    toast.success('🗑️ Prospecto eliminado');
                    setAEliminar(null);
                  },
                  onError: (error) => toast.error(extractErrorMessage(error)),
                })
              }
              className={styles.modalConfirmDelete}
            >
              <Trash2 size={18} />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}