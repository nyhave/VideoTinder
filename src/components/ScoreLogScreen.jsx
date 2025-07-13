import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';

export default function ScoreLogScreen({ onBack }) {
  const logs = useCollection('matchLogs');
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatName = id => profileMap[id]?.name || id;
  const formatScore = s => {
    if (typeof s.score === 'number') return s.score.toFixed(1);
    if (s.score && typeof s.score.score === 'number') return s.score.score.toFixed(1);
    return s.score;
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Score log', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    sortedLogs.length ?
      React.createElement('ul', { className: 'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
        sortedLogs.map(log =>
          React.createElement('li', { key: log.id, className: 'border p-2 rounded' },
            React.createElement('div', { className: 'text-sm font-medium' }, `${log.date} - ${formatName(log.userId)}`),
            React.createElement('div', { className: 'text-xs mt-1' }, 'Valgte: ' +
              (log.selected || []).map(s => `${formatName(s.id)} (${formatScore(s)})`).join(', ')
            ),
            React.createElement('details', { className: 'text-xs mt-1' },
              React.createElement('summary', null, 'Alle scorer'),
                React.createElement('ul', { className: 'list-disc list-inside' },
                  (log.potential || []).map(p =>
                    React.createElement('li', { key: p.id },
                      `${formatName(p.id)}: ${formatScore(p)}`,
                      p.score && p.score.breakdown &&
                        React.createElement('ul', { className: 'ml-4 list-disc' },
                          Object.entries(p.score.breakdown).map(([k, v]) =>
                            React.createElement('li', { key: k }, `${k}: ${typeof v === 'number' ? v.toFixed(1) : v}`)
                          )
                        )
                    )
                  )
                )
              )
          )
        )
      ) :
      React.createElement('p', { className: 'text-center mt-4 text-gray-500' }, 'Ingen logs')
  );
}
