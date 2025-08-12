import React from 'react';
import { getNextTask } from '../tasks.js';
import { useT } from '../i18n.js';

export default function TaskButton({ profile, onClick }) {
  const t = useT();
  const task = getNextTask(profile || {});
  if (!task) return null;
  return React.createElement('button', {
    className: 'w-full bg-green-500 text-white font-bold p-2 mb-4',
    onClick
  }, t(task.labelKey));
}
