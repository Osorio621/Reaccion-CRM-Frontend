import { useEffect, useState } from 'react';
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
import { useClientes } from '../../hooks/useClientes';
import { useCreateOportunidad } from '../../hooks/useOportunidades';
import {
  Briefcase,
  User,
  DollarSign,
  Target,
  Calendar,
  Clock,
  FileText,
  Save,
  X,
  TrendingUp,
  AlertCircle,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Search,
  Building2
} from 'lucide-react';
import styles from './Oportunidades.module.css';

const numeroEntero = /^\d+(\.\d{1,2})?$/;

const oportunidadSchema = z.object({
  clienteId: z.string().min(1, 'El cliente es obligatorio'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(150),
  valor: z
    .string()
    .min(1, 'El valor es obligatorio')
    .regex(numeroEntero, 'Valor inválido (ej. 85000.00)'),
  probabilidad: z
    .string()
    .min(1, 'La probabilidad es obligatoria')
    .refine((v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, 'Debe estar entre 0 y 100'),
  etapaId: z.string().min(1, 'La etapa es obligatoria'),
  fechaEstimadaCierre: z.string().min(1, 'La fecha estimada de cierre es obligatoria'),
  proximaAccion: z.string().trim().min(1, 'La próxima acción es obligatoria').max(200),
  fechaProximaAccion: z.string().min(1, 'La fecha de la próxima acción es obligatoria'),
  descripcion: z.string().max(1000).optional().or(z.literal('')),
});

const valoresVacios = {
  clienteId: '',
  nombre: '',
  valor: '',
  probabilidad: '',
  etapaId: '',
  fechaEstimadaCierre: '',
  proximaAccion: '',
  fechaProximaAccion: '',
  descripcion: '',
};

// Colores para etapas
const ETAPA_COLORS = {
  'Prospección': '#2563eb',
  'Calificación': '#8b5cf6',
  'Propuesta': '#f59e0b',
  'Negociación': '#10b981',
  'Cierre': '#059669'
};

const ETAPA_ICONS = {
  'Prospección': '🔍',
  'Calificación': '📋',
  'Propuesta': '📄',
  'Negociación': '🤝',
  'Cierre': '🎯'
};

export default function OportunidadFormModal({ open, onClose, clientePreseleccionado = null }) {
  const createOportunidad = useCreateOportunidad();
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('');

  const etapasQuery = useCatalogosPorTipo('ETAPA_PIPELINE', open);
  const clientesQuery = useClientes();
  const etapas = Array.isArray(etapasQuery.data) ? etapasQuery.data : [];
  const clientesRaw = clientesQuery.data;
  const clientes = clientesRaw?.contenido ?? (Array.isArray(clientesRaw) ? clientesRaw : []);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = busquedaCliente
    ? clientes.filter(c => 
        c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        (c.rfc && c.rfc.toLowerCase().includes(busquedaCliente.toLowerCase())) ||
        (c.emailPrincipal && c.emailPrincipal.toLowerCase().includes(busquedaCliente.toLowerCase()))
      )
    : clientes;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ 
    resolver: zodResolver(oportunidadSchema), 
    defaultValues: valoresVacios,
    mode: 'onChange'
  });

  const probabilidadValue = watch('probabilidad');
  const valorValue = watch('valor');
  const etapaIdValue = watch('etapaId');
  const clienteIdValue = watch('clienteId');

  // Obtener el cliente seleccionado
  const clienteSeleccionado = clientes.find(c => String(c.id) === clienteIdValue);

  // Obtener la etapa seleccionada
  const etapaSeleccionadaObj = etapas.find(e => String(e.id) === etapaIdValue);

  useEffect(() => {
    if (!open) return;
    reset({
      ...valoresVacios,
      clienteId: clientePreseleccionado ? String(clientePreseleccionado.id) : '',
    });
    setBusquedaCliente('');
    setEtapaSeleccionada('');
  }, [open, clientePreseleccionado, reset]);

  // Actualizar etapa seleccionada cuando cambia el valor
  useEffect(() => {
    if (etapaIdValue) {
      const etapa = etapas.find(e => String(e.id) === etapaIdValue);
      setEtapaSeleccionada(etapa?.nombre || '');
    }
  }, [etapaIdValue, etapas]);

  // Calcular valor ponderado
  const valorPonderado = probabilidadValue && valorValue 
    ? (Number(valorValue) * Number(probabilidadValue)) / 100 
    : 0;

  // Obtener nivel de probabilidad
  const getProbabilidadNivel = (valor) => {
    const num = Number(valor);
    if (num >= 80) return { label: 'Alta', color: '#10b981', icon: '🔥' };
    if (num >= 50) return { label: 'Media', color: '#f59e0b', icon: '📊' };
    if (num > 0) return { label: 'Baja', color: '#ef4444', icon: '⚠️' };
    return null;
  };

  const nivelProbabilidad = getProbabilidadNivel(probabilidadValue);

  const onSubmit = async (data) => {
    const payload = {
      clienteId: Number(data.clienteId),
      nombre: data.nombre,
      valor: Number(data.valor),
      probabilidad: Number(data.probabilidad),
      etapaId: Number(data.etapaId),
      fechaEstimadaCierre: data.fechaEstimadaCierre,
      proximaAccion: data.proximaAccion,
      fechaProximaAccion: data.fechaProximaAccion,
      descripcion: data.descripcion || undefined,
    };
    try {
      await createOportunidad.mutateAsync(payload);
      toast.success('✅ Oportunidad creada exitosamente');
      onClose();
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaCliente('');
  };

  return (
    <Modal open={open} title="Nueva oportunidad" onClose={onClose} className={styles.modal}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.formHeaderInfo}>
            <h3>Crear nueva oportunidad</h3>
            <p>Ingresa los datos de la oportunidad de negocio</p>
          </div>
          <div className={styles.formHeaderBadge}>
            <Zap size={14} />
            <span>Nueva</span>
          </div>
        </div>

        <div className={styles.formBody}>
          {/* ===== CLIENTE ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <User size={16} />
              <span>Cliente</span>
              {clienteSeleccionado && (
                <span className={styles.sectionBadge}>
                  <CheckCircle size={12} />
                  Seleccionado
                </span>
              )}
            </div>

            {clientePreseleccionado ? (
              <div className={styles.clientePreseleccionado}>
                <div className={styles.clientePreseleccionadoAvatar}>
                  {clientePreseleccionado.nombre?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className={styles.clientePreseleccionadoInfo}>
                  <span className={styles.clientePreseleccionadoNombre}>
                    {clientePreseleccionado.nombre}
                  </span>
                  {clientePreseleccionado.emailPrincipal && (
                    <span className={styles.clientePreseleccionadoEmail}>
                      {clientePreseleccionado.emailPrincipal}
                    </span>
                  )}
                </div>
                <input type="hidden" {...register('clienteId')} value={clientePreseleccionado.id} />
              </div>
            ) : (
              <div className={styles.clienteSelectContainer}>
                <div className={styles.clienteSearch}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, RFC o email..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className={styles.clienteSearchInput}
                  />
                  {busquedaCliente && (
                    <button type="button" className={styles.clearSearch} onClick={limpiarBusqueda}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <Select
                  label="Selecciona un cliente *"
                  error={errors.clienteId?.message}
                  icon={<Building2 size={16} />}
                  {...register('clienteId')}
                >
                  <option value="">— Selecciona un cliente —</option>
                  {clientesFiltrados.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.rfc ? `(${c.rfc})` : ''}
                    </option>
                  ))}
                </Select>

                {clientesFiltrados.length === 0 && busquedaCliente && (
                  <div className={styles.sinResultados}>
                    <AlertCircle size={16} />
                    <span>No se encontraron clientes con "{busquedaCliente}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== INFORMACIÓN GENERAL ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Briefcase size={16} />
              <span>Información general</span>
            </div>

            <Input
              label="Nombre de la oportunidad *"
              placeholder="Ej. Suministro de reactivos grado analítico"
              error={errors.nombre?.message}
              icon={<Briefcase size={16} />}
              {...register('nombre')}
            />

            <Input
              label="Descripción"
              placeholder="Descripción detallada de la oportunidad..."
              error={errors.descripcion?.message}
              {...register('descripcion')}
              className={styles.textareaInput}
            />
          </div>

          {/* ===== VALOR Y PROBABILIDAD ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <DollarSign size={16} />
              <span>Valor y probabilidad</span>
              {nivelProbabilidad && (
                <span 
                  className={styles.probabilidadBadge}
                  style={{ backgroundColor: nivelProbabilidad.color + '15', color: nivelProbabilidad.color }}
                >
                  {nivelProbabilidad.icon} {nivelProbabilidad.label}
                </span>
              )}
            </div>

            <div className={styles.formRow}>
              <Input
                label="Valor estimado (COP) *"
                type="number"
                step="0.01"
                min="0"
                placeholder="85000.00"
                error={errors.valor?.message}
                icon={<DollarSign size={16} />}
                {...register('valor')}
              />
              <Input
                label="Probabilidad (%) *"
                type="number"
                min="0"
                max="100"
                placeholder="75"
                error={errors.probabilidad?.message}
                icon={<Target size={16} />}
                {...register('probabilidad')}
              />
            </div>

            {valorPonderado > 0 && (
              <div className={styles.ponderadoInfo}>
                <div className={styles.ponderadoLeft}>
                  <span className={styles.ponderadoLabel}>Valor ponderado:</span>
                  <span className={styles.ponderadoValue}>
                    ${valorPonderado.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className={styles.ponderadoRight}>
                  <span className={styles.ponderadoHint}>
                    {probabilidadValue || 0}% de ${Number(valorValue || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ===== ETAPA Y FECHAS ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Calendar size={16} />
              <span>Etapa y fechas</span>
              {etapaSeleccionadaObj && (
                <span 
                  className={styles.etapaBadge}
                  style={{ 
                    backgroundColor: (ETAPA_COLORS[etapaSeleccionada] || '#2563eb') + '15',
                    color: ETAPA_COLORS[etapaSeleccionada] || '#2563eb'
                  }}
                >
                  {ETAPA_ICONS[etapaSeleccionada] || '📌'} {etapaSeleccionada}
                </span>
              )}
            </div>

            <div className={styles.formRow}>
              <Select
                label="Etapa *"
                error={errors.etapaId?.message}
                icon={<Target size={16} />}
                {...register('etapaId')}
              >
                <option value="">— Selecciona una etapa —</option>
                {etapas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {ETAPA_ICONS[c.nombre] || '📌'} {c.nombre} ({c.probabilidadDefault}%)
                  </option>
                ))}
              </Select>
              <Input
                label="Fecha estimada de cierre *"
                type="date"
                error={errors.fechaEstimadaCierre?.message}
                icon={<Calendar size={16} />}
                {...register('fechaEstimadaCierre')}
              />
            </div>
          </div>

          {/* ===== PRÓXIMA ACCIÓN ===== */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>
              <Clock size={16} />
              <span>Próxima acción</span>
            </div>

            <div className={styles.formRow}>
              <Input
                label="Próxima acción *"
                placeholder="Ej. Presentar propuesta formal"
                error={errors.proximaAccion?.message}
                icon={<Clock size={16} />}
                {...register('proximaAccion')}
              />
              <Input
                label="Fecha de próxima acción *"
                type="date"
                error={errors.fechaProximaAccion?.message}
                icon={<Calendar size={16} />}
                {...register('fechaProximaAccion')}
              />
            </div>
          </div>
        </div>

        {(etapasQuery.isError || clientesQuery.isError) && (
          <div className={styles.errorContainer}>
            <AlertCircle size={16} />
            <span>No se pudieron cargar los datos necesarios. Intenta de nuevo.</span>
          </div>
        )}

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.footerHint}>
              <HelpCircle size={14} />
              Todos los campos marcados con * son obligatorios
            </span>
          </div>
          <div className={styles.footerRight}>
            <Button type="button" variant="secondary" onClick={onClose} className={styles.cancelBtn}>
              <X size={16} />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={isSubmitting} 
              className={styles.submitBtn}
              disabled={!isValid || isSubmitting}
            >
              <Save size={16} />
              Crear oportunidad
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}