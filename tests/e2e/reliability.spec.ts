import { expect, test } from "@playwright/test";
import {
  completeSyntheticIntake,
  loginCounselorViaApi,
  loginStudentViaApi,
  saveSyntheticPlanViaApi,
  syntheticStudentIds,
} from "./support";

test.describe("reliability and failure states", () => {
  test("recovers from login and expired dashboard requests", async ({ page }) => {
    await page.goto("/login");
    await page.route("**/api/auth/login", (route) => route.abort("failed"));
    await page.getByLabel("Student ID").fill(syntheticStudentIds.reliability);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#student-login-error")).toContainText("Network hiccup");
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();

    await page.unroute("**/api/auth/login");
    await loginStudentViaApi(page, syntheticStudentIds.reliability);
    await page.route("**/api/student/active-plan", (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ ok: false }) }),
    );
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows retry and empty states when dashboard loading fails", async ({ page }) => {
    await loginStudentViaApi(page, syntheticStudentIds.reliability);
    await page.route("**/api/student/active-plan", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false }) }),
    );
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "We could not load your pathway." })).toBeVisible();
    await expect(page.locator("#dashboard-load-message")).toContainText("saved work has not been changed");

    await page.unroute("**/api/student/active-plan");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: "You do not have an active pathway yet." })).toBeVisible();
  });

  test("retains intake answers and prevents duplicate saves after a persistence failure", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Student ID").fill(syntheticStudentIds.reliability);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/intake$/, { timeout: 30_000 });
    await completeSyntheticIntake(page);

    let saveRequests = 0;
    await page.route("**/api/student/save-and-run", async (route) => {
      saveRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, code: "PERSISTENCE_ERROR", requestId: "synthetic-request-id" }),
      });
    });

    await page.getByRole("button", { name: "Unlock my plan" }).dblclick();
    await expect(page.locator("#intake-error-summary")).toContainText("could not save");
    await expect(page.getByRole("button", { name: "Unlock my plan" })).toBeEnabled();
    await expect(page.getByLabel("Anything else? (optional)")).toHaveValue(/engineering degree/);
    expect(saveRequests).toBe(1);
  });

  test("handles counselor lookup and note-save failures without trapping pending controls", async ({ page }) => {
    await saveSyntheticPlanViaApi(page, syntheticStudentIds.counselor);
    await loginCounselorViaApi(page);
    await page.goto("/counselor");

    await page.route(`**/api/counselor/student/${syntheticStudentIds.counselor}`, (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false }) }),
    );
    await page.getByLabel("Student ID").fill(syntheticStudentIds.counselor);
    await page.getByRole("button", { name: "View student" }).click();
    await expect(page.locator("#counselor-lookup-error")).toContainText("Could not open this student record");
    await expect(page.getByRole("button", { name: "View student" })).toBeEnabled();

    await page.unroute(`**/api/counselor/student/${syntheticStudentIds.counselor}`);
    await page.getByRole("button", { name: "View student" }).click();
    await expect(page).toHaveURL(new RegExp(`/counselor/student/${syntheticStudentIds.counselor}$`));

    let noteRequests = 0;
    await page.route("**/api/counselor/notes", async (route) => {
      noteRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false }) });
    });
    await page.getByLabel("New note").fill("Synthetic note that should fail safely.");
    await page.getByRole("button", { name: "Save note" }).dblclick();
    await expect(page.locator("#counselor-note-error")).toContainText("Could not save note");
    await expect(page.getByRole("button", { name: "Save note" })).toBeEnabled();
    expect(noteRequests).toBe(1);
  });
});
