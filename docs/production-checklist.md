# Production Checklist

This document tracks the remaining technical tasks required to deploy the RealDate prototype in a stable production environment.

## 1. Build configuration
- Run `npm install` to install dependencies.
- Build the project with `npm run build` and verify that the generated files in `dist/` work correctly.
- Review `npm audit` results and apply fixes where possible to address critical vulnerabilities.

## 2. Tailwind CSS setup
- Replace usage of `cdn.tailwindcss.com` in `public/index.html` and `public/invite.html`.
- Install Tailwind locally using the Tailwind CLI or as a PostCSS plugin. See the official installation guide: <https://tailwindcss.com/docs/installation>.
- Include the compiled Tailwind CSS in the build output instead of loading it from the CDN.

## 3. Environment variables
- Ensure all Firebase and Netlify environment variables are defined in the deployment environment. See the `README.md` section "Netlify Functions" for the full list.
- Keep production secrets secure by using service-specific secret storage (GitHub Secrets, Netlify environment variables, etc.).

## 4. Storage configuration
- Update `cors.json` with the production domain and apply the settings using the Google Cloud SDK:
  ```bash
  gsutil cors set cors.json gs://<your-storage-bucket>
  ```
- Confirm that uploads work from the production site without CORS errors.

## 5. Deployment pipeline
- Set up the GitHub Actions workflow to build on pushes to the main branch.
- Configure Netlify for serverless functions and verify that `FUNCTIONS_BASE_URL` points to the Netlify domain.

## 6. Domain and HTTPS
- Choose a custom domain for the site and configure DNS records to point to GitHub Pages or another hosting provider.
- Enable HTTPS and HSTS for secure communication.

## 7. Monitoring
- Monitor Firebase and Netlify logs for errors after deployment.
- Periodically review the client and server logs for unexpected issues.

Keep this checklist updated as the project approaches a full production release.
