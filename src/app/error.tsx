"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error] A route failed to render.", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-[100dvh] items-center px-5 py-12">
      <div className="apf-paper mx-auto max-w-xl p-6 text-center sm:p-8">
        <p className="apf-kicker">Temporary problem</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">This page could not be loaded.</h1>
        <p role="alert" className="mt-3 text-sm font-medium leading-6 text-slate-600">
          Your saved data has not been changed. Try loading the page again, or return to the relevant login screen.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.location.assign("/login")}>
            Student login
          </Button>
        </div>
      </div>
    </main>
  );
}
