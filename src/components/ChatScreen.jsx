import React, { useState, useEffect, useRef } from 'react';
import { getAge } from '../utils.js';
import { User as UserIcon, Smile, MessageCircle as ChatIcon, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, db, doc, updateDoc, deleteDoc, arrayUnion, onSnapshot } from '../firebase.js';
import { sendPushNotification } from '../notifications.js';

export default function ChatScreen({ userId, onStartCall }) {
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const t = useT();
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const [incomingCall, setIncomingCall] = useState(false);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if(textareaRef.current){
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if(active){
      const updated = chats.find(c => c.id === active.id);
      if(updated) setActive(updated);
      if(active.unreadByUser || active.newMatch){
        updateDoc(doc(db,'matches',active.id),{unreadByUser:false,newMatch:false});
      }
    }
  }, [chats, active]);

  useEffect(() => {
    if(messagesRef.current){
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [active?.messages?.length]);

  useEffect(() => {
    if (!active) {
      setIncomingCall(false);
      return;
    }
    const id = [userId, active.profileId].sort().join('-');
    const callRef = doc(db, 'calls', id);
    const unsub = onSnapshot(callRef, snap => {
      const data = snap.data();
      setIncomingCall(snap.exists() && data?.from !== userId && !data?.answer);
    });
    return () => unsub();
  }, [active, userId]);

  const openChat = chat => {
    setActive(chat);
    if(chat.unreadByUser || chat.newMatch){
      updateDoc(doc(db,'matches',chat.id),{unreadByUser:false,newMatch:false});
    }
  };


  const sendMessage = async () => {
    const trimmed = text.trim();
    if(!trimmed || !active) return;
    const id1 = `${active.userId}-${active.profileId}`;
    const id2 = `${active.profileId}-${active.userId}`;
    const message = { from: userId, text: trimmed, ts: Date.now() };
    await Promise.all([
      updateDoc(doc(db,'matches',id1),{
        lastMessage: trimmed,
        unreadByProfile: true,
        unreadByUser: false,
        messages: arrayUnion(message),
        newMatch:false
      }),
      updateDoc(doc(db,'matches',id2),{
        lastMessage: trimmed,
        unreadByProfile: false,
        unreadByUser: true,
        messages: arrayUnion(message),
        newMatch:false
      })
    ]);
    sendPushNotification(trimmed, active.profileId);
    setText('');
    if(messagesRef.current){
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const unmatch = async () => {
    if(!active) return;
    if(!window.confirm('Er du sikker?')) return;
    const id1 = `${active.userId}-${active.profileId}`;
    const id2 = `${active.profileId}-${active.userId}`;
    await Promise.all([
      deleteDoc(doc(db,'matches',id1)),
      deleteDoc(doc(db,'matches',id2))
    ]);
    setActive(null);
  };

  const activeProfile = active ? profileMap[active.profileId] || {} : null;

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 touch-none', style:{maxHeight:'calc(100vh - 10rem)', overflow:'hidden', touchAction:'none'} },
    React.createElement(SectionTitle, {
      title: t('chat'),
      action: active && React.createElement(Button, { className: 'flex items-center gap-1', onClick: () => { setActive(null); } },
        React.createElement(ArrowLeft, { className: 'w-4 h-4' }), 'Tilbage')
    }),
      active ? (
      React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
          React.createElement('div', { className: 'flex flex-col items-center' },
            activeProfile.photoURL ?
              React.createElement('img', { src: activeProfile.photoURL, className: 'w-16 h-16 rounded-lg object-cover' }) :
              React.createElement(UserIcon, { className: 'w-16 h-16 text-pink-500' }),
            activeProfile.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified')
          ),
          React.createElement('p', { className: 'flex-1 font-medium' }, `${activeProfile.name || ''}, ${activeProfile.birthday ? getAge(activeProfile.birthday) : activeProfile.age || ''}, ${activeProfile.city || ''}`),
          React.createElement(Button, {
            className: 'bg-red-500 text-white',
            onClick: unmatch
          }, 'Unmatch')
        ),
        React.createElement('div', { ref: messagesRef, className: 'flex-1 bg-gray-100 p-4 rounded space-y-3 flex flex-col overflow-y-auto' },
          (active.messages || []).map((m,i) => {
            const fromSelf = m.from === userId;
            const time = new Date(m.ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
            return React.createElement('div', {
              key: i,
              className: `flex ${fromSelf ? 'justify-end' : 'justify-start'}`
            },
              React.createElement('div', { className: 'space-y-1 max-w-[75%]' },
                React.createElement('div', { className: 'text-xs text-gray-500' }, time),
                React.createElement('div', {
                  className: `inline-block px-3 py-2 rounded-lg ${fromSelf ? 'bg-pink-500 text-white' : 'bg-gray-200 text-black'}`
                }, m.text)
              )
            );
          })
        ),
        React.createElement('div', { className: 'flex flex-col gap-2 mt-2' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Textarea, {
              className: 'flex-1',
              placeholder: 'Skriv besked...',
              rows: 3,
              value: text,
              onChange: e => setText(e.target.value),
              ref: textareaRef
            }),
            React.createElement(Button, {
              className: 'bg-pink-500 text-white',
              disabled: !text.trim(),
              onClick: sendMessage
            },
              React.createElement(ChatIcon, null)
            )
          ),
          React.createElement(Button, {
            className: 'bg-pink-500 text-white',
            onClick: () => onStartCall && onStartCall([userId, active.profileId].sort().join('-'))
          }, incomingCall ? 'Deltag i opkald' : 'Foretag opkald')
        )
      )
    ) : (
      chats.length ?
        React.createElement('ul', { className: 'space-y-4 flex-1' },
          chats.map(m => {
            const p = profileMap[m.profileId] || {};
            const lastMessages = m.messages || [];
            const lastSorted = [...lastMessages].sort((a, b) => (a.ts || 0) - (b.ts || 0));
            const last = lastSorted[lastSorted.length - 1];
            const lastFromSelf = last && last.from === userId;
            return React.createElement('li', {
              key: m.id,
              className: 'flex items-center gap-4 bg-pink-50 p-2 rounded cursor-pointer',
              onClick: () => openChat(m)
            },
              React.createElement('div', { className:'flex flex-col items-center' },
                p.photoURL ?
                  React.createElement('img', { src: p.photoURL, className: 'w-10 h-10 rounded object-cover' }) :
                  React.createElement(UserIcon, { className: 'w-10 h-10 text-pink-500' }),
                p.verified && React.createElement('span', { className:'text-green-600 text-xs' }, 'Verified'),
                !lastFromSelf && React.createElement('span', { className: 'text-sm text-blue-600 font-semibold' }, 'Your turn!')
              ),
              React.createElement('div', { className: 'flex flex-col' },
                React.createElement('span', { className: 'font-medium' }, `${p.name || ''}, ${p.birthday ? getAge(p.birthday) : p.age || ''}, ${p.city || ''}`),
                m.lastMessage && React.createElement('span', { className: 'text-sm text-gray-500' }, m.lastMessage)
              )
            );
          })
        ) :
        React.createElement('p', { className: 'text-center text-gray-500 flex-1 flex items-center justify-center' }, 'Ingen matches endnu')
    )
  );
}
