import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPerfil, updatePerfil, cambiarPassword, uploadFotoPerfil } from '../../api/auth.api';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  Mail, 
  Phone, 
  Image, 
  Shield, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Save,
  Key,
  Bell,
  MessageSquare,
  Smartphone,
  Upload,
  Camera
} from 'lucide-react';
import styles from './PerfilPage.module.css';

const telefonoRegex = /^\+?[0-9\s\-()]{7,20}$/;
const telefonoWhatsAppRegex = /^3[0-9]{9}$/;

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(120),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(120),
  telefono: z
    .string()
    .regex(telefonoRegex, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  fotoUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  notif_email: z.boolean().default(true),
  notif_whatsapp: z.boolean().default(false),
  telefono_whatsapp: z
    .string()
    .regex(telefonoWhatsAppRegex, 'Formato colombiano: 3001234567 (10 dígitos, inicia con 3)')
    .optional()
    .or(z.literal('')),
});

const passwordSchema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nuevaPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.nuevaPassword === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export default function PerfilPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>
          <User size={28} className={styles.titleIcon} />
          Mi perfil
        </h1>
        <p className={styles.subtitle}>Gestiona tu información personal y seguridad</p>
      </div>
      <PerfilSection />
      <PasswordSection />
    </div>
  );
}

function PerfilSection() {
  const usuario = useAuthStore((s) => s.usuario);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: () => getPerfil().then((r) => r.data),
  });

  const [fotoUploading, setFotoUploading] = useState(false);
  const [fotoError, setFotoError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: { 
      nombre: '', 
      apellido: '', 
      telefono: '', 
      fotoUrl: '',
      notif_email: true,
      notif_whatsapp: false,
      telefono_whatsapp: '',
    },
  });

  const fotoPreview = watch('fotoUrl');
  const nombreCompleto = [watch('nombre'), watch('apellido')].filter(Boolean).join(' ');

  useEffect(() => {
    if (perfil) {
      reset({
        nombre: perfil.nombre ?? '',
        apellido: perfil.apellido ?? '',
        telefono: perfil.telefono ?? '',
        fotoUrl: perfil.fotoUrl ?? '',
        notif_email: perfil.notif_email ?? true,
        notif_whatsapp: perfil.notif_whatsapp ?? false,
        telefono_whatsapp: perfil.telefono_whatsapp ?? '',
      });
    }
  }, [perfil, reset]);

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
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
      
      // Actualizar el campo fotoUrl con la URL devuelta
      setValue('fotoUrl', result.fotoUrl || result.url);
      toast.success('Foto actualizada correctamente');
    } catch (error) {
      setFotoError(extractErrorMessage(error));
    } finally {
      setFotoUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const mutation = useMutation({ mutationFn: updatePerfil });

  const onSubmit = async (data) => {
    try {
      const { data: actualizado } = await mutation.mutateAsync(data);
      toast.success('✅ Perfil actualizado correctamente');
      setAuth({ accessToken, refreshToken, usuario: actualizado });
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingContainer}>
          <Spinner size={32} />
          <p className={styles.loadingText}>Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardIcon}>
            <User size={20} />
          </div>
          <h2 className={styles.cardTitle}>Datos personales</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
          <CheckCircle size={14} />
          Activo
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              error={errors.nombre?.message}
              icon={<User size={16} />}
              {...register('nombre')}
            />
            <Input
              label="Apellido"
              placeholder="Tu apellido"
              error={errors.apellido?.message}
              icon={<User size={16} />}
              {...register('apellido')}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="Teléfono"
              placeholder="+52 55 1234 5678"
              error={errors.telefono?.message}
              icon={<Phone size={16} />}
              {...register('telefono')}
            />
          </div>
        </div>

        <div className={styles.avatarPreview}>
          <div className={styles.avatarUpload}>
            <Avatar 
              src={fotoPreview || perfil?.fotoUrl} 
              nombre={nombreCompleto || usuario?.nombre} 
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
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{nombreCompleto || usuario?.nombre}</span>
            <span className={styles.avatarHint}>
              <Image size={14} />
              Haz clic en la foto para cambiarla
            </span>
          </div>
        </div>

        <div className={styles.emailInfo}>
          <Mail size={16} />
          <span>
            Correo: <strong>{usuario?.email}</strong>
          </span>
          <span className={styles.emailNote}>
            El correo y el rol solo se modifican desde Administración
          </span>
        </div>

        {/* ===== PREFERENCIAS DE NOTIFICACIÓN ===== */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <Bell size={16} />
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
            icon={<Smartphone size={16} />}
            {...register('telefono_whatsapp')}
          />
          <p className={styles.whatsappNote}>
            Formato: 10 dígitos iniciando con 3 (ej. 3001234567). Solo se usa si activas notificaciones por WhatsApp.
          </p>
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formActions}>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
            className={styles.saveButton}
          >
            <Save size={16} />
            Guardar cambios
          </Button>
          {!isDirty && !isSubmitting && (
            <span className={styles.noChanges}>No hay cambios para guardar</span>
          )}
        </div>
      </form>
    </section>
  );
}

