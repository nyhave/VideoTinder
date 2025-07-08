import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, User as UserIcon, MessageCircle as ChatIcon, CalendarDays, Sparkles } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import DailyDiscovery from './components/DailyDiscovery.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import DailyCheckIn from './components/DailyCheckIn.jsx';
import ProfileSettings from './components/ProfileSettings.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import { useCollection, db, collection, getDocs, deleteDoc, doc, setDoc } from './firebase.js';

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

export default function RealDatingApp() {
  const [step,setStep]=useState(0);
  const profiles=useCollection('profiles');
  const [userId,setUserId]=useState(null);
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('discovery');
  const [viewProfile,setViewProfile]=useState(null);

  useEffect(()=>{seedData();},[]);
  useEffect(()=>{if(!userId && profiles.length) setUserId(profiles[0].id);},[profiles]);

  if(step===0) return React.createElement(WelcomeScreen, { onNext: ()=>setStep(1) });
  const selectProfile=id=>{setViewProfile(id); setTab('discovery');};

  return React.createElement('div', { className: 'flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-white' },
    React.createElement('div', { className: 'flex-1 pb-20' },
      tab==='discovery' && !viewProfile && (
        React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange })
      ),
      viewProfile && (
        React.createElement(ProfileSettings, { userId: viewProfile, ageRange, onChangeAgeRange: setAgeRange })
      ),
      tab==='chat' && React.createElement(ChatScreen, { userId }),
      tab==='checkin' && React.createElement(DailyCheckIn, { userId }),
      tab==='profile' && React.createElement(ProfileSettings, { userId, ageRange, onChangeAgeRange: setAgeRange }),
      tab==='admin' && React.createElement(AdminScreen, { profiles, onSwitch: setUserId })
    ),
    React.createElement('div', { className: 'p-4 bg-white shadow-inner flex justify-around fixed bottom-0 left-0 right-0' },
      React.createElement(HomeIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('discovery'); setViewProfile(null);} }),
      React.createElement(ChatIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('chat') }),
      React.createElement(CalendarDays, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('checkin') }),
      React.createElement(UserIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('profile') }),
      React.createElement(Sparkles, { className: 'w-8 h-8 text-pink-600', onClick: ()=>setTab('admin') })
    )
  );
}
