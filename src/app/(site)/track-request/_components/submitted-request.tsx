"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { PageHero } from "@/components/ui/page-hero";
import {
  getServerSubmitted,
  getSubmittedSnapshot,
  subscribeSubmitted,
} from "@/content/request-draft";
import type { TrackedRequest } from "@/content/track-request";
import { RequestWorkspace } from "./request-workspace";

export function SubmittedRequestWorkspace({ id }: { id: string }) {
  const stored = useSyncExternalStore<Record<string, TrackedRequest> | null>(
    subscribeSubmitted,
    getSubmittedSnapshot,
    getServerSubmitted,
  );

  const request = stored?.[id];

  useEffect(() => {
    if (!stored) {
      return;
    }

    const title = request
      ? `${request.title} | DTA Drafting Hub`
      : "Request not found | DTA Drafting Hub";
    const apply = () => {
      document.title = title;
    };

    apply();
    const frame = window.requestAnimationFrame(apply);
    return () => window.cancelAnimationFrame(frame);
  }, [request, stored]);

  if (!stored) {
    return <div className="min-h-[16rem] flex-1 bg-white" />;
  }

  if (!request) {
    return (
      <>
        <PageHero
          title="Request not found"
          description="Check the Request ID and try again."
        />
        <section className="flex flex-1 justify-center px-4 py-16">
          <Link
            href="/track-request"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90"
          >
            Back to track request
          </Link>
        </section>
      </>
    );
  }

  return <RequestWorkspace request={request} />;
}
