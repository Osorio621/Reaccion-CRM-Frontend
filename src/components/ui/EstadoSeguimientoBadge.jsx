import Badge from './Badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function EstadoSeguimientoBadge({ estado }) {
  const est = (estado || '').toUpperCase();

  switch (est) {
    case 'PENDIENTE':
      return (
        <Badge tone="info">
          <Clock size={12} style={{ marginRight: 4 }} />
          Pendiente
        </Badge>
      );
    case 'COMPLETADO':
      return (
        <Badge tone="success">
          <CheckCircle size={12} style={{ marginRight: 4 }} />
          Completado
        </Badge>
      );
    case 'CANCELADO':
      return (
        <Badge tone="default">
          <XCircle size={12} style={{ marginRight: 4 }} />
          Cancelado
        </Badge>
      );
    case 'VENCIDO':
      return (
        <Badge tone="danger">
          <AlertTriangle size={12} style={{ marginRight: 4 }} />
          Vencido
        </Badge>
      );
    default:
      return <Badge tone="default">{estado || '—'}</Badge>;
  }
}
