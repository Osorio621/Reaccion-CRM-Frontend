import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Shield, Key, X, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './UsuarioFormModal.module.css';

const ROLES = [
  { value: 'EJECUTIVO', label: 'Ejecutivo', icon: '👤' },
  { value: 'GERENTE', label: 'Gerente', icon: '👔' },
  { value: 'ADMIN', label: 'Administrador', icon: '⚡' },
];

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es obligatorio').max(120),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(120),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Correo inválido'),
  rol: z.enum(ROLES.map(r => r.value), { message: 'Selecciona un rol' }),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
};

export default function UsuarioFormModal({ open, usuario, onClose, onCreate, onUpdate }) {
  const isEdit = !!usuario;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(
      isEdit
        ? z.object(baseSchema)
        : z.object({ ...baseSchema, password: z.string().min(8, 'Mínimo 8 caracteres') })
    ),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      rol: 'EJECUTIVO',
      password: '',
    },
    mode: 'onChange',
  });

  const selectedRol = watch('rol');

  useEffect(() => {
    if (!open) return;
    reset(
      isEdit
        ? {
            nombre: usuario.nombre ?? '',
            apellido: usuario.apellido ?? '',
            telefono: usuario.telefono ?? '',
            email: usuario.email ?? '',
            rol: usuario.rol ?? 'EJECUTIVO',
            password: '',
          }
        : {
            nombre: '',
            apellido: '',
            telefono: '',
            email: '',
            rol: 'EJECUTIVO',
            password: '',
          }
    );
  }, [open, usuario, isEdit, reset]);

  const onSubmit = async (data) => {
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(
        isEdit
          ? { id: usuario.id, data: { ...data, password: data.password || undefined } }
          : data
      );
      toast.success(isEdit ? '✅ Usuario actualizado correctamente' : '✅ Usuario creado correctamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  // Determinar el icono del rol seleccionado
  const getRolIcon = (rolValue) => {
    const rol = ROLES.find(r => r.value === rolValue);
    return rol ? rol.icon : '👤';
  };

  const getRolColor = (rolValue) => {
    const colors = {
      'EJECUTIVO': '#4f46e5',
      'GERENTE': '#0ea5e9',
      'ADMIN': '#dc2626'
    };
    return colors[rolValue] || '#6b7280';
  };

  return (
    <Modal 
      open={open} 
      title={isEdit ? '✏️ Editar usuario' : '👤 Nuevo usuario'} 
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalSubtitle}>
          {isEdit 
            ? `Editando ${usuario?.nombre} ${usuario?.apellido || ''}` 
            : 'Completa los datos del nuevo usuario'
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
            <span className={styles.sectionIcon}>👤</span>
            <span>Información personal</span>
          </div>
          
          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Nombre"
                placeholder="Ingresa el nombre"
                error={errors.nombre?.message}
                icon={<User size={18} />}
                className={styles.inputModern}
                {...register('nombre')}
              />
            </div>
            <div className={styles.inputWrapper}>
              <Input
                label="Apellido"
                placeholder="Ingresa el apellido"
                error={errors.apellido?.message}
                icon={<User size={18} />}
                className={styles.inputModern}
                {...register('apellido')}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📧</span>
            <span>Datos de contacto</span>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="usuario@ejemplo.com"
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
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔐</span>
            <span>Seguridad y permisos</span>
          </div>

          <div className={styles.rolContainer}>
            <div className={styles.rolWrapper}>
              <Select
                label="Rol del usuario"
                error={errors.rol?.message}
                className={styles.selectModern}
                icon={<Shield size={18} />}
                {...register('rol')}
                value={selectedRol}
                onChange={(e) => setValue('rol', e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </Select>
              {selectedRol && (
                <div 
                  className={styles.rolIndicator}
                  style={{ backgroundColor: getRolColor(selectedRol) }}
                >
                  <span className={styles.rolIndicatorIcon}>
                    {getRolIcon(selectedRol)}
                  </span>
                  <span className={styles.rolIndicatorText}>
                    {ROLES.find(r => r.value === selectedRol)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.passwordWrapper}>
            <PasswordInput
              label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              placeholder={isEdit ? 'Dejar en blanco para mantener la actual' : '••••••••'}
              error={errors.password?.message}
              icon={<Key size={18} />}
              className={styles.inputModern}
              {...register('password')}
            />
            {isEdit && (
              <div className={styles.passwordHint}>
                <span>💡 Deja en blanco para mantener la contraseña actual</span>
              </div>
            )}
            {!isEdit && (
              <div className={styles.passwordHint}>
                <span>🔒 Mínimo 8 caracteres</span>
              </div>
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
                {isEdit ? 'Guardar cambios' : 'Crear usuario'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}