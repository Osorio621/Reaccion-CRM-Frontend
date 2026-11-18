import { useState } from 'react';
import { FolderOpen, MessageSquare } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ArchivosAdjuntosSection from '../../components/ArchivosAdjuntosSection';
import HistorialComunicacionesSection from '../../components/HistorialComunicacionesSection';
import styles from './OportunidadDetalleModal.module.css';

export default function OportunidadDetalleModal({ open, oportunidad, onClose }) {
  const [activeTab, setActiveTab] = useState('archivos');

  if (!open || !oportunidad) return null;

  const nombreMostrado = oportunidad.asunto ?? oportunidad.nombre ?? `Oportunidad #${oportunidad.id}`;

  return (
    <Modal
      open={open}
      title={nombreMostrado}
      onClose={onClose}
      className={styles.modal}
    >
      <div className={styles.header}>
        <div className={styles.oportunidadInfo}>
          <div className={styles.oportunidadAvatar}>
            {oportunidad.asunto?.charAt(0)?.toUpperCase() || 'O'}
          </div>
          <div>
            <h3 className={styles.oportunidadNombre}>{oportunidad.asunto || oportunidad.nombre}</h3>
            <div className={styles.oportunidadMeta}>
              {oportunidad.clienteNombre && (
                <span className={styles.metaItem}>
                  🏢 {oportunidad.clienteNombre}
                </span>
              )}
              {oportunidad.valor && (
                <span className={styles.metaItem}>
                  💰 {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(oportunidad.valor)}
                </span>
              )}
              {oportunidad.etapaNombre && (
                <span className={styles.metaItem}>
                  📍 {oportunidad.etapaNombre}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'archivos' ? styles.active : ''}`}
          onClick={() => setActiveTab('archivos')}
        >
          <FolderOpen size={16} />
          Archivos
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'comunicaciones' ? styles.active : ''}`}
          onClick={() => setActiveTab('comunicaciones')}
        >
          <MessageSquare size={16} />
          Comunicaciones
        </button>
      </div>

      {activeTab === 'archivos' && (
        <ArchivosAdjuntosSection tipo="oportunidades" entidadId={oportunidad.id} className={styles.section} />
      )}

      {activeTab === 'comunicaciones' && (
        <HistorialComunicacionesSection tipo="oportunidades" entidadId={oportunidad.id} className={styles.section} />
      )}
    </Modal>
  );
}