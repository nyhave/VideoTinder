import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, User as UserIcon, MessageCircle as ChatIcon, CalendarDays, Sparkles } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import DailyDiscovery from './components/DailyDiscovery.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import DailyCheckIn from './components/DailyCheckIn.jsx';
import ProfileSettings from './components/ProfileSettings.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import { useCollection } from './firebase.js';


export default function RealDatingApp() {
  const [loggedIn,setLoggedIn]=useState(false);
  const profiles=useCollection('profiles');
  const [userId,setUserId]=useState(null);
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('discovery');
  const [viewProfile,setViewProfile]=useState(null);


  useEffect(()=>{seedData();},[]);
  useEffect(()=>{
    if(!loggedIn){
      setUserId(null);
      return;
    }
    if(!userId && profiles.length) setUserId(profiles[0].id);
  },[loggedIn, profiles, userId]);


  if(!loggedIn) return React.createElement(WelcomeScreen, { onNext: ()=>setLoggedIn(true) });
  const selectProfile=id=>{setViewProfile(id); setTab('discovery');};



  return React.createElement('div', { className: 'flex flex-col min-h-screen w-screen bg-gradient-to-br from-pink-100 to-white' },

    React.createElement('div', { className: 'flex-1' },

      tab==='discovery' && !viewProfile && (
        React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange })
      ),
      viewProfile && (
        React.createElement(ProfileSettings, { userId: viewProfile, ageRange, onChangeAgeRange: setAgeRange, publicView: true })
      ),
      tab==='chat' && React.createElement(ChatScreen, { userId }),
      tab==='checkin' && React.createElement(DailyCheckIn, { userId }),
      tab==='profile' && React.createElement(ProfileSettings, { userId, ageRange, onChangeAgeRange: setAgeRange, onLogout: ()=>{setLoggedIn(false); setTab('discovery'); setViewProfile(null);} }),
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
