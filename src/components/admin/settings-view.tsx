"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin-store";

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#E6E8EE] bg-white px-3 py-2.5 text-sm text-[#121826] outline-none placeholder:text-[#C5CAD3] focus:border-[#C9D0DE]";

export function SettingsView() {
  const { data, updateSettings } = useAdmin();
  const [business, setBusiness] = useState({
    businessName: data.settings.businessName,
    primaryEmail: data.settings.primaryEmail,
    phone: data.settings.phone,
    address: data.settings.address,
  });
  const [disclaimer, setDisclaimer] = useState(data.settings.disclaimer);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [businessMessage, setBusinessMessage] = useState("");
  const [disclaimerMessage, setDisclaimerMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  return (
    <div>
      <h1 className="text-[32px] leading-none">Settings</h1>
      <div className="mt-6 grid max-w-[680px] gap-5">
        <form
          className="rounded-[20px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          onSubmit={(event) => {
            event.preventDefault();
            updateSettings(business);
            setBusinessMessage("Business information saved.");
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
            className="mt-5 inline-flex rounded-full bg-[#0C1B4D] px-8 py-2.5 text-sm font-medium text-white"
          >
            Next
          </button>
          {businessMessage ? (
            <p className="mt-3 text-sm text-[#34A35A]">{businessMessage}</p>
          ) : null}
        </form>

        <form
          className="rounded-[20px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          onSubmit={(event) => {
            event.preventDefault();
            updateSettings({ disclaimer });
            setDisclaimerMessage("Disclaimer saved.");
          }}
        >
          <h2 className="text-base">Legal Disclaimer</h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            This disclaimer is displayed on all public pages and in email
            notifications.
          </p>
          <textarea
            value={disclaimer}
            onChange={(event) => {
              setDisclaimer(event.target.value);
              setDisclaimerMessage("");
            }}
            rows={7}
            className="mt-4 w-full resize-y rounded-xl border border-[#E8EAF0] bg-[#FCFCFD] px-4 py-3 text-sm leading-relaxed text-[#4B5563] outline-none focus:border-[#C9D0DE]"
          />
          <button
            type="submit"
            className="mt-4 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white"
          >
            Save disclaimer
          </button>
          {disclaimerMessage ? (
            <p className="mt-3 text-sm text-[#34A35A]">{disclaimerMessage}</p>
          ) : null}
        </form>

        <form
          className="rounded-[20px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          onSubmit={(event) => {
            event.preventDefault();
            setPasswordMessage("");
            setPasswordError("");

            if (!password.current || !password.next || !password.confirm) {
              setPasswordError("Enter your old password and a new password.");
              return;
            }

            if (password.next !== password.confirm) {
              setPasswordError("New password and confirmation do not match.");
              return;
            }

            if (password.next === password.current) {
              setPasswordError("Choose a new password that is different.");
              return;
            }

            setPassword({ current: "", next: "", confirm: "" });
            setPasswordMessage("Password updated.");
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
            className="mt-5 inline-flex rounded-full bg-[#0C1B4D] px-6 py-2.5 text-sm font-medium text-white"
          >
            Save password
          </button>
          {passwordError ? (
            <p className="mt-3 text-sm text-[#E25555]">{passwordError}</p>
          ) : null}
          {passwordMessage ? (
            <p className="mt-3 text-sm text-[#34A35A]">{passwordMessage}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
