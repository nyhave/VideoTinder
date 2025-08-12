export const tasks = [
  {
    key: 'photo',
    labelKey: 'taskAddProfilePicture',
    check: p => !!p.photoURL
  },
  {
    key: 'video1',
    labelKey: 'taskAddVideoClip',
    check: p => (p.videoClips || []).length >= 1
  },
  {
    key: 'about',
    labelKey: 'taskAddClipAboutMe',
    check: p => !!(p.clip && p.clip.trim())
  },
  {
    key: 'video2',
    labelKey: 'taskAddSecondVideoClip',
    check: p => (p.videoClips || []).length >= 2
  }
];

export const getNextTask = profile => tasks.find(t => !t.check(profile));
