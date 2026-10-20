import { ArrowDown, ArrowRight } from "lucide-react";
import { processPhases, type ProcessStep } from "@/content/process-steps";

function StepCopy({ step }: { step: ProcessStep }) {
  return (
    <>
      <h2 className="text-base font-semibold text-navy">{step.title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
      {step.note ? <p className="mt-2 text-xs leading-5 text-navy-mid">{step.note}</p> : null}
    </>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-semibold text-white">
      {number}
    </span>
  );
}

function MobileTimeline() {
  return (
    <ol className="lg:hidden">
      {processPhases.map((phase, phaseIndex) => (
        <li key={phase.id}>
          <div className="flex gap-4 pb-4">
            <span className="flex w-10 justify-center" aria-hidden>
              {phaseIndex > 0 ? <span className="w-px bg-navy/20" /> : null}
            </span>
            <p className="text-xs font-semibold tracking-wide text-navy-bright uppercase">
              {phase.label}
            </p>
          </div>
          <ol>
            {phase.steps.map((step, stepIndex) => {
              const isLast =
                phaseIndex === processPhases.length - 1 &&
                stepIndex === phase.steps.length - 1;

              return (
                <li key={step.number} className="flex gap-4">
                  <div className="flex w-10 flex-col items-center" aria-hidden>
                    <StepNumber number={step.number} />
                    {isLast ? null : <span className="my-1 w-px flex-1 bg-navy/20" />}
                  </div>
                  <div className={isLast ? "min-w-0 pt-1.5" : "min-w-0 pt-1.5 pb-6"}>
                    <StepCopy step={step} />
                  </div>
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function DesktopJourney() {
  return (
    <div className="hidden lg:block">
      {processPhases.map((phase, phaseIndex) => (
        <div key={phase.id}>
          {phaseIndex > 0 ? (
            <div className="flex flex-col items-center py-3 text-navy/35" aria-hidden>
              <span className="h-6 w-px bg-navy/20" />
              <ArrowDown className="h-4 w-4" />
            </div>
          ) : null}
          <section className="rounded-[1.75rem] bg-navy-wash px-6 py-6">
            <p className="text-xs font-semibold tracking-wide text-navy-bright uppercase">
              {phase.label}
            </p>
            <ol className="mt-5 grid grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)_2.75rem_minmax(0,1fr)] items-stretch">
              {phase.steps.map((step, stepIndex) => (
                <li key={step.number} className="contents">
                  <article className="flex flex-col rounded-2xl border border-line bg-card px-4 py-5">
                    <StepNumber number={step.number} />
                    <div className="mt-3">
                      <StepCopy step={step} />
                    </div>
                  </article>
                  {stepIndex < phase.steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="flex items-center justify-center text-navy/40"
                    >
                      <span className="h-px w-3 bg-navy/25" />
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      ))}
    </div>
  );
}

export function ProcessSteps() {
  return (
    <div>
      <MobileTimeline />
      <DesktopJourney />
    </div>
  );
}
