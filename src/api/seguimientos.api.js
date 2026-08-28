import axiosClient from './axiosClient';

export const getSeguimientos = (p) => axiosClient.get('/seguimientos', { params: p });
export const getSeguimientosVencidos = () => axiosClient.get('/seguimientos/vencidos');
export const createSeguimiento = (d) => axiosClient.post('/seguimientos', d);
export const cerrarSeguimiento = (id, d) => axiosClient.patch(`/seguimientos/${id}/cerrar`, d);
