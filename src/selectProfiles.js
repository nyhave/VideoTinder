// Filtering helper kept separate so it can also run in a Netlify
// Function. Netlify Functions support both JavaScript and TypeScript.
import { getAge, getTodayStr, getDailyProfileLimit } from './utils.js';
import { getInterestCategory } from './interests.js';

// Calculate a detailed match score for a single profile. Missing data is handled
// gracefully so the function can run both on the client and as a Netlify Function.
export function calculateMatchScoreDetailed(user, profile, ageRange) {
  const breakdown = {};
  let score = 0;

  const userAge = user.birthday ? getAge(user.birthday) : user.age;
  const profAge = profile.birthday ? getAge(profile.birthday) : profile.age;

  // 1. Age compatibility (max 20)
  if (profAge >= ageRange[0] && profAge <= ageRange[1]) {
    const mid = (ageRange[0] + ageRange[1]) / 2;
    const maxDiff = Math.max(mid - ageRange[0], ageRange[1] - mid) || 1;
    const diff = Math.abs(profAge - mid);
    const s = 20 * Math.max(0, 1 - diff / maxDiff);
    breakdown.age = s;
    score += s;
  } else {
    breakdown.age = 0;
  }

  // 2. Gender preference match (max 20)
  if (user.interest === profile.gender && profile.interest === user.gender) {
    breakdown.gender = 20;
    score += 20;
  } else if (user.interest === profile.gender || profile.interest === user.gender) {
    breakdown.gender = 10; // partial match
    score += 10;
  } else {
    breakdown.gender = 0;
  }

  // 3. Distance (max 20)
  const userMax = (user.distanceRange || [0, 50])[1];
  // Without real geo data, treat same city as distance 0 and others as 100km
  const distance = user.city && profile.city && user.city === profile.city ? 0 : 100;
  if (distance <= userMax) {
    breakdown.distance = 20;
    score += 20;
  } else if (distance <= userMax + 50) {
    const s = 20 * (1 - (distance - userMax) / 50);
    breakdown.distance = s;
    score += s;
  } else {
    breakdown.distance = 0;
  }

  // 4. Shared interests (max 15)
  const userInt = user.interests || [];
  const profInt = profile.interests || [];
  const sharedExact = userInt.filter(i => profInt.includes(i));
  const exactCount = sharedExact.length;
  const categoriesOfExact = new Set(sharedExact.map(getInterestCategory));
  const userCats = new Set(userInt.map(getInterestCategory));
  const profCats = new Set(profInt.map(getInterestCategory));
  const sharedCats = [...userCats].filter(c => profCats.has(c));
  const catCount = sharedCats.filter(c => !categoriesOfExact.has(c)).length;
  const interestScore = Math.min(15, exactCount * 3 + catCount * 1.5);
  breakdown.interests = interestScore;
  score += interestScore;

  // 5. Activity level (max 10)
  if (profile.lastActive) {
    const hours = (Date.now() - new Date(profile.lastActive)) / 36e5;
    if (hours <= 24) breakdown.activity = 10;
    else if (hours <= 72) breakdown.activity = 7;
    else if (hours <= 168) breakdown.activity = 4;
    else breakdown.activity = 0;
    score += breakdown.activity;
  } else {
    breakdown.activity = 0;
  }

  // 6. Profile completeness (max 5)
  const completeness = [profile.clip, profile.photoURL, profile.interest].filter(Boolean).length;
  breakdown.completeness = completeness / 3 * 5;
  score += breakdown.completeness;

  // 7. Response rate (max 5)
  if (typeof profile.responseRate === 'number') {
    breakdown.response = Math.min(1, profile.responseRate) * 5;
    score += breakdown.response;
  } else {
    breakdown.response = 0;
  }

  // 8. Popularity balance (max 5)
  const popularity = (profile.viewCount || 0) + (profile.likeCount || 0);
  if (popularity < 5) breakdown.popularity = 5;
  else if (popularity < 20) breakdown.popularity = 3;
  else if (popularity < 50) breakdown.popularity = 1;
  else breakdown.popularity = 0;
  score += breakdown.popularity;

  const total = Math.min(100, score);
  return { score: total, breakdown };
}

export function calculateMatchScore(user, profile, ageRange) {
  return calculateMatchScoreDetailed(user, profile, ageRange).score;
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
    .map(p => {
      const { score, breakdown } = calculateMatchScoreDetailed(user, p, ageRange);
      return { ...p, score, breakdown };
    })
    .sort((a, b) => b.score - a.score);
}

export default function selectProfiles(user, profiles, ageRange) {
  const today = getTodayStr();
  const free = user.freeClipsDate === today ? 3 : 0;
  const extra = user.extraClipsDate === today ? 3 : 0;
  const limit = getDailyProfileLimit(user) + free + extra;
  return scoreProfiles(user, profiles, ageRange).slice(0, limit);
}
