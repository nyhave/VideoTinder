import React from 'react';

export default function StatsChart({ data = [], fields = [], title }) {
  if (!Array.isArray(fields)) fields = [fields];
  if (!data.length || !fields.length) return null;
  const colors = ['#ec4899', '#3b82f6', '#10b981'];
  const max = Math.max(...data.flatMap(d => fields.map(f => d[f] || 0)), 1);
  const step = 40;
  const width = Math.max((data.length - 1) * step, 1) + 20;
  const height = 100;
  const polylines = fields.map((field, idx) => {
    const points = data.map((d, i) => `${i * step},${height - (d[field] || 0) / max * height}`).join(' ');
    return React.createElement('polyline', {
      key: field,
      fill: 'none',
      stroke: colors[idx % colors.length],
      strokeWidth: 2,
      points
    });
  });
  const labels = data.map((d, i) => React.createElement('text', {
    key: d.date,
    x: i * step,
    y: height + 12,
    textAnchor: 'middle',
    fontSize: 10
  }, d.date.slice(5)));
  return React.createElement('div', { className: 'mb-4' },
    React.createElement('h3', { className: 'font-semibold mb-1' }, title),
    React.createElement('svg', { width, height: height + 20 },
      polylines,
      labels
    )
  );
}
