"use client";

import { type FormEvent, useState } from "react";
import {
  documentFilenames,
  type TrackedRequest,
} from "@/content/track-request";

type RevisionsPanelProps = {
  request: TrackedRequest;
};

export function RevisionsPanel({ request }: RevisionsPanelProps) {
  const filenames = documentFilenames(request);
  const [filename, setFilename] = useState("");
  const [changes, setChanges] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!filename || !changes.trim()) {
      setSubmitted(false);
      setError("Select a file and describe the changes you'd like made.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Documents</h2>
      <form
        onSubmit={onSubmit}
        className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-6 shadow-sm sm:px-6"
        noValidate
      >
        <h3 className="text-sm font-semibold text-ink">Request Changes</h3>

        <label className="sr-only" htmlFor="revision-file">
          Select file
        </label>
        <select
          id="revision-file"
          value={filename}
          onChange={(event) => setFilename(event.target.value)}
          className="mt-4 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
        >
          <option value="">Select file</option>
          {filenames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label
          className="mt-5 block text-sm font-medium text-ink"
          htmlFor="revision-changes"
        >
          What would you like changed?
        </label>
        <textarea
          id="revision-changes"
          value={changes}
          onChange={(event) => setChanges(event.target.value)}
          placeholder="Describe the changes you'd like made..."
          rows={6}
          className="mt-2 w-full resize-y rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy"
        />

        {error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {submitted ? (
          <p className="mt-4 text-sm font-medium text-navy" role="status">
            Your change request has been sent.
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
    </section>
  );
}
