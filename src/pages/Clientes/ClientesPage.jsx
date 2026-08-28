import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Users, 
  Building2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
} from '../../hooks/useClientes';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import ClienteFormModal from './ClienteFormModal';
import styles from './ClientesPage.module.css';

export default function ClientesPage() {
  const rol = useAuthStore((s) => s.rol);
  const puedeEliminar = rol === 'ADMIN' || rol === 'GERENTE';
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const { data, isLoading, isError, error, refetch } = useClientes({
    busqueda: busqueda || undefined,
    page: pagina,
  });
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();

  const contenido = data?.contenido ?? data ?? [];
  const totalClientes = data?.totalElements ?? contenido.length;

  const abrirNuevo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEdicion = (cliente) => {
    setEditando(cliente);
    setFormOpen(true);
  };

  const confirmarEliminar = () => {
    deleteCliente.mutate(aEliminar.id, {
      onSuccess: () => {
        toast.success('Cliente desactivado');
        setAEliminar(null);
      },
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setPagina(0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Building2 size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Clientes</h1>
            <p className={styles.subtitle}>
              Gestiona la cartera de clientes del CRM
            </p>
          </div>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.statsBadge}>
            <Users size={14} />
            {totalClientes} clientes
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Buscar por nombre, RFC, email..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
          />
          {busqueda && (
            <button className={styles.clearSearch} onClick={limpiarBusqueda}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className={styles.toolbarActions}>
          <Button onClick={abrirNuevo} className={styles.newButton}>
            <Plus size={16} />
            Nuevo cliente
          </Button>
        </div>
      </div>

      {isError && (
        <ErrorMessage message={extractErrorMessage(error)} onRetry={refetch} />
      )}

      {isLoading ? (
        <div className={styles.skeletons}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={48} radius={8} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <Table
              columns={[
                {
                  key: 'nombre',
                  header: 'Cliente',
                  render: (row) => (
                    <Link to={`/clientes/${row.id}`} className={styles.clienteLink}>
                      <div className={styles.clienteCell}>
                        <div className={styles.clienteAvatar}>
                          {row.nombre?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <span className={styles.clienteNombre}>{row.nombre}</span>
                          {row.razonSocial && (
                            <span className={styles.clienteRazon}>{row.razonSocial}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ),
                },
                { 
                  key: 'rfc', 
                  header: 'RFC',
                  render: (row) => row.rfc || '—'
                },
                { 
                  key: 'emailPrincipal', 
                  header: 'Email',
                  render: (row) => (
                    row.emailPrincipal ? (
                      <div className={styles.emailCell}>
                        <Mail size={14} />
                        {row.emailPrincipal}
                      </div>
                    ) : '—'
                  )
                },
                { 
                  key: 'telefonoPrincipal', 
                  header: 'Teléfono',
                  render: (row) => (
                    row.telefonoPrincipal ? (
                      <div className={styles.phoneCell}>
                        <Phone size={14} />
                        {row.telefonoPrincipal}
                      </div>
                    ) : '—'
                  )
                },
                { 
                  key: 'ciudad', 
                  header: 'Ubicación',
                  render: (row) => (
                    row.ciudad ? (
                      <div className={styles.cityCell}>
                        <MapPin size={14} />
                        {row.ciudad}
                      </div>
                    ) : '—'
                  )
                },
                {
                  key: 'activo',
                  header: 'Estado',
                  render: (row) =>
                    row.activo ? (
                      <Badge tone="success" className={styles.statusBadge}>
                        <CheckCircle size={12} />
                        Activo
                      </Badge>
                    ) : (
                      <Badge tone="danger" className={styles.statusBadge}>
                        <XCircle size={12} />
                        Inactivo
                      </Badge>
                    ),
                },
                {
                  key: 'acciones',
                  header: '',
                  className: styles.actionsColumn,
                  render: (row) => (
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        title="Editar cliente"
                        className={styles.iconBtn}
                        onClick={() => abrirEdicion(row)}
                      >
                        <Pencil size={16} />
                      </button>
                      {puedeEliminar && (
                        <button
                          type="button"
                          title="Desactivar cliente"
                          className={`${styles.iconBtn} ${styles.iconDanger}`}
                          disabled={!row.activo || deleteCliente.isPending}
                          onClick={() => setAEliminar(row)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
              data={contenido}
              className={styles.table}
              emptyMessage={
                <div className={styles.emptyState}>
                  <Building2 size={48} />
                  <p>No hay clientes registrados</p>
                  <Button variant="secondary" onClick={abrirNuevo}>
                    <Plus size={16} />
                    Crear primer cliente
                  </Button>
                </div>
              }
            />
          </div>

          {data?.totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Mostrando {pagina * (data?.size || 10) + 1} -{' '}
                {Math.min((pagina + 1) * (data?.size || 10), totalClientes)} de {totalClientes}
              </div>
              <div className={styles.paginationControls}>
                <Button
                  variant="secondary"
                  disabled={pagina === 0}
                  onClick={() => setPagina((p) => p - 1)}
                  className={styles.paginationBtn}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
                <span className={styles.paginationPage}>
                  Página {pagina + 1} de {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={pagina >= data.totalPages - 1}
                  onClick={() => setPagina((p) => p + 1)}
                  className={styles.paginationBtn}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ClienteFormModal
        open={formOpen}
        cliente={editando}
        onClose={() => setFormOpen(false)}
        onCreate={createCliente}
        onUpdate={updateCliente}
      />

      <Modal
        open={!!aEliminar}
        title="Desactivar cliente"
        onClose={() => setAEliminar(null)}
        className={styles.deleteModal}
      >
        <div className={styles.deleteContent}>
          <div className={styles.deleteIcon}>
            <Trash2 size={32} />
          </div>
          <h3>¿Desactivar cliente?</h3>
          <p>
            ¿Seguro que deseas desactivar a{' '}
            <strong>{aEliminar?.nombre}</strong>? 
            Esta acción es un borrado lógico y puede ser revertida.
          </p>
          {deleteCliente.isError && (
            <ErrorMessage message={extractErrorMessage(deleteCliente.error)} />
          )}
          <div className={styles.deleteActions}>
            <Button variant="secondary" onClick={() => setAEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deleteCliente.isPending} onClick={confirmarEliminar}>
              <Trash2 size={16} />
              Desactivar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}