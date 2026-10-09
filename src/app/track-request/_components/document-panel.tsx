import { FileText } from "lucide-react";
import { versionLabel, type TrackedRequest } from "@/content/track-request";

type DocumentPanelProps = {
  request: TrackedRequest;
};

export function DocumentPanel({ request }: DocumentPanelProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Documents</h2>
      <div className="mt-4 space-y-4">
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
                  key={`${index}-${file.filename}`}
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
