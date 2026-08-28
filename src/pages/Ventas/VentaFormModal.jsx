import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  CheckCircle,
  User,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  FileText,
  Users,
  Wallet,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './VentaFormModal.module.css';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const numeroDecimal = /^\d+(\.\d{1,2})?$/;

const ventaSchema = z.object({
  ejecutivoId: z.string().min(1, 'El ejecutivo es obligatorio'),
  anio: z
    .string()
    .min(1, 'El año es obligatorio')
    .regex(/^\d{4}$/, 'Año inválido')
    .refine((v) => {
      const n = Number(v);
      return n >= 2020 && n <= 2100;
    }, 'Entre 2020 y 2100'),
  mes: z
    .string()
    .min(1, 'El mes es obligatorio')
    .refine((v) => {
      const n = Number(v);
      return n >= 1 && n <= 12;
    }, 'Selecciona un mes válido'),
  meta: z
    .string()
    .min(1, 'La meta es obligatoria')
    .regex(numeroDecimal, 'Monto inválido (ej. 500000.00)'),
  ventaReal: z.string().regex(numeroDecimal, 'Monto inválido').optional().or(z.literal('')),
  forecast: z.string().regex(numeroDecimal, 'Monto inválido').optional().or(z.literal('')),
  notas: z.string().max(1000).optional().or(z.literal('')),
});

const valoresVacios = (anioActual, ejecutivoId = '') => ({
  ejecutivoId,
  anio: String(anioActual),
  mes: '',
  meta: '',
  ventaReal: '',
  forecast: '',
  notas: '',
});

