import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/clientes.api';

export function useClientes(params) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => api.getClientes(params).then((r) => r.data),
  });
}

export function useCliente(id) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => api.getCliente(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCliente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateCliente(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['clientes', id] });
    },
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCliente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useReasignarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nuevoEjecutivoId }) => api.reasignarCliente(id, nuevoEjecutivoId),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['clientes', id] });
    },
  });
}

export function useTickets(clienteId) {
  return useQuery({
    queryKey: ['tickets', clienteId],
    queryFn: () => api.getTickets(clienteId).then((r) => r.data),
    enabled: !!clienteId,
  });
}

export function useEnviarTickets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clienteId) => api.enviarTickets(clienteId),
    onSuccess: (_d, clienteId) => {
      qc.invalidateQueries({ queryKey: ['tickets', clienteId] });
    },
  });
}
