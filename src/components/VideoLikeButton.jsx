import React from 'react';
import { useDoc, db, doc, setDoc, deleteDoc } from '../firebase.js';
import { Button } from './ui/button.js';
import { ThumbsUp, Heart } from 'lucide-react';

export default function VideoLikeButton({ userId, videoId }) {
  const reactionId = `${userId}-${videoId}`;
  const reaction = useDoc('videoReactions', reactionId);

  const setReaction = async (type, e) => {
    e.stopPropagation();
    const ref = doc(db, 'videoReactions', reactionId);
    if (reaction?.type === type) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { id: reactionId, userId, videoId, type });
    }
  };

  return React.createElement('div', { className: 'flex gap-2 mt-2 w-full' },
    React.createElement(Button, {
      className: `flex-1 ${reaction?.type === 'thumb' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`,
      onClick: e => setReaction('thumb', e),
      'aria-label': 'Thumb reaction'
    }, React.createElement(ThumbsUp, { className: 'w-4 h-4' })),
    React.createElement(Button, {
      className: `flex-1 ${reaction?.type === 'heart' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-black'}`,
      onClick: e => setReaction('heart', e),
      'aria-label': 'Heart reaction'
    }, React.createElement(Heart, { className: 'w-4 h-4' }))
  );
}
