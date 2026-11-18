import { useState } from 'react';
import { FolderOpen, MessageSquare } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ArchivosAdjuntosSection from '../../components/ArchivosAdjuntosSection';
import HistorialComunicacionesSection from '../../components/HistorialComunicacionesSection';
import styles from './VisitaDetalleModal.module.css';

export default function VisitaDetalleModal({ open, visita, onClose }) {
  const [activeTab, setActiveTab] = useState('archivos');

  if (!open || !visita) return null;

  const nombreMostrado = visita.asunto ?? visita.nombre ?? `Visita #${visita.id}`;

  return (
    <Modal
      open={open}
      title={nombreMostrado}
      onClose={onClose}
      className={styles.modal}
    >
      <div className={styles.header}>
        <div className={styles.visitaInfo}>
          <div className={styles.visitaAvatar}>
            {visita.asunto?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <div>
            <h3 className={styles.visitaNombre}>{visita.asunto || visita.nombre}</h3>
            <div className={styles.visitaMeta}>
              {visita.clienteNombre && (
                <span className={styles.metaItem}>
                  🏢 {visita.clienteNombre}
                </span>
              )}
              {visita.fecha && (
                <span className={styles.metaItem}>
                  📅 {new Date(visita.fecha).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
              {visita.tipoNombre && (
                <span className={styles.metaItem}>
                  🏷️ {visita.tipoNombre}
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
        <ArchivosAdjuntosSection tipo="visitas" entidadId={visita.id} className={styles.section} />
      )}

      {activeTab === 'comunicaciones' && (
        <HistorialComunicacionesSection tipo="visitas" entidadId={visita.id} className={styles.section} />
      )}
    </Modal>
  );
}