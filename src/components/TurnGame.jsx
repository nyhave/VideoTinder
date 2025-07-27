import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';

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

export default function TurnGame() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [scores, setScores] = useState({});
  const [current, setCurrent] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [guesses, setGuesses] = useState({});
  const [step, setStep] = useState('setup');
  const [timeLeft, setTimeLeft] = useState(10);

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (trimmed && !players.includes(trimmed)) {
      setPlayers(p => [...p, trimmed]);
      setNameInput('');
    }
  };

  const startGame = () => {
    if (players.length > 1) {
      const init = Object.fromEntries(players.map(p => [p, 0]));
      setScores(init);
      setStep('play');
    }
  };

  const selectOption = idx => {
    setChoice(idx);
    setStep('guess');
  };

  const guess = (player, idx) => {
    setGuesses(g => ({ ...g, [player]: idx }));
  };

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
    setStep('reveal');
    setScores(s => {
      const n = { ...s };
      players.forEach((p, i) => {
        if (i !== current && guesses[p] === choice) {
          n[p] = (n[p] || 0) + 1;
        }
      });
      return n;
    });
  };

  const nextRound = () => {
    setGuesses({});
    setChoice(null);
    setCurrent((current + 1) % players.length);
    setQIdx((qIdx + 1) % questions.length);
    setStep('play');
  };

  const q = questions[qIdx];

  if (step === 'setup') {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: 'Gæt mit valg' }),
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
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: `${players[current]}: ${q.text}` }),
      React.createElement('div', { className: 'space-y-2 mt-4' },
        q.options.map((o, i) =>
          React.createElement(Button, { key: i, className: 'bg-pink-500 text-white w-full', onClick: () => selectOption(i) }, o)
        )
      )
    );
  }

  if (step === 'guess') {
    return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title: `Gæt ${players[current]}'s valg (${timeLeft})` }),
      players.filter((_, i) => i !== current).map(p =>
        React.createElement('div', { key: p, className: 'mb-4' },
          React.createElement('p', { className: 'font-medium mb-1' }, p),
          React.createElement('div', { className: 'space-y-1' },
            q.options.map((o, i) =>
              React.createElement(Button, {
                key: i,
                className: 'bg-blue-500 text-white w-full',
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
      React.createElement(SectionTitle, { title: 'Resultat' }),
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
      React.createElement(Button, { className: 'bg-pink-500 text-white w-full', onClick: nextRound }, 'Næste runde')
    );
  }

  return null;
}
