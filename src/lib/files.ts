export const maxFileBytes = 10 * 1024 * 1024;
export const bucket = "request-files";

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
]);

const contentTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export function extensionOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "") : "";
}

export function safeFilename(name: string) {
  const base = name.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return cleaned || "file";
}

export function assertUpload(file: File) {
  const extension = extensionOf(file.name);

  if (!allowedExtensions.has(extension) || file.size > maxFileBytes) {
    throw new Error("Use PDF, DOC, DOCX, JPG, or PNG files up to 10 MB each.");
  }

  return {
    extension,
    contentType: contentTypes[extension] ?? "application/octet-stream",
    filename: safeFilename(file.name),
  };
}
