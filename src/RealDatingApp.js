import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDoc,
  updateDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { Card } from './components/ui/card.js';
import { Button } from './components/ui/button.js';
import { Input } from './components/ui/input.js';
import { Textarea } from './components/ui/textarea.js';
import {
  Heart,
  PlayCircle,
  User,
  Mic,
  Settings,
  CalendarDays,
  Camera as CameraIcon,
  Smile,
  Home as HomeIcon,
  User as UserIcon,
  MessageCircle as ChatIcon,
  Sparkles
} from 'https://cdn.skypack.dev/lucide-react';

// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: 'AIzaSyBzhR7SOvS63dNS7fcF9OmyAEryfmHwbIY',
  authDomain: 'videotinder-38b8b.firebaseapp.com',
  projectId: 'videotinder-38b8b',
  storageBucket: 'videotinder-38b8b.firebasestorage.app',
  messagingSenderId: '1025473667340',
  appId: '1:1025473667340:web:757da72042b702a5966929'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hook for Firestore collections
function useCollection(collectionName, field, value) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const colRef = collection(db, collectionName);
    const q = field && value != null ? query(colRef, where(field, '==', value)) : colRef;
    const unsub = onSnapshot(q, snapshot => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [collectionName, field, value]);
  return data;
}

const SectionTitle = ({ title }) => (
  React.createElement('h2', { className: 'text-2xl font-semibold mb-2 text-pink-600' }, title)
);

// WelcomeScreen
const WelcomeScreen = ({ onNext }) => (
  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Velkommen til RealDating'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '🎧 Udforsk klip fra andre brugere.'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '💬 Chat kun med aktive matches.'),
    React.createElement('p', { className: 'mb-4 text-gray-700' }, '📅 Gem dine refleksioner i kalenderen.'),
    React.createElement(Button, { onClick: onNext, className: 'bg-pink-500 hover:bg-pink-600 text-white mt-4' }, 'Kom i gang!')
  )
);

// DailyDiscovery
const DailyDiscovery = ({ userId, onSelectProfile, ageRange }) => {
  const profiles = useCollection('profiles');
  const user = profiles.find(p => p.id === userId) || {};
  const interest = user.interest;
  const allClips = useCollection('clips', 'gender', interest);
  const filtered = allClips.filter(c => {
    const profile = profiles.find(p => p.id === c.profileId);
    return profile && profile.age >= ageRange[0] && profile.age <= ageRange[1];
  }).slice(0, 3);
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));

  const [hoursUntil, setHoursUntil] = useState(0);
  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0,0,0,0);
    setHoursUntil(Math.ceil((next - now) / 3600000));
  }, []);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Dagens klip' }),
    React.createElement('p', { className: 'text-center text-gray-500 mb-4' }, `Nye klip om ${hoursUntil} timer`),
    React.createElement('ul', { className: 'space-y-4' },
      filtered.map(c => (
        React.createElement('li', {
          key: c.id,
          className: 'flex justify-between items-center p-4 bg-pink-50 rounded-lg cursor-pointer shadow',
          onClick: () => onSelectProfile(c.profileId)
        },
          React.createElement('div', { className: 'flex items-center gap-4' },
            React.createElement(User, { className: 'w-10 h-10 text-pink-500' }),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, `${nameMap[c.profileId]} (${profiles.find(p=>p.id===c.profileId)?.age})`),
              React.createElement('p', { className: 'text-sm text-gray-500' }, `“${c.text}”`)
            )
          ),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement(Button, { size: 'sm', variant: 'outline', className: 'flex items-center gap-1' },
              React.createElement(PlayCircle, { className: 'w-5 h-5' }), 'Afspil'
            ),
            React.createElement(Button, { size: 'sm', className: 'bg-pink-500 text-white flex items-center gap-1' },
              React.createElement(Heart, { className: 'w-5 h-5' }), 'Synes'
            )
          )
        )
      ))
    )
  );
};

