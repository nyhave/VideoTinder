export const tasks = [
  {
    key: 'photo',
    label: 'Add profile picture',
    check: p => !!p.photoURL
  },
  {
    key: 'video1',
    label: 'Add video clip',
    check: p => (p.videoClips || []).length >= 1
  },
  {
    key: 'about',
    label: 'Add clip about me',
    check: p => !!(p.clip && p.clip.trim())
  },
  {
    key: 'audio',
    label: 'Add sound clip',
    check: p => (p.audioClips || []).length >= 1
  },
  {
    key: 'video2',
    label: 'Add second video clip',
    check: p => (p.videoClips || []).length >= 2
  }
];

export const getNextTask = profile => tasks.find(t => !t.check(profile));
