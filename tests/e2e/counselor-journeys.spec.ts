import { expect, test } from "@playwright/test";
import { saveSyntheticPlanViaApi, syntheticStudentIds } from "./support";

test.describe("counselor critical journeys", () => {
  test.beforeEach(async ({ page }) => {
    await saveSyntheticPlanViaApi(page, syntheticStudentIds.counselor);
    await page.request.post("/api/auth/logout");
  });

  test("protects counselor routes and handles login, lookup, notes, reload, and logout", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/counselor");
    await expect(page).toHaveURL(/\/counselor\/login$/);

    await page.getByLabel("Access code").fill("incorrect-code");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#counselor-login-error")).toContainText("Incorrect access code");

    await page.getByLabel("Access code").fill("synthetic-e2e-counselor-code");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/counselor$/);

    await page.getByLabel("Student ID").fill("123");
    await page.getByRole("button", { name: "View student" }).click();
    await expect(page.locator("#counselor-lookup-error")).toContainText("valid 8-digit student ID");

    await page.getByLabel("Student ID").fill("90003999");
    await page.getByRole("button", { name: "View student" }).click();
    await expect(page.locator("#counselor-lookup-error")).toContainText("No saved plan found");

    await page.getByLabel("Student ID").fill(syntheticStudentIds.counselor);
    await page.getByRole("button", { name: "View student" }).click();
    await expect(page).toHaveURL(new RegExp(`/counselor/student/${syntheticStudentIds.counselor}$`));
    await expect(page.getByRole("heading", { level: 1, name: "Student record" })).toBeVisible();

    const visibleText = await page.locator("body").innerText();
    for (const internalCode of ["THERMO", "AP_CALC_AB", "AI_I", "AP_CSP"]) {
      expect(visibleText).not.toContain(internalCode);
    }

    const note = "Synthetic E2E note: discuss workload balance before final selection.";
    await page.getByLabel("New note").fill(note);
    await page.getByRole("button", { name: "Save note" }).dblclick();
    await expect(page.getByRole("status")).toContainText("Note saved");
    await expect(page.getByText(note)).toHaveCount(1);

    const reportLink = page.getByRole("link", { name: "Printable report" });
    await expect(reportLink).toHaveAttribute(
      "href",
      `/counselor/student/${syntheticStudentIds.counselor}/report`,
    );
    await Promise.all([
      page.waitForURL(new RegExp(`/counselor/student/${syntheticStudentIds.counselor}/report$`)),
      reportLink.click(),
    ]);
    await expect(page.getByRole("heading", { level: 1, name: "Academic pathway summary" })).toBeVisible();

    await page.getByRole("link", { name: "Back to student" }).click();
    await page.waitForURL(new RegExp(`/counselor/student/${syntheticStudentIds.counselor}$`));
    await page.reload();
    await expect(page.getByText(note)).toHaveCount(1);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/counselor\/login$/);
    await page.goto("/counselor");
    await expect(page).toHaveURL(/\/counselor\/login$/);
  });
});
