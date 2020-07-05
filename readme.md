
### SocialApp Firebase Functions

[Full Stack React & Firebase Tutorial - Build a social media app](https://www.youtube.com/watch?v=m_u6P5k0vP0)
---

### Requirements

- Node.JS (>= version 8) and NPM installed 



### Installation

- **Step 1 (download the project)**
<br /> Run "npm i -g firebase-tools" (install Firebase CLI)
<br /> Login "firebase login" (login/logout to the Firebase CLI)
<br /> Clone repository
<br /> cd into the "functions" folder
<br /> Run "npm i" (for installing 'node_modules')

- **Step 2 (add ignored/required files)**
<br /> .firebaserc (project_id information)
<br /> firebase.json (empty JSON object in the file)
<br /> functions/.env (project, web-app environment variables)
<br /> functions/config/firebase-adminsdk-sa-pk.json (Firebase Admin SDK configurations. Generate config file from here: Firebase Console > Settings > Project Settings > Service Accounts)

- **Step 3 (run the project)**
<br /> Run "firebase serve" (for development/local)
<br /> Run "firebase deploy" (for production)

- **Step 4 (use this collection)**
<br /> [Published Postman Collection](https://documenter.getpostman.com/view/1747137/Szt5frC6)

### Resources

- [Firebase console](https://console.firebase.google.com/)           
- [Firebase cloud functions](https://console.cloud.google.com/functions/list?project=_)
- [Firebase hosting enabled (hosting can be set up anytime)](https://firebase.google.com/docs/hosting/?authuser=0)
- [Firebase for web (Get Started)](https://firebase.google.com/docs/web/setup?authuser=0)
- [Firebase for web (Web SDK API Reference)](https://firebase.google.com/docs/reference/js/?authuser=0)
- [Firebase for web (Samples)](https://firebase.google.com/docs/samples/?authuser=0)

- [JS three dots](https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a)
- [NodeJS Firestore where query](https://stackoverflow.com/questions/52104687/why-is-firestore-where-query-not-working)

### Useful Links

- [How to update a single firebase firestore document](https://stackoverflow.com/a/49682615/7574023)
- [Permission denied in Firebase Realtime Database](https://github.com/firebase/quickstart-js/issues/239)
- [Firebase Permission Denied](https://stackoverflow.com/a/37404116/7574023)
- [File upload with filestreams and Firebase cloud functions + cloud storage](https://stackoverflow.com/a/59961640/7574023)
- [Mapping Firebase Auth users to Firestore Documents](https://stackoverflow.com/a/46876181/7574023)
- [Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Security Rules](https://firebase.google.com/docs/rules/get-started?authuser=0)
- [HTTP Error: 401 while setting up firebase cloud functions](https://stackoverflow.com/a/52891586/7574023)

### TODOs

- Fix 'userId' in 'notifications' and 'reactions' collections issue.
- Replace "then-catch" to "async-await".
- Change Firebase server Node version (now it's 8).
- Make all responses with defined standard.

### Author & Contributors

**Start: 16.05.2020**

- [boolfalse](https://github.com/boolfalse)
- [Albert](https://github.com/AlbertHovhannisyan)
- [Arakel](https://github.com/Arakel2811)

