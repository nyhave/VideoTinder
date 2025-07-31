# Function Test Modules

The admin page includes a screen for manual function testing. The tests are now grouped so each module can be completed separately.

## Modules

1. **Discovery & Subscriptions** – daily clips, extra clip purchase, subscriptions and premium likes page.
2. **Chat & Reflections** – ratings, chat flow, match celebration and the reflection calendar.
3. **Profile Settings** – editing profile info, language preferences and interests.
4. **Recording & Media** – offline caching, recording limits, countdown timer, reveal animation and PWA installation.
5. **Admin & Statistics** – seed data, profile switching and various admin statistics screens.
6. **Account Access** – create profile, password reset and login flow.
7. **Invitations** – send invites, gift premium access and track invite status.
8. **Realetten Game** – start a game session, invite players and verify the winner overlay appears.

Use the admin menu to open *Funktionstest* and choose a module to start testing. Each feature within a module can be marked as OK or Fail with optional comments and screenshot. Submit results when a module is finished before moving on to the next.

## Example actions

### Discovery & Subscriptions

- Claim the daily clips and confirm the counter decreases.
- Purchase three extra clips and verify they become available.
- Open the premium likes page and confirm your subscription expiration date is shown.

### Chat & Reflections

- Send a chat message to a match and confirm it appears on both devices.
- Trigger the match celebration overlay and make sure it can be dismissed.
- Open the reflection calendar and verify ratings or notes appear on the correct dates.

### Profile Settings

- Change the display name and reload to confirm it persists.
- Update preferred languages and interests.
- Delete the account and ensure a new profile can be created afterwards.

### Recording & Media

- Record a short video and confirm the countdown timer is visible.
- Play the recording and check that the reveal animation runs.
- Install the PWA from the browser menu.
- While offline, open a previously viewed profile to verify clips are cached.

### Admin & Statistics

- Use seed data to recreate the default users.
- Switch between multiple profiles and view their statistics.
- Open recent login methods and general log screens.

### Account Access

- Create a new profile and sign out.
- Request a password reset email and test the reset link.
- Log in again with the updated password.

### Invitations

- Send an invite link to another account and accept it.
- Gift premium access and verify the recipient sees the upgrade.
- Track the invite status from the admin page.

### Realetten Game

- Start a game session and invite at least one player.
- Play through a round and ensure the winner overlay is displayed.

### Offline test

When verifying the **Recording & Media** module, open a profile while online, then switch the device to airplane mode. The previously viewed clips should continue to play and navigation should still work. Return online before continuing with the next module.
After reconnecting, send a chat message to confirm that synchronization resumes properly.
