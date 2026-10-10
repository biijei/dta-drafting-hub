"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getTrackedRequest, sampleRequestId } from "@/content/track-request";

export function HomeTrack() {
  const router = useRouter();
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requestId.trim();

    if (!id) {
      setError("Enter your Request ID.");
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
    <section className="bg-royal px-4 py-16 text-center text-white sm:py-20">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Already submitted a request?
      </h2>
      <p className="mt-3 text-sm text-white/85 sm:text-base">
        Enter your Request ID to view the status of your request.
      </p>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
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
        <button
          type="submit"
          className="rounded-full bg-lime px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Track request
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
