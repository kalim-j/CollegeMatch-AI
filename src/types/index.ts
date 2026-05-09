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
  city?: string;
  marks10thBoard?: string;
  marks10th?: number;
  percentage10th?: number;
  marks12thBoard?: string;
  marks12th?: number;
  percentage12th?: number;
  ugCgpa?: number;
  jeePercentile?: string;
  boardPercentage?: string;
  preferredCourse?: string;
  cutoffMark?: number;
  cutoffRange?: '-10' | 'exact' | '+10';
  budget?: 'Government' | 'Private' | 'Both';
  quota?: string;
  religion?: string;
  phone?: string;
  createdAt: any;
}

export interface College {
  id: number;
  name: string;
  location: string;
  state: string;
  type: 'Government' | 'Private' | 'Deemed' | 'Autonomous';
  course: string;
  cutoff_general: number;
  cutoff_obc: number;
  cutoff_sc: number;
  cutoff_st: number;
  avg_package_lpa: number;
  max_package_lpa: number;
  seats: number;
  nirf_rank: number;
  website: string;
  // Keep these for AI generated response compatibility
  match_score?: number;
  why_fit?: string;
  level?: string;
  courses?: string[];
  naac_grade?: string;
  fees_approx?: string;
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
