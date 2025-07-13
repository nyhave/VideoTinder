// Filtering helper kept separate so it can also run in a Firebase
// Cloud Function. Cloud Functions support both JavaScript and TypeScript.
import { getAge } from './utils.js';

// Calculate a detailed match score for a single profile. Missing data is handled
// gracefully so the function can run both on the client and as a Cloud Function.
export function calculateMatchScore(user, profile, ageRange) {
  let score = 0;

  const userAge = user.birthday ? getAge(user.birthday) : user.age;
  const profAge = profile.birthday ? getAge(profile.birthday) : profile.age;

  // 1. Age compatibility (max 20)
  if (profAge >= ageRange[0] && profAge <= ageRange[1]) {
    const mid = (ageRange[0] + ageRange[1]) / 2;
    const maxDiff = Math.max(mid - ageRange[0], ageRange[1] - mid) || 1;
    const diff = Math.abs(profAge - mid);
    score += 20 * Math.max(0, 1 - diff / maxDiff);
  }

  // 2. Gender preference match (max 20)
  if (user.interest === profile.gender && profile.interest === user.gender) {
    score += 20;
  } else if (user.interest === profile.gender || profile.interest === user.gender) {
    score += 10; // partial match
  }

  // 3. Distance (max 20)
  const userMax = (user.distanceRange || [0, 50])[1];
  // Without real geo data, treat same city as distance 0 and others as 100km
  const distance = user.city && profile.city && user.city === profile.city ? 0 : 100;
  if (distance <= userMax) {
    score += 20;
  } else if (distance <= userMax + 50) {
    score += 20 * (1 - (distance - userMax) / 50);
  }

  // 4. Shared interests (max 15)
  const userInt = user.interests || [];
  const profInt = profile.interests || [];
  const shared = userInt.filter(i => profInt.includes(i)).length;
  score += Math.min(shared, 5) / 5 * 15;

  // 5. Activity level (max 10)
  if (profile.lastActive) {
    const hours = (Date.now() - new Date(profile.lastActive)) / 36e5;
    if (hours <= 24) score += 10;
    else if (hours <= 72) score += 7;
    else if (hours <= 168) score += 4;
  }

  // 6. Profile completeness (max 5)
  const completeness = [profile.clip, profile.photoURL, profile.interest].filter(Boolean).length;
  score += completeness / 3 * 5;

  // 7. Response rate (max 5)
  if (typeof profile.responseRate === 'number') {
    score += Math.min(1, profile.responseRate) * 5;
  }

  // 8. Popularity balance (max 5)
  const popularity = (profile.viewCount || 0) + (profile.likeCount || 0);
  if (popularity < 5) score += 5;
  else if (popularity < 20) score += 3;
  else if (popularity < 50) score += 1;

  return Math.min(100, score);
}

export function scoreProfiles(user, profiles, ageRange) {
  const interest = user.interest;
  const preferred = user.preferredLanguages || [];
  const allowOther = user.allowOtherLanguages !== false;

  return profiles
    .filter(p => {
      const matchesLang = preferred.length === 0 || preferred.includes(p.language || 'en');
      return (
        p.id !== user.id &&
        p.gender === interest &&
        (p.birthday ? getAge(p.birthday) : p.age) >= ageRange[0] &&
        (p.birthday ? getAge(p.birthday) : p.age) <= ageRange[1] &&
        (allowOther || matchesLang)
      );
    })
    .map(p => ({ ...p, score: calculateMatchScore(user, p, ageRange) }))
    .sort((a, b) => b.score - a.score);
}

export default function selectProfiles(user, profiles, ageRange) {
  const hasSubscription =
    user.subscriptionExpires && new Date(user.subscriptionExpires) > new Date();
  const today = new Date().toISOString().split('T')[0];
  const extra = user.extraClipsDate === today ? 3 : 0;
  const limit = (hasSubscription ? 6 : 3) + extra;
  return scoreProfiles(user, profiles, ageRange).slice(0, limit);
}
