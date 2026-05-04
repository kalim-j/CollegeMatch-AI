export type CourseLevel = 'UG' | 'PG';

export type UGStream = 
  | 'Engineering' | 'Medical' | 'Arts & Science' | 'Commerce' | 'Law' 
  | 'Agriculture' | 'Architecture' | 'Pharmacy' | 'Nursing' | 'Education' 
  | 'Hotel Management' | 'Design' | 'MBA (Integrated)' | 'Other';

export type PGStream = 
  | 'ME/MTech' | 'MD/MS' | 'MSc' | 'MA' | 'MBA' | 'MCA' | 'LLM' 
  | 'MPharm' | 'MEd' | 'Other';

export interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  courseLevel?: CourseLevel;
  stream?: string;
  state?: string;
  district?: string;
  marks10th?: number;
  percentage10th?: number;
  marks12th?: number;
  percentage12th?: number;
  cutoffMark?: number;
  cutoffRange?: '-10' | 'exact' | '+10';
  budget?: 'Government' | 'Private' | 'Both';
  quota?: string;
  createdAt: any;
}

export interface College {
  name: string;
  location: string;
  state: string;
  type: 'Government' | 'Private' | 'Deemed' | 'Autonomous';
  level: 'UG' | 'PG';
  courses: string[];
  cutoff_mark: number;
  match_score: number;
  why_fit: string;
  ranking: string;
  naac_grade: string;
  contact_url: string;
}

export interface InterviewSession {
  id: string;
  uid: string;
  timestamp: any;
  createdAt?: string;
  studentProfile: Partial<StudentProfile>;
  results: College[];
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt: any;
}
