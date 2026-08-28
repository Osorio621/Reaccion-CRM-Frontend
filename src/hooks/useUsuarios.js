import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/usuarios.api';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.getUsuarios().then((r) => r.data),
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateUsuario(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      qc.invalidateQueries({ queryKey: ['usuarios', id] });
    },
  });
}
