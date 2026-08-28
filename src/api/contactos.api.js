import axiosClient from './axiosClient';

export const getContactos = (clienteId) =>
  axiosClient.get(`/clientes/${clienteId}/contactos`);
export const createContacto = (clienteId, data) =>
  axiosClient.post(`/clientes/${clienteId}/contactos`, data);
export const updateContacto = (clienteId, contactoId, data) =>
  axiosClient.put(`/clientes/${clienteId}/contactos/${contactoId}`, data);
export const deleteContacto = (clienteId, contactoId) =>
  axiosClient.delete(`/clientes/${clienteId}/contactos/${contactoId}`);
