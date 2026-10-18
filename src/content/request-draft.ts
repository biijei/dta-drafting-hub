import type { TrackedRequest } from "@/content/track-request";
import { getService, type Service } from "@/content/services";

export type UploadedFile = {
  name: string;
  size: number;
};

export type ContactMethod = "Email" | "Phone" | "Both";

export type ClientInfo = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  region: string;
  contactMethod: ContactMethod;
};

export type Confirmation = {
  id: string;
  title: string;
  amount: string;
  turnaround: string;
};

export type RequestDraft = {
  slug: string;
  files: UploadedFile[];
  details: Record<string, string>;
  client: ClientInfo;
  step: number;
  confirmation: Confirmation | null;
};

export const emptyClient: ClientInfo = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  region: "",
  contactMethod: "Email",
};

const draftKey = "dta-request-draft";
const submittedKey = "dta-submitted-requests";
const emptySubmitted: Record<string, TrackedRequest> = {};

const draftListeners = new Set<() => void>();
const submittedListeners = new Set<() => void>();

let draftRaw: string | null | undefined;
let draftSnapshot: RequestDraft | null = null;
let submittedRaw: string | null | undefined;
let submittedSnapshot: Record<string, TrackedRequest> | null = null;

export const contactMethods: ContactMethod[] = ["Email", "Phone", "Both"];

export function emptyDraft(slug = ""): RequestDraft {
  return {
    slug,
    files: [],
    details: {},
    client: emptyClient,
    step: 0,
    confirmation: null,
  };
}

function parseJson<T>(raw: string) {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function emit(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener());
}

export function subscribeDraft(listener: () => void) {
  draftListeners.add(listener);
  return () => {
    draftListeners.delete(listener);
  };
}

export function subscribeSubmitted(listener: () => void) {
  submittedListeners.add(listener);
  return () => {
    submittedListeners.delete(listener);
  };
}

export function getDraftSnapshot() {
  const raw = window.sessionStorage.getItem(draftKey);
  if (raw === draftRaw) {
    return draftSnapshot;
  }

  draftRaw = raw;
  draftSnapshot = raw ? (parseJson<RequestDraft>(raw) ?? null) : null;
  return draftSnapshot;
}

export function getServerDraft(): RequestDraft | null | undefined {
  return undefined;
}

export function writeDraft(draft: RequestDraft) {
  const raw = JSON.stringify(draft);
  draftRaw = raw;
  draftSnapshot = draft;
  window.sessionStorage.setItem(draftKey, raw);
  emit(draftListeners);
}

export function clearDraft() {
  draftRaw = null;
  draftSnapshot = null;
  window.sessionStorage.removeItem(draftKey);
  emit(draftListeners);
}

export function getSubmittedSnapshot() {
  const raw = window.sessionStorage.getItem(submittedKey);
  if (raw === submittedRaw && submittedSnapshot) {
    return submittedSnapshot;
  }

  submittedRaw = raw;
  submittedSnapshot = raw
    ? (parseJson<Record<string, TrackedRequest>>(raw) ?? emptySubmitted)
    : emptySubmitted;
  return submittedSnapshot;
}

export function getServerSubmitted(): Record<string, TrackedRequest> | null {
  return null;
}

export function readSubmittedRequest(id: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  return getSubmittedSnapshot()[id];
}

export function saveSubmittedRequest(request: TrackedRequest) {
  const stored = { ...getSubmittedSnapshot(), [request.id]: request };
  const raw = JSON.stringify(stored);
  submittedRaw = raw;
  submittedSnapshot = stored;
  window.sessionStorage.setItem(submittedKey, raw);
  emit(submittedListeners);
}

export function formatSubmittedAt(date: Date) {
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

  return `${day} at ${time}`;
}

export function buildTrackedRequest(
  draft: RequestDraft,
  service: Service,
  id: string,
): TrackedRequest {
  const submitted = formatSubmittedAt(new Date());

  return {
    id,
    title: service.title,
    status: "Request submitted",
    submitted,
    specialist: "To be assigned",
    estimatedCompletion: service.turnaround,
    reviewNotice: {
      title: "Request received",
      description:
        "We've received your request and will be in touch shortly.",
    },
    process: [
      { label: "Request Submitted", complete: true },
      { label: "Payment Confirmed", complete: true },
      { label: "Documents Reviewed", complete: false },
      { label: "Draft Uploaded", complete: false },
      { label: "Client Review", complete: false },
      { label: "Revision", complete: false },
      { label: "Final Approval", complete: false },
      { label: "Completed", complete: false },
    ],
    documents: draft.files.length
      ? [
          {
            title: service.title,
            files: draft.files.map((file) => ({
              id: file.name,
              filename: file.name,
              uploadedAt: submitted,
              author: draft.client.fullName,
              note: "Uploaded with your request.",
              kind: "client_upload" as const,
            })),
          },
        ]
      : [],
    payment: {
      status: "Pending",
      transactionId: "—",
      amount: "To be quoted",
      method: "PayPal",
      date: "—",
    },
    paymentUrl: null,
    activity: [],
    canApprove: false,
    canRevise: false,
  };
}

export function serviceFromDraft(draft: RequestDraft) {
  return getService(draft.slug);
}
