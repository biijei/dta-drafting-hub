export const faqFilters = [
  "All",
  "Service",
  "Process",
  "Files",
  "Payment",
  "Tracking",
] as const;

export type FaqFilter = (typeof faqFilters)[number];
export type FaqCategory = Exclude<FaqFilter, "All">;

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
};

export const faqItems: FaqItem[] = [
  {
    id: "services",
    category: "Service",
    question: "What services does DTA Drafting Hub provide?",
    answer:
      "We provide legal drafting, contract drafting, immigration document support, business documents, correspondence drafting, and document review services.",
  },
  {
    id: "legal-advice",
    category: "Service",
    question: "Can DTA Drafting Hub provide legal advice?",
    answer:
      "DTA Drafting Hub provides document drafting and review services only. We do not provide legal advice. For legal advice specific to your circumstances, please consult a qualified legal professional licensed in the relevant jurisdiction.",
  },
  {
    id: "turnaround",
    category: "Process",
    question: "How long does it take to complete a request?",
    answer:
      "Timing depends on the document and the details you provide. Each service shows its expected turnaround. Work starts after DTA reviews the request and PayPal confirms the quoted payment.",
  },
  {
    id: "changes",
    category: "Process",
    question: "Can I request changes to my document?",
    answer:
      "Yes. When your draft is ready, review it in your workspace. You can approve it or request changes before the final document is prepared.",
  },
  {
    id: "after-submit",
    category: "Process",
    question: "What happens after I submit a request?",
    answer:
      "We save the request and email you a Request ID. DTA reviews the files, then emails a PayPal link for the quoted USD amount. Work starts after that payment is confirmed. Track the request with the Request ID and the email on the request.",
  },
  {
    id: "file-types",
    category: "Files",
    question: "What file types can I upload?",
    answer:
      "You can upload existing drafts, reference documents, identification, and other materials relevant to your request. The upload step shows which files are accepted.",
  },
  {
    id: "confidential",
    category: "Service",
    question: "Is my information kept confidential?",
    answer:
      "Your documents and personal information are handled with strict confidentiality and are never shared without your consent.",
  },
  {
    id: "when-pay",
    category: "Payment",
    question: "When do I pay?",
    answer:
      "Submit the request and files first. DTA reviews them and emails a PayPal link for the quoted USD amount. The same link is on the Payment tab of your request workspace. Work starts after PayPal confirms the payment.",
  },
  {
    id: "payment-methods",
    category: "Payment",
    question: "What payment methods are accepted?",
    answer:
      "PayPal, in USD. The payment link is emailed after DTA sets the price, and it is also shown in your request workspace.",
  },
  {
    id: "tracking",
    category: "Tracking",
    question: "How do I track my request?",
    answer:
      "Open Track My Request and enter your Request ID plus the email on the request. From there you can pay, follow the draft, request changes, and download the final document.",
  },
];
