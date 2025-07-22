import React, { useState } from 'react';
import { getCurrentDate, getTodayStr } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, db, doc, setDoc } from '../firebase.js';

export default function DailyCheckIn({ userId }) {
  const refs = useCollection('reflections','userId',userId);
  const t = useT();
  const [month,setMonth]=useState(()=>{
    const d=getCurrentDate();
    d.setDate(1);
    return d;
  });
  const daysInMonth=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const days=Array.from({length:daysInMonth},(_,i)=>i+1);
  const monthStr = month.toISOString().slice(0,7);
  const monthRefs = refs.filter(r => (r.date || '').startsWith(monthStr));
  const [text,setText]=useState('');

  const save = async () => {
    const trimmed = text.trim();
    if(!trimmed) return;
    const now = getCurrentDate();
    const date = getTodayStr();
    const id = `${userId}-${date}`;
    await setDoc(doc(db,'reflections',id),{id,userId,date,text:trimmed});
    setText('');
  };

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title: t('checkInTitle') }),
    React.createElement('div', { className: 'flex justify-between items-center mb-2' },
      React.createElement(Button, {
        size: 'sm',
        variant: 'outline',
        onClick: () => {
          const d = new Date(month);
          d.setMonth(d.getMonth() - 1);
          setMonth(d);
        }
      }, '<'),
      React.createElement('span', { className: 'font-medium' },
        month.toLocaleString('default', { month: 'long', year: 'numeric' })
      ),
      React.createElement(Button, {
        size: 'sm',
        variant: 'outline',
        onClick: () => {
          const d = new Date(month);
          d.setMonth(d.getMonth() + 1);
          setMonth(d);
        }
      }, '>')
    ),
    React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-4 text-xs' },
      days.map(day => (
        React.createElement('div', {
          key: day,
          className: `p-1 text-center leading-tight ${monthRefs.some(r=>parseInt(r.date.split('-')[2],10)===day)?'bg-pink-200 rounded':''}`
        }, day)
      ))
    ),
    React.createElement('ul', { className: 'list-disc list-inside mb-4' },
      monthRefs.map(r => {
        const d = parseInt(r.date.split('-')[2],10);
        let info = `${d}: ${r.text}`;
        if(r.profileName) info += ` \u2013 ${r.profileName}`;
        if(r.rating) info += ` (${r.rating}\u2605)`;
        return React.createElement('li', { key: r.id }, info);
      })
    ),
    React.createElement(Textarea, {
      placeholder: 'Skriv din refleksion...',
      className: 'mb-2',
      value: text,
      onChange: e => setText(e.target.value),
      onBlur: save
    }),
    React.createElement('p', {
      className: 'text-sm text-gray-500 mb-4 text-center'
    }, 'Refleksioner er private'),
    React.createElement(Button, {
      className: 'bg-pink-500 text-white',
      disabled: !text.trim(),
      onClick: save
    }, 'Gem refleksion')
  );
}
