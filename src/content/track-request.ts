export const sampleRequestId = "DTA-2026-00482";

export const workspaceTabs = [
  "Overview",
  "Document",
  "Revisions",
  "Payment",
  "Activity",
] as const;

export type WorkspaceTab = (typeof workspaceTabs)[number];

export type DocumentFile = {
  id: string;
  filename: string;
  uploadedAt: string;
  author: string;
  note: string;
  kind: "client_upload" | "draft" | "revision" | "final";
};

export type ActivityItem = {
  id: string;
  message: string;
  at: string;
};

export type DocumentGroup = {
  title: string;
  files: DocumentFile[];
};

export type ProcessStep = {
  label: string;
  complete: boolean;
};

export type TrackedRevision = {
  id: string;
  note: string;
  createdAt: string;
  targetFilename: string;
  attachments: { id: string; filename: string }[];
};

export type TrackedRequest = {
  id: string;
  title: string;
  status: string;
  submitted: string;
  specialist: string;
  estimatedCompletion: string;
  reviewNotice: {
    title: string;
    description: string;
  };
  process: ProcessStep[];
  documents: DocumentGroup[];
  payment: {
    status: string;
    transactionId: string;
    amount: string;
    method: string;
    date: string;
  };
  paymentUrl: string | null;
  activity: ActivityItem[];
  revisions: TrackedRevision[];
  canApprove: boolean;
  canRevise: boolean;
};

const employmentNote =
  "Updated review with additional non-compete analysis.";

const employmentFile = (
  filename: string,
): DocumentFile => ({
  id: filename,
  filename,
  uploadedAt: "23 September 2026 at 11:30 am",
  author: "DTA Admin",
  note: employmentNote,
  kind: "draft",
});

const sampleRequest: TrackedRequest = {
  id: sampleRequestId,
  title: "Document Review",
  status: "Awaiting your review",
  submitted: "20 September 2026 at 10:15 am",
  specialist: "Sarah Williams",
  estimatedCompletion: "2026-09-25",
  reviewNotice: {
    title: "Your document is ready for review",
    description:
      "Please review the latest version and approve or request changes.",
  },
  process: [
    { label: "Request Submitted", complete: true },
    { label: "Payment Confirmed", complete: true },
    { label: "Documents Reviewed", complete: true },
    { label: "Draft Uploaded", complete: false },
    { label: "Client Review", complete: false },
    { label: "Revision", complete: false },
    { label: "Final Approval", complete: false },
    { label: "Completed", complete: false },
  ],
  documents: [
    {
      title: "Employment Contract Review",
      files: [
        employmentFile("Employment_Contract_Review_V2"),
        employmentFile("Employment_Contract_Review_V1"),
      ],
    },
    {
      title: "Employment Contract Review",
      files: [employmentFile("Employment_Contract_Review_V1")],
    },
  ],
  payment: {
    status: "Paid",
    transactionId: "PAY-482-01",
    amount: "USD $220.00",
    method: "PayPal",
    date: "20 September 2026 at 06:22 pm",
  },
  paymentUrl: null,
  activity: [],
  revisions: [],
  canApprove: true,
  canRevise: true,
};

export function getTrackedRequest(id: string) {
  if (id.trim().toLowerCase() === sampleRequest.id.toLowerCase()) {
    return sampleRequest;
  }

  return undefined;
}

export function versionLabel(count: number) {
  return count === 1 ? "1 version" : `${count} version(s)`;
}

export function documentFilenames(request: TrackedRequest) {
  return [
    ...new Set(
      request.documents.flatMap((group) =>
        group.files.map((file) => file.filename),
      ),
    ),
  ];
}
