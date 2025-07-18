import React, { useState, useEffect } from 'react';

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

export default function PieChart({ data = {}, title }) {
  const [expanded, setExpanded] = useState(false);
  const [screen, setScreen] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setScreen({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const labels = Object.keys(data);
  const values = labels.map(l => data[l] || 0);
  const total = values.reduce((acc, v) => acc + v, 0);
  if (!total) return null;
  const colors = ['#ec4899', '#3b82f6', '#10b981', '#facc15', '#f87171'];

  const renderSvg = (size = 120) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;
    let start = 0;
    const paths = values.map((v, idx) => {
      const angle = v / total * 360;
      const end = start + angle;
      const d = arcPath(cx, cy, r, start, end);
      start = end;
      return React.createElement('path', {
        key: labels[idx],
        d,
        fill: colors[idx % colors.length]
      });
    });
    return React.createElement('svg', { width: size, height: size }, paths);
  };

  const legend = React.createElement('div', { className: 'flex flex-wrap gap-2 text-sm mb-2' },
    labels.map((label, idx) => React.createElement('span', { key: idx, className: 'flex items-center gap-1' },
      React.createElement('span', { style: { background: colors[idx % colors.length], width: 12, height: 12, display: 'inline-block' } }),
      `${label}: ${values[idx]}`
    ))
  );

  const expandedSize = Math.min(Math.max(screen.width, screen.height) - 160, 400);

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
      React.createElement('div', { className: 'bg-white p-4 rounded shadow-xl w-full h-full overflow-auto flex flex-col items-center justify-center' },
        React.createElement('h3', { className: 'font-semibold mb-2 text-center text-lg' }, title),
        legend,
        renderSvg(expandedSize)
      )
    )
  );
}
