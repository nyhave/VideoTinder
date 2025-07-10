import React, { createContext, useContext } from 'react';

export const languages = {
  en: 'English',
  da: 'Dansk',
  sv: 'Svenska',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  hi: 'हिन्दी',
  zh: '中文'
};

const messages = {
  login: { en:'Login', da:'Log ind', sv:'Logga in', es:'Iniciar', fr:'Connexion', ar:'تسجيل', hi:'लॉगिन', zh:'登录' },
  selectUser: { en:'Select user', da:'Vælg bruger', sv:'Välj användare', es:'Seleccionar usuario', fr:'Choisir un utilisateur', ar:'اختر مستخدم', hi:'उपयोगकर्ता चुनें', zh:'选择用户' },
  chooseLanguage: { en:'Language', da:'Sprog', sv:'Språk', es:'Idioma', fr:'Langue', ar:'اللغة', hi:'भाषा', zh:'语言' },
  dailyClips: { en:'Daily Clips', da:'Dagens klip', sv:'Dagens klipp', es:'Clips diarios', fr:'Clips du jour', ar:'مقاطع اليوم', hi:'दैनिक क्लिप', zh:'每日剪辑' },
  chat: { en:'Chat', da:'Samtale', sv:'Chat', es:'Chat', fr:'Discussion', ar:'دردشة', hi:'चैट', zh:'聊天' },
  checkInTitle:{ en:'Daily reflection', da:'Dagens refleksion', sv:'Dagens reflektion', es:'Reflexión diaria', fr:'Réflexion du jour', ar:'تأمل اليوم', hi:'दैनिक चिंतन', zh:'每日反思' },
  profile:{ en:'Profile', da:'Profil', sv:'Profil', es:'Perfil', fr:'Profil', ar:'الملف', hi:'प्रोफ़ाइल', zh:'个人资料' },
  about:{ en:'About', da:'Om', sv:'Om', es:'Acerca de', fr:'À propos', ar:'حول', hi:'बारे में', zh:'关于' },
  loadMore:{ en:'Load more', da:'Hent flere...', sv:'Hämta fler...', es:'Cargar más', fr:'Charger plus', ar:'تحميل المزيد', hi:'और लोड करें', zh:'加载更多' },
  noProfiles:{ en:'No profiles found', da:'Ingen profiler fundet', sv:'Inga profiler', es:'No hay perfiles', fr:'Aucun profil', ar:'لا ملفات', hi:'कोई प्रोफ़ाइल नहीं', zh:'没有用户'},
  language:{ en:'Language', da:'Sprog', sv:'Språk', es:'Idioma', fr:'Langue', ar:'اللغة', hi:'भाषा', zh:'语言' },
  preferredLanguages:{ en:'Preferred languages', da:'Foretrukne sprog', sv:'Föredragna språk', es:'Idiomas preferidos', fr:'Langues préférées', ar:'اللغات المفضلة', hi:'पसंदीदा भाषाएँ', zh:'首选语言' },
  videoClips:{ en:'Video clips', da:'Video-klip', sv:'Videoklipp', es:'Clips de video', fr:'Clips vidéo', ar:'مقاطع فيديو', hi:'वीडियो क्लिप', zh:'视频片段' },
  audioClips:{ en:'Audio clips', da:'Lyd-klip', sv:'Ljudklipp', es:'Clips de audio', fr:'Clips audio', ar:'مقاطع صوتية', hi:'ऑडियो क्लिप', zh:'音频剪辑' },
  interestedIn:{ en:'Interested in', da:'Interesseret i', sv:'Intresserad av', es:'Interesado en', fr:'Intéressé par', ar:'مهتم بـ', hi:'में रुचि', zh:'感兴趣于' },
  aboutMe:{ en:'About me', da:'Om mig', sv:'Om mig', es:'Sobre mí', fr:'À propos de moi', ar:'عن نفسي', hi:'मेरे बारे में', zh:'关于我' }
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
