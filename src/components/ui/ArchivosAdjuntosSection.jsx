import { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  Plus, 
  X, 
  File, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Archive,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useArchivos, useUploadArchivo, useDeleteArchivo, downloadFileHelper } from '../../hooks/useArchivos';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import Badge from './Badge';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import styles from './ArchivosAdjuntosSection.module.css';

const MAX_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB
const PERMITTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip'];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(nombre = '', mimeType = '') {
  const ext = nombre.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || mimeType.includes('image')) {
    return <ImageIcon size={20} />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet size={20} />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) {
    return <Archive size={20} />;
  }
  return <FileText size={20} />;
}

export default function ArchivosAdjuntosSection({ tipo, entidadId, titulo = 'Archivos adjuntos' }) {
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);

  const { data: archivosRaw, isLoading, isError, error, refetch } = useArchivos(tipo, entidadId);
  const uploadMutation = useUploadArchivo(tipo, entidadId);
  const deleteMutation = useDeleteArchivo(tipo, entidadId);

  const archivos = Array.isArray(archivosRaw) ? archivosRaw : archivosRaw?.contenido ?? [];

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('El archivo excede el tamaño máximo permitido (30 MB)');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!PERMITTED_EXTENSIONS.includes(ext)) {
      toast.error(`Formato .${ext} no permitido. Formatos permitidos: ${PERMITTED_EXTENSIONS.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('Selecciona un archivo para subir');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', selectedFile);
    if (descripcion.trim()) {
      formData.append('descripcion', descripcion.trim().slice(0, 300));
    }

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('✅ Archivo subido correctamente');
        setSelectedFile(null);
        setDescripcion('');
        setShowForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err));
      },
    });
  };

  const handleDownload = async (archivo) => {
    try {
      setDownloadingId(archivo.id);
      await downloadFileHelper(archivo.id, archivo.nombreOriginal);
      toast.success('Descarga iniciada');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = () => {
    if (!fileToDelete) return;
    deleteMutation.mutate(fileToDelete.id, {
      onSuccess: () => {
        toast.success('🗑️ Archivo eliminado');
        setFileToDelete(null);
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err));
      },
    });
  };

  return (
    <div className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FileText size={18} />
          </div>
          <h3 className={styles.title}>{titulo}</h3>
          {archivos.length > 0 && (
            <Badge tone="info">{archivos.length}</Badge>
          )}
        </div>
        {!showForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Adjuntar archivo
          </Button>
        )}
      </header>

      {/* Formulario de subida */}
      {showForm && (
        <form onSubmit={handleUpload} className={styles.uploadCard}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSelectFile}
            style={{ display: 'none' }}
          />

          {!selectedFile ? (
            <div className={styles.dropArea} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={32} className={styles.dropIcon} />
              <span className={styles.dropText}>Haz clic aquí para seleccionar un archivo</span>
              <span className={styles.dropSubtext}>
                Formatos: PDF, DOC, XLS, PNG, JPG, ZIP (Máx 30 MB)
              </span>
            </div>
          ) : (
            <div className={styles.fileSelectedInfo}>
              <div className={styles.fileDetails}>
                {getFileIcon(selectedFile.name, selectedFile.type)}
                <div>
                  <div className={styles.fileName}>{selectedFile.name}</div>
                  <div className={styles.fileSize}>{formatBytes(selectedFile.size)}</div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          <div className={styles.uploadInputs}>
            <Input
              label="Descripción (opcional)"
              placeholder="Ej. Contrato firmado 2026..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={styles.descInput}
              maxLength={300}
            />
          </div>

          <div className={styles.uploadActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
                setDescripcion('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={uploadMutation.isPending}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              <UploadCloud size={16} />
              Subir archivo
            </Button>
          </div>
        </form>
      )}

      {/* Estado de carga / error */}
      {isLoading && (
        <div className={styles.emptyState}>
          <Spinner size={24} />
          <p>Cargando archivos adjuntos...</p>
        </div>
      )}

      {isError && (
        <ErrorMessage message={extractErrorMessage(error)} onRetry={refetch} />
      )}

      {/* Listado de archivos */}
      {!isLoading && !isError && archivos.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <File size={32} />
          <p>Sin archivos adjuntos para este registro.</p>
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Subir primer archivo
          </Button>
        </div>
      )}

      {!isLoading && !isError && archivos.length > 0 && (
        <div className={styles.fileList}>
          {archivos.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileItemLeft}>
                <div className={styles.fileTypeIcon}>
                  {getFileIcon(file.nombreOriginal, file.tipoMime)}
                </div>
                <div className={styles.fileMeta}>
                  <span className={styles.fileTitle} title={file.nombreOriginal}>
                    {file.nombreOriginal}
                  </span>
                  {file.descripcion && (
                    <span className={styles.fileDesc}>{file.descripcion}</span>
                  )}
                  <span className={styles.fileSub}>
                    {formatBytes(file.tamanoBytes)} · {new Date(file.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.fileActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Descargar archivo"
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id}
                >
                  {downloadingId === file.id ? <Spinner size={16} /> : <Download size={16} />}
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconDanger}`}
                  title="Eliminar archivo"
                  onClick={() => setFileToDelete(file)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={!!fileToDelete}
        title="🗑️ Eliminar archivo"
        onClose={() => setFileToDelete(null)}
      >
        <div className={styles.modalBody}>
          <p>
            ¿Estás seguro de que deseas eliminar el archivo{' '}
            <strong>{fileToDelete?.nombreOriginal}</strong>?
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setFileToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
