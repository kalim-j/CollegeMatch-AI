export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  city?: string;
  preferredStream?: string;
  createdAt: any;
}

export interface College {
  name: string;
  location: string;
  type: "Govt" | "Private";
  expectedCutoff: string;
  courseRecommendation: string;
  whyFits: string;
  matchScore?: number;
}

export interface InterviewSession {
  id?: string;
  userId: string;
  timestamp: any;
  answers: {
    marks10th: string;
    marks12th: string;
    stream: string;
    budget: string;
    statePreference: string;
  };
  suggestions: College[];
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  timestamp: any;
}
