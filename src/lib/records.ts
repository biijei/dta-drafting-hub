import {
  formatFileSize,
  formatShortStamp,
  formatUploadedAt,
  type AdminClient,
  type AdminDocument,
  type AdminPayment,
  type AdminRequest,
  type AdminRevision,
  type FileKind,
  type OverviewStats,
  type PaymentStatus,
  type PaymentSummary,
  type PendingAction,
  type RequestStatus,
} from "@/content/admin";
import { formatUsdCents, getService } from "@/content/services";
import type { DocumentFile, DocumentGroup, ProcessStep, TrackedRequest } from "@/content/track-request";

type ProfileRow = { id: string; full_name: string };

type FileRow = {
  id: string;
  request_id: string | null;
  revision_id: string | null;
  kind: FileKind;
  filename: string;
  size_bytes: number;
  note: string;
  author_name: string;
  created_at: string;
  deleted_at?: string | null;
};

type RevisionRow = {
  id: string;
  request_id: string;
  target_file_id: string | null;
  note: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  request_id: string | null;
  paypal_capture_id: string | null;
  paypal_order_id: string;
  amount_cents: number;
  status: PaymentStatus;
  method: string;
  paid_at: string | null;
  created_at: string;
};

export type RequestRow = {
  id: string;
  public_id: string;
  service_slug: string;
  service_title: string;
  status: RequestStatus;
  client_name: string;
  client_email: string;
  phone: string;
  company: string;
  country: string;
  region: string;
  contact_method: string;
  details: Record<string, string>;
  amount_cents: number;
  paypal_order_id: string | null;
  payment_url: string | null;
  assignee_id: string | null;
  internal_note: string;
  turnaround: string;
  created_at: string;
};

const fileGroups: Record<FileKind, string> = {
  client_upload: "Submitted documents",
  draft: "Drafts",
  revision: "Revision files",
  final: "Final document",
};

const processLabels = [
  "Request Submitted",
  "Payment Confirmed",
  "Documents Reviewed",
  "Draft Uploaded",
  "Client Review",
  "Revision",
  "Final Approval",
  "Completed",
];

function stamp(value: string) {
  return formatUploadedAt(new Date(value));
}

export function detailRows(slug: string, details: Record<string, string> | null) {
  const values = details ?? {};
  const service = getService(slug);

  if (!service) {
    return Object.entries(values).map(([label, value]) => ({
      label,
      value: value?.trim() || "—",
    }));
  }

  return service.fields.map((field) => ({
    label: field.label,
    value: values[field.id]?.trim() || "—",
  }));
}

function toDocument(file: FileRow): AdminDocument {
  return {
    id: file.id,
    filename: file.filename,
    size: formatFileSize(file.size_bytes),
    uploadedAt: stamp(file.created_at),
    author: file.author_name || "DTA",
    note: file.note,
    group: fileGroups[file.kind],
    kind: file.kind,
  };
}

export function toAdminRequest(
  request: RequestRow,
  files: FileRow[],
  revisions: RevisionRow[],
  profiles: ProfileRow[],
): AdminRequest {
  const mine = files.filter((file) => file.request_id === request.id);
  const assignee = profiles.find((profile) => profile.id === request.assignee_id);
  const requestRevisions = revisions.filter(
    (revision) => revision.request_id === request.id,
  );

  const revisionViews: AdminRevision[] = requestRevisions.map((revision) => {
    const target = mine.find((file) => file.id === revision.target_file_id);
    const attachments = mine.filter(
      (file) => file.kind === "revision" && file.revision_id === revision.id,
    );

    return {
      id: revision.id,
      note: revision.note,
      createdAt: stamp(revision.created_at),
      targetFilename: target?.filename ?? "Draft",
      attachments: attachments.map((file) => ({
        id: file.id,
        filename: file.filename,
      })),
    };
  });

  return {
    id: request.id,
    displayId: request.public_id,
    title: request.service_title,
    clientName: request.client_name,
    clientEmail: request.client_email,
    service: request.service_title,
    submittedAt: stamp(request.created_at),
    status: request.status,
    paymentStatus:
      request.status === "Pending Review" || request.status === "Awaiting Payment"
        ? "Pending"
        : "Paid",
    quotedAmount: request.amount_cents > 0 ? formatUsdCents(request.amount_cents) : "To be quoted",
    paymentUrl: request.payment_url,
    assigneeId: request.assignee_id,
    assignee: assignee?.full_name ?? null,
    detailRows: detailRows(request.service_slug, request.details),
    phone: request.phone || "—",
    country: request.country || "—",
    stateRegion: request.region || "—",
    company: request.company || "—",
    preferredContact: request.contact_method || "—",
    submittedFiles: mine
      .filter((file) => file.kind === "client_upload")
      .map((file) => ({
        id: file.id,
        name: file.filename,
        size: formatFileSize(file.size_bytes),
      })),
    documents: mine
      .filter(
        (file) =>
          !file.deleted_at && (file.kind === "draft" || file.kind === "final"),
      )
      .map(toDocument),
    revisions: revisionViews,
    internalNote: request.internal_note,
  };
}

