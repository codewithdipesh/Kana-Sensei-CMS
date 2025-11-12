# Kana Sensei CMS

Admin UI for Kana Sensei. This repository has been adapted to use client-side Firebase (modular SDK) for Auth and Firestore.

## Firebase setup (local)

1. Copy `.env.local.template` to `.env.local` and fill the NEXT_PUBLIC_FIREBASE_* values from your Firebase project.
2. In Firebase Console > Authentication enable Email/Password sign-in.
3. Create an initial test user in the console or sign up via the app's /login page.
4. Firestore: the app uses collections like `characters`, `lessons`, `chapters`, `pages`. Add sample documents or allow the app to create them.

Then run:

 - npm install
 - npm run dev

Security: see `firestore.rules` in repo for a suggested simple rule requiring authenticated users.
