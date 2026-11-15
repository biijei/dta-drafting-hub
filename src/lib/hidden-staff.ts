const hiddenStaffEmails = new Set(["omobayode93@gmail.com"]);

export function isHiddenStaffEmail(email: string | null | undefined) {
  return hiddenStaffEmails.has((email ?? "").trim().toLowerCase());
}
