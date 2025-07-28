import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import RealettenCallScreen from './RealettenCallScreen.jsx';
import TurnGame from './TurnGame.jsx';
import { useCollection, db, doc, setDoc, onSnapshot, updateDoc, getDoc, deleteDoc, arrayUnion, arrayRemove } from '../firebase.js';
import { deleteField } from 'firebase/firestore';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

const BOT_ID = 'AI';
const BOT_NAME = 'AI';

export default function RealettenPage({ interest, userId, onBack }) {
  const [players, setPlayers] = useState([]);
  const [botActive, setBotActive] = useState(true);
  const profiles = useCollection('profiles');
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const [showGame, setShowGame] = useState(false);
  useEffect(() => {
    if (!interest) return;
    const gameId = sanitizeInterest(interest);
    const ref = doc(db, 'turnGames', gameId);
    const unsub = onSnapshot(ref, snap => {
      setShowGame(snap.exists());
    });
    return () => unsub();
  }, [interest]);

  useEffect(() => {
    if (!interest || !botActive) return;
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'realetten', id);
    const join = async () => {
      try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            interest,
            participants: [BOT_ID],
            heartbeat: { [BOT_ID]: new Date().toISOString() }
          });
        } else {
          await updateDoc(ref, {
            participants: arrayUnion(BOT_ID),
            [`heartbeat.${BOT_ID}`]: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to add bot', err);
      }
    };
    join();
    return () => {
      (async () => {
        try {
          await updateDoc(ref, {
            participants: arrayRemove(BOT_ID),
            [`heartbeat.${BOT_ID}`]: deleteField()
          });
          const snap = await getDoc(ref);
          const data = snap.data() || {};
          if (!snap.exists() || !(data.participants || []).length) {
            await deleteDoc(ref);
            await deleteDoc(doc(db, 'turnGames', id)).catch(() => {});
          }
        } catch {}
      })();
    };
  }, [interest, botActive]);

  useEffect(() => {
    if (!interest || !botActive) return;
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'realetten', id);
    const send = () => {
      updateDoc(ref, { [`heartbeat.${BOT_ID}`]: new Date().toISOString() }).catch(() => {});
    };
    send();
    const t = setInterval(send, 10000);
    return () => clearInterval(t);
  }, [interest, botActive]);
  const playerNames = players.map(id => id === BOT_ID ? BOT_NAME : (profileMap[id]?.name || id));
  const myName = profileMap[userId]?.name || userId;
  const kickBot = async () => {
    setBotActive(false);
    const id = sanitizeInterest(interest);
    try {
      await updateDoc(doc(db, 'realetten', id), {
        participants: arrayRemove(BOT_ID),
        [`heartbeat.${BOT_ID}`]: deleteField()
      });
    } catch {}
    try {
      const gref = doc(db, 'turnGames', id);
      const snap = await getDoc(gref);
      if (snap.exists()) {
        const data = snap.data() || {};
        const newPlayers = (data.players || []).filter(p => p !== BOT_NAME);
        const newScores = { ...(data.scores || {}) };
        delete newScores[BOT_NAME];
        await updateDoc(gref, { players: newPlayers, scores: newScores });
      }
    } catch {}
  };

  const kickBtn = botActive ?
    React.createElement(Button, { className:'bg-yellow-600 text-white', onClick:kickBot }, 'Fjern AI') : null;

  const action = React.createElement('div',{className:'flex gap-2'},
    React.createElement(Button,{ className:'flex items-center gap-1', onClick:onBack },
      React.createElement(ArrowLeft,{ className:'w-4 h-4' }), 'Tilbage'),
    kickBtn
  );
  const startGame = async () => {
    setBotActive(true);
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
    setShowGame(true);
  };
  const startButton = React.createElement(Button, {
    className: 'bg-pink-500 text-white mt-2 self-center',
    disabled: players.length === 0,
    onClick: startGame
  }, 'Start spil');
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 overflow-y-auto' },
    React.createElement(SectionTitle,{ title:'Realetten', action }),
    React.createElement(RealettenCallScreen,{ interest, userId, botId:BOT_ID, onEnd:onBack, onParticipantsChange:setPlayers }),
    !showGame && startButton,
    showGame && React.createElement(TurnGame,{ sessionId: sanitizeInterest(interest), players: playerNames, myName, botName:BOT_NAME, onExit:()=>setShowGame(false) })
  );
}
