import { useState } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Mail, 
  Send, 
  Users, 
  MapPin, 
  MessageCircle, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  UserCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  useComunicaciones, 
  useCreateComunicacion, 
  useUpdateComunicacion, 
  useDeleteComunicacion 
} from '../../hooks/useComunicaciones';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Modal from './Modal';
import Badge from './Badge';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './HistorialComunicacionesSection.module.css';

const TIPO_FALLBACKS = [
  { codigo: 'COM_LLAMADA_SALIENTE', nombre: 'Llamada saliente', icon: PhoneOutgoing },
  { codigo: 'COM_LLAMADA_ENTRANTE', nombre: 'Llamada entrante', icon: PhoneIncoming },
  { codigo: 'COM_EMAIL_ENVIADO', nombre: 'Email enviado', icon: Send },
  { codigo: 'COM_EMAIL_RECIBIDO', nombre: 'Email recibido', icon: Mail },
  { codigo: 'COM_REUNION', nombre: 'Reunión', icon: Users },
  { codigo: 'COM_WHATSAPP', nombre: 'WhatsApp', icon: MessageSquare },
  { codigo: 'COM_VISITA', nombre: 'Visita', icon: MapPin },
  { codigo: 'COM_OTRO', nombre: 'Otro', icon: MessageCircle },
];

function getTipoMeta(codigo, catalogoList = []) {
  const itemCatalog = catalogoList.find((c) => c.codigo === codigo || c.nombre === codigo);
  const fallback = TIPO_FALLBACKS.find((f) => f.codigo === codigo) || {
    nombre: itemCatalog?.nombre || codigo,
    icon: MessageSquare,
  };
  return {
    nombre: itemCatalog?.nombre || fallback.nombre,
    icon: fallback.icon || MessageSquare,
  };
}

