"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CounselorLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/counselor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: code }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        setPending(false);
        return;
      }
      router.push("/counselor");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Staff access</p>
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">Counselor sign-in</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Discreet entry for faculty. Student login and links are unchanged.
        </p>
        <Card className="mt-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="code" className="text-sm font-medium text-slate-700">
                Access code
              </label>
              <Input
                id="code"
                type="password"
                autoComplete="off"
                className="mt-1"
                placeholder="Provided by your tech lead"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Continue"}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-500">
          Configure <code className="rounded bg-slate-200/80 px-1">COUNSELOR_ACCESS_CODE</code> in the server environment.
        </p>
      </div>
    </div>
  );
}
