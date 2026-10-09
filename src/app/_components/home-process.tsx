import { homeProcessSteps, supportNotes } from "@/content/home";

export function HomeProcess() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:py-16">
        <div className="text-center">
          <h2 className="font-sans! text-[32px] font-medium! leading-[1.26] tracking-normal text-ink">
            How It Works
          </h2>
          <p className="mt-2 font-sans text-base font-normal leading-[1.26] tracking-normal text-[#656565]">
            A clear, structured process from start to final document.
          </p>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {homeProcessSteps.map((step, index) => (
            <li key={step.number} className="relative text-center">
              {index < homeProcessSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-9 left-[calc(50%+2.25rem)] hidden h-px w-[calc(100%-4.5rem)] bg-navy/15 lg:block"
                />
              ) : null}
              <span className="relative mx-auto grid h-[4.5rem] w-[4.5rem] place-items-center overflow-hidden rounded-2xl bg-navy-soft">
                <span
                  aria-hidden
                  className="absolute -top-[5.8%] -left-[5.8%] aspect-square w-[191.6%] rounded-full bg-navy"
                />
                <span className="relative text-lg font-semibold text-white">
                  {step.number}
                </span>
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-[#F6F8FF]">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-start justify-center gap-8 px-4 py-8 sm:justify-between">
          {supportNotes.map((note) => (
            <article
              key={note.title}
              className="h-[100px] w-[284px] shrink-0 rounded-[13px] bg-card px-[9px] py-[13px] text-left shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ink">{note.title}</h3>
              <p className="mt-1 text-xs leading-4 text-muted">
                {note.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
