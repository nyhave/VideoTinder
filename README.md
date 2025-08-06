# RealDate

RealDate is a small prototype for experimenting with a slower approach to online dating.
The **VideotpushApp** demonstrates daily video discovery, chat, reflection notes
and simple profile management powered by Firebase. The code is hosted on
[GitHub](https://github.com/nyhave/VideoTinder) and the live demo is served from
GitHub Pages. Serverless functions for push notifications and scoring run on Netlify.

The home page is available at <https://videotpush.netlify.app/> and the app runs from <https://nyhave.github.io/VideoTinder/>.

For more background on the guiding principles, see [Vision for "Dagens profiler"](docs/top-management/vision.md).
Der findes også en dansk [beskrivelse af appens sider](docs/marketing/app-pages-da.md).
Profiles are presented as short episodes rather than a catalog of faces. Each episode guides you through introduction, a behind-the-scenes prompt answer, a glimpse of daily life and space for your reaction.

## Features

* Daily discovery of short video clips (up to 3 or 6 with subscription)
* Option to buy 3 extra clips for the day
* Profiles open as short episodes over three days: reflection, reaction and finally the option to match
* Rate each profile with up to four stars or add a short reflection. You can do either one independently, and if both are added they appear together in your daily reflections (ratings are private)
* Give three or four stars to keep the profile from expiring
* Monthly subscriptions with visible expiration date and stored purchase date
* Basic chat between matched profiles with option to unmatch
* Improved chat layout with timestamps for better readability
* Typing indicators show when the other person is composing a message
* Celebration overlay when two profiles match
* Calendar for daily reflections
* Minimal profile settings and admin mode
* Delete your account from the settings page
* Preferred languages with option to allow other languages
* Choose up to five personal interests in profile settings
* Profile pictures and video clips cached for offline viewing
* Push-notifications when new clips are ready with configurable do-not-disturb period and per-type preferences
* Premium page showing who liked you (subscription required)
* Invite friends with a shareable link
* Seed data includes 11 mandlige profiler der matcher standardbrugeren så du kan teste premium og ekstra klip
* Super likes let you signal strong interest and improve match rates
* Boost your profile for increased visibility (1, 2 or 4 times per month depending on subscription)
* Incognito mode allows subscribers to browse profiles anonymously
* Video creation tools add background music and support longer uploads
* Videoklip begrænset til 10 sekunder (op til 25 sekunder med premium)
  (optagelser lidt over grænsen accepteres for at håndtere kodningsforsinkelser)
* Animation med nedtælling viser hvor lang tid der er tilbage under videooptagelse
* Daglige statistikker gemmes automatisk og vises som grafer i adminområdet
* Statistik over hvor mange gange profiler bliver åbnet
* Graf over antallet af premium invitationer og lagkage over hvor mange der gav oprettelse
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

## Password Reset Setup

If you plan to use the "Forgot password?" link, make sure your Firebase project
is configured for it:

1. Under **Authentication → Sign-in method** enable **Email/Password**.
2. Add your site domain to **Authentication → Settings → Authorized Domains**.
   Without the domain entry, Firebase will silently fail to send reset emails.

To create a production build run:
```bash
npm run build
```
The compiled files will be placed in the `dist` folder. When changes are pushed to `main`, a GitHub Actions workflow builds the project and publishes the site to **GitHub Pages**. The workflow lives in `.github/workflows/build.yml` where the required secrets, including `FUNCTIONS_BASE_URL`, are written to a `.env` file during the build step so the app can call the Netlify functions.



## Manual Function Testing

The admin page contains a dedicated function test screen. Tests are organized in modules so each area can be completed separately. See [docs/developers/function-test-modules.md](docs/developers/function-test-modules.md) for an overview of the modules and how to submit results.

## Automated Screenshots

Screenshots of key routes can be generated with `npm run screenshots`. The
command starts a local server from the `dist/` folder, visits a few routes using
Puppeteer and saves the result in `screenshots/`. This step is run manually on
the development server and no longer executes in the GitHub Pages build.

## Netlify Functions

Push notifications and scoring logic run as Netlify Functions. These functions are hosted on Netlify while the rest of the site lives on GitHub Pages. Configure the following environment variables in **Site settings > Environment variables** on Netlify:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FCM_VAPID_KEY
GOOGLE_APPLICATION_CREDENTIALS
WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY
FUNCTIONS_BASE_URL
```

`FUNCTIONS_BASE_URL` should point to your Netlify site URL (for example `https://videotpush.netlify.app`). It allows the GitHub Pages site to call the functions hosted on Netlify.

VAPID keys are used on both GitHub Pages and Netlify. The Firebase Cloud Messaging key lives in `FCM_VAPID_KEY`, while the standard Web Push keys use `WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY`. During the GitHub Pages build job these secrets are written to a `.env` file so Parcel can embed the Firebase config.
  
## Configuring CORS for Firebase Storage

If you host the app on your own domain, the browser uploads directly
to Firebase Storage. The bucket must allow cross‑origin requests from your
site. If you see errors about CORS or failed preflight requests during video uploads, update the bucket's CORS rules:

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

`netlify/functions/send-push.js` sends FCM messages to tokens stored in Firestore. Trigger it with a `POST` request containing a `body` and optional `title`. You can also pass a `tokens` array to send to specific devices instead of using the stored tokens. Include `"silent": true` to suppress notification sounds.
Any token that FCM reports as **unregistered** or **invalid** will automatically
be removed from the `pushTokens` collection. Each entry also stores the user's operating system, browser **and login method** ("password" or "admin").
Temporary failures no longer delete tokens so testing with multiple recipients does not break subsequent sends.

For iOS PWAs, Safari only supports the standard Web Push API. A separate function (`netlify/functions/send-webpush.js`) sends notifications using VAPID keys defined in `WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY`. Subscriptions are stored in the `webPushSubscriptions` collection along with operating system, browser information and the login method used when registering. Pass `silent: true` to send a Web Push notification without sound.

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
  -d '{"body":"Hello from local","tokens":["YOUR_TOKEN"],"silent":true}'
```

Make sure the Firebase credentials (`FIREBASE_*`) and VAPID keys (`WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY`) are set in your `.env` file so the functions can authenticate.


## Service Worker Cache Updates

To ensure users receive new versions, update the `CACHE_NAME` constant near the top of `public/service-worker.js` whenever cached files change:

```javascript
// Bump the cache name whenever cached files change to ensure
// clients receive the latest versions.
const CACHE_NAME = 'videotpush-v2';
```

Change the value (for example to `videotpush-v2`) when deploying a new build. During activation the service worker deletes caches that do not match this name:

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});
```

Old resources are removed automatically and clients load the updated assets on the next visit.

## Planned Payment Integration

Payment processing is not yet active while testers explore the current prototype. When we enable payments, we expect to handle transactions through [Stripe](https://dashboard.stripe.com/register). For now, please ignore any payment flows.
Stribe can be integrated with Firebase Auth. See Firebase Auth and click Extensions

