import React, { useState } from 'react';

// Calculate simple moving average for an array of numbers
function movingAverage(arr, window) {
  return arr.map((_, idx) => {
    const start = Math.max(0, idx - window + 1);
    const slice = arr.slice(start, idx + 1);
    const sum = slice.reduce((acc, v) => acc + v, 0);
    return sum / slice.length;
  });
}

export default function StatsChart({ data = [], fields = [], title }) {
  const [expanded, setExpanded] = useState(false);
  if (!Array.isArray(fields)) fields = [fields];
  if (!data.length || !fields.length) return null;
  const colors = ['#ec4899', '#3b82f6', '#10b981'];

  // Prepare data series including moving averages
  const series = [];
  fields.forEach((field, idx) => {
    const values = data.map(d => d[field] || 0);
    series.push({ label: field, color: colors[idx % colors.length], dashed: '', values });
    series.push({ label: `${field} (1 uge)`, color: colors[idx % colors.length], dashed: '4 2', values: movingAverage(values, 7) });
    series.push({ label: `${field} (4 uger)`, color: colors[idx % colors.length], dashed: '2 2', values: movingAverage(values, 28) });
  });

  const max = Math.max(...series.flatMap(s => s.values), 1);

  const renderSvg = (step = 40, h = 100) => {
    const axis = 30; // space for y-axis labels
    const w = Math.max((data.length - 1) * step, 1) + axis + 10;
    const y = v => h - v / max * h;

    const polylines = series.map((s, idx) => {
      const points = s.values.map((v, i) => `${axis + i * step},${y(v)}`).join(' ');
      return React.createElement('polyline', {
        key: `${s.label}-${idx}`,
        fill: 'none',
        stroke: s.color,
        strokeWidth: 2,
        strokeDasharray: s.dashed,
        points
      });
    });

    const xlabels = data.map((d, i) => React.createElement('text', {
      key: d.date,
      x: axis + i * step,
      y: h + 12,
      textAnchor: 'middle',
      fontSize: 10
    }, d.date.slice(5)));

    const yticks = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = Math.round(max * i / steps);
      const yy = y(val);
      yticks.push(React.createElement('line', {
        key: `t-${i}`,
        x1: axis - 3,
        x2: axis,
        y1: yy,
        y2: yy,
        stroke: '#888'
      }));
      yticks.push(React.createElement('text', {
        key: `l-${i}`,
        x: axis - 5,
        y: yy + 3,
        textAnchor: 'end',
        fontSize: 10
      }, val));
    }

    return React.createElement('svg', { width: w, height: h + 20 },
      React.createElement('line', { x1: axis, x2: axis, y1: 0, y2: h, stroke: '#ccc' }),
      polylines,
      yticks,
      xlabels
    );
  };

  const legend = React.createElement('div', { className: 'flex flex-wrap gap-2 text-sm mb-2' },
    series.map((s, idx) => React.createElement('span', { key: idx, className: 'flex items-center gap-1' },
      React.createElement('svg', { width: 12, height: 12 },
        React.createElement('line', { x1: 0, y1: 6, x2: 12, y2: 6, stroke: s.color, strokeWidth: 2, strokeDasharray: s.dashed })
      ),
      s.label
    ))
  );

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'mb-4', onClick: () => setExpanded(true) },
      React.createElement('h3', { className: 'font-semibold mb-1' }, title),
      legend,
      renderSvg()
    ),
    expanded && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center',
      onClick: () => setExpanded(false)
    },
      React.createElement('div', { className: 'bg-white p-4 rounded shadow-xl w-full h-full overflow-auto' },
        React.createElement('h3', { className: 'font-semibold mb-2 text-center text-lg' }, title),
        legend,
        renderSvg(100, 300)
      )
    )
  );
}
