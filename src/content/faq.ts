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
      "Timing depends on the document and the details you provide. Your quote includes the expected turnaround before you accept.",
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
      "We review your request and prepare a tailored quote. You'll receive the quote in your request workspace and by email. You can accept or decline before any work begins.",
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
      "Once you accept the quote, we collect payment securely. A receipt is generated and attached to your request.",
  },
  {
    id: "payment-methods",
    category: "Payment",
    question: "What payment methods are accepted?",
    answer:
      "Payment is collected securely after you accept the quote. The available methods are shown at checkout.",
  },
  {
    id: "tracking",
    category: "Tracking",
    question: "How do I track my request?",
    answer:
      "You can track progress in real time from your request workspace, from the quote through document preparation to the final download.",
  },
];
