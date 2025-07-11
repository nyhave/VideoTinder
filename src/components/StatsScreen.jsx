import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, collection, getDocs, setDoc, doc } from '../firebase.js';
import StatsChart from './StatsChart.jsx';

export default function StatsScreen({ onBack }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const [profilesSnap, likesSnap, matchesSnap, reflectionsSnap, bugSnap] = await Promise.all([
        getDocs(collection(db, 'profiles')),
        getDocs(collection(db, 'likes')),
        getDocs(collection(db, 'matches')),
        getDocs(collection(db, 'reflections')),
        getDocs(collection(db, 'bugReports'))
      ]);

      const messageCount = matchesSnap.docs.reduce((acc, d) => acc + ((d.data().messages || []).length), 0);
      const openBugs = bugSnap.docs.filter(d => !d.data().closed).length;
      const closedBugs = bugSnap.size - openBugs;
      const videoCount = profilesSnap.docs.reduce((acc, d) => acc + ((d.data().videoClips || []).length), 0);
      const audioCount = profilesSnap.docs.reduce((acc, d) => acc + ((d.data().audioClips || []).length), 0);
      const viewCount = profilesSnap.docs.reduce((acc, d) => acc + (d.data().viewCount || 0), 0);
      const data = {
        profiles: profilesSnap.size,
        likes: likesSnap.size,
        matches: matchesSnap.size / 2,
        messages: messageCount,
        reflections: reflectionsSnap.size,
        bugOpen: openBugs,
        bugClosed: closedBugs,
        videos: videoCount,
        audios: audioCount,
        views: viewCount
      };
      setStats(data);

      const today = new Date().toISOString().split('T')[0];
      await setDoc(doc(db, 'dailyStats', today), { date: today, ...data }, { merge: true });
      const histSnap = await getDocs(collection(db, 'dailyStats'));
      const hist = histSnap.docs.map(d => d.data()).sort((a, b) => a.date.localeCompare(b.date));
      setHistory(hist);
    };
    loadStats();
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Statistik', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    stats ? React.createElement(React.Fragment, null,
      React.createElement('ul', { className: 'space-y-2 mt-4' },
        React.createElement('li', null, `Profiler: ${stats.profiles}`),
        React.createElement('li', null, `Likes: ${stats.likes}`),
        React.createElement('li', null, `Matches: ${stats.matches}`),
        React.createElement('li', null, `Beskeder: ${stats.messages}`),
        React.createElement('li', null, `Refleksioner: ${stats.reflections}`),
        React.createElement('li', null, `\u00C5bne fejl: ${stats.bugOpen}`),
        React.createElement('li', null, `Lukkede fejl: ${stats.bugClosed}`),
        React.createElement('li', null, `Profilvisninger: ${stats.views}`)
      ),
      React.createElement(StatsChart, { data: history, fields: 'profiles', title: 'Profiler over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'likes', title: 'Likes over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'bugOpen', title: '\u00C5bne fejl over tid' }),
      React.createElement(StatsChart, { data: history, fields: ['videos','audios'], title: 'Uploads over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'views', title: 'Profilvisninger over tid' })
    ) : React.createElement('p', null, 'Indlæser...')
  );
}
