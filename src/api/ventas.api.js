import axiosClient from './axiosClient';

export const getVentas = (p) => axiosClient.get('/ventas', { params: p });
export const createVenta = (d) => axiosClient.post('/ventas', d);
export const updateVenta = (id, d) => axiosClient.put(`/ventas/${id}`, d);
