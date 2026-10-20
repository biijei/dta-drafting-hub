import { Loader2 } from "lucide-react";

type PageLoadingProps = {
  label?: string;
};

export function PageLoading({ label = "Loading" }: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16"
    >
      <span className="lookup-ring grid h-14 w-14 place-items-center rounded-full bg-lime text-navy">
        <Loader2 className="page-loading-spin h-6 w-6" aria-hidden />
      </span>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
