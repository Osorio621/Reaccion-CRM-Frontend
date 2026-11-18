import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/archivos.api';
import { useAuthStore } from '../store/authStore';

export function useArchivos(tipo, entidadId, enabled = true) {
  return useQuery({
    queryKey: ['archivos', tipo, entidadId],
    queryFn: () => api.getArchivos(tipo, entidadId).then((r) => r.data),
    enabled: enabled && !!tipo && !!entidadId,
  });
}

export function useUploadArchivo(tipo, entidadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.uploadArchivo(tipo, entidadId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archivos', tipo, entidadId] });
    },
  });
}

export function useDeleteArchivo(tipo, entidadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archivoId) => api.deleteArchivo(archivoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archivos', tipo, entidadId] });
    },
  });
}

export async function downloadFileHelper(archivoId, nombreOriginal) {
  const response = await api.descargarArchivo(archivoId);
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreOriginal || `archivo_${archivoId}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}