export default function VentaFormModal({ open, venta, onClose, onCreate, onUpdate }) {
  const isEdit = !!venta;
  const usuario = useAuthStore((s) => s.usuario);
  const rol = useAuthStore((s) => s.rol);
  const puedeElegirEjecutivo = rol === 'ADMIN' || rol === 'GERENTE';

  const usuariosQuery = useUsuarios();
  const usuariosRaw = usuariosQuery.data;
  const usuarios = usuariosRaw?.contenido ?? (Array.isArray(usuariosRaw) ? usuariosRaw : []);
  const miId = usuario?.id ? String(usuario.id) : '';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(ventaSchema),
    defaultValues: valoresVacios(new Date().getFullYear(), miId),
    mode: 'onChange',
  });

  const metaValue = watch('meta');
  const ventaRealValue = watch('ventaReal');
  const forecastValue = watch('forecast');

  // Calcular cumplimiento en tiempo real
  const calcularCumplimiento = () => {
    const meta = Number(metaValue);
    const real = Number(ventaRealValue);
    if (!meta || isNaN(real) || meta === 0) return null;
    return Math.round((real / meta) * 100);
  };

  const cumplimiento = calcularCumplimiento();

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      reset({
        ejecutivoId: venta.ejecutivoId ? String(venta.ejecutivoId) : miId,
        anio: venta.anio ? String(venta.anio) : String(new Date().getFullYear()),
        mes: venta.mes ? String(venta.mes) : '',
        meta: venta.meta ?? '',
        ventaReal: venta.ventaReal ?? '',
        forecast: venta.forecast ?? '',
        notas: venta.notas ?? '',
      });
    } else {
      reset(valoresVacios(new Date().getFullYear(), miId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, venta, isEdit, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ejecutivoId: Number(data.ejecutivoId),
      anio: Number(data.anio),
      mes: Number(data.mes),
      meta: Number(data.meta),
      ventaReal: data.ventaReal ? Number(data.ventaReal) : null,
      forecast: data.forecast ? Number(data.forecast) : null,
      notas: data.notas || null,
    };
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { id: venta.id, data: payload } : payload);
      toast.success(isEdit ? '✅ Venta actualizada correctamente' : '✅ Venta registrada correctamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    if (!value) return '—';
    const num = Number(value);
    if (isNaN(num)) return '—';
    return `$${num.toLocaleString('es-CO')}`;
  };

  // Obtener nombre del mes
  const getMesNombre = (mesNum) => {
    const num = Number(mesNum);
    if (!num || num < 1 || num > 12) return '';
    return MESES[num - 1];
  };

  return (
    <Modal
      open={open}
      title={isEdit ? '✏️ Editar venta' : '📊 Registrar venta'}
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderLeft}>
          <div className={styles.modalIcon}>
            <TrendingUp size={22} className={styles.modalIconTrend} />
          </div>
          <div>
            <div className={styles.modalSubtitle}>
              {isEdit
                ? `Editando venta de ${getMesNombre(venta?.mes)} ${venta?.anio || ''}`
                : 'Completa los datos de la venta'
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
        {/* Sección: Información de la venta */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            <span>Información de la venta</span>
          </div>

          {puedeElegirEjecutivo ? (
            <div className={styles.inputWrapper}>
              <Select
                label="Ejecutivo *"
                error={errors.ejecutivoId?.message}
                className={styles.selectModern}
                icon={<Users size={18} />}
                {...register('ejecutivoId')}
              >
                <option value="">Selecciona…</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.nombre, u.apellido].filter(Boolean).join(' ')}
                  </option>
                ))}
              </Select>
              {usuariosQuery.isError && (
                <ErrorMessage message="No se pudo cargar la lista de ejecutivos." />
              )}
            </div>
          ) : (
            <div className={styles.ejecutivoInfo}>
              <User size={18} className={styles.ejecutivoInfoIcon} />
              <div>
                <span className={styles.ejecutivoInfoLabel}>Ejecutivo</span>
                <span className={styles.ejecutivoInfoValue}>{usuario?.nombre}</span>
              </div>
              <input type="hidden" {...register('ejecutivoId')} />
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Select
                label="Mes *"
                error={errors.mes?.message}
                className={styles.selectModern}
                icon={<Calendar size={18} />}
                {...register('mes')}
              >
                <option value="">Selecciona…</option>
                {MESES.map((nombre, i) => (
                  <option key={i + 1} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Año *"
                type="number"
                min="2020"
                max="2100"
                placeholder="2025"
                error={errors.anio?.message}
                icon={<Calendar size={18} />}
                className={styles.inputModern}
                {...register('anio')}
              />
            </div>
          </div>
        </div>

        {/* Sección: Montos */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💰</span>
            <span>Montos (COP)</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Meta del mes *"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.meta?.message}
                icon={<Target size={18} />}
                className={`${styles.inputModern} ${styles.inputMeta}`}
                {...register('meta')}
              />
              {metaValue && (
                <div className={styles.montoPreview}>
                  <span className={styles.montoPreviewLabel}>Meta:</span>
                  <span className={styles.montoPreviewValue}>{formatCurrency(metaValue)}</span>
                </div>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Venta real"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.ventaReal?.message}
                icon={<DollarSign size={18} />}
                className={`${styles.inputModern} ${styles.inputReal}`}
                {...register('ventaReal')}
              />
              {ventaRealValue && (
                <div className={styles.montoPreview}>
                  <span className={styles.montoPreviewLabel}>Real:</span>
                  <span className={styles.montoPreviewValue}>{formatCurrency(ventaRealValue)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <Input
              label="Forecast"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.forecast?.message}
              icon={<BarChart3 size={18} />}
              className={`${styles.inputModern} ${styles.inputForecast}`}
              {...register('forecast')}
            />
            {forecastValue && (
              <div className={styles.montoPreview}>
                <span className={styles.montoPreviewLabel}>Forecast:</span>
                <span className={styles.montoPreviewValue}>{formatCurrency(forecastValue)}</span>
              </div>
            )}
          </div>

          {/* Indicador de cumplimiento en tiempo real */}
          {metaValue && ventaRealValue && cumplimiento !== null && (
            <div className={`${styles.cumplimientoPreview} ${
              cumplimiento >= 100 ? styles.cumpleSupera : 
              cumplimiento >= 80 ? styles.cumpleOk : 
              styles.cumpleBajo
            }`}>
              <div className={styles.cumplimientoPreviewIcon}>
                {cumplimiento >= 100 ? '🎉' : cumplimiento >= 80 ? '✅' : '⚠️'}
              </div>
              <div>
                <div className={styles.cumplimientoPreviewLabel}>Cumplimiento</div>
                <div className={styles.cumplimientoPreviewValue}>{cumplimiento}%</div>
              </div>
              <div className={styles.cumplimientoPreviewBar}>
                <div 
                  className={styles.cumplimientoPreviewBarFill}
                  style={{ width: `${Math.min(cumplimiento, 100)}%` }}
                />
              </div>
            </div>
          )}
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
              rows={3}
              maxLength={1000}
              placeholder="Comentarios adicionales sobre la venta..."
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
                {isEdit ? 'Guardar cambios' : 'Registrar venta'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}