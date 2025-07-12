import React, { useState, useEffect, useRef } from 'react';
import { getAge } from '../utils.js';
import { User as UserIcon, Smile, MessageCircle as ChatIcon, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, db, doc, updateDoc, deleteDoc, arrayUnion } from '../firebase.js';

export default function ChatScreen({ userId }) {
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const t = useT();
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const messagesRef = useRef(null);

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
  const userProfile = profileMap[userId] || {};

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1' },
    React.createElement(SectionTitle, {
      title: t('chat'),
      action: active && React.createElement(Button, { className: 'flex items-center gap-1', onClick: () => setActive(null) },
        React.createElement(ArrowLeft, { className: 'w-4 h-4' }), 'Tilbage')
    }),
    active ? (
      React.createElement(React.Fragment, null,
        activeProfile.photoURL ?
          React.createElement('img', { src: activeProfile.photoURL, className: 'w-24 h-24 rounded-full object-cover self-center mb-2' }) :
          React.createElement(UserIcon, { className: 'w-24 h-24 text-pink-500 self-center mb-2' }),
        React.createElement('p', { className: 'text-center font-medium mb-2' }, `${activeProfile.name || ''}, ${activeProfile.birthday ? getAge(activeProfile.birthday) : activeProfile.age || ''}, ${activeProfile.city || ''}`),
        React.createElement('div', { ref: messagesRef, className: 'flex-1 overflow-y-auto bg-gray-100 p-4 rounded space-y-3 flex flex-col' },
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
              onChange: e => setText(e.target.value)
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
            className: 'btn-outline-red',
            onClick: unmatch
          }, 'Unmatch')
        )
      )
    ) : (
      chats.length ?
        React.createElement('ul', { className: 'space-y-4 overflow-y-auto flex-1' },
          chats.map(m => {
            const p = profileMap[m.profileId] || {};
            return React.createElement('li', {
              key: m.id,
              className: 'flex items-center gap-4 bg-pink-50 p-2 rounded cursor-pointer',
              onClick: () => openChat(m)
            },
              p.photoURL ?
                React.createElement('img', { src: p.photoURL, className: 'w-10 h-10 rounded object-cover' }) :
                React.createElement(UserIcon, { className: 'w-10 h-10 text-pink-500' }),
              React.createElement('span', null, `${p.name || ''}, ${p.birthday ? getAge(p.birthday) : p.age || ''}, ${p.city || ''}`)
            );
          })
        ) :
        React.createElement('p', { className: 'text-center text-gray-500 flex-1 flex items-center justify-center' }, 'Ingen matches endnu')
    )
  );
}
