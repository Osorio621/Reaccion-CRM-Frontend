import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Save,
  X,
  Users
} from 'lucide-react';
import styles from './ContactoFormModal.module.css';

const contactoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(120),
  cargo: z.string().max(80).optional().or(z.literal('')),
  email: z.string().email('Correo inválido'),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
});

export default function ContactoFormModal({
  open,
  contacto,
  onClose,
  onCreate,
  onUpdate,
}) {
  const isEdit = !!contacto;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactoSchema),
    defaultValues: { nombre: '', cargo: '', email: '', telefono: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      isEdit
        ? {
            nombre: contacto.nombre ?? '',
            cargo: contacto.cargo ?? '',
            email: contacto.email ?? '',
            telefono: contacto.telefono ?? '',
          }
        : { nombre: '', cargo: '', email: '', telefono: '' }
    );
  }, [open, contacto, isEdit, reset]);

  const onSubmit = async (data) => {
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { contactoId: contacto.id, data } : data);
      toast.success(isEdit ? '✅ Contacto actualizado' : '✅ Contacto agregado');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Editar contacto' : 'Nuevo contacto'} onClose={onClose} className={styles.modal}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>
            <Users size={24} />
          </div>
          <div className={styles.formHeaderInfo}>
            <h3>{isEdit ? 'Editar contacto' : 'Agregar contacto'}</h3>
            <p>{isEdit ? 'Actualiza la información del contacto' : 'Ingresa los datos del nuevo contacto'}</p>
          </div>
        </div>

        <div className={styles.formBody}>
          <Input
            label="Nombre *"
            placeholder="Nombre completo del contacto"
            error={errors.nombre?.message}
            icon={<User size={16} />}
            {...register('nombre')}
          />

          <Input
            label="Cargo"
            placeholder="Ej. Gerente de Ventas, Director Comercial..."
            error={errors.cargo?.message}
            icon={<Briefcase size={16} />}
            {...register('cargo')}
          />

          <Input
            label="Correo *"
            type="email"
            placeholder="contacto@empresa.com"
            error={errors.email?.message}
            icon={<Mail size={16} />}
            {...register('email')}
          />

          <Input
            label="Teléfono"
            placeholder="+52 55 1234 5678"
            error={errors.telefono?.message}
            icon={<Phone size={16} />}
            {...register('telefono')}
          />
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} className={styles.cancelBtn}>
            <X size={16} />
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} className={styles.submitBtn}>
            <Save size={16} />
            {isEdit ? 'Guardar cambios' : 'Agregar contacto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}