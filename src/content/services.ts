export const importantNotice =
  "DTA Drafting Hub provides document drafting and review services only. We do not provide legal advice. For legal advice specific to your circumstances, please consult a qualified legal professional licensed in the relevant jurisdiction.";

export const serviceIconNames = [
  "scale",
  "file",
  "luggage",
  "laptop",
  "mail",
  "clipboard",
] as const;

export type ServiceIconName = (typeof serviceIconNames)[number];

export const serviceIllustrations: Record<string, string> = {
  "legal-drafting": "/icons/service-legal.svg",
  contracts: "/icons/service-contract.svg",
  immigration: "/icons/service-immigration.svg",
  business: "/icons/service-business.svg",
  correspondence: "/icons/service-correspondence.svg",
  "document-review": "/icons/service-document.svg",
};

export type ServiceFieldType = "text" | "textarea" | "select" | "date";

export type ServiceField = {
  id: string;
  label: string;
  placeholder: string;
  type: ServiceFieldType;
  required?: boolean;
  requiredMessage?: string;
  options?: string[];
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type Service = {
  slug: string;
  title: string;
  subtitle: string;
  cardDescription: string;
  about: string[];
  audiences: string[];
  tags: string[];
  provide: string[];
  faqs: ServiceFaq[];
  defaultFaqOpen: boolean;
  icon: ServiceIconName;
  turnaround: string;
  revisions: string;
  price: number;
  pricingNote: string;
  deliverables: string[];
  fields: ServiceField[];
};

const revisions = "1 round included";

export const services: Service[] = [
  {
    slug: "legal-drafting",
    title: "Legal Drafting",
    subtitle:
      "Professionally drafted legal documents tailored to your needs and jurisdiction.",
    cardDescription:
      "Expert drafting of legal documents including agreements, deeds, notices, and declarations. Our team ensures your documents are clear, precise, and jurisdiction-appropriate.",
    about: [
      "Preparing and organizing affidavits, declarations, petitions, responses, requests, and other formal legal-related documents.",
      "Expert drafting of legal documents including agreements, deeds, notices, and declarations. Our team ensures your documents are clear, precise, and jurisdiction-appropriate.",
    ],
    audiences: [
      "Individuals needing legal documentation",
      "Businesses requiring formal agreements",
      "Organizations creating policies or bylaws",
    ],
    tags: [
      "Deeds and declarations",
      "Non-disclosure agreements",
      "Power of attorney documents",
      "Legal notices",
      "Affidavits and statutory declarations",
    ],
    provide: [
      "Parties involved",
      "Purpose of the document",
      "Key terms and conditions",
      "Jurisdiction",
      "Any existing drafts or references",
    ],
    faqs: [
      {
        question: "How long does drafting take?",
        answer:
          "Standard documents take 3–5 business days. Complex or multi-party documents may take longer.",
      },
      {
        question: "Can I request revisions?",
        answer:
          "One revision round is included with the drafting. Further changes can be quoted after you review the draft.",
      },
      {
        question: "Is the document legally binding?",
        answer:
          "We draft the document from the details you provide. We do not provide legal advice, and a drafted document does not by itself decide whether it is legally binding. Consult a qualified legal professional licensed in the relevant jurisdiction.",
      },
    ],
    defaultFaqOpen: true,
    icon: "scale",
    turnaround: "3–5 business days",
    revisions,
    price: 150,
    pricingNote:
      "Prices on this page are guidance. Submit the request first. DTA reviews the files and emails a payment link for the quoted USD amount.",
    deliverables: [
      "Final formatted PDF",
      "Revision round",
      "Drafted legal document",
    ],
    fields: [
      {
        id: "parties",
        label: "Parties involved",
        placeholder: "Who is involved?",
        type: "text",
        required: true,
        requiredMessage: "Enter the parties involved",
      },
      {
        id: "purpose",
        label: "Purpose of the document",
        placeholder: "What should the document do?",
        type: "textarea",
        required: true,
        requiredMessage: "Describe the purpose of the document",
      },
      {
        id: "terms",
        label: "Key terms and conditions",
        placeholder: "The terms that need to be included",
        type: "textarea",
      },
      {
        id: "jurisdiction",
        label: "Jurisdiction",
        placeholder: "Jurisdiction, if relevant",
        type: "text",
      },
      {
        id: "drafts",
        label: "Any existing drafts or references",
        placeholder: "Notes about drafts or references you already have",
        type: "textarea",
      },
    ],
  },
  {
    slug: "contracts",
    title: "Contracts",
    subtitle: "Custom contract drafting for business and personal agreements.",
    cardDescription:
      "Professional drafting of commercial contracts, service agreements, employment contracts, and partnership agreements. We craft clear, enforceable contracts that protect your interests.",
    about: [
      "Drafting and refining agreements, contracts, memoranda, and other documents that set out terms, responsibilities, or expectations.",
      "Professional drafting of commercial contracts, service agreements, employment contracts, and partnership agreements. We craft clear, enforceable contracts that protect your interests.",
    ],
    audiences: [
      "Business owners entering agreements",
      "Freelancers and contractors",
      "Employers drafting employment terms",
      "Parties to joint ventures or partnerships",
    ],
    tags: [
      "Service agreements",
      "Partnership agreements",
      "Employment contracts",
      "Lease agreements",
      "Sales agreements",
      "Non-compete and confidentiality clauses",
      "Consulting agreements",
    ],
    provide: [
      "Contract type",
      "Parties involved",
      "Duration and key obligations",
      "Jurisdiction",
      "Special conditions or requirements",
    ],
    faqs: [
      {
        question: "Do you provide legal advice alongside the contract?",
        answer:
          "No. We draft the contract only. We do not provide legal advice. Consult a qualified legal professional licensed in the relevant jurisdiction for advice on your circumstances.",
      },
      {
        question: "Can you draft contracts in other languages?",
        answer:
          "Tell us the language you need when you submit the request. We will confirm whether we can draft it before you accept a quote.",
      },
    ],
    defaultFaqOpen: false,
    icon: "file",
    turnaround: "4–7 business days",
    revisions,
    price: 200,
    pricingNote:
      "Contract fees start at $200 and vary by type and complexity.",
    deliverables: [
      "Drafted contract",
      "One revision round",
      "Schedule / annexures if required",
      "Final PDF and Word version",
    ],
    fields: [
      {
        id: "contractType",
        label: "Contract type",
        placeholder: "Service agreement, employment contract, lease, etc.",
        type: "text",
        required: true,
        requiredMessage: "Enter the contract type",
      },
      {
        id: "parties",
        label: "Parties involved",
        placeholder: "Who is signing the contract?",
        type: "text",
        required: true,
        requiredMessage: "Enter the parties involved",
      },
      {
        id: "obligations",
        label: "Duration and key obligations",
        placeholder: "How long it runs, and what each party must do",
        type: "textarea",
      },
      {
        id: "jurisdiction",
        label: "Jurisdiction",
        placeholder: "Jurisdiction, if relevant",
        type: "text",
      },
      {
        id: "conditions",
        label: "Special conditions or requirements",
        placeholder: "Anything unusual that should be included",
        type: "textarea",
      },
    ],
  },
  {
    slug: "immigration",
    title: "Immigration",
    subtitle:
      "Document support for immigration applications, visas, and related processes.",
    cardDescription:
      "Professional support for immigration-related documentation including cover letters, declarations, sponsorship letters, and application support documents.",
    about: [
      "Helping prepare supporting statements, letters, declarations, and other written materials connected to immigration matters.",
      "Professional support for immigration-related documentation including cover letters, declarations, sponsorship letters, and application support documents.",
    ],
    audiences: [
      "Visa applicants",
      "Employers sponsoring workers",
      "Families supporting relatives",
      "Students requiring admission documentation",
    ],
    tags: [
      "Cover letters for visa applications",
      "Statutory declarations for immigration purposes",
      "Invitation letters",
      "Sponsorship letters",
      "Declarations of support",
      "Document checklists and support",
    ],
    provide: [
      "Document type required",
      "Destination country",
      "Application type",
      "Current immigration stage",
      "Supporting details",
    ],
    faqs: [
      {
        question: "Do you provide legal immigration advice?",
        answer:
          "No. We prepare immigration-related documents only. We do not provide legal immigration advice. Consult a qualified professional licensed in the relevant jurisdiction.",
      },
      {
        question: "What if my application is time-sensitive?",
        answer:
          "Share your deadline in the request. Urgent processing is available at an additional fee, and we will confirm the turnaround with your quote.",
      },
    ],
    defaultFaqOpen: false,
    icon: "luggage",
    turnaround: "2–4 business days",
    revisions,
    price: 120,
    pricingNote:
      "Immigration documents are priced from $120. Urgent processing is available at an additional fee.",
    deliverables: [
      "Drafted immigration document",
      "One revision round",
      "Formatting for relevant authority",
    ],
    fields: [
      {
        id: "documentType",
        label: "Document type required",
        placeholder: "Cover letter, declaration, sponsorship letter, etc.",
        type: "text",
        required: true,
        requiredMessage: "Enter the document type",
      },
      {
        id: "destination",
        label: "Destination country",
        placeholder: "Country the application relates to",
        type: "text",
        required: true,
        requiredMessage: "Enter the destination country",
      },
      {
        id: "applicationType",
        label: "Application type",
        placeholder: "Visa, sponsorship, admission, or other",
        type: "text",
      },
      {
        id: "stage",
        label: "Current immigration stage",
        placeholder: "Where the application stands now",
        type: "text",
      },
      {
        id: "supporting",
        label: "Supporting details",
        placeholder: "Facts and context the document should include",
        type: "textarea",
      },
    ],
  },
  {
    slug: "business",
    title: "Business",
    subtitle:
      "Business formation documents, policies, resolutions, and operational paperwork.",
    cardDescription:
      "Comprehensive business document support including company constitutions, board resolutions, shareholder agreements, HR policies, and standard operating procedures.",
    about: [
      "Creating policies, procedures, proposals, reports, business letters, and other professional documents.",
      "Comprehensive business document support including company constitutions, board resolutions, shareholder agreements, HR policies, and standard operating procedures.",
    ],
    audiences: [
      "Business owners and directors",
      "Startups structuring their operations",
      "HR departments",
      "Companies requiring governance documents",
    ],
    tags: [
      "Company constitutions and bylaws",
      "Business plans and proposals",
      "Standard operating procedures",
      "HR policies and procedures",
      "Board and shareholder resolutions",
      "Company registers",
    ],
    provide: [
      "Type of document",
      "Business structure",
      "Jurisdiction",
      "Key requirements and context",
    ],
    faqs: [
      {
        question: "Can you help with template documents for ongoing use?",
        answer:
          "Yes. Tell us the document type and how you plan to reuse it, and we can draft a template for ongoing use.",
      },
    ],
    defaultFaqOpen: false,
    icon: "laptop",
    turnaround: "3–6 business days",
    revisions,
    price: 180,
    pricingNote:
      "Prices on this page are guidance. Submit the request first. DTA reviews the files and emails a payment link for the quoted USD amount.",
    deliverables: [
      "Business document(s)",
      "Formatted for use",
      "One revision round",
    ],
    fields: [
      {
        id: "documentType",
        label: "Type of document",
        placeholder: "Constitution, resolution, policy, register, etc.",
        type: "text",
        required: true,
        requiredMessage: "Enter the type of document",
      },
      {
        id: "structure",
        label: "Business structure",
        placeholder: "Company, partnership, sole trader, or other",
        type: "text",
        required: true,
        requiredMessage: "Enter the business structure",
      },
      {
        id: "jurisdiction",
        label: "Jurisdiction",
        placeholder: "Jurisdiction, if relevant",
        type: "text",
      },
      {
        id: "requirements",
        label: "Key requirements and context",
        placeholder: "What the document needs to cover",
        type: "textarea",
      },
    ],
  },
  {
    slug: "correspondence",
    title: "Correspondence",
    subtitle:
      "Professional business letters, formal communications, and correspondence drafting.",
    cardDescription:
      "Clear, professional drafting of business letters, demand letters, complaint letters, formal notices, and other correspondence that represents you with authority and clarity.",
    about: [
      "Drafting professional letters, requests, responses, explanations, and other important written communications.",
      "Clear, professional drafting of business letters, demand letters, complaint letters, formal notices, and other correspondence that represents you with authority and clarity.",
    ],
    audiences: [
      "Individuals needing formal written communication",
      "Businesses writing to regulators or counterparties",
      "Anyone requiring a professionally drafted letter",
    ],
    tags: [
      "Demand letters",
      "Business communications",
      "Formal notices",
      "Response letters",
      "Complaint letters",
      "Reference and recommendation letters",
    ],
    provide: [
      "Purpose of the correspondence",
      "Recipient details",
      "Key message and desired outcome",
      "Any supporting context or prior communications",
    ],
    faqs: [
      {
        question: "How quickly can a letter be drafted?",
        answer:
          "Most letters take 1–3 business days. Share a deadline in your request if you need it sooner.",
      },
    ],
    defaultFaqOpen: false,
    icon: "mail",
    turnaround: "1–3 business days",
    revisions,
    price: 75,
    pricingNote: "Correspondence pricing starts at $75 per document.",
    deliverables: [
      "Drafted correspondence",
      "One revision round",
      "Final formatted PDF",
    ],
    fields: [
      {
        id: "purpose",
        label: "Purpose of the correspondence",
        placeholder: "Why the letter is being sent",
        type: "textarea",
        required: true,
        requiredMessage: "Describe the purpose of the correspondence",
      },
      {
        id: "recipient",
        label: "Recipient details",
        placeholder: "Who should receive the letter?",
        type: "text",
        required: true,
        requiredMessage: "Enter the recipient details",
      },
      {
        id: "message",
        label: "Key message and desired outcome",
        placeholder: "What the letter should say, and what you want to happen",
        type: "textarea",
      },
      {
        id: "context",
        label: "Any supporting context or prior communications",
        placeholder: "Earlier letters, dates, or facts we should know",
        type: "textarea",
      },
    ],
  },
  {
    slug: "document-review",
    title: "Document Review",
    subtitle:
      "Thorough review of existing documents, with a structured report and recommendations.",
    cardDescription:
      "Thorough review of your existing documents to identify issues, inconsistencies, missing provisions, formatting concerns, and areas requiring attention. Receive a structured review report with clear recommendations.",
    about: [
      "Improving existing documents for clarity, structure, grammar, tone, consistency, formatting, and overall presentation.",
      "Thorough review of your existing documents to identify issues, inconsistencies, missing provisions, formatting concerns, and areas requiring attention. Receive a structured review report with clear recommendations.",
    ],
    audiences: [
      "Anyone who has received a document to sign",
      "Businesses reviewing supplier or client agreements",
      "Individuals with lease, employment, or service contracts",
      "Organizations reviewing internal policies",
    ],
    tags: [
      "Identifying missing or ambiguous clauses",
      "Comparing against a standard or template",
      "Checking consistency and formatting",
      "Flagging unfair or unusual terms",
      "Reviewing for completeness",
    ],
    provide: [
      "The document to be reviewed",
      "Purpose of the review",
      "Any specific concerns",
      "Jurisdiction if relevant",
    ],
    faqs: [
      {
        question: "What does the review report include?",
        answer:
          "A structured report with findings, a summary of recommendations, and a marked-up document where that is useful.",
      },
      {
        question: "Will you edit the document or just review it?",
        answer:
          "This service is a review. You receive a report and a marked-up document. Rewriting the document is a separate drafting request.",
      },
    ],
    defaultFaqOpen: false,
    icon: "clipboard",
    turnaround: "2–4 business days",
    revisions,
    price: 100,
    pricingNote: "Review fees are based on document length and complexity.",
    deliverables: [
      "Review report with findings",
      "One follow-up query round",
      "Marked-up document",
      "Summary of recommendations",
    ],
    fields: [
      {
        id: "documentType",
        label: "What type of document is being reviewed?",
        placeholder: "Select document type",
        type: "select",
        required: true,
        requiredMessage: "Select the document type",
        options: [
          "Lease",
          "Employment contract",
          "Service agreement",
          "Partnership agreement",
          "Company policy",
          "Other",
        ],
      },
      {
        id: "purpose",
        label: "Purpose of this document",
        placeholder: "What is the document for?",
        type: "textarea",
        required: true,
        requiredMessage: "Describe the purpose of this document",
      },
      {
        id: "focus",
        label: "What would you like us to focus on?",
        placeholder: "Specific clauses, general review, fairness of terms, etc.",
        type: "textarea",
      },
      {
        id: "jurisdiction",
        label: "Jurisdiction",
        placeholder: "Jurisdiction, if relevant",
        type: "text",
      },
      {
        id: "deadline",
        label: "Review deadline",
        placeholder: "dd/mm/yyyy",
        type: "date",
      },
      {
        id: "concerns",
        label: "Do you have any specific concerns?",
        placeholder: "Anything in the document that seems unusual or concerning?",
        type: "textarea",
      },
    ],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function formatDollars(amount: number) {
  return `USD $${amount}`;
}

export function formatUsd(amount: number) {
  return `USD $${amount.toFixed(2)}`;
}

export function formatUsdCents(cents: number) {
  return formatUsd(cents / 100);
}

export function requestHref(slug: string) {
  return `/request?service=${slug}`;
}
