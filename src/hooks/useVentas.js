import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/ventas.api';

export function useVentas(params) {
  return useQuery({
    queryKey: ['ventas', params],
    queryFn: () => api.getVentas(params).then((r) => r.data),
  });
}

export function useCreateVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateVenta(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ queryKey: ['ventas', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
