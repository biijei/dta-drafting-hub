import { processSteps } from "@/content/process-steps";

export function ProcessSteps() {
  return (
    <ol className="flex flex-col gap-4">
      {processSteps.map((step) => (
        <li
          key={step.number}
          className="flex items-start gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5"
        >
          <span className="relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl bg-navy-soft">
            <span
              aria-hidden
              className="absolute -top-[5.8%] -left-[5.8%] aspect-square w-[191.6%] rounded-full bg-navy"
            />
            <span className="relative text-lg font-semibold text-white">
              {step.number}
            </span>
          </span>
          <div className="min-w-0 pt-1">
            <h2 className="text-base font-semibold text-navy">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
