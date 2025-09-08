// FIX: Define the CVData, WorkExperience, and Education types.
// This resolves module not found errors in components that import these types.
export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  linkedIn: string;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface TranslationResponse {
  translation: string;
  glossary: GlossaryItem[];
}

export interface EditingStep {
  name: string;
  description: string;
  parameters: string;
}

export interface EditingPlan {
  steps: EditingStep[];
  estimated_compute: {
    gpu_seconds: number;
  };
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  outline: string[];
  article: string;
  seoKeywords: string[];
  hashtags: string[];
}