function PasswordSection() {
  const navigate = useNavigate();
  const cerrarSesion = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordActual: '', nuevaPassword: '', confirmarPassword: '' },
  });

  const nuevaPassword = watch('nuevaPassword');

  // Validar fuerza de la contraseña en tiempo real
  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: 'Escribe una contraseña', color: '#6b7a8a' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const levels = [
      { label: 'Muy débil', color: '#ef4444' },
      { label: 'Débil', color: '#f59e0b' },
      { label: 'Media', color: '#3b82f6' },
      { label: 'Fuerte', color: '#10b981' },
      { label: 'Muy fuerte', color: '#059669' },
    ];
    return { level: Math.min(score, 4), ...levels[Math.min(score, 4)] };
  };

  const strength = getPasswordStrength(nuevaPassword);

  const mutation = useMutation({ mutationFn: cambiarPassword });

  const onSubmit = async (data) => {
    try {
      await mutation.mutateAsync({
        passwordActual: data.passwordActual,
        nuevaPassword: data.nuevaPassword,
      });
      toast.success('🔒 Contraseña actualizada. Inicia sesión nuevamente.');
      reset();
      cerrarSesion();
      navigate('/login', { replace: true });
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={`${styles.cardIcon} ${styles.cardIconLock}`}>
            <Lock size={20} />
          </div>
          <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
        </div>
        <span className={styles.securityBadge}>
          <Shield size={14} />
          Seguridad
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <PasswordInput
            label="Contraseña actual"
            placeholder="••••••••"
            error={errors.passwordActual?.message}
            icon={<Key size={16} />}
            {...register('passwordActual')}
          />

          <div className={styles.passwordContainer}>
            <PasswordInput
              label="Nueva contraseña"
              placeholder="••••••••"
              error={errors.nuevaPassword?.message}
              icon={<Lock size={16} />}
              {...register('nuevaPassword')}
            />

            {/* Indicador de fuerza */}
            {nuevaPassword && (
              <div className={styles.strengthIndicator}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength.level + 1) * 20}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color, fontSize: '0.75rem', fontWeight: 600 }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Requisitos de contraseña */}
            <div className={styles.passwordRequirements}>
              <p className={styles.requirementsTitle}>Requisitos:</p>
              <div className={styles.requirementsGrid}>
                <span className={nuevaPassword.length >= 8 ? styles.requirementMet : ''}>
                  {nuevaPassword.length >= 8 ? '✅' : '⬜'} 8+ caracteres
                </span>
                <span className={/[A-Z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[A-Z]/.test(nuevaPassword) ? '✅' : '⬜'} Mayúscula
                </span>
                <span className={/[a-z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[a-z]/.test(nuevaPassword) ? '✅' : '⬜'} Minúscula
                </span>
                <span className={/[0-9]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[0-9]/.test(nuevaPassword) ? '✅' : '⬜'} Número
                </span>
              </div>
            </div>
          </div>

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            error={errors.confirmarPassword?.message}
            icon={<Lock size={16} />}
            {...register('confirmarPassword')}
          />
        </div>

        <div className={styles.securityNote}>
          <AlertCircle size={16} />
          <span>
            Por seguridad, al cambiar la contraseña se cerrará tu sesión 
            y deberás iniciar sesión nuevamente.
          </span>
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formActions}>
          <Button 
            type="submit" 
            loading={isSubmitting}
            className={styles.passwordButton}
          >
            <Key size={16} />
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </section>
  );
}