# Risk Analysis

This document outlines potential risks in the RealDate/VideoTinder project. It is an initial assessment and should be updated as the project evolves.

## Data Privacy and Security
- **Storage of Personal Data**: The app stores profiles, uploaded media, and chat messages in Firebase. If access controls or rules are misconfigured, unauthorized parties could read or modify this information.
- **Service Account Exposure**: `netlify/functions/send-push.js` loads credentials from either environment variables or a fallback file path. If the credential file is accidentally committed or leaked, attackers could gain access to Firebase services.
- **Push Notification Tokens**: Tokens stored in `pushTokens` may be sensitive. Leaked tokens could allow spamming or tracking users.
- **Local Caching of Media**: The service worker caches videos and photos for offline use (`cacheMedia.js`). On shared devices this may expose private content to other users.
- **Lack of Input Sanitization**: User-generated content (videos, text, chat) could contain malicious scripts if rendered without sanitization, leading to XSS attacks.

## Operational Risks
- **Dependency Vulnerabilities**: The project relies on third-party libraries (Firebase, Parcel, React). Vulnerabilities in these packages could compromise the app if updates are not applied promptly.
- **Build and Deploy Secrets**: GitHub Actions uses secrets to create an `.env` file (`.github/workflows/build.yml`). Mismanaging these secrets may expose Firebase keys or VAPID keys.
- **Netlify Functions Security**: Functions like `send-push.js` and `select-profiles.js` run server-side logic. Insufficient validation or rate limiting could enable abuse or denial-of-service.
- **Data Retention Compliance**: The data retention policy states that user data is deleted within 30 days of account deletion. Failure to enforce this could violate regulations such as GDPR.

## User Safety
- **Inappropriate Content**: Users can upload videos and audio clips. Without moderation, harmful or offensive content may appear on the platform.
- **Harassment or Abuse**: Chat features may be used to harass others. The Terms of Service mention account suspension, but the implementation details are unclear.

## Future Considerations
- **Encryption at Rest**: Confirm whether Firebase storage and Firestore provide sufficient encryption. Consider additional measures for particularly sensitive data.
- **Access Control for Admin Features**: The admin screen exposes many controls. Ensure only authorized users can access it.
- **Rate Limiting and Abuse Prevention**: Add checks in Netlify functions to prevent excessive requests or spam.

