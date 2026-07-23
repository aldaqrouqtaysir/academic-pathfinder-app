import { test } from "@playwright/test";
import {
  expectNoHighImpactAxeViolations,
  loginCounselorViaApi,
  loginStudentViaApi,
  saveSyntheticPlanViaApi,
  syntheticStudentIds,
} from "./support";

test("has no automated WCAG A/AA violations on critical student and counselor pages", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto("/login");
  await expectNoHighImpactAxeViolations(page, testInfo, "student-login");

  await loginStudentViaApi(page, syntheticStudentIds.accessibility);
  await page.goto("/intake");
  await expectNoHighImpactAxeViolations(page, testInfo, "intake");

  await saveSyntheticPlanViaApi(page, syntheticStudentIds.accessibility);
  await page.goto("/dashboard");
  await expectNoHighImpactAxeViolations(page, testInfo, "dashboard");

  await page.context().clearCookies();
  await page.goto("/counselor/login");
  await expectNoHighImpactAxeViolations(page, testInfo, "counselor-login");

  await loginCounselorViaApi(page);
  await page.goto(`/counselor/student/${syntheticStudentIds.accessibility}`);
  await expectNoHighImpactAxeViolations(page, testInfo, "counselor-student-record");

  await page.goto(`/counselor/student/${syntheticStudentIds.accessibility}/report`);
  await expectNoHighImpactAxeViolations(page, testInfo, "printable-report");
});
