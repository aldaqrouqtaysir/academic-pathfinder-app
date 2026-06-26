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
    await fetch("/api/student/start-new", { method: "POST", cache: "no-store" });
    router.push("/intake");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_75%_at_50%_-18%,rgba(34,211,238,0.2),transparent)]">
      <StudentHeader />
      <div className="apf-journey-shell">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">SAIS Navigator</p>
            <h1 className="mt-2 bg-gradient-to-r from-slate-900 via-teal-800 to-cyan-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Welcome back 👋
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-snug text-slate-600 sm:mx-0">
              Your pathway is saved. Jump back in, or start a fresh run — you’re in control.
            </p>
          </div>

          <Card className="apf-fade-up apf-journey-card overflow-hidden p-0 shadow-xl">
            <div className="grid sm:grid-cols-5">
              <div className="flex flex-col justify-center border-b border-teal-100/80 bg-gradient-to-br from-teal-50/90 via-cyan-50/50 to-white p-6 sm:col-span-2 sm:border-b-0 sm:border-r sm:p-8">
                <p className="text-sm font-bold text-teal-950">You’ve got this</p>
                <ul className="mt-4 space-y-2.5 text-left text-xs font-semibold text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-teal-600">▸</span>
                    <span>Same great plan — open it anytime.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600">▸</span>
                    <span>New run = new active plan; history stays.</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:col-span-3 sm:p-8">
                <Button
                  className="w-full py-3.5 text-base font-bold shadow-md"
                  onClick={() => router.push("/dashboard")}
                >
                  🎯 Open my plan
                </Button>
                <Button
                  className="w-full py-3 font-bold"
                  variant="secondary"
                  onClick={startNew}
                  disabled={loading}
                >
                  {loading ? "Starting" : "✨ Start a new journey"}
                </Button>
                <p className="text-center text-[11px] font-medium leading-snug text-slate-500 sm:text-left">
                  Starting new keeps older plans in history but switches what you see as active.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
