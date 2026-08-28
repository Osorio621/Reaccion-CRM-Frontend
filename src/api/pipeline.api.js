import axiosClient from './axiosClient';

export const getPipeline = () => axiosClient.get('/pipeline');