// ChatScreen
const ChatScreen = ({ userId }) => {
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
  const [active, setActive] = useState(null);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-96' },
    React.createElement(SectionTitle, { title: 'Samtale' }),
    React.createElement('div', { className: 'flex overflow-x-auto space-x-4 p-2' },
      chats.map(m => (
        React.createElement('div', {
          key: m.id,
          className: 'text-center cursor-pointer',
          onClick: () => setActive(m)
        },
          React.createElement(UserIcon, { className: 'w-10 h-10 text-pink-500' }),
          React.createElement('p', { className: 'text-sm mt-1' }, nameMap[m.profileId])
        )
      ))
    ),
    active ? (
      React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'flex-1 overflow-y-auto bg-gray-100 p-4 rounded space-y-3' },
          React.createElement('div', { className: 'bg-pink-100 p-2 rounded-lg max-w-xs' },
            React.createElement(Smile, { className: 'inline w-6 h-6 mr-1' }), active.lastMessage
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
          React.createElement(Textarea, { className: 'flex-1', placeholder: 'Skriv besked...' }),
          React.createElement(Button, { className: 'bg-pink-500 text-white' },
            React.createElement(ChatIcon, null)
          )
        )
      )
    ) : React.createElement('p', { className: 'text-center text-gray-500 flex-1 flex items-center justify-center' }, 'Vælg chat')
  );
};

// DailyCheckIn
const DailyCheckIn = ({ userId }) => {
  const refs = useCollection('reflections','userId',userId);
  const days = Array.from({length:30},(_,i)=>i+1);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Dagens refleksion' }),
    React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-4' },
      days.map(day => (
        React.createElement('div', {
          key: day,
          className: `p-2 text-center text-sm ${refs.some(r=>r.day===day)?'bg-pink-200 rounded':''}`
        }, day)
      ))
    ),
    React.createElement('ul', { className: 'list-disc list-inside mb-4' },
      refs.map(r => React.createElement('li', { key: r.id }, `Dag ${r.day}: ${r.text}`))
    ),
    React.createElement(Textarea, { placeholder: 'Del din refleksion...', className: 'mb-4' }),
    React.createElement(Button, { className: 'bg-pink-500 text-white' }, 'Gem refleksion')
  );
};

// ProfileSettings
const ProfileSettings = ({ userId, ageRange, onChangeAgeRange }) => {
  const [profile,setProfile]=useState(null);
  useEffect(()=>{if(!userId)return;getDoc(doc(db,'profiles',userId)).then(s=>s.exists()&&setProfile({id:s.id,...s.data()}));},[userId]);
  if(!profile) return React.createElement('p', null, 'Indlæser profil...');

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: `${profile.name}, ${profile.age}` }),
    React.createElement(SectionTitle, { title: 'Aldersinterval' }),
    React.createElement('div', { className: 'flex flex-col gap-4 mb-4' },
      React.createElement('div', null,
        React.createElement('label', null, `Alder fra: ${ageRange[0]}`),
        React.createElement('input', {
          type: 'range',
          min: '18',
          max: '80',
          value: ageRange[0],
          onChange: e=>onChangeAgeRange([Number(e.target.value),ageRange[1]]),
          className: 'w-full'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', null, `Alder til: ${ageRange[1]}`),
        React.createElement('input', {
          type: 'range',
          min: '18',
          max: '80',
          value: ageRange[1],
          onChange: e=>onChangeAgeRange([ageRange[0],Number(e.target.value)]),
          className: 'w-full'
        })
      )
    ),
    React.createElement(SectionTitle, { title: 'Video-klip' }),
    React.createElement('div', { className: 'flex space-x-4 mb-4' }, (profile.videoClips||[]).slice(0,3).map((_,i)=>React.createElement(CameraIcon,{key:i,className:'w-10 h-10'}))),
    React.createElement(SectionTitle, { title: 'Lyd-klip' }),
    React.createElement('div', { className: 'flex space-x-4 mb-4' }, (profile.audioClips||[]).slice(0,3).map((_,i)=>React.createElement(Mic,{key:i,className:'w-10 h-10'}))),
    React.createElement(SectionTitle, { title: 'Om mig' }),
    React.createElement(Textarea, { readOnly: true }, profile.clip)
  );
};

