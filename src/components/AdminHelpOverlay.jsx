import React from 'react';
import InfoOverlay from './InfoOverlay.jsx';
import { useT } from '../i18n.js';

const descriptions = [
  'Choose language: Set the admin interface language.',
  'Select user: Switch between profiles.',
  'Save & Logout: Save user changes and sign out.',
  'Se anmeldt indhold: View reported content.',
  'Verificer profil/Fjern verificering: Toggle verification for the selected profile.',
  'Delete user: Permanently remove the selected user.',
  'Vis statistik: View statistics charts.',
  'Se seneste logins: Show recent login methods.',
  'N\u00e6ste dag: Advance local date for testing.',
  'Reset dag: Reset the local date to today.',
  'Se alle fejlmeldinger: Open list of bug reports.',
  'Fejlmeld: Submit a bug report.',
  'Reset all candidates: Delete likes, matches and episode progress.',
  'Test haptisk feedback: Trigger vibration on the device.',
  'A\u00e5bn funktionstest: Open the manual function test module.',
  'A\u00e5bn reveal test: Open the reveal test module.',
  'Reset database: Recreate test data.',
  'Hent mistet fra DB: Restore missing profile files from storage.',
  'Dagens klip er klar: Send push notification for daily clips.',
  'Du har et match. Start samtalen: Send match notification.',
  'Log client token: Display this device push token.',
  'Show VAPID keys: Show local VAPID key pair.',
  'Compare VAPID keys: Compare local keys with the server.',
  'Show push info: Show push configuration values.',
  'Check Firebase Auth: Verify server authentication access.',
  'Server log: View recent server logs.',
  'Udvidet logning: Toggle extra logging.',
  'Vis console log: Capture browser console output.',
  'Premium invites: Enable or disable premium invites.',
  'View levels: Toggle display of user levels.',
  'Se log: View general text log.',
  'Se matchlog: View match log.',
  'Se score log: View scoring log.',
  'F\u00f8lg bruger: Monitor activity of a user.',
  'Alle tekststykker: View all text pieces.',
  'Se aktive opkald: Show current video calls.',
  'Se gruppeopkald: Show group video calls.'
];

export default function AdminHelpOverlay({ onClose }) {
  const t = useT();
  return React.createElement(InfoOverlay, { title: t('helpTitle'), onClose },
    React.createElement('ul', { className: 'list-disc ml-5 space-y-1 text-sm text-left' },
      descriptions.map((d, i) => React.createElement('li', { key: i }, d))
    )
  );
}
