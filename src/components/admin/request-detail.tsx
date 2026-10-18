"use client";

import { clsx } from "clsx";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AdminDocument } from "@/content/admin";
import { downloadStoredFile } from "@/lib/download-file";
import { useAdmin } from "@/lib/admin-store";

const card =
  "rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm sm:gap-6">
      <span className="shrink-0 text-[#6B7280]">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold">{value}</span>
    </div>
  );
}

function groupDocuments(documents: AdminDocument[]) {
  const groups: { title: string; files: AdminDocument[] }[] = [];

  for (const document of documents) {
    const existing = groups.find((group) => group.title === document.group);

    if (existing) {
      existing.files.push(document);
    } else {
      groups.push({ title: document.group, files: [document] });
    }
  }

  return groups;
}

export function RequestDetail({ id }: { id: string }) {
  const { data, updateRequest, uploadDocument, removeDocument, sendPaymentLink, resendPaymentLink } =
    useAdmin();
  const request = data.requests.find((item) => item.id === id);
  const [tab, setTab] = useState<"Overview" | "Document">("Overview");
  const [note, setNote] = useState(request?.internalNote ?? "");
  const [noteSaved, setNoteSaved] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [kind, setKind] = useState<"draft" | "final">("draft");
  const [reviewNote, setReviewNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState("");
  const [priceMessage, setPriceMessage] = useState("");
  const staff = data.staff.filter((person) => person.active);

  if (!request) {
    return (
      <div>
        <h1 className="text-2xl sm:text-[32px]">Request not found</h1>
        <Link href="/admin/requests" className="mt-4 inline-flex text-sm text-[#3B5BDB]">
          Back to requests
        </Link>
      </div>
    );
  }

  const current = request;

  async function saveNote() {
    setActionError("");
    setNoteSaved("");

    try {
      await updateRequest(current.id, { internalNote: note });
      setNoteSaved("Note saved.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not save the note.");
    }
  }

  async function assign(assigneeId: string) {
    setActionError("");

    try {
      await updateRequest(current.id, { assigneeId: assigneeId || null });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not assign the request.");
    }
  }

  async function markInProgress() {
    setActionError("");

    try {
      await updateRequest(current.id, { status: "In Progress" });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update the status.");
    }
  }

  async function submitUpload() {
    if (!file || !reviewNote.trim()) {
      setUploadError("Choose a file and add a review note.");
      return;
    }

    setBusy(true);
    setUploadError("");

    try {
      await uploadDocument(current.id, file, kind, reviewNote.trim());
      setUploadOpen(false);
      setFile(null);
      setReviewNote("");
      setTab("Document");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not upload the file.");
    } finally {
      setBusy(false);
    }
  }

  const groups = groupDocuments(request.documents);
  const canStart =
    request.status === "Submitted" || request.status === "Revision Requested";
  const awaitingPrice =
    request.status === "Pending Review" || request.status === "Awaiting Payment";
  const isOwner = data.profile.role === "owner";

  async function generateLink() {
    setActionError("");
    setPriceMessage("");
    setBusy(true);

    try {
      await sendPaymentLink(current.id, price.trim());
      setPriceMessage("Payment link emailed.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not send the payment link.");
    } finally {
      setBusy(false);
    }
  }

  async function resendLink() {
    setActionError("");
    setPriceMessage("");
    setBusy(true);

    try {
      await resendPaymentLink(current.id);
      setPriceMessage("Payment link resent.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not resend the payment link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="-mx-4 -mt-6 sm:-mx-7 sm:-mt-7">
      <div className="bg-white px-4 pt-6 sm:px-7">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl leading-none sm:text-[32px]">{request.title}</h1>
            <p className="mt-2 text-sm text-[#6B7280]">{request.displayId}</p>
          </div>
          <Link
            href="/admin/requests"
            className="inline-flex rounded-full border border-[#E6E8EE] bg-white px-6 py-2 text-sm font-medium text-[#374151]"
          >
            Back
          </Link>
        </div>
        <div role="tablist" aria-label="Request sections" className="mt-6 flex gap-1">
          {(["Overview", "Document"] as const).map((item) => {
            const selected = tab === item;

            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item)}
                className={clsx(
                  "rounded-t-xl px-5 py-2.5 text-sm font-medium",
                  selected ? "bg-[#F3F4F6] text-[#121826]" : "text-[#6B7280]",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#F3F4F6] px-4 py-6 sm:px-7">
        {tab === "Overview" ? (
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <div className="grid gap-4">
              <section className={card}>
                <h2 className="text-base">Request Details</h2>
                <div className="mt-3">
                  <DetailRow label="Status" value={request.status} />
                  {request.detailRows.map((row) => (
                    <DetailRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              </section>

              {request.submittedFiles.length ? (
                <section className={card}>
                  <h2 className="text-base">Submitted Files</h2>
                  <ul className="mt-4 space-y-3">
                    {request.submittedFiles.map((submitted) => (
                      <li
                        key={submitted.id}
                        className="flex flex-col gap-3 rounded-xl bg-[#F4F6FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="size-5 shrink-0 text-[#98A2B3]" />
                          <div className="min-w-0">
                            <p className="break-all text-sm font-semibold">{submitted.name}</p>
                            <p className="text-xs text-[#9CA3AF]">{submitted.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void downloadStoredFile(submitted.id)}
                          className="text-sm text-[#4B5563]"
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className={card}>
                <h2 className="text-base">Revision requests</h2>
                {request.revisions.length === 0 ? (
                  <p className="mt-3 text-sm text-[#6B7280]">No revision requests yet.</p>
                ) : (
                  <ul className="mt-3 space-y-4">
                    {request.revisions.map((revision) => (
                      <li key={revision.id} className="rounded-xl bg-[#F4F6FB] px-4 py-3">
                        <p className="text-xs text-[#9CA3AF]">
                          {revision.createdAt} · {revision.targetFilename}
                        </p>
                        <p className="mt-2 text-sm text-[#121826]">{revision.note}</p>
                        {revision.attachments.length ? (
                          <ul className="mt-3 space-y-2">
                            {revision.attachments.map((attachment) => (
                              <li key={attachment.id}>
                                <button
                                  type="button"
                                  onClick={() => void downloadStoredFile(attachment.id)}
                                  className="text-sm font-medium text-[#3B5BDB]"
                                >
                                  {attachment.filename}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={card}>
                <h2 className="text-base">Add Internal Note</h2>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Internal notes are not visible to clients.
                </p>
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setNoteSaved("");
                  }}
                  placeholder="Add note"
                  rows={5}
                  className="mt-4 w-full resize-y rounded-xl border border-[#E6E8EE] px-4 py-3 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]"
                />
                <button
                  type="button"
                  onClick={() => void saveNote()}
                  className="mt-4 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white"
                >
                  Save note
                </button>
                {noteSaved ? (
                  <p className="mt-3 text-sm text-[#34A35A]">{noteSaved}</p>
                ) : null}
              </section>
            </div>

            <div className="grid gap-4">
              {awaitingPrice ? (
                <section className={card}>
                  <h2 className="text-base">Price and payment link</h2>
                  <p className="mt-2 text-sm text-[#6B7280]">
                    Current price: {request.quotedAmount}
                  </p>
                  {isOwner ? (
                    <>
                      <label className="mt-4 block text-sm text-[#6B7280]">
                        USD amount
                        <input
                          type="text"
                          inputMode="decimal"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder="150.00"
                          className="mt-2 w-full rounded-xl border border-[#E6E8EE] px-4 py-3 text-sm text-[#121826] outline-none"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void generateLink()}
                        className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0C1B4D] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                      >
                        Generate and email link
                      </button>
                      {request.paymentUrl ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void resendLink()}
                          className="mt-3 flex w-full items-center justify-center rounded-full border border-[#E6E8EE] px-5 py-3 text-sm font-medium disabled:opacity-60"
                        >
                          Resend link
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-[#6B7280]">
                      An owner sets the price and emails the PayPal link.
                    </p>
                  )}
                  {priceMessage ? (
                    <p className="mt-3 text-sm text-[#34A35A]">{priceMessage}</p>
                  ) : null}
                </section>
              ) : null}

              <section className={card}>
                <h2 className="text-base">Client</h2>
                <div className="mt-3">
                  <DetailRow label="Full Name" value={request.clientName} />
                  <DetailRow label="Email" value={request.clientEmail} />
                  <DetailRow label="Phone" value={request.phone} />
                  <DetailRow label="Country" value={request.country} />
                  <DetailRow label="State / Region" value={request.stateRegion} />
                  <DetailRow label="Company" value={request.company} />
                  <DetailRow label="Preferred Contact" value={request.preferredContact} />
                </div>
              </section>

              <section className={card}>
                <h2 className="text-base">Actions</h2>
                {awaitingPrice ? (
                  <p className="mt-3 text-sm text-[#6B7280]">
                    Draft upload and mark in progress are available after payment.
                  </p>
                ) : null}
                {canStart ? (
                  <button
                    type="button"
                    onClick={() => void markInProgress()}
                    className="mt-4 flex w-full items-center justify-center rounded-full border border-[#E6E8EE] px-5 py-3 text-sm font-medium"
                  >
                    Mark in progress
                  </button>
                ) : null}
                {awaitingPrice ? null : (
                <button
                  type="button"
                  onClick={() => {
                    setUploadOpen(true);
                    setKind(request.status === "Approved" ? "final" : "draft");
                  }}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0C1B4D] px-5 py-3 text-sm font-medium text-white"
                >
                  Upload document
                </button>
                )}
                <label className="mt-4 block text-sm text-[#6B7280]">
                  Assign to
                  <select
                    aria-label="Assign to"
                    value={request.assigneeId ?? ""}
                    onChange={(event) => void assign(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#E6E8EE] bg-white px-4 py-3 text-sm text-[#121826] outline-none"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                {actionError ? (
                  <p className="mt-3 text-sm text-[#E25555]">{actionError}</p>
                ) : null}
                {uploadOpen ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitUpload();
                    }}
                  >
                    <label className="block text-sm text-[#6B7280]">
                      Document type
                      <select
                        value={kind}
                        onChange={(event) =>
                          setKind(event.target.value === "final" ? "final" : "draft")
                        }
                        className="mt-2 w-full rounded-xl border border-[#E6E8EE] bg-white px-4 py-3 text-sm text-[#121826] outline-none"
                      >
                        <option value="draft">Draft for client review</option>
                        <option value="final" disabled={request.status !== "Approved"}>
                          Final document
                        </option>
                      </select>
                    </label>
                    <label className="block text-sm text-[#6B7280]">
                      Review note
                      <textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        rows={3}
                        placeholder="What should the client know about this file?"
                        className="mt-2 w-full resize-y rounded-xl border border-[#E6E8EE] px-4 py-3 text-sm text-[#121826] outline-none"
                      />
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      className="block w-full text-sm"
                    />
                    {uploadError ? (
                      <p className="text-sm text-[#E25555]">{uploadError}</p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex rounded-full bg-[#0C1B4D] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {busy ? "Uploading…" : "Send to client"}
                    </button>
                  </form>
                ) : null}
              </section>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg">Documents</h2>
            </div>
            {groups.length === 0 ? (
              <section className={card}>
                <p className="text-sm text-[#6B7280]">No documents yet.</p>
              </section>
            ) : (
              <div className="grid gap-4">
                {groups.map((group) => (
                  <section key={group.title} className={card}>
                    <h3 className="text-base">{group.title}</h3>
                    <ul className="mt-2">
                      {group.files.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-col gap-3 border-b border-[#F3F4F6] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 gap-3">
                            <FileText className="mt-0.5 size-5 shrink-0 text-[#98A2B3]" />
                            <div className="min-w-0">
                              <p className="text-xs text-[#9CA3AF]">
                                {item.uploadedAt} · {item.author}
                              </p>
                              <p className="mt-0.5 truncate text-sm font-semibold">
                                {item.filename}
                              </p>
                              <p className="text-sm text-[#6B7280]">{item.note}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-4 sm:pl-4">
                            <button
                              type="button"
                              onClick={() => void downloadStoredFile(item.id)}
                              className="rounded-full border border-[#E6E8EE] px-4 py-1.5 text-sm text-[#374151]"
                            >
                              Download
                            </button>
                            {item.kind === "draft" ? (
                              <button
                                type="button"
                                onClick={() => void removeDocument(item.id)}
                                className="text-sm text-[#374151]"
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
