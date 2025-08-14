import React from 'react';
import { getNextTask } from '../tasks.js';
import { useT } from '../i18n.js';

export default function TaskButton({ profile, cachedPhotoURL, onClick }) {
  const t = useT();
  if (!profile?.id) return null;
  const prof = { ...profile };
  if (!prof.photoURL && cachedPhotoURL) prof.photoURL = cachedPhotoURL;
  const task = getNextTask(prof);
  if (!task) return null;
  return React.createElement('button', {
    className: 'w-full bg-green-500 text-white font-bold p-2 mb-4',
    onClick
  }, t(task.labelKey));
}
