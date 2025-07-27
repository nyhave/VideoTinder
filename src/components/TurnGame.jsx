import React, { useState, useEffect } from 'react';
import WinnerOverlay from './WinnerOverlay.jsx';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import { db, doc, setDoc, onSnapshot } from '../firebase.js';

const questions = [
  {
    text: 'Hvad foretrækker du på en første date?',
    options: ['En gåtur i byen', 'En hyggelig cafe', 'En aktiv oplevelse']
  },
  {
    text: 'Hvor mødes du helst nye mennesker?',
    options: ['Til en fest', 'Online', 'Til sport eller hobby']
  },
  {
    text: 'Hvordan bruger du helst din søndag?',
    options: ['Med en god film', 'Ude i naturen', 'Til nye oplevelser']
  },
  {
    text: 'Hvad vægter du højest i et forhold?',
    options: ['Tryghed', 'Eventyr', 'Fælles interesser']
  },
  {
    text: 'Hvad giver den bedste samtale?',
    options: ['En kop kaffe', 'En lang gåtur', 'Et sjovt spil']
  }
];

export default function TurnGame({ sessionId, players: propPlayers = [], myName, onExit }) {
  const [nameInput, setNameInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [game, setGame] = useState(null);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const ref = doc(db, 'turnGames', sessionId);
    const unsub = onSnapshot(ref, snap => {
      setGame(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [sessionId]);

  const players = game?.players || propPlayers;
  const scores = game?.scores ||
    (propPlayers.length > 1 ? Object.fromEntries(propPlayers.map(p => [p, 0])) : {});
  const current = game?.current || 0;
  const qIdx = game?.qIdx || 0;
  const round = game?.round || 1;
  const maxRounds = 5;
  const choice = game?.choice ?? null;
  const guesses = game?.guesses || {};
  const step = game?.step || (players.length > 1 ? 'play' : 'setup');

  useEffect(() => {
    if (step === 'done') setShowWinner(true);
  }, [step]);

  const updateGame = data => {
    if (!sessionId) return;
    setDoc(doc(db, 'turnGames', sessionId), data, { merge: true }).catch(console.error);
  };

  useEffect(() => {
    if (!sessionId || !propPlayers.length) return;
    // If the game document is empty, initialize it with all players
    if (!players.length) {
      const init = Object.fromEntries(propPlayers.map(p => [p, 0]));
      updateGame({ players: propPlayers, scores: init, step: propPlayers.length > 1 ? 'play' : 'setup', round: 1 });
      return;
    }
    // Add any missing players that joined after the game started
    const missing = propPlayers.filter(p => !players.includes(p));
    if (missing.length) {
      const updatedScores = { ...scores };
      missing.forEach(p => { updatedScores[p] = 0; });
      updateGame({ players: [...players, ...missing], scores: updatedScores });
    }
  }, [sessionId, propPlayers.toString(), players.toString(), scores]);

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (trimmed && !players.includes(trimmed)) {
      updateGame({ players: [...players, trimmed], scores: { ...scores, [trimmed]: 0 } });
      setNameInput('');
    }
  };

  const startGame = () => {
    if (players.length > 1) {
      const init = Object.fromEntries(players.map(p => [p, 0]));
      updateGame({ scores: init, step: 'play', current: 0, qIdx: 0, round: 1, choice: null, guesses: {} });
    }
  };

  const selectOption = idx => {
    updateGame({ choice: idx, step: 'guess', guesses: {} });
  };

  const guess = (player, idx) => {
    updateGame({ guesses: { ...guesses, [player]: idx } });
  };

  useEffect(() => {
    if (step === 'guess') {
      const others = players.filter((_, i) => i !== current);
      if (others.length > 0 && others.every(p => guesses[p] !== undefined)) {
        reveal();
      }
    }
  }, [guesses, step]);

  useEffect(() => {
    if (step === 'guess') {
      setTimeLeft(10);
      const id = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(id);
            reveal();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [step]);

  const reveal = () => {
    const n = { ...scores };
    players.forEach((p, i) => {
      if (i !== current && guesses[p] === choice) {
        n[p] = (n[p] || 0) + 1;
      }
    });
    updateGame({ scores: n, step: 'reveal' });
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      updateGame({ step: 'done' });
      return;
    }
    updateGame({
      round: round + 1,
      guesses: {},
      choice: null,
      current: (current + 1) % players.length,
      qIdx: (qIdx + 1) % questions.length,
      step: 'play'
    });
  };

  const q = questions[qIdx];
  const closeBtn = onExit ?
    React.createElement(Button, { className:'bg-gray-500 text-white', onClick:onExit }, 'Luk') : null;

  if (step === 'setup') {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: 'Gæt mit valg', action: closeBtn }),
      React.createElement('div', { className: 'flex mb-2' },
        React.createElement('input', {
          className: 'border flex-1 mr-2 p-1',
          value: nameInput,
          onChange: e => setNameInput(e.target.value),
          placeholder: 'Navn'
        }),
        React.createElement(Button, { className: 'bg-pink-500 text-white px-4', onClick: addPlayer }, 'Tilføj')
      ),
      React.createElement('ul', { className: 'mb-4 list-disc list-inside' },
        players.map(p => React.createElement('li', { key: p }, p))
      ),
      React.createElement(Button, { className: 'bg-blue-500 text-white w-full', disabled: players.length < 2, onClick: startGame }, 'Start spil')
    );
  }

  if (step === 'play') {
    if (myName && players[current] !== myName) {
      return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
        React.createElement(SectionTitle, { title: `${players[current]}: ${q.text}`, action: closeBtn }),
        React.createElement('p', { className:'mt-4 text-center' }, `Venter på ${players[current]}...`)
      );
    }
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: `${players[current]}: ${q.text}`, action: closeBtn }),
      React.createElement('div', { className: 'space-y-2 mt-4' },
        q.options.map((o, i) =>
          React.createElement(Button, { key: i, className: 'bg-pink-500 text-white w-full', onClick: () => selectOption(i) }, o)
        )
      )
    );
  }

  if (step === 'guess') {
    if (myName && players[current] === myName) {
      return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
        React.createElement(SectionTitle, { title: `Gæt ${players[current]}'s valg (${timeLeft})`, action: closeBtn }),
        React.createElement('p', { className: 'mt-4 text-center' }, 'Venter på de andre...')
      );
    }

    const guessPlayer = myName && players.includes(myName) ? myName : null;
    const targets = guessPlayer ? [guessPlayer] : players.filter((_, i) => i !== current);

    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: `Gæt ${players[current]}'s valg (${timeLeft})`, action: closeBtn }),
      targets.map(p =>
        React.createElement('div', { key: p, className: 'mb-4' },
          !guessPlayer && React.createElement('p', { className: 'font-medium mb-1' }, p),
          React.createElement('div', { className: 'space-y-1' },
            q.options.map((o, i) =>
              React.createElement(Button, {
                key: i,
                className: `${guesses[p] === i ? 'bg-blue-700' : 'bg-blue-500'} text-white w-full`,
                onClick: () => guess(p, i),
                disabled: guesses[p] !== undefined
              }, o)
            )
          )
        )
      )
    );
  }

  if (step === 'reveal') {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: 'Resultat', action: closeBtn }),
      React.createElement('p', { className: 'mb-2' }, `Rigtigt svar: ${q.options[choice]}`),
      React.createElement('ul', { className: 'mb-4 list-disc list-inside' },
        players.map((p, i) => {
          if (i === current) return null;
          const correct = guesses[p] === choice;
          return React.createElement('li', { key: p, className: correct ? 'text-green-600' : 'text-gray-600' },
            `${p}: ${correct ? '✔' : '✘'}`
          );
        })
      ),
      React.createElement('h3', { className: 'font-semibold mb-1' }, 'Stilling'),
      React.createElement('ul', { className: 'mb-4 list-disc list-inside' },
        players.map(p =>
          React.createElement('li', { key: p }, `${p}: ${scores[p] || 0}`)
        )
      ),
      React.createElement('p', { className: 'mb-2' }, `Runde ${round} / ${maxRounds}`),
      React.createElement(Button, {
        className: 'bg-pink-500 text-white w-full',
        onClick: nextRound
      }, round >= maxRounds ? 'Afslut spil' : 'Næste runde')
    );
  }

  if (step === 'done') {
    const maxScore = Math.max(...players.map(p => scores[p] || 0));
    const winners = players.filter(p => (scores[p] || 0) === maxScore);
    const overlay = showWinner ? React.createElement(WinnerOverlay, { winners, onClose: () => setShowWinner(false) }) : null;
    return React.createElement(React.Fragment, null,
      React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
        React.createElement(SectionTitle, { title: 'Resultat', action: closeBtn }),
        React.createElement('h3', { className: 'font-semibold mb-1' }, 'Slutstilling'),
        React.createElement('ul', { className: 'mb-4 list-disc list-inside' },
          players.map(p =>
            React.createElement('li', { key: p }, `${p}: ${scores[p] || 0}`)
          )
        ),
        closeBtn || !onExit ? null : React.createElement(Button, {
          className: 'bg-pink-500 text-white w-full',
          onClick: onExit
        }, 'Luk')
      ),
      overlay
    );
  }

  return null;
}
