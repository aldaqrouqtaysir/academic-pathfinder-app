import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

export const syntheticStudentIds = {
  journey: "90003001",
  returning: "90003002",
  counselor: "90003003",
  accessibility: "90003004",
  reliability: "90003005",
  mobile: "90003006",
  ux: "90003007",
  print: "90003008",
} as const;

export const syntheticIntake = {
  currentGrade: 12,
  semester: "Semester1",
  currentCourses: [],
  currentAPs: [],
  strengths: ["Math", "Science"],
  weaknesses: [],
  selfReportedAcademicConfidence: "High",
  workloadTolerance: "High",
  interests: ["STEM, coding & building things"],
  careerGoals: ["Engineering or tech careers"],
  goalClarity: "High",
  mainCountry: "UAE",
  additionalCountries: [],
  countryIntent: "main_focus",
  priorityStyle: "strongest_path",
  optimizationTarget: "university_competitiveness",
  preferencesToAvoid: [],
  preferences: ["Project-based"],
  futurePlans: "Explore an engineering degree through rigorous quantitative courses.",
  riskPreference: "Embrace stretch",
  scholarshipImportance: "High",
} as const;

export async function loginStudentViaApi(page: Page, studentId: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { studentId },
  });
  expect(response.ok()).toBeTruthy();
}

export async function saveSyntheticPlanViaApi(page: Page, studentId: string) {
  await loginStudentViaApi(page, studentId);
  const response = await page.request.post("/api/student/save-and-run", {
    data: syntheticIntake,
  });
  expect(response.ok()).toBeTruthy();
}

export async function loginCounselorViaApi(page: Page) {
  const response = await page.request.post("/api/counselor/login", {
    data: { accessCode: "synthetic-e2e-counselor-code" },
  });
  expect(response.ok()).toBeTruthy();
}

export async function completeSyntheticIntake(page: Page, options: { omitScholarship?: boolean } = {}) {
  await page.locator("#school-context").getByRole("button", { name: "Grade 12" }).press(" ");
  await expect(page.getByRole("button", { name: "Grade 12" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Semester 1" }).click();

  const strengths = page.getByText("Stronger in", { exact: true }).locator("..");
  await strengths.getByRole("button", { name: "Math", exact: true }).click();
  await strengths.getByRole("button", { name: "Science", exact: true }).click();

  const confidence = page.locator("#confidence-workload");
  await confidence.getByRole("button", { name: "High", exact: true }).nth(0).click();
  await confidence.getByRole("button", { name: "High", exact: true }).nth(1).click();
  await page.getByRole("button", { name: "Next step" }).click();

  await page.getByRole("button", { name: "STEM, coding & building things" }).click();
  await page.getByRole("button", { name: "Engineering or tech careers" }).click();
  await page.locator("#plans-clarity").getByRole("button", { name: "Fairly clear" }).click();
  await page.locator("#future-destination").getByRole("button", { name: "UAE", exact: true }).first().click();
  await page.getByRole("button", { name: "Next step" }).click();

  await page.locator("#priority-style").getByRole("button", { name: /Strongest path/ }).click();
  await page.locator("#optimization-target").getByRole("button", { name: "University competitiveness" }).click();
  await page.locator("#risk-scholarship").getByRole("button", { name: "Open to stretch" }).click();
  if (!options.omitScholarship) {
    await page.locator("#risk-scholarship").getByRole("button", { name: "High", exact: true }).click();
  }
  await page.getByLabel("Anything else? (optional)").fill(syntheticIntake.futurePlans);
}

export async function expectCharacterizedCourseOrder(page: Page) {
  const dashboardText = await page.locator("body").innerText();
  const expectedNames = [
    "Thermodynamics",
    "AP Calculus AB",
    "Artificial Intelligence I",
    "AP Computer Science Principles",
  ];
  const positions = expectedNames.map((name) => dashboardText.indexOf(name));
  expect(positions.every((position) => position >= 0)).toBeTruthy();
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  for (const internalCode of ["THERMO", "AP_CALC_AB", "AI_I", "AP_CSP"]) {
    expect(dashboardText).not.toContain(internalCode);
  }
}

export async function expectNoHighImpactAxeViolations(page: Page, testInfo: TestInfo, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  await testInfo.attach(`axe-results-${label}`, {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  expect(results.violations).toEqual([]);
}
