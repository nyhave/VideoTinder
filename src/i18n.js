import React, { createContext, useContext } from 'react';

export const languages = {
  en: 'English',
  da: 'Dansk',
  sv: 'Svenska',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

const messages = {
  login: { en:'Login', da:'Log ind', sv:'Logga in', es:'Iniciar', fr:'Connexion', de:'Anmelden' },
  selectUser: { en:'Select user', da:'Vælg bruger', sv:'Välj användare', es:'Seleccionar usuario', fr:'Choisir un utilisateur', de:'Benutzer auswählen' },
  chooseLanguage: { en:'Language', da:'Sprog', sv:'Språk', es:'Idioma', fr:'Langue', de:'Sprache' },
  dailyClips: { en:'Daily Clips', da:'Dagens klip', sv:'Dagens klipp', es:'Clips diarios', fr:'Clips du jour', de:'Tägliche Clips' },
  chat: { en:'Chat', da:'Samtale', sv:'Chat', es:'Chat', fr:'Discussion', de:'Chat' },
  checkInTitle:{ en:'Daily reflection', da:'Dagens refleksion', sv:'Dagens reflektion', es:'Reflexión diaria', fr:'Réflexion du jour', de:'Tägliche Reflexion' },
  profile:{ en:'Profile', da:'Profil', sv:'Profil', es:'Perfil', fr:'Profil', de:'Profil' },
  about:{ en:'About', da:'Om', sv:'Om', es:'Acerca de', fr:'À propos', de:'Über' },
  loadMore:{ en:'Load more', da:'Hent flere...', sv:'Hämta fler...', es:'Cargar más', fr:'Charger plus', de:'Mehr laden' },
  noProfiles:{ en:'No profiles found', da:'Ingen profiler fundet', sv:'Inga profiler', es:'No hay perfiles', fr:'Aucun profil', de:'Keine Profile gefunden'},
  language:{ en:'Language', da:'Sprog', sv:'Språk', es:'Idioma', fr:'Langue', de:'Sprache' },
  preferredLanguages:{ en:'Preferred languages', da:'Foretrukne sprog', sv:'Föredragna språk', es:'Idiomas preferidos', fr:'Langues préférées', de:'Bevorzugte Sprachen' },
  allowOtherLanguages:{ en:'Allow other languages', da:'Tillad andre sprog', sv:'Tillåt andra språk', es:'Permitir otros idiomas', fr:"Autoriser d'autres langues", de:'Andere Sprachen erlauben' },
  yes:{ en:'Yes', da:'Ja', sv:'Ja', es:'Sí', fr:'Oui', de:'Ja' },
  no:{ en:'No', da:'Nej', sv:'Nej', es:'No', fr:'Non', de:'Nein' },
  videoClips:{ en:'Video clips', da:'Video-klip', sv:'Videoklipp', es:'Clips de video', fr:'Clips vidéo', de:'Videoclips' },
  audioClips:{ en:'Audio clips', da:'Lyd-klip', sv:'Ljudklipp', es:'Clips de audio', fr:'Clips audio', de:'Audioclips' },
  interestedIn:{ en:'Interested in', da:'Interesseret i', sv:'Intresserad av', es:'Interesado en', fr:'Intéressé par', de:'Interessiert an' },
  aboutMe:{ en:'About me', da:'Om mig', sv:'Om mig', es:'Sobre mí', fr:'À propos de moi', de:'Über mich' },
  register:{ en:'Create profile', da:'Opret profil', sv:'Skapa profil', es:'Crear perfil', fr:'Créer un profil', de:'Profil erstellen' },
  cancel:{ en:'Cancel', da:'Annuller', sv:'Avbryt', es:'Cancelar', fr:'Annuler', de:'Abbrechen' },
  firstName:{ en:'First name', da:'Fornavn', sv:'Förnamn', es:'Nombre', fr:'Prénom', de:'Vorname' },
  city:{ en:'City', da:'By', sv:'Stad', es:'Ciudad', fr:'Ville', de:'Stadt' },
  birthday:{ en:'Birthday', da:'Fødselsdag', sv:'Födelsedag', es:'Cumpleaños', fr:'Anniversaire', de:'Geburtstag' },
  chooseBirthday:{ en:'Select your birthday', da:'Vælg din fødselsdag', sv:'Välj din födelsedag', es:'Selecciona tu cumpleaños', fr:'Sélectionnez votre anniversaire', de:'Wähle deinen Geburtstag' },
  gender:{ en:'Gender', da:'Køn', sv:'Kön', es:'Género', fr:'Genre', de:'Geschlecht' },
  loginCtaTitle:{ en:"Already have a profile?", da:"Har du en profil?", sv:"Har du en profil?", es:"¿Ya tienes perfil?", fr:"Vous avez déjà un profil ?", de:"Hast du ein Profil?" },
  loginCtaDesc:{ en:"Log in to continue", da:"Log ind for at fortsætte", sv:"Logga in för att fortsätta", es:"Inicia sesión para continuar", fr:"Connectez-vous pour continuer", de:"Melde dich an, um fortzufahren" },
  registerCtaTitle:{ en:"New here?", da:"Ny her?", sv:"Ny här?", es:"¿Nuevo aquí?", fr:"Nouveau ici ?", de:"Neu hier?" },
  registerCtaDesc:{ en:"Create a profile to get started", da:"Opret en profil for at komme i gang", sv:"Skapa en profil för att komme igång", es:"Crea un perfil para comenzar", fr:"Créez un profil pour commencer", de:"Erstelle ein Profil, um zu starten" },
  videoCtaTitle:{ en:'Add video clips', da:'Tilføj videoer', sv:'Lägg till videoklipp', es:'Añadir videoclips', fr:'Ajouter des clips vidéo', de:'Videoclips hinzufügen' },
  videoCtaDesc:{ en:'Upload short clips to showcase yourself', da:'Upload korte videoklip for at vise dig frem', sv:'Ladda upp korta klipp för att visa dig', es:'Sube clips cortos para mostrarte', fr:'Téléchargez de courts clips pour vous présenter', de:'Lade kurze Clips hoch, um dich zu zeigen' },
  audioCtaTitle:{ en:'Add audio clips', da:'Tilføj lyde', sv:'Lägg till ljudklipp', es:'Añadir clips de audio', fr:'Ajouter des clips audio', de:'Audioclips hinzufügen' },
  audioCtaDesc:{ en:'Upload short audio clips to share your voice', da:'Upload korte lydklip for at dele din stemme', sv:'Ladda upp korta lydklipp för att dela din röst', es:'Sube clips de audio para compartir tu voz', fr:'Téléchargez de courts clips audio pour partager votre voix', de:'Lade kurze Audioclips hoch, um deine Stimme zu teilen' }
};

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export const LanguageProvider = LangContext.Provider;

export function useLang(){
  return useContext(LangContext);
}

export function useT(){
  const { lang } = useLang();
  return key => messages[key]?.[lang] || messages[key]?.en || key;
}
