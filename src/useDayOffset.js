import { useState, useEffect } from 'react';

export default function useDayOffset(){
  const read = () => parseInt(localStorage.getItem('dayOffset') || '0', 10);
  const [offset, setOffset] = useState(read());
  useEffect(() => {
    const handler = e => {
      if (e.key && e.key !== 'dayOffset') return;
      setOffset(read());
    };
    window.addEventListener('storage', handler);
    window.addEventListener('dayOffsetChange', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('dayOffsetChange', handler);
    };
  }, []);
  return offset;
}
