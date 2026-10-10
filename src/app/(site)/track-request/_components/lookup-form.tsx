"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getTrackedRequest } from "@/content/track-request";

export function LookupForm() {
  const router = useRouter();
  const [requestId, setRequestId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requestId.trim();
    const mail = email.trim();

    if (!id || !mail) {
      setError("Enter your Request ID and the email used when submitting.");
      return;
    }

    const request = getTrackedRequest(id);

    if (!request) {
      setError("We couldn't find a request with that ID.");
      return;
    }

    setError("");
    router.push(`/track-request/${request.id}`);
  }

  return (
    <form
      onSubmit={onSubmit}
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
        placeholder="e.g. DTA-2026-00482"
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
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90"
        >
          View request
        </button>
      </div>
    </form>
  );
}
