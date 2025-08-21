import React, { useState } from 'react';
import { getCurrentDate, getTodayStr } from '../utils.js';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useT } from '../i18n.js';
import { useCollection, db, doc, setDoc, collection } from '../firebase.js';

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
  const monthRefs = refs
    .filter(r => (r.date || '').startsWith(monthStr))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const [text,setText]=useState('');
  const MAX_REFLECTION_LEN = 30;

  const save = async () => {
    const trimmed = text.trim().slice(0, MAX_REFLECTION_LEN);
    if(!trimmed) return;
    const date = getTodayStr();
    const refDoc = doc(collection(db,'reflections'));
    await setDoc(refDoc,{id:refDoc.id,userId,date,text:trimmed});
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
        const [,m,d] = (r.date || '').split('-');
        const dayNum = parseInt(d,10);
        const monthNum = parseInt(m,10);
        let info = `${dayNum}/${monthNum}: ${r.text}`;
        if(r.profileName) info += ` \u2013 ${r.profileName}`;
        return React.createElement('li', { key: r.id }, info);
      })
    ),
    React.createElement(Textarea, {
      placeholder: 'Skriv din refleksion...',
      className: 'mb-1',
      value: text,
      maxLength: MAX_REFLECTION_LEN,
      onChange: e => setText(e.target.value.slice(0, MAX_REFLECTION_LEN)),
      onBlur: save
    }),
    React.createElement('p', { className:'text-xs text-right text-gray-500 mb-2' },
      t('charactersLeft').replace('{count}', MAX_REFLECTION_LEN - text.length)),
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
