import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/oportunidades.api';

export function useOportunidades(params) {
  return useQuery({
    queryKey: ['oportunidades', params],
    queryFn: () => api.getOportunidades(params).then((r) => r.data),
  });
}

export function useOportunidad(id) {
  return useQuery({
    queryKey: ['oportunidades', id],
    queryFn: () => api.getOportunidad(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateOportunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOportunidad,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oportunidades'] });
      qc.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}

export function useUpdateOportunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateOportunidad(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['oportunidades'] });
      qc.invalidateQueries({ queryKey: ['oportunidades', id] });
      qc.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}

export function useCambiarEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.cambiarEtapa(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline'] });
      qc.invalidateQueries({ queryKey: ['oportunidades'] });
    },
  });
}

export function useCerrarOportunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.cerrarOportunidad(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oportunidades'] });
      qc.invalidateQueries({ queryKey: ['pipeline'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useHistorialOportunidad(id) {
  return useQuery({
    queryKey: ['oportunidades', id, 'historial'],
    queryFn: () => api.getHistorial(id).then((r) => r.data),
    enabled: !!id,
  });
}
