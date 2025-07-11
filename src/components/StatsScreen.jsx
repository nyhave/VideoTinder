import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, collection, getDocs } from '../firebase.js';

export default function StatsScreen({ onBack }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const [profilesSnap, likesSnap, matchesSnap, reflectionsSnap] = await Promise.all([
        getDocs(collection(db, 'profiles')),
        getDocs(collection(db, 'likes')),
        getDocs(collection(db, 'matches')),
        getDocs(collection(db, 'reflections'))
      ]);

      const messageCount = matchesSnap.docs.reduce((acc, d) => acc + ((d.data().messages || []).length), 0);
      setStats({
        profiles: profilesSnap.size,
        likes: likesSnap.size,
        matches: matchesSnap.size / 2,
        messages: messageCount,
        reflections: reflectionsSnap.size
      });
    };
    loadStats();
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Statistik', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    stats ? React.createElement('ul', { className: 'space-y-2 mt-4' },
      React.createElement('li', null, `Profiler: ${stats.profiles}`),
      React.createElement('li', null, `Likes: ${stats.likes}`),
      React.createElement('li', null, `Matches: ${stats.matches}`),
      React.createElement('li', null, `Beskeder: ${stats.messages}`),
      React.createElement('li', null, `Refleksioner: ${stats.reflections}`)
    ) : React.createElement('p', null, 'Indlæser...')
  );
}
