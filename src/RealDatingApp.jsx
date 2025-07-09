import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, User as UserIcon, MessageCircle as ChatIcon, CalendarDays, Info as InfoIcon } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import DailyDiscovery from './components/DailyDiscovery.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import DailyCheckIn from './components/DailyCheckIn.jsx';
import ProfileSettings from './components/ProfileSettings.jsx';
import PremiumFeatures from './components/PremiumFeatures.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import AboutScreen from './components/AboutScreen.jsx';
import { useCollection } from './firebase.js';


export default function RealDatingApp() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const stored = localStorage.getItem('loggedIn');
    return stored === 'true';
  });
  const DEFAULT_USER_ID = '101';
  const [userId, setUserId] = useState(null);
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('discovery');
  const [viewProfile,setViewProfile]=useState(null);
  const hasUnread = chats.some(c => c.unreadByUser);

  const openDailyClips = () => {
    setTab('discovery');
    setViewProfile(null);
  };

  // Persist login status between sessions
  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn ? 'true' : 'false');
  }, [loggedIn]);


  // Removed automatic seeding of the database on app startup.
  useEffect(()=>{
    if(!loggedIn){
      setUserId(null);
      return;
    }
    if(!userId && profiles.length){
      const defaultProfile = profiles.find(p => p.id === DEFAULT_USER_ID);
      setUserId((defaultProfile || profiles[0]).id);
    }
  },[loggedIn, profiles, userId]);


  if(!loggedIn) return React.createElement(WelcomeScreen, { onNext: ()=>setLoggedIn(true) });
  const selectProfile=id=>{setViewProfile(id); setTab('discovery');};



  return React.createElement('div', { className: 'flex flex-col min-h-screen w-screen bg-gradient-to-br from-pink-100 to-white pb-24' },

    React.createElement('div', { className: 'flex-1' },

      tab==='discovery' && !viewProfile && (
        React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange, onOpenPremium: ()=>setTab('premium') })
      ),
      viewProfile && (
        React.createElement(ProfileSettings, { userId: viewProfile, ageRange, onChangeAgeRange: setAgeRange, publicView: true })
      ),
      tab==='chat' && React.createElement(ChatScreen, { userId }),
      tab==='checkin' && React.createElement(DailyCheckIn, { userId }),
      tab==='profile' && React.createElement(ProfileSettings, { userId, ageRange, onChangeAgeRange: setAgeRange, onLogout: ()=>{setLoggedIn(false); setTab('discovery'); setViewProfile(null);} }),
      tab==='premium' && React.createElement(PremiumFeatures, { userId, onBack: ()=>setTab('profile'), onSelectProfile: selectProfile }),
      tab==='admin' && React.createElement(AdminScreen, { profiles, onSwitch: setUserId, currentUserId: userId, onOpenDiscovery: openDailyClips }),
      tab==='about' && React.createElement(AboutScreen, { onOpenAdmin: ()=>setTab('admin') })
    ),
    React.createElement('div', { className: 'p-4 bg-white shadow-inner flex justify-around fixed bottom-0 left-0 right-0' },
      React.createElement(HomeIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('discovery'); setViewProfile(null);} }),
      React.createElement('div', { className: 'relative', onClick: ()=>{setTab('chat'); setViewProfile(null);} },
        React.createElement(ChatIcon, { className: 'w-8 h-8 text-pink-600' }),
        hasUnread && React.createElement('span', { className: 'absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center' }, '1')
      ),
      React.createElement(CalendarDays, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('checkin'); setViewProfile(null);} }),
      React.createElement(UserIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('profile'); setViewProfile(null);} }),
      React.createElement(InfoIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('about'); setViewProfile(null);} })
      )
  );
}
