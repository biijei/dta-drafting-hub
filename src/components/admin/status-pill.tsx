import { twMerge } from "tailwind-merge";
import type { PaymentStatus, RequestStatus } from "@/content/admin";

const pillClass: Record<RequestStatus | PaymentStatus, string> = {
  "Awaiting Your Review": "bg-[#F4E6CF] text-[#8C6840]",
  "In Progress": "bg-[#E6EAF8] text-[#5E73A8]",
  Completed: "bg-[#CCFFCC] text-[#3E9A57]",
  Submitted: "bg-[#E7EBF3] text-[#6D7C99]",
  "Pending Review": "bg-[#FFF3D6] text-[#8C6840]",
  "Awaiting Payment": "bg-[#F4E6CF] text-[#8C6840]",
  "Revision Requested": "bg-[#FDE8E8] text-[#C45C5C]",
  Approved: "bg-[#E6EAF8] text-[#3B5BDB]",
  Paid: "bg-[#CCFFCC] text-[#34A35A]",
  Pending: "bg-[#FFF3D6] text-[#8C6840]",
  Failed: "bg-[#FDE8E8] text-[#C45C5C]",
  Refunded: "bg-[#FDE8E8] text-[#C45C5C]",
};

export function isPillStatus(
  status: string,
): status is RequestStatus | PaymentStatus {
  return status in pillClass;
}

export function StatusPill({
  status,
  className,
}: {
  status: RequestStatus | PaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
        pillClass[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
