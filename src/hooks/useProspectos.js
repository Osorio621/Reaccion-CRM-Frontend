import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/prospectos.api';

export function useProspectos(params) {
  return useQuery({
    queryKey: ['prospectos', params],
    queryFn: () => api.getProspectos(params).then((r) => r.data),
  });
}

export function useProspecto(id) {
  return useQuery({
    queryKey: ['prospectos', id],
    queryFn: () => api.getProspecto(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProspecto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospectos'] }),
  });
}

export function useUpdateProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateProspecto(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['prospectos'] });
      qc.invalidateQueries({ queryKey: ['prospectos', id] });
    },
  });
}

export function useDeleteProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProspecto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospectos'] }),
  });
}

export function useConvertirProspecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.convertirProspecto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospectos'] });
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
