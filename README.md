# EduAnalytics-AI

AI-Powered Indian College Admission Advisory Platform.

## Tech Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (Inspire Theme)
- **Firebase** (Auth, Firestore)
- **Groq AI** (Llama-3.3-70b-versatile)
- **Cloudinary** (Avatar Management)
- **Framer Motion** (Premium Animations)

## Key Features
- **Smart Interview**: Multi-step adaptive flow to collect student data.
- **AI Matching**: Context-aware college suggestions with match scores.
- **District-aware**: Prioritizes colleges near your hometown.
- **Safety/Dream Matches**: Cutoff range selection (±10).
- **Session History**: Track all your past AI suggestions.
- **Contact Expert**: Reach out to admission consultants via WhatsApp/Email.

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_id

   GROQ_API_KEY=your_groq_key

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=eduanalytics_avatars
   ```
4. **Firebase Setup**:
   - Enable Email/Password & Google Auth.
   - Create a Firestore Database.
   - Set up rules for `users`, `interviews`, and `contacts` collections.
5. **Run Locally**:
   ```bash
   npm run dev
   ```
6. **Deployment**:
   Push to Vercel for automatic deployment.

## Project Structure
- `/src/app`: Routes and Pages
- `/src/components`: UI Components
- `/src/context`: Auth State Management
- `/src/lib`: External Client Configs (Firebase, Groq)
- `/src/data`: Static Data (Districts, etc.)
- `/src/types`: TypeScript Definitions

---
Built with ❤️ for ambitious students.
Every rank has a college. Let's find yours.
