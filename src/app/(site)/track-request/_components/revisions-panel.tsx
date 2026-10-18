"use client";

import { FileText, MessageSquare } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Modal } from "@/components/ui/modal";
import type { TrackedRequest } from "@/content/track-request";
import { downloadStoredFile } from "@/lib/download-file";

type RevisionsPanelProps = {
  request: TrackedRequest;
  onRefresh: () => Promise<void>;
};

export function RevisionsPanel({ request, onRefresh }: RevisionsPanelProps) {
  const drafts = request.documents.flatMap((group) =>
    group.files.filter((file) => file.kind === "draft"),
  );
  const onlyDraft = drafts.length === 1 ? drafts[0] : null;
  const canRequest = request.canRevise && drafts.length > 0;
  const [open, setOpen] = useState(false);
  const [fileId, setFileId] = useState("");
  const [changes, setChanges] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const targetId = onlyDraft?.id ?? fileId;
  const reason =
    drafts.length === 0
      ? "You can request changes after DTA sends a draft."
      : "You can request changes when a new draft is ready for review.";

  function close() {
    if (pending) {
      return;
    }

    setOpen(false);
  }

  async function download(id: string) {
    setError("");
    setDownloading(id);

    try {
      await downloadStoredFile(id);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Could not download the file.",
      );
    } finally {
      setDownloading(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!request.canRevise) {
      setError("A revision can be requested when a draft is ready for review.");
      return;
    }

    if (!targetId || !changes.trim()) {
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
        setError(payload.error || "Could not send the revision request.");
        return;
      }

      setOpen(false);
      setChanges("");
      setFiles([]);
      setFileId("");
      await onRefresh();
    } catch {
      setError("Could not send the revision request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Revisions</h2>
          <p className="mt-1 text-sm text-muted">
            Change requests you have sent for this draft.
          </p>
        </div>
        <div className="sm:text-right">
          <button
            ref={buttonRef}
            type="button"
            disabled={!canRequest}
            onClick={() => {
              setError("");
              setOpen(true);
            }}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            Request changes
          </button>
          {canRequest ? null : (
            <p className="mt-2 max-w-xs text-sm text-muted sm:ml-auto">{reason}</p>
          )}
        </div>
      </div>

      {error && !open ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {request.revisions.length === 0 ? (
        <article className="mt-4 max-w-3xl rounded-2xl bg-card shadow-sm">
          <EmptyState
            icon={MessageSquare}
            title="No revision requests yet"
            description="Change requests you send will show up here."
          />
        </article>
      ) : (
        <ul className="mt-4 max-w-3xl space-y-4">
          {request.revisions.map((revision) => (
            <li
              key={revision.id}
              className="rounded-2xl bg-card px-5 py-5 shadow-sm sm:px-6"
            >
              <p className="text-xs text-muted">{revision.createdAt}</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Changes for {revision.targetFilename}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
                {revision.note}
              </p>
              {revision.attachments.length ? (
                <ul className="mt-4 space-y-2">
                  {revision.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <button
                        type="button"
                        disabled={downloading !== null}
                        aria-busy={downloading === attachment.id}
                        onClick={() => void download(attachment.id)}
                        className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-navy disabled:opacity-60"
                      >
                        <FileText className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">
                          {downloading === attachment.id
                            ? "Downloading…"
                            : attachment.filename}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Request changes"
        returnFocusRef={buttonRef}
        tone="site"
        dismissible={!pending}
      >
        <form onSubmit={(event) => void onSubmit(event)} noValidate>
          {onlyDraft ? (
            <p className="text-sm text-muted">
              Changes apply to{" "}
              <span className="font-medium text-ink">{onlyDraft.filename}</span>.
            </p>
          ) : (
            <fieldset>
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
          <p className="mt-1 text-sm text-muted">
            Optional. Add files that show the change you want.
          </p>
          <div className="mt-3">
            <FileDropzone
              files={files}
              onAdd={(incoming) =>
                setFiles((current) => {
                  const names = new Set(current.map((file) => file.name));
                  return [...current, ...incoming.filter((file) => !names.has(file.name))];
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

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!request.canRevise || pending || !targetId || !changes.trim()}
              aria-busy={pending}
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit revision"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
