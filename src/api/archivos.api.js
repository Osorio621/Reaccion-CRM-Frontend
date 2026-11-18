import axiosClient from './axiosClient';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed'
];

export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export function validateFile(file) {
  const errors = [];
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`El archivo "${file.name}" supera el tamaño máximo permitido de 30 MB`);
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip'];
  if (!allowedExts.includes(ext)) {
    errors.push(`El archivo "${file.name}" tiene una extensión no permitida (.${ext})`);
  }
  return { isValid: errors.length === 0, errors };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'file-text';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'table';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  return 'file';
}

export const getArchivos = (tipo, entidadId) =>
  axiosClient.get(`/${tipo}/${entidadId}/archivos`);

export const uploadArchivo = (tipo, entidadId, formData) => {
  // Manejo flexible si se recibe objeto de parámetros
  if (typeof tipo === 'object' && tipo !== null) {
    const { tipo: t, entidadId: e, formData: f } = tipo;
    return axiosClient.post(`/${t}/${e}/archivos`, f, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return axiosClient.post(`/${tipo}/${entidadId}/archivos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const descargarArchivo = (archivoId) =>
  axiosClient.get(`/archivos/${archivoId}/descargar`, {
    responseType: 'blob',
  });

export const deleteArchivo = (archivoId) =>
  axiosClient.delete(`/archivos/${archivoId}`);