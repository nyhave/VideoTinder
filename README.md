# RealDate

RealDate is a small prototype for experimenting with a slower approach to online dating.
The **RealDateApp** demonstrates daily video discovery, chat, reflection notes
and simple profile management powered by Firebase.

## Features

* Daily discovery of short video clips (up to 3 or 6 with subscription)
* Option to buy 3 extra clips for the day
* Monthly subscriptions with visible expiration date
* Basic chat between matched profiles with option to unmatch
* Celebration overlay when two profiles match
* Calendar for daily reflections
* Minimal profile settings and admin mode
* Preferred languages with option to allow other languages
* Profile pictures cached for offline viewing
* Premium page showing who liked you (subscription required)
* Seed data includes 11 mandlige profiler der matcher standardbrugeren så du kan teste premium og ekstra klip
* Video- og lydklip begrænset til 10 sekunder
  (optagelser lidt over 10s accepteres for at håndtere kodningsforsinkelser)
* Animation med nedtælling viser hvor lang tid der er tilbage under lyd- og videooptagelse


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
The compiled files will be placed in the `dist` folder. When changes are pushed to `main`, a GitHub Actions workflow builds the project and deploys the contents of `dist` to GitHub Pages automatically.

Dette er en test af workflow.

## GitHub Pages Deployment

Before the workflow can build the site, you must provide your Firebase credentials as repository secrets. Define these secrets in **Settings > Secrets and variables**:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

During the build job, these secrets are written to a `.env` file so Parcel can embed the Firebase config.

## Configuring CORS for Firebase Storage

If you host the app on a domain like GitHub Pages, the browser uploads directly
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
