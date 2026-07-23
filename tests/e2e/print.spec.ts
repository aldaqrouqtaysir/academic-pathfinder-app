import { expect, test } from "@playwright/test";
import { loginCounselorViaApi, saveSyntheticPlanViaApi, syntheticStudentIds } from "./support";

test("renders the counselor report without print overflow or interactive chrome", async ({ page }) => {
  await saveSyntheticPlanViaApi(page, syntheticStudentIds.counselor);
  await loginCounselorViaApi(page);
  await page.request.post("/api/counselor/notes", {
    data: {
      studentId: syntheticStudentIds.counselor,
      body: `Synthetic print wrapping check: ${"long-counselor-note-".repeat(18)}`,
    },
  });

  await page.goto(`/counselor/student/${syntheticStudentIds.counselor}/report`);
  await page.emulateMedia({ media: "print" });

  await expect(page.getByRole("button", { name: "Print / Save as PDF" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Counselor navigation" })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Academic pathway summary" })).toBeVisible();

  const printLayout = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>(".apf-print-section");
    const report = document.querySelector<HTMLElement>(".counselor-report");
    return {
      breakInside: section ? getComputedStyle(section).breakInside : "",
      reportColor: report ? getComputedStyle(report).color : "",
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  expect(["avoid", "avoid-page"]).toContain(printLayout.breakInside);
  expect(printLayout.reportColor).toBe("rgb(0, 0, 0)");
  expect(printLayout.overflow).toBeFalsy();

  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
});
