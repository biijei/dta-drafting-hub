import { bucket, assertUpload } from "@/lib/files";
import { createServiceClient } from "@/lib/supabase/admin";
import type { FileKind } from "@/content/admin";

export async function storeFile(input: {
  file: File;
  folder: string;
  kind: FileKind;
  note: string;
  author: string;
  requestId?: string | null;
  checkoutId?: string | null;
  revisionId?: string | null;
}) {
  const meta = assertUpload(input.file);
  const path = `${input.folder}/${crypto.randomUUID()}-${meta.filename}`;
  const supabase = createServiceClient();
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: meta.contentType, upsert: false });

  if (uploadError) {
    throw new Error("Could not store the file.");
  }

  const { error } = await supabase.from("files").insert({
    request_id: input.requestId ?? null,
    checkout_id: input.checkoutId ?? null,
    revision_id: input.revisionId ?? null,
    kind: input.kind,
    storage_path: path,
    filename: meta.filename,
    size_bytes: input.file.size,
    note: input.note,
    author_name: input.author,
  });

  if (error) {
    await supabase.storage.from(bucket).remove([path]);
    throw new Error("Could not save the file.");
  }

  return path;
}

export async function removeStored(paths: string[]) {
  if (!paths.length) {
    return;
  }

  const supabase = createServiceClient();
  await supabase.storage.from(bucket).remove(paths);
}
