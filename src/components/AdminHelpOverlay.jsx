import React from 'react';
import InfoOverlay from './InfoOverlay.jsx';
import { useT } from '../i18n.js';

const descriptions = [
  'V\u00e6lg sprog: Indstil sproget for admin-gr\u00e6nsefladen.',
  'V\u00e6lg bruger: Skift mellem profiler.',
  'Gem & log ud: Gem brugers \u00e6ndringer og log ud.',
  'Se anmeldt indhold: Vis rapporteret indhold.',
  'Verificer profil/Fjern verificering: Skift verificering for den valgte profil.',
  'Slet bruger: Fjern den valgte bruger permanent.',
  'Vis statistik: Se statistikdiagrammer.',
  'Se seneste logins: Vis de seneste loginmetoder.',
  'N\u00e6ste dag: Flyt lokal dato frem til test.',
  'Reset dag: Nulstil lokal dato til i dag.',
  'Se alle fejlmeldinger: \u00c5bn listen over fejlrapporter.',
  'Fejlmeld: Indsend en fejlrapport.',
  'Reset alle kandidater: Slet likes, matches og episodefremskridt.',
  'Test haptisk feedback: Udl\u00f8s vibration p\u00e5 enheden.',
  'A\u00e5bn funktionstest: \u00c5bn modulet til manuel funktionstest.',
  'A\u00e5bn reveal test: \u00c5bn reveal-testmodulet.',
  'Reset database: Genskab testdata.',
  'Hent mistet fra DB: Gendan manglende profilfiler fra lager.',
  'Dagens klip er klar: Send push-besked for dagens klip.',
  'Du har et match. Start samtalen: Send match-notifikation.',
  'Log client token: Vis denne enheds push-token.',
  'Vis VAPID-n\u00f8gler: Vis lokale VAPID-n\u00f8gler.',
  'Sammenlign VAPID-n\u00f8gler: Sammenlign lokale n\u00f8gler med serveren.',
  'Vis push-info: Vis v\u00e6rdier for push-konfiguration.',
  'Tjek Firebase Auth: Bekr\u00e6ft serverens autentifikationsadgang.',
  'Serverlog: Vis seneste serverlogfiler.',
  'Udvidet logning: Sl\u00e5 ekstra logning til eller fra.',
  'Vis console log: Fang browserens konsoloutput.',
  'Premium invitationer: Aktiver eller deaktiver premium invitationer.',
  'Vis niveauer: Sl\u00e5 visning af brugerniveauer til eller fra.',
  'Se log: Vis generel tekstlog.',
  'Se matchlog: Vis matchlog.',
  'Se scorelog: Vis scorelog.',
  'F\u00f8lg bruger: Overv\u00e5g en brugers aktivitet.',
  'Alle tekststykker: Vis alle tekststykker.',
  'Se aktive opkald: Vis nuv\u00e6rende videoopkald.',
  'Se gruppeopkald: Vis gruppeopkald.'
];

export default function AdminHelpOverlay({ onClose }) {
  const t = useT();
  return React.createElement(InfoOverlay, { title: t('helpTitle'), onClose },
    React.createElement('ul', { className: 'list-disc ml-5 space-y-1 text-sm text-left' },
      descriptions.map((d, i) => React.createElement('li', { key: i }, d))
    )
  );
}
