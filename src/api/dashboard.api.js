import axiosClient from './axiosClient';

export const getDashboardResumen = () => axiosClient.get('/dashboard/resumen');
