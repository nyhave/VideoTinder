import { db, collection, getDocs, deleteDoc, doc, setDoc } from './firebase.js';

export default async function seedData() {
  const cols = ['profiles', 'matches', 'reflections'];
  for (const c of cols) {
    const snap = await getDocs(collection(db, c));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
  const testUsers = [
    {id:'101',name:'Maria',age:49,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:['/sample1.mp4'],clip:'Elsker bøger og gåture.',subscriptionActive:true},
    {id:'102',name:'Sofie',age:35,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:['/sample1.mp4'],clip:'Yoga-entusiast.'},
    {id:'103',name:'Emma',age:41,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:['/sample1.mp4'],clip:'Musikalsk sjæl.'},
    {id:'104',name:'Peter',age:45,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:['/sample1.mp4'],clip:'Cykler i weekenden.'},
    {id:'105',name:'Lars',age:52,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:['/sample1.mp4'],clip:'Madglad iværksætter.'},
    {id:'106',name:'Henrik',age:40,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:['/sample1.mp4'],clip:'Naturligvis fotograf.'}
  ];
  await Promise.all(testUsers.map(u => setDoc(doc(db, 'profiles', u.id), u)));
  await Promise.all([
    setDoc(doc(db,'matches','101-104'),{
      id:'101-104',
      userId:'101',
      profileId:'104',
      lastMessage:'Hej Peter!',
      unreadByUser:false,
      unreadByProfile:true
    }),
    setDoc(doc(db,'matches','104-101'),{
      id:'104-101',
      userId:'104',
      profileId:'101',
      lastMessage:'Hej Peter!',
      unreadByUser:true,
      unreadByProfile:false
    })
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
}
