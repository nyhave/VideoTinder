# RealDate

RealDate is a small prototype for experimenting with a slower approach to online dating.
The **VideotpushApp** demonstrates daily video discovery, chat, reflection notes
and simple profile management powered by Firebase. The code is hosted on
[GitHub](https://github.com/nyhave/videotpush) and the live demo is served from
GitHub Pages. Serverless functions for push notifications and scoring run on Netlify.

For more background on the guiding principles, see [Vision for "Dagens profiler"](docs/vision.md).
Profiles are presented as short episodes rather than a catalog of faces. Each episode guides you through introduction, a behind-the-scenes prompt answer, a glimpse of daily life and space for your reaction.

## Features

* Daily discovery of short video clips (up to 3 or 6 with subscription)
* Option to buy 3 extra clips for the day
* Profiles open as short episodes over three days: reflection, reaction and finally the option to match
* Rate each profile with up to three stars when writing your reflection (ratings are private)
* Monthly subscriptions with visible expiration date and stored purchase date
* Basic chat between matched profiles with option to unmatch
* Improved chat layout with timestamps for better readability 
* Celebration overlay when two profiles match
* Calendar for daily reflections
* Minimal profile settings and admin mode
* Preferred languages with option to allow other languages
* Choose up to five personal interests in profile settings
* Profile pictures, audio clips and video clips cached for offline viewing
* Push-notifications when new clips are ready with configurable do-not-disturb period and per-type preferences
* Premium page showing who liked you (subscription required)
* Invite friends with a shareable link
* Seed data includes 11 mandlige profiler der matcher standardbrugeren så du kan teste premium og ekstra klip
* Video- og lydklip begrænset til 10 sekunder
  (optagelser lidt over 10s accepteres for at håndtere kodningsforsinkelser)
* Animation med nedtælling viser hvor lang tid der er tilbage under lyd- og videooptagelse
* Daglige statistikker gemmes automatisk og vises som grafer i adminområdet
* Statistik over hvor mange gange profiler bliver åbnet
* Graf over antallet af premium invitationer
* Graf over antallet af \u00E5bne fejl pr. dag
* Matchlog kan åbnes fra adminområdet
* Mulighed for at følge log for en specifik bruger


## Farvetema

Appen bruger generelt en rød/lyserød farveskala. Adminknapperne er blå, mens premium-funktioner er gule.

## Designretningslinjer

* Profilbilleder og ikoner er firkantede med let afrundede hjørner for et blødt udtryk
* Layoutet holdes simpelt med brug af Tailwind CSS utility-klasser
* Farverne følger temaet med pink som primær accentfarve
* Komponenter bør have god luft omkring sig for at sikre læsbarhed

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
The compiled files will be placed in the `dist` folder. When changes are pushed to `main`, a GitHub Actions workflow builds the project and publishes the site to **GitHub Pages**. The workflow lives in `.github/workflows/build.yml` where the required secrets, including `FUNCTIONS_BASE_URL`, are written to a `.env` file during the build step so the app can call the Netlify functions.

Dette er en test af workflow.

## Netlify Functions

Push notifications and scoring logic run as Netlify Functions. These functions are hosted on Netlify while the rest of the site lives on GitHub Pages. Configure the following environment variables in **Site settings > Environment variables** on Netlify:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
GOOGLE_APPLICATION_CREDENTIALS
WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY
FUNCTIONS_BASE_URL
```

`FUNCTIONS_BASE_URL` should point to your Netlify site URL (for example `https://videotpush.netlify.app`). It allows the GitHub Pages site to call the functions hosted on Netlify.

VAPID KEYS are used on both Github Pages and Netlify in both environments that are created as secrets. During the GitHub Pages build job, these secrets are written to a `.env` file so Parcel can embed the Firebase config.
  
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

Firebase Cloud Messaging delivers updates on Android and desktop browsers. Notifications are sent using the HTTP **v1** API authenticated with a service account. Provide the service account path via `GOOGLE_APPLICATION_CREDENTIALS` or store the JSON in `FIREBASE_SERVICE_ACCOUNT_JSON`.
The Netlify functions automatically read these variables and initialize the Firebase Admin SDK if present.

`netlify/functions/send-push.js` sends FCM messages to tokens stored in Firestore. Trigger it with a `POST` request containing a `body` and optional `title`. You can also pass a `tokens` array to send to specific devices instead of using the stored tokens.

For iOS PWAs, Safari only supports the standard Web Push API. A separate function (`netlify/functions/send-webpush.js`) sends notifications using VAPID keys defined in `WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY`. Subscriptions are stored in the `webPushSubscriptions` collection.

The helper page (`netlify/functions/test-push.html`) posts data to `/.netlify/functions/send-push` for FCM tokens. To test Web Push on iOS, post to `/.netlify/functions/send-webpush` instead.

When notifications are received in the browser, the service worker now broadcasts a `PUSH_RECEIVED` message. The app listens for this event and stores a log entry in the `textLogs` collection when extended logging is enabled. This makes it easier to confirm that pushes arrive on the device.

From the admin screen you can send a notification that triggers **both** functions so that users receive updates regardless of whether they registered for FCM or standard Web Push.

## Local Push Testing

To try push notifications locally, run the Netlify functions on your machine. First install the Netlify CLI:

```bash
npm install -g netlify-cli
```

Then start the dev server:

```bash
netlify dev
```

The functions will be available at `http://localhost:8888`. You can send a test push with a `POST` request:

```bash
curl -X POST http://localhost:8888/.netlify/functions/send-push \
  -H "Content-Type: application/json" \
  -d '{"body":"Hello from local","tokens":["YOUR_TOKEN"]}'
```

Make sure the Firebase credentials (`FIREBASE_*`) and VAPID keys (`WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY`) are set in your `.env` file so the functions can authenticate.


## Planned Payment Integration

Payment processing is not yet active while testers explore the current prototype. When we enable payments, we expect to handle transactions through [Stripe](https://dashboard.stripe.com/register). For now, please ignore any payment flows.