export function toClients(requests: RequestRow[], payments: PaymentRow[]): AdminClient[] {
  const byEmail = new Map<string, RequestRow[]>();

  for (const request of requests) {
    const list = byEmail.get(request.client_email) ?? [];
    list.push(request);
    byEmail.set(request.client_email, list);
  }

  return [...byEmail.entries()]
    .map(([email, items]) => {
      const latest = [...items].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];
      const paid = payments
        .filter(
          (payment) =>
            payment.status === "Paid" &&
            items.some((item) => item.id === payment.request_id),
        )
        .reduce((sum, payment) => sum + payment.amount_cents, 0);

      return {
        id: email,
        name: latest.client_name,
        email,
        country: latest.country || "—",
        totalRequests: items.length,
        active: items.filter((item) => item.status !== "Completed").length,
        completed: items.filter((item) => item.status === "Completed").length,
        totalPaid: formatUsdCents(paid),
        lastActivity: formatShortStamp(new Date(latest.created_at)),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function toPayments(
  payments: PaymentRow[],
  requests: RequestRow[],
): AdminPayment[] {
  return [...payments]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((payment) => {
      const request = requests.find((item) => item.id === payment.request_id);

      return {
        id: payment.id,
        transactionId: payment.paypal_capture_id || payment.paypal_order_id,
        clientName: request?.client_name ?? "—",
        method: payment.method,
        amount: formatUsdCents(payment.amount_cents),
        status: payment.status,
        date: stamp(payment.paid_at ?? payment.created_at),
      };
    });
}

export function overviewStats(requests: RequestRow[], payments: PaymentRow[]): OverviewStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = requests.filter(
    (request) => new Date(request.created_at) >= monthStart,
  ).length;
  const collected = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + payment.amount_cents, 0);

  return {
    totalRequests: String(requests.length),
    totalChange: `+${thisMonth} this month`,
    newRequests: String(
      requests.filter((request) => new Date(request.created_at) >= weekAgo).length,
    ),
    newCaption: "Last 7 days",
    inProgress: String(
      requests.filter((request) => request.status === "In Progress").length,
    ),
    inProgressCaption: "Active",
    revenue: formatUsdCents(collected),
    revenueCaption: "All time",
    awaitingClient: String(
      requests.filter((request) => request.status === "Awaiting Your Review").length,
    ),
    awaitingCaption: "Needs attention",
    completed: String(
      requests.filter((request) => request.status === "Completed").length,
    ),
    completedCaption: "All time",
  };
}

export function paymentSummary(payments: PaymentRow[]): PaymentSummary {
  const sum = (status: PaymentStatus) =>
    payments.filter((payment) => payment.status === status);
  const collected = sum("Paid").reduce((total, payment) => total + payment.amount_cents, 0);

  return {
    totalCollected: formatUsdCents(collected),
    totalCaption: "USD",
    successful: String(sum("Paid").length),
    successfulCaption: "Transactions",
    pending: String(sum("Pending").length),
    pendingCaption: "Awaiting",
    refunded: String(sum("Refunded").length),
    refundedCaption: "Transactions",
  };
}

export function pendingActions(requests: AdminRequest[]): PendingAction[] {
  const labels: Partial<Record<RequestStatus, string>> = {
    "Pending Review": "Set a price",
    "Awaiting Payment": "Awaiting payment",
    Submitted: "New request",
    "Revision Requested": "Revision requested",
    Approved: "Upload the final document",
  };

  return requests
    .filter((request) => labels[request.status])
    .map((request) => ({
      id: request.id,
      displayId: request.displayId,
      label: labels[request.status] ?? "",
      subtitle: `${request.clientName} - ${request.service}`,
    }));
}

function processFor(status: RequestStatus, hasRevision: boolean): ProcessStep[] {
  const flags: Record<RequestStatus, boolean[]> = {
    "Pending Review": [true, false, false, false, false, false, false, false],
    "Awaiting Payment": [true, false, false, false, false, false, false, false],
    Submitted: [true, true, false, false, false, false, false, false],
    "In Progress": [true, true, true, false, false, false, false, false],
    "Awaiting Your Review": [true, true, true, true, false, false, false, false],
    "Revision Requested": [true, true, true, true, true, true, false, false],
    Approved: [true, true, true, true, true, hasRevision, true, false],
    Completed: [true, true, true, true, true, hasRevision, true, true],
  };

  return processLabels.map((label, index) => ({
    label,
    complete: flags[status][index] ?? false,
  }));
}

function reviewNotice(status: RequestStatus) {
  if (status === "Pending Review") {
    return {
      title: "Your request is being reviewed",
      description:
        "DTA is reviewing your files. A PayPal link for the quoted amount will be emailed once the price is set.",
    };
  }

  if (status === "Awaiting Payment") {
    return {
      title: "Your payment link is ready",
      description:
        "Pay the quoted amount from the Payment tab. Work starts after PayPal confirms the payment.",
    };
  }

  if (status === "Awaiting Your Review") {
    return {
      title: "Your document is ready for review",
      description: "Please review the latest draft and approve it or request changes.",
    };
  }

  if (status === "Revision Requested") {
    return {
      title: "We received your revision request",
      description: "DTA is updating the document. You will get an email when the next draft is ready.",
    };
  }

  if (status === "Approved") {
    return {
      title: "You approved the draft",
      description: "DTA is preparing the final document. You will get an email when it is ready to download.",
    };
  }

  if (status === "Completed") {
    return {
      title: "Your document is complete",
      description: "Download the final document from the Document tab.",
    };
  }

  return {
    title: "Request received",
    description: "DTA has your request and will prepare a draft.",
  };
}

export function toTrackedRequest(
  request: RequestRow,
  files: FileRow[],
  activity: { id: string; message: string; created_at: string }[],
  payment: PaymentRow | undefined,
  assigneeName: string | null,
  revisions: RevisionRow[],
): TrackedRequest {
  const mine = files.filter((file) => file.request_id === request.id);
  const revisionViews = revisions
    .filter((revision) => revision.request_id === request.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((revision) => {
      const target = mine.find((file) => file.id === revision.target_file_id);
      const attachments = mine.filter(
        (file) => file.kind === "revision" && file.revision_id === revision.id,
      );

      return {
        id: revision.id,
        note: revision.note,
        createdAt: stamp(revision.created_at),
        targetFilename: target?.filename ?? "Draft",
        attachments: attachments.map((file) => ({
          id: file.id,
          filename: file.filename,
        })),
      };
    });
  const groups = new Map<string, DocumentFile[]>();

  for (const file of mine) {
    if (file.kind === "revision") {
      continue;
    }

    const title = fileGroups[file.kind];
    const list = groups.get(title) ?? [];
    list.push({
      id: file.id,
      filename: file.filename,
      uploadedAt: stamp(file.created_at),
      author: file.author_name || "DTA",
      note: file.note,
      kind: file.kind,
    });
    groups.set(title, list);
  }

  const documents: DocumentGroup[] = [...groups.entries()].map(([title, groupFiles]) => ({
    title,
    files: groupFiles,
  }));

  return {
    id: request.public_id,
    title: request.service_title,
    status: request.status,
    submitted: stamp(request.created_at),
    specialist: assigneeName || "To be assigned",
    estimatedCompletion: request.turnaround,
    reviewNotice: reviewNotice(request.status),
    process: processFor(
      request.status,
      revisionViews.length > 0 || mine.some((file) => file.kind === "revision"),
    ),
    documents,
    payment: {
      status: payment?.status ?? "Pending",
      transactionId: payment?.paypal_capture_id || "—",
      amount:
        request.amount_cents > 0 ? formatUsdCents(request.amount_cents) : "To be quoted",
      method: "PayPal",
      date: payment ? stamp(payment.paid_at ?? payment.created_at) : "—",
    },
    paymentUrl: request.status === "Awaiting Payment" ? request.payment_url : null,
    activity: [...activity]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((item) => ({
        id: item.id,
        message: item.message,
        at: stamp(item.created_at),
      })),
    revisions: revisionViews,
    canApprove: request.status === "Awaiting Your Review",
    canRevise: request.status === "Awaiting Your Review",
  };
}
