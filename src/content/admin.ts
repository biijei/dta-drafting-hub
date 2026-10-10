export const adminUserName = "Micah Ehioze";

export const assignees = ["Sarah Williams", "James doe"] as const;

export const requestStatuses = [
  "Awaiting Your Review",
  "In Progress",
  "Completed",
  "Submitted",
] as const;

export const paymentStatuses = ["Paid", "Pending", "Failed", "Refunded"] as const;

export type RequestStatus = (typeof requestStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];

export type AdminDocument = {
  id: string;
  filename: string;
  size: string;
  uploadedAt: string;
  author: string;
  note: string;
  group: string;
};

export type SubmittedFile = {
  name: string;
  size: string;
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
  assignee: string | null;
  documentType: string;
  destinationCountry: string;
  applicationType: string;
  currentStage: string;
  phone: string;
  country: string;
  stateRegion: string;
  company: string;
  preferredContact: string;
  submittedFile: SubmittedFile | null;
  documents: AdminDocument[];
  internalNote: string;
  featuredOnOverview: boolean;
  pendingRepeats: number;
  pendingLabel: string;
  pendingSubtitle: string;
};

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  country: string;
  totalRequests: number;
  active: number;
  completed: number;
  totalPaid: number;
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
  onPaymentsPage: boolean;
  onOverview: boolean;
};

export type AdminSettings = {
  businessName: string;
  primaryEmail: string;
  phone: string;
  address: string;
  disclaimer: string;
};

export type AdminData = {
  requests: AdminRequest[];
  clients: AdminClient[];
  payments: AdminPayment[];
  settings: AdminSettings;
};

export const overviewStats = {
  totalRequests: "248",
  totalChange: "+12 this month",
  newRequests: "9",
  newCaption: "Last 7 days",
  inProgress: "9",
  inProgressCaption: "Active",
  revenue: "$52,840",
  revenueCaption: "All time",
  awaitingClient: "248",
  awaitingCaption: "Needs attention",
  completed: "248",
  completedCaption: "All time",
};

export const paymentStats = {
  totalCollected: "$1,150",
  totalCaption: "All currencies",
  successful: "4",
  successfulCaption: "Transactions",
  pending: "4",
  pendingCaption: "Awaiting",
  refunded: "0",
  refundedCaption: "Transactions",
};

const defaultDisclaimer =
  "DTA Drafting Hub provides document drafting, review, and related support services. Services provided through this platform may vary by jurisdiction and service type. Submitting a request does not by itself establish a lawyer-client relationship. Where legal advice or representation is required, clients should consult a qualified legal professional licensed in the relevant jurisdiction.";

const employmentNote =
  "Updated review with additional non-compete analysis.";

const documentReview = (
  id: string,
  status: RequestStatus,
  assignee: string | null,
): AdminRequest => ({
  id,
  displayId: "DTA-2026-00482",
  title: "Document Review",
  clientName: "Marcus Chen",
  clientEmail: "marcus.chen@email.com",
  service: "Document Review",
  submittedAt: "20 Sep, 2026 10:15 am",
  status,
  paymentStatus: "Paid",
  assignee,
  documentType: "Document Review",
  destinationCountry: "-",
  applicationType: "-",
  currentStage: status,
  phone: "-",
  country: "London",
  stateRegion: "-",
  company: "-",
  preferredContact: "-",
  submittedFile: {
    name: "Parties involved",
    size: "500.0 KB",
  },
  documents: [],
  internalNote: "",
  featuredOnOverview: true,
  pendingRepeats: 0,
  pendingLabel: "",
  pendingSubtitle: "",
});

