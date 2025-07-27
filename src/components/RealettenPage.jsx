import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import RealettenCallScreen from './RealettenCallScreen.jsx';
import TurnGame from './TurnGame.jsx';
import { useCollection } from '../firebase.js';

export default function RealettenPage({ interest, userId, onBack }) {
  const [participants, setParticipants] = useState([]);
  const [showGame, setShowGame] = useState(false);
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const names = participants.map(id => profileMap[id]?.name || id);

  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 overflow-y-auto' },
    React.createElement(SectionTitle,{ title:'Realetten',
      action: React.createElement(Button,{ className:'flex items-center gap-1', onClick:onBack },
        React.createElement(ArrowLeft,{ className:'w-4 h-4' }), 'Tilbage')
    }),
    React.createElement(RealettenCallScreen,{ interest, userId, onEnd:onBack, onParticipantsChange:setParticipants }),
    !showGame && participants.length>1 && React.createElement(Button,{ className:'bg-blue-600 text-white font-bold mt-4', onClick:()=>setShowGame(true) }, 'Start spil'),
    showGame && React.createElement(TurnGame,{ initialPlayers:names })
  );
}
