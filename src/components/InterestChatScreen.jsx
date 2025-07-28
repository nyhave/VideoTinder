import React, { useState, useEffect, useRef } from 'react';
import { getAge } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useDoc, useCollection, db, doc, setDoc, arrayUnion, onSnapshot, getDoc } from '../firebase.js';
import RealettenPage from './RealettenPage.jsx';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function InterestChatScreen({ userId }) {
  const profile = useDoc('profiles', userId);
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [interest, setInterest] = useState(null);
  const chat = useDoc('interestChats', interest ? sanitizeInterest(interest) : null);
  const [text, setText] = useState('');
  const [showRealetten, setShowRealetten] = useState(false);
  const [realettenStarted, setRealettenStarted] = useState(false);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const t = useT();

  useEffect(() => {
    if(!interest && profile?.interests?.length){
      setInterest(profile.interests[0]);
    }
  }, [profile, interest]);

  useEffect(() => {
    if(textareaRef.current){
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if(messagesRef.current){
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chat?.messages?.length]);

  useEffect(() => {
    if(!interest) return;
    let ignore = false;
    // reset state immediately when switching interests so
    // the button text doesn't momentarily show outdated info
    setRealettenStarted(false);
    const ref = doc(db, 'turnGames', sanitizeInterest(interest));
    getDoc(ref).then(snap => {
      if(!ignore) setRealettenStarted(snap.exists());
    });
    const unsub = onSnapshot(ref, snap => {
      if(!ignore) setRealettenStarted(snap.exists());
    });
    return () => {
      ignore = true;
      unsub();
    };
  }, [interest]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if(!trimmed || !interest) return;
    const message = { from: userId, text: trimmed, ts: Date.now() };
    await setDoc(
      doc(db, 'interestChats', sanitizeInterest(interest)),
      {
        interest,
        messages: arrayUnion(message)
      },
      { merge: true }
    );
    setText('');
  };

  if(!profile) return null;
  if(showRealetten && interest){
    return React.createElement(RealettenPage, { interest, userId, onBack:()=>setShowRealetten(false) });
  }

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1', style:{maxHeight:'calc(100vh - 10rem)', overflow:'hidden'} },
    React.createElement(SectionTitle, { title: t('interestChatsTitle') }),
    React.createElement('div', { className:'flex gap-2 mb-4 overflow-x-auto' },
      (profile.interests || []).map(i =>
        React.createElement(Button, {
          key:i,
          className:`px-2 py-1 rounded-full ${i===interest?'bg-pink-500 text-white':'bg-gray-200 text-black'}`,
          onClick:()=>setInterest(i)
        }, i)
      )
    ),
    interest && React.createElement(React.Fragment, null,
      React.createElement('div', { ref:messagesRef, className:'flex-1 bg-gray-100 p-4 rounded space-y-3 flex flex-col overflow-y-auto' },
        (chat?.messages || []).map((m,i)=>{
          const fromSelf = m.from === userId;
          const p = profileMap[m.from] || {};
          const time = new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          const nameAge = p.name ? `${p.name}, ${p.birthday?getAge(p.birthday):p.age||''}` : '';
          return React.createElement('div',{key:i,className:`flex ${fromSelf?'justify-end':'justify-start'}`},
            React.createElement('div',{className:'space-y-1 max-w-[75%]'},
              React.createElement('div',{className:'text-xs text-gray-500'}, nameAge?`${nameAge} \u2013 ${time}`:time),
              React.createElement('div',{className:`inline-block px-3 py-2 rounded-lg ${fromSelf?'bg-pink-500 text-white':'bg-gray-200 text-black'}`}, m.text)
            )
          );
        })
      ),
      React.createElement('div', { className:'flex items-center gap-2 mt-2' },
        React.createElement(Textarea, {
          className:'flex-1',
          placeholder:'Skriv besked...',
          rows:3,
          value:text,
          onChange:e=>setText(e.target.value),
          ref:textareaRef
        }),
        React.createElement(Button, { className:'bg-pink-500 text-white', disabled:!text.trim(), onClick:sendMessage }, 'Send')
      ),
      React.createElement(Button, { className:'bg-blue-600 text-white font-bold mt-2', onClick:()=>setShowRealetten(true) }, realettenStarted ? 'Realetten started - Join now!' : 'Tag Chancen - Pr\u00f8v Realetten')
    )
  );
}
