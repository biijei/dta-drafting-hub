export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const legalUpdated = "October 13, 2026";

export const privacyPolicy = {
  title: "Privacy Policy",
  description:
    "How DTA Drafting Hub LLC collects, uses, and protects the information you share when you request a document.",
  sections: [
    {
      title: "Who this policy covers",
      paragraphs: [
        "DTA Drafting Hub LLC provides professional document drafting and document-support services through this website. This policy describes the information we collect when you browse the site, submit a request, pay for a service, or track a request.",
        "We draft and review documents. We do not provide legal advice, and a request does not create a lawyer-client relationship. The separate Disclaimer explains that limit. This policy explains how we handle your information while we do the work.",
      ],
    },
    {
      title: "Information you give us",
      paragraphs: [
        "A request asks for your full name, email address, phone number, and how you prefer to be contacted. It also asks for the details of the service you chose, such as the parties, the purpose of the document, key terms, jurisdiction, and any notes you add.",
        "You may upload supporting files. The upload step accepts PDF, DOC, DOCX, JPG, and PNG files, up to 10 MB each. Send only the materials the request needs.",
      ],
    },
    {
      title: "Information the service creates",
      paragraphs: [
        "You do not need an account. When you submit a request, we save it, assign a Request ID, and keep the status of that request. We also keep the quoted price, the PayPal payment, the drafts we prepare, revision notes, your approval, and the final document.",
        "You follow the request with the Request ID and the email address on the request. We email that address when the request is received, when the payment link is ready, when a draft is ready, and when the document is complete.",
      ],
    },
    {
      title: "How we use information",
      paragraphs: [
        "We use your information to prepare the document you asked for, send status messages, handle the revision round included with the service, and deliver the draft and the final file. We also use it to attach the payment to the correct request and to keep ordinary records of the work.",
        "We do not use your documents as samples for other clients, and we do not sell your information.",
      ],
    },
    {
      title: "Who can see it",
      paragraphs: [
        "People working on your request can see the details and files needed to draft it. We share information with the providers that process the PayPal payment, send email about the request, and store the request record and files.",
        "We also share information when the law requires it. We do not share your request with other clients.",
      ],
    },
    {
      title: "Payment",
      paragraphs: [
        "After we review the request, you pay the quoted USD amount by card, PayPal, or another method PayPal offers. A card payment does not need a PayPal account. PayPal processes the payment. We do not collect or store your full card number.",
        "We keep the payment status and the receipt details needed to connect the payment to your request.",
      ],
    },
    {
      title: "Files and documents",
      paragraphs: [
        "Uploaded files and the documents we draft are stored so we can prepare, revise, and deliver your request. Access is limited to the work on that request.",
        "Download links in your tracking workspace are for you. Do not forward a Request ID together with the email on the request unless you intend that person to see the request.",
      ],
    },
    {
      title: "How long we keep it",
      paragraphs: [
        "We keep request details, messages, and files for as long as we need them to finish the request, answer a question about it, and keep ordinary business records.",
        "You can ask us to delete information we are not required to keep. Write from the email address on the request and include the Request ID.",
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "We limit access to the people and providers needed to run the service, and we store files for the request they belong to. No method of storage or transmission is perfect, so send only what the document requires.",
      ],
    },
    {
      title: "Children",
      paragraphs: [
        "The service is for adults who need documents prepared. We do not knowingly collect information from children. If you believe a child has submitted a request, contact us and we will delete what we are not required to keep.",
      ],
    },
    {
      title: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the service changes. The date at the top of this page is the date of the current version. The version published here is the one that applies.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Questions about this policy can be sent by replying to an email we send about your request. Include your Request ID if you have one.",
      ],
    },
  ] satisfies LegalSection[],
};

