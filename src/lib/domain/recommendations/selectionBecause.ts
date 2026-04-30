import { categoryTemplatesSeed } from "@/data/sais";
import type { CourseCatalog } from "../engine/types";
import type { PathRecommendation } from "../models/recommendations";
import type { PlanCategoryKey } from "../models/course";
import type { StudentProfile } from "../models/studentProfile";
import type { Semester } from "../models/session";

function courseName(code: string, catalog: CourseCatalog): string {
  return catalog.courses.find((c) => c.code === code)?.name ?? code;
}

/** Short, student-facing “this was chosen because…” lines tied to picks vs plausible alternatives. */
export function buildSelectionBecauseBullets(params: {
  profile: StudentProfile;
  categorySelections: Partial<Record<PlanCategoryKey, string>>;
  catalog: CourseCatalog;
  semester: Semester;
  kind: PathRecommendation["kind"];
}): string[] {
  const { profile, categorySelections, catalog, semester, kind } = params;
  const template = categoryTemplatesSeed.find((t) => t.grade === profile.currentGrade && t.semester === semester);
  if (!template) return [];

  const lines: string[] = [];
  const opt = profile.optimizationTarget;
  const workload = profile.workloadTolerance;
  const scholarshipHigh = profile.scholarshipImportance === "High";
  const competitive = opt === "university_competitiveness" || opt === "career_alignment";
  const lighter = opt === "lighter_workload" || opt === "higher_grades";
  const keepOpen = opt === "keeping_options_open" || profile.countryIntent === "keep_options_open" || profile.countryIntent === "unsure";

  const get = (code: string) => catalog.courses.find((c) => c.code === code);

  const interestBlob = profile.interests.join(" ").toLowerCase();
  const careerBlob = profile.careerGoals.join(" ").toLowerCase();

  for (const cat of template.categories) {
    const key = cat.key as PlanCategoryKey;
    const selected = categorySelections[key];
    if (!selected) continue;
    const codes = cat.options.map((o) => o.courseCode).filter(Boolean);
    const others = codes.filter((c) => c !== selected);
    if (others.length === 0) continue;
    const alt = others[0];
    const selC = get(selected);
    const altC = get(alt);
    const selN = courseName(selected, catalog);
    const altN = courseName(alt, catalog);
    const selRig = selC?.rigorPoints ?? 3;
    const altRig = altC?.rigorPoints ?? 3;

    if (key === "english_category") {
      if (selected === "AP_LANG_COMP") {
        lines.push(
          `English: ${selN} was chosen instead of ${altN} because AP English usually strengthens reading and writing for university — it matched your answers about ${competitive || scholarshipHigh ? "competitiveness or scholarships" : "pushing yourself academically"}.`,
        );
      } else {
        lines.push(
          `English: ${selN} keeps a strong English year with a bit less AP intensity than ${altN} — a better fit when you wanted sustainable pacing or said workload should stay moderate.`,
        );
      }
      continue;
    }

    if (key === "science_category") {
      const stemish = /engineer|tech|medic|health|stem|science|physics|chem/i.test(careerBlob + interestBlob);
      const harderPick = selRig >= altRig;
      if (harderPick) {
        lines.push(
          `Science: ${selN} was favored over ${altN} for the more demanding lab path — that lines up with ${stemish ? "your STEM or health direction" : "a heavier prep track"} and ${competitive || kind === "stretch" ? "stronger university options" : "keeping science doors open"}.`,
        );
      } else {
        lines.push(
          `Science: ${selN} was favored over ${altN} to keep labs and pacing more manageable — that matches ${lighter || workload === "Low" ? "a lighter workload preference" : "balancing rigor with sustainability"} while still meeting SAIS structure.`,
        );
      }
      continue;
    }

    if (key === "math_category") {
      const quantHeavy = /AP_CALC|CALCULUS|CALC[^_]|PRECALC|MATH_INT/i.test(selected);
      const quantAlt = /AP_STATS|MATH_BUSINESS|CALC_BUSINESS|FUND/i.test(selected);
      if (quantHeavy) {
        lines.push(
          `Math: ${selN} supports a more quantitative track than options like ${altN} — it fits when you marked STEM interests, stronger math, or competitiveness.`,
        );
      } else if (quantAlt || /STATS|BUSINESS|FUND/i.test(selected)) {
        lines.push(
          `Math: ${selN} was chosen over pushing into the toughest calculus line first — it usually pairs better with ${lighter || workload === "Low" ? "a lighter term" : "business or applied directions"} or when you want statistics strength instead of pure calculus.`,
        );
      } else {
        lines.push(
          `Math: ${selN} sits in a solid middle compared with ${altN} — good for keeping Grade ${profile.currentGrade} balanced before senior-year math choices.`,
        );
      }
      continue;
    }

    if (key === "set1_elective" || key === "set2_elective") {
      const slot = key === "set1_elective" ? "Set 1" : "Set 2";
      const hay = `${selC?.name ?? ""} ${(selC?.tags ?? []).join(" ")}`.toLowerCase();
      const hitInterest = profile.interests.some((i) => {
        const w = i.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        return w.length > 2 && hay.includes(w.split(" ")[0] ?? "");
      });
      lines.push(
        hitInterest
          ? `${slot}: ${selN} ties to topics you said you enjoy — we used that instead of treating the slot as random.`
          : `${slot}: ${selN} fills this elective slot while staying consistent with your workload and pathway; ${altN} is a common alternative if you want a different flavor.`,
      );
    }
  }

  if (kind === "stretch") {
    lines.push(
      "Overall path: Stretch bumps rigor versus Balanced — useful if you said you can handle a faster pace and want sharper prep for selective next steps.",
    );
  } else if (kind === "balanced") {
    lines.push(
      "Overall path: Balanced trims intensity versus Stretch while still looking serious on a transcript — good when you want breathing room without going minimal.",
    );
  } else if (keepOpen) {
    lines.push(
      "Overall path: Best Fit leans flexible — based on keeping majors or destinations easier to change later.",
    );
  } else {
    lines.push(
      "Overall path: Best Fit is the highest-scoring mix against your interests, strengths, workload comfort, and priorities — your counselor still confirms what’s available.",
    );
  }

  return lines.slice(0, 9);
}
