import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n.js';
import { Home as HomeIcon, User as UserIcon, MessageCircle as ChatIcon, CalendarDays, Heart, Shield } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import DailyDiscovery from './components/DailyDiscovery.jsx';
import LikesScreen from './components/LikesScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';
import VideoCallPage from './components/VideoCallPage.jsx';
import DailyCheckIn from './components/DailyCheckIn.jsx';
import ProfileSettings from './components/ProfileSettings.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import StatsScreen from './components/StatsScreen.jsx';
import BugReportsScreen from './components/BugReportsScreen.jsx';
import MatchLogScreen from './components/MatchLogScreen.jsx';
import ScoreLogScreen from './components/ScoreLogScreen.jsx';
import ActiveCallsScreen from './components/ActiveCallsScreen.jsx';
import ReportedContentScreen from './components/ReportedContentScreen.jsx';
import AboutScreen from './components/AboutScreen.jsx';
import FunctionTestScreen from './components/FunctionTestScreen.jsx';
import TextLogScreen from './components/TextLogScreen.jsx';
import { useCollection, requestNotificationPermission, subscribeToWebPush, db, doc, updateDoc, increment, logEvent } from './firebase.js';
import { cacheMediaIfNewer } from './cacheMedia.js';


export default function VideotpushApp() {
  const [lang, setLang] = useState(() =>
    localStorage.getItem('lang') || 'en'
  );
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
  const [videoCallId,setVideoCallId]=useState(null);
  const hasUnread = chats.some(c => c.unreadByUser || c.newMatch);
  const currentUser = profiles.find(p => p.id === userId) || {};

  const openDailyClips = () => {
    setTab('discovery');
    setViewProfile(null);
  };

  const openProfileSettings = () => {
    setTab('profile');
    setViewProfile(null);
  };

  const viewOwnPublicProfile = () => {
    setViewProfile(userId);
    setTab('discovery');
  };

  // Persist login status between sessions
  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn ? 'true' : 'false');
  }, [loggedIn]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);


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

  useEffect(() => {
    if(loggedIn && userId){
      logEvent('active user', { userId });
    }
  }, [loggedIn, userId]);

  useEffect(() => {
    if (loggedIn && userId) {
      requestNotificationPermission(userId);
      subscribeToWebPush(userId);
    }
  }, [loggedIn, userId]);

  useEffect(() => {
    profiles.forEach(p => {
      if (p.photoURL) {
        cacheMediaIfNewer(p.photoURL, p.photoUploadedAt);
      }
      (p.audioClips || []).forEach(a => {
        const url = a && a.url ? a.url : a;
        const ts = a && a.uploadedAt;
        if (url) cacheMediaIfNewer(url, ts);
      });
      (p.videoClips || []).forEach(v => {
        const url = v && v.url ? v.url : v;
        const ts = v && v.uploadedAt;
        if (url) cacheMediaIfNewer(url, ts);
      });
    });
  }, [profiles]);


  if(!loggedIn) return React.createElement(LanguageProvider, { value:{lang,setLang} },
    React.createElement(WelcomeScreen, { onLogin: () => { setLoggedIn(true); logEvent('login'); } })
  );
  const selectProfile = async id => {
    setViewProfile(id);
    setTab('discovery');
    try {
      await updateDoc(doc(db, 'profiles', id), { viewCount: increment(1) });
    } catch(err) {
      console.error('Failed to record profile view', err);
    }
  };



  return React.createElement(LanguageProvider, { value:{lang,setLang} },
    React.createElement('div', { className: 'flex flex-col min-h-[100dvh] w-screen bg-gradient-to-br from-pink-100 to-white pb-24 overflow-hidden' },

    React.createElement('div', {
      className: 'p-4 bg-pink-600 text-white text-center font-bold fixed top-0 left-0 right-0 z-10',
      style: { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }
    },
      userId && React.createElement('div', {
        className: 'absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer',
        onClick: () => setTab('admin')
      },
        React.createElement(Shield, { className: 'w-6 h-6 text-white' })
      ),
      'RealDate',
      userId && React.createElement('div', {
        className: 'absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer',
        onClick: openProfileSettings
      },
        currentUser.photoURL ?
          React.createElement('img', { src: currentUser.photoURL, alt: 'Profil', className: 'w-8 h-8 rounded-full object-cover' }) :
          React.createElement(UserIcon, { className: 'w-8 h-8 text-white' })
      )
    ),

    React.createElement('div', { className: 'flex-1', style: { marginTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)' } },
      videoCallId ?
        React.createElement(VideoCallPage, { matchId: videoCallId, userId, onBack: () => setVideoCallId(null) }) :
        React.createElement(React.Fragment, null,
          tab==='discovery' && !viewProfile && (
            React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange, onOpenProfile: openProfileSettings })
          ),
          viewProfile && (
            React.createElement(ProfileSettings, {
              userId: viewProfile,
              viewerId: userId,
              ageRange,
              onChangeAgeRange: setAgeRange,
              publicView: true,
              onBack: viewProfile === userId ? openProfileSettings : openDailyClips
            })
          ),
          tab==='chat' && React.createElement(ChatScreen, { userId, onStartCall: id => setVideoCallId(id) }),
          tab==='checkin' && React.createElement(DailyCheckIn, { userId }),
          tab==='profile' && React.createElement(ProfileSettings, {
            userId,
            ageRange,
            onChangeAgeRange: setAgeRange,
            onLogout: ()=>{setLoggedIn(false); setTab('discovery'); setViewProfile(null);},
            onViewPublicProfile: viewOwnPublicProfile,
            onOpenAbout: ()=>setTab('about')
          }),
          tab==='likes' && React.createElement(LikesScreen, { userId, onBack: ()=>setTab('discovery'), onSelectProfile: selectProfile }),
          tab==='admin' && React.createElement(AdminScreen, { onOpenStats: ()=>setTab('stats'), onOpenBugReports: ()=>setTab('bugs'), onOpenMatchLog: ()=>setTab('matchlog'), onOpenScoreLog: ()=>setTab('scorelog'), onOpenReports: ()=>setTab('reports'), onOpenCallLog: ()=>setTab('calllog'), onOpenFunctionTest: ()=>setTab('functiontest'), onOpenTextLog: ()=>setTab('textlog'), profiles, userId, onSwitchProfile: id=>setUserId(id) }),
          tab==='stats' && React.createElement(StatsScreen, { onBack: ()=>setTab('admin') }),
          tab==='matchlog' && React.createElement(MatchLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='scorelog' && React.createElement(ScoreLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='calllog' && React.createElement(ActiveCallsScreen, { onBack: ()=>setTab('admin') }),
          tab==='reports' && React.createElement(ReportedContentScreen, { onBack: ()=>setTab('admin') }),
          tab==='bugs' && React.createElement(BugReportsScreen, { onBack: ()=>setTab('admin') }),
          tab==='functiontest' && React.createElement(FunctionTestScreen, { onBack: ()=>setTab('admin') }),
          tab==='textlog' && React.createElement(TextLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='about' && React.createElement(AboutScreen, null)
        )
    ),
    React.createElement('div', {
      className: 'p-4 bg-white shadow-inner flex justify-around fixed bottom-0 left-0 right-0 z-10',
      style: { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }
    },
      React.createElement(HomeIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('discovery'); setViewProfile(null);} }),
      React.createElement(Heart, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('likes'); setViewProfile(null);} }),
      React.createElement('div', { className: 'relative', onClick: ()=>{setTab('chat'); setViewProfile(null);} },
        React.createElement(ChatIcon, { className: 'w-8 h-8 text-pink-600' }),
        hasUnread && React.createElement('span', { className: 'absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center' }, '1')
      ),
      React.createElement(CalendarDays, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('checkin'); setViewProfile(null);} })
      )
  ));
}