export default function HistorialComunicacionesSection({ tipo, entidadId, titulo = 'Historial de comunicaciones' }) {
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { data: comunicacionesRaw, isLoading, isError, error, refetch } = useComunicaciones(tipo, entidadId);
  const catalogQuery = useCatalogosPorTipo('TIPO_COMUNICACION');
  const catalogList = Array.isArray(catalogQuery.data) ? catalogQuery.data : [];

  const createMutation = useCreateComunicacion(tipo, entidadId);
  const updateMutation = useUpdateComunicacion(tipo, entidadId);
  const deleteMutation = useDeleteComunicacion(tipo, entidadId);

  const comunicaciones = Array.isArray(comunicacionesRaw)
    ? comunicacionesRaw
    : comunicacionesRaw?.contenido ?? [];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalFormOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        toast.success('🗑️ Comunicación eliminada');
        setItemToDelete(null);
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err));
      },
    });
  };

  return (
    <div className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <MessageSquare size={18} />
          </div>
          <h3 className={styles.title}>{titulo}</h3>
          {comunicaciones.length > 0 && (
            <Badge tone="info">{comunicaciones.length}</Badge>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={handleOpenCreate}>
          <Plus size={16} />
          Registrar interacción
        </Button>
      </header>

      {/* Carga y errores */}
      {isLoading && (
        <div className={styles.emptyState}>
          <Spinner size={24} />
          <p>Cargando historial de comunicaciones...</p>
        </div>
      )}

      {isError && (
        <ErrorMessage message={extractErrorMessage(error)} onRetry={refetch} />
      )}

      {/* Sin registros */}
      {!isLoading && !isError && comunicaciones.length === 0 && (
        <div className={styles.emptyState}>
          <MessageSquare size={32} />
          <p>Sin comunicaciones registradas.</p>
          <Button variant="secondary" size="sm" onClick={handleOpenCreate}>
            <Plus size={16} />
            Registrar primera interacción
          </Button>
        </div>
      )}

      {/* Timeline de comunicaciones */}
      {!isLoading && !isError && comunicaciones.length > 0 && (
        <div className={styles.timeline}>
          {comunicaciones.map((com) => {
            const meta = getTipoMeta(com.tipo, catalogList);
            const MetaIcon = meta.icon;
            const fechaFmt = com.fecha
              ? new Date(com.fecha).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';

            return (
              <div key={com.id} className={styles.timelineItem}>
                <div className={styles.timelineItemIcon}>
                  <MetaIcon size={18} />
                </div>

                <div className={styles.timelineCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.tipoBadge}>
                      <Badge tone="info">{meta.nombre}</Badge>
                    </span>
                    <span className={styles.fechaText}>{fechaFmt}</span>
                  </div>

                  {com.descripcion && (
                    <div className={styles.descripcion}>{com.descripcion}</div>
                  )}

                  {com.resultado && (
                    <div className={styles.resultadoBox}>
                      <span className={styles.resultadoLabel}>Resultado:</span>
                      <span>{com.resultado}</span>
                    </div>
                  )}

                  <div className={styles.ejecutivoMeta}>
                    <span>
                      Registrado por: <strong>{com.ejecutivoNombre || `Ejecutivo #${com.ejecutivoId || '—'}`}</strong>
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Editar interacción"
                        onClick={() => handleOpenEdit(com)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconDanger}`}
                        title="Eliminar interacción"
                        onClick={() => setItemToDelete(com)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulario Crear/Editar */}
      <ComunicacionFormModal
        open={modalFormOpen}
        comunicacion={editingItem}
        catalogList={catalogList}
        onClose={() => setModalFormOpen(false)}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate(
              { id: editingItem.id, data },
              {
                onSuccess: () => {
                  toast.success('✅ Interacción actualizada');
                  setModalFormOpen(false);
                },
                onError: (err) => toast.error(extractErrorMessage(err)),
              }
            );
          } else {
            createMutation.mutate(data, {
              onSuccess: () => {
                toast.success('✅ Interacción registrada');
                setModalFormOpen(false);
              },
              onError: (err) => toast.error(extractErrorMessage(err)),
            });
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal Eliminar */}
      <Modal
        open={!!itemToDelete}
        title="🗑️ Eliminar comunicación"
        onClose={() => setItemToDelete(null)}
      >
        <div className={styles.deleteModal}>
          <p>¿Seguro que deseas eliminar esta interacción registrada?</p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
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

function ComunicacionFormModal({ open, comunicacion, catalogList = [], onClose, onSubmit, isSubmitting }) {
  const isEdit = !!comunicacion;

  // Form local state
  const [tipo, setTipo] = useState('COM_LLAMADA_SALIENTE');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [resultado, setResultado] = useState('');

  // Sincronizar estado al abrir
  const handleOpenInit = () => {
    if (comunicacion) {
      setTipo(comunicacion.tipo || 'COM_LLAMADA_SALIENTE');
      if (comunicacion.fecha) {
        // Formatear ISO a "YYYY-MM-DDTHH:mm" para <input type="datetime-local" />
        const d = new Date(comunicacion.fecha);
        const iso = d.toISOString().slice(0, 16);
        setFecha(iso);
      } else {
        setFecha(new Date().toISOString().slice(0, 16));
      }
      setDescripcion(comunicacion.descripcion || '');
      setResultado(comunicacion.resultado || '');
    } else {
      setTipo('COM_LLAMADA_SALIENTE');
      const now = new Date();
      // Formatear la fecha local actual para datetime-local
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setFecha(localISOTime);
      setDescripcion('');
      setResultado('');
    }
  };

  const options = catalogList.length > 0 
    ? catalogList.map((c) => ({ value: c.codigo || c.nombre, label: c.nombre }))
    : TIPO_FALLBACKS.map((f) => ({ value: f.codigo, label: f.nombre }));

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!tipo) {
      toast.warning('Selecciona el tipo de comunicación');
      return;
    }
    if (!fecha) {
      toast.warning('Selecciona la fecha y hora');
      return;
    }

    onSubmit({
      tipo,
      fecha: new Date(fecha).toISOString().slice(0, 19), // ISO 8601 LocalDateTime
      descripcion: descripcion.trim() || null,
      resultado: resultado.trim().slice(0, 300) || null,
    });
  };

  return (
    <Modal
      open={open}
      title={isEdit ? '✏️ Editar comunicación' : '📞 Registrar comunicación'}
      onClose={onClose}
    >
      <div onAnimationStart={handleOpenInit}>
        <form onSubmit={handleSubmitForm} className={styles.formGrid}>
          <div className={styles.formRow}>
            <Select
              label="Tipo de comunicación"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Input
              label="Fecha y hora"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <Input
            label="Detalle / Descripción"
            placeholder="Describe lo conversado en la interacción..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            multiline
            rows={3}
          />

          <Input
            label="Resultado / Conclusión (máx 300 chars)"
            placeholder="Ej. Cliente solicitó cotización enviada por email..."
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            maxLength={300}
          />

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <CheckCircle size={16} />
              {isEdit ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
