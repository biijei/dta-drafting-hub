"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function LookupForm({ initialId = "" }: { initialId?: string }) {
  const router = useRouter();
  const [requestId, setRequestId] = useState(initialId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requestId.trim();
    const mail = email.trim();

    if (!id || !mail) {
      setError("Enter your Request ID and the email used when submitting.");
      return;
    }

    setPending(true);
    setError("");
    const response = await fetch("/api/track/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, email: mail }),
    });
    const body = (await response.json()) as { id?: string; error?: string };
    setPending(false);

    if (!response.ok || !body.id) {
      setError(body.error || "We couldn't find a request with that ID and email.");
      return;
    }

    router.push(`/track-request/${body.id}`);
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="w-full max-w-md rounded-2xl bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8"
      noValidate
    >
      <label className="block text-sm font-semibold text-ink" htmlFor="request-id">
        Request ID
      </label>
      <input
        id="request-id"
        name="requestId"
        value={requestId}
        onChange={(event) => setRequestId(event.target.value)}
        placeholder="e.g. DTA-2026-01000"
        autoComplete="off"
        className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy"
      />

      <label
        className="mt-5 block text-sm font-semibold text-ink"
        htmlFor="request-email"
      >
        Email
      </label>
      <input
        id="request-email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email used when submitting"
        autoComplete="email"
        className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy"
      />

      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {pending ? "Looking up…" : "View request"}
        </button>
      </div>
    </form>
  );
}
