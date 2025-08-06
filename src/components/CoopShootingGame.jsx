import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, doc, setDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove, increment } from '../firebase.js';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function CoopShootingGame({ interest, userId, onBack }){
  const [game, setGame] = useState(null);
  const canvasRef = useRef(null);
  const WIDTH = 300;
  const HEIGHT = 200;
  const TARGET_RADIUS = 15;
  useEffect(() => {
    if(!interest) return;
    const id = sanitizeInterest(interest);
    const ref = doc(db, 'coopShooter', id);
    const unsub = onSnapshot(ref, snap => {
      setGame(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [interest]);

  if(!interest){
    return null;
  }

  const id = sanitizeInterest(interest);
  const ref = doc(db, 'coopShooter', id);
  const startGame = async () => {
    await setDoc(ref, {
      interest,
      score: 0,
      target: 20,
      players: [userId],
      targetX: Math.floor(Math.random() * WIDTH),
      targetY: Math.floor(Math.random() * HEIGHT)
    });
  };
  const joinGame = async () => {
    await updateDoc(ref, { players: arrayUnion(userId) });
  };
  const leaveGame = async () => {
    await updateDoc(ref, { players: arrayRemove(userId) });
  };
  const endGame = async () => {
    await deleteDoc(ref).catch(() => {});
  };
  const shoot = async e => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = Math.hypot(x - game.targetX, y - game.targetY) <= TARGET_RADIUS;
    if (hit) {
      await updateDoc(ref, {
        score: increment(1),
        targetX: Math.floor(Math.random() * WIDTH),
        targetY: Math.floor(Math.random() * HEIGHT)
      });
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !game) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (game.score >= game.target) return;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(game.targetX, game.targetY, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, [game]);

  if(!game){
    return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col items-center' },
      React.createElement(SectionTitle, { title:'Co-op Shooter', action: React.createElement(Button, { className:'bg-gray-500 text-white', onClick:onBack }, 'Tilbage') }),
      React.createElement(Button, { className:'bg-green-600 text-white mt-4', onClick:startGame }, 'Start spil')
    );
  }

  const players = game.players || [];
  const inGame = players.includes(userId);
  const canJoin = !inGame && players.length < 4;
  const finished = game.score >= game.target;

  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90 flex flex-col items-center' },
    React.createElement(SectionTitle, { title:'Co-op Shooter', action: React.createElement(Button, { className:'bg-gray-500 text-white', onClick:onBack }, 'Tilbage') }),
    React.createElement('p', { className:'mb-2' }, `Score: ${game.score} / ${game.target}`),
    React.createElement('p', { className:'mb-2' }, `Spillere: ${players.length}/4`),
    React.createElement('p', { className:'mb-4' }, 'Klik på den røde cirkel for at skyde'),
    React.createElement('canvas', {
      ref: canvasRef,
      width: WIDTH,
      height: HEIGHT,
      onClick: inGame && !finished ? shoot : undefined,
      className: 'border mb-4 bg-white'
    }),
    canJoin && React.createElement(Button, { className:'bg-blue-600 text-white mb-2', onClick:joinGame }, 'Join'),
    inGame && React.createElement(Button, { className:'bg-gray-700 text-white mb-2', onClick:leaveGame }, 'Leave'),
    finished && React.createElement('p', { className:'mb-2 font-semibold text-green-700' }, 'Mission complete!'),
    React.createElement(Button, { className:'bg-yellow-600 text-white mt-2', onClick:endGame }, 'End Game')
  );
}

