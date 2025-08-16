import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import RealettenCallScreen from './RealettenCallScreen.jsx';
import TurnGame from './TurnGame.jsx';
import { useCollection, db, doc, setDoc, onSnapshot } from '../firebase.js';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function RealettenPage({ interest, userId, onBack }) {
  const [players, setPlayers] = useState([]);
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [game, setGame] = useState(null);
  useEffect(() => {
    if (!interest) return;
    const gameId = sanitizeInterest(interest);
    const ref = doc(db, 'turnGames', gameId);
    const unsub = onSnapshot(ref, snap => {
      const data = snap.data() || {};
      if (snap.exists() && data.step !== 'done') {
        setGame(g => g || 'turn');
      } else {
        setGame(g => g === 'turn' ? null : g);
      }
    });
    return () => unsub();
  }, [interest]);

  const playerNames = players.map(id => profileMap[id]?.name || id);
  const myName = profileMap[userId]?.name || userId;

  const action = React.createElement('div',{className:'flex gap-2'},
    React.createElement(Button,{ className:'flex items-center gap-1', onClick:onBack },
      React.createElement(ArrowLeft,{ className:'w-4 h-4' }), 'Tilbage')
  );
  const startGame = async () => {
    const gameId = sanitizeInterest(interest);
    const init = Object.fromEntries(playerNames.map(p => [p, 0]));
    await setDoc(doc(db, 'turnGames', gameId), {
      players: playerNames,
      scores: init,
      current: 0,
      qIdx: 0,
      round: 1,
      step: 'play',
      choice: null,
      guesses: {},
      createdAt: new Date().toISOString()
    });
    setGame('turn');
  };
  const turnBtn = React.createElement(Button, {
    className: 'bg-pink-500 text-white',
    disabled: players.length === 0,
    onClick: startGame
  }, 'Start quiz');
  const buttons = React.createElement('div', { className:'flex gap-2 mt-2 self-center' }, turnBtn);
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 overflow-y-auto' },
    React.createElement(SectionTitle,{ title:'Realetten', action }),
    React.createElement('p', { className:'text-gray-600 text-center mb-4' }, 'M\u00f8d op til 4 andre p\u00e5 videokald'),
    React.createElement('p', { className:'text-gray-600 text-center mb-4' }, 'Hvis der ikke er nogen nu, s\u00e5 kom tilbage kl. 20 i aften. Der plejer Realetten at v\u00e6re popul\u00e6r.'),
    React.createElement(RealettenCallScreen,{ interest, userId, onEnd:onBack, onParticipantsChange:setPlayers }),
    !game && buttons,
    game === 'turn' && React.createElement(TurnGame,{ sessionId: sanitizeInterest(interest), players: playerNames, myName, onExit:()=>setGame(null) })
  );
}
