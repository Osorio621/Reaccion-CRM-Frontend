const TECHNICAL_PATTERNS = [
  /JDBC exception/i,
  /could not determine data type/i,
  /SQL \[/i,
  /select .* from/i,
  /ORA-\d+/i,
  /PostgreSQL/i,
  /Hibernate/i,
  /PreparedStatement/i,
  /Syntax error/i,
  /column .* does not exist/i,
  /relation .* does not exist/i,
  /null pointer/i,
  /ClassCastException/i,
  /StackTrace/i,
  /at com\./i,
  /at java\./i,
];

const FRIENDLY_MESSAGES = {
  ventas: 'No se pudo generar el reporte de ventas. Verifica los filtros e intenta de nuevo.',
  clientes: 'No se pudo generar el reporte de clientes. Verifica los filtros e intenta de nuevo.',
  oportunidades: 'No se pudo generar el reporte de oportunidades. Verifica los filtros e intenta de nuevo.',
  pipeline: 'No se pudo generar el reporte del pipeline. Intenta de nuevo.',
  prospectos: 'No se pudo generar el reporte de prospectos. Verifica los filtros e intenta de nuevo.',
};

export function isTechnicalError(message) {
  if (!message || typeof message !== 'string') return false;
  return TECHNICAL_PATTERNS.some((p) => p.test(message));
}

export function sanitizeErrorMessage(message, tipo) {
  if (!message) return 'Ocurrió un error inesperado. Intenta de nuevo.';
  if (isTechnicalError(message)) {
    return FRIENDLY_MESSAGES[tipo] || 'Ocurrió un error al generar el reporte. Intenta de nuevo más tarde.';
  }
  return message;
}

export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return 'Error de conexión con el servidor.';
  if (data.campos) {
    return Object.entries(data.campos)
      .map(([campo, msg]) => `${campo}: ${msg}`)
      .join(', ');
  }
  const base = data.mensaje || 'Error inesperado.';
  return error.requestId && data.status >= 500
    ? `${base} (X-Request-Id: ${error.requestId})`
    : base;
}
