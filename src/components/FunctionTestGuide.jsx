import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { modules } from '../functionTestModules.js';

export default function FunctionTestGuide() {
  const [visible, setVisible] = useState(false);
  const [moduleIndex, setModuleIndex] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const startX = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem('functionTestGuide');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setModuleIndex(data.module);
        setStepIndex(data.step || 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (moduleIndex === null) {
      localStorage.removeItem('functionTestGuide');
      return;
    }
    localStorage.setItem('functionTestGuide', JSON.stringify({ module: moduleIndex, step: stepIndex }));
  }, [moduleIndex, stepIndex]);

  if (moduleIndex === null) return null;
  const mod = modules[moduleIndex];
  if (!mod) return null;
  const feature = mod.features[stepIndex];

  const next = () => {
    if (stepIndex + 1 < mod.features.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setModuleIndex(null);
    }
  };

  const onTouchStart = e => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx > 40) setVisible(false);
  };

  return (
    React.createElement(React.Fragment, null,
      !visible && React.createElement('div', {
        className:'fixed top-1/2 right-0 -translate-y-1/2 bg-pink-600 text-white px-2 py-1 rounded-l cursor-pointer z-40',
        onClick: () => setVisible(true)
      }, '▶'),
      visible && React.createElement('div', {
        className:'fixed inset-0 z-40 bg-black/50 flex items-center justify-center',
        onTouchStart,
        onTouchEnd
      },
        React.createElement(Card, { className:'bg-white p-4 rounded shadow-xl max-w-xs w-full' },
          React.createElement('h3', { className:'font-bold mb-2 text-pink-600 text-center' }, mod.name),
          React.createElement('div', { className:'font-medium mb-1' }, feature.title),
          React.createElement('ul', { className:'list-disc ml-5 text-sm mb-2' },
            feature.expected.map((ex, i) => React.createElement('li', { key:i }, ex))
          ),
          React.createElement(Button, { className:'bg-blue-500 text-white w-full', onClick: next }, stepIndex + 1 < mod.features.length ? 'Next' : 'Finish')
        )
      )
    )
  );
}
