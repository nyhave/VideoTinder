export const modules = [
  {
    name: 'Discovery & Subscriptions',
    features: [
      {
        title: 'Daily discovery of short video clips (up to 3 or 6 with subscription)',
        expected: [
          'New clips become available every day',
          'Free users see up to 3 clips, subscribers see 6',
          'The list resets the next day'
        ],
        action: { label: 'Go to Daily Clips', event: 'dailyClips' }
      },
      {
        title: 'Option to buy 3 extra clips for the day',
        expected: [
          'Purchase button appears once daily clips are used',
          'Buying adds three additional clips',
          'Only one purchase allowed per day'
        ]
      },
      {
        title: 'Monthly subscriptions with visible expiration date',
        expected: [
          'Subscription purchase extends access for 30 days',
          'Expiration date is shown in the profile',
          'Premium features stop working after expiry'
        ]
      },
      {
        title: 'Premium page showing who liked you (subscription required)',
        expected: [
          'Page lists profiles that liked you',
          'Requires an active subscription',
          'List updates when new likes arrive'
        ]
      }
    ]
  },
  {
    name: 'Chat & Reflections',
    features: [
      {
        title: 'Four-star rating stored with each reflection (ratings are private)',
        expected: [
          'Users can select 1-4 stars when writing a reflection',
          'Rating is saved together with the reflection',
          'Ratings are only visible to the user'
        ]
      },
      {
        title: 'Basic chat between matched profiles with option to unmatch',
        expected: [
          'Send a message as one user',
          'Log in as the matched user, reply, and confirm the first user sees it',
          'Unmatching removes the chat for both'
        ],
        action: { label: 'Open Chat', event: 'openChat' }
      },
      {
        title: 'Improved chat layout with timestamps',
        expected: [
          'Each message shows when it was sent',
          'Layout separates messages by sender',
          'View scrolls to newest message'
        ]
      },
      {
        title: 'Celebration overlay when two profiles match',
        expected: [
          'Overlay appears immediately after a match',
          'Confetti animation is shown',
          'Overlay can be dismissed'
        ]
      },
      {
        title: 'Calendar for daily reflections',
        expected: [
          'Calendar view is reachable from the menu',
          'User can add a note for each day',
          'Notes persist when reopening the app'
        ]
      }
    ]
  },
  {
    name: 'Profile Settings',
    features: [
      {
        title: 'Minimal profile settings and admin mode',
        expected: [
          'Settings screen allows editing basic info',
          'Admin mode adds extra controls',
          'Only admins can access the admin menu'
        ],
        action: { label: 'Open Profile', event: 'openProfileSettings' }
      },
      {
        title: 'Preferred languages with option to allow other languages',
        expected: [
          'Users select one or more languages',
          'Enabling "allow other languages" broadens matches',
          'Discovery respects language preferences'
        ]
      },
      {
        title: 'Choose up to five personal interests in profile settings',
        expected: [
          'Interests are selected from a predefined list',
          'Selection is limited to five items',
          'Saved interests appear in the profile'
        ]
      }
    ]
  },
  {
    name: 'Recording & Media',
    features: [
      {
        title: 'Profile pictures, audio clips and video clips cached for offline viewing',
        expected: [
          'Media is stored locally after first view',
          'Cached media plays without network connection',
          'Clearing storage removes cached files'
        ]
      },
      {
        title: 'Video and audio clips limited to 10 seconds',
        expected: [
          'Recording stops after 10 seconds',
          'Longer files are rejected',
          'Countdown shows remaining time'
        ]
      },
      {
        title: 'Countdown animation during recording',
        expected: [
          'Visible timer counts down from 10 seconds',
          'Timer reaches zero as recording ends',
          'Helps users keep clips short'
        ]
      },
      {
        title: 'Reveal animation highlights newly unlocked content',
        expected: [
          'Newly unlocked clips animate into view',
          'Animation draws attention without affecting playback',
          'Timing feels smooth and not distracting'
        ]
      },
      {
        title: 'App works offline after first visit',
        expected: [
          'Switching to airplane mode keeps the app usable',
          'Previously viewed clips still play',
          'Menus and navigation continue to work'
        ]
      },
      {
        title: 'Installable via PWA manifest',
        expected: [
          'Browser offers Add to Home Screen option',
          'Installed app opens in standalone window',
          'Icon matches the manifest'
        ]
      }
    ]
  },
  {
    name: 'Admin & Statistics',
    features: [
      {
        title: 'Seed data includes 11 test profiles matching the default user',
        expected: [
          'Running the seed script creates 11 profiles',
          'All seeded profiles can match the default user',
          'Admin can switch to these profiles'
        ]
      },
      {
        title: 'Switch between user profiles from the admin page',
        expected: [
          'Admin screen lists available test profiles',
          'Selecting a profile switches the current user',
          'Switching back restores admin access'
        ],
        action: { label: 'Open Admin', event: 'openAdmin' }
      },
      {
        title: 'Daily stats saved automatically and shown as graphs in admin',
        expected: [
          'Usage stats are stored each day',
          'Admin page displays graphs of the data',
          'Trends over time are visible'
        ]
      },
      {
        title: 'Statistics on how often profiles are opened',
        expected: [
          'Each profile view increments a counter',
          'Admin can see open counts per profile',
          'Counts reset when the database is reset'
        ]
      },
      {
        title: 'Graph of number of open bugs per day',
        expected: [
          'Bug reports are grouped by date',
          'Graph shows how many are still open',
          'Closing a bug lowers the count'
        ]
      },
      {
        title: 'Match log accessible from admin',
        expected: [
          'Admin screen includes a link to the match log',
          'Log lists all matches with timestamps',
          'Entries are shown in chronological order'
        ]
      }
    ]
  },
  {
    name: 'Account Access',
    features: [
      {
        title: 'Create profile from welcome screen',
        expected: [
          'Registration form validates required fields',
          'Profile is saved in Firestore after sign-up',
          'Success message appears after creating profile'
        ]
      },
      {
        title: 'Login with username and password',
        expected: [
          'Existing user can log in with correct credentials',
          'Invalid credentials show an error message',
          'Successful login opens discovery'
        ],
        action: { label: 'Auto Login', events: ['showLogin','fillLoginUser','fillLoginPass','submitLogin'] }
      },
      {
        title: 'Reset password with "Forgot Password"',
        expected: [
          'Forgot password link opens a form for email',
          'Sending the form emails a reset link',
          'Confirmation is shown after sending'
        ]
      }
    ]
  },
  {
    name: 'Invitations',
    features: [
      {
        title: 'Send invitation with a shareable link',
        expected: [
          'Generating an invite creates a unique link',
          'Link can be copied or shared via the browser',
          'Invite list shows the entered recipient'
        ]
      },
      {
        title: 'Gift 3 months of premium with up to ten invites',
        expected: [
          'Premium gift enabled when invites are available',
          'Remaining gift count is displayed',
          'Gift status updates when the invite is used'
        ]
      },
      {
        title: 'Invite list displays pending and accepted',
        expected: [
          'All created invites are listed',
          'Accepted invites are marked as created',
          'Pending invites remain until your friend signs up'
        ]
      }
    ]
  }
];

