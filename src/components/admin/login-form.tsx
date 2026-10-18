"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function safeAdminPath(value: string | null) {
  if (!value || !value.startsWith("/admin/") || value.startsWith("//") || value.includes("://")) {
    return "/admin";
  }

  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeAdminPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/me").then((response) => {
      if (response.ok) {
        router.replace(destination);
      }
    });
  }, [destination, router]);

  async function signIn() {
    if (pending) return;

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(body.error || "Could not sign in.");
        setPending(false);
        return;
      }

      router.replace(destination);
    } catch {
      setError("Could not sign in.");
      setPending(false);
    }
  }

  return (
    <main className="admin-app relative flex flex-1 items-center justify-center overflow-hidden bg-[#0B1C4E] px-4 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-[18%] top-[-20%] h-[160%] w-[42%] -rotate-[28deg] bg-[#10245C]" />
        <div className="absolute left-[8%] top-[-30%] h-[170%] w-[22%] -rotate-[28deg] bg-[#16306F]/70" />
        <div className="absolute right-[-12%] top-[-15%] h-[150%] w-[38%] -rotate-[28deg] bg-[#08153A]/80" />
        <div className="absolute right-[12%] top-[-25%] h-[160%] w-[16%] -rotate-[28deg] bg-white/[0.035]" />
      </div>
      <div className="relative w-full max-w-[420px] text-center">
        <h1 className="text-2xl font-bold text-white sm:text-[32px]">Admin Login</h1>
        <p className="mt-2 text-sm text-white/75">
          Sign in to the administration panel
        </p>
        <form
          className="mt-6 rounded-[22px] bg-white px-4 py-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-6 sm:py-6"
          onSubmit={(event) => {
            event.preventDefault();
            signIn();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              signIn();
            }
          }}
        >
          <label className="block text-sm font-medium text-[#1F2937]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm font-normal outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-[#1F2937]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm font-normal outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]"
            />
          </label>
          {error ? (
            <p className="mt-3 text-sm text-[#E25555]">{error}</p>
          ) : null}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={signIn}
              disabled={pending}
              aria-busy={pending}
              className="inline-flex min-w-[148px] items-center justify-center rounded-full bg-[#0C1B4D] px-8 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
