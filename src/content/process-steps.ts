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
    title: "Review your submission",
    description:
      "Check the details and files, then submit the request. No payment is taken on this step.",
  },
  {
    number: 5,
    title: "Request confirmation",
    description:
      "You receive a Request ID by email. Save it with the email on the request. That pair is how you track the request while DTA reviews the files.",
  },
  {
    number: 6,
    title: "Quoted payment",
    description:
      "DTA sets the price and emails a PayPal link. The same link is on the Payment tab. Work starts after PayPal confirms that payment.",
  },
  {
    number: 7,
    title: "Document preparation",
    description:
      "After payment, a specialist begins work on your document. You can track progress from your request workspace.",
  },
  {
    number: 8,
    title: "Review your draft",
    description:
      "When your document is ready, you'll be notified. Review the draft in your workspace and approve it or request changes.",
  },
  {
    number: 9,
    title: "Approve & download",
    description:
      "Once you're satisfied, approve the final document. Download it directly from your workspace. Your request is marked complete.",
  },
];
