import { expect, test } from "@playwright/test";
import {
  completeSyntheticIntake,
  expectCharacterizedCourseOrder,
  loginCounselorViaApi,
  saveSyntheticPlanViaApi,
  syntheticStudentIds,
} from "./support";

test.describe("student critical journeys", () => {
  test("protects student routes and exposes helpful login validation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);

    for (const route of ["/dashboard", "/intake", "/welcome-back"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    }

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Student ID must be exactly 8 digits.")).toBeVisible();

    await page.getByLabel("Student ID").fill("123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Student ID must be exactly 8 digits.")).toBeVisible();
    await expect(page.getByLabel("Student ID")).toHaveAttribute("aria-invalid", "true");
  });

  test("completes intake with keyboard selection, saves once, and preserves characterized course order", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.journey);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/intake$/, { timeout: 30_000 });

    await completeSyntheticIntake(page);

    let saveRequests = 0;
    await page.route("**/api/student/save-and-run", async (route) => {
      saveRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.continue();
    });

    await page.getByRole("button", { name: "Build my plan" }).dblclick();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { level: 1, name: "Your recommended path" })).toBeVisible();
    expect(saveRequests).toBe(1);
    await expectCharacterizedCourseOrder(page);
    await expect(page.getByRole("heading", { level: 2, name: "Best Fit course plan" })).toBeVisible();
    await page.getByText("Compare pathways", { exact: true }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Balanced" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Stretch" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("summarizes missing intake choices and moves focus to the affected section", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.reliability);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/intake$/, { timeout: 30_000 });
    await completeSyntheticIntake(page, { omitScholarship: true });

    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page.locator("#intake-error-summary")).toContainText("scholarship importance");
    await expect(page.locator("#risk-scholarship")).toBeFocused();
    await expect(page.locator("#risk-scholarship")).toHaveAttribute("aria-describedby", "risk-scholarship-error");
  });

  test("shows honest completion and an editable answer-derived planning profile", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.ux);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/intake$/, { timeout: 30_000 });

    const progress = page.getByRole("progressbar", { name: /Intake completion/ });
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    await expect(page.getByText("0 of 10")).toBeVisible();

    await page.locator("#school-context").getByRole("button", { name: "Grade 12" }).click();
    await page.getByRole("button", { name: "Semester 1" }).click();
    await expect(progress).toHaveAttribute("aria-valuenow", "20");
    const profile = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Your planning profile" }) });
    await expect(profile.getByRole("heading", { name: "Your planning profile" })).toBeVisible();
    await expect(profile.getByText("Grade 12", { exact: true })).toBeVisible();
    await expect(profile.getByText("Semester 1", { exact: true })).toBeVisible();
    await expect(profile.getByText("Workload preference", { exact: true })).toHaveCount(0);

    await completeSyntheticIntake(page);
    await expect(progress).toHaveAttribute("aria-valuenow", "100");

    const optionalPreferences = page.locator("details").filter({ hasText: "Fine-tune learning preferences" });
    await expect(optionalPreferences).not.toHaveAttribute("open", "");
    await optionalPreferences.locator("summary").click();
    await expect(optionalPreferences).toHaveAttribute("open", "");

    await page.getByRole("button", { name: "Edit academic context answers" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Academic context" })).toBeFocused();
  });

  test("supports returning students and keeps history after starting a new journey", async ({ page }) => {
    await saveSyntheticPlanViaApi(page, syntheticStudentIds.returning);
    await page.request.post("/api/auth/logout");

    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.returning);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/welcome-back$/, { timeout: 30_000 });

    await page.getByRole("button", { name: /Resume current plan/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your recommended path" })).toBeVisible();

    await page.goto("/welcome-back");
    await page.getByRole("button", { name: "Start a new plan" }).click();
    await expect(page).toHaveURL(/\/intake$/);

    await loginCounselorViaApi(page);
    const recordResponse = await page.request.get(`/api/counselor/student/${syntheticStudentIds.returning}`);
    expect(recordResponse.ok()).toBeTruthy();
    const record = (await recordResponse.json()) as { sessionCount: number; activeSessionId: string | null };
    expect(record.sessionCount).toBe(1);
    expect(record.activeSessionId).toBeNull();
  });

  test("completes the primary student journey at a 375 by 812 viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.mobile);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/intake$/, { timeout: 30_000 });
    await completeSyntheticIntake(page);
    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { level: 1, name: "Your recommended path" })).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBeFalsy();
  });
});
