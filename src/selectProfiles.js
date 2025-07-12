// Filtering helper kept separate so it can also run in a Firebase
// Cloud Function. Cloud Functions support both JavaScript and TypeScript.
export default function selectProfiles(user, profiles, ageRange){
  const interest = user.interest;
  const hasSubscription = user.subscriptionExpires && new Date(user.subscriptionExpires) > new Date();
  const today = new Date().toISOString().split('T')[0];
  const extra = user.extraClipsDate === today ? 3 : 0;
  const limit = (hasSubscription ? 6 : 3) + extra;
  const preferred = user.preferredLanguages || [];
  const allowOther = user.allowOtherLanguages !== false;
  return profiles.filter(p => {
    const matchesLang = preferred.length === 0 || preferred.includes(p.language || 'en');
    return (
      p.gender === interest &&
      p.age >= ageRange[0] &&
      p.age <= ageRange[1] &&
      (allowOther || matchesLang)
    );
  }).slice(0, limit);
}
