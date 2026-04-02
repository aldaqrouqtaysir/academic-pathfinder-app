"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { StudentHeader } from "@/components/student/StudentHeader";

export default function WelcomeBackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startNew() {
    setLoading(true);
    await fetch("/api/student/start-new", { method: "POST" });
    router.push("/intake");
  }

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <div className="mx-auto max-w-md px-4 py-10">
        <Card className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            You have an active saved plan. Continuing will take you back to your latest results.
          </p>
          <div className="mt-6 space-y-3">
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Continue previous plan
            </Button>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
              Starting a new plan keeps your earlier plan in history, but resets your active recommendations.
            </div>
            <Button className="w-full" variant="secondary" onClick={startNew} disabled={loading}>
              {loading ? "Starting..." : "Start a new plan"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

