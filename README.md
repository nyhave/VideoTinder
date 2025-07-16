# Videotpush

Videotpush is a small prototype for experimenting with a slower approach to online dating.
The **VideotpushApp** demonstrates daily video discovery, chat, reflection notes
and simple profile management powered by Firebase. The code is hosted on
[GitHub](https://github.com/nyhave/videotpush) and a live demo is available at
[https://videotpush.netlify.app](https://videotpush.netlify.app/).

## Features

* Daily discovery of short video clips (up to 3 or 6 with subscription)
* Option to buy 3 extra clips for the day
* Monthly subscriptions with visible expiration date and stored purchase date
* Basic chat between matched profiles with option to unmatch
* Improved chat layout with timestamps for better readability
* Celebration overlay when two profiles match
* Calendar for daily reflections
* Minimal profile settings and admin mode
* Preferred languages with option to allow other languages
* Choose up to five personal interests in profile settings
* Profile pictures, audio clips and video clips cached for offline viewing
* Premium page showing who liked you (subscription required)
* Seed data includes 11 mandlige profiler der matcher standardbrugeren så du kan teste premium og ekstra klip
* Video- og lydklip begrænset til 10 sekunder
  (optagelser lidt over 10s accepteres for at håndtere kodningsforsinkelser)
* Animation med nedtælling viser hvor lang tid der er tilbage under lyd- og videooptagelse
* Daglige statistikker gemmes automatisk og vises som grafer i adminområdet
* Statistik over hvor mange gange profiler bliver åbnet
* Graf over antallet af \u00E5bne fejl pr. dag
* Matchlog kan åbnes fra adminområdet


## Farvetema

Appen bruger generelt en rød/lyserød farveskala. Adminknapperne er blå, mens premium-funktioner er gule.

## Getting Started

1. Copy `.env.example` to `.env` and fill in your Firebase credentials.
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (typically http://localhost:1234) in your browser.
5. Sign up with your name to start swiping.

To create a production build run:
```bash
npm run build
```
The compiled files will be placed in the `dist` folder. When changes are pushed to `main`, Netlify automatically builds the project and deploys the site to [https://videotpush.netlify.app](https://videotpush.netlify.app/).

Dette er en test af workflow.

## Netlify Deployment

Before Netlify can build the site, you must provide your Firebase credentials as environment variables under **Site settings > Environment variables**:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
GOOGLE_APPLICATION_CREDENTIALS
```

During the build job, these secrets are written to a `.env` file so Parcel can embed the Firebase config.

## Configuring CORS for Firebase Storage

If you host the app on your own domain, the browser uploads directly
to Firebase Storage. The bucket must allow cross‑origin requests from your
site. If you see errors about CORS or failed preflight requests during video or
audio uploads, update the bucket's CORS rules:

1. Edit the provided `cors.json` and replace the example origin with your
   domain.
2. Apply the settings with the Google Cloud SDK:

```bash
gsutil cors set cors.json gs://<your-storage-bucket>
```

After this configuration, uploads from your site will succeed without CORS
errors.

## Development Notes

The profile filtering logic used on the Daily Discovery page lives in `src/selectProfiles.js`. Keeping this code in its own module makes it easy to reuse the same logic in a Netlify Function when needed. Netlify Functions run on Node.js with a generous free plan, so the helper can be moved to the server with minimal changes. An example implementation lives in `netlify/functions/select-profiles.js`.

## Push Notifications

This project uses Firebase Cloud Messaging to deliver updates. Notifications are
sent using the HTTP **v1** API, authenticated with a service account. On
Netlify you can either provide the path to your service account JSON via the
`GOOGLE_APPLICATION_CREDENTIALS` environment variable or store the JSON itself in
`FIREBASE_SERVICE_ACCOUNT_JSON`. The legacy `FCM_SERVER_KEY` is no longer used.

In this repository, a Netlify Function (`netlify/functions/send-push.js`) handles
delivery. The function reads stored push tokens from Firestore and uses the
Firebase Admin SDK to send notifications via the v1 API. Trigger it by making a
`POST` request to `/.netlify/functions/send-push` with a JSON body containing a
`body` field and optional `title`.

