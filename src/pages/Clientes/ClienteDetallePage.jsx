import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Plus, 
  UserCog, 
  Send,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  User,
  Users,
  Ticket,
  Briefcase,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit,
  Copy
} from 'lucide-react';
import { useCliente, useUpdateCliente, useReasignarCliente, useTickets, useEnviarTickets } from '../../hooks/useClientes';
import {
  useContactos,
  useCreateContacto,
  useUpdateContacto,
  useDeleteContacto,
} from '../../hooks/useContactos';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuthStore } from '../../store/authStore';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import ClienteFormModal from './ClienteFormModal';
import ContactoFormModal from './ContactoFormModal';
import OportunidadFormModal from '../Oportunidades/OportunidadFormModal';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './ClienteDetallePage.module.css';

export default function ClienteDetallePage() {
  const { id } = useParams();
  const rol = useAuthStore((s) => s.rol);
  const esGerenteOMas = rol === 'ADMIN' || rol === 'GERENTE';

  const clienteQuery = useCliente(id);
  const cliente = clienteQuery.data;

  const [editOpen, setEditOpen] = useState(false);
  const [reasignarOpen, setReasignarOpen] = useState(false);
  const [contactoForm, setContactoForm] = useState({ open: false, data: null });
  const [contactoAEliminar, setContactoAEliminar] = useState(null);
  const [opFormOpen, setOpFormOpen] = useState(false);
  const [ticketsDeshabilitado, setTicketsDeshabilitado] = useState(false);

  const updateCliente = useUpdateCliente();
  const reasignar = useReasignarCliente();
  const contactosQuery = useContactos(id);
  const createContacto = useCreateContacto(id);
  const updateContacto = useUpdateContacto(id);
  const deleteContacto = useDeleteContacto(id);
  const ticketsQuery = useTickets(id);
  const enviarTickets = useEnviarTickets();

  if (clienteQuery.isLoading)
    return (
      <div className={styles.page}>
        <Skeleton width={120} height={20} />
        <Skeleton height={160} radius={12} />
        <Skeleton height={240} radius={12} />
      </div>
    );

  if (clienteQuery.isError)
    return (
      <ErrorMessage
        message={extractErrorMessage(clienteQuery.error)}
        onRetry={() => clienteQuery.refetch()}
      />
    );

  const contactos = contactosQuery.data ?? [];

  const tickets = Array.isArray(ticketsQuery.data)
    ? ticketsQuery.data
    : ticketsQuery.data?.contenido ?? [];

  const handleEnviarTickets = () => {
    enviarTickets.mutate(id, {
      onSuccess: (res) => {
        const n = res?.data?.length ?? res?.data?.contenido?.length ?? 0;
        toast.success(
          n > 0 ? `${n} ticket(s) enviados al sistema de soporte` : 'No hay tickets nuevos por enviar'
        );
      },
      onError: (error) => {
        if (error?.response?.data?.error === 'TICKETS_DESHABILITADO') {
          setTicketsDeshabilitado(true);
          toast.error('La integración de tickets está deshabilitada en el servidor');
        } else {
          toast.error(extractErrorMessage(error));
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <Link to="/clientes" className={styles.back}>
        <ArrowLeft size={16} />
        Volver a clientes
      </Link>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.clienteAvatarLarge}>
              {cliente.nombre?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className={styles.title}>{cliente.nombre}</h1>
              <div className={styles.headerBadges}>
                {cliente.activo ? (
                  <Badge tone="success" className={styles.badge}>
                    <CheckCircle size={12} />
                    Activo
                  </Badge>
                ) : (
                  <Badge tone="danger" className={styles.badge}>
                    <XCircle size={12} />
                    Inactivo
                  </Badge>
                )}
                {cliente.tipo && (
                  <Badge tone="info" className={styles.badge}>
                    {cliente.tipo}
                  </Badge>
                )}
                {cliente.industria && (
                  <Badge tone="secondary" className={styles.badge}>
                    {cliente.industria}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setEditOpen(true)} className={styles.actionBtn}>
              <Edit size={16} />
              Editar
            </Button>
            <Button variant="secondary" onClick={() => setOpFormOpen(true)} className={styles.actionBtn}>
              <Briefcase size={16} />
              Nueva oportunidad
            </Button>
            {esGerenteOMas && (
              <Button onClick={() => setReasignarOpen(true)} className={styles.actionBtn}>
                <UserCog size={16} />
                Reasignar
              </Button>
            )}
          </div>
        </header>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <dt>
              <Mail size={14} />
              Correo principal
            </dt>
            <dd>{cliente.emailPrincipal ?? '—'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <Phone size={14} />
              Teléfono principal
            </dt>
            <dd>{cliente.telefonoPrincipal ?? '—'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <MapPin size={14} />
              Ubicación
            </dt>
            <dd>
              {[cliente.ciudad, cliente.estadoRegion].filter(Boolean).join(', ') || '—'}
            </dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <Globe size={14} />
              Sitio web
            </dt>
            <dd>
              {cliente.sitioWeb ? (
                <a href={cliente.sitioWeb} target="_blank" rel="noopener noreferrer">
                  {cliente.sitioWeb}
                </a>
              ) : '—'}
            </dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <Building2 size={14} />
              Razón social
            </dt>
            <dd>{cliente.razonSocial || '—'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <Copy size={14} />
              RFC
            </dt>
            <dd>{cliente.rfc || '—'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <User size={14} />
              Ejecutivo asignado
            </dt>
            <dd>{cliente.ejecutivoNombre || 'Sin asignar'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>
              <Calendar size={14} />
              Primera compra
            </dt>
            <dd>
              {cliente.fechaPrimeraCompra
                ? new Date(cliente.fechaPrimeraCompra).toLocaleDateString('es-CO')
                : '—'}
            </dd>
          </div>
        </div>

        {cliente.notas && (
          <div className={styles.notasSection}>
            <dt className={styles.notasLabel}>Notas</dt>
            <dd className={styles.notasContent}>{cliente.notas}</dd>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.sectionHeader}>
            <Users size={18} className={styles.sectionIcon} />
            <h2 className={styles.subtitle}>Contactos</h2>
          </div>
          <Button
            variant="secondary"
            onClick={() => setContactoForm({ open: true, data: null })}
            className={styles.addBtn}
          >
            <Plus size={16} />
            Agregar contacto
          </Button>
        </header>

        {contactosQuery.isError ? (
          <ErrorMessage message={extractErrorMessage(contactosQuery.error)} />
        ) : contactosQuery.isLoading ? (
          <Skeleton height={120} radius={8} />
        ) : (
          <Table
            columns={[
              { 
                key: 'nombre', 
                header: 'Nombre',
                render: (row) => (
                  <div className={styles.contactoCell}>
                    <div className={styles.contactoAvatar}>
                      {row.nombre?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <span className={styles.contactoNombre}>{row.nombre}</span>
                      {row.cargo && (
                        <span className={styles.contactoCargo}>{row.cargo}</span>
                      )}
                    </div>
                  </div>
                )
              },
              { 
                key: 'email', 
                header: 'Email',
                render: (row) => (
                  <div className={styles.contactoEmail}>
                    <Mail size={14} />
                    {row.email}
                  </div>
                )
              },
              { 
                key: 'telefono', 
                header: 'Teléfono',
                render: (row) => row.telefono || '—'
              },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      title="Editar"
                      className={styles.iconBtn}
                      onClick={() => setContactoForm({ open: true, data: row })}
                    >
                      <Pencil size={16} />
                    </button>
                    {esGerenteOMas && (
                      <button
                        type="button"
                        title="Eliminar"
                        className={`${styles.iconBtn} ${styles.iconDanger}`}
                        onClick={() => setContactoAEliminar(row)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            data={contactos}
            emptyMessage={
              <div className={styles.emptyContactos}>
                <Users size={32} />
                <p>Sin contactos registrados</p>
                <Button variant="secondary" onClick={() => setContactoForm({ open: true, data: null })}>
                  <Plus size={16} />
                  Agregar contacto
                </Button>
              </div>
            }
          />
        )}
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.sectionHeader}>
            <Ticket size={18} className={styles.sectionIcon} />
            <h2 className={styles.subtitle}>Tickets de soporte</h2>
          </div>
          <Button
            variant="secondary"
            disabled={ticketsDeshabilitado || enviarTickets.isPending}
            title={ticketsDeshabilitado ? 'Integración deshabilitada en el servidor' : undefined}
            onClick={handleEnviarTickets}
            className={styles.sendBtn}
          >
            <Send size={16} />
            Enviar tickets
          </Button>
        </header>

        {ticketsDeshabilitado && (
          <p className={styles.note}>
            La integración con el sistema de tickets está deshabilitada en el servidor.
          </p>
        )}

        {ticketsQuery.isError ? (
          <ErrorMessage message={extractErrorMessage(ticketsQuery.error)} />
        ) : ticketsQuery.isLoading ? (
          <Skeleton height={80} radius={8} />
        ) : tickets.length === 0 ? (
          <p className={styles.emptyMessage}>Sin tickets registrados para este cliente.</p>
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'asunto', header: 'Asunto' },
              { 
                key: 'estado', 
                header: 'Estado',
                render: (row) => (
                  <Badge tone={row.estado === 'ABIERTO' ? 'warning' : 'success'}>
                    {row.estado || 'Pendiente'}
                  </Badge>
                )
              },
              {
                key: 'fecha',
                header: 'Fecha',
                render: (row) =>
                  row.fecha || row.createdAt
                    ? new Date(row.fecha ?? row.createdAt).toLocaleDateString('es-CO')
                    : '—',
              },
            ]}
            data={tickets}
            emptyMessage="Sin tickets"
          />
        )}
      </section>

      {/* Modales */}
      <ClienteFormModal
        open={editOpen}
        cliente={cliente}
        onClose={() => setEditOpen(false)}
        onCreate={() => {}}
        onUpdate={updateCliente}
      />

      <ReasignarModal
        open={reasignarOpen}
        cliente={cliente}
        loading={reasignar.isPending}
        error={reasignar.isError ? extractErrorMessage(reasignar.error) : null}
        onClose={() => setReasignarOpen(false)}
        onSubmit={(usuarioId) =>
          reasignar.mutate(
            { id: cliente.id, nuevoEjecutivoId: Number(usuarioId) },
            {
              onSuccess: () => {
                toast.success('Ejecutivo reasignado');
                setReasignarOpen(false);
              },
              onError: (error) => toast.error(extractErrorMessage(error)),
            }
          )
        }
      />

      <ContactoFormModal
        open={contactoForm.open}
        clienteId={id}
        contacto={contactoForm.data}
        onClose={() => setContactoForm({ open: false, data: null })}
        onCreate={createContacto}
        onUpdate={updateContacto}
      />

      <OportunidadFormModal
        open={opFormOpen}
        clientePreseleccionado={cliente}
        onClose={() => setOpFormOpen(false)}
      />

      <Modal
        open={!!contactoAEliminar}
        title="Eliminar contacto"
        onClose={() => setContactoAEliminar(null)}
      >
        <div className={styles.deleteModalContent}>
          <p>
            ¿Eliminar a <strong>{contactoAEliminar?.nombre}</strong> de los contactos?
          </p>
          <div className={styles.deleteActions}>
            <Button variant="secondary" onClick={() => setContactoAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteContacto.isPending}
              onClick={() =>
                deleteContacto.mutate(contactoAEliminar.id, {
                  onSuccess: () => {
                    toast.success('Contacto eliminado');
                    setContactoAEliminar(null);
                  },
                  onError: (error) => toast.error(extractErrorMessage(error)),
                })
              }
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

function ReasignarModal({ open, cliente, loading, error, onClose, onSubmit }) {
  const usuariosQuery = useUsuarios();
  const usuarios = (usuariosQuery.data ?? []).filter(
    (u) => u.rol === 'EJECUTIVO' && u.activo !== false
  );
  const sinAcceso = !!usuariosQuery.isError;

  return (
    <Modal open={open} title="Reasignar ejecutivo" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get('usuarioId');
          if (value) onSubmit(value);
        }}
        noValidate
        className={styles.reasignarForm}
      >
        <p className={styles.reasignarDesc}>
          Selecciona el nuevo ejecutivo para <strong>{cliente?.nombre}</strong>.
        </p>

        {!sinAcceso ? (
          usuariosQuery.isLoading ? (
            <Skeleton height={38} />
          ) : (
            <Select label="Nuevo ejecutivo" name="usuarioId" required defaultValue="">
              <option value="" disabled>
                Selecciona un ejecutivo
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido ?? ''} ({u.email})
                </option>
              ))}
            </Select>
          )
        ) : (
          <Input
            label="ID del usuario ejecutivo"
            name="usuarioId"
            type="number"
            min="1"
            required
            placeholder="Ej. 4"
          />
        )}

        {sinAcceso && (
          <p className={styles.note}>
            No se pudo listar los usuarios (requiere permisos). Ingresa el ID manualmente.
          </p>
        )}
        {error && <ErrorMessage message={error} />}

        <div className={styles.reasignarActions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            <UserCog size={16} />
            Reasignar
          </Button>
        </div>
      </form>
    </Modal>
  );
}