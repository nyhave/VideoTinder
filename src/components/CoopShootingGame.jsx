import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from '../firebase.js';

function sanitizeInterest(i){
  return encodeURIComponent(i || '').replace(/%20/g,'_');
}

export default function CoopShootingGame({ interest, userId, onBack }) {
  const [game, setGame] = useState(null);
  const canvasRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysRef = useRef({});
  const WIDTH = 300;
  const HEIGHT = 200;
  const TARGET_RADIUS = 15;

  useEffect(() => {
    if (!interest) return;
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
      playerPositions: {
        [userId]: { x: WIDTH / 2, y: HEIGHT - 20 }
      },
      targetX: Math.floor(Math.random() * WIDTH),
      targetY: Math.floor(Math.random() * HEIGHT)
    });
  };

  const joinGame = async () => {
    await updateDoc(ref, {
      players: arrayUnion(userId),
      [`playerPositions.${userId}`]: { x: WIDTH / 2, y: HEIGHT - 20 }
    });
  };

  const leaveGame = async () => {
    await updateDoc(ref, {
      players: arrayRemove(userId),
      [`playerPositions.${userId}`]: null
    });
  };
  const endGame = async () => {
    await deleteDoc(ref).catch(() => {});
  };
  useEffect(() => {
    if (!canvasRef.current || !game) return;
    const ctx = canvasRef.current.getContext('2d');
    let anim;

    const render = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      if (game.score < game.target) {
        // Draw enemy/target
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(game.targetX, game.targetY, TARGET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw players
      const playerPositions = game.playerPositions || {};
      const colors = ['#2563eb', '#16a34a', '#f97316', '#9333ea'];
      (game.players || []).forEach((p, i) => {
        const pos = playerPositions[p];
        if (!pos) return;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw and update bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.y += b.dy;
        ctx.fillStyle = '#000000';
        ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
        const hit =
          Math.hypot(b.x - game.targetX, b.y - game.targetY) <= TARGET_RADIUS;
        if (hit) {
          updateDoc(ref, {
            score: increment(1),
            targetX: Math.floor(Math.random() * WIDTH),
            targetY: Math.floor(Math.random() * HEIGHT)
          });
          return false;
        }
        return b.y > 0;
      });

      anim = requestAnimationFrame(render);
    };

    anim = requestAnimationFrame(render);
    return () => cancelAnimationFrame(anim);
  }, [game, ref]);

  // Handle movement and shooting for local player
  useEffect(() => {
    const down = e => {
      keysRef.current[e.key] = true;
    };
    const up = e => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (!game) return;
    const playerPositions = game.playerPositions || {};
    let anim;
    const step = () => {
      if (!canvasRef.current) return;
      const pos = playerPositions[userId] || { x: WIDTH / 2, y: HEIGHT - 20 };
      let { x, y } = pos;
      if (keysRef.current.ArrowLeft) x -= 2;
      if (keysRef.current.ArrowRight) x += 2;
      if (keysRef.current.ArrowUp) y -= 2;
      if (keysRef.current.ArrowDown) y += 2;
      x = Math.max(10, Math.min(WIDTH - 10, x));
      y = Math.max(10, Math.min(HEIGHT - 10, y));

      if (x !== pos.x || y !== pos.y) {
        updateDoc(ref, { [`playerPositions.${userId}`]: { x, y } });
      }

      if (keysRef.current[' ']) {
        bulletsRef.current.push({ x, y: y - 10, dy: -4 });
        keysRef.current[' '] = false;
      }

      anim = requestAnimationFrame(step);
    };

    anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, [game, ref, userId]);

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
    React.createElement('p', { className:'mb-4' }, 'Brug piletasterne og mellemrum for at skyde'),
    React.createElement('canvas', {
      ref: canvasRef,
      width: WIDTH,
      height: HEIGHT,
      className: 'border mb-4 bg-white'
    }),
    canJoin && React.createElement(Button, { className:'bg-blue-600 text-white mb-2', onClick:joinGame }, 'Join'),
    inGame && React.createElement(Button, { className:'bg-gray-700 text-white mb-2', onClick:leaveGame }, 'Leave'),
    finished && React.createElement('p', { className:'mb-2 font-semibold text-green-700' }, 'Mission complete!'),
    React.createElement(Button, { className:'bg-yellow-600 text-white mt-2', onClick:endGame }, 'End Game')
  );
}

