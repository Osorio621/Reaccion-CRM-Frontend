import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/contactos.api';

export function useContactos(clienteId) {
  return useQuery({
    queryKey: ['contactos', clienteId],
    queryFn: () => api.getContactos(clienteId).then((r) => r.data),
    enabled: !!clienteId,
  });
}

export function useCreateContacto(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createContacto(clienteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contactos', clienteId] }),
  });
}

export function useUpdateContacto(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactoId, data }) =>
      api.updateContacto(clienteId, contactoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contactos', clienteId] }),
  });
}

export function useDeleteContacto(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactoId) => api.deleteContacto(clienteId, contactoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contactos', clienteId] }),
  });
}
