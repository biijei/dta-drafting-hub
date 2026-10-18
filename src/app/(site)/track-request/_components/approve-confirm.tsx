"use client";

import { Check } from "lucide-react";
import type { RefObject } from "react";
import { Modal } from "@/components/ui/modal";

type ApproveConfirmProps = {
  open: boolean;
  pending: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export function ApproveConfirm({
  open,
  pending,
  error,
  onClose,
  onConfirm,
  returnFocusRef,
}: ApproveConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!pending}
      tone="site"
      title="Approve this document?"
      description="Approving means you are satisfied with the document and the service. This request will be complete, and no further revision will be accepted."
      icon={
        <span className="grid size-11 place-items-center rounded-full bg-gold-light text-navy">
          <Check className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
      }
      returnFocusRef={returnFocusRef}
    >
      {error ? (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-full border border-line bg-transparent px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-navy hover:text-navy disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          aria-busy={pending}
          className="rounded-full border border-check bg-approve px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-approve/90 disabled:opacity-60"
        >
          {pending ? "Approving…" : "Approve and finish"}
        </button>
      </div>
    </Modal>
  );
}
