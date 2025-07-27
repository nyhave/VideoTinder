import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import RealettenCallScreen from './RealettenCallScreen.jsx';
import RealettenGameOverlay from './RealettenGameOverlay.jsx';
import { useCollection } from '../firebase.js';

export default function RealettenPage({ interest, userId, onBack }) {
  const [players, setPlayers] = useState([]);
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [showGame, setShowGame] = useState(false);
  const playerNames = players.map(id => profileMap[id]?.name || id);
  const action = React.createElement('div',{className:'flex gap-2'},
    React.createElement(Button,{ className:'flex items-center gap-1', onClick:onBack },
      React.createElement(ArrowLeft,{ className:'w-4 h-4' }), 'Tilbage'),
    React.createElement(Button,{ className:'bg-pink-500 text-white', disabled:players.length===0, onClick:()=>setShowGame(true) }, 'Start spil')
  );
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 overflow-y-auto' },
    React.createElement(SectionTitle,{ title:'Realetten', action }),
    React.createElement(RealettenCallScreen,{ interest, userId, onEnd:onBack, onParticipantsChange:setPlayers }),
    showGame && React.createElement(RealettenGameOverlay,{ players: playerNames, onClose:()=>setShowGame(false) })
  );
}