export const adminSeed: AdminData = {
  requests: [
    documentReview("doc-review-awaiting", "Awaiting Your Review", null),
    documentReview("doc-review-progress", "In Progress", "Sarah Williams"),
    documentReview("doc-review-completed", "Completed", "Sarah Williams"),
    documentReview("doc-review-submitted", "Submitted", "Sarah Williams"),
    {
      id: "immigration-00479",
      displayId: "DTA-2026-00479",
      title: "Immigration",
      clientName: "Marcus Chen",
      clientEmail: "priya.sharma@gmail.com",
      service: "Immigration",
      submittedAt: "20 Sep, 2026 10:15 am",
      status: "In Progress",
      paymentStatus: "Paid",
      assignee: null,
      documentType: "Visa Cover Letter",
      destinationCountry: "United Kingdom",
      applicationType: "Skilled Worker Visa",
      currentStage: "Preparing application",
      phone: "+91 98765 43210",
      country: "India",
      stateRegion: "Maharashtra",
      company: "-",
      preferredContact: "Maharashtra",
      submittedFile: {
        name: "Parties involved",
        size: "500.0 KB",
      },
      documents: [
        {
          id: "employment-v2",
          filename: "Employment_Contract_Review_V2",
          size: "500.0 KB",
          uploadedAt: "23 September 2026 at 11:30 am",
          author: "DTA Admin",
          note: employmentNote,
          group: "Employment Contract Review",
        },
        {
          id: "employment-v1",
          filename: "Employment_Contract_Review_V1",
          size: "480.0 KB",
          uploadedAt: "23 September 2026 at 11:30 am",
          author: "DTA Admin",
          note: employmentNote,
          group: "Employment Contract Review",
        },
      ],
      internalNote: "",
      featuredOnOverview: false,
      pendingRepeats: 2,
      pendingLabel: "Awaiting client review",
      pendingSubtitle: "Priya Sharma - Immigration",
    },
  ],
  clients: [
    {
      id: "marcus-chen",
      name: "Marcus Chen",
      email: "marcus.chen@email.com",
      country: "London",
      totalRequests: 2,
      active: 2,
      completed: 2,
      totalPaid: 2,
      lastActivity: "20 Sep, 2026\n10:15 am",
    },
    {
      id: "sophia-martinez",
      name: "Sophia Martinez",
      email: "sophia.martinez@email.com",
      country: "New York",
      totalRequests: 5,
      active: 3,
      completed: 4,
      totalPaid: 3,
      lastActivity: "18 Oct, 2026\n8:40 am",
    },
    {
      id: "liam-oconnor",
      name: "Liam O'Connor",
      email: "liam.oconnor@email.com",
      country: "Dublin",
      totalRequests: 7,
      active: 5,
      completed: 6,
      totalPaid: 6,
      lastActivity: "22 Sep, 2026\n3:30 pm",
    },
    {
      id: "aisha-khan",
      name: "Aisha Khan",
      email: "aisha.khan@email.com",
      country: "Dubai",
      totalRequests: 3,
      active: 1,
      completed: 2,
      totalPaid: 2,
      lastActivity: "19 Sep, 2026\n11:05 am",
    },
    {
      id: "ethan-johnson",
      name: "Ethan Johnson",
      email: "ethan.johnson@email.com",
      country: "Toronto",
      totalRequests: 4,
      active: 4,
      completed: 3,
      totalPaid: 3,
      lastActivity: "21 Sep, 2026\n9:20 am",
    },
    {
      id: "maya-fernandez",
      name: "Maya Fernandez",
      email: "maya.fernandez@email.com",
      country: "Madrid",
      totalRequests: 6,
      active: 3,
      completed: 5,
      totalPaid: 5,
      lastActivity: "20 Sep, 2026\n4:45 pm",
    },
    {
      id: "noah-kim",
      name: "Noah Kim",
      email: "noah.kim@email.com",
      country: "Seoul",
      totalRequests: 8,
      active: 6,
      completed: 7,
      totalPaid: 7,
      lastActivity: "23 Sep, 2026\n2:00 pm",
    },
    {
      id: "olivia-brown",
      name: "Olivia Brown",
      email: "olivia.brown@email.com",
      country: "Sydney",
      totalRequests: 3,
      active: 2,
      completed: 3,
      totalPaid: 3,
      lastActivity: "19 Sep, 2026\n5:15 pm",
    },
  ],
  payments: [
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `pay-page-${index + 1}`,
      transactionId: "PAY-482-01",
      clientName: "Marcus Chen",
      method: "Credit Card",
      amount: "AUD $220",
      status: "Paid" as const,
      date: "20 Sept, 2026 at 06:22 pm",
      onPaymentsPage: true,
      onOverview: false,
    })),
    {
      id: "pay-overview-marcus",
      transactionId: "DTA-2026-00482",
      clientName: "Marcus Chen",
      method: "Credit Card",
      amount: "AUD $220",
      status: "Paid",
      date: "20 Sept, 2026 at 06:22 pm",
      onPaymentsPage: false,
      onOverview: true,
    },
    {
      id: "pay-overview-sophie",
      transactionId: "DTA-2026-00483",
      clientName: "Sophie Nguyen",
      method: "Credit Card",
      amount: "AUD $315",
      status: "Pending",
      date: "20 Sept, 2026 at 06:22 pm",
      onPaymentsPage: false,
      onOverview: true,
    },
    {
      id: "pay-overview-liam",
      transactionId: "DTA-2026-00484",
      clientName: "Liam Johnson",
      method: "Credit Card",
      amount: "AUD $180",
      status: "Failed",
      date: "20 Sept, 2026 at 06:22 pm",
      onPaymentsPage: false,
      onOverview: true,
    },
  ],
  settings: {
    businessName: "",
    primaryEmail: "",
    phone: "",
    address: "",
    disclaimer: defaultDisclaimer,
  },
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
