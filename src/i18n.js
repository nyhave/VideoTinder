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
  about:{ en:'About RealDate', da:'Om RealDate', sv:'Om RealDate', es:'Acerca de RealDate', fr:'À propos de RealDate', de:'Über RealDate' },
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
  interests:{ en:'Interests', da:'Interesser', sv:'Intressen', es:'Intereses', fr:'Centres d\'intérêt', de:'Interessen' },
  chooseInterests:{ en:'Select up to 5 interests', da:'Vælg op til 5 interesser', sv:'Välj upp till 5 intressen', es:'Elige hasta 5 intereses', fr:'Choisissez jusqu\'à 5 centres d\'intérêt', de:'Wähle bis zu 5 Interessen' },
  maxInterests:{ en:'You can select up to 5 interests', da:'Du kan vælge op til 5 interesser', sv:'Du kan välja upp till 5 intressen', es:'Puedes seleccionar hasta 5 intereses', fr:'Vous pouvez sélectionner jusqu\'à 5 centres d\'intérêt', de:'Du kannst bis zu 5 Interessen auswählen' },
  aboutMe:{ en:'About me', da:'Om mig', sv:'Om mig', es:'Sobre mí', fr:'À propos de moi', de:'Über mich' },
  register:{ en:'Create profile', da:'Opret profil', sv:'Skapa profil', es:'Crear perfil', fr:'Créer un profil', de:'Profil erstellen' },
  cancel:{ en:'Cancel', da:'Annuller', sv:'Avbryt', es:'Cancelar', fr:'Annuler', de:'Abbrechen' },
  firstName:{ en:'First name', da:'Fornavn', sv:'Förnamn', es:'Nombre', fr:'Prénom', de:'Vorname' },
  city:{ en:'City', da:'By', sv:'Stad', es:'Ciudad', fr:'Ville', de:'Stadt' },
  birthday:{ en:'Birthday', da:'Fødselsdag', sv:'Födelsedag', es:'Cumpleaños', fr:'Anniversaire', de:'Geburtstag' },
  email:{ en:'Email', da:'E-mail', sv:'E-post', es:'Correo', fr:'E-mail', de:'E-Mail' },
  emailPrivate:{ en:'Your email address is only visible to you', da:'Din e-mailadresse kan kun ses af dig selv', sv:'Din e-postadress kan bara ses av dig själv', es:'Tu correo electrónico solo es visible para ti', fr:"Votre adresse e-mail n'est visible que par vous", de:'Deine E-Mail-Adresse ist nur für dich sichtbar' },
  username:{ en:'Username', da:'Brugernavn', sv:'Användarnamn', es:'Usuario', fr:"Nom d'utilisateur", de:'Benutzername' },
  password:{ en:'Password', da:'Adgangskode', sv:'Lösenord', es:'Contraseña', fr:'Mot de passe', de:'Passwort' },
  loginFailed:{ en:'Incorrect username or password', da:'Forkert brugernavn eller adgangskode', sv:'Fel användarnamn eller lösenord', es:'Usuario o contraseña incorrectos', fr:"Nom d'utilisateur ou mot de passe incorrect", de:'Falscher Benutzername oder Passwort' },
  usernameTaken:{ en:'Username already exists', da:'Brugernavn findes allerede', sv:'Användarnamnet finns redan', es:'El nombre de usuario ya existe', fr:"Nom d'utilisateur déjà pris", de:'Benutzername existiert bereits' },
  chooseBirthday:{ en:'Select your birthday', da:'Vælg din fødselsdag', sv:'Välj din födelsedag', es:'Selecciona tu cumpleaños', fr:'Sélectionnez votre anniversaire', de:'Wähle deinen Geburtstag' },
  gender:{ en:'Gender', da:'Køn', sv:'Kön', es:'Género', fr:'Genre', de:'Geschlecht' },
  loginCtaTitle:{ en:"Already have a profile?", da:"Har du en profil?", sv:"Har du en profil?", es:"¿Ya tienes perfil?", fr:"Vous avez déjà un profil ?", de:"Hast du ein Profil?" },
  loginCtaDesc:{ en:"Log in to continue", da:"Log ind for at fortsætte", sv:"Logga in för att fortsätta", es:"Inicia sesión para continuar", fr:"Connectez-vous pour continuer", de:"Melde dich an, um fortzufahren" },
  registerCtaTitle:{ en:"New here?", da:"Ny her?", sv:"Ny här?", es:"¿Nuevo aquí?", fr:"Nouveau ici ?", de:"Neu hier?" },
  registerCtaDesc:{ en:"Create a profile to get started", da:"Opret en profil for at komme i gang", sv:"Skapa en profil för att komme igång", es:"Crea un perfil para comenzar", fr:"Créez un profil pour commencer", de:"Erstelle ein Profil, um zu starten" },
  videoCtaTitle:{ en:'Add video clips', da:'Tilføj videoer', sv:'Lägg till videoklipp', es:'Añadir videoclips', fr:'Ajouter des clips vidéo', de:'Videoclips hinzufügen' },
  videoCtaDesc:{ en:'Upload short clips to showcase yourself', da:'Upload korte videoklip for at vise dig frem', sv:'Ladda upp korta klipp för att visa dig', es:'Sube clips cortos para mostrarte', fr:'Téléchargez de courts clips pour vous présenter', de:'Lade kurze Clips hoch, um dich zu zeigen' },
  audioCtaTitle:{ en:'Add audio clips', da:'Tilføj lyde', sv:'Lägg till ljudklipp', es:'Añadir clips de audio', fr:'Ajouter des clips audio', de:'Audioclips hinzufügen' },
  audioCtaDesc:{ en:'Upload short audio clips to share your voice', da:'Upload korte lydklip for at dele din stemme', sv:'Ladda upp korta lydklipp för att dela din röst', es:'Sube clips de audio para compartir tu voz', fr:'Téléchargez de courts clips audio pour partager votre voix', de:'Lade kurze Audioclips hoch, um deine Stimme zu teilen' },
  clip1:{ en:'Introduction', da:'Introduktion', sv:'Introduktion', es:'Introducción', fr:'Introduction', de:'Einführung' },
  clip2:{ en:'From my daily life', da:'Fra min dagligdag', sv:'Från vardagen', es:'De mi día a día', fr:'De mon quotidien', de:'Aus meinem Alltag' },
  clip3:{ en:'Free', da:'Fri', sv:'Fritt', es:'Libre', fr:'Libre', de:'Frei' },
