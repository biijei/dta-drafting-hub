import { bucket } from "@/lib/files";
import { createServiceClient } from "@/lib/supabase/admin";

const retentionMs = 60 * 24 * 60 * 60 * 1000;

export async function purgeExpiredFiles() {
  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - retentionMs).toISOString();
  const { data, error } = await supabase
    .from("files")
    .select("id, storage_path")
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff);

  if (error) {
    throw new Error("Could not find expired files.");
  }

  const expired = data ?? [];

  if (expired.length === 0) {
    return;
  }

  const paths = expired
    .map((file) => file.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(bucket).remove(paths);

    if (storageError) {
      throw new Error("Could not remove expired files from storage.");
    }
  }

  const { error: deleteError } = await supabase
    .from("files")
    .delete()
    .in(
      "id",
      expired.map((file) => file.id),
    );

  if (deleteError) {
    throw new Error("Could not purge expired files.");
  }
}
