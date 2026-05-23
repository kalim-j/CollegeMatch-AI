export type StreamRecommendation = {
  rank: number;
  stream: string;
  short_name: string;
  match_score: number;
  why_fits: string;
  career_paths: string[];
  top_companies: string[];
  average_salary: string;
  course_duration: string;
  difficulty_level: string;
  entrance_exams: string[];
  best_for_personality: string;
  inspirational_quote: string;
  famous_people: string[];
  next_step: string;
};

export type DiscoveryResult = {
  overall_personality: string;
  strength_summary: string;
  encouragement: string;
  streams: StreamRecommendation[];
};

export type StreamDetails = {
  stream: string;
  tagline: string;
  what_is_it: string;
  what_you_study: string[];
  year_by_year: {
    year: string;
    focus: string;
    highlights: string[];
  }[];
  career_paths: {
    title: string;
    description: string;
    salary: string;
    growth: string;
  }[];
  pros: string[];
  cons: string[];
  myths: {
    myth: string;
    truth: string;
  }[];
  day_in_life: string;
  skills_needed: string[];
  entrance_exams: {
    name: string;
    level: string;
    difficulty: string;
  }[];
  top_colleges_india: string[];
  is_right_for_you: {
    yes_if: string[];
    no_if: string[];
  };
  salary_growth: {
    stage: string;
    range: string;
  }[];
};
