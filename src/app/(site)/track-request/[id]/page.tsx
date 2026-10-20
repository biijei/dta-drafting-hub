import type { Metadata } from "next";
import { TrackWorkspace } from "../_components/track-workspace";

type TrackRequestWorkspacePageProps = PageProps<"/track-request/[id]">;

export async function generateMetadata({
  params,
}: TrackRequestWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Request",
    description: `Status for request ${id}.`,
  };
}

export default async function TrackRequestWorkspacePage({
  params,
}: TrackRequestWorkspacePageProps) {
  const { id } = await params;
  return <TrackWorkspace id={id} />;
}
