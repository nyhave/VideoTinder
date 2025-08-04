# Non-GitHub Setup

This project relies on a few services outside of GitHub:

- **GitHub Pages** hosts the compiled app at `https://nyhave.github.io/VideoTinder/`.
- **Netlify** runs serverless functions for push notifications and scoring. Environment variables such as `FIREBASE_API_KEY` and `FUNCTIONS_BASE_URL` are configured in the Netlify site settings.
- **Firebase** provides authentication, Firestore, and Cloud Storage. The storage bucket is configured with CORS rules to allow uploads from the app.

Together these services support features like account management, video uploads, and push notifications beyond what GitHub alone offers.
