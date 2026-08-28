import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuthStore } from '../../store/authStore';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
  Users,
  Tag,
  HelpCircle,
  X,
  Save,
  Briefcase,
} from 'lucide-react';
import styles from './ClienteFormModal.module.css';

const telefonoRegex = /^\+?[0-9\s\-()]{7,20}$/;

const clienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  razonSocial: z.string().trim().max(200).optional().or(z.literal('')),
  rfc: z.string().trim().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  tipoId: z.string().optional(),
  industriaId: z.string().optional(),
  zonaId: z.string().optional(),
  ejecutivoId: z.string().optional(),
  telefonoPrincipal: z
    .string()
    .trim()
    .regex(telefonoRegex, 'Teléfono inválido')
    .max(20)
    .optional()
    .or(z.literal('')),
  emailPrincipal: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(150)
    .optional()
    .or(z.literal('')),
  sitioWeb: z.string().trim().max(300).optional().or(z.literal('')),
  direccion: z.string().trim().max(300).optional().or(z.literal('')),
  ciudad: z.string().trim().max(100).optional().or(z.literal('')),
  estadoRegion: z.string().trim().max(100).optional().or(z.literal('')),
  notas: z.string().max(1000).optional().or(z.literal('')),
  fechaPrimeraCompra: z.string().optional(),
});

const valoresVacios = {
  nombre: '',
  razonSocial: '',
  rfc: '',
  tipoId: '',
  industriaId: '',
  zonaId: '',
  ejecutivoId: '',
  telefonoPrincipal: '',
  emailPrincipal: '',
  sitioWeb: '',
  direccion: '',
  ciudad: '',
  estadoRegion: '',
  notas: '',
  fechaPrimeraCompra: '',
};

