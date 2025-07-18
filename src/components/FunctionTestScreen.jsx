import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import SectionTitle from './SectionTitle.jsx';
import { db, storage, doc, setDoc, ref, uploadBytes, getDownloadURL } from '../firebase.js';

const features = [
  {
    title: 'Daily discovery of short video clips (up to 3 or 6 with subscription)',
    expected: [
      'New clips become available every day',
      'Free users see up to 3 clips, subscribers see 6',
      'The list resets the next day'
    ]
  },
  {
    title: 'Option to buy 3 extra clips for the day',
    expected: [
      'Purchase button appears once daily clips are used',
      'Buying adds three additional clips',
      'Only one purchase allowed per day'
    ]
  },
  {
    title: 'Monthly subscriptions with visible expiration date',
    expected: [
      'Subscription purchase extends access for 30 days',
      'Expiration date is shown in the profile',
      'Premium features stop working after expiry'
    ]
  },
  {
    title: 'Basic chat between matched profiles with option to unmatch',
    expected: [
      'Matched users can exchange messages',
      'Unmatching removes the chat for both',
      'Messages update in real time'
    ]
  },
  {
    title: 'Improved chat layout with timestamps',
    expected: [
      'Each message shows when it was sent',
      'Layout separates messages by sender',
      'View scrolls to newest message'
    ]
  },
  {
    title: 'Celebration overlay when two profiles match',
    expected: [
      'Overlay appears immediately after a match',
      'Confetti animation is shown',
      'Overlay can be dismissed'
    ]
  },
  {
    title: 'Calendar for daily reflections',
    expected: [
      'Calendar view is reachable from the menu',
      'User can add a note for each day',
      'Notes persist when reopening the app'
    ]
  },
  {
    title: 'Minimal profile settings and admin mode',
    expected: [
      'Settings screen allows editing basic info',
      'Admin mode adds extra controls',
      'Only admins can access the admin menu'
    ]
  },
  {
    title: 'Preferred languages with option to allow other languages',
    expected: [
      'Users select one or more languages',
      'Enabling "allow other languages" broadens matches',
      'Discovery respects language preferences'
    ]
  },
  {
    title: 'Choose up to five personal interests in profile settings',
    expected: [
      'Interests are selected from a predefined list',
      'Selection is limited to five items',
      'Saved interests appear in the profile'
    ]
  },
  {
    title: 'Profile pictures, audio clips and video clips cached for offline viewing',
    expected: [
      'Media is stored locally after first view',
      'Cached media plays without network connection',
      'Clearing storage removes cached files'
    ]
  },
  {
    title: 'Premium page showing who liked you (subscription required)',
    expected: [
      'Page lists profiles that liked you',
      'Requires an active subscription',
      'List updates when new likes arrive'
    ]
  },
  {
    title: 'Seed data includes 11 test profiles matching the default user',
    expected: [
      'Running the seed script creates 11 profiles',
      'All seeded profiles can match the default user',
      'Admin can switch to these profiles'
    ]
  },
  {
    title: 'Video and audio clips limited to 10 seconds',
    expected: [
      'Recording stops after 10 seconds',
      'Longer files are rejected',
      'Countdown shows remaining time'
    ]
  },
  {
    title: 'Countdown animation during recording',
    expected: [
      'Visible timer counts down from 10 seconds',
      'Timer reaches zero as recording ends',
      'Helps users keep clips short'
    ]
  },
  {
    title: 'Daily stats saved automatically and shown as graphs in admin',
    expected: [
      'Usage stats are stored each day',
      'Admin page displays graphs of the data',
      'Trends over time are visible'
    ]
  },
  {
    title: 'Statistics on how often profiles are opened',
    expected: [
      'Each profile view increments a counter',
      'Admin can see open counts per profile',
      'Counts reset when the database is reset'
    ]
  },
  {
    title: 'Graph of number of open bugs per day',
    expected: [
      'Bug reports are grouped by date',
      'Graph shows how many are still open',
      'Closing a bug lowers the count'
    ]
  },
  {
    title: 'Match log accessible from admin',
    expected: [
      'Admin screen includes a link to the match log',
      'Log lists all matches with timestamps',
      'Entries are shown in chronological order'
    ]
  }
];

export default function FunctionTestScreen({ onBack }) {
  const [results, setResults] = useState(() =>
    Object.fromEntries(features.map((_, i) => [i, { status: '', comment: '', file: null }]))
  );

  const update = (index, field, value) => {
    setResults(r => ({ ...r, [index]: { ...r[index], [field]: value } }));
  };

  const submit = async () => {
    const entries = Object.entries(results);
    for (const [i, res] of entries) {
      if (res.status === 'fail') {
        const id = Date.now().toString() + '-' + i;
        let screenshotURL = '';
        if (res.file) {
          const storageRef = ref(storage, `bugReports/${id}-${res.file.name}`);
          await uploadBytes(storageRef, res.file);
          screenshotURL = await getDownloadURL(storageRef);
        }
        await setDoc(doc(db, 'bugReports', id), {
          id,
          text: `[FunctionTest] ${features[i].title} ${res.comment || ''}`.trim(),
          screenshotURL,
          createdAt: new Date().toISOString(),
          closed: false
        });
      }
    }
    alert('Resultater sendt');
    onBack();
  };

  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title:'Funktionstest', colorClass:'text-blue-600', action: React.createElement(Button, { onClick: onBack }, 'Tilbage') }),
    React.createElement('ul', { className:'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
      features.map((f, i) =>
        React.createElement('li', { key:i, className:'border p-2 rounded' },
          React.createElement('div', { className:'font-medium mb-1' }, f.title),
          React.createElement('ul', { className:'list-disc ml-5 text-sm mb-1' },
            f.expected.map((ex, j) => React.createElement('li', { key:j }, ex))
          ),
          React.createElement('div', { className:'flex space-x-2 mb-1' },
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[i].status==='ok' ? 'bg-green-500 text-white' : 'bg-gray-200'}`, onClick:() => update(i,'status',results[i].status==='ok'?'':'ok') }, 'OK'),
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[i].status==='fail' ? 'bg-red-500 text-white' : 'bg-gray-200'}`, onClick:() => update(i,'status',results[i].status==='fail'?'':'fail') }, 'Fejl')
          ),
          React.createElement('textarea', { className:'w-full border p-1 text-sm mb-1', placeholder:'Kommentar', value:results[i].comment, onChange:e=>update(i,'comment',e.target.value) }),
          React.createElement(Input, { type:'file', accept:'image/*', className:'mb-1 w-full', onChange:e=>update(i,'file',e.target.files[0]) })
        )
      )
    ),
    React.createElement(Button, { className:'mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full', onClick: submit }, 'Send rapport')
  );
}
