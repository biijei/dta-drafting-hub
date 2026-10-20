import { z } from "zod";
import { getService } from "@/content/services";
import { jsonError, jsonOk } from "@/lib/http";
import { sendNewRequestAlert, sendRequestReceived } from "@/lib/mail";
import { removeStored, storeFile } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/admin";
import { startTrackSession } from "@/lib/track-session";

const clientSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(1).max(40),
  company: z.string().trim().max(160),
  country: z.string().trim().min(1).max(80),
  region: z.string().trim().max(80),
  contactMethod: z.enum(["Email", "Phone", "Both"]),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const slug = String(form.get("serviceSlug") ?? "");
    const service = getService(slug);

    if (!service) {
      return jsonError("Choose a service.", 400);
    }

    const clientParsed = clientSchema.safeParse(
      JSON.parse(String(form.get("client") ?? "{}")),
    );
    const detailsParsed = z
      .record(z.string(), z.string())
      .safeParse(JSON.parse(String(form.get("details") ?? "{}")));

    if (!clientParsed.success || !detailsParsed.success) {
      return jsonError("Check the request details and try again.", 400);
    }

    for (const field of service.fields) {
      if (field.required && !detailsParsed.data[field.id]?.trim()) {
        return jsonError(field.requiredMessage ?? "A required detail is missing.", 400);
      }
    }

    const uploads = form
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (uploads.length > 8) {
      return jsonError("Upload up to 8 files.", 400);
    }

    const client = {
      ...clientParsed.data,
      email: clientParsed.data.email.toLowerCase(),
    };
    const supabase = createServiceClient();
    const { data: publicId, error: idError } = await supabase.rpc("next_public_id");

    if (idError || typeof publicId !== "string") {
      console.error(idError);
      return jsonError("Could not save the request.", 500);
    }

    const { data: created, error } = await supabase
      .from("requests")
      .insert({
        public_id: publicId,
        service_slug: service.slug,
        service_title: service.title,
        status: "Pending Review",
        client_name: client.fullName,
        client_email: client.email,
        phone: client.phone,
        company: client.company,
        country: client.country,
        region: client.region,
        contact_method: client.contactMethod,
        details: detailsParsed.data,
        amount_cents: 0,
        turnaround: service.turnaround,
      })
      .select("id, public_id")
      .single();

    if (error || !created) {
      console.error(error);
      return jsonError("Could not save the request.", 500);
    }

    const paths: string[] = [];

    try {
      for (const file of uploads) {
        const path = await storeFile({
          file,
          folder: `requests/${created.id}/client`,
          kind: "client_upload",
          note: "Uploaded with the request.",
          author: client.fullName,
          requestId: created.id,
        });
        paths.push(path);
      }
    } catch (uploadError) {
      console.error(uploadError);
      await removeStored(paths);
      await supabase.from("files").delete().eq("request_id", created.id);
      await supabase.from("requests").delete().eq("id", created.id);
      const message =
        uploadError instanceof Error ? uploadError.message : "Could not save the files.";
      return jsonError(message, 400);
    }

    await supabase.from("activity").insert({
      request_id: created.id,
      message: "Request submitted for review.",
    });

    await sendRequestReceived({
      to: client.email,
      requestId: created.public_id,
      title: service.title,
    });
    await sendNewRequestAlert({
      requestUuid: created.id,
      requestId: created.public_id,
      title: service.title,
      clientName: client.fullName,
    });

    try {
      await startTrackSession(created.id);
    } catch (sessionError) {
      console.error(sessionError);
    }

    return jsonOk({
      confirmation: {
        id: created.public_id,
        title: service.title,
        amount: "After review",
        turnaround: service.turnaround,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("Could not save the request.", 500);
  }
}
