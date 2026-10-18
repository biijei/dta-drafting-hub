"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { useAdmin } from "@/lib/admin-store";

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#E6E8EE] bg-white px-3 py-2.5 text-sm text-[#121826] outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]";

export function SettingsView() {
  const { data, updateSettings, createStaff, setStaffActive } = useAdmin();
  const isOwner = data.profile.role === "owner";
  const [business, setBusiness] = useState({
    businessName: data.settings?.businessName ?? "",
    primaryEmail: data.settings?.primaryEmail ?? "",
    phone: data.settings?.phone ?? "",
    address: data.settings?.address ?? "",
  });
  const [disclaimer, setDisclaimer] = useState(data.settings?.disclaimer ?? "");
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [staff, setStaff] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [pending, setPending] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl leading-none sm:text-[32px]">Settings</h1>
      <div className="mt-6 grid max-w-[680px] gap-5">
        {isOwner ? (
          <form
            className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              setPending("business");
              void updateSettings(business)
                .then(() => toast.success("Business information saved."))
                .catch((error: unknown) =>
                  toast.error(error instanceof Error ? error.message : "Could not save."),
                )
                .finally(() => setPending(null));
            }}
          >
            <h2 className="text-base">Business Information</h2>
            <label className="mt-5 block text-sm font-medium">
              Business Name
              <input
                value={business.businessName}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    businessName: event.target.value,
                  }))
                }
                placeholder="Enter business name"
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Primary Email
              <input
                type="email"
                value={business.primaryEmail}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    primaryEmail: event.target.value,
                  }))
                }
                placeholder="Enter email address"
                className={fieldClass}
              />
            </label>
            <p className="mt-2 text-xs text-[#9CA3AF]">
              Revision requests from clients are emailed here.
            </p>
            <label className="mt-4 block text-sm font-medium">
              Phone
              <input
                value={business.phone}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Enter phone number"
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Address
              <input
                value={business.address}
                onChange={(event) =>
                  setBusiness((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Enter address"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={pending !== null}
              aria-busy={pending === "business"}
              className="mt-5 inline-flex rounded-full bg-[#0C1B4D] px-8 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending === "business" ? "Saving…" : "Save"}
            </button>
          </form>
        ) : null}

        {isOwner ? (
          <form
            className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              setPending("disclaimer");
              void updateSettings({ disclaimer })
                .then(() => toast.success("Disclaimer saved."))
                .catch((error: unknown) =>
                  toast.error(error instanceof Error ? error.message : "Could not save."),
                )
                .finally(() => setPending(null));
            }}
          >
            <h2 className="text-base">Legal Disclaimer</h2>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              This disclaimer appears on the public disclaimer page and is
              included in email notifications.
            </p>
            <textarea
              value={disclaimer}
              onChange={(event) => setDisclaimer(event.target.value)}
              rows={7}
              className="mt-4 w-full resize-y rounded-xl border border-[#E8EAF0] bg-[#FCFCFD] px-4 py-3 text-sm leading-relaxed text-[#4B5563] outline-none focus:border-[#C9D0DE]"
            />
            <button
              type="submit"
              disabled={pending !== null}
              aria-busy={pending === "disclaimer"}
              className="mt-4 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending === "disclaimer" ? "Saving…" : "Save disclaimer"}
            </button>
          </form>
        ) : null}

        {isOwner ? (
          <form
            className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              setPending("staff");
              void createStaff(staff)
                .then(() => {
                  setStaff({ fullName: "", email: "", password: "" });
                  toast.success("Specialist account created.");
                })
                .catch((error: unknown) =>
                  toast.error(
                    error instanceof Error ? error.message : "Could not create the account.",
                  ),
                )
                .finally(() => setPending(null));
            }}
          >
            <h2 className="text-base">Team</h2>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              New accounts are specialists. They can work requests and cannot change these settings.
            </p>
            <label className="mt-5 block text-sm font-medium">
              Name
              <input
                value={staff.fullName}
                onChange={(event) =>
                  setStaff((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Full name"
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Email
              <input
                type="email"
                value={staff.email}
                onChange={(event) =>
                  setStaff((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Work email"
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Temporary password
              <input
                type="password"
                value={staff.password}
                onChange={(event) =>
                  setStaff((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="At least 8 characters"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={pending !== null}
              aria-busy={pending === "staff"}
              className="mt-5 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending === "staff" ? "Creating…" : "Create specialist"}
            </button>
            <ul className="mt-5 divide-y divide-[#F3F4F6]">
              {data.staff.map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="truncate text-xs text-[#9CA3AF]">
                      {person.email} · {person.role}
                      {person.active ? "" : " · inactive"}
                    </p>
                  </div>
                  {person.role === "specialist" ? (
                    <button
                      type="button"
                      disabled={pending !== null}
                      aria-busy={pending === `staff-active:${person.id}`}
                      onClick={() => {
                        if (pending) return;
                        setPending(`staff-active:${person.id}`);
                        void setStaffActive(person.id, !person.active)
                          .catch((error: unknown) =>
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Could not update the account.",
                            ),
                          )
                          .finally(() => setPending(null));
                      }}
                      className="shrink-0 text-sm text-[#374151] disabled:opacity-60"
                    >
                      {pending === `staff-active:${person.id}`
                        ? "Updating…"
                        : person.active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </form>
        ) : null}

        <form
          className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();

            if (!password.current || !password.next || !password.confirm) {
              toast.error("Enter your old password and a new password.");
              return;
            }

            if (password.next !== password.confirm) {
              toast.error("New password and confirmation do not match.");
              return;
            }

            if (pending) return;
            setPending("password");
            void fetch("/api/admin/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ current: password.current, next: password.next }),
            })
              .then(async (response) => {
                const body = (await response.json()) as { error?: string };
                if (!response.ok) {
                  toast.error(body.error || "Could not update the password.");
                  return;
                }

                setPassword({ current: "", next: "", confirm: "" });
                toast.success("Password updated.");
              })
              .catch(() => toast.error("Could not update the password."))
              .finally(() => setPending(null));
          }}
        >
          <h2 className="text-base">Password</h2>
          <label className="mt-5 block text-sm font-medium">
            Enter old password
            <input
              type="password"
              autoComplete="current-password"
              value={password.current}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  current: event.target.value,
                }))
              }
              placeholder="Enter old password"
              className="mt-2 w-full rounded-lg border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#E6E8EE]"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Enter new password*
            <input
              type="password"
              autoComplete="new-password"
              value={password.next}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  next: event.target.value,
                }))
              }
              placeholder="Enter new password"
              className="mt-2 w-full rounded-lg border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#E6E8EE]"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Confirm new password*
            <input
              type="password"
              autoComplete="new-password"
              value={password.confirm}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  confirm: event.target.value,
                }))
              }
              placeholder="Re-enter new password"
              className="mt-2 w-full rounded-lg border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-sm outline-none placeholder:text-[#C5CAD3] focus:border-[#E6E8EE]"
            />
          </label>
          <button
            type="submit"
            disabled={pending !== null}
            aria-busy={pending === "password"}
            className="mt-5 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending === "password" ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
