import React, { useState } from 'react';
import { User as UserIcon, Smile, MessageCircle as ChatIcon } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Textarea } from './ui/textarea.js';
import SectionTitle from './SectionTitle.jsx';
import { useCollection } from '../firebase.js';

export default function ChatScreen({ userId }) {
  const profiles = useCollection('profiles');
  const chats = useCollection('matches', 'userId', userId);
  const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
  const [active, setActive] = useState(null);

  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-96' },
    React.createElement(SectionTitle, { title: 'Samtale' }),
    React.createElement('div', { className: 'flex overflow-x-auto space-x-4 p-2' },
      chats.map(m => (
        React.createElement('div', {
          key: m.id,
          className: 'text-center cursor-pointer',
          onClick: () => setActive(m)
        },
          React.createElement(UserIcon, { className: 'w-10 h-10 text-pink-500' }),
          React.createElement('p', { className: 'text-sm mt-1' }, nameMap[m.profileId])
        )
      ))
    ),
    active ? (
      React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'flex-1 overflow-y-auto bg-gray-100 p-4 rounded space-y-3' },
          React.createElement('div', { className: 'bg-pink-100 p-2 rounded-lg max-w-xs' },
            React.createElement(Smile, { className: 'inline w-6 h-6 mr-1' }), active.lastMessage
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
          React.createElement(Textarea, { className: 'flex-1', placeholder: 'Skriv besked...' }),
          React.createElement(Button, { className: 'bg-pink-500 text-white' },
            React.createElement(ChatIcon, null)
          )
        )
      )
    ) : React.createElement('p', { className: 'text-center text-gray-500 flex-1 flex items-center justify-center' }, 'Vælg chat')
  );
}
