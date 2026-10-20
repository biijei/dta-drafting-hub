export const requestStatuses = [
  "Pending Review",
  "Awaiting Payment",
  "Awaiting Your Review",
  "In Progress",
  "Completed",
  "Submitted",
  "Revision Requested",
  "Approved",
] as const;

export const paymentStatuses = ["Paid", "Pending", "Failed", "Refunded"] as const;

export type RequestStatus = (typeof requestStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type StaffRole = "owner" | "specialist";
export type FileKind = "client_upload" | "draft" | "revision" | "final";

export type AdminDocument = {
  id: string;
  filename: string;
  size: string;
  uploadedAt: string;
  author: string;
  note: string;
  group: string;
  kind: FileKind;
};

export type SubmittedFile = {
  id: string;
  name: string;
  size: string;
};

export type AdminRevision = {
  id: string;
  note: string;
  createdAt: string;
  targetFilename: string;
  attachments: { id: string; filename: string }[];
};

export type AdminRequest = {
  id: string;
  displayId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  service: string;
  submittedAt: string;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  quotedAmount: string;
  paymentUrl: string | null;
  assigneeId: string | null;
  assignee: string | null;
  detailRows: { label: string; value: string }[];
  phone: string;
  country: string;
  stateRegion: string;
  company: string;
  preferredContact: string;
  submittedFiles: SubmittedFile[];
  documents: AdminDocument[];
  revisions: AdminRevision[];
  internalNote: string;
};

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  country: string;
  totalRequests: number;
  active: number;
  completed: number;
  totalPaid: string;
  lastActivity: string;
};

export type AdminPayment = {
  id: string;
  transactionId: string;
  clientName: string;
  method: string;
  amount: string;
  status: PaymentStatus;
  date: string;
};

export type AdminSettings = {
  businessName: string;
  primaryEmail: string;
  phone: string;
  address: string;
  disclaimer: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
};

export type OverviewStats = {
  totalRequests: string;
  totalChange: string;
  newRequests: string;
  newCaption: string;
  inProgress: string;
  inProgressCaption: string;
  revenue: string;
  revenueCaption: string;
  awaitingClient: string;
  awaitingCaption: string;
  completed: string;
  completedCaption: string;
};

export type PaymentSummary = {
  totalCollected: string;
  totalCaption: string;
  successful: string;
  successfulCaption: string;
  pending: string;
  pendingCaption: string;
  refunded: string;
  refundedCaption: string;
};

export type PendingAction = {
  id: string;
  displayId: string;
  label: string;
  subtitle: string;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

export function formatUploadedAt(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();

  return `${day} at ${time}`;
}

export function formatShortStamp(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();

  return `${day}\n${time}`;
}
