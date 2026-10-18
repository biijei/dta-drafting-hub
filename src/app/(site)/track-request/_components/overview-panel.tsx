"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { TrackedRequest } from "@/content/track-request";

type OverviewPanelProps = {
  request: TrackedRequest;
  onRequestChange: () => void;
  onViewDocument: () => void;
  onRefresh: () => Promise<void>;
};

const statusFields = (request: TrackedRequest) => [
  { label: "Status", value: request.status, pill: true, alignEnd: false },
  { label: "Submitted", value: request.submitted, pill: false, alignEnd: false },
  { label: "Specialist", value: request.specialist, pill: false, alignEnd: false },
  {
    label: "Estimated completion time",
    value: request.estimatedCompletion,
    pill: false,
    alignEnd: true,
  },
];

export function OverviewPanel({
  request,
  onRequestChange,
  onViewDocument,
  onRefresh,
}: OverviewPanelProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)]">
      <div className="space-y-4">
        <article className="rounded-2xl border border-line bg-card px-6 py-6">
          <h2 className="text-lg font-semibold text-ink">Request Status</h2>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statusFields(request).map((field) => (
              <div
                key={field.label}
                className={
                  field.alignEnd ? "min-w-0 lg:text-right" : "min-w-0"
                }
              >
                <dt className="text-sm text-gray">{field.label}</dt>
                <dd className="mt-2">
                  {field.pill ? (
                    <span className="inline-flex rounded-full bg-gold-light px-3 py-1 text-sm font-medium text-ink">
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-ink">
                      {field.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-2xl border border-line bg-cream px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold text-ink">
            {request.reviewNotice.title}
          </h2>
          <p className="mt-1 text-sm text-change">
            {request.reviewNotice.description}
          </p>
          {message ? (
            <p className="mt-4 text-sm font-medium text-navy" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {request.canApprove ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  void fetch(`/api/track/requests/${request.id}/approve`, {
                    method: "POST",
                  })
                    .then(async (response) => {
                      const body = (await response.json()) as { error?: string };
                      if (!response.ok) {
                        setError(body.error || "Could not approve the document.");
                        return;
                      }

                      setMessage("Document approved.");
                      await onRefresh();
                    })
                    .catch(() => setError("Could not approve the document."));
                }}
                className="rounded-full border border-check bg-approve px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-approve/90"
              >
                Approve document
              </button>
            ) : null}
            <button
              type="button"
              onClick={onRequestChange}
              className="rounded-full border border-change bg-transparent px-5 py-2.5 text-sm font-medium text-change"
            >
              Request change
            </button>
            <button
              type="button"
              onClick={onViewDocument}
              className="rounded-full border border-muted bg-transparent px-5 py-2.5 text-sm font-medium text-muted"
            >
              View document
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-line bg-card px-5 py-5 shadow-sm sm:px-6">
        <h2 className="text-base font-semibold text-ink">Process</h2>
        <ol className="mt-5 space-y-3.5">
          {request.process.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              {step.complete ? (
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-check text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
              ) : (
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-line"
                  aria-hidden
                />
              )}
              <span
                className={
                  step.complete
                    ? "text-sm font-medium text-navy"
                    : "text-sm text-muted"
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
