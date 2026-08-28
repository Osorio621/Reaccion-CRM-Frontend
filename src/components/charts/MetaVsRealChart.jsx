import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from './MetaVsRealChart.module.css';

const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className={styles.tooltipRow} style={{ color: entry.color }}>
          <span className={styles.tooltipDot} style={{ background: entry.color }} />
          {entry.name}: {formatCOP(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function MetaVsRealChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay datos para mostrar en la gráfica</p>
      </div>
    );
  }

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e9ecef)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 12, fill: '#6c757d' }}
            axisLine={{ stroke: 'var(--color-border, #e9ecef)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6c757d' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
              if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
              return v;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line
            type="monotone"
            dataKey="meta"
            name="Meta"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{ fill: '#7c3aed', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="real"
            name="Venta real"
            stroke="#059669"
            strokeWidth={2.5}
            dot={{ fill: '#059669', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="#d97706"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ fill: '#d97706', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="etapa" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => formatCOP(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="valorPonderado"
          name="Valor ponderado"
          stroke="#7c3aed"
          strokeWidth={2.5}
          dot={{ fill: '#7c3aed', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
