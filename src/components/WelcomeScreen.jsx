import React, { useState } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import InfoOverlay from './InfoOverlay.jsx';
import ForgotPasswordOverlay from './ForgotPasswordOverlay.jsx';
import { UserPlus, LogIn, Loader2 } from 'lucide-react';
import { useLang, useT } from '../i18n.js';
import { auth, db, doc, setDoc, updateDoc, increment, getDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signInWithGoogle, logEvent } from '../firebase.js';
import { getAge, getCurrentDate, parseBirthday } from '../utils.js';

export default function WelcomeScreen({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showRegisterChoice, setShowRegisterChoice] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [registerError, setRegisterError] = useState(false);
  const [registerErrorMsg, setRegisterErrorMsg] = useState('');
  const [gender, setGender] = useState('Kvinde');
  const [birthdayInput, setBirthdayInput] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [showBirthdayError, setShowBirthdayError] = useState(false);
  const [showCreated, setShowCreated] = useState(false);
  const [createdMsg, setCreatedMsg] = useState('');
  const [createdId, setCreatedId] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [pendingUid, setPendingUid] = useState(null);
  const { lang } = useLang();
  const t = useT();

  const handleBirthdayChange = e => {
    const val = e.target.value;
    setBirthdayInput(val);
    const iso = parseBirthday(val);
    setBirthday(iso);
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginUser.trim(), loginPass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        const pid = userDoc.exists() ? userDoc.data().profileId : cred.user.uid;
        onLogin(pid);
    } catch (err) {
      console.error('Login failed', err);
      setLoginError(true);
      setLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    try {
      const cred = await signInWithGoogle();
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        const pid = userDoc.exists() ? userDoc.data().profileId : cred.user.uid;
        onLogin(pid, 'google');
    } catch (err) {
      console.error('Google login failed', err);
      setLoginError(true);
      setLoggingIn(false);
    }
  };

  React.useEffect(() => {
    const handler = e => {
      switch (e.detail) {
        case 'showLogin':
          setShowLoginForm(true);
          break;
        case 'fillLoginUser':
          setLoginUser('test@example.com');
          break;
        case 'fillLoginPass':
          setLoginPass('password');
          break;
        case 'submitLogin':
          handleLogin();
          break;
        case 'loginMaria':
          onLogin('101', 'admin');
          break;
        default:
          break;
      }
    };
    window.addEventListener('functionTestAction', handler);
    return () => window.removeEventListener('functionTestAction', handler);
  }, []);

  const finalizeRegistration = async (id, profile, uid, inviteId, inviteValid, giftFrom, loginMethod) => {
    await setDoc(doc(db, 'profiles', id), { ...profile, uid });
    await setDoc(doc(db, 'users', uid), { profileId: id });
    if (inviteId && inviteValid) {
      try {
        await updateDoc(doc(db, 'invites', inviteId), { accepted: true, profileId: id });
      } catch (err) {
        console.error('Failed to update invite', err);
      }
    }
    setCreatedMsg(t(giftFrom && inviteValid ? 'profileCreatedGift' : 'profileCreated'));
    setCreatedId(id);
    setShowCreated(true);
  };

  const registerWithGoogle = async () => {
    const provider = 'google';
    await logEvent('registerWithProvider start', { provider });
    setTriedSubmit(true);
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    if (!trimmedName || !trimmedCity || !birthdayInput) {
      setShowMissingFields(true);
      return;
    }
    const parsedBirthday = parseBirthday(birthdayInput);
    if (!parsedBirthday) {
      setShowBirthdayError(true);
      return;
    }
    setBirthday(parsedBirthday);
    if (getAge(parsedBirthday) < 18) {
      setShowAgeError(true);
      return;
    }

    let cred;
    try {
      cred = await signInWithGoogle();
      await logEvent('registerWithProvider success', { provider, uid: cred.user?.uid });
    } catch (err) {
      await logEvent('registerWithProvider error', { provider, error: err.message });
      console.error('Provider signup failed', err);
      if (err?.code === 'auth/account-exists-with-different-credential' || err?.code === 'auth/email-already-in-use') {
        setRegisterErrorMsg('registerEmailExists');
      } else {
        setRegisterErrorMsg('registerFailed');
      }
      setRegisterError(true);
      return;
    }

    const trimmedNameFinal = trimmedName || cred.user.displayName || '';
    const trimmedCityFinal = trimmedCity;

    const id = Date.now().toString();
    const params = new URLSearchParams(window.location.search);
    let giftFrom = params.get('gift');
    const inviteId = params.get('invite');

    let inviteValid = false;
    if (inviteId) {
      try {
        const snap = await getDoc(doc(db, 'invites', inviteId));
        if (snap.exists()) {
          const inv = snap.data();
          if (!inv.accepted && (!giftFrom || giftFrom === inv.inviterId)) {
            inviteValid = true;
            if (!giftFrom && inv.gift) giftFrom = inv.inviterId;
          }
        }
      } catch (err) {
        console.error('Failed to load invite', err);
      }
    }

    if (giftFrom && inviteValid) {
      try {
        const inviterSnap = await getDoc(doc(db, 'profiles', giftFrom));
        if (!inviterSnap.exists() || (inviterSnap.data().premiumInvitesUsed || 0) >= 10) {
          giftFrom = null;
          inviteValid = false;
        }
      } catch (err) {
        console.error('Failed to verify inviter', err);
        giftFrom = null;
        inviteValid = false;
      }
    }

    const trimmedEmail = cred.user.email || '';
    const age = parsedBirthday ? getAge(parsedBirthday) : 18;
    const profile = {
      id,
      name: trimmedNameFinal,
      city: trimmedCityFinal,
      email: trimmedEmail,
      gender,
      interest: gender === 'Kvinde' ? 'Mand' : 'Kvinde',
      birthday: parsedBirthday,
      age,
      ageRange: [Math.max(18, age - 10), age + 10],
      language: lang,
      preferredLanguages: [lang],
      allowOtherLanguages: true,
      videoClips: [],
      interests: []
    };

    if (giftFrom && inviteValid) {
      const now = getCurrentDate();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 3);
      profile.subscriptionActive = true;
      profile.subscriptionPurchased = now.toISOString();
      profile.subscriptionExpires = expiry.toISOString();
      profile.subscriptionTier = 'silver';
      profile.boostMonth = now.toISOString().slice(0,7);
      profile.boostsUsed = 0;
      profile.giftedBy = giftFrom;
      try {
        await updateDoc(doc(db, 'profiles', giftFrom), { premiumInvitesUsed: increment(1) });
      } catch (err) {
        console.error('Failed to update inviter', err);
      }
    }

    try {
      await finalizeRegistration(id, profile, cred.user.uid, inviteId, inviteValid, giftFrom, provider);
      setPendingProvider(null);
    } catch (err) {
      console.error('Finalize registration failed', err);
      setRegisterErrorMsg('registerFailed');
      setRegisterError(true);
    }
  };

  const handleGoogleRegister = () => {
    if (!showRegister) {
      setPendingProvider('google');
      setRegisterStep(2);
      setShowRegister(true);
      setShowRegisterChoice(false);
      return;
    }
    setPendingProvider('google');
    registerWithGoogle();
  };

  const startRegister = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setTriedSubmit(true);
      setShowMissingFields(true);
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await sendEmailVerification(cred.user);
      setPendingUid(cred.user.uid);
      setRegisterStep(2);
    } catch (err) {
      console.error('Failed to create user', err);
      if (err?.code === 'auth/email-already-in-use') {
        setRegisterErrorMsg('registerEmailExists');
      } else {
        setRegisterErrorMsg('registerFailed');
      }
      setRegisterError(true);
    }
  };

  const completeRegistration = async () => {
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedEmail = email.trim();
    const parsedBirthday = birthdayInput ? parseBirthday(birthdayInput) : '';
    if (!trimmedName || !trimmedCity || !parsedBirthday) {
      setTriedSubmit(true);
      setShowMissingFields(true);
      return;
    }
    if (!parsedBirthday) {
      setTriedSubmit(true);
      setShowBirthdayError(true);
      return;
    }
    setBirthday(parsedBirthday);
    if (getAge(parsedBirthday) < 18) {
      setShowAgeError(true);
      return;
    }

    const id = Date.now().toString();
    const params = new URLSearchParams(window.location.search);
    let giftFrom = params.get('gift');
    const inviteId = params.get('invite');

    let inviteValid = false;
    if (inviteId) {
      try {
        const snap = await getDoc(doc(db, 'invites', inviteId));
        if (snap.exists()) {
          const inv = snap.data();
          if (!inv.accepted && (!giftFrom || giftFrom === inv.inviterId)) {
            inviteValid = true;
            if (!giftFrom && inv.gift) giftFrom = inv.inviterId;
          }
        }
      } catch (err) {
        console.error('Failed to load invite', err);
      }
    }

    if (giftFrom && inviteValid) {
      try {
        const inviterSnap = await getDoc(doc(db, 'profiles', giftFrom));
        if (!inviterSnap.exists() || (inviterSnap.data().premiumInvitesUsed || 0) >= 10) {
          giftFrom = null;
          inviteValid = false;
        }
      } catch (err) {
        console.error('Failed to verify inviter', err);
        giftFrom = null;
        inviteValid = false;
      }
    }
    const age = birthday ? getAge(birthday) : 18;
    const profile = {
      id,
      name: trimmedName,
      city: trimmedCity,
      email: trimmedEmail,
      gender,
      interest: gender === 'Kvinde' ? 'Mand' : 'Kvinde',
      birthday,
      age,
      ageRange: [Math.max(18, age - 10), age + 10],
      language: lang,
      preferredLanguages: [lang],
      allowOtherLanguages: true,
      videoClips: [],
      interests: []
    };
    if (giftFrom && inviteValid) {
      const now = getCurrentDate();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 3);
      profile.subscriptionActive = true;
      profile.subscriptionPurchased = now.toISOString();
      profile.subscriptionExpires = expiry.toISOString();
      profile.subscriptionTier = 'silver';
      profile.boostMonth = now.toISOString().slice(0,7);
      profile.boostsUsed = 0;
      profile.giftedBy = giftFrom;
      try {
        await updateDoc(doc(db, 'profiles', giftFrom), { premiumInvitesUsed: increment(1) });
      } catch (err) {
        console.error('Failed to update inviter', err);
      }
    }
    try {
      await finalizeRegistration(id, profile, pendingUid, inviteId, inviteValid, giftFrom, 'password');
    } catch (err) {
      console.error('Finalize registration failed', err);
      setRegisterErrorMsg('registerFailed');
      setRegisterError(true);
    }
  };
  return React.createElement(
    React.Fragment,
    null,
    showMissingFields && React.createElement(InfoOverlay, {
      title: t('missingFieldsTitle'),
      onClose: () => setShowMissingFields(false)
    },
      React.createElement('p', null, t('missingFieldsDesc'))
    ),
    showAgeError && React.createElement(InfoOverlay, {
      title: t('register'),
      onClose: () => setShowAgeError(false)
    },
      React.createElement('p', { className:'text-center' }, 'Du skal v\u00e6re mindst 18 \u00e5r for at bruge appen')
    ),
    showBirthdayError && React.createElement(InfoOverlay, {
      title: t('register'),
      onClose: () => setShowBirthdayError(false)
    },
      React.createElement('p', { className:'text-center' }, 'Ugyldigt datoformat. Brug dd.mm.\u00e5\u00e5\u00e5\u00e5')
    ),
    showCreated && React.createElement(InfoOverlay, {
      title: t('register'),
      onClose: () => { setShowCreated(false); onLogin(createdId); }
    },
      React.createElement('p', { className:'text-center' }, createdMsg)
    ),
    registerError && React.createElement(InfoOverlay, {
      title: t('register'),
      onClose: () => { setRegisterError(false); setRegisterErrorMsg(''); }
    },
      React.createElement('p', { className:'text-center' }, t(registerErrorMsg || 'registerFailed'))
    ),
    loginError && React.createElement(InfoOverlay, {
      title: t('login'),
      onClose: () => setLoginError(false)
    },
      React.createElement('p', { className:'text-center' }, t('loginFailed'))
    ),
    showForgot && React.createElement(ForgotPasswordOverlay, {
      onClose: () => setShowForgot(false)
    }),
    React.createElement(Card, { className: 'p-6 m-4 shadow-xl bg-white/90' },
      showRegister ? (
        registerStep === 1 && !pendingProvider ? (
          React.createElement(React.Fragment, null,
            React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('register')),
            React.createElement('label', { className:'block mb-1' }, t('email')),
            React.createElement(Input, {
              type: 'email',
              className: `border p-2 mb-2 w-full ${triedSubmit && !email.trim() ? 'border-red-500' : ''}`,
              value: email,
              onChange: e => setEmail(e.target.value),
              placeholder: 'you@example.com',
              name: 'email',
              autoComplete: 'email',
              required: true
            }),
            React.createElement('label', { className:'block mb-1' }, t('password')),
            React.createElement(Input, {
              type: 'password',
              className: `border p-2 mb-2 w-full ${triedSubmit && !password ? 'border-red-500' : ''}`,
              value: password,
              onChange: e => setPassword(e.target.value),
              placeholder: '********',
              required: true
            }),
            React.createElement('p', { className:'text-xs text-gray-500 mb-2' }, t('emailPrivate')),
            React.createElement('div', { className: 'flex justify-between' },
              React.createElement(Button, {
                onClick: startRegister,
                className: 'bg-pink-500 text-white'
              }, t('next')),
              React.createElement(Button, {
                variant: 'outline',
                onClick: () => { setShowRegister(false); setShowRegisterChoice(true); setRegisterStep(1); }
              }, t('cancel'))
            )
          )
        ) : (
          React.createElement(React.Fragment, null,
            React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('getToKnowYou')),
            !pendingProvider && React.createElement('p', { className:'mb-2 text-center text-sm text-gray-600' }, t('verifyEmail')),
            React.createElement('label', { className:'block mb-1' }, t('firstName')),
            React.createElement(Input, {
              className: `border p-2 mb-2 w-full ${triedSubmit && !name.trim() ? 'border-red-500' : ''}`,
              value: name,
              onChange: e => setName(e.target.value),
              placeholder: 'Fornavn',
              name: 'given-name',
              autoComplete: 'given-name',
              required: true
            }),
            React.createElement('label', { className:'block mb-1' }, t('city')),
            React.createElement('input', {
              className: `border p-2 mb-2 w-full ${triedSubmit && !city.trim() ? 'border-red-500' : ''}`,
              value: city,
              onChange: e => setCity(e.target.value),
              placeholder: 'By',
              name: 'city',
              autoComplete: 'address-level2',
              required: true
            }),
            React.createElement('label', { className:'block mb-1' }, t('birthday')),
            React.createElement(Input, {
              type: 'text',
              className: `border p-2 mb-2 w-full ${triedSubmit && !birthday ? 'border-red-500' : ''}`,
              value: birthdayInput,
              onChange: handleBirthdayChange,
              placeholder: 'dd.mm.yyyy',
              required: true
            }),
            React.createElement('label', { className:'block mb-1' }, t('gender')),
            React.createElement('select', {
              className: 'border p-2 mb-4 w-full',
              value: gender,
              onChange: e => setGender(e.target.value)
            },
              React.createElement('option', { value: 'Kvinde' }, 'Kvinde'),
              React.createElement('option', { value: 'Mand' }, 'Mand')
            ),
            !pendingProvider ? (
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement(Button, {
                  onClick: completeRegistration,
                  className: 'bg-pink-500 text-white'
                }, t('register')),
                React.createElement(Button, {
                  variant: 'outline',
                  onClick: () => { setShowRegister(false); setShowRegisterChoice(true); setRegisterStep(1); }
                }, t('cancel'))
              )
            ) : (
              React.createElement(React.Fragment, null,
                React.createElement(Button, {
                  className: 'mt-4 w-full bg-gray-500 text-white',
                  onClick: handleGoogleRegister
                }, t('registerGoogle')),
                React.createElement(Button, {
                  variant: 'outline',
                  className: 'mt-2 w-full',
                  onClick: () => { setShowRegister(false); setShowRegisterChoice(true); setPendingProvider(null); setRegisterStep(1); }
                }, t('cancel'))
              )
            )
          )
        )
      ) : showRegisterChoice ? (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('register')),
        React.createElement(Button, {
          className: 'bg-gray-500 text-white w-full mb-2',
          onClick: handleGoogleRegister
        }, t('registerGoogle')),
        React.createElement(Button, {
          className: 'bg-pink-500 text-white w-full',
          onClick: () => { setShowRegister(true); setShowRegisterChoice(false); setRegisterStep(1); }
        }, t('useEmail')),
        React.createElement(Button, {
          variant: 'outline',
          className: 'mt-2 w-full',
          onClick: () => setShowRegisterChoice(false)
        }, t('cancel'))
      )
    ) : showLoginForm ? (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, t('login')),
        React.createElement('label', { className:'block mb-1' }, t('email')),
        React.createElement(Input, {
          className: 'border p-2 mb-2 w-full',
          value: loginUser,
          onChange: e => setLoginUser(e.target.value)
        }),
        React.createElement('label', { className:'block mb-1' }, t('password')),
        React.createElement(Input, {
          type: 'password',
          className: 'border p-2 mb-4 w-full',
          value: loginPass,
          onChange: e => setLoginPass(e.target.value)
        }),
        React.createElement('div', { className: 'flex justify-between' },
          React.createElement(Button, {
            onClick: handleLogin,
            className: `bg-pink-500 text-white${loggingIn ? ' opacity-50 cursor-not-allowed' : ''}`,
            disabled: loggingIn
          }, loggingIn ? React.createElement(React.Fragment, null,
            React.createElement(Loader2, { className: 'animate-spin inline-block w-4 h-4 mr-2 text-white' }),
            t('loggingIn')
          ) : t('login')),
          React.createElement(Button, {
            variant:'outline',
            onClick: () => setShowLoginForm(false),
            disabled: loggingIn
          }, t('cancel'))
        ),
        React.createElement(Button, {
          type: 'button',
          className: 'mt-2 text-blue-600 underline bg-transparent border-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed',
          onClick: () => setShowForgot(true),
          disabled: loggingIn
        }, t('forgotPassword')),
        React.createElement(Button, {
          className: `mt-6 bg-gray-500 text-white w-full${loggingIn ? ' opacity-50 cursor-not-allowed' : ''}`,
          onClick: handleGoogleLogin,
          disabled: loggingIn
        }, loggingIn ? t('loggingIn') : t('loginGoogle')),
        
      )
    ) : (
      React.createElement(React.Fragment, null,
        React.createElement('h1', { className: 'text-3xl font-bold mb-4 text-pink-600 text-center' }, 'Om RealDate'),
        React.createElement('p', { className: 'mb-4 text-gray-700' },
          'Velkommen til en ny måde at date på. Her er fokus på at finde den personen med den rigtige energi. Det gør vi gennem lyd og video fremfor billeder.'+
          'Her handler det ikke om hurtige swipes.' +
          'RealDate er for dig, der søger noget ægte og meningsfuldt.'
        ),

        React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Button, {
            className: 'bg-pink-500 text-white',
            onClick: () => setShowLoginForm(true)
          }, t('login')),
          React.createElement(Button, {
            className: 'bg-pink-500 text-white',
            onClick: () => { setShowRegisterChoice(true); setName(''); setCity(''); }
          }, t('register'))
        )
      )
    )
  ));
}
