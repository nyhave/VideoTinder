import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n.js';
import { User as UserIcon, Shield, HelpCircle } from 'lucide-react';
import { VideoCameraIcon, HeartIcon, ChatBubbleOvalLeftIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/solid';
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
import ActiveGroupCallsScreen from './components/ActiveGroupCallsScreen.jsx';
import ReportedContentScreen from './components/ReportedContentScreen.jsx';
import AboutScreen from './components/AboutScreen.jsx';
import FunctionTestScreen from './components/FunctionTestScreen.jsx';
import RevealTestScreen from './components/RevealTestScreen.jsx';
import TextLogScreen from './components/TextLogScreen.jsx';
import TextPiecesScreen from './components/TextPiecesScreen.jsx';
import TrackUserScreen from './components/TrackUserScreen.jsx';
import ServerLogScreen from './components/ServerLogScreen.jsx';
import RecentLoginsScreen from './components/RecentLoginsScreen.jsx';
import InterestChatScreen from './components/InterestChatScreen.jsx';
import ProfileEpisode from './components/ProfileEpisode.jsx';
import HelpOverlay from './components/HelpOverlay.jsx';
import ConsoleLogPanel from './components/ConsoleLogPanel.jsx';
import FunctionTestGuide from './components/FunctionTestGuide.jsx';
import TaskButton from './components/TaskButton.jsx';
import GraphicsElementsScreen from './components/GraphicsElementsScreen.jsx';
import { getNextTask } from './tasks.js';
import { useCollection, requestNotificationPermission, subscribeToWebPush, db, doc, getDoc, updateDoc, increment, logEvent, auth, isAdminUser, signOutUser } from './firebase.js';
import { getCurrentDate } from './utils.js';
import { cacheMediaIfNewer } from './cacheMedia.js';
import version from './version.js';
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
  const likesReceived = useCollection('likes', 'profileId', userId);
  const [seenLikes, setSeenLikes] = useState(() => {
    if (typeof localStorage === 'undefined' || !userId) return [];
    try {
      return JSON.parse(localStorage.getItem(`seenLikes-${userId}`) || '[]');
    } catch {
      return [];
    }
  });
  const [ageRange,setAgeRange]=useState([35,55]);
  const [tab,setTab]=useState('admin');
  const [viewProfile,setViewProfile]=useState(null);
  const [returnTab,setReturnTab]=useState('discovery');
  const [videoCallId,setVideoCallId]=useState(null);
  const [showHelp,setShowHelp]=useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [taskClicks, setTaskClicks] = useState(0);
  const unreadCount = chats.filter(c => c.unreadByUser || c.newMatch).length;
  const hasUnread = unreadCount > 0;
  const unseenLikesCount = likesReceived.filter(l => !seenLikes.includes(l.id)).length;
  const hasUnseenLikes = unseenLikesCount > 0;
  const currentUser = profiles.find(p => p.id === userId) || {};

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`seenLikes-${userId}`) || '[]');
      setSeenLikes(stored);
    } catch {
      setSeenLikes([]);
    }
  }, [userId]);

  useEffect(() => {
    if (tab === 'likes' && likesReceived.loaded && userId) {
      const ids = likesReceived.map(l => l.id);
      localStorage.setItem(`seenLikes-${userId}`, JSON.stringify(ids));
      setSeenLikes(ids);
    }
  }, [tab, likesReceived, userId]);

  useEffect(() => {
    if (!activeTask) return;
    const next = getNextTask(currentUser);
    if (!next || next.key !== activeTask) {
      setActiveTask(null);
    }
  }, [currentUser, activeTask]);

  const openDailyClips = () => {
    setTab(returnTab);
    setViewProfile(null);
    setReturnTab('discovery');
  };

  const openProfileSettings = () => {
    setActiveTask(null);
    setTab('profile');
    setViewProfile(null);
  };

  useEffect(() => {
    const handler = e => {
      switch (e.detail) {
        case 'dailyClips':
          setTab('discovery');
          setViewProfile(null);
          break;
        case 'openAdmin':
          openAdmin();
          break;
        case 'openProfileSettings':
          openProfileSettings();
          break;
        case 'openBugReports':
          openBugReports();
          break;
        case 'openChat':
          setTab('chat');
          setViewProfile(null);
          break;
        case 'logout':
          logout();
          break;
        default:
          break;
      }
    };
    window.addEventListener('functionTestAction', handler);
    return () => window.removeEventListener('functionTestAction', handler);
  }, []);

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
    if (!isAdminUser(auth.currentUser)) {
      alert('Admin access denied');
      return;
    }
    setTab('admin');
    setViewProfile(null);
  };

  const openBugReports = () => {
    setTab('bugs');
    setViewProfile(null);
  };

  const saveUserAndLogout = () => {
    if (userId) {
      localStorage.setItem(LAST_USER_KEY, userId);
    }
    signOutUser().catch(() => {});
    setLoggedIn(false);
    setLoginMethod('password');
    setTab('discovery');
    setViewProfile(null);
  };

  const logout = () => {
    signOutUser().catch(() => {});
    setLoggedIn(false);
    setLoginMethod('password');
    setTab('discovery');
    setViewProfile(null);
  };

  const viewOwnPublicProfile = () => {
    setReturnTab('profile');
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


  // Ensure the current profile matches the authenticated user
  useEffect(()=>{
    if(!loggedIn){
      setUserId(null);
      return;
    }

    if(!userId && auth.currentUser){
      (async ()=>{
        try{
          const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
          const pid = snap.exists() ? snap.data().profileId : auth.currentUser.uid;
          setUserId(pid);
          localStorage.setItem(LAST_USER_KEY, pid);
        }catch(err){
          console.error('Failed to load user profile', err);
        }
      })();
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
    if (loggedIn && userId) {
      logEvent('active user', { userId });
      updateDoc(doc(db, 'profiles', userId), {
        lastActive: getCurrentDate().toISOString(),
        lastLoginMethod: loginMethod
      }).catch(err => console.error('Failed to update lastActive', err));
    }
  }, [loggedIn, userId, loginMethod]);

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
    React.createElement(WelcomeScreen, { onLogin: (id, method = 'password') => {
      setLoggedIn(true);
      setUserId(id);
      localStorage.setItem(LAST_USER_KEY, id);
      setLoginMethod(method);
      if (method === 'admin') {
        setTab('admin');
      } else {
        setTab('discovery');
      }
      logEvent('login');
    } })
  );
  const selectProfile = async id => {
    setReturnTab(tab);
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
      className: 'p-4 bg-pink-600 text-white text-center font-bold fixed top-0 left-0 right-0 z-30',
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
      React.createElement('span', {
        className: 'absolute text-xs text-white',
        style: { right: '4rem', top: 'calc(50% + 1rem)' }
      }, `v${version}`),
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
          tab==='interestchat' && React.createElement(InterestChatScreen, { userId, onSelectProfile: selectProfile }),
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
          tab==='admin' && React.createElement(AdminScreen, { onOpenStats: ()=>setTab('stats'), onOpenBugReports: ()=>setTab('bugs'), onOpenMatchLog: ()=>setTab('matchlog'), onOpenScoreLog: ()=>setTab('scorelog'), onOpenReports: ()=>setTab('reports'), onOpenCallLog: ()=>setTab('calllog'), onOpenGroupCallLog: ()=>setTab('groupcalllog'), onOpenFunctionTest: ()=>setTab('functiontest'), onOpenRevealTest: ()=>setTab('revealtest'), onOpenTextLog: ()=>setTab('textlog'), onOpenTextPieces: ()=>setTab('textpieces'), onOpenUserLog: ()=>setTab('trackuser'), onOpenServerLog: ()=>setTab('serverlog'), onOpenRecentLogins: ()=>setTab('recentlogins'), profiles, userId, onSwitchProfile: id=>{ setUserId(id); setLoginMethod('admin'); }, onSaveUserLogout: saveUserAndLogout }),
          tab==='stats' && React.createElement(StatsScreen, { onBack: ()=>setTab('admin') }),
          tab==='matchlog' && React.createElement(MatchLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='scorelog' && React.createElement(ScoreLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='calllog' && React.createElement(ActiveCallsScreen, { onBack: ()=>setTab('admin') }),
          tab==='groupcalllog' && React.createElement(ActiveGroupCallsScreen, { onBack: ()=>setTab('admin') }),
          tab==='reports' && React.createElement(ReportedContentScreen, { onBack: ()=>setTab('admin') }),
          tab==='bugs' && React.createElement(BugReportsScreen, { onBack: ()=>setTab('admin') }),
          tab==='functiontest' && React.createElement(FunctionTestScreen, { onBack: ()=>setTab('admin') }),
          tab==='revealtest' && React.createElement(RevealTestScreen, { onBack: ()=>setTab('admin') }),
          tab==='textlog' && React.createElement(TextLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='textpieces' && React.createElement(TextPiecesScreen, { onBack: ()=>setTab('admin') }),
          tab==='trackuser' && React.createElement(TrackUserScreen, { onBack: ()=>setTab('admin'), profiles }),
          tab==='serverlog' && React.createElement(ServerLogScreen, { onBack: ()=>setTab('admin') }),
          tab==='recentlogins' && React.createElement(RecentLoginsScreen, { onBack: ()=>setTab('admin') }),
          tab==='graphics' && React.createElement(GraphicsElementsScreen, { onBack: ()=>setTab('admin') }),
          tab==='about' && React.createElement(AboutScreen, { userId })
        )
    ),
    React.createElement('div', {
      className: 'p-4 bg-white shadow-inner flex justify-around fixed bottom-0 left-0 right-0 z-10',
      style: { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }
    },
      React.createElement(VideoCameraIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('discovery'); setViewProfile(null);} }),
      React.createElement('div', { className: 'relative', onClick: ()=>{setTab('likes'); setViewProfile(null);} },
        React.createElement(HeartIcon, { className: 'w-8 h-8 text-pink-600' }),
        hasUnseenLikes && React.createElement('span', { className: 'absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1' }, '1')
      ),
      React.createElement('div', { className: 'relative', onClick: ()=>{setTab('chat'); setViewProfile(null);} },
        React.createElement(ChatBubbleOvalLeftIcon, { className: 'w-8 h-8 text-pink-600' }),
        hasUnread && React.createElement('span', { className: 'absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1' }, unreadCount)
      ),
      React.createElement(UserGroupIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('interestchat'); setViewProfile(null);} }),
      React.createElement(CalendarDaysIcon, { className: 'w-8 h-8 text-pink-600', onClick: ()=>{setTab('checkin'); setViewProfile(null);} })
      ),
    showHelp && React.createElement(HelpOverlay, { onClose: ()=>setShowHelp(false) }),
    React.createElement(ConsoleLogPanel),
    React.createElement(FunctionTestGuide)
  ));
}
