import { db, collection, getDocs, deleteDoc, doc, setDoc } from './firebase.js';

export default async function seedData() {
  const cols = ['profiles', 'clips', 'matches', 'reflections'];
  for (const c of cols) {
    const snap = await getDocs(collection(db, c));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
  const testUsers = [
    {id:'101',name:'Maria',age:49,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Elsker bøger og gåture.',subscriptionActive:true},
    {id:'102',name:'Sofie',age:35,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Yoga-entusiast.'},
    {id:'103',name:'Emma',age:41,gender:'Kvinde',interest:'Mand',audioClips:[],videoClips:[],clip:'Musikalsk sjæl.'},
    {id:'104',name:'Peter',age:45,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Cykler i weekenden.'},
    {id:'105',name:'Lars',age:52,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Madglad iværksætter.'},
    {id:'106',name:'Henrik',age:40,gender:'Mand',interest:'Kvinde',audioClips:[],videoClips:[],clip:'Naturligvis fotograf.'}
  ];
  await Promise.all(testUsers.map(u => setDoc(doc(db, 'profiles', u.id), u)));
  const testClips = [
    {id:'c1',profileId:'101',gender:'Kvinde',text:'Bøger er mit frirum.'},
    {id:'c2',profileId:'104',gender:'Mand',text:'Cykler hver dag.'},
    {id:'c3',profileId:'105',gender:'Mand',text:'Elsker at lave mad.'},
    {id:'c4',profileId:'106',gender:'Mand',text:'Fotograferer naturen.'},
    {id:'c5',profileId:'104',gender:'Mand',text:'Elsker naturen.'},
    {id:'c6',profileId:'105',gender:'Mand',text:'Søger eventyr.'}
  ];
  await Promise.all(testClips.map(c => setDoc(doc(db,'clips',c.id), c)));
  await setDoc(doc(db,'matches','m1'),{
    id:'m1',
    userId:'101',
    profileId:'104',
    lastMessage:'Hej Peter!',
    unreadByUser:false,
    unreadByProfile:true
  });
  const date = new Date().toISOString().split('T')[0];
  await setDoc(doc(db,'reflections','r1'),{id:'r1',userId:'101',date,text:'Mødte Peter i dag.'});
}
