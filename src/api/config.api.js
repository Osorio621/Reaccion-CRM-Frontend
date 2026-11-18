import axiosClient from './axiosClient';

// Admin endpoints (con autenticación)
export const getLogoConfig = () => axiosClient.get('/admin/config/logo').then((r) => r.data);
export const updateLogoConfig = (data) => axiosClient.put('/admin/config/logo', data).then((r) => r.data);
export const uploadLogo = (formData) =>
  axiosClient.post('/admin/config/logo/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

// Público - sin autenticación (para <img src>)
export const getLogoImage = () => axiosClient.get('/config/logo', {
  responseType: 'blob',
}).then((r) => r.data);