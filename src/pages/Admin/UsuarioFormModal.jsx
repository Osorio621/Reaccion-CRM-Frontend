import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Shield, Key, X, CheckCircle, Bell, MessageSquare, Smartphone, Upload, Camera } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Avatar from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { uploadFotoPerfil } from '../../api/auth.api';
import styles from './UsuarioFormModal.module.css';

const ROLES = [
  { value: 'EJECUTIVO', label: 'Ejecutivo', icon: '👤' },
  { value: 'GERENTE', label: 'Gerente', icon: '👔' },
  { value: 'ADMIN', label: 'Administrador', icon: '⚡' },
];

const telefonoRegex = /^\+?[0-9\s\-()]{7,20}$/;
const telefonoWhatsAppRegex = /^3[0-9]{9}$/;

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es obligatorio').max(120),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(120),
  telefono: z.string().regex(telefonoRegex, 'Teléfono inválido').optional().or(z.literal('')),
  email: z.string().email('Correo inválido'),
  rol: z.enum(ROLES.map(r => r.value), { message: 'Selecciona un rol' }),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  notif_email: z.boolean().default(true),
  notif_whatsapp: z.boolean().default(false),
  telefono_whatsapp: z.string().regex(telefonoWhatsAppRegex, 'Formato colombiano: 3001234567 (10 dígitos, inicia con 3)').optional().or(z.literal('')),
};

export default function UsuarioFormModal({ open, usuario, onClose, onCreate, onUpdate }) {
  const isEdit = !!usuario;
  const [fotoUploading, setFotoUploading] = useState(false);
  const [fotoError, setFotoError] = useState('');

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
      notif_email: true,
      notif_whatsapp: false,
      telefono_whatsapp: '',
      fotoUrl: '',
    },
    mode: 'onChange',
  });

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFotoError('El archivo debe ser una imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('La imagen no debe superar 5 MB');
      return;
    }

    setFotoError('');
    setFotoUploading(true);

    try {
      const formData = new FormData();
      formData.append('foto', file);
      const result = await uploadFotoPerfil(formData);
      setValue('fotoUrl', result.fotoUrl || result.url);
      toast.success('Foto actualizada correctamente');
    } catch (error) {
      setFotoError(extractErrorMessage(error));
    } finally {
      setFotoUploading(false);
      e.target.value = '';
    }
  };

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
            notif_email: usuario.notif_email ?? true,
            notif_whatsapp: usuario.notif_whatsapp ?? false,
            telefono_whatsapp: usuario.telefono_whatsapp ?? '',
            fotoUrl: usuario.fotoUrl ?? '',
          }
        : {
            nombre: '',
            apellido: '',
            telefono: '',
            email: '',
            rol: 'EJECUTIVO',
            password: '',
            notif_email: true,
            notif_whatsapp: false,
            telefono_whatsapp: '',
            fotoUrl: '',
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
        {/* Avatar Upload */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarUpload}>
            <Avatar 
              src={watch('fotoUrl') || usuario?.fotoUrl} 
              nombre={[watch('nombre'), watch('apellido')].filter(Boolean).join(' ') || usuario?.nombre} 
              size={80} 
              className={styles.avatarImage}
            />
            <label className={styles.avatarUploadLabel}>
              <Upload size={20} />
              <Camera size={16} />
              <span>Cambiar foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className={styles.avatarFileInput}
              />
            </label>
            {fotoUploading && <span className={styles.uploadingText}>Subiendo...</span>}
            {fotoError && <span className={styles.errorText}>{fotoError}</span>}
          </div>
        </div>

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
            <span className={styles.sectionIcon}>
              <Bell size={18} />
            </span>
            <span>Preferencias de notificación</span>
          </div>

          <div className={styles.notificationGrid}>
            <label className={styles.switchLabel}>
              <span className={styles.switchText}>
                <Bell size={16} className={styles.switchIcon} />
                <span>Notificaciones por correo</span>
              </span>
              <div className={styles.switchWrapper}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  {...register('notif_email')}
                />
                <span className={styles.switchSlider} />
              </div>
            </label>
            <label className={styles.switchLabel}>
              <span className={styles.switchText}>
                <MessageSquare size={16} className={styles.switchIcon} />
                <span>Notificaciones por WhatsApp</span>
              </span>
              <div className={styles.switchWrapper}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  {...register('notif_whatsapp')}
                />
                <span className={styles.switchSlider} />
              </div>
            </label>
          </div>

          <Input
            label="Teléfono WhatsApp (formato colombiano)"
            placeholder="3001234567"
            error={errors.telefono_whatsapp?.message}
            icon={<Smartphone size={18} />}
            className={styles.inputModern}
            {...register('telefono_whatsapp')}
          />
          <p className={styles.whatsappNote}>
            Formato: 10 dígitos iniciando con 3 (ej. 3001234567). Solo se usa si activas notificaciones por WhatsApp.
          </p>
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