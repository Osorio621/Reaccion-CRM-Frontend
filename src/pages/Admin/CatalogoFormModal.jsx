import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, Type, FileText, X, CheckCircle, List, Layers } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './CatalogoFormModal.module.css';

const CATALOGO_TIPOS = [
  { value: 'ETAPA', label: 'Etapa', icon: '📊', color: '#6366f1' },
  { value: 'ORIGEN', label: 'Origen', icon: '📍', color: '#0ea5e9' },
  { value: 'INDUSTRIA', label: 'Industria', icon: '🏭', color: '#8b5cf6' },
  { value: 'ESTADO', label: 'Estado', icon: '🔵', color: '#22c55e' },
  { value: 'PRIORIDAD', label: 'Prioridad', icon: '🔴', color: '#f59e0b' },
  { value: 'OTRO', label: 'Otro', icon: '📌', color: '#6b7280' },
];

const catalogoSchema = z.object({
  tipo: z.string().min(1, 'El tipo es obligatorio').max(60),
  valor: z.string().min(1, 'El valor es obligatorio').max(120),
  descripcion: z.string().max(300).optional().or(z.literal('')),
});

export default function CatalogoFormModal({ open, catalogo, onClose, onCreate, onUpdate }) {
  const isEdit = !!catalogo;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(catalogoSchema),
    defaultValues: { tipo: '', valor: '', descripcion: '' },
    mode: 'onChange',
  });

  const selectedTipo = watch('tipo');

  useEffect(() => {
    if (!open) return;
    reset(
      isEdit
        ? {
            tipo: catalogo.tipo ?? '',
            valor: catalogo.valor ?? '',
            descripcion: catalogo.descripcion ?? '',
          }
        : { tipo: '', valor: '', descripcion: '' }
    );
  }, [open, catalogo, isEdit, reset]);

  const onSubmit = async (data) => {
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { id: catalogo.id, data } : data);
      toast.success(isEdit ? '✅ Catálogo actualizado correctamente' : '✅ Catálogo creado correctamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  // Obtener información del tipo seleccionado
  const getTipoInfo = (tipoValue) => {
    const tipo = CATALOGO_TIPOS.find(t => t.value === tipoValue);
    return tipo || { icon: '📌', color: '#6b7280', label: tipoValue || 'Tipo' };
  };

  const tipoInfo = getTipoInfo(selectedTipo);

  return (
    <Modal 
      open={open} 
      title={isEdit ? '✏️ Editar catálogo' : '📋 Nuevo catálogo'} 
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalSubtitle}>
          {isEdit 
            ? `Editando "${catalogo?.valor}"` 
            : 'Agrega un nuevo elemento al catálogo'
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
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏷️</span>
            <span>Información del catálogo</span>
          </div>

          <div className={styles.tipoContainer}>
            <div className={styles.tipoWrapper}>
              <div className={styles.inputWithIcon}>
                <Type size={18} className={styles.inputIcon} />
                <select
                  className={`${styles.selectModern} ${errors.tipo ? styles.selectError : ''}`}
                  {...register('tipo')}
                  value={selectedTipo || ''}
                  onChange={(e) => setValue('tipo', e.target.value)}
                >
                  <option value="">Selecciona un tipo</option>
                  {CATALOGO_TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.tipo && (
                <div className={styles.errorMessage}>{errors.tipo.message}</div>
              )}
            </div>

            {selectedTipo && (
              <div 
                className={styles.tipoIndicator}
                style={{ backgroundColor: tipoInfo.color }}
              >
                <span className={styles.tipoIndicatorIcon}>{tipoInfo.icon}</span>
                <span className={styles.tipoIndicatorText}>{tipoInfo.label}</span>
                <span className={styles.tipoIndicatorBadge}>Tipo seleccionado</span>
              </div>
            )}
          </div>

          <div className={styles.valorWrapper}>
            <div className={styles.inputWithIcon}>
              <Tag size={18} className={styles.inputIcon} />
              <Input
                label="Valor"
                placeholder="Ej: En proceso, Santiago, Tecnología..."
                error={errors.valor?.message}
                className={styles.inputModern}
                {...register('valor')}
              />
            </div>
            {selectedTipo && (
              <div className={styles.inputHint}>
                <span>💡 Sugerencia: Ingresa un valor para el tipo <strong>{tipoInfo.label}</strong></span>
              </div>
            )}
          </div>

          <div className={styles.descripcionWrapper}>
            <div className={styles.inputWithIcon}>
              <FileText size={18} className={styles.inputIcon} />
              <Input
                label="Descripción (opcional)"
                placeholder="Breve descripción del elemento de catálogo..."
                error={errors.descripcion?.message}
                className={styles.inputModern}
                {...register('descripcion')}
              />
            </div>
            <div className={styles.characterCounter}>
              <span>{watch('descripcion')?.length || 0}/300</span>
            </div>
          </div>
        </div>

        {/* Vista previa del elemento */}
        {selectedTipo && watch('valor') && (
          <div className={styles.previewSection}>
            <div className={styles.previewTitle}>
              <Layers size={16} />
              <span>Vista previa</span>
            </div>
            <div className={styles.previewCard}>
              <div 
                className={styles.previewBadge}
                style={{ backgroundColor: tipoInfo.color }}
              >
                {tipoInfo.icon} {tipoInfo.label}
              </div>
              <div className={styles.previewValue}>
                <Tag size={14} />
                <span>{watch('valor')}</span>
              </div>
              {watch('descripcion') && (
                <div className={styles.previewDescription}>
                  <FileText size={14} />
                  <span>{watch('descripcion')}</span>
                </div>
              )}
            </div>
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
                {isEdit ? 'Guardar cambios' : 'Crear catálogo'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}