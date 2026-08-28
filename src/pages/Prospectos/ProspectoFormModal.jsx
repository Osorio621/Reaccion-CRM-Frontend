import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  CheckCircle,
  User,
  Building2,
  Globe,
  Mail,
  Phone,
  Factory,
  Users,
  MapPin,
  Target,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import styles from './ProspectoFormModal.module.css';

const telefonoRegex = /^\+?[0-9\s\-()]{7,20}$/;

const prospectoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  empresa: z.string().trim().max(120).optional().or(z.literal('')),
  sitioWeb: z.string().trim().max(200).optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(120)
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .trim()
    .regex(telefonoRegex, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  industriaId: z.string().optional(),
  tipoId: z.string().optional(),
  zonaId: z.string().optional(),
  etapaId: z.string().min(1, 'La etapa es obligatoria'),
  proximaAccion: z
    .string()
    .trim()
    .min(1, 'La próxima acción es obligatoria')
    .max(200),
  fechaProximaAccion: z
    .string()
    .min(1, 'La fecha de la próxima acción es obligatoria'),
  notas: z.string().max(1000).optional().or(z.literal('')),
});

const valoresVacios = {
  nombre: '',
  empresa: '',
  sitioWeb: '',
  email: '',
  telefono: '',
  industriaId: '',
  tipoId: '',
  zonaId: '',
  etapaId: '',
  proximaAccion: '',
  fechaProximaAccion: '',
  notas: '',
};

