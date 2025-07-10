import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Smile, MessageCircle as ChatIcon } from 'lucide-react';
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
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    if(active){
      const updated = chats.find(c => c.id === active.id);
      if(updated) setActive(updated);
      if(active.unreadByUser){
        updateDoc(doc(db,'matches',active.id),{unreadByUser:false});
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
    if(chat.unreadByUser){
      updateDoc(doc(db,'matches',chat.id),{unreadByUser:false});
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
        messages: arrayUnion(message)
      }),
      updateDoc(doc(db,'matches',id2),{
        lastMessage: trimmed,
        unreadByProfile: false,
        unreadByUser: true,
        messages: arrayUnion(message)
      })
    ]);
    setText('');
    if(messagesRef.current){
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const unmatch = async () => {
    if(!active) return;
    const id1 = `${active.userId}-${active.profileId}`;
    const id2 = `${active.profileId}-${active.userId}`;
    await Promise.all([
      deleteDoc(doc(db,'matches',id1)),
      deleteDoc(doc(db,'matches',id2))
    ]);
    setActive(null);
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-96' },
    React.createElement(SectionTitle, { title: t('chat') }),
    React.createElement('div', { className: 'flex overflow-x-auto space-x-4 p-2' },
      chats.map(m => (
        React.createElement('div', {
          key: m.id,
          className: 'text-center cursor-pointer',
          onClick: () => openChat(m)
        },
          React.createElement(UserIcon, { className: 'w-10 h-10 text-pink-500' }),
          React.createElement('p', { className: 'text-sm mt-1' }, nameMap[m.profileId])
        )
      ))
    ),
    active ? (
      React.createElement(React.Fragment, null,
        React.createElement('div', { ref: messagesRef, className: 'flex-1 overflow-y-auto bg-gray-100 p-4 rounded space-y-3 flex flex-col' },
          (active.messages || []).map((m,i) => (
            React.createElement('div', {
              key: i,
              className: `${m.from===userId ? 'bg-pink-100 self-end' : 'bg-gray-200'} p-2 rounded-lg max-w-xs`
            }, m.text)
          ))
        ),
        React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
          React.createElement(Textarea, {
            className: 'flex-1',
            placeholder: 'Skriv besked...',
            value: text,
            onChange: e => setText(e.target.value)
          }),
          React.createElement(Button, {
            className: 'bg-pink-500 text-white',
            disabled: !text.trim(),
            onClick: sendMessage
          },
            React.createElement(ChatIcon, null)
          ),
          React.createElement(Button, {
            className: 'btn-outline-red',
            onClick: unmatch
          }, 'Unmatch')
        )
      )
    ) : React.createElement('p', {
        className: 'text-center text-gray-500 flex-1 flex items-center justify-center'
      }, chats.length ? 'Vælg chat' : 'Ingen matches endnu')
  );
}
