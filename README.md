# VideoTinder

VideoTinder is a small prototype for experimenting with a slower approach to online dating.
The new **RealDatingApp** demonstrates daily video discovery, chat, reflection notes
and simple profile management powered by Firebase.

## Features

* Daily discovery of short video clips
* Basic chat between matched profiles
* Calendar for daily reflections
* Minimal profile settings and admin mode


## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the provided local URL (typically http://localhost:1234) in your browser.
4. Sign up with your name to start swiping.

To create a production build run:
```bash
npm run build
```
The compiled files will be placed in the `dist` folder. When changes are pushed to `main`, a GitHub Actions workflow builds the project and deploys the contents of `dist` to GitHub Pages automatically.