// AdminScreen
const AdminScreen = ({ profiles, onSwitch, onReset }) => (
  React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: 'Admin: Skift profil' }),
    React.createElement('select', {
      className: 'border p-2 mb-4 w-full',
      onChange: e=>onSwitch(e.target.value),
      defaultValue: ''
    },
      React.createElement('option', { value: '' }, '-- vælg profil --'),
      profiles.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
    ),
    React.createElement(Button, {
      className: 'bg-pink-500 text-white w-full mb-2',
      onClick: onReset
    }, 'Reset database'),
    React.createElement('p', { className: 'text-gray-500 text-sm' }, 'Oplev app’en som en anden bruger.')
  )
);

// Seed Data
async function seedData() {
  const cols=['profiles','clips','matches','reflections'];
  for(const c of cols){const snap=await getDocs(collection(db,c));await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)));}
  const testUsers=[
    {id:'101',name:'Maria',age:49,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Elsker bøger og gåture.'},
    {id:'102',name:'Sofie',age:35,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Yoga-entusiast.'},
    {id:'103',name:'Emma',age:41,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Musikalsk sjæl.'},
    {id:'104',name:'Peter',age:45,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Cykler i weekenden.'},
    {id:'105',name:'Lars',age:52,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Madglad iværksætter.'},
    {id:'106',name:'Henrik',age:40,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Naturligvis fotograf.'}
  ];
  await Promise.all(testUsers.map(u=>setDoc(doc(db,'profiles',u.id),u)));
  const testClips=[
    {id:'c1',profileId:'101',gender:'Kvinde',text:'Bøger er mit frirum.'},
    {id:'c2',profileId:'104',gender:'Mand',text:'Cykler hver dag.'}
  ];
  await Promise.all(testClips.map(c=>setDoc(doc(db,'clips',c.id),c)));
  await setDoc(doc(db,'matches','m1'),{id:'m1',userId:'101',profileId:'104',lastMessage:'Hej Peter!'});
  await setDoc(doc(db,'reflections','r1'),{id:'r1',userId:'101',day:2,text:'Mødte Peter i dag.'});
}

// Main App
export default function RealDatingApp() {
  const [step,setStep]=useState(0);
  const profiles=useCollection('profiles');
  const [userId,setUserId]=useState(null);
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('discovery');
  const [viewProfile,setViewProfile]=useState(null);

  const handleReset=()=>{seedData();};

  useEffect(()=>{if(!userId && profiles.length) setUserId(profiles[0].id);},[profiles]);

  if(step===0) return React.createElement(WelcomeScreen, { onNext: ()=>setStep(1) });
  const currentUser=profiles.find(p=>p.id===userId);
  const selectProfile=id=>{setViewProfile(id); setTab('discovery');};

  return React.createElement('div', { className: 'flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-white' },
    React.createElement('div', { className: 'flex-1' },
      tab==='discovery' && !viewProfile && (
        React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange })
      ),
      viewProfile && (
        React.createElement(ProfileSettings, { userId: viewProfile, ageRange, onChangeAgeRange: setAgeRange })
      ),
      tab==='chat' && React.createElement(ChatScreen, { userId }),
      tab==='checkin' && React.createElement(DailyCheckIn, { userId })
    ),
    React.createElement('div', { className: 'p-4 bg-white shadow-inner flex justify-around' },
      React.createElement(HomeIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('discovery'); setViewProfile(null);} }),
      React.createElement(ChatIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('chat') }),
      React.createElement(CalendarDays, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('checkin') }),
      React.createElement(UserIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('profile') }),
      React.createElement(Sparkles, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('admin') })
    ),
    tab==='profile' && React.createElement(ProfileSettings, { userId, ageRange, onChangeAgeRange: setAgeRange }),
    tab==='admin' && React.createElement(AdminScreen, { profiles, onSwitch: setUserId, onReset: handleReset })
  );
}
