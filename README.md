# EduAnalytics-AI

A full-stack AI-powered college admission advisory web app built with Next.js 14, Firebase, Groq, and Cloudinary.

## Features
- **AI Interview**: Multi-step adaptive flow for personalized college suggestions.
- **Groq Integration**: Powered by `llama-3.3-70b-versatile` for expert-level Indian college counseling.
- **Firebase Auth**: Google OAuth & Email/Password login.
- **User Dashboard**: Profile management, quick stats, and interview history.
- **Admission Expert Portal**: Direct WhatsApp/Call links and contact form.
- **Cloudinary Storage**: Fast and secure avatar uploads.
- **Premium Design**: Modern UI with Deep Teal aesthetics and smooth animations.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Firebase Firestore & Auth
- **AI Engine**: Groq API
- **Storage**: Cloudinary
- **Deployment**: Vercel

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   GROQ_API_KEY=your_groq_api_key
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=eduanalytics_avatars
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. **Firebase Setup**:
   - Enable Authentication (Email/Password & Google).
   - Create a Firestore database.
   - Set up Firestore rules to allow authenticated users to read/write their own data.
5. **Run the app**:
   ```bash
   npm run dev
   ```

## Deployment
This app is ready for deployment on Vercel. Ensure all environment variables are added to the Vercel project dashboard.
