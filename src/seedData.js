import { db, collection, getDocs, deleteDoc, doc, setDoc } from './firebase.js';

export default async function seedData() {
  const cols = ['profiles', 'matches', 'reflections', 'likes'];
  for (const c of cols) {
    const snap = await getDocs(collection(db, c));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
  const now = new Date();
  const expiry = new Date(now); expiry.setMonth(now.getMonth() + 1);
  const purchase = now.toISOString();
  const nowIso = new Date().toISOString();
  const testUsers = [
    {id:'101',name:'Maria',verified:true,age:49,gender:'Kvinde',interest:'Mand',city:'Odense',distanceRange:[10,25],videoClips:[],clip:'Elsker bøger og gåture.',subscriptionActive:true,subscriptionPurchased:purchase,subscriptionExpires:expiry.toISOString(),subscriptionTier:'silver',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Litteratur','Vandreture','Mad & vin']},
    {id:'102',name:'Sofie',age:35,gender:'Kvinde',interest:'Mand',city:'Aarhus',distanceRange:[10,25],videoClips:[],clip:'Yoga-entusiast.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Yoga','Musik','Rejser']},
    {id:'103',name:'Emma',age:41,gender:'Kvinde',interest:'Mand',city:'Aalborg',distanceRange:[10,25],videoClips:[],clip:'Musikalsk sjæl.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Musik','Kunst','Løb']},
    {id:'104',name:'Peter',verified:true,age:45,gender:'Mand',interest:'Kvinde',city:'København',distanceRange:[10,25],videoClips:[],clip:'Cykler i weekenden.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Cykling','Mad & vin','Rejser']},
    {id:'105',name:'Lars',age:52,gender:'Mand',interest:'Kvinde',city:'København',distanceRange:[10,25],videoClips:[],clip:'Madglad iværksætter.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Madlavning','Teknologi','Politik']},
    {id:'106',name:'Henrik',age:40,gender:'Mand',interest:'Kvinde',city:'Randers',distanceRange:[10,25],videoClips:[],clip:'Naturligvis fotograf.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Fotografi','Havearbejde']},
    {id:'107',name:'Anders',age:38,gender:'Mand',interest:'Kvinde',city:'Esbjerg',distanceRange:[10,25],videoClips:[],clip:'Løber maraton.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Løb','Fitness']},
    {id:'108',name:'Johan',age:42,gender:'Mand',interest:'Kvinde',city:'Odense',distanceRange:[10,25],videoClips:[],clip:'Historieinteresseret.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Historie','Litteratur']},
    {id:'109',name:'Morten',age:50,gender:'Mand',interest:'Kvinde',city:'Aarhus',distanceRange:[10,25],videoClips:[],clip:'Friluftsmenneske.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Camping','Fiskeri']},
    {id:'110',name:'Ole',age:47,gender:'Mand',interest:'Kvinde',city:'Aalborg',distanceRange:[10,25],videoClips:[],clip:'Nyder god kaffe.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Mad & vin','Biler']},
    {id:'111',name:'Jørgen',age:53,gender:'Mand',interest:'Kvinde',city:'København',distanceRange:[10,25],videoClips:[],clip:'Glad for sejlsport.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Sejlads','Strand']},
    {id:'112',name:'Frederik',age:39,gender:'Mand',interest:'Kvinde',city:'Odense',distanceRange:[10,25],videoClips:[],clip:'Spiller guitar.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Rock','Musik']},
    {id:'113',name:'Christian',age:44,gender:'Mand',interest:'Kvinde',city:'Aarhus',distanceRange:[10,25],videoClips:[],clip:'Kunstnerisk sjæl.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Kunst','Tegneserier']},
    {id:'114',name:'Thomas',age:41,gender:'Mand',interest:'Kvinde',city:'København',distanceRange:[10,25],videoClips:[],clip:'Eventyrlysten.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Rejser','Vandreture']},
    {id:'115',name:'Anne',age:36,gender:'Kvinde',interest:'Mand',city:'København',distanceRange:[10,25],videoClips:[],clip:'Operafan.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Opera','Vin']},
    {id:'116',name:'Jakob',age:37,gender:'Mand',interest:'Kvinde',city:'Aalborg',distanceRange:[10,25],videoClips:[],clip:'Elsker at bage.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Bage','Jazz']},
    {id:'117',name:'Mia',age:30,gender:'Kvinde',interest:'Mand',city:'Aarhus',distanceRange:[10,25],videoClips:[],clip:'Triatlon entusiast.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['Triatlon','L\u00f8b','Cykling']},
    {id:'118',name:'Rasmus',age:33,gender:'Mand',interest:'Kvinde',city:'Odense',distanceRange:[10,25],videoClips:[],clip:'Brygger min egen \u00f8l.',language:'da',preferredLanguages:['da'],allowOtherLanguages:true,photoUploadedAt:nowIso,interests:['\u00d8lbrygning','Camping']}
  ];
  await Promise.all(testUsers.map(u => setDoc(doc(db, 'profiles', u.id), u)));
  const chatMessages = [
    {from:'101', text:'Hej Peter! Hvordan g\u00e5r det?', ts:Date.now()},
    {from:'104', text:'Hej! Det g\u00e5r fint, hvad med dig?', ts:Date.now()},
    {from:'101', text:'Jeg har haft en travl dag p\u00e5 arbejdet.', ts:Date.now()},
    {from:'104', text:'Det lyder sp\u00e6ndende! Hvad laver du?', ts:Date.now()},
    {from:'101', text:'Jeg arbejder som l\u00e6rer i folkeskolen.', ts:Date.now()},
    {from:'104', text:'Fedt! Har du nogle hobbyer?', ts:Date.now()},
    {from:'101', text:'Jeg kan godt lide at l\u00e6se b\u00f8ger og g\u00e5 ture.', ts:Date.now()},
    {from:'104', text:'Det g\u00f8r jeg ogs\u00e5! Har du nogen yndlingsforfattere?', ts:Date.now()},
    {from:'101', text:'Jeg l\u00e6ser meget af H.C. Andersen.', ts:Date.now()},
    {from:'104', text:'Sp\u00e6ndende, vi burde m\u00f8des og tale mere om b\u00f8ger.', ts:Date.now()}
  ];
  const lastMsg = chatMessages[chatMessages.length-1].text;
  await Promise.all([
    setDoc(doc(db,'matches','101-104'),{
      id:'101-104',
      userId:'101',
      profileId:'104',
      lastMessage:lastMsg,
      messages:chatMessages,
      unreadByUser:false,
      unreadByProfile:true,
      newMatch:false
    }),
    setDoc(doc(db,'matches','104-101'),{
      id:'104-101',
      userId:'104',
      profileId:'101',
      lastMessage:lastMsg,
      messages:chatMessages,
      unreadByUser:true,
      unreadByProfile:false,
      newMatch:false
    })
  ]);
  await Promise.all([
    setDoc(doc(db,'likes','101-104'),{id:'101-104',userId:'101',profileId:'104'}),
    setDoc(doc(db,'likes','104-101'),{id:'104-101',userId:'104',profileId:'101'}),
    setDoc(doc(db,'likes','105-101'),{id:'105-101',userId:'105',profileId:'101'})
  ]);
  const today = new Date();
  const toDateString = d => d.toISOString().split('T')[0];
  const refDates = [0, 1, 2].map(offset => {
    const dt = new Date(today);
    dt.setDate(today.getDate() - offset);
    return toDateString(dt);
  });
  const reflections = [
    { id: 'r1', userId: '101', date: refDates[0], text: 'Mødte Peter i dag.' },
    { id: 'r2', userId: '101', date: refDates[1], text: 'Dejlig dag på arbejdet.' },
    { id: 'r3', userId: '101', date: refDates[2], text: 'Tog på vandretur.' }
  ];
  await Promise.all(reflections.map(r => setDoc(doc(db,'reflections',r.id), r)));

  await setDoc(doc(db,'config','app'),{
    premiumInvitesEnabled:true,
    showLevels:true
  });

  // Seed login credentials for the example users
  if (typeof window !== 'undefined') {
    const creds = {};
    for (const u of testUsers) {
      creds[`user${u.id}`] = { id: u.id, password: '' };
    }
    localStorage.setItem('userCreds', JSON.stringify(creds));
  }
}
