import { useState } from 'react';
import { 
  Lock, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  User,
  DollarSign,
  Target,
  Clock
} from 'lucide-react';
import {
  useOportunidades,
  useCerrarOportunidad,
} from '../../hooks/useOportunidades';
import { useCatalogosPorTipo } from '../../hooks/useCatalogos';
import { useClientes } from '../../hooks/useClientes';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import CerrarOportunidadModal from './CerrarOportunidadModal';
import OportunidadFormModal from './OportunidadFormModal';
import styles from './Oportunidades.module.css';

export default function OportunidadesPage() {
  const [aCerrar, setACerrar] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useOportunidades();
  const cerrar = useCerrarOportunidad();

  const etapasQuery = useCatalogosPorTipo('ETAPA_PIPELINE');
  const clientesQuery = useClientes();
  const etapas = Array.isArray(etapasQuery.data) ? etapasQuery.data : [];
  const etapaPorId = Object.fromEntries(etapas.map((c) => [c.id, c.nombre]));
  const clientesRaw = clientesQuery.data;
  const clientes = clientesRaw?.contenido ?? (Array.isArray(clientesRaw) ? clientesRaw : []);
  const clientePorId = Object.fromEntries(clientes.map((c) => [c.id, c.nombre]));

  const oportunidades = data?.contenido ?? (Array.isArray(data) ? data : []);

  // Calcular estadísticas
  const totalOportunidades = oportunidades.length;
  const valorTotal = oportunidades.reduce((acc, o) => acc + Number(o.valor ?? 0), 0);
  const oportunidadesAbiertas = oportunidades.filter(o => !o.estado || o.estado === 'ACTIVA' || o.estado === 'ABIERTA').length;

  const confirmarCierre = async (oportunidad, cierre) => {
    await cerrar.mutateAsync({
      id: oportunidad.id,
      data: {
        estado: cierre.estado,
        motivoPerdida: cierre.motivoPerdida || null,
        fechaCierreReal: new Date().toISOString().slice(0, 10),
      },
    });
    toast.success(`✅ Oportunidad marcada como ${cierre.estado.toLowerCase()}`);
    setACerrar(null);
  };

  const getEtapaColor = (etapaId) => {
    const etapa = etapas.find(e => e.id === etapaId);
    if (!etapa) return 'gray';
    const colors = {
      'Prospección': 'primary',
      'Calificación': 'info',
      'Propuesta': 'warning',
      'Negociación': 'success',
      'Cierre': 'success'
    };
    return colors[etapa.nombre] || 'gray';
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.toolbarIcon}>
            <Briefcase size={28} />
          </div>
          <div className={styles.toolbarInfo}>
            <h1>Oportunidades</h1>
            <p>Gestiona las oportunidades de negocio del CRM</p>
          </div>
        </div>
        <div className={styles.toolbarActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.newButton}>
            <Plus size={16} />
            Nueva oportunidad
          </Button>
        </div>
      </div>

      {/* Stats resumen */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Briefcase size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalOportunidades}</span>
            <span className={styles.statLabel}>Total oportunidades</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>${valorTotal.toLocaleString('es-CO')}</span>
            <span className={styles.statLabel}>Valor total</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>
            <Target size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{oportunidadesAbiertas}</span>
            <span className={styles.statLabel}>Abiertas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <Clock size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {oportunidades.filter(o => o.estado === 'GANADA').length}
            </span>
            <span className={styles.statLabel}>Ganadas</span>
          </div>
        </div>
      </div>

      {isError && (
        <ErrorMessage message={extractErrorMessage(error)} onRetry={() => refetch()} />
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size={32} />
          <p>Cargando oportunidades...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <Table
            columns={[
              {
                key: 'nombre',
                header: 'Oportunidad',
                render: (row) => (
                  <div className={styles.oportunidadCell}>
                    <span className={styles.oportunidadNombre}>{row.nombre}</span>
                    {row.descripcion && (
                      <span className={styles.oportunidadDescripcion}>{row.descripcion}</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'cliente',
                header: 'Cliente',
                render: (row) => (
                  <div className={styles.clienteCell}>
                    <div className={styles.clienteAvatar}>
                      {(clientePorId[row.clienteId] || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.clienteNombre}>
                      {clientePorId[row.clienteId] ?? `Cliente #${row.clienteId}`}
                    </span>
                  </div>
                ),
              },
              {
                key: 'valor',
                header: 'Valor',
                render: (row) => (
                  <div>
                    <div className={styles.valorCell}>
                      ${Number(row.valor ?? 0).toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    {row.probabilidad && (
                      <div className={styles.valorCellSmall}>
                        {row.probabilidad}% probabilidad
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'etapa',
                header: 'Etapa',
                render: (row) => {
                  const etapaColor = getEtapaColor(row.etapaId);
                  return (
                    <div className={styles.etapaCell}>
                      <span className={`${styles.etapaDot} ${styles[`etapaDot${etapaColor.charAt(0).toUpperCase() + etapaColor.slice(1)}`]}`} />
                      <span className={styles.etapaNombre}>
                        {etapaPorId[row.etapaId] ?? '—'}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (row) =>
                  row.estado === 'GANADA' ? (
                    <Badge tone="success" className={styles.statusBadge}>
                      Ganada
                    </Badge>
                  ) : row.estado === 'PERDIDA' ? (
                    <Badge tone="danger" className={styles.statusBadge}>
                      Perdida
                    </Badge>
                  ) : (
                    <Badge tone="info" className={styles.statusBadge}>
                      Abierta
                    </Badge>
                  ),
              },
              {
                key: 'acciones',
                header: '',
                className: styles.actionsColumn,
                render: (row) =>
                  !row.estado || row.estado === 'ACTIVA' || row.estado === 'ABIERTA' ? (
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnSuccess}`}
                        onClick={() => setACerrar(row)}
                        title="Cerrar oportunidad"
                      >
                        <Lock size={14} />
                      </button>
                    </div>
                  ) : null,
              },
            ]}
            data={oportunidades}
            emptyMessage={
              <div className={styles.emptyState}>
                <Briefcase size={48} />
                <p>No hay oportunidades registradas</p>
                <Button variant="secondary" onClick={() => setFormOpen(true)}>
                  <Plus size={16} />
                  Crear primera oportunidad
                </Button>
              </div>
            }
          />
        </div>
      )}

      <OportunidadFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <CerrarOportunidadModal
        open={!!aCerrar}
        oportunidad={aCerrar}
        onClose={() => setACerrar(null)}
        onConfirm={confirmarCierre}
      />
    </div>
  );
}