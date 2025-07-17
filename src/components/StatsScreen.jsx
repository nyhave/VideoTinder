import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, collection, getDocs, setDoc, doc } from '../firebase.js';
import StatsChart from './StatsChart.jsx';
import AgeDistributionChart from './AgeDistributionChart.jsx';
import { getAge } from '../utils.js';

export default function StatsScreen({ onBack }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [ageDist, setAgeDist] = useState(null);

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
      const activeSince = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const activeUsers = profilesSnap.docs.filter(d => {
        const last = d.data().lastActive;
        return last && new Date(last).getTime() >= activeSince;
      }).length;

      const dist = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
      profilesSnap.docs.forEach(d => {
        const p = d.data();
        let age = p.age;
        if (age == null && p.birthday) age = getAge(p.birthday);
        if (age == null) return;
        if (age <= 25) dist['18-25']++;
        else if (age <= 35) dist['26-35']++;
        else if (age <= 45) dist['36-45']++;
        else if (age <= 55) dist['46-55']++;
        else dist['56+']++;
      });
      setAgeDist(dist);
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
        views: viewCount,
        activeUsers
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
    React.createElement(SectionTitle, { title: 'Statistik', colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    stats ? React.createElement(React.Fragment, null,
      React.createElement(StatsChart, { data: history, fields: 'profiles', title: 'Profiler over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'likes', title: 'Likes over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'matches', title: 'Matches over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'messages', title: 'Beskeder over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'reflections', title: 'Refleksioner over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'bugOpen', title: '\u00C5bne fejl over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'bugClosed', title: 'Lukkede fejl over tid' }),
      React.createElement(StatsChart, { data: history, fields: ['videos','audios'], title: 'Uploads over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'views', title: 'Profilvisninger over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'activeUsers', title: 'Aktive brugere over tid' }),
      ageDist && React.createElement(AgeDistributionChart, { distribution: ageDist, title: 'Aldersfordeling' })
    ) : React.createElement('p', null, 'Indlæser...')
  );
}
