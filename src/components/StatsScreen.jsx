import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, collection, getDocs, setDoc, doc } from '../firebase.js';
import StatsChart from './StatsChart.jsx';
import AgeDistributionChart from './AgeDistributionChart.jsx';
import PieChart from './PieChart.jsx';
import { getAge, getTodayStr } from '../utils.js';
import { useT } from '../i18n.js';

export default function StatsScreen({ onBack }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [ageDist, setAgeDist] = useState(null);
  const [inviteResults, setInviteResults] = useState(null);
  const t = useT();

  useEffect(() => {
    const loadStats = async () => {
      const [profilesSnap, likesSnap, matchesSnap, reflectionsSnap, bugSnap, invitesSnap] = await Promise.all([
        getDocs(collection(db, 'profiles')),
        getDocs(collection(db, 'likes')),
        getDocs(collection(db, 'matches')),
        getDocs(collection(db, 'reflections')),
        getDocs(collection(db, 'bugReports')),
        getDocs(collection(db, 'invites'))
      ]);

      const messageCount = matchesSnap.docs.reduce((acc, d) => acc + ((d.data().messages || []).length), 0);
      const openBugs = bugSnap.docs.filter(d => !d.data().closed).length;
      const closedBugs = bugSnap.size - openBugs;
      const videoCount = profilesSnap.docs.reduce((acc, d) => acc + ((d.data().videoClips || []).length), 0);
      const viewCount = profilesSnap.docs.reduce((acc, d) => acc + (d.data().viewCount || 0), 0);
      const inviteCount = profilesSnap.docs.reduce((acc, d) => acc + (d.data().premiumInvitesUsed || 0), 0);
      const activeSince = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const activeUsers = profilesSnap.docs.filter(d => {
        const last = d.data().lastActive;
        return last && new Date(last).getTime() >= activeSince;
      }).length;

      const dist = {
        '18-25': { male: 0, female: 0 },
        '26-35': { male: 0, female: 0 },
        '36-45': { male: 0, female: 0 },
        '46-55': { male: 0, female: 0 },
        '56+': { male: 0, female: 0 }
      };
      profilesSnap.docs.forEach(d => {
        const p = d.data();
        let age = p.age;
        if (age == null && p.birthday) age = getAge(p.birthday);
        if (age == null || !p.gender) return;
        const gender = p.gender === 'Mand' ? 'male' : p.gender === 'Kvinde' ? 'female' : null;
        if (!gender) return;
        let key;
        if (age <= 25) key = '18-25';
        else if (age <= 35) key = '26-35';
        else if (age <= 45) key = '36-45';
        else if (age <= 55) key = '46-55';
        else key = '56+';
        dist[key][gender]++;
      });
      setAgeDist(dist);
      const giftInvites = invitesSnap.docs.filter(d => d.data().gift);
      const giftTotal = giftInvites.length;
      const giftCreated = giftInvites.filter(d => d.data().accepted).length;
      setInviteResults({ 'Oprettet': giftCreated, 'Ikke oprettet': giftTotal - giftCreated });
      const data = {
        profiles: profilesSnap.size,
        likes: likesSnap.size,
        matches: matchesSnap.size / 2,
        messages: messageCount,
        reflections: reflectionsSnap.size,
        bugOpen: openBugs,
        bugClosed: closedBugs,
        videos: videoCount,
        views: viewCount,
        activeUsers,
        invites: inviteCount
      };
      setStats(data);

      const today = getTodayStr();
      await setDoc(doc(db, 'dailyStats', today), { date: today, ...data }, { merge: true });
      const histSnap = await getDocs(collection(db, 'dailyStats'));
      const hist = histSnap.docs.map(d => d.data()).sort((a, b) => a.date.localeCompare(b.date));
      setHistory(hist);
    };
    loadStats();
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('statsTitle'), colorClass: 'text-blue-600', action: React.createElement(Button, { onClick: onBack }, t('back')) }),
    stats ? React.createElement(React.Fragment, null,
      React.createElement(StatsChart, { data: history, fields: 'profiles', title: 'Profiler over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'likes', title: 'Likes over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'matches', title: 'Matches over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'messages', title: 'Beskeder over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'reflections', title: 'Refleksioner over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'bugOpen', title: '\u00C5bne fejl over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'bugClosed', title: 'Lukkede fejl over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'videos', title: 'Uploads over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'views', title: 'Profilvisninger over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'activeUsers', title: 'Aktive brugere over tid' }),
      React.createElement(StatsChart, { data: history, fields: 'invites', title: 'Premium invitationer over tid' }),
      inviteResults && React.createElement(PieChart, { data: inviteResults, title: 'Premiuminvites der gav oprettelse' }),
      ageDist && React.createElement(AgeDistributionChart, { distribution: ageDist, title: 'Aldersfordeling' })
    ) : React.createElement('p', null, 'Indlæser...')
  );
}
