import React, { useState, useEffect } from 'react';

export default function AgeDistributionChart({ distribution = {}, title }) {
  const [expanded, setExpanded] = useState(false);
  const [screen, setScreen] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setScreen({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const labels = Object.keys(distribution);
  if (!labels.length) return null;
  const values = labels.map(l => distribution[l] || 0);
  const max = Math.max(...values, 1);
  const GAP = 10;

  const renderSvg = (barWidth = 20, h = 100) => {
    const w = labels.length * (barWidth + GAP) + GAP;
    const bars = labels.map((label, idx) => {
      const val = distribution[label] || 0;
      const barH = val / max * h;
      const x = GAP + idx * (barWidth + GAP);
      const y = h - barH;
      return [
        React.createElement('rect', { key: `b-${label}`, x, y, width: barWidth, height: barH, fill: '#3b82f6' }),
        React.createElement('text', { key: `v-${label}`, x: x + barWidth / 2, y: y - 4, textAnchor: 'middle', fontSize: 10 }, val),
        React.createElement('text', { key: `l-${label}`, x: x + barWidth / 2, y: h + 12, textAnchor: 'middle', fontSize: 10 }, label)
      ];
    });
    return React.createElement('svg', { width: w, height: h + 20 }, bars);
  };

  const expandedBarWidth = Math.max(20, Math.floor((screen.width - 60 - GAP * (labels.length + 1)) / labels.length));
  const expandedHeight = Math.max(screen.height - 160, 200);

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'mb-4', onClick: () => setExpanded(true) },
      React.createElement('h3', { className: 'font-semibold mb-1' }, title),
      renderSvg()
    ),
    expanded && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center',
      onClick: () => setExpanded(false)
    },
      React.createElement('div', { className: 'bg-white p-4 rounded shadow-xl w-full h-full overflow-auto' },
        React.createElement('h3', { className: 'font-semibold mb-2 text-center text-lg' }, title),
        renderSvg(expandedBarWidth, expandedHeight)
      )
    )
  );
}
