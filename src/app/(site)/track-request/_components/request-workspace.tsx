"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { ActivityPanel } from "./activity-panel";
import { DocumentPanel } from "./document-panel";
import { OverviewPanel } from "./overview-panel";
import { PaymentPanel } from "./payment-panel";
import { RevisionsPanel } from "./revisions-panel";
import {
  workspaceTabs,
  type TrackedRequest,
  type WorkspaceTab,
} from "@/content/track-request";

type RequestWorkspaceProps = {
  request: TrackedRequest;
  onRefresh: () => Promise<void>;
};

export function RequestWorkspace({ request, onRefresh }: RequestWorkspaceProps) {
  const [tab, setTab] = useState<WorkspaceTab>("Overview");

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-r from-navy to-navy-bright">
        <div className="relative mx-auto w-full max-w-[90rem] px-4 pt-10">
          <p className="text-sm text-white/70">Request Workspace</p>
          <h1 className="mt-2 max-w-3xl font-heading text-[28px] font-medium leading-[0.97] tracking-normal text-white md:text-[40px]">
            {request.title}
          </h1>
          <p className="mt-2 text-sm text-white/80">ID: {request.id}</p>
          <div
            role="tablist"
            aria-label="Request sections"
            className="mt-8 flex items-end gap-1 overflow-x-auto"
          >
            {workspaceTabs.map((item) => {
              const selected = tab === item;

              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  id={`tab-${item}`}
                  aria-selected={selected}
                  aria-controls={`panel-${item}`}
                  onClick={() => setTab(item)}
                  className={clsx(
                    "shrink-0 px-4 py-2.5 text-sm font-medium",
                    selected
                      ? "rounded-t-xl bg-surface text-ink"
                      : "text-white/75 hover:text-white",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-8"
      >
        {tab === "Overview" ? (
          <OverviewPanel
            request={request}
            onRequestChange={() => setTab("Revisions")}
            onViewDocument={() => setTab("Document")}
            onRefresh={onRefresh}
            onPay={() => setTab("Payment")}
          />
        ) : null}
        {tab === "Document" ? (
          <DocumentPanel request={request} onRefresh={onRefresh} />
        ) : null}
        {tab === "Revisions" ? (
          <RevisionsPanel request={request} onRefresh={onRefresh} />
        ) : null}
        {tab === "Payment" ? (
          <PaymentPanel request={request} onPaid={() => void onRefresh()} />
        ) : null}
        {tab === "Activity" ? <ActivityPanel request={request} /> : null}
      </div>
    </div>
  );
}
