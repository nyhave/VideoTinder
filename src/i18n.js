import React, { createContext, useContext } from 'react';

export const languages = {
  en: 'English',
  da: 'Dansk',
  sv: 'Svenska',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

export const messages = {
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
  skip:{ en:'Skip', da:'Skip', sv:'Skip', es:'Skip', fr:'Skip', de:'Skip' },
  deleteAccount:{ en:'Delete account', da:'Slet konto' },
  confirmDeleteTitle:{ en:'Delete account?', da:'Slet konto?' },
  confirmDeleteDesc:{ en:'This will permanently remove your profile. Continue?', da:'Dette vil fjerne din profil permanent. Fortsæt?' },
  firstName:{ en:'First name', da:'Fornavn', sv:'Förnamn', es:'Nombre', fr:'Prénom', de:'Vorname' },
  city:{ en:'City', da:'By', sv:'Stad', es:'Ciudad', fr:'Ville', de:'Stadt' },
  birthday:{ en:'Birthday', da:'Fødselsdag', sv:'Födelsedag', es:'Cumpleaños', fr:'Anniversaire', de:'Geburtstag' },
  email:{ en:'Email', da:'E-mail', sv:'E-post', es:'Correo', fr:'E-mail', de:'E-Mail' },
  emailPrivate:{ en:'Your email address is only visible to you', da:'Din e-mailadresse kan kun ses af dig selv', sv:'Din e-postadress kan bara ses av dig själv', es:'Tu correo electrónico solo es visible para ti', fr:"Votre adresse e-mail n'est visible que par vous", de:'Deine E-Mail-Adresse ist nur für dich sichtbar' },
  username:{ en:'Username', da:'Brugernavn', sv:'Användarnamn', es:'Usuario', fr:"Nom d'utilisateur", de:'Benutzername' },
  password:{ en:'Password', da:'Adgangskode', sv:'Lösenord', es:'Contraseña', fr:'Mot de passe', de:'Passwort' },
  loginFailed:{ en:'Incorrect username or password', da:'Forkert brugernavn eller adgangskode', sv:'Fel användarnamn eller lösenord', es:'Usuario o contraseña incorrectos', fr:"Nom d'utilisateur ou mot de passe incorrect", de:'Falscher Benutzername oder Passwort' },
  loginGoogle:{ en:'Login with Google', da:'Log ind med Google', sv:'Logga in med Google', es:'Iniciar con Google', fr:'Connexion avec Google', de:'Mit Google anmelden' },
  loginFacebook:{ en:'Login with Facebook', da:'Log ind med Facebook', sv:'Logga in med Facebook', es:'Iniciar con Facebook', fr:'Connexion avec Facebook', de:'Mit Facebook anmelden' },
  registerGoogle:{ en:'Create with Google', da:'Opret med Google', sv:'Skapa med Google', es:'Crear con Google', fr:'Créer avec Google', de:'Mit Google erstellen' },
  registerFacebook:{ en:'Create with Facebook', da:'Opret med Facebook', sv:'Skapa med Facebook', es:'Crear con Facebook', fr:'Créer avec Facebook', de:'Mit Facebook erstellen' },
  usernameTaken:{ en:'Username already exists', da:'Brugernavn findes allerede', sv:'Användarnamnet finns redan', es:'El nombre de usuario ya existe', fr:"Nom d'utilisateur déjà pris", de:'Benutzername existiert bereits' },
  forgotPassword:{ en:'Forgot password?', da:'Glemt adgangskode?', sv:'Glömt lösenord?', es:'¿Olvidaste tu contraseña?', fr:'Mot de passe oublié ?', de:'Passwort vergessen?' },
  forgotPasswordInfo:{ en:'Create a new profile or contact support to reset your password.', da:'Opret en ny profil eller kontakt support for at nulstille din adgangskode.', sv:'Skapa en ny profil eller kontakta supporten för att återställa ditt lösenord.', es:'Crea un perfil nuevo o contacta con soporte para restablecer tu contraseña.', fr:'Créez un nouveau profil ou contactez le support pour réinitialiser votre mot de passe.', de:'Erstelle ein neues Profil oder kontaktiere den Support, um dein Passwort zurückzusetzen.' },
  sendReset:{ en:'Send reset email', da:'Send nulstillingsmail', sv:'Skicka återställningsmail', es:'Enviar correo de restablecimiento', fr:"Envoyer l'e-mail de réinitialisation", de:'Zurücksetzungs-E-Mail senden' },
  resetEmailSent:{ en:'Password reset email sent', da:'E-mail til nulstilling sendt', sv:'Återställningsmail skickat', es:'Correo de restablecimiento enviado', fr:"E-mail de réinitialisation envoyé", de:'E-Mail zum Zurücksetzen gesendet' },
  resetEmailFailed:{ en:'Failed to send reset email', da:'Kunne ikke sende nulstillingsmail', sv:'Kunde inte skicka återställningsmail', es:'No se pudo enviar el correo de restablecimiento', fr:"Échec de l'envoi de l'e-mail de réinitialisation", de:'Senden der Zurücksetzungs-E-Mail fehlgeschlagen' },
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
  clip2:{ en:'Biggest interest', da:'Største interesse', sv:'Största intresse', es:'Mayor interés', fr:'Plus grand intérêt', de:'Größtes Interesse' },
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
  charactersLeft:{ en:'{count} characters left', da:'{count} tegn tilbage', sv:'{count} tecken kvar', es:'Quedan {count} caracteres', fr:'{count} caractères restants', de:'{count} Zeichen übrig' },
  episodeReturnTomorrow:{ en:'Watch another clip to continue', da:'Se et klip mere for at fortsætte', sv:'Titta på ett klipp till för att fortsätta', es:'Mira otro clip para continuar', fr:'Regardez un autre clip pour continuer', de:'Schau einen weiteren Clip, um fortzufahren' },
  episodeMatchPrompt:{ en:'Start conversation', da:'Start samtale', sv:'Starta samtal', es:'Iniciar conversación', fr:'Commencer la conversation', de:'Gespräch starten' },
  episodeStageReflection:{ en:'Reflection', da:'Refleksion', sv:'Reflektion', es:'Reflexión', fr:'Réflexion', de:'Reflexion' },
  episodeStageReaction:{ en:'Reaction', da:'Reaktion', sv:'Reaktion', es:'Reacción', fr:'Réaction', de:'Reaktion' },
  episodeStageConnect:{ en:'Connect', da:'Forbind', sv:'Anslut', es:'Conectar', fr:'Connecter', de:'Verbinden' },
  expiresIn:{ en:'Expires in {days} days', da:'Udl\u00f8ber om {days} dage', sv:'G\u00e5r ut om {days} dagar', es:'Expira en {days} d\u00edas', fr:'Expire dans {days} jours', de:'L\u00e4uft in {days} Tagen ab' },
  lastDay:{ en:'Last day', da:'Sidste dag', sv:'Sista dagen', es:'\u00daltimo d\u00eda', fr:'Dernier jour', de:'Letzter Tag' },
  missingFieldsTitle:{ en:'Missing information', da:'Mangler information', sv:'Saknar information', es:'Falta información', fr:'Informations manquantes', de:'Fehlende Angaben' },
  missingFieldsDesc:{ en:'Please fill out all required fields', da:'Udfyld venligst alle obligatoriske felter', sv:'Vänligen fyll i alla obligatoriska fält', es:'Por favor, completa todos los campos obligatorios', fr:'Veuillez remplir tous les champs obligatoires', de:'Bitte fülle alle Pflichtfelder aus' },
  helpTitle:{ en:'Help', da:'Hjælp', sv:'Hjälp', es:'Ayuda', fr:'Aide', de:'Hilfe' },
  helpLevels:{ en:'On the Daily Life page each profile has three levels. Watch clips to unlock more content.', da:'På siden Dagens liv har hver profil tre niveauer. Se klip for at låse mere op.' },
  helpSupport:{ en:'Need assistance? Choose "Report bug" on the About page to contact support.', da:'Brug for hjælp? Vælg \"Fejlmeld\" på Om RealDate-siden for at kontakte support.' },
  helpInvites:{ en:'You can send up to five invitations. Follow each invitation until your friend has created a profile.', da:'Du kan sende op til fem invitationer. Følg hver invitation, indtil din ven har oprettet en profil.' },
  dailyHelpLabel:{ en:'Need help?', da:'Need help?' },
  dailyHelpTitle:{ en:'Daily Clips Help', da:'Hjælp til Dagens klip' },
  dailyHelpText:{
    en:'Feel the energy and consider carefully before matching. We use video clips and audio to show the person\'s energy and personality. Take your time with the profiles. We support reflection time and want to avoid endless swiping. Therefore you get video/audio one at a time and can look forward to more clips of the same person being released in the next days. To make the videos unique we ask for different content: introduction, biggest interest and free choice.',
    da:'Føl energien og overvej grundigt inden du matcher. Vi bruger videoklip og lyd til at vise personens energi og personlighed. Brug god tid på profilerne. Vi understøtter tid til refleksion og ønsker at undgå uendelig swipe. Derfor får du video/lyd en af gangen og kan glæde dig til at der næste dage frigives flere klip af samme person. For at gøre videoerne unikke beder vi om forskelligt indhold introduktion, største interesse og frit valg.'
  },
  level2Watch:{ en:'Watch the new video or sound clip', da:'Se det nye video- eller lydklip', sv:'Titta på det nya video- eller ljudklippet', es:'Mira el nuevo vídeo o clip de sonido', fr:'Regardez la nouvelle vidéo ou le nouveau clip audio', de:'Sieh dir den neuen Video- oder Audioclip an' },
  level2Rate:{ en:'Give a private rating', da:'Giv en privat vurdering', sv:'Ge ett privat betyg', es:'Da una calificación privada', fr:'Donnez une évaluation privée', de:'Gib eine private Bewertung ab' },
  level2Reflect:{ en:'Write a private reflection', da:'Skriv en privat refleksion', sv:'Skriv en privat reflektion', es:'Escribe una reflexión privada', fr:'Écrivez une réflexion privée', de:'Schreibe eine private Reflexion' },
  level2Intro:{
    en:'This is Day {day} with {name}. Watch all available content and add a reflection or rating. If you do both they\'ll show together in your daily reflection. Come back tomorrow for more content',
    da:'Dette er dag {day} med {name}. Se alt indhold og skriv en refleksion eller giv en vurdering. Hvis begge udfyldes vises de samlet i din daglige refleksion. Kom tilbage i morgen for mere indhold',
    sv:'Detta är dag {day} med {name}. Titta på allt innehåll och skriv en reflektion eller ge ett betyg. Om båda fylls i visas de tillsammans i din dagliga reflektion. Kom tillbaka i morgon för mer innehåll',
    es:'Este es el día {day} con {name}. Mira todo el contenido y escribe una reflexión o da una calificación. Si completas ambos aparecerán juntos en tu reflexión diaria. Vuelve mañana para ver más contenido',
    fr:'C\'est le jour {day} avec {name}. Regardez tout le contenu puis écrivez une réflexion ou donnez une note. Si vous faites les deux, ils apparaîtront ensemble dans votre réflexion quotidienne. Revenez demain pour plus de contenu',
    de:'Dies ist Tag {day} mit {name}. Sieh dir alle Inhalte an und schreibe eine Reflexion oder gib eine Bewertung ab. Wenn du beides machst, erscheinen sie zusammen in deiner täglichen Reflexion. Komm morgen zurück, um mehr Inhalte zu sehen'
  },
  keepProfile:{ en:'Keep profile', da:'Bevar profilen med 3 eller 4 stjerner', sv:'Bevara profilen', es:'Mantener perfil', fr:'Garder le profil', de:'Profil behalten' },
  dayLabel:{
    en:'Day {day}',
    da:'Dag {day}',
    sv:'Dag {day}',
    es:'D\u00eda {day}',
    fr:'Jour {day}',
    de:'Tag {day}'
  },
  max10Sec:{ en:'Max 10 sec', da:'Max 10 sek', sv:'Max 10 sek', es:'M\u00e1x 10 seg', fr:'Max 10 s', de:'Max 10 Sek' },
  remove:{ en:'Remove', da:'Fjern', sv:'Ta bort', es:'Eliminar', fr:'Supprimer', de:'Entfernen' },
  showArchived:{ en:'Show archived profiles', da:'Vis gemte profiler', sv:'Visa arkiverade profiler', es:'Mostrar perfiles archivados', fr:'Afficher les profils archivés', de:'Archivierte Profile anzeigen' },
  archivedProfiles:{ en:'Archived profiles', da:'Tidligere profiler', sv:'Tidigare profiler', es:'Perfiles archivados', fr:'Profils archivés', de:'Archivierte Profile' },
  qrOpen:{
    en:'Scan to open RealDate',
    da:'Scan for at \u00e5bne RealDate',
    sv:'Skanna f\u00f6r att \u00f6ppna RealDate',
    es:'Escanea para abrir RealDate',
    fr:'Scannez pour ouvrir RealDate',
    de:'Zum \u00d6ffnen von RealDate scannen'
  }
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
