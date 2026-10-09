const marqueeItems = [
  "Legal Drafting",
  "AFFIDAVITS",
  "DECLARATIONS",
  "PETITIONS",
  "BUSINESS",
  "CREATING POLICIES",
  "PROCEDURES",
  "PROPOSALS",
  "REPORTS",
  "BUSINESS LETTERS",
  "CONTRACTS",
  "REFINING AGREEMENTS",
];

type MarqueeTone = "dark" | "light" | "home";

const itemType =
  "px-3 font-sans text-[14px] font-medium leading-[1.47] tracking-normal uppercase";

function itemClass(tone: MarqueeTone, index: number) {
  if (tone === "home") {
    return index % 2 === 0
      ? `${itemType} text-lime`
      : `${itemType} text-white`;
  }

  if (index % 2 === 0) {
    return tone === "dark"
      ? `${itemType} text-marquee`
      : `${itemType} text-navy`;
  }

  return `${itemType} text-gold`;
}

function MarqueeRow({
  copyLabel,
  tone,
}: {
  copyLabel: string;
  tone: MarqueeTone;
}) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={copyLabel === "repeat"}>
      {marqueeItems.map((item, index) => (
        <li key={`${copyLabel}-${item}`} className="flex items-center">
          <span className={itemClass(tone, index)}>{item}</span>
          <span
            aria-hidden
            className={tone === "home" ? "text-xs text-white" : "text-xs text-gold"}
          >
            •
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ServiceMarquee({ tone = "dark" }: { tone?: MarqueeTone }) {
  return (
    <section
      aria-label="Document types"
      className={
        tone === "light"
          ? "overflow-hidden py-4"
          : "overflow-hidden bg-navy py-3.5"
      }
    >
      <div className="marquee-track flex w-max">
        <MarqueeRow copyLabel="primary" tone={tone} />
        <MarqueeRow copyLabel="repeat" tone={tone} />
      </div>
    </section>
  );
}
