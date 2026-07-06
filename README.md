<div align="center">

  # CollegeMatch-AI

  <p>
    India's #1 AI College Advisor · Built for the Class of 2026
  </p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </div>
</div>

---

## 🌟 Overview

**CollegeMatch-AI** is a next-generation platform designed to revolutionize the way students across India discover, compare, and apply to colleges. Utilizing a custom-built neural network architecture, our platform analyzes historical admissions data, placement statistics, and user preferences to recommend the best possible colleges and scholarships. 

It eliminates the guesswork from the admissions process and helps students maximize their potential.

## ✨ Features

- **🎯 AI College Matcher:** 9 quick questions yield 8 perfectly tailored college matches based on cutoffs, location, and fees.
- **💰 Scholarship Finder:** Tracks over ₹2.5 Crore in available scholarships across NSP, State, and Private platforms.
- **🧮 Live Cutoff Calculator:** Real-time engineering and medical cutoff calculations based on 2026 criteria.
- **⚖️ Smart Comparison:** Side-by-side AI analysis of placements, infrastructure, and ROI for any two colleges.
- **🎨 Immersive 3D Experience:** Beautifully animated backgrounds and interactive elements powered by custom Canvas/Three.js.
- **📱 Responsive & Fast:** Built for modern browsers and mobile devices, providing a seamless user experience.

## 🛠️ Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/)
- **Animations:** Custom HTML5 Canvas
- **Deployment:** [Vercel](https://vercel.com/)

## Architecture
Student Browser
↓
Next.js 14 (Vercel Edge)
↓
API Routes (Serverless)
↓
OpenRouter → LLaMA 3.3 70B
↓
Firebase Firestore

## Getting Started

```bash
# Clone repository
git clone https://github.com/kalim-j/collegematch-ai.git
cd collegematch-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase, OpenRouter, Cloudinary keys

# Run development server
npm run dev

# Or run with Docker
npm run docker:dev
```

## Environment Variables

Create `.env.local` with these keys (see `.env.example`):
OPENROUTER_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

## Deployment

Deployed on Vercel with automatic CI/CD from GitHub.
Every push to `main` triggers a new deployment.

## Developer

**Kalim J** — Full Stack Developer
- GitHub: [@kalim-j](https://github.com/kalim-j)
- LinkedIn: [kalim-j](https://linkedin.com/in/kalim-j)
- Email: kalim.apoffi@gmail.com

---

Made with ❤️ for Indian students — Free forever
