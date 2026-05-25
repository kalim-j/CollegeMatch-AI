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
  marks10thOutOf?: number;
  marks10th?: number;
  percentage10th?: number;
  marks10thGrade?: string;
  useCgpa10?: boolean;
  cgpa10?: string | number;
  marks12thBoard?: string;
  marks12thOutOf?: number;
  marks12th?: number;
  percentage12th?: number;
  marks12thGrade?: string;
  useCgpa12?: boolean;
  cgpa12?: string | number;
  marks12SubjectWise?: boolean;
  marks12Subjects?: Record<string, number>;
  ugCgpa?: number;
  jeePercentile?: string;
  boardPercentage?: string;
  preferredCourse?: string;
  physicsMark?: number;
  chemistryMark?: number;
  mathsMark?: number;
  cutoffMark?: number;
  manualCutoffMode?: boolean;
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
  district?: string;
  fees_structure?: {
    ug_annual: number;
    ug_total: number;
    pg_annual?: number;
    pg_total?: number;
    hostel_annual?: number;
  };
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
