import axiosClient from './axiosClient';

export const getUsuarios = () => axiosClient.get('/admin/usuarios');
export const getUsuario = (id) => axiosClient.get(`/admin/usuarios/${id}`);
export const createUsuario = (d) => axiosClient.post('/admin/usuarios', d);
export const updateUsuario = (id, d) => axiosClient.put(`/admin/usuarios/${id}`, d);
