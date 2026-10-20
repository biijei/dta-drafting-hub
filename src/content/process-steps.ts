export type ProcessStep = {
  number: number;
  title: string;
  description: string;
  note?: string;
};

export type ProcessPhase = {
  id: "start" | "receive";
  label: string;
  steps: ProcessStep[];
};

export const processPhases: ProcessPhase[] = [
  {
    id: "start",
    label: "You start",
    steps: [
      {
        number: 1,
        title: "Choose a service",
        description: "Pick the document support you need from the service directory.",
      },
      {
        number: 2,
        title: "Submit your request",
        description:
          "Share the details, your contact info, and any supporting files, then review and submit to receive a Request ID.",
      },
      {
        number: 3,
        title: "Pay your quote",
        description:
          "We review the request and email a payment link. You can pay by card, PayPal, or another available method, and paying that amount starts the work.",
      },
    ],
  },
  {
    id: "receive",
    label: "You receive",
    steps: [
      {
        number: 4,
        title: "We prepare your document",
        description:
          "After payment, a specialist drafts your document while you follow progress in your workspace.",
      },
      {
        number: 5,
        title: "Review your draft",
        description: "When the draft is ready, approve it or ask for changes.",
        note: "Changes can be requested before you approve.",
      },
      {
        number: 6,
        title: "Download the final document",
        description: "After you approve, download the finished document from your workspace.",
      },
    ],
  },
];

export const processSteps: ProcessStep[] = processPhases.flatMap((phase) => phase.steps);
