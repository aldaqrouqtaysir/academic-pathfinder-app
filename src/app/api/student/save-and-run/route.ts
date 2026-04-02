import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { computeRecommendations } from "@/lib/domain/engine";
import { categoryBasedCourseCatalogSeed, rulesCatalogSeed } from "@/data/sais";
import { mapIntakeToProfile, mapIntakeToScenario } from "@/lib/student/intakeMapping";
import { saveStudentSession } from "@/lib/persistence/studentPlanStore";

const IntakeSchema = z.object({
  currentGrade: z.union([z.literal(9), z.literal(10), z.literal(11), z.literal(12)]),
  semester: z.union([z.literal("Semester1"), z.literal("Semester2")]),
  currentCourses: z.array(z.string()).default([]),
  currentAPs: z.array(z.string()).default([]),
  strengths: z.array(z.union([z.literal("Math"), z.literal("English"), z.literal("Science"), z.literal("Humanities"), z.literal("Writing"), z.literal("Coding"), z.literal("Arts"), z.literal("Other")])).default([]),
  weaknesses: z.array(z.union([z.literal("Math"), z.literal("English"), z.literal("Science"), z.literal("Humanities"), z.literal("Writing"), z.literal("Coding"), z.literal("Arts"), z.literal("Other")])).default([]),
  selfReportedAcademicConfidence: z.union([z.literal("Low"), z.literal("Medium"), z.literal("High")]),
  workloadTolerance: z.union([z.literal("Low"), z.literal("Medium"), z.literal("High")]),
  interests: z.array(z.string()).default([]),
  careerGoals: z.array(z.string()).default([]),
  goalClarity: z.union([z.literal("Low"), z.literal("Medium"), z.literal("High")]),
  mainCountry: z.union([z.literal("UAE"), z.literal("Qatar"), z.literal("US"), z.literal("Egypt"), z.literal("Jordan")]),
  additionalCountries: z.array(z.union([z.literal("UAE"), z.literal("Qatar"), z.literal("US"), z.literal("Egypt"), z.literal("Jordan")])).default([]),
  countryIntent: z.union([z.literal("main_focus"), z.literal("keep_options_open"), z.literal("unsure")]),
  priorityStyle: z.union([z.literal("strongest_path"), z.literal("balanced_path"), z.literal("safest_highest_grade"), z.literal("not_sure")]).optional(),
  optimizationTarget: z.union([z.literal("career_alignment"), z.literal("lighter_workload"), z.literal("university_competitiveness"), z.literal("keeping_options_open"), z.literal("higher_grades")]).optional(),
  preferencesToAvoid: z.array(z.string()).default([]),
  preferences: z.array(z.string()).default([]),
  futurePlans: z.string().default(""),
  riskPreference: z.union([z.literal("Avoid risk"), z.literal("Balanced"), z.literal("Embrace stretch")]),
  scholarshipImportance: z.union([z.literal("Low"), z.literal("Medium"), z.literal("High")]),
});

export async function POST(req: Request) {
  try {
    const studentId = await requireStudentId();
    const json = await req.json().catch(() => null);
    const parsed = IntakeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const intake = parsed.data;
    const profile = mapIntakeToProfile(studentId, intake);
    const scenario = mapIntakeToScenario(intake);
    const result = computeRecommendations({
      profile,
      semester: intake.semester,
      scenario,
      catalog: { courses: categoryBasedCourseCatalogSeed },
      rules: { rules: rulesCatalogSeed },
    });

    const session = await saveStudentSession(studentId, {
      studentId,
      answers: intake,
      scenario,
      outputs: {
        bundle: result.bundle,
        generatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