export default function ClienteFormModal({ open, cliente, onClose, onCreate, onUpdate }) {
  const isEdit = !!cliente;
  const rol = useAuthStore((s) => s.rol);
  const puedeAsignarEjecutivo = rol === 'ADMIN' || rol === 'GERENTE';

  const tiposQuery = useCatalogosPorTipo('TIPO_CLIENTE', open);
  const industriasQuery = useCatalogosPorTipo('INDUSTRIA', open);
  const zonasQuery = useCatalogosPorTipo('ZONA_GEOGRAFICA', open);
  const usuariosQuery = useUsuarios();

  const lista = (q) => (Array.isArray(q.data) ? q.data : []);
  const usuariosRaw = usuariosQuery.data;
  const usuarios = usuariosRaw?.contenido ?? (Array.isArray(usuariosRaw) ? usuariosRaw : []);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      reset({
        ...valoresVacios,
        nombre: cliente.nombre ?? '',
        razonSocial: cliente.razonSocial ?? '',
        rfc: cliente.rfc ?? '',
        tipoId: cliente.tipoId ? String(cliente.tipoId) : '',
        industriaId: cliente.industriaId ? String(cliente.industriaId) : '',
        zonaId: cliente.zonaId ? String(cliente.zonaId) : '',
        ejecutivoId: cliente.ejecutivoId ? String(cliente.ejecutivoId) : '',
        telefonoPrincipal: cliente.telefonoPrincipal ?? '',
        emailPrincipal: cliente.emailPrincipal ?? '',
        sitioWeb: cliente.sitioWeb ?? '',
        direccion: cliente.direccion ?? '',
        ciudad: cliente.ciudad ?? '',
        estadoRegion: cliente.estadoRegion ?? '',
        notas: cliente.notas ?? '',
        fechaPrimeraCompra: cliente.fechaPrimeraCompra?.slice(0, 10) ?? '',
      });
    } else {
      reset(valoresVacios);
    }
  }, [open, cliente, isEdit, reset]);

  const onSubmit = async (data) => {
    const payload = {
      nombre: data.nombre,
      razonSocial: data.razonSocial || null,
      rfc: data.rfc || null,
      tipoId: data.tipoId ? Number(data.tipoId) : null,
      industriaId: data.industriaId ? Number(data.industriaId) : null,
      zonaId: data.zonaId ? Number(data.zonaId) : null,
      ejecutivoId: data.ejecutivoId ? Number(data.ejecutivoId) : undefined,
      telefonoPrincipal: data.telefonoPrincipal || null,
      emailPrincipal: data.emailPrincipal || null,
      sitioWeb: data.sitioWeb || null,
      direccion: data.direccion || null,
      ciudad: data.ciudad || null,
      estadoRegion: data.estadoRegion || null,
      notas: data.notas || null,
      fechaPrimeraCompra: data.fechaPrimeraCompra || null,
    };
    const mutation = isEdit ? onUpdate : onCreate;
    try {
      await mutation.mutateAsync(isEdit ? { id: cliente.id, data: payload } : payload);
      toast.success(isEdit ? 'Cliente actualizado' : 'Cliente creado');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose} className={styles.modal}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>
            <Building2 size={24} />
          </div>
          <div className={styles.formHeaderInfo}>
            <h3>{isEdit ? 'Editar cliente' : 'Crear nuevo cliente'}</h3>
            <p>
              {isEdit
                ? `Editando ${cliente?.nombre || 'cliente'}`
                : 'Registra un nuevo cliente en tu cartera'}
            </p>
          </div>
        </div>

        <div className={styles.formBody}>
          {/* ===== DATOS DE LA EMPRESA ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Briefcase size={16} />
              <span>Datos de la empresa</span>
            </div>

            <Input
              label="Nombre / Empresa *"
              placeholder="Ej: Laboratorios Unidos S.A."
              error={errors.nombre?.message}
              icon={<Building2 size={16} />}
              {...register('nombre')}
            />
            <Input
              label="Razón social"
              placeholder="Razón social completa"
              error={errors.razonSocial?.message}
              {...register('razonSocial')}
            />
            <Input
              label="RFC"
              placeholder="RFC (máx. 20 caracteres)"
              error={errors.rfc?.message}
              icon={<Tag size={16} />}
              {...register('rfc')}
            />
          </div>

          {/* ===== CLASIFICACIÓN ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Tag size={16} />
              <span>Clasificación</span>
            </div>
            <div className={styles.formRow}>
              <Select
                label="Tipo de cliente"
                error={errors.tipoId?.message}
                icon={<Tag size={16} />}
                {...register('tipoId')}
              >
                <option value="">— Sin especificar —</option>
                {lista(tiposQuery).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
              <Select
                label="Industria"
                error={errors.industriaId?.message}
                icon={<Briefcase size={16} />}
                {...register('industriaId')}
              >
                <option value="">— Sin especificar —</option>
                {lista(industriasQuery).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <Select
              label="Zona geográfica"
              error={errors.zonaId?.message}
              icon={<MapPin size={16} />}
              {...register('zonaId')}
            >
              <option value="">— Sin especificar —</option>
              {lista(zonasQuery).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>

          {/* ===== CONTACTO ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Phone size={16} />
              <span>Contacto</span>
            </div>
            <div className={styles.formRow}>
              <Input
                label="Teléfono principal"
                placeholder="+57 300 123 4567"
                error={errors.telefonoPrincipal?.message}
                icon={<Phone size={16} />}
                {...register('telefonoPrincipal')}
              />
              <Input
                label="Correo principal"
                type="email"
                placeholder="contacto@empresa.com"
                error={errors.emailPrincipal?.message}
                icon={<Mail size={16} />}
                {...register('emailPrincipal')}
              />
            </div>
            <div className={styles.formRow}>
              <Input
                label="Sitio web"
                placeholder="https://www.empresa.com"
                error={errors.sitioWeb?.message}
                icon={<Globe size={16} />}
                {...register('sitioWeb')}
              />
              <Input
                label="Fecha de primera compra"
                type="date"
                error={errors.fechaPrimeraCompra?.message}
                icon={<Calendar size={16} />}
                {...register('fechaPrimeraCompra')}
              />
            </div>
          </div>

          {/* ===== UBICACIÓN ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <MapPin size={16} />
              <span>Ubicación</span>
            </div>
            <Input
              label="Dirección"
              placeholder="Calle, número, colonia, código postal"
              error={errors.direccion?.message}
              icon={<MapPin size={16} />}
              {...register('direccion')}
            />
            <div className={styles.formRow}>
              <Input
                label="Ciudad"
                placeholder="Ciudad"
                error={errors.ciudad?.message}
                icon={<MapPin size={16} />}
                {...register('ciudad')}
              />
              <Input
                label="Estado / Región"
                placeholder="Estado o región"
                error={errors.estadoRegion?.message}
                {...register('estadoRegion')}
              />
            </div>
          </div>

          {/* ===== ASIGNACIÓN ===== */}
          {puedeAsignarEjecutivo && !usuariosQuery.isError && usuarios.length > 0 && (
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <Users size={16} />
                <span>Asignación</span>
              </div>
              <Select
                label="Ejecutivo asignado"
                error={errors.ejecutivoId?.message}
                icon={<User size={16} />}
                {...register('ejecutivoId')}
              >
                <option value="">— Sin cambio —</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.nombre, u.apellido].filter(Boolean).join(' ')}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* ===== NOTAS ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <FileText size={16} />
              <span>Notas</span>
            </div>
            <label className={styles.textareaLabel}>
              <span>Notas adicionales <span className={styles.optional}>(opcional)</span></span>
              <textarea
                rows={3}
                maxLength={1000}
                className={styles.textarea}
                placeholder="Información adicional sobre el cliente..."
                {...register('notas')}
              />
            </label>
          </div>
        </div>

        {(tiposQuery.isError || industriasQuery.isError || zonasQuery.isError) && (
          <div className={styles.errorContainer}>
            <ErrorMessage message="No se pudieron cargar los catálogos. Intenta de nuevo." />
          </div>
        )}

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.footerHint}>
              <HelpCircle size={14} />
              Los campos con * son obligatorios
            </span>
          </div>
          <div className={styles.footerRight}>
            <Button type="button" variant="secondary" onClick={onClose} className={styles.cancelBtn}>
              <X size={16} />
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} className={styles.submitBtn}>
              <Save size={16} />
              {isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
