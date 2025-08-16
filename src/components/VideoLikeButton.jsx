import React from 'react';
import { useDoc, db, doc, setDoc, deleteDoc } from '../firebase.js';
import { Button } from './ui/button.js';

export default function VideoLikeButton({ userId, videoId }) {
  const likeId = `${userId}-${videoId}`;
  const like = useDoc('videoLikes', likeId);
  const liked = !!like;

  const toggleLike = async e => {
    e.stopPropagation();
    const ref = doc(db, 'videoLikes', likeId);
    if (liked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { id: likeId, userId, videoId });
    }
  };

  return React.createElement(Button, {
    className: `mt-2 w-full ${liked ? 'bg-pink-500 text-white' : 'bg-gray-200 text-black'}`,
    onClick: toggleLike
  }, liked ? 'Unlike' : 'Like');
}
