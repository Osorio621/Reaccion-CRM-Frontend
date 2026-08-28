import axiosClient from './axiosClient';

export const getCatalogos = (p) => axiosClient.get('/admin/catalogos', { params: p });
export const getCatalogo = (id) => axiosClient.get(`/admin/catalogos/${id}`);
export const createCatalogo = (d) => axiosClient.post('/admin/catalogos', d);
export const updateCatalogo = (id, d) => axiosClient.put(`/admin/catalogos/${id}`, d);
export const deleteCatalogo = (id) => axiosClient.delete(`/admin/catalogos/${id}`);
