export type ProcessStep = {
  number: number;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Choose a service",
    description:
      "Browse our service directory and select the type of document support you need. Each service page explains what we can help with, typical deliverables, and pricing guidance.",
  },
  {
    number: 2,
    title: "Submit your request",
    description:
      "Complete a structured request form with details specific to your service. The more context you provide, the more accurately we can prepare your document.",
  },
  {
    number: 3,
    title: "Upload documents",
    description:
      "Securely upload any supporting files: existing drafts, reference documents, identification, or other materials relevant to your request.",
  },
  {
    number: 4,
    title: "Receive your quote",
    description:
      "We review your request and prepare a tailored quote. You'll receive the quote directly in your request workspace and by email. You can accept or decline.",
  },
  {
    number: 5,
    title: "Payment confirmation",
    description:
      "Once you accept the quote, we collect payment securely. A receipt is generated and attached to your request.",
  },
  {
    number: 6,
    title: "Document preparation",
    description:
      "Our specialist begins work on your document. You can track progress in real time from your request workspace.",
  },
  {
    number: 7,
    title: "Review your draft",
    description:
      "When your document is ready, you'll be notified. Review the draft in your workspace and approve it or request changes.",
  },
  {
    number: 8,
    title: "Approve & download",
    description:
      "Once you're satisfied, approve the final document. Download it directly from your workspace. Your request is marked complete.",
  },
];