export const termsOfService = {
  title: "Terms of Service",
  description:
    "The terms that apply when you request document drafting or document review from DTA Drafting Hub LLC.",
  sections: [
    {
      title: "The service",
      paragraphs: [
        "DTA Drafting Hub LLC drafts and reviews documents for individuals, professionals, businesses, and organizations. The services include legal drafting, contracts, immigration document support, business documents, correspondence, and document review.",
        "The service page shows the work, typical pricing, the expected turnaround, and what you receive. The amount you pay is the USD price quoted after we review your request. These terms apply to your use of the website and to each request you submit.",
      ],
    },
    {
      title: "What this service is not",
      paragraphs: [
        "We provide document drafting and review only. We do not provide legal advice, legal representation, or a legal opinion. Submitting a request, paying for a service, or receiving a draft does not create a lawyer-client relationship.",
        "A document is prepared from the information you provide. Drafting it does not decide whether it is legally binding, fit for a filing, or right for your situation. Where you need legal advice or representation, consult a qualified legal professional licensed in the relevant jurisdiction. The work available may vary by jurisdiction and by the type of document.",
      ],
    },
    {
      title: "Placing a request",
      paragraphs: [
        "You choose a service, complete the form, and may upload supporting files. The request is saved when you submit it, and we email you a Request ID. We review the files and email a payment link for the quoted USD amount. You choose card, PayPal, or another method PayPal offers. A card payment does not need a PayPal account. Work starts after that payment is confirmed.",
        "No account is required. You track the request with that Request ID and the email address on the request.",
      ],
    },
    {
      title: "Your instructions",
      paragraphs: [
        "You are responsible for the accuracy and completeness of the names, facts, terms, and files you provide. We draft from those instructions. Review the draft and tell us if something is wrong before you approve it.",
        "Send only information you are allowed to share. Do not ask us to prepare a document for fraud, to mislead a court or agency, or to break the law. We may decline or stop a request that we cannot draft from the information given, or that asks for something outside document drafting and review.",
      ],
    },
    {
      title: "Timing and revisions",
      paragraphs: [
        "The turnaround on the service page is an estimate. It depends on the document and on the detail you provide. We will tell you through the request workspace if the work needs more time.",
        "Each service includes the revision support stated on that service. Unless the service says otherwise, one revision round is included. Further changes can be quoted after you review the draft.",
      ],
    },
    {
      title: "Review and delivery",
      paragraphs: [
        "When a draft is ready, we email you. You review it in your request workspace, approve it, or request changes. After you approve it, we prepare the final document for download from that workspace.",
        "Please check names, dates, amounts, and terms before you approve. Approval means the draft matches the instructions you gave us.",
      ],
    },
    {
      title: "Fees",
      paragraphs: [
        "The fee is the USD amount we quote after reviewing your request. You pay it by card, PayPal, or another method PayPal offers. A card payment does not need a PayPal account. Drafting begins after that payment is confirmed.",
        "If we cannot carry out a request, we will contact you. If you need to withdraw a request, write to us promptly from the email on the request and include the Request ID, before you approve a draft.",
      ],
    },
    {
      title: "Confidentiality",
      paragraphs: [
        "We treat your request, files, and drafts as confidential. We use them to do the work and to operate the service, as described in the Privacy Policy. We do not share them with other clients.",
      ],
    },
    {
      title: "The document we deliver",
      paragraphs: [
        "You may use the delivered document for the purpose you described. You remain responsible for how you use it, including signing it, filing it, or relying on it.",
        "You keep the facts and materials you provided. We keep ownership of this website, our process, and any general methods we use to prepare documents. We do not claim your instructions as our own.",
      ],
    },
    {
      title: "Limits of the work",
      paragraphs: [
        "We prepare the document with care from your instructions. We are not responsible for an outcome that depends on facts you did not give us, on a later change in your circumstances, or on legal advice that this service does not provide.",
        "Our responsibility for a request is limited to the fee you paid for that request.",
      ],
    },
    {
      title: "Changes to these terms",
      paragraphs: [
        "We may update these terms. The date at the top of this page is the current version. A new request is covered by the terms published when you submit it. A request already submitted stays under the terms in place when it was submitted.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Questions about these terms can be sent by replying to an email we send about your request. Include your Request ID if you have one.",
      ],
    },
  ] satisfies LegalSection[],
};
