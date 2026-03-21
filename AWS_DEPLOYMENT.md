# AWS Deployment Guide — Lost & Found Management System

This project is a static web application (HTML + CSS + JS) connected to Firebase.
It can be deployed to the cloud using **AWS Amplify** in a few simple steps.

---

## 🚀 Deploy with AWS Amplify (Recommended)

AWS Amplify is a free-tier eligible service that hosts static web apps with automatic HTTPS, global CDN, and CI/CD.

### Step 1 — Create an AWS Account
1. Go to [https://aws.amazon.com](https://aws.amazon.com) and sign up (free tier available).

### Step 2 — Push Code to GitHub/GitLab
1. Create a new GitHub repository.
2. Push all files from `E:\item.track_cloudproj\` to the repository:
```bash
git init
git add .
git commit -m "Initial commit - Lost and Found App"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3 — Connect to AWS Amplify
1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New App" → "Host Web App"**
3. Choose **GitHub** as your source
4. Select your repository and branch (`main`)
5. Amplify will auto-detect the `amplify.yml` file in your project
6. Click **"Save and Deploy"** — Amplify builds and hosts your app!

### Step 4 — Get your Live URL
After deployment (takes ~2 minutes), Amplify gives you a public HTTPS URL like:
```
https://main.d1abc123xyz.amplifyapp.com
```

---

## 🌐 Alternative: Deploy via AWS S3 + CloudFront

### Step 1 — Create an S3 Bucket
```bash
aws s3 mb s3://lost-and-found-app --region us-east-1
aws s3 website s3://lost-and-found-app --index-document index.html
```

### Step 2 — Upload Files
```bash
aws s3 sync E:\item.track_cloudproj\ s3://lost-and-found-app --acl public-read
```

### Step 3 — Enable CloudFront CDN (Optional)
- Create a CloudFront distribution pointing to your S3 bucket for global fast delivery.

---

## 🔧 Environment Notes
- The app uses **Firebase** for backend (Auth, Firestore, Storage).
- Replace `YOUR_API_KEY` and related values in `app.js` with your actual Firebase config before deploying.
- No server-side code — it is a **100% static app**, ideal for S3/Amplify hosting.

---

## 📦 Files Deployed
| File | Purpose |
|---|---|
| `index.html` | Main application layout |
| `styles.css` | UI styling and animations |
| `app.js` | Firebase integration and app logic |
| `hero.png` | Homepage hero illustration |
| `Headphone_img.jpeg` | Sample lost item image |
| `amplify.yml` | AWS Amplify build config |
