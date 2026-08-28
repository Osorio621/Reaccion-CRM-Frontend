import axiosClient from './axiosClient';

export const getOportunidades = (p) => axiosClient.get('/oportunidades', { params: p });
export const getOportunidad = (id) => axiosClient.get(`/oportunidades/${id}`);
export const createOportunidad = (d) => axiosClient.post('/oportunidades', d);
export const updateOportunidad = (id, d) => axiosClient.put(`/oportunidades/${id}`, d);
export const cambiarEtapa = (id, d) => axiosClient.patch(`/oportunidades/${id}/etapa`, d);
export const cerrarOportunidad = (id, d) =>
  axiosClient.patch(`/oportunidades/${id}/cerrar`, d);
export const getHistorial = (id) => axiosClient.get(`/oportunidades/${id}/historial`);
