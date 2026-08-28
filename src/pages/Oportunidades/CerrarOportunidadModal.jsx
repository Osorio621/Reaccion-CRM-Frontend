import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import {
  Lock,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Trophy,
  Frown,
  Briefcase,
  User,
} from 'lucide-react';
import styles from './Oportunidades.module.css';

const schema = z
  .object({
    estado: z.enum(['GANADA', 'PERDIDA'], { message: 'Selecciona el resultado' }),
    motivoPerdida: z.string().max(300).optional().or(z.literal('')),
  })
  .refine((d) => d.estado !== 'PERDIDA' || (d.motivoPerdida ?? '').length > 0, {
    message: 'Indica el motivo de la pérdida',
    path: ['motivoPerdida'],
  });

export default function CerrarOportunidadModal({ open, oportunidad, onClose, onConfirm }) {
  const [estado, setEstado] = useState('GANADA');
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { estado: 'GANADA', motivoPerdida: '' },
  });

  const handleClose = () => {
    reset();
    setEstado('GANADA');
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      await onConfirm(oportunidad, data);
      reset();
      setEstado('GANADA');
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <Modal open={open} title="Cerrar oportunidad" onClose={handleClose} className={styles.modal}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderIcon}>
            <Lock size={24} />
          </div>
          <div className={styles.modalHeaderInfo}>
            <h3>Cerrar oportunidad</h3>
            <p>Indica el resultado final de la oportunidad</p>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.oportunidadInfo}>
            <div className={styles.oportunidadBadge}>
              <Briefcase size={16} />
            </div>
            <div>
              <span className={styles.oportunidadNombre}>
                {oportunidad?.titulo ?? oportunidad?.nombre}
              </span>
              {oportunidad?.clienteNombre && (
                <span className={styles.oportunidadCliente}>
                  <User size={12} />
                  {oportunidad.clienteNombre}
                </span>
              )}
            </div>
          </div>

          <div className={styles.resultadoSection}>
            <label className={styles.resultadoLabel}>Resultado *</label>
            <div className={styles.resultadoOptions}>
              <label className={`${styles.resultadoOption} ${estado === 'GANADA' ? styles.resultadoActive : ''}`}>
                <input
                  type="radio"
                  value="GANADA"
                  {...register('estado', {
                    onChange: (e) => setEstado(e.target.value),
                  })}
                />
                <div className={styles.resultadoContent}>
                  <Trophy size={20} className={styles.resultadoIconGanada} />
                  <span className={styles.resultadoNombre}>Ganada</span>
                  <span className={styles.resultadoDesc}>Oportunidad concretada</span>
                </div>
              </label>

              <label className={`${styles.resultadoOption} ${estado === 'PERDIDA' ? styles.resultadoActive : ''}`}>
                <input
                  type="radio"
                  value="PERDIDA"
                  {...register('estado', {
                    onChange: (e) => setEstado(e.target.value),
                  })}
                />
                <div className={styles.resultadoContent}>
                  <Frown size={20} className={styles.resultadoIconPerdida} />
                  <span className={styles.resultadoNombre}>Perdida</span>
                  <span className={styles.resultadoDesc}>Oportunidad no concretada</span>
                </div>
              </label>
            </div>
            {errors.estado && (
              <span className={styles.resultadoError}>{errors.estado.message}</span>
            )}
          </div>

          {estado === 'PERDIDA' && (
            <div className={styles.motivoSection}>
              <Input
                label="Motivo de la pérdida *"
                placeholder="Ej. Precio muy alto, competencia ganó, timing..."
                error={errors.motivoPerdida?.message}
                icon={<FileText size={16} />}
                {...register('motivoPerdida')}
              />
              <div className={styles.motivoHint}>
                <AlertCircle size={14} />
                <span>Este motivo ayudará a mejorar futuras estrategias</span>
              </div>
            </div>
          )}

          {estado === 'GANADA' && (
            <div className={styles.successMessage}>
              <CheckCircle size={18} />
              <span>La oportunidad se marcará como ganada</span>
            </div>
          )}
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.modalFooter}>
          <Button type="button" variant="secondary" onClick={handleClose} className={styles.cancelBtn}>
            <X size={16} />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting} 
            className={`${styles.submitBtn} ${estado === 'GANADA' ? styles.submitBtnSuccess : styles.submitBtnDanger}`}
          >
            {estado === 'GANADA' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            Cerrar oportunidad
          </Button>
        </div>
      </form>
    </Modal>
  );
}