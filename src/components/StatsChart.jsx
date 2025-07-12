import React, { useState } from 'react';

export default function StatsChart({ data = [], fields = [], title }) {
  const [expanded, setExpanded] = useState(false);
  if (!Array.isArray(fields)) fields = [fields];
  if (!data.length || !fields.length) return null;
  const colors = ['#ec4899', '#3b82f6', '#10b981'];
  const max = Math.max(...data.flatMap(d => fields.map(f => d[f] || 0)), 1);

  const renderSvg = (step = 40, h = 100) => {
    const w = Math.max((data.length - 1) * step, 1) + 20;
    const polylines = fields.map((field, idx) => {
      const points = data.map((d, i) => `${i * step},${h - (d[field] || 0) / max * h}`).join(' ');
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
      y: h + 12,
      textAnchor: 'middle',
      fontSize: 10
    }, d.date.slice(5)));
    return React.createElement('svg', { width: w, height: h + 20 }, polylines, labels);
  };

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'mb-4', onClick: () => setExpanded(true) },
      React.createElement('h3', { className: 'font-semibold mb-1' }, title),
      renderSvg()
    ),
    expanded && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center',
      onClick: () => setExpanded(false)
    },
      React.createElement('div', { className: 'bg-white p-4 rounded shadow-xl max-w-screen-lg overflow-auto' },
        React.createElement('h3', { className: 'font-semibold mb-2 text-center' }, title),
        renderSvg(80, 200)
      )
    )
  );
}
