import axiosClient from './axiosClient';

export const getVisitas = (p) => axiosClient.get('/visitas', { params: p });
export const getVisita = (id) => axiosClient.get(`/visitas/${id}`);
export const createVisita = (d) => axiosClient.post('/visitas', d);
export const updateVisita = (id, d) => axiosClient.put(`/visitas/${id}`, d);
