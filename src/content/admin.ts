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

const displayTimeZone = "America/New_York";

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value);
}

function timeZoneOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  let hour = partValue(parts, "hour");
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    partValue(parts, "year"),
    partValue(parts, "month") - 1,
    partValue(parts, "day"),
    hour,
    partValue(parts, "minute"),
    partValue(parts, "second"),
  );

  return asUtc - date.getTime();
}

function easternInstant(year: number, month: number, day: number) {
  const wall = Date.UTC(year, month - 1, day);
  let utc = wall;

  for (let pass = 0; pass < 2; pass += 1) {
    utc = wall - timeZoneOffsetMs(new Date(utc));
  }

  return new Date(utc);
}

function easternCalendar(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return {
    year: partValue(parts, "year"),
    month: partValue(parts, "month"),
    day: partValue(parts, "day"),
  };
}

export function easternMonthStart(now = new Date()) {
  const { year, month } = easternCalendar(now);
  return easternInstant(year, month, 1);
}

export function easternDaysAgoStart(days: number, now = new Date()) {
  const { year, month, day } = easternCalendar(now);
  const shifted = new Date(Date.UTC(year, month - 1, day - days));

  return easternInstant(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

function easternZoneLabel(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimeZone,
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? "EST";
}

function easternClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

export function formatUploadedAt(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: displayTimeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return `${day} at ${easternClock(date)} ${easternZoneLabel(date)}`;
}

export function formatShortStamp(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: displayTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return `${day}\n${easternClock(date)} ${easternZoneLabel(date)}`;
}
