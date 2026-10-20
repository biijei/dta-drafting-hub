import { Activity } from "lucide-react";
import type { TrackedRequest } from "@/content/track-request";
import { EmptyState } from "@/components/ui/empty-state";

export function ActivityPanel({ request }: { request: TrackedRequest }) {
  const events = request.activity;

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">Activity</h2>
      {events.length === 0 ? (
        <article className="mt-4 max-w-3xl rounded-2xl bg-card shadow-sm">
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Updates about your request will show up here."
          />
        </article>
      ) : (
        <article className="mt-4 max-w-3xl rounded-2xl bg-card px-5 py-6 shadow-sm sm:px-6">
          <ol>
            {events.map((item, index) => {
              const latest = index === 0;
              const last = index === events.length - 1;

              return (
                <li key={item.id} className="flex gap-4">
                  <div
                    className="flex w-5 shrink-0 flex-col items-center"
                    aria-hidden
                  >
                    {latest ? (
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-wash">
                        <span className="h-2 w-2 rounded-full bg-navy" />
                      </span>
                    ) : (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-navy-soft" />
                    )}
                    {last ? null : <span className="my-1.5 w-px flex-1 bg-line" />}
                  </div>
                  <div className={last ? "min-w-0 pt-0.5" : "min-w-0 pt-0.5 pb-8"}>
                    <p className="text-sm font-medium leading-6 text-ink">
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-muted">{item.at}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </article>
      )}
    </section>
  );
}
