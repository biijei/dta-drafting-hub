export async function downloadStoredFile(id: string) {
  const response = await fetch(`/api/files/${id}`);
  const body = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !body.url) {
    throw new Error(body.error || "Could not download the file.");
  }

  window.location.assign(body.url);
}