export default function ProspectoFormModal({ open, prospecto, onClose, onCreate, onUpdate }) {
  const isEdit = !!prospecto;
  const etapas = useCatalogosPorTipo('ETAPA_PROSPECTO', open);
  const industrias = useCatalogosPorTipo('INDUSTRIA', open);
  const tiposCliente = useCatalogosPorTipo('TIPO_CLIENTE', open);
  const zonas = useCatalogosPorTipo('ZONA_GEOGRAFICA', open);

  const listaEtapas = Array.isArray(etapas.data) ? etapas.data : [];
  const listaIndustrias = Array.isArray(industrias.data) ? industrias.data : [];
  const listaTipos = Array.isArray(tiposCliente.data) ? tiposCliente.data : [];
  const listaZonas = Array.isArray(zonas.data) ? zonas.data : [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(prospectoSchema),
    defaultValues: valoresVacios,
    mode: 'onChange',
  });

  const nombre = watch('nombre');
  const empresa = watch('empresa');

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      reset({
        ...valoresVacios,
        nombre: prospecto.nombre ?? '',
        empresa: prospecto.empresa ?? '',
        sitioWeb: prospecto.sitioWeb ?? '',
        email: prospecto.email ?? '',
        telefono: prospecto.telefono ?? '',
        industriaId: prospecto.industriaId ? String(prospecto.industriaId) : '',
        tipoId: prospecto.tipoId ? String(prospecto.tipoId) : '',
        zonaId: prospecto.zonaId ? String(prospecto.zonaId) : '',
        etapaId: prospecto.etapaId ? String(prospecto.etapaId) : '',
        proximaAccion: prospecto.proximaAccion ?? '',
        fechaProximaAccion: prospecto.fechaProximaAccion?.slice(0, 10) ?? '',
        notas: prospecto.notas ?? '',
      });
    } else {
      reset(valoresVacios);
    }
  }, [open, prospecto, isEdit, reset]);

  const onSubmit = async (data) => {
    const payload = {
      nombre: data.nombre,
      empresa: data.empresa || undefined,
      sitioWeb: data.sitioWeb || undefined,
      email: data.email || undefined,
      telefono: data.telefono || undefined,
      industriaId: data.industriaId ? Number(data.industriaId) : undefined,
      tipoId: data.tipoId ? Number(data.tipoId) : undefined,
      zonaId: data.zonaId ? Number(data.zonaId) : undefined,
      etapaId: Number(data.etapaId),
      proximaAccion: data.proximaAccion,
      fechaProximaAccion: data.fechaProximaAccion,
      notas: data.notas || undefined,
    };
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { id: prospecto.id, data: payload } : payload);
      toast.success(isEdit ? '✅ Prospecto actualizado correctamente' : '✅ Prospecto creado correctamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    if (nombre) return nombre.charAt(0).toUpperCase();
    if (empresa) return empresa.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <Modal
      open={open}
      title={isEdit ? '✏️ Editar prospecto' : '👤 Nuevo prospecto'}
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderLeft}>
          <div className={styles.modalAvatar}>
            <span className={styles.modalAvatarText}>{getInitial()}</span>
          </div>
          <div>
            <div className={styles.modalSubtitle}>
              {isEdit
                ? `Editando "${prospecto?.nombre || 'prospecto'}"`
                : 'Completa los datos del nuevo prospecto'
              }
            </div>
          </div>
        </div>
        {isEdit && (
          <div className={styles.editBadge}>
            <span className={styles.editBadgeDot} />
            Modo edición
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        {/* Sección: Información del prospecto */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            <span>Información del prospecto</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Nombre del prospecto *"
                placeholder="Ej: Juan Pérez"
                error={errors.nombre?.message}
                icon={<User size={18} />}
                className={styles.inputModern}
                {...register('nombre')}
              />
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Empresa"
                placeholder="Ej: Tecnología SAS"
                error={errors.empresa?.message}
                icon={<Building2 size={18} />}
                className={styles.inputModern}
                {...register('empresa')}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="contacto@empresa.com"
                error={errors.email?.message}
                icon={<Mail size={18} />}
                className={styles.inputModern}
                {...register('email')}
              />
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Teléfono"
                placeholder="+56 9 1234 5678"
                error={errors.telefono?.message}
                icon={<Phone size={18} />}
                className={styles.inputModern}
                {...register('telefono')}
              />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <Input
              label="Sitio web"
              placeholder="https://www.empresa.com"
              error={errors.sitioWeb?.message}
              icon={<Globe size={18} />}
              className={styles.inputModern}
              {...register('sitioWeb')}
            />
          </div>
        </div>

        {/* Sección: Clasificación */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏷️</span>
            <span>Clasificación</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Select
                label="Industria"
                error={errors.industriaId?.message}
                className={styles.selectModern}
                icon={<Factory size={18} />}
                {...register('industriaId')}
              >
                <option value="">— Sin especificar —</option>
                {listaIndustrias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.inputWrapper}>
              <Select
                label="Tipo de cliente"
                error={errors.tipoId?.message}
                className={styles.selectModern}
                icon={<Users size={18} />}
                {...register('tipoId')}
              >
                <option value="">— Sin especificar —</option>
                {listaTipos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <Select
              label="Zona geográfica"
              error={errors.zonaId?.message}
              className={styles.selectModern}
              icon={<MapPin size={18} />}
              {...register('zonaId')}
            >
              <option value="">— Sin especificar —</option>
              {listaZonas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Sección: Seguimiento */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            <span>Seguimiento</span>
          </div>

          <div className={styles.inputWrapper}>
            <Select
              label="Etapa *"
              error={errors.etapaId?.message}
              className={styles.selectModern}
              icon={<TrendingUp size={18} />}
              {...register('etapaId')}
            >
              <option value="">— Selecciona una etapa —</option>
              {listaEtapas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
            {!etapas.isLoading && !etapas.isError && listaEtapas.length === 0 && (
              <div className={styles.warningMessage}>
                <AlertCircle size={14} />
                <span>No hay etapas configuradas. Un administrador debe crearlas en Admin → Catálogos.</span>
              </div>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Fecha de próxima acción *"
                type="date"
                error={errors.fechaProximaAccion?.message}
                icon={<Calendar size={18} />}
                className={styles.inputModern}
                {...register('fechaProximaAccion')}
              />
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Próxima acción *"
                placeholder="Ej: Llamada de seguimiento"
                error={errors.proximaAccion?.message}
                icon={<Clock size={18} />}
                className={styles.inputModern}
                {...register('proximaAccion')}
              />
            </div>
          </div>
        </div>

        {/* Sección: Notas */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            <span>Información adicional</span>
          </div>

          <div className={styles.textareaWrapper}>
            <div className={styles.textareaLabel}>
              <FileText size={18} className={styles.textareaIcon} />
              <span>Notas</span>
              <span className={styles.textareaOptional}>(opcional)</span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Información adicional sobre el prospecto..."
              className={`${styles.textareaModern} ${errors.notas ? styles.textareaError : ''}`}
              {...register('notas')}
            />
            <div className={styles.characterCounter}>
              <span>{watch('notas')?.length || 0}/1000</span>
            </div>
            {errors.notas && (
              <div className={styles.errorMessage}>{errors.notas.message}</div>
            )}
          </div>
        </div>

        {/* Errores de catálogo */}
        {(etapas.isError || industrias.isError || tiposCliente.isError || zonas.isError) && (
          <div className={styles.errorContainer}>
            <ErrorMessage message="No se pudieron cargar los catálogos. Verifica tu conexión e intenta de nuevo." />
          </div>
        )}

        {etapas.isLoading && (
          <div className={styles.loadingCatalogs}>
            <span>⏳ Cargando catálogos...</span>
          </div>
        )}

        {errors.root && (
          <div className={styles.errorContainer}>
            <ErrorMessage message={errors.root.message} />
          </div>
        )}

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={styles.cancelBtn}
          >
            <X size={18} />
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid && isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? (
              'Guardando...'
            ) : (
              <>
                <CheckCircle size={18} />
                {isEdit ? 'Guardar cambios' : 'Crear prospecto'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}