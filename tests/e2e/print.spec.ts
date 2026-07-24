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
    const atomicBlock = document.querySelector<HTMLElement>(".apf-print-block");
    const report = document.querySelector<HTMLElement>(".counselor-report");
    return {
      breakInside: atomicBlock ? getComputedStyle(atomicBlock).breakInside : "",
      reportColor: report ? getComputedStyle(report).color : "",
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  expect(["avoid", "avoid-page"]).toContain(printLayout.breakInside);
  expect(printLayout.reportColor).toBe("rgb(0, 0, 0)");
  expect(printLayout.overflow).toBeFalsy();

  const a4Pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  const letterPdf = await page.pdf({ format: "Letter", printBackground: true });
  expect(a4Pdf.byteLength).toBeGreaterThan(10_000);
  expect(letterPdf.byteLength).toBeGreaterThan(10_000);
});

test("prints the student plan with reasoning and without interactive dashboard chrome", async ({ page }) => {
  await saveSyntheticPlanViaApi(page, syntheticStudentIds.print);
  await page.goto("/dashboard?fresh=1");
  await expect(page.getByRole("heading", { level: 2, name: "Best Fit course plan" })).toBeVisible();

  await page.emulateMedia({ media: "print" });

  await expect(page.getByText("Your plan is ready and saved.")).toBeHidden();
  await expect(page.getByRole("button", { name: "Review next steps" })).toBeHidden();
  await expect(page.getByText("View detailed reasoning and next steps", { exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Detailed reasoning" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Next steps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compare other pathways" })).toBeHidden();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasOverflow).toBeFalsy();

  const pdf = await page.pdf({ format: "A4", printBackground: true });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
});
