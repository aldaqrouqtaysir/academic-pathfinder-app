import type { PathwayId } from "@/lib/domain/models/course";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";

export type RiskLevel = "low" | "moderate" | "high";
export type QuickAdjustMode = "easier" | "competitive" | "flexible";

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(String).filter(Boolean);
}

function firstInterestPhrase(interests: string[]): string | null {
  const x = interests[0];
  if (!x) return null;
  const t = x.trim();
  return t.toLowerCase();
}

function firstCareerPhrase(careers: string[]): string | null {
  const x = careers[0];
  if (!x) return null;
  const t = x.trim();
  return t.toLowerCase();
}

function strengthWord(s: string): string {
  const m: Record<string, string> = {
    Math: "math",
    English: "English & writing",
    Science: "science",
    Coding: "coding",
    Arts: "the arts",
    Humanities: "humanities",
    Other: "several subjects",
    Writing: "English & writing",
  };
  return m[s] ?? s.toLowerCase();
}

function countryMindfulPhrase(c: string | undefined): string | null {
  if (!c) return null;
  if (c === "Other" || c === "Qatar") return "your international goals";
  return `your ${c} focus`;
}

function countryFlexPhrase(c: string | undefined): string {
  if (!c) return "leaving room to refine plans with counseling";
  if (c === "Other" || c === "Qatar") return "keeping destination options flexible";
  return `keeping ${c} central to the narrative`;
}

export function pathwayHumanLabel(id: PathwayId): string {
  const map: Record<PathwayId, string> = {
    ai_tech: "technology and AI",
    engineering: "engineering and STEM",
    business_finance: "business and finance",
    medicine: "medicine and health sciences",
    creative: "creative and design-heavy work",
    undecided: "keeping your direction open",
  };
  return map[id] ?? "your goals";
}

/** 1–2 short sentences for students — no scores or engine jargon. */
export function buildWowMessage(answers: Record<string, unknown>, bestFit: PathRecommendation): string {
  const interests = strList(answers.interests);
  const careers = strList(answers.careerGoals);
  const strengths = strList(answers.strengths);
  const workload = answers.workloadTolerance as string | undefined;
  const countryIntent = answers.countryIntent as string | undefined;
  const mainCountry = answers.mainCountry as string | undefined;
  const mindful = countryMindfulPhrase(mainCountry);
  const pathway = pathwayHumanLabel(bestFit.rationale.targetPathway);

  const s1: string[] = [];

  if (interests.length && strengths.length) {
    const ip = firstInterestPhrase(interests);
    const sw = strengthWord(String(strengths[0]));
    if (ip) {
      s1.push(
        `Based on your interest in ${ip} and your strength in ${sw}, this path lines up with the story you’re building at SAIS.`,
      );
    }
  } else if (interests.length) {
    const ip = firstInterestPhrase(interests);
    if (ip) {
      s1.push(`With your interest in ${ip} and a lean toward ${pathway}, this mix supports that direction without feeling random.`);
    }
  } else if (careers.length) {
    const cp = firstCareerPhrase(careers);
    if (cp) {
      s1.push(`Given you’re eyeing ${cp}, this schedule keeps your courses coherent with that next step.`);
    }
  } else {
    s1.push(
      `This path reflects how you said you want the year to feel — workload, confidence, and where you might be headed next.`,
    );
  }

  const s2: string[] = [];
  if (countryIntent === "keep_options_open" || countryIntent === "unsure") {
    s2.push(`It also leaves breathing room if you’re still deciding countries or majors — you’re not locked into one narrow lane.`);
  } else if (workload === "Low") {
    s2.push(`It keeps the overall load closer to what you said you can handle comfortably right now.`);
  } else if (workload === "High" && bestFit.kind === "stretch") {
    s2.push(`It matches the extra challenge you said you’re willing to take on this year.`);
  } else if (mindful && mainCountry && mainCountry !== "US") {
    s2.push(`It stays mindful of ${mindful} while keeping a sensible balance across subjects.`);
  } else {
    s2.push(`It balances solid preparation with a week-to-week rhythm that should still feel doable.`);
  }

  return [s1[0], s2[0]].filter(Boolean).join(" ");
}