inviteFriend:{ en:'Invite a friend', da:'Inviter en ven', sv:'Bjud in en vän', es:'Invitar a un amigo', fr:'Inviter un ami', de:'Einen Freund einladen' },
inviteDesc:{ en:'Share the link below to invite others to RealDate', da:'Del linket nedenfor for at invitere andre til RealDate', sv:'Dela länken nedan för at bjuda in andra til RealDate', es:'Comparte el enlace de abajo para invitar a otros a RealDate', fr:"Partagez le lien ci-dessous pour inviter d'autres sur RealDate", de:'Teile den Link unten, um andere zu RealDate einzuladen' },
share:{ en:'Share', da:'Del', sv:'Dela', es:'Compartir', fr:'Partager', de:'Teilen' },
copyLink:{ en:'Copy link', da:'Kopiér link', sv:'Kopiera länk', es:'Copiar enlace', fr:'Copier le lien', de:'Link kopieren' },
linkCopied:{ en:'Link copied to clipboard', da:'Link kopieret', sv:'Länk kopierad', es:'Enlace copiado', fr:'Lien copié', de:'Link kopiert' },
inviteList:{ en:"Invitations", da:"Invitationer", sv:"Inbjudningar", es:"Invitaciones", fr:"Invitations", de:"Einladungen" },
invitePending:{ en:"Pending", da:"Afventer", sv:"V\u00e4ntar", es:"Pendiente", fr:"En attente", de:"Ausstehend" },
inviteAccepted:{ en:"Profile created", da:"Oprettet", sv:"Skapad", es:"Perfil creado", fr:"Profil cr\u00e9\u00e9", de:"Profil erstellt" },
  profileCreated:{ en:'Thanks for creating your profile!', da:'Tak fordi du oprettede din profil!', sv:'Tack för att du skapade din profil!', es:'¡Gracias por crear tu perfil!', fr:'Merci d\'avoir créé votre profil !', de:'Danke für das Erstellen deines Profils!' },
  profileCreatedGift:{ en:'You have received 3 months of premium for free.', da:'Du har fået gratis premium i 3 måneder.', sv:'Du har fått 3 månaders premium gratis.', es:'Has recibido 3 meses de premium gratis.', fr:'Vous avez reçu 3 mois de premium gratuit.', de:'Du hast 3 Monate Premium gratis erhalten.' },
  episodeIntro:{ en:'Introduction', da:'Introduktion', sv:'Introduktion', es:'Introducción', fr:'Introduction', de:'Einführung' },
  episodeReflectionPrompt:{ en:'Write a short reflection...', da:'Skriv en kort refleksion...', sv:'Skriv en kort reflektion...', es:'Escribe una breve reflexión...', fr:'Écrivez une courte réflexion...', de:'Schreibe eine kurze Reflexion...' },
  episodeReactionPrompt:{ en:'Send a reaction', da:'Send en reaktion', sv:'Skicka en reaktion', es:'Envía una reacción', fr:'Envoyer une réaction', de:'Sende eine Reaktion' },
  episodeReturnTomorrow:{ en:'Watch another clip to continue', da:'Se et klip mere for at fortsætte', sv:'Titta på ett klipp till för att fortsätta', es:'Mira otro clip para continuar', fr:'Regardez un autre clip pour continuer', de:'Schau einen weiteren Clip, um fortzufahren' },
  episodeMatchPrompt:{ en:'Start conversation', da:'Start samtale', sv:'Starta samtal', es:'Iniciar conversación', fr:'Commencer la conversation', de:'Gespräch starten' },
  episodeStageReflection:{ en:'Reflection', da:'Refleksion', sv:'Reflektion', es:'Reflexión', fr:'Réflexion', de:'Reflexion' },
  episodeStageReaction:{ en:'Reaction', da:'Reaktion', sv:'Reaktion', es:'Reacción', fr:'Réaction', de:'Reaktion' },
  episodeStageConnect:{ en:'Connect', da:'Forbind', sv:'Anslut', es:'Conectar', fr:'Connecter', de:'Verbinden' },
  expiresIn:{ en:'Expires in {days} days', da:'Udl\u00f8ber om {days} dage', sv:'G\u00e5r ut om {days} dagar', es:'Expira en {days} d\u00edas', fr:'Expire dans {days} jours', de:'L\u00e4uft in {days} Tagen ab' },
  missingFieldsTitle:{ en:'Missing information', da:'Mangler information', sv:'Saknar information', es:'Falta información', fr:'Informations manquantes', de:'Fehlende Angaben' },
  missingFieldsDesc:{ en:'Please fill out all required fields', da:'Udfyld venligst alle obligatoriske felter', sv:'Vänligen fyll i alla obligatoriska fält', es:'Por favor, completa todos los campos obligatorios', fr:'Veuillez remplir tous les champs obligatoires', de:'Bitte fülle alle Pflichtfelder aus' },
  helpTitle:{ en:'Help', da:'Hjælp', sv:'Hjälp', es:'Ayuda', fr:'Aide', de:'Hilfe' },
  helpLevels:{ en:'On the Daily Life page each profile has three levels. Watch clips to unlock more content.', da:'På siden Dagens liv har hver profil tre niveauer. Se klip for at låse mere op.' },
  helpSupport:{ en:'Need assistance? Choose "Report bug" on the About page to contact support.', da:'Brug for hjælp? Vælg \"Fejlmeld\" på Om RealDate-siden for at kontakte support.' },
  helpInvites:{ en:'You can send up to five invitations. Follow each invitation until your friend has created a profile.', da:'Du kan sende op til fem invitationer. Følg hver invitation, indtil din ven har oprettet en profil.' },
  level2Watch:{ en:'Watch the new video or sound clip', da:'Se det nye video- eller lydklip', sv:'Titta på det nya video- eller ljudklippet', es:'Mira el nuevo vídeo o clip de sonido', fr:'Regardez la nouvelle vidéo ou le nouveau clip audio', de:'Sieh dir den neuen Video- oder Audioclip an' },
  level2Rate:{ en:'Give a private rating', da:'Giv en privat vurdering', sv:'Ge ett privat betyg', es:'Da una calificación privada', fr:'Donnez une évaluation privée', de:'Gib eine private Bewertung ab' },
  level2Reflect:{ en:'Write a private reflection', da:'Skriv en privat refleksion', sv:'Skriv en privat reflektion', es:'Escribe una reflexión privada', fr:'Écrivez une réflexion privée', de:'Schreibe eine private Reflexion' },
  level2Intro:{
    en:'Get to level 2 with {name} to see more content',
    da:'Kom til Niveau 2 med {name} for at se mere indhold',
    sv:'Kom till nivå 2 med {name} för att se mer innehåll',
    es:'Llega al nivel 2 con {name} para ver más contenido',
    fr:'Atteignez le niveau 2 avec {name} pour voir plus de contenu',
    de:'Erreiche Level 2 mit {name}, um mehr Inhalte zu sehen'
  },
  unlockHigherLevels:{ en:'Unlocks at higher levels', da:'L\u00e5ses op p\u00e5 h\u00f8jere niveauer', sv:'L\u00e5ses upp p\u00e5 h\u00f6gre niv\u00e5er', es:'Se desbloquea en niveles superiores', fr:'Se d\u00e9bloque \u00e0 des niveaux sup\u00e9rieurs', de:'Wird auf h\u00f6heren Ebenen freigeschaltet' },
  max10Sec:{ en:'Max 10 sec', da:'Max 10 sek', sv:'Max 10 sek', es:'M\u00e1x 10 seg', fr:'Max 10 s', de:'Max 10 Sek' },
  newLabel:{ en:'New!', da:'Nyt!', sv:'Nytt!', es:'\u00a1Nuevo!', fr:'Nouveau !', de:'Neu!' },
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
