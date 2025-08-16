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
  const maleValues = labels.map(l => (distribution[l] && distribution[l].male) || 0);
  const femaleValues = labels.map(l => (distribution[l] && distribution[l].female) || 0);
  const max = Math.max(...maleValues, ...femaleValues, 1);
  const GAP = 10;

  const renderSvg = (barWidth = 20, h = 100) => {
    const groupWidth = barWidth * 2 + GAP;
    const w = labels.length * groupWidth + GAP;
    const elements = [];
    labels.forEach((label, idx) => {
      const male = maleValues[idx];
      const female = femaleValues[idx];
      const maleH = male / max * h;
      const femaleH = female / max * h;
      const x0 = GAP + idx * groupWidth;
      const maleY = h - maleH;
      const femaleY = h - femaleH;
      elements.push(
        React.createElement('rect', { key: `m-${label}`, x: x0, y: maleY, width: barWidth, height: maleH, fill: '#3b82f6' }),
        React.createElement('text', { key: `mv-${label}`, x: x0 + barWidth / 2, y: maleY - 4, textAnchor: 'middle', fontSize: 10 }, male),
        React.createElement('rect', { key: `f-${label}`, x: x0 + barWidth, y: femaleY, width: barWidth, height: femaleH, fill: '#ec4899' }),
        React.createElement('text', { key: `fv-${label}`, x: x0 + barWidth + barWidth / 2, y: femaleY - 4, textAnchor: 'middle', fontSize: 10 }, female),
        React.createElement('text', { key: `l-${label}`, x: x0 + barWidth, y: h + 12, textAnchor: 'middle', fontSize: 10 }, label)
      );
    });
    return React.createElement('svg', { width: w, height: h + 20 }, elements);
  };

  const legend = React.createElement('div', { className: 'flex gap-4 mb-1 text-sm' },
    React.createElement('span', { className: 'flex items-center gap-1' },
      React.createElement('svg', { width: 12, height: 12 }, React.createElement('rect', { width: 12, height: 12, fill: '#3b82f6' })),
      'Mænd'
    ),
    React.createElement('span', { className: 'flex items-center gap-1' },
      React.createElement('svg', { width: 12, height: 12 }, React.createElement('rect', { width: 12, height: 12, fill: '#ec4899' })),
      'Kvinder'
    )
  );

  const expandedBarWidth = Math.max(20, Math.floor((screen.width - 60 - GAP * (labels.length + 1)) / (labels.length * 2)));
  const expandedHeight = Math.max(screen.height - 160, 200);

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
        renderSvg(expandedBarWidth, expandedHeight)
      )
    )
  );
}
