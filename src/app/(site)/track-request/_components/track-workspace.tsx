"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/ui/page-hero";
import type { TrackedRequest } from "@/content/track-request";
import { RequestWorkspace } from "./request-workspace";

export function TrackWorkspace({ id }: { id: string }) {
  const [request, setRequest] = useState<TrackedRequest | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "missing">(
    "loading",
  );

  function load() {
    return fetch(`/api/track/requests/${encodeURIComponent(id)}`).then(async (response) => {
      if (response.status === 401) {
        setState("denied");
        return;
      }

      if (!response.ok) {
        setState("missing");
        return;
      }

      setRequest((await response.json()) as TrackedRequest);
      setState("ready");
    });
  }

  useEffect(() => {
    let active = true;

    fetch(`/api/track/requests/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!active) {
          return;
        }

        if (response.status === 401) {
          setState("denied");
          return;
        }

        if (!response.ok) {
          setState("missing");
          return;
        }

        setRequest((await response.json()) as TrackedRequest);
        setState("ready");
      })
      .catch(() => {
        if (active) {
          setState("missing");
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (state === "loading") {
    return <div className="min-h-[16rem] flex-1 bg-white" />;
  }

  if (state === "denied") {
    return (
      <>
        <PageHero
          title="Confirm your email"
          description="Enter the Request ID and the email on the request."
        />
        <section className="flex flex-1 justify-center px-4 py-16">
          <Link
            href={`/track-request?id=${encodeURIComponent(id)}`}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white"
          >
            Track my request
          </Link>
        </section>
      </>
    );
  }

  if (!request || state === "missing") {
    return (
      <>
        <PageHero
          title="Request not found"
          description="Check the Request ID and try again."
        />
        <section className="flex flex-1 justify-center px-4 py-16">
          <Link
            href="/track-request"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to track request
          </Link>
        </section>
      </>
    );
  }

  return <RequestWorkspace request={request} onRefresh={load} />;
}
