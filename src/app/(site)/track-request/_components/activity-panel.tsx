import type { TrackedRequest } from "@/content/track-request";

export function ActivityPanel({ request }: { request: TrackedRequest }) {
  return (
    <section>
      <h2 className="sr-only">Activity</h2>
      {request.activity.length === 0 ? (
        <article className="rounded-2xl bg-card px-6 py-10 text-center text-sm text-muted shadow-sm">
          No activity yet.
        </article>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {request.activity.map((item) => (
            <li key={item.id} className="rounded-2xl bg-card px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-ink">{item.message}</p>
              <p className="mt-1 text-xs text-muted">{item.at}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
