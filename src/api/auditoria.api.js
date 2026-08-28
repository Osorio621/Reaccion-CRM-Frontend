import axiosClient from './axiosClient';

export const getAuditoria = (p) => axiosClient.get('/admin/auditoria', { params: p });
