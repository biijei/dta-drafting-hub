import type { Metadata } from "next";
import { RequestWorkspace } from "../_components/request-workspace";
import { SubmittedRequestWorkspace } from "../_components/submitted-request";
import { getTrackedRequest } from "@/content/track-request";

type TrackRequestWorkspacePageProps = PageProps<"/track-request/[id]">;

export async function generateMetadata({
  params,
}: TrackRequestWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const request = getTrackedRequest(id);

  return {
    title: request ? request.title : "Request",
    description: request
      ? `Status for request ${request.id}.`
      : `Status for request ${id}.`,
  };
}

export default async function TrackRequestWorkspacePage({
  params,
}: TrackRequestWorkspacePageProps) {
  const { id } = await params;
  const request = getTrackedRequest(id);

  if (!request) {
    return <SubmittedRequestWorkspace id={id} />;
  }

  return <RequestWorkspace request={request} />;
}
