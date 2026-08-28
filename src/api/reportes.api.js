import axiosClient from './axiosClient';

export const exportarReportes = async (params) => {
  try {
    const res = await axiosClient.get('/reportes/export', {
      params,
      responseType: 'blob',
    });

    const disposition = res.headers['content-disposition'];
    const match = /filename="?([^"]+)"?/.exec(disposition ?? '');
    const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ext = ['csv', 'json', 'xlsx', 'pdf'].includes(params?.formato?.toLowerCase())
      ? params.formato.toLowerCase()
      : 'csv';
    const filename = match?.[1] ?? `${params?.tipo ?? 'reporte'}_${hoy}.${ext}`;

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    return { ok: true, filename };
  } catch (err) {
    if (err?.response?.data instanceof Blob) {
      const txt = await err.response.data.text();
      let jsonErr = { error: 'ERROR_DESC', mensaje: txt };
      try { jsonErr = JSON.parse(txt); } catch { /* noop */ }
      throw new Error(jsonErr.mensaje || jsonErr.error || 'Error al generar reporte', {
        cause: err,
      });
    }
    throw new Error(err?.response?.data?.mensaje || err.message || 'Error de red', {
      cause: err,
    });
  }
};
