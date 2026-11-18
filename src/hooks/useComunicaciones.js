import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/comunicaciones.api';

export function useComunicaciones(tipo, entidadId, enabled = true) {
  return useQuery({
    queryKey: ['comunicaciones', tipo, entidadId],
    queryFn: () => api.getComunicaciones(tipo, entidadId).then((r) => r.data),
    enabled: enabled && !!tipo && !!entidadId,
  });
}

export function useCreateComunicacion(tipo, entidadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createComunicacion(tipo, entidadId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicaciones', tipo, entidadId] });
    },
  });
}

export function useUpdateComunicacion(tipo, entidadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateComunicacion(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicaciones', tipo, entidadId] });
    },
  });
}

export function useDeleteComunicacion(tipo, entidadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteComunicacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicaciones', tipo, entidadId] });
    },
  });
}