import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/seguimientos.api';

export function useSeguimientos(params) {
  return useQuery({
    queryKey: ['seguimientos', params],
    queryFn: () => api.getSeguimientos(params).then((r) => r.data),
  });
}

export function useSeguimientosVencidos() {
  return useQuery({
    queryKey: ['seguimientos', 'vencidos'],
    queryFn: () => api.getSeguimientosVencidos().then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useCreateSeguimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSeguimiento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seguimientos'] }),
  });
}

export function useCerrarSeguimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.cerrarSeguimiento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seguimientos'] }),
  });
}
