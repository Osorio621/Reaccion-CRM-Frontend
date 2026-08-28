import axiosClient from './axiosClient';

export const login = (data) => axiosClient.post('/auth/login', data);
export const refresh = (data) => axiosClient.post('/auth/refresh', data);
export const logout = () => axiosClient.post('/auth/logout');

export const getPerfil = () => axiosClient.get('/perfil');
export const updatePerfil = (data) => axiosClient.put('/perfil', data);
export const cambiarPassword = (data) => axiosClient.put('/perfil/password', data);

export const olvidePassword = (data) => axiosClient.post('/auth/olvide-password', data);
export const restablecerPassword = (data) =>
  axiosClient.post('/auth/restablecer-password', data);
