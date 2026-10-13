type PageHeroProps = {
  title: string;
  description?: string;
  variant?: "inset";
};

const titleClassName =
  "max-w-3xl font-heading text-[28px] font-medium leading-[0.97] tracking-normal text-white md:text-[40px]";

const descriptionClassName =
  "mt-3 max-w-2xl font-sans text-base font-normal leading-[1.26] tracking-normal text-white";

export function PageHero({ title, description, variant }: PageHeroProps) {
  const copy = (
    <>
      <h1 className={titleClassName}>{title}</h1>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
    </>
  );

  if (variant === "inset") {
    return (
      <section className="mx-auto w-full max-w-[90rem] px-4 pt-6">
        <div className="relative flex min-h-[13rem] items-center overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-navy to-navy-bright px-6 py-8 sm:px-12">
          <div className="relative">{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[250px] items-center overflow-hidden bg-gradient-to-r from-navy to-navy-bright py-10">
      <div className="relative mx-auto w-full max-w-[90rem] px-4">{copy}</div>
    </section>
  );
}
