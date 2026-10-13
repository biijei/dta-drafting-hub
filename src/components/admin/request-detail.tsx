"use client";

import { clsx } from "clsx";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { assignees, type AdminDocument } from "@/content/admin";
import { downloadAdminFile } from "@/lib/download-admin-file";
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
  const { data, updateRequest, addDocument, removeDocument } = useAdmin();
  const request = data.requests.find((item) => item.id === id);
  const [tab, setTab] = useState<"Overview" | "Document">("Overview");
  const [note, setNote] = useState(request?.internalNote ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  function openFilePicker() {
    fileInput.current?.click();
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !request) {
      return;
    }

    addDocument(request.id, file);
    setTab("Document");
  }

  const groups = groupDocuments(request.documents);

  return (
    <div className="-mx-4 -mt-6 sm:-mx-7 sm:-mt-7">
      <input
        ref={fileInput}
        type="file"
        className="sr-only"
        onChange={onFile}
      />
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
                  <DetailRow label="Document Type" value={request.documentType} />
                  <DetailRow
                    label="Destination Country"
                    value={request.destinationCountry}
                  />
                  <DetailRow
                    label="Application Type"
                    value={request.applicationType}
                  />
                  <DetailRow label="Current Stage" value={request.currentStage} />
                </div>
              </section>

              {request.submittedFile ? (
                <section className={card}>
                  <h2 className="text-base">Submitted Files</h2>
                  <div className="mt-4 flex flex-col gap-3 rounded-xl bg-[#F4F6FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="size-5 shrink-0 text-[#98A2B3]" />
                      <div className="min-w-0">
                        <p className="break-all text-sm font-semibold">
                          {request.submittedFile.name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {request.submittedFile.size}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        downloadAdminFile(
                          request.submittedFile?.name ?? "file",
                          request.submittedFile?.size,
                        )
                      }
                      className="text-sm text-[#4B5563]"
                    >
                      Download
                    </button>
                  </div>
                </section>
              ) : null}

              <section className={card}>
                <h2 className="text-base">Add Internal Note</h2>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Internal notes are not visible to clients.
                </p>
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setNoteSaved(false);
                  }}
                  placeholder="Add note"
                  rows={5}
                  className="mt-4 w-full resize-y rounded-xl border border-[#E6E8EE] px-4 py-3 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateRequest(request.id, { internalNote: note });
                    setNoteSaved(true);
                  }}
                  className="mt-4 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white"
                >
                  Save note
                </button>
                {noteSaved ? (
                  <p className="mt-3 text-sm text-[#34A35A]">Note saved.</p>
                ) : null}
              </section>
            </div>

            <div className="grid gap-4">
              <section className={card}>
                <h2 className="text-base">Client</h2>
                <div className="mt-3">
                  <DetailRow label="Full Name" value={request.clientName} />
                  <DetailRow label="Email" value={request.clientEmail} />
                  <DetailRow label="Phone" value={request.phone} />
                  <DetailRow label="Country" value={request.country} />
                  <DetailRow label="State / Region" value={request.stateRegion} />
                  <DetailRow label="Company" value={request.company} />
                  <DetailRow
                    label="Preferred Contact"
                    value={request.preferredContact}
                  />
                </div>
              </section>

              <section className={card}>
                <h2 className="text-base">Actions</h2>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0C1B4D] px-5 py-3 text-sm font-medium text-white"
                >
                  Upload document
                </button>
                {request.assignee ? (
                  <p className="mt-4 text-center text-sm text-[#6B7280]">
                    Assigned to{" "}
                    <select
                      aria-label="Assigned to"
                      value={request.assignee}
                      onChange={(event) =>
                        updateRequest(request.id, {
                          assignee: event.target.value || null,
                        })
                      }
                      className="appearance-none bg-transparent font-semibold text-[#121826] outline-none"
                    >
                      {assignees.map((person) => (
                        <option key={person} value={person}>
                          {person}
                        </option>
                      ))}
                      <option value="">Unassigned</option>
                    </select>
                  </p>
                ) : (
                  <select
                    aria-label="Assign to"
                    value=""
                    onChange={(event) =>
                      updateRequest(request.id, {
                        assignee: event.target.value || null,
                      })
                    }
                    className="mt-4 w-full appearance-none rounded-xl border border-[#E6E8EE] bg-white bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239CA3AF%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat px-4 py-3 text-sm text-[#9CA3AF] outline-none"
                  >
                    <option value="">Assign to..</option>
                    {assignees.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                )}
              </section>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg">Documents</h2>
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex rounded-full bg-[#0C1B4D] px-4 py-2.5 text-sm font-medium text-white"
              >
                + Upload document
              </button>
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
                      {group.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex flex-col gap-3 border-b border-[#F3F4F6] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 gap-3">
                            <FileText className="mt-0.5 size-5 shrink-0 text-[#98A2B3]" />
                            <div className="min-w-0">
                              <p className="text-xs text-[#9CA3AF]">
                                {file.uploadedAt} · {file.author}
                              </p>
                              <p className="mt-0.5 truncate text-sm font-semibold">
                                {file.filename}
                              </p>
                              <p className="text-sm text-[#6B7280]">{file.note}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-4 sm:pl-4">
                            <button
                              type="button"
                              onClick={() =>
                                downloadAdminFile(file.filename, file.note)
                              }
                              className="rounded-full border border-[#E6E8EE] px-4 py-1.5 text-sm text-[#374151]"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(request.id, file.id)}
                              className="text-sm text-[#374151]"
                            >
                              Delete
                            </button>
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
