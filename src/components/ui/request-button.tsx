import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { requestServiceHref } from "@/content/navigation";

type RequestButtonProps = {
  className?: string;
  href?: string;
  label?: string;
  showArrow?: boolean;
};

export function RequestButton({
  className,
  href = requestServiceHref,
  label = "Request a service",
  showArrow = false,
}: RequestButtonProps) {
  return (
    <Link
      href={href}
      className={twMerge(
        "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90",
        className,
      )}
    >
      {label}
      {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </Link>
  );
}
