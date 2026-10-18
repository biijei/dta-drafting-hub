"use client";

import { FileText } from "lucide-react";
import { type FormEvent, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { FileDropzone } from "@/components/ui/file-dropzone";
import type { TrackedRequest } from "@/content/track-request";

type RevisionsPanelProps = {
  request: TrackedRequest;
  onRefresh: () => Promise<void>;
};

export function RevisionsPanel({ request, onRefresh }: RevisionsPanelProps) {
  const drafts = request.documents.flatMap((group) =>
    group.files.filter((file) => file.kind === "draft"),
  );
  const onlyDraft = drafts.length === 1 ? drafts[0] : null;
  const [fileId, setFileId] = useState("");
  const [changes, setChanges] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const targetId = onlyDraft?.id ?? fileId;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!request.canRevise) {
      setError("A revision can be requested when a draft is ready for review.");
      return;
    }

    if (!targetId || !changes.trim()) {
      setSubmitted(false);
      setError(
        targetId
          ? "Describe the changes you'd like made."
          : "Choose the draft you want changed and describe the changes.",
      );
      return;
    }

    const body = new FormData();
    body.set("fileId", targetId);
    body.set("note", changes.trim());
    files.forEach((file) => body.append("files", file));
    setPending(true);
    setError("");

    try {
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

      setSubmitted(true);
      setChanges("");
      setFiles([]);
      setFileId("");
      await onRefresh();
    } catch {
      setSubmitted(false);
      setError("Could not send the revision request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Documents</h2>
      {drafts.length === 0 ? (
        <article className="mt-4 max-w-3xl rounded-2xl bg-card shadow-sm">
          <EmptyState
            icon={FileText}
            title="No draft to revise"
            description="You can request changes after DTA sends a draft."
          />
        </article>
      ) : (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-6 shadow-sm sm:px-6"
          noValidate
        >
          <h3 className="text-sm font-semibold text-ink">Request Changes</h3>

          {onlyDraft ? (
            <p className="mt-4 text-sm text-muted">
              Changes apply to{" "}
              <span className="font-medium text-ink">{onlyDraft.filename}</span>.
            </p>
          ) : (
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-ink">
                Which draft should we change?
              </legend>
              <div className="mt-2 space-y-2">
                {drafts.map((draft) => (
                  <label
                    key={draft.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm text-ink"
                  >
                    <input
                      type="radio"
                      name="revision-draft"
                      value={draft.id}
                      checked={fileId === draft.id}
                      onChange={() => setFileId(draft.id)}
                      className="accent-navy"
                    />
                    <span className="truncate">{draft.filename}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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

          <p className="mt-5 text-sm font-medium text-ink">Supporting documents</p>
          <p className="mt-1 text-sm text-muted">Optional. Add files that show the change you want.</p>
          <div className="mt-3">
            <FileDropzone
              files={files}
              onAdd={(incoming) =>
                setFiles((current) => {
                  const names = new Set(current.map((file) => file.name));
                  return [
                    ...current,
                    ...incoming.filter((file) => !names.has(file.name)),
                  ];
                })
              }
              onRemove={(name) =>
                setFiles((current) => current.filter((file) => file.name !== name))
              }
            />
          </div>

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
              disabled={!request.canRevise || pending}
              aria-busy={pending}
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit revision"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
