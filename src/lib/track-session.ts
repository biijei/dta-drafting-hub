import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";

const cookieName = "dta_track";
const maxAge = 60 * 60 * 24 * 14;

export async function startTrackSession(requestId: string) {
  const token = crypto.randomUUID();
  const supabase = createServiceClient();
  const expires = new Date(Date.now() + maxAge * 1000).toISOString();
  const { error } = await supabase.from("track_sessions").insert({
    token,
    request_id: requestId,
    expires_at: expires,
  });

  if (error) {
    throw new Error("Could not start the tracking session.");
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function trackedRequestId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("track_sessions")
    .select("request_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!data || new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  return data.request_id as string;
}
