import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import SectionTitle from './SectionTitle.jsx';
import VideoCallScreen from './VideoCallScreen.jsx';

export default function VideoCallPage({ matchId, userId, onBack }) {
  return React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90 flex flex-col h-full flex-1 overflow-y-auto' },
    React.createElement(SectionTitle, {
      title: 'Videoopkald',
      action: React.createElement(Button, { className: 'flex items-center gap-1', onClick: onBack },
        React.createElement(ArrowLeft, { className: 'w-4 h-4' }), 'Tilbage')
    }),
    React.createElement(VideoCallScreen, { matchId, userId, onEnd: onBack })
  );
}
