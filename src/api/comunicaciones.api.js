import axiosClient from './axiosClient';

export const TIPO_COMUNICACION_LABELS = {
  COM_LLAMADA_SALIENTE: 'Llamada saliente',
  COM_LLAMADA_ENTRANTE: 'Llamada entrante',
  COM_EMAIL_ENVIADO: 'Email enviado',
  COM_EMAIL_RECIBIDO: 'Email recibido',
  COM_REUNION: 'Reunión',
  COM_WHATSAPP: 'WhatsApp',
  COM_VISITA: 'Visita',
  COM_OTRO: 'Otro',
};

export const TIPO_COMUNICACION_ICONS = {
  COM_LLAMADA_SALIENTE: 'phone-outgoing',
  COM_LLAMADA_ENTRANTE: 'phone-incoming',
  COM_EMAIL_ENVIADO: 'send',
  COM_EMAIL_RECIBIDO: 'mail',
  COM_REUNION: 'users',
  COM_WHATSAPP: 'message-square',
  COM_VISITA: 'map-pin',
  COM_OTRO: 'message-circle',
};

export const getComunicaciones = (tipo, entidadId) =>
  axiosClient.get(`/${tipo}/${entidadId}/comunicaciones`);

export const createComunicacion = (tipo, entidadId, data) => {
  if (typeof tipo === 'object' && tipo !== null) {
    const { tipo: t, entidadId: e, data: d } = tipo;
    return axiosClient.post(`/${t}/${e}/comunicaciones`, d);
  }
  return axiosClient.post(`/${tipo}/${entidadId}/comunicaciones`, data);
};

export const updateComunicacion = (id, data) =>
  axiosClient.put(`/comunicaciones/${id}`, data);

export const deleteComunicacion = (id) =>
  axiosClient.delete(`/comunicaciones/${id}`);