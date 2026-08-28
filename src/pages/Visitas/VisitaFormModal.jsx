import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  CheckCircle, 
  Building2, 
  User, 
  Calendar, 
  Target, 
  Lightbulb, 
  TrendingUp,
  FileText,
  Clock,
  Users,
  Briefcase,
  Hash,
  CheckSquare,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useClientes } from '../../hooks/useClientes';
import { useProspectos } from '../../hooks/useProspectos';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './VisitaFormModal.module.css';

const visitaSchema = z.object({
  tipoEntidad: z.enum(['CLIENTE', 'PROSPECTO']),
  entidadId: z.string().min(1, 'Selecciona a quién se visitó'),
  oportunidadId: z
    .string()
    .refine((v) => v === '' || /^\d+$/.test(v), 'ID inválido')
    .optional()
    .or(z.literal('')),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  objetivo: z.string().trim().min(1, 'El objetivo es obligatorio').max(500),
  necesidadDetectada: z
    .string()
    .trim()
    .min(1, 'La necesidad detectada es obligatoria')
    .max(1000),
  competenciaMencionada: z
    .string()
    .trim()
    .min(1, 'La competencia mencionada es obligatoria')
    .max(300),
  resultadoId: z.string().min(1, 'El resultado es obligatorio'),
  oportunidadGenerada: z.boolean(),
  compromiso: z.string().trim().min(1, 'El compromiso es obligatorio').max(500),
  notasAdicionales: z.string().max(2000).optional().or(z.literal('')),
});

const valoresVacios = {
  tipoEntidad: 'CLIENTE',
  entidadId: '',
  oportunidadId: '',
  fecha: '',
  objetivo: '',
  necesidadDetectada: '',
  competenciaMencionada: '',
  resultadoId: '',
  oportunidadGenerada: false,
  compromiso: '',
  notasAdicionales: '',
};

