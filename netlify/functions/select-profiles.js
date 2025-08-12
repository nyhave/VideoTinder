const getAge = birthday => {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const { getInterestCategory } = require('./interests.js');

function calculateMatchScoreDetailed(user, profile, ageRange) {
  const breakdown = {};
  let score = 0;
  const userAge = user.birthday ? getAge(user.birthday) : user.age;
  const profAge = profile.birthday ? getAge(profile.birthday) : profile.age;
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
  if (user.interest === profile.gender && profile.interest === user.gender) {
    breakdown.gender = 20;
    score += 20;
  } else if (user.interest === profile.gender || profile.interest === user.gender) {
    breakdown.gender = 10;
    score += 10;
  } else {
    breakdown.gender = 0;
  }
  // Distance is no longer used to limit or score matches
  breakdown.distance = 20;
  score += 20;
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
  const completeness = [profile.clip, profile.photoURL, profile.interest].filter(Boolean).length;
  breakdown.completeness = completeness / 3 * 5;
  score += breakdown.completeness;
  if (typeof profile.responseRate === 'number') {
    breakdown.response = Math.min(1, profile.responseRate) * 5;
    score += breakdown.response;
  } else {
    breakdown.response = 0;
  }
  const popularity = (profile.viewCount || 0) + (profile.likeCount || 0);
  if (popularity < 5) breakdown.popularity = 5;
  else if (popularity < 20) breakdown.popularity = 3;
  else if (popularity < 50) breakdown.popularity = 1;
  else breakdown.popularity = 0;
  score += breakdown.popularity;
  const total = Math.min(100, score);
  return { score: total, breakdown };
}

function calculateMatchScore(user, profile, ageRange) {
  return calculateMatchScoreDetailed(user, profile, ageRange).score;
}

function scoreProfiles(user, profiles, ageRange) {
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

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { user, profiles, ageRange } = JSON.parse(event.body || '{}');
    if (!user || !profiles || !ageRange) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
    const result = scoreProfiles(user, profiles, ageRange);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (err) {
    return { statusCode: 500, body: 'Server error' };
  }
};
