"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { versionLabel, type TrackedRequest } from "@/content/track-request";
import { downloadStoredFile } from "@/lib/download-file";

type DocumentPanelProps = {
  request: TrackedRequest;
  onRefresh: () => Promise<void>;
};

export function DocumentPanel({ request, onRefresh }: DocumentPanelProps) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function approve() {
    setError("");
    const response = await fetch(`/api/track/requests/${request.id}/approve`, {
      method: "POST",
    });
    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error || "Could not approve the document.");
      return;
    }

    setMessage("Document approved.");
    await onRefresh();
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Documents</h2>
        {request.canApprove ? (
          <button
            type="button"
            onClick={() => void approve()}
            className="rounded-full bg-navy px-5 py-2 text-sm font-medium text-white"
          >
            Approve draft
          </button>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm font-medium text-navy">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 space-y-4">
        {request.documents.length === 0 ? (
          <article className="rounded-2xl bg-card px-5 py-6 text-sm text-muted shadow-sm">
            Documents will appear here after DTA uploads a draft.
          </article>
        ) : null}
        {request.documents.map((group, index) => (
          <article
            key={`${group.title}-${index}`}
            className="rounded-2xl bg-card px-5 py-4 shadow-sm sm:px-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
              <p className="shrink-0 text-sm text-muted">
                {versionLabel(group.files.length)}
              </p>
            </div>
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {group.files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 gap-3">
                    <FileText
                      className="mt-0.5 h-5 w-5 shrink-0 text-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted">
                        {file.uploadedAt} · {file.author}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-ink">
                        {file.filename}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">{file.note}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void downloadStoredFile(file.id).catch((downloadError: unknown) =>
                        setError(
                          downloadError instanceof Error
                            ? downloadError.message
                            : "Could not download the file.",
                        ),
                      )
                    }
                    className="shrink-0 self-start rounded-full border border-line px-4 py-1.5 text-sm text-ink transition-colors hover:border-navy hover:text-navy sm:self-center"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