/** One professional line for counselor/report headers. */
export function buildFinalRecommendationSummary(answers: Record<string, unknown>, bestFit: PathRecommendation): string {
  const interests = strList(answers.interests);
  const workload = answers.workloadTolerance as string | undefined;
  const mainCountry = answers.mainCountry as string | undefined;
  const countryIntent = answers.countryIntent as string | undefined;
  const pathway = pathwayHumanLabel(bestFit.rationale.targetPathway);
  const interestPhrase = interests.length ? firstInterestPhrase(interests) : null;
  const flex =
    countryIntent === "keep_options_open" || countryIntent === "unsure"
      ? "keeping backup destinations and majors easier to adjust later"
      : countryFlexPhrase(mainCountry);
  const load =
    workload === "Low"
      ? "with a lighter overall feel"
      : workload === "High"
        ? "with a more demanding mix"
        : "with a sustainable balance of challenge";

  if (interestPhrase) {
    return `This plan balances your focus on ${interestPhrase} with ${pathway} preparation, ${flex}, ${load}.`;
  }
  return `This plan supports ${pathway} preparation, ${flex}, ${load}.`;
}

export function inferRiskLevel(rec: PathRecommendation, workloadTolerance?: string): RiskLevel {
  let score = 0;
  if (rec.kind === "stretch") score += 2;
  else if (rec.kind === "balanced") score += 1;

  const fb = rec.rationale.factorBreakdown;
  const maxPts = Math.max(1, ...fb.map((f) => f.points));
  const stretchPts = fb.find((f) => f.key === "learning_stretch")?.points ?? 0;
  const ratio = stretchPts / maxPts;
  if (ratio >= 0.72) score += 2;
  else if (ratio >= 0.38) score += 1;

  if (rec.softWarnings.length >= 2) score += 1;
  if (rec.whyMayFeelHard.length >= 3) score += 1;
  if (workloadTolerance === "Low" && (rec.kind === "stretch" || ratio >= 0.55)) score += 2;
  else if (workloadTolerance === "Low" && ratio >= 0.35) score += 1;

  if (score >= 6) return "high";
  if (score >= 3) return "moderate";
  return "low";
}

export function riskLevelLabel(level: RiskLevel): string {
  if (level === "low") return "Low risk";
  if (level === "moderate") return "Moderate risk";
  return "Higher risk";
}

/** Short bullets — no scoring vocabulary. */
export function buildWhatYouGain(rec: PathRecommendation, answers: Record<string, unknown>): string[] {
  const out: string[] = [];
  const pathway = rec.rationale.targetPathway;
  const countryIntent = answers.countryIntent as string | undefined;
  const opt = answers.optimizationTarget as string | undefined;

  if (pathway === "medicine") {
    out.push("Stronger groundwork for health-science and pre-med style tracks.");
  } else if (pathway === "engineering" || pathway === "ai_tech") {
    out.push("Heavier STEM and quantitative preparation for competitive programs.");
  } else if (pathway === "business_finance") {
    out.push("Coursework that supports business, economics, and finance-oriented next steps.");
  } else if (pathway === "creative") {
    out.push("Room to deepen creative skills alongside core requirements.");
  }

  if (rec.kind === "balanced") {
    out.push("A calmer week-to-week feel while your transcript still tells a clear story.");
  }
  if (rec.kind === "stretch") {
    out.push("Sharper readiness if you want more selective university options later.");
  }
  if (countryIntent === "keep_options_open" || countryIntent === "unsure") {
    out.push("Flexibility if you’re still weighing countries or majors.");
  }
  if (opt === "lighter_workload") {
    out.push("Keeps intensity closer to the lighter end of what SAIS allows for your choices.");
  }
  if (opt === "university_competitiveness") {
    out.push("Leans toward combinations that often support competitive applications.");
  }

  const top = rec.rationale.topContributingFactors[0];
  if (top?.key === "strength_match") {
    out.push("Builds on subjects where you already feel capable.");
  }
  if (top?.key === "workload_fit") {
    out.push("Sized closer to how much academic weight you want to carry this year.");
  }

  return [...new Set(out)].slice(0, 5);
}

export function quickAdjustGuide(mode: QuickAdjustMode): { scrollId: string; message: string } {
  switch (mode) {
    case "easier":
      return {
        scrollId: "path-balanced",
        message: "Scrolled to Balanced — gentler week-to-week, still credible on your transcript.",
      };
    case "competitive":
      return {
        scrollId: "path-stretch",
        message: "Scrolled to Stretch — more rigor if you want sharper readiness for selective paths.",
      };
    case "flexible":
      return {
        scrollId: "hero-best-fit",
        message: "Your Best Fit already leans flexible — it’s up top.",
      };
    default:
      return { scrollId: "hero-best-fit", message: "" };
  }
}
