import { useState } from 'react';
import { FolderOpen, MessageSquare } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ArchivosAdjuntosSection from '../../components/ArchivosAdjuntosSection';
import HistorialComunicacionesSection from '../../components/HistorialComunicacionesSection';
import styles from './ProspectoDetalleModal.module.css';

export default function ProspectoDetalleModal({ open, prospecto, onClose }) {
  const [activeTab, setActiveTab] = useState('archivos');

  if (!open || !prospecto) return null;

  const nombreMostrado = prospecto.nombre ?? prospecto.empresa ?? `Prospecto #${prospecto.id}`;

  return (
    <Modal
      open={open}
      title={nombreMostrado}
      onClose={onClose}
      className={styles.modal}
    >
      <div className={styles.header}>
        <div className={styles.prospectoInfo}>
          <div className={styles.prospectoAvatar}>
            {(prospecto.nombre?.charAt(0) || prospecto.empresa?.charAt(0) || 'P').toUpperCase()}
          </div>
          <div>
            <h3 className={styles.prospectoNombre}>{prospecto.empresa || prospecto.nombre}</h3>
            {prospecto.nombre && prospecto.empresa && (
              <p className={styles.prospectoContacto}>{prospecto.nombre}</p>
            )}
            <div className={styles.prospectoMeta}>
              {prospecto.telefono && (
                <span className={styles.metaItem}>
                  📞 {prospecto.telefono}
                </span>
              )}
              {prospecto.email && (
                <span className={styles.metaItem}>
                  ✉️ {prospecto.email}
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
        <ArchivosAdjuntosSection tipo="prospectos" entidadId={prospecto.id} className={styles.section} />
      )}

      {activeTab === 'comunicaciones' && (
        <HistorialComunicacionesSection tipo="prospectos" entidadId={prospecto.id} className={styles.section} />
      )}
    </Modal>
  );
}