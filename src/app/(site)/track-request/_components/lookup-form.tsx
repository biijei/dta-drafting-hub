"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lime focus:ring-2 focus:ring-lime";

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
      className="lookup-rise w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-10 text-center sm:px-10 sm:py-14"
      noValidate
    >
      <span className="lookup-ring mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
        <Search className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight text-lime sm:text-4xl">
        Track My Request
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
        Enter your Request ID and the email on the request.
      </p>

      <div className="mx-auto mt-8 max-w-md text-left">
        <label className="block text-sm font-semibold text-gold" htmlFor="request-id">
          Request ID
        </label>
        <input
          id="request-id"
          name="requestId"
          value={requestId}
          onChange={(event) => setRequestId(event.target.value)}
          placeholder="e.g. DTA-2026-01000"
          autoComplete="off"
          className={fieldClass}
        />

        <label className="mt-5 block text-sm font-semibold text-gold" htmlFor="request-email">
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
          className={fieldClass}
        />

        {error ? (
          <p className="mt-4 text-sm text-[#FFD0D0]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:opacity-60"
          >
            {pending ? "Looking up…" : "View request"}
          </button>
        </div>
      </div>
    </form>
  );
}
