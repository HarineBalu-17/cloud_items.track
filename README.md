**Lost & Found Management System**

FindIt is a premium, cloud-based web application designed to help communities reunite with their lost belongings. Built with a modern dark-themed UI, it features real-time search, secure authentication, and seamless image uploads.

**Features**

1.Premium UI/UX: Modern dark mode design featuring Glassmorphism, tailored HSL color palettes, and smooth CSS micro-animations.
2.Secure Authentication: Integrated with Firebase Auth for reliable email/password sign-in and protected reporting.
3.Image Hosting: Powered by Firebase Storage to allow users to upload photos of lost or found items.
4.Real-time Search: Instant filtering by item name or location to help users find matches quickly.
5.Fully Responsive: Seamless experience across mobile, tablet, and desktop devices.
6.Hybrid Data Mode: Includes a built-in "Mock Mode" for testing without an active Firebase configuration.

**Tech Stack**

Frontend: HTML5, CSS3 (Advanced Grid/Flexbox), JavaScript (ES6+)
Backend-as-a-Service: Firebase v10 (Modular SDK)
Firestore: NoSQL Real-time Database
Auth: User management and security
Storage: Cloud hosting for item images
Deployment: Vercel 

**Installation & Setup**

1.Clone the repository

git clone https://github.com/[Your-GitHub-Username]/FindIt.git
cd FindIt

2.Configure Firebase

  Create a project in the Firebase Console.
  Enable Authentication (Email/Password), Firestore, and Storage.
  Copy your Web App configuration object.
  Open app.js and replace the firebaseConfig placeholder with your credentials:

JavaScript

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

3.Run Locally

Simply open index.html in your browser or use a "Live Server" extension in VS Code.

**Project Structure**

Plaintext
├── index.html          # Main application structure & Modals
├── styles.css          # Glassmorphism UI & Animations
├── app.js              # Firebase logic & Frontend interactions
├── Headphone_img.jpeg  # Asset: Example Lost Item
├── Waterbottle_img.jpeg # Asset: Example Found Item
├── amplify.yml         # Build specification for AWS
└── AWS_DEPLOYMENT.md   # Deployment documentation
** Security Note**
1.To keep your application secure when deploying to the cloud:
2.Firestore Rules: Update your rules to allow writes only for authenticated users.
3.Environment Variables: If using Vercel, store your Firebase keys in Environment Variables rather than hardcoding them in public repositories.

**Contributing**

Contributions are welcome! Feel free to open an issue or submit a pull request.
  Fork the Project
  Create your Feature Branch (git checkout -b feature/AmazingFeature)
  Commit your Changes (git commit -m 'Add some AmazingFeature')
  Push to the Branch (git push origin feature/AmazingFeature)
  Open a Pull Request
  
  <img width="782" height="895" alt="image" src="https://github.com/user-attachments/assets/2ce3c855-5607-40c7-800e-4957db8218d6" />
