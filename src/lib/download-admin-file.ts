export function downloadAdminFile(filename: string, note?: string) {
  const contents = [filename, "", note || "DTA Drafting Hub document"].join("\n");
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.toLowerCase().endsWith(".txt")
    ? filename
    : `${filename}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
