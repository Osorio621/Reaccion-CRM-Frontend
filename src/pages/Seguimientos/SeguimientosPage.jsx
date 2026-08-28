import { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar, 
  User, 
  FileText,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useSeguimientosVencidos, useCerrarSeguimiento } from '../../hooks/useSeguimientos';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './SeguimientosPage.module.css';

export default function SeguimientosPage() {
  const { data, isLoading, isError, error, refetch } = useSeguimientosVencidos();
  const cerrar = useCerrarSeguimiento();
  const [cerrando, setCerrando] = useState(null);
  const [nota, setNota] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const vencidos = data?.contenido ?? data ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCerrar = () => {
    if (!nota.trim()) {
      toast.warning('Por favor, agrega una nota de cierre');
      return;
    }
    
    cerrar.mutate(
      { id: cerrando.id, data: { notaCierre: nota } },
      {
        onSuccess: () => {
          toast.success('✅ Seguimiento cerrado correctamente');
          setCerrando(null);
          setNota('');
          refetch();
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
      }
    );
  };

  // Estadísticas
  const getStats = () => {
    const total = vencidos.length;
    const critico = vencidos.filter(v => v.diasVencido > 7).length;
    const moderado = vencidos.filter(v => v.diasVencido > 3 && v.diasVencido <= 7).length;
    const leve = vencidos.filter(v => v.diasVencido <= 3).length;
    return { total, critico, moderado, leve };
  };

  const stats = getStats();

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Clock size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Seguimientos vencidos</h1>
            <p className={styles.pageSubtitle}>
              {vencidos.length > 0 
                ? `Tienes ${vencidos.length} seguimiento${vencidos.length !== 1 ? 's' : ''} pendiente${vencidos.length !== 1 ? 's' : ''} de revisar`
                : '¡Todo al día! No hay seguimientos vencidos'
              }
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
            className={styles.refreshBtn}
          >
            <RefreshCw size={16} className={isRefreshing ? styles.spinning : ''} />
            Actualizar
          </Button>
          {vencidos.length > 0 && (
            <Badge tone="danger" className={styles.totalBadge}>
              <AlertCircle size={14} />
              {vencidos.length} pendiente{vencidos.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {vencidos.length > 0 && (
        <div className={styles.statsContainer}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statIcon}>📊</div>
            <div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total vencidos</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statCritico}`}>
            <div className={styles.statIcon}>🔴</div>
            <div>
              <div className={styles.statValue}>{stats.critico}</div>
              <div className={styles.statLabel}>Críticos (&gt;7 días)</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statModerado}`}>
            <div className={styles.statIcon}>🟡</div>
            <div>
              <div className={styles.statValue}>{stats.moderado}</div>
              <div className={styles.statLabel}>Moderados (3-7 días)</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statLeve}`}>
            <div className={styles.statIcon}>🟢</div>
            <div>
              <div className={styles.statValue}>{stats.leve}</div>
              <div className={styles.statLabel}>Leves (&lt;3 días)</div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className={styles.autoRefreshIndicator}>
        <span className={styles.autoRefreshDot} />
        <span>Actualización automática cada minuto</span>
      </div>

      {/* Error state */}
      {isError && (
        <div className={styles.errorContainer}>
          <ErrorMessage 
            message={extractErrorMessage(error)} 
            onRetry={refetch}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size={40} />
          <p>Cargando seguimientos vencidos...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <Table
            columns={[
              { 
                key: 'clienteNombre', 
                header: 'Cliente',
                render: (row) => (
                  <div className={styles.clientCell}>
                    <div className={styles.clientAvatar}>
                      {row.clienteNombre?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className={styles.clientName}>{row.clienteNombre}</div>
                      {row.contacto && (
                        <div className={styles.clientContact}>{row.contacto}</div>
                      )}
                    </div>
                  </div>
                )
              },
              { 
                key: 'asunto', 
                header: 'Asunto',
                render: (row) => (
                  <div className={styles.asuntoCell}>
                    <FileText size={14} className={styles.asuntoIcon} />
                    <span>{row.asunto}</span>
                  </div>
                )
              },
              { 
                key: 'fechaCompromiso', 
                header: 'Fecha compromiso',
                render: (row) => (
                  <div className={styles.dateCell}>
                    <Calendar size={14} className={styles.dateIcon} />
                    <span>{formatDate(row.fechaCompromiso)}</span>
                  </div>
                )
              },
              {
                key: 'diasVencido',
                header: 'Días vencido',
                render: (row) => {
                  const isCritico = row.diasVencido > 7;
                  const isModerado = row.diasVencido > 3 && row.diasVencido <= 7;
                  return (
                    <div className={styles.diasContainer}>
                      <Badge 
                        tone={isCritico ? 'danger' : isModerado ? 'warning' : 'info'}
                        className={styles.diasBadge}
                      >
                        {isCritico && <AlertTriangle size={12} />}
                        {row.diasVencido} {row.diasVencido === 1 ? 'día' : 'días'}
                      </Badge>
                      {isCritico && (
                        <span className={styles.criticoLabel}>⚠️ Urgente</span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setCerrando(row)}
                    className={styles.cerrarBtn}
                  >
                    <CheckCircle size={16} />
                    Cerrar
                    <ChevronRight size={14} />
                  </Button>
                ),
              },
            ]}
            data={vencidos}
            emptyMessage={
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎉</div>
                <h3>Sin seguimientos vencidos</h3>
                <p>¡Excelente trabajo! Todos los seguimientos están al día.</p>
              </div>
            }
            className={styles.tableModern}
          />
        </div>
      )}

      {/* Modal de cierre */}
      <Modal 
        open={!!cerrando} 
        title="🔒 Cerrar seguimiento" 
        onClose={() => {
          setCerrando(null);
          setNota('');
        }}
        className={styles.modalContent}
      >
        <div className={styles.modalBody}>
          {cerrando && (
            <div className={styles.modalInfo}>
              <div className={styles.modalInfoRow}>
                <User size={16} />
                <span><strong>Cliente:</strong> {cerrando.clienteNombre}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <FileText size={16} />
                <span><strong>Asunto:</strong> {cerrando.asunto}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <Clock size={16} />
                <span><strong>Vencido:</strong> {cerrando.diasVencido} días</span>
              </div>
            </div>
          )}

          <div className={styles.modalForm}>
            <Input
              label="Nota de cierre"
              placeholder="Describe el resultado o acción tomada..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className={styles.modalInput}
              multiline
              rows={4}
            />
            <div className={styles.characterCount}>
              {nota.length}/500 caracteres
            </div>
          </div>

          {cerrar.isError && (
            <ErrorMessage message={extractErrorMessage(cerrar.error)} />
          )}

          <div className={styles.modalActions}>
            <Button 
              variant="secondary" 
              onClick={() => {
                setCerrando(null);
                setNota('');
              }}
              className={styles.modalCancelBtn}
            >
              <XCircle size={18} />
              Cancelar
            </Button>
            <Button 
              onClick={handleCerrar} 
              loading={cerrar.isPending}
              disabled={!nota.trim()}
              className={styles.modalConfirmBtn}
            >
              <CheckCircle size={18} />
              Confirmar cierre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}