export function triggerHaptic(pattern = [50]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch (err) {
    // ignore errors, some browsers may not allow vibration
  }
}
