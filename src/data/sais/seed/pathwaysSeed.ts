import type { PathwayId } from "@/lib/domain/models/course";

export interface PathwayProfile {
  id: PathwayId;
  label: string;
  description: string;
  keywords: string[]; // used for lightweight matching with interests/careerGoals
}

export const pathwaysSeed: PathwayProfile[] = [
  {
    id: "ai_tech",
    label: "AI / Tech",
    description: "Computing, software, AI, data, and applied technology pathways.",
    keywords: ["ai", "tech", "computer", "coding", "software", "data", "ml", "engineering"],
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Engineering-focused pathways emphasizing math, physics, and applied STEM rigor.",
    keywords: ["engineering", "mechanical", "electrical", "civil", "aerospace", "robotics", "physics", "math"],
  },
  {
    id: "business_finance",
    label: "Business / Finance",
    description: "Business, entrepreneurship, economics, and finance-oriented pathways.",
    keywords: ["business", "finance", "economics", "entrepreneur", "marketing", "management", "startup"],
  },
  {
    id: "medicine",
    label: "Medicine",
    description: "Health and medicine pathways emphasizing science continuity and readiness.",
    keywords: ["medicine", "doctor", "health", "biology", "chemistry", "research", "medical"],
  },
  {
    id: "creative",
    label: "Creative",
    description: "Arts, design, writing, and creative production pathways.",
    keywords: ["art", "design", "music", "theater", "creative", "writing", "media"],
  },
  {
    id: "undecided",
    label: "Undecided / Exploring",
    description: "Exploration-first pathway emphasizing balance and flexibility.",
    keywords: ["undecided", "explore", "not sure", "open", "general"],
  },
];

