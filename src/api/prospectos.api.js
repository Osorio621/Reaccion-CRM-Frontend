import axiosClient from './axiosClient';

export const getProspectos = (p) => axiosClient.get('/prospectos', { params: p });
export const getProspecto = (id) => axiosClient.get(`/prospectos/${id}`);
export const createProspecto = (d) => axiosClient.post('/prospectos', d);
export const updateProspecto = (id, d) => axiosClient.put(`/prospectos/${id}`, d);
export const deleteProspecto = (id) => axiosClient.delete(`/prospectos/${id}`);
export const convertirProspecto = (id, data = {}) =>
  axiosClient.post(`/prospectos/${id}/convertir`, data);
