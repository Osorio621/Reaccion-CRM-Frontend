import axiosClient from './axiosClient';

export const getClientes = (p) => axiosClient.get('/clientes', { params: p });
export const getCliente = (id) => axiosClient.get(`/clientes/${id}`);
export const createCliente = (d) => axiosClient.post('/clientes', d);
export const updateCliente = (id, d) => axiosClient.put(`/clientes/${id}`, d);
export const deleteCliente = (id) => axiosClient.delete(`/clientes/${id}`);
export const reasignarCliente = (id, nuevoEjecutivoId) =>
  axiosClient.patch(`/clientes/${id}/reasignar`, null, {
    params: { nuevoEjecutivoId },
  });
export const enviarTickets = (id) => axiosClient.post(`/clientes/${id}/enviar-tickets`, {});
export const getTickets = (id) => axiosClient.get(`/clientes/${id}/tickets`);
