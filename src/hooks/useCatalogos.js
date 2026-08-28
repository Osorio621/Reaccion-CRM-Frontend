import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/catalogos.api';

export function useCatalogos(params) {
  return useQuery({
    queryKey: ['catalogos', params],
    queryFn: () => api.getCatalogos(params).then((r) => r.data),
  });
}

export function useCatalogosPorTipo(tipo, enabled = true) {
  return useQuery({
    queryKey: ['catalogos', { tipo }],
    queryFn: () => api.getCatalogos({ tipo }).then((r) => r.data),
    enabled: enabled && !!tipo,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCatalogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCatalogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogos'] }),
  });
}

export function useUpdateCatalogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateCatalogo(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalogos'] });
      qc.invalidateQueries({ queryKey: ['catalogos', id] });
    },
  });
}

export function useDeleteCatalogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCatalogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogos'] }),
  });
}
