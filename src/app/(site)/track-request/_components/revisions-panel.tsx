"use client";

import { type FormEvent, useState } from "react";
import type { TrackedRequest } from "@/content/track-request";

type RevisionsPanelProps = {
  request: TrackedRequest;
  onRefresh: () => Promise<void>;
};

export function RevisionsPanel({ request, onRefresh }: RevisionsPanelProps) {
  const drafts = request.documents.flatMap((group) =>
    group.files.filter((file) => file.kind === "draft"),
  );
  const [fileId, setFileId] = useState("");
  const [changes, setChanges] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!request.canRevise) {
      setError("A revision can be requested when a draft is ready for review.");
      return;
    }

    if (!fileId || !changes.trim()) {
      setSubmitted(false);
      setError("Select a file and describe the changes you'd like made.");
      return;
    }

    const body = new FormData();
    body.set("fileId", fileId);
    body.set("note", changes.trim());
    Array.from(files ?? []).forEach((file) => body.append("files", file));

    const response = await fetch(`/api/track/requests/${request.id}/revisions`, {
      method: "POST",
      body,
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitted(false);
      setError(payload.error || "Could not send the revision request.");
      return;
    }

    setError("");
    setSubmitted(true);
    setChanges("");
    setFiles(null);
    await onRefresh();
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Documents</h2>
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-6 shadow-sm sm:px-6"
        noValidate
      >
        <h3 className="text-sm font-semibold text-ink">Request Changes</h3>

        <label className="sr-only" htmlFor="revision-file">
          Select file
        </label>
        <select
          id="revision-file"
          value={fileId}
          onChange={(event) => setFileId(event.target.value)}
          className="mt-4 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
        >
          <option value="">Select file</option>
          {drafts.map((file) => (
            <option key={file.id} value={file.id}>
              {file.filename}
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

        <label className="mt-5 block text-sm font-medium text-ink" htmlFor="revision-files">
          Supporting documents
        </label>
        <input
          id="revision-files"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(event) => setFiles(event.target.files)}
          className="mt-2 block w-full text-sm text-ink"
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
            Submit revision
          </button>
        </div>
      </form>
    </section>
  );
}
