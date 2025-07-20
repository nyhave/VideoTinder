import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n.js';
import { Home as HomeIcon, User as UserIcon, MessageCircle as ChatIcon, CalendarDays, Heart, Shield, HelpCircle } from 'lucide-react';
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
import TrackUserScreen from './components/TrackUserScreen.jsx';
import ServerLogScreen from './components/ServerLogScreen.jsx';
import RecentLoginsScreen from './components/RecentLoginsScreen.jsx';
import ProfileEpisode from './components/ProfileEpisode.jsx';
import HelpOverlay from './components/HelpOverlay.jsx';
import TaskButton from './components/TaskButton.jsx';
import { getNextTask } from './tasks.js';
import { useCollection, requestNotificationPermission, subscribeToWebPush, db, doc, updateDoc, increment, logEvent } from './firebase.js';
import { getCurrentDate } from './utils.js';
import { cacheMediaIfNewer } from './cacheMedia.js';

// Temporarily disable admin password check
// const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';


export default function VideotpushApp() {
  const [lang, setLang] = useState(() =>
    localStorage.getItem('lang') || 'en'
  );
  const [loggedIn, setLoggedIn] = useState(() => {
    const stored = localStorage.getItem('loggedIn');
    return stored === 'true';
  });
  const DEFAULT_USER_ID = '101';
  const LAST_USER_KEY = 'preferredUserId';
  const [userId, setUserId] = useState(null);
  const [loginMethod, setLoginMethod] = useState('password');
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('discovery');
  const [viewProfile,setViewProfile]=useState(null);
  const [videoCallId,setVideoCallId]=useState(null);
  const [showHelp,setShowHelp]=useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [taskClicks, setTaskClicks] = useState(0);
  const unreadCount = chats.filter(c => c.unreadByUser || c.newMatch).length;
  const hasUnread = unreadCount > 0;
  const currentUser = profiles.find(p => p.id === userId) || {};

  useEffect(() => {
    if (!activeTask) return;
    const next = getNextTask(currentUser);
    if (!next || next.key !== activeTask) {
      setActiveTask(null);
    }
  }, [currentUser, activeTask]);

  const openDailyClips = () => {
    setTab('discovery');
    setViewProfile(null);
  };

  const openProfileSettings = () => {
    setTab('profile');
    setViewProfile(null);
  };

  const handleTaskClick = () => {
    const task = getNextTask(currentUser);
    if (!task) return;
    setActiveTask(task.key);
    setTaskClicks(c => c + 1);
    if (tab !== 'profile') {
      setTab('profile');
      setViewProfile(null);
    }
  };

  const openAdmin = () => {
    const stored = localStorage.getItem('adminAuthorized') === 'true';
    // Temporarily bypass password check while ADMIN_PASSWORD is disabled
    if (!stored) {
      /*
      const pass = prompt('Admin password:');
      if (pass !== ADMIN_PASSWORD) {
        alert('Wrong password');
        return;
      }
      */
      localStorage.setItem('adminAuthorized', 'true');
    }
    setTab('admin');
  };

  const saveUserAndLogout = () => {
    if (userId) {
      localStorage.setItem(LAST_USER_KEY, userId);
    }
    setLoggedIn(false);
    setLoginMethod('password');
    setTab('discovery');
    setViewProfile(null);
  };

  const logout = () => {
    setLoggedIn(false);
    setLoginMethod('password');
    setTab('discovery');
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
      const savedId = localStorage.getItem(LAST_USER_KEY);
      const defaultProfile =
        (savedId && profiles.find(p => p.id === savedId)) ||
        profiles.find(p => p.id === DEFAULT_USER_ID) ||
        profiles[0];
      if (defaultProfile) setUserId(defaultProfile.id);
    }
  },[loggedIn, profiles, userId]);

  useEffect(() => {
    if(loggedIn && userId){
      logEvent('active user', { userId });
      updateDoc(doc(db, 'profiles', userId), {
        lastActive: getCurrentDate().toISOString()
      }).catch(err => console.error('Failed to update lastActive', err));
    }
  }, [loggedIn, userId]);

  useEffect(() => {
    if (loggedIn && userId) {
      (async () => {
        await requestNotificationPermission(userId, loginMethod);
        await subscribeToWebPush(userId, loginMethod);
      })();
    }
  }, [loggedIn, userId, loginMethod]);

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
    React.createElement(WelcomeScreen, { onLogin: id => { setLoggedIn(true); setUserId(id); setLoginMethod('password'); logEvent('login'); } })
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
        onClick: openAdmin
      },
        React.createElement(Shield, { className: 'w-6 h-6 text-white' })
      ),
      'RealDate',
      React.createElement(HelpCircle, {
        className: 'absolute top-1/2 right-16 -translate-y-1/2 cursor-pointer',
        onClick: () => setShowHelp(true)
      }),
      userId && React.createElement('div', {
        className: 'absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer',
        onClick: openProfileSettings
      },
        currentUser.photoURL ?
          React.createElement('img', { src: currentUser.photoURL, alt: 'Profil', className: 'w-8 h-8 rounded-lg object-cover' }) :
          React.createElement(UserIcon, { className: 'w-8 h-8 text-white' })
      )
    ),

    React.createElement('div', { className: 'flex-1', style: { marginTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)' } },
      videoCallId ?
        React.createElement(VideoCallPage, { matchId: videoCallId, userId, onBack: () => setVideoCallId(null) }) :
        React.createElement(React.Fragment, null,
          React.createElement(TaskButton, { profile: currentUser, onClick: handleTaskClick }),
          tab==='discovery' && !viewProfile && (
            React.createElement(DailyDiscovery, { userId, onSelectProfile: selectProfile, ageRange, onOpenProfile: openProfileSettings })
          ),
          viewProfile && (
            viewProfile === userId ?
              React.createElement(ProfileSettings, {
                userId: viewProfile,
                viewerId: userId,
                ageRange,
                onChangeAgeRange: setAgeRange,
                publicView: true,
                onBack: openProfileSettings,
                activeTask,
                taskTrigger: taskClicks
              }) :
              React.createElement(ProfileEpisode, {
                userId,
                profileId: viewProfile,
                onBack: openDailyClips
              })
          ),
          tab==='chat' && React.createElement(ChatScreen, { userId, onStartCall: id => setVideoCallId(id) }),
          tab==='checkin' && React.createElement(DailyCheckIn, { userId }),
          tab==='profile' && React.createElement(ProfileSettings, {
            userId,
            ageRange,
            onChangeAgeRange: setAgeRange,
            onViewPublicProfile: viewOwnPublicProfile,
            onOpenAbout: ()=>setTab('about'),
            onLogout: logout,
            activeTask,
            taskTrigger: taskClicks
          }),
          tab==='likes' && React.createElement(LikesScreen, { userId, onBack: ()=>setTab('discovery'), onSelectProfile: selectProfile }),
          tab==='admin' && React.createElement(AdminScreen, { onOpenStats: ()=>setTab('stats'), onOpenBugReports: ()=>setTab('bugs'), onOpenMatchLog: ()=>setTab('matchlog'), onOpenScoreLog: ()=>setTab('scorelog'), onOpenReports: ()=>setTab('reports'), onOpenCallLog: ()=>setTab('calllog'), onOpenFunctionTest: ()=>setTab('functiontest'), onOpenTextLog: ()=>setTab('textlog'), onOpenUserLog: ()=>setTab('trackuser'), onOpenServerLog: ()=>setTab('serverlog'), onOpenRecentLogins: ()=>setTab('recentlogins'), profiles, userId, onSwitchProfile: id=>{ setUserId(id); setLoginMethod('admin'); }, onSaveUserLogout: saveUserAndLogout }),
          tab==='stats' && React.createElement(StatsScreen, { onBack: ()=>setTab('admin') }),
          tab==='matchlog' && React.createElement(MatchLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='scorelog' && React.createElement(ScoreLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='calllog' && React.createElement(ActiveCallsScreen, { onBack: ()=>setTab('admin') }),
          tab==='reports' && React.createElement(ReportedContentScreen, { onBack: ()=>setTab('admin') }),
          tab==='bugs' && React.createElement(BugReportsScreen, { onBack: ()=>setTab('admin') }),
          tab==='functiontest' && React.createElement(FunctionTestScreen, { onBack: ()=>setTab('admin') }),
          tab==='textlog' && React.createElement(TextLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='trackuser' && React.createElement(TrackUserScreen, { onBack: ()=>setTab('admin'), profiles }),
          tab==='serverlog' && React.createElement(ServerLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='recentlogins' && React.createElement(RecentLoginsScreen, { onBack: ()=>setTab('admin') }),
          tab==='about' && React.createElement(AboutScreen, { userId })
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
        hasUnread && React.createElement('span', { className: 'absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1' }, unreadCount)
      ),
      React.createElement(CalendarDays, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('checkin'); setViewProfile(null);} })
      ),
    showHelp && React.createElement(HelpOverlay, { onClose: ()=>setShowHelp(false) })
  ));
}