export default function VisitaFormModal({ open, visita, onClose, onCreate, onUpdate }) {
  const isEdit = !!visita;
  const { data: clientesData } = useClientes({ size: 100 });
  const { data: prospectosData } = useProspectos({ size: 100 });
  const resultadosQuery = useCatalogosPorTipo('RESULTADO_VISITA', open);

  const clientes = clientesData?.contenido ?? (Array.isArray(clientesData) ? clientesData : []);
  const prospectosRaw = prospectosData?.contenido ?? prospectosData;
  const prospectos = (Array.isArray(prospectosRaw) ? prospectosRaw : []).filter(
    (p) => !p.convertido
  );
  const resultados = Array.isArray(resultadosQuery.data) ? resultadosQuery.data : [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(visitaSchema),
    defaultValues: valoresVacios,
    mode: 'onChange',
  });

  const tipoEntidad = watch('tipoEntidad');
  const oportunidadGenerada = watch('oportunidadGenerada');

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      reset({
        tipoEntidad: visita.tipoEntidad ?? 'CLIENTE',
        entidadId: String(
          visita.clienteId ?? visita.prospectoId ?? ''
        ),
        oportunidadId: visita.oportunidadId ? String(visita.oportunidadId) : '',
        fecha: (visita.fecha ?? '').slice(0, 10),
        objetivo: visita.objetivo ?? '',
        necesidadDetectada: visita.necesidadDetectada ?? '',
        competenciaMencionada: visita.competenciaMencionada ?? '',
        resultadoId: visita.resultadoId ? String(visita.resultadoId) : '',
        oportunidadGenerada: !!visita.oportunidadGenerada,
        compromiso: visita.compromiso ?? '',
        notasAdicionales: visita.notasAdicionales ?? '',
      });
    } else {
      reset(valoresVacios);
    }
  }, [open, visita, isEdit, reset]);

  const onSubmit = async (data) => {
    const idEntidad = Number(data.entidadId);
    const payload = {
      tipoEntidad: data.tipoEntidad,
      ...(data.tipoEntidad === 'CLIENTE'
        ? { clienteId: idEntidad }
        : { prospectoId: idEntidad }),
      oportunidadId: data.oportunidadId ? Number(data.oportunidadId) : null,
      fecha: data.fecha,
      objetivo: data.objetivo,
      necesidadDetectada: data.necesidadDetectada,
      competenciaMencionada: data.competenciaMencionada,
      resultadoId: Number(data.resultadoId),
      oportunidadGenerada: data.oportunidadGenerada,
      compromiso: data.compromiso,
      notasAdicionales: data.notasAdicionales || null,
    };
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { id: visita.id, data: payload } : payload);
      toast.success(isEdit ? '✅ Visita actualizada correctamente' : '✅ Visita registrada correctamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  // Obtener icono según tipo de entidad
  const getEntidadIcon = (tipo) => {
    return tipo === 'CLIENTE' ? <Building2 size={18} /> : <User size={18} />;
  };

  const getEntidadLabel = (tipo) => {
    return tipo === 'CLIENTE' ? 'Cliente' : 'Prospecto';
  };

  return (
    <Modal 
      open={open} 
      title={isEdit ? '✏️ Editar visita' : '📋 Registrar visita'} 
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalSubtitle}>
          {isEdit 
            ? `Editando visita del ${new Date(visita?.fecha).toLocaleDateString('es-CO')}`
            : 'Completa los datos de la visita realizada'
          }
        </div>
        {isEdit && (
          <div className={styles.editBadge}>
            <span className={styles.editBadgeDot} />
            Modo edición
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        {/* Sección: Tipo de entidad */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            <span>Información de la visita</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Select
                label="¿A quién visitaste?"
                error={errors.tipoEntidad?.message}
                className={styles.selectModern}
                icon={getEntidadIcon(tipoEntidad)}
                {...register('tipoEntidad')}
                value={tipoEntidad}
                onChange={(e) => setValue('tipoEntidad', e.target.value)}
              >
                <option value="CLIENTE">🏢 Cliente</option>
                <option value="PROSPECTO">👤 Prospecto</option>
              </Select>
              {tipoEntidad && (
                <div className={styles.entidadIndicator}>
                  {getEntidadIcon(tipoEntidad)}
                  <span>Visitando: <strong>{getEntidadLabel(tipoEntidad)}</strong></span>
                </div>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <Select
                label={`${getEntidadLabel(tipoEntidad)} *`}
                error={errors.entidadId?.message}
                className={styles.selectModern}
                icon={<Users size={18} />}
                {...register('entidadId')}
              >
                <option value="">Selecciona…</option>
                {(tipoEntidad === 'CLIENTE' ? clientes : prospectos).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </Select>
              {(tipoEntidad === 'CLIENTE' ? clientes : prospectos).length === 0 && (
                <div className={styles.emptyHint}>
                  <AlertCircle size={14} />
                  <span>No hay {getEntidadLabel(tipoEntidad).toLowerCase()}s disponibles</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Fecha de la visita *"
                type="date"
                error={errors.fecha?.message}
                icon={<Calendar size={18} />}
                className={styles.inputModern}
                {...register('fecha')}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                label="Oportunidad relacionada"
                type="number"
                min="1"
                placeholder="ID de la oportunidad"
                error={errors.oportunidadId?.message}
                icon={<Hash size={18} />}
                className={styles.inputModern}
                {...register('oportunidadId')}
              />
              <div className={styles.inputHint}>
                <span>💡 Opcional - ID de oportunidad existente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Detalles de la visita */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            <span>Detalles de la visita</span>
          </div>

          <div className={styles.inputWrapper}>
            <Input
              label="Objetivo *"
              placeholder="¿Cuál fue el motivo de la visita?"
              error={errors.objetivo?.message}
              icon={<Target size={18} />}
              className={styles.inputModern}
              {...register('objetivo')}
            />
          </div>

          <div className={styles.inputWrapper}>
            <Input
              label="Necesidad detectada *"
              placeholder="¿Qué necesidad identificaste en el cliente?"
              error={errors.necesidadDetectada?.message}
              icon={<Lightbulb size={18} />}
              className={styles.inputModern}
              {...register('necesidadDetectada')}
            />
          </div>

          <div className={styles.inputWrapper}>
            <Input
              label="Competencia mencionada *"
              placeholder="¿Qué competidores o proveedores mencionó?"
              error={errors.competenciaMencionada?.message}
              icon={<TrendingUp size={18} />}
              className={styles.inputModern}
              {...register('competenciaMencionada')}
            />
          </div>
        </div>

        {/* Sección: Resultados */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            <span>Resultados y compromisos</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Select
                label="Resultado de la visita *"
                error={errors.resultadoId?.message}
                className={styles.selectModern}
                icon={<CheckCircle size={18} />}
                {...register('resultadoId')}
              >
                <option value="">Selecciona…</option>
                {resultados.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </Select>
              {resultadosQuery.isError && (
                <ErrorMessage message="No se pudo cargar el catálogo de resultados." />
              )}
            </div>

            <div className={styles.inputWrapper}>
              <Input
                label="Compromiso *"
                placeholder="¿Qué acción se acordó?"
                error={errors.compromiso?.message}
                icon={<Clock size={18} />}
                className={styles.inputModern}
                {...register('compromiso')}
              />
            </div>
          </div>

          {/* Checkbox oportunidad generada */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                {...register('oportunidadGenerada')}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                <span className={styles.checkboxIcon}>
                  {oportunidadGenerada ? '✅' : '⬜'}
                </span>
                ¿Se generó una oportunidad?
              </span>
            </label>
            {oportunidadGenerada && (
              <div className={styles.checkboxHint}>
                <span>🎉 ¡Excelente! Se registrará como oportunidad generada</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Notas adicionales */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📌</span>
            <span>Información adicional</span>
          </div>

          <div className={styles.textareaWrapper}>
            <div className={styles.textareaLabel}>
              <MessageSquare size={18} className={styles.textareaIcon} />
              <span>Notas adicionales</span>
              <span className={styles.textareaOptional}>(opcional)</span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Comentarios adicionales sobre la visita..."
              className={`${styles.textareaModern} ${errors.notasAdicionales ? styles.textareaError : ''}`}
              {...register('notasAdicionales')}
            />
            <div className={styles.characterCounter}>
              <span>{watch('notasAdicionales')?.length || 0}/2000</span>
            </div>
            {errors.notasAdicionales && (
              <div className={styles.errorMessage}>{errors.notasAdicionales.message}</div>
            )}
          </div>
        </div>

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
                {isEdit ? 'Guardar cambios' : 'Registrar visita'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}