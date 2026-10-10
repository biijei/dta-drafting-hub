import { clsx } from "clsx";
import type { PaymentStatus, RequestStatus } from "@/content/admin";

const pillClass: Record<RequestStatus | PaymentStatus, string> = {
  "Awaiting Your Review": "bg-[#F4E6CF] text-[#8C6840]",
  "In Progress": "bg-[#E6EAF8] text-[#5E73A8]",
  Completed: "bg-[#DFF6E5] text-[#3E9A57]",
  Submitted: "bg-[#E7EBF3] text-[#6D7C99]",
  Paid: "bg-[#D9F5E4] text-[#34A35A]",
  Pending: "bg-[#D9F5E4] text-[#34A35A]",
  Failed: "bg-[#D9F5E4] text-[#34A35A]",
  Refunded: "bg-[#FDE8E8] text-[#C45C5C]",
};

export function StatusPill({
  status,
}: {
  status: RequestStatus | PaymentStatus;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
        pillClass[status],
      )}
    >
      {status}
    </span>
  );
}
