import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/visitas.api';

export function useVisitas(params) {
  return useQuery({
    queryKey: ['visitas', params],
    queryFn: () => api.getVisitas(params).then((r) => r.data),
  });
}

export function useCreateVisita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createVisita,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitas'] }),
  });
}

export function useUpdateVisita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateVisita(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['visitas'] });
      qc.invalidateQueries({ queryKey: ['visitas', id] });
    },
  });
}
