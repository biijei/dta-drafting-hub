"use client";

import { clsx } from "clsx";
import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AdminDocument } from "@/content/admin";
import { EmptyState } from "@/components/ui/empty-state";
import { Dropdown } from "@/components/ui/dropdown";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { toast } from "@/components/ui/toast";
import { downloadStoredFile } from "@/lib/download-file";
import { useAdmin } from "@/lib/admin-store";
import { StatusPill } from "./status-pill";

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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [kind, setKind] = useState<"draft" | "final">("draft");
  const [reviewNote, setReviewNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [price, setPrice] = useState("");
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
    setPending("note");

    try {
      await updateRequest(current.id, { internalNote: note });
      toast.success("Note saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the note.");
    } finally {
      setPending(null);
    }
  }

  async function assign(assigneeId: string) {
    setPending("assign");

    try {
      await updateRequest(current.id, { assigneeId: assigneeId || null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign the request.");
    } finally {
      setPending(null);
    }
  }

  async function markInProgress() {
    setPending("status");

    try {
      await updateRequest(current.id, { status: "In Progress" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the status.");
    } finally {
      setPending(null);
    }
  }

  async function downloadFile(id: string) {
    setPending(`download:${id}`);

    try {
      await downloadStoredFile(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download the file.");
    } finally {
      setPending(null);
    }
  }

  async function deleteDocument(id: string) {
    setPending(`delete:${id}`);

    try {
      await removeDocument(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the file.");
    } finally {
      setPending(null);
    }
  }

  async function submitUpload() {
    if (!file || !reviewNote.trim()) {
      toast.error("Choose a file and add a review note.");
      return;
    }

    setPending("upload");

    try {
      await uploadDocument(current.id, file, kind, reviewNote.trim());
      setUploadOpen(false);
      setFile(null);
      setReviewNote("");
      setTab("Document");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the file.");
    } finally {
      setPending(null);
    }
  }

  const groups = groupDocuments(request.documents);
  const canStart =
    request.status === "Submitted" || request.status === "Revision Requested";
  const awaitingPrice =
    request.status === "Pending Review" || request.status === "Awaiting Payment";
  const isOwner = data.profile.role === "owner";

  async function generateLink() {
    setPending("generate");

    try {
      await sendPaymentLink(current.id, price.trim());
      toast.success("Payment link emailed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the payment link.");
    } finally {
      setPending(null);
    }
  }

  async function resendLink() {
    setPending("resend");

    try {
      await resendPaymentLink(current.id);
      toast.success("Payment link resent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend the payment link.");
    } finally {
      setPending(null);
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
                  <div className="flex items-center justify-between gap-4 py-2 text-sm sm:gap-6">
                    <span className="shrink-0 text-[#6B7280]">Status</span>
                    <StatusPill status={request.status} />
                  </div>
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
                          disabled={pending !== null}
                          aria-busy={pending === `download:${submitted.id}`}
                          onClick={() => void downloadFile(submitted.id)}
                          className="text-sm text-[#4B5563] disabled:opacity-60"
                        >
                          {pending === `download:${submitted.id}` ? "Downloading…" : "Download"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className={card}>
                <h2 className="text-base">Revision requests</h2>
                {request.revisions.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No revision requests yet"
                    description="Change requests from the client will show up here."
                  />
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
                                  disabled={pending !== null}
                                  aria-busy={pending === `download:${attachment.id}`}
                                  onClick={() => void downloadFile(attachment.id)}
                                  className="text-sm font-medium text-[#3B5BDB] disabled:opacity-60"
                                >
                                  {pending === `download:${attachment.id}`
                                    ? "Downloading…"
                                    : attachment.filename}
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
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add note"
                  rows={5}
                  className="mt-4 w-full resize-y rounded-xl border border-[#E6E8EE] px-4 py-3 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]"
                />
                <button
                  type="button"
                  disabled={pending !== null}
                  aria-busy={pending === "note"}
                  onClick={() => void saveNote()}
                  className="mt-4 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {pending === "note" ? "Saving…" : "Save note"}
                </button>
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
                        disabled={pending !== null}
                        aria-busy={pending === "generate"}
                        onClick={() => void generateLink()}
                        className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0C1B4D] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {pending === "generate" ? "Sending link…" : "Generate and email link"}
                      </button>
                      {request.paymentUrl ? (
                        <button
                          type="button"
                          disabled={pending !== null}
                          aria-busy={pending === "resend"}
                          onClick={() => void resendLink()}
                          className="mt-3 flex w-full items-center justify-center rounded-full border border-[#E6E8EE] px-5 py-3 text-sm font-medium disabled:opacity-60"
                        >
                          {pending === "resend" ? "Resending…" : "Resend link"}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-[#6B7280]">
                      An owner sets the price and emails the PayPal link.
                    </p>
                  )}
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
                    disabled={pending !== null}
                    aria-busy={pending === "status"}
                    onClick={() => void markInProgress()}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-lime px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-lime/90 disabled:opacity-60"
                  >
                    {pending === "status" ? "Updating…" : "Mark in progress"}
                  </button>
                ) : null}
                {awaitingPrice ? null : (
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={() => {
                    setUploadOpen(true);
                    setKind(request.status === "Approved" ? "final" : "draft");
                  }}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0C1B4D] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  Upload document
                </button>
                )}
                <div className="mt-4">
                  <label
                    id="assign-to-label"
                    className="block text-sm text-[#6B7280]"
                  >
                    Assign to
                  </label>
                  <Dropdown
                    id="assign-to"
                    labelledBy="assign-to-label"
                    className="mt-2"
                    disabled={pending !== null}
                    buttonLabel={pending === "assign" ? "Assigning…" : undefined}
                    value={request.assigneeId ?? ""}
                    onChange={(assigneeId) => void assign(assigneeId)}
                    options={[
                      { value: "", label: "Unassigned" },
                      ...staff.map((person) => ({
                        value: person.id,
                        label: person.name,
                      })),
                    ]}
                  />
                </div>
                {uploadOpen ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitUpload();
                    }}
                  >
                    <div>
                      <label
                        id="document-type-label"
                        className="block text-sm text-[#6B7280]"
                      >
                        Document type
                      </label>
                      <Dropdown
                        id="document-type"
                        labelledBy="document-type-label"
                        className="mt-2"
                        value={kind}
                        onChange={(next) => setKind(next === "final" ? "final" : "draft")}
                        options={[
                          { value: "draft", label: "Draft for client review" },
                          {
                            value: "final",
                            label: "Final document",
                            disabled: request.status !== "Approved",
                          },
                        ]}
                      />
                    </div>
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
                    <FileDropzone
                      files={file ? [{ name: file.name }] : []}
                      multiple={false}
                      onAdd={(incoming) => setFile(incoming[0] ?? null)}
                      onRemove={() => setFile(null)}
                    />
                    <button
                      type="submit"
                      disabled={pending !== null}
                      aria-busy={pending === "upload"}
                      className="inline-flex rounded-full bg-[#0C1B4D] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {pending === "upload" ? "Uploading…" : "Send to client"}
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
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Uploaded drafts and finals will show up here."
                />
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
                              disabled={pending !== null}
                              aria-busy={pending === `download:${item.id}`}
                              onClick={() => void downloadFile(item.id)}
                              className="rounded-full border border-[#E6E8EE] px-4 py-1.5 text-sm text-[#374151] disabled:opacity-60"
                            >
                              {pending === `download:${item.id}` ? "Downloading…" : "Download"}
                            </button>
                            {item.kind === "draft" ? (
                              <button
                                type="button"
                                disabled={pending !== null}
                                aria-busy={pending === `delete:${item.id}`}
                                onClick={() => void deleteDocument(item.id)}
                                className="text-sm text-[#374151] disabled:opacity-60"
                              >
                                {pending === `delete:${item.id}` ? "Deleting…" : "Delete"}
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
