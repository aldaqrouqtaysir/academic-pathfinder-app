import { courseCatalogSeed, rulesCatalogSeed } from "@/data/sais";
import { computeRecommendations } from "@/lib/domain/engine";
import { sampleStudents } from "./sampleStudents";

const scenarios = [
  { semester: "Semester1", isMidYear: false, preferLowerWorkload: false },
  { semester: "Semester2", isMidYear: true, preferLowerWorkload: true },
  { semester: "Semester1", isMidYear: false, preferHigherRigor: false },
] as const;

for (let i = 0; i < sampleStudents.length; i++) {
  const student = sampleStudents[i];
  const scenario = scenarios[i] ?? scenarios[0];

  const result = computeRecommendations({
    profile: student,
    semester: scenario.semester,
    scenario,
    catalog: { courses: courseCatalogSeed },
    rules: { rules: rulesCatalogSeed },
  });

  const summary = {
    studentId: student.studentId,
    grade: student.currentGrade,
    countries: [student.mainCountry, ...student.additionalCountries],
    bestFit: result.bundle.bestFit,
    balanced: result.bundle.balanced,
    stretch: result.bundle.stretch,
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

