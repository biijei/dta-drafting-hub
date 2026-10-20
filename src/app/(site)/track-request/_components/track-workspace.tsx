"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { PageLoading } from "@/components/ui/page-loading";
import type { TrackedRequest } from "@/content/track-request";
import { LookupForm } from "./lookup-form";
import { RequestWorkspace } from "./request-workspace";

export function TrackWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const loadGeneration = useRef(0);
  const [request, setRequest] = useState<TrackedRequest | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "missing" | "error">(
    "loading",
  );

  function load(options?: { pending?: boolean }) {
    const generation = ++loadGeneration.current;

    if (options?.pending) {
      setState("loading");
    }

    return fetch(`/api/track/requests/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (generation !== loadGeneration.current) {
          return;
        }

        if (response.status === 401) {
          setRequest(null);
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
        if (generation === loadGeneration.current) {
          setState("error");
        }
      });
  }

  useEffect(() => {
    void load();

    return () => {
      loadGeneration.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (state === "loading") {
    return <PageLoading label="Loading your request" />;
  }

  if (state === "denied") {
    return (
      <section className="flex flex-1 justify-center px-4 py-10 sm:py-16">
        <LookupForm
          initialId={id}
          onVerified={(verifiedId) => {
            if (verifiedId.toUpperCase() === id.trim().toUpperCase()) {
              void load({ pending: true });
              return;
            }

            router.push(`/track-request/${encodeURIComponent(verifiedId)}`);
          }}
        />
      </section>
    );
  }

  if (state === "error") {
    return (
      <>
        <PageHero
          title="Couldn't load this request"
          description="Check your connection and try again."
        />
        <section className="flex flex-1 justify-center px-4 py-16">
          <button
            type="button"
            onClick={() => void load({ pending: true })}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </button>
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
