import { importantNotice } from "@/content/services";

export function ImportantNotice() {
  return (
    <aside className="rounded-2xl bg-notice px-5 py-4 text-sm leading-6 text-muted">
      <p>
        <span className="font-semibold text-ink">Important Notice: </span>
        {importantNotice}
      </p>
    </aside>
  );
}
