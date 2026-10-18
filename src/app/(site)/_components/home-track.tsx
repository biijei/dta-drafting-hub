"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { sampleRequestId } from "@/content/track-request";

export function HomeTrack() {
  const router = useRouter();
  const [requestId, setRequestId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const id = requestId.trim();
    const mail = email.trim();

    if (!id || !mail) {
      setError("Enter your Request ID and the email on the request.");
      return;
    }

    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/track/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, email: mail }),
      });
      const body = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !body.id) {
        setError(body.error || "We couldn't find a request with that ID and email.");
        setPending(false);
        return;
      }

      router.push(`/track-request/${body.id}`);
    } catch {
      setError("We couldn't find a request with that ID and email.");
      setPending(false);
    }
  }

  return (
    <section className="bg-royal px-4 py-16 text-center text-white sm:py-20">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Already submitted a request?
      </h2>
      <p className="mt-3 text-sm text-white/85 sm:text-base">
        Enter your Request ID and the email on the request.
      </p>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="mx-auto mt-8 flex w-full max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
        noValidate
      >
        <label className="sr-only" htmlFor="home-request-id">
          Request ID
        </label>
        <input
          id="home-request-id"
          name="requestId"
          value={requestId}
          onChange={(event) => setRequestId(event.target.value)}
          placeholder={`e.g. ${sampleRequestId}`}
          autoComplete="off"
          className="w-full rounded-lg bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-lime sm:max-w-xs"
        />
        <label className="sr-only" htmlFor="home-request-email">
          Email
        </label>
        <input
          id="home-request-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email on the request"
          autoComplete="email"
          className="w-full rounded-lg bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-lime sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="text-nowrap rounded-full bg-lime px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
        >
          {pending ? "Looking up…" : "Track request"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-white" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
