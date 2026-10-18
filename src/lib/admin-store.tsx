"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AdminClient,
  AdminPayment,
  AdminProfile,
  AdminRequest,
  AdminSettings,
  OverviewStats,
  PaymentSummary,
  PendingAction,
  StaffMember,
} from "@/content/admin";

export type AdminData = {
  profile: AdminProfile;
  requests: AdminRequest[];
  clients: AdminClient[];
  payments: AdminPayment[];
  settings: AdminSettings | null;
  staff: StaffMember[];
  stats: OverviewStats;
  paymentSummary: PaymentSummary;
  pending: PendingAction[];
};

type AdminStoreValue = {
  data: AdminData;
  reload: () => Promise<void>;
  updateRequest: (
    id: string,
    patch: {
      assigneeId?: string | null;
      internalNote?: string;
      status?: "In Progress";
    },
  ) => Promise<void>;
  uploadDocument: (
    requestId: string,
    file: File,
    kind: "draft" | "final",
    note: string,
  ) => Promise<void>;
  removeDocument: (documentId: string) => Promise<void>;
  updateSettings: (patch: Partial<AdminSettings>) => Promise<void>;
  createStaff: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  setStaffActive: (id: string, active: boolean) => Promise<void>;
  sendPaymentLink: (id: string, amount: string) => Promise<void>;
  resendPaymentLink: (id: string) => Promise<void>;
};

const AdminContext = createContext<AdminStoreValue | null>(null);

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

async function loadAdmin(): Promise<AdminData> {
  const [meRes, requestsRes, clientsRes, paymentsRes, overviewRes, usersRes, settingsRes] =
    await Promise.all([
      fetch("/api/admin/me"),
      fetch("/api/admin/requests"),
      fetch("/api/admin/clients"),
      fetch("/api/admin/payments"),
      fetch("/api/admin/overview"),
      fetch("/api/admin/users"),
      fetch("/api/admin/settings"),
    ]);

  if (meRes.status === 401) {
    throw new Error("unauthorized");
  }

  if (!meRes.ok || !requestsRes.ok || !clientsRes.ok || !paymentsRes.ok || !overviewRes.ok || !usersRes.ok) {
    throw new Error(await readError(requestsRes.ok ? meRes : requestsRes));
  }

  const me = (await meRes.json()) as { profile: AdminProfile };
  const requests = (await requestsRes.json()) as { requests: AdminRequest[] };
  const clients = (await clientsRes.json()) as { clients: AdminClient[] };
  const payments = (await paymentsRes.json()) as {
    payments: AdminPayment[];
    summary: PaymentSummary;
  };
  const overview = (await overviewRes.json()) as {
    stats: OverviewStats;
    pending: PendingAction[];
  };
  const users = (await usersRes.json()) as { users: StaffMember[] };
  const settings = settingsRes.ok
    ? ((await settingsRes.json()) as { settings: AdminSettings }).settings
    : null;

  return {
    profile: me.profile,
    requests: requests.requests,
    clients: clients.clients,
    payments: payments.payments,
    settings,
    staff: users.users,
    stats: overview.stats,
    paymentSummary: payments.summary,
    pending: overview.pending,
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const next = await loadAdmin();
      setData(next);
      setError("");
    } catch (loadError) {
      if (loadError instanceof Error && loadError.message === "unauthorized") {
        router.replace("/admin/login");
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "Could not load admin data.");
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    loadAdmin()
      .then((next) => {
        if (active) {
          setData(next);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        if (loadError instanceof Error && loadError.message === "unauthorized") {
          router.replace("/admin/login");
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Could not load admin data.",
        );
      });

    return () => {
      active = false;
    };
  }, [router]);

  const value = useMemo<AdminStoreValue | null>(() => {
    if (!data) {
      return null;
    }

    async function mutate(path: string, init: RequestInit) {
      const response = await fetch(path, init);

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      await reload();
    }

    return {
      data,
      reload,
      updateRequest: (id, patch) =>
        mutate(`/api/admin/requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }),
      uploadDocument: async (requestId, file, kind, note) => {
        const body = new FormData();
        body.set("file", file);
        body.set("kind", kind);
        body.set("note", note);
        await mutate(`/api/admin/requests/${requestId}/documents`, {
          method: "POST",
          body,
        });
      },
      removeDocument: (documentId) =>
        mutate(`/api/admin/files/${documentId}`, { method: "DELETE" }),
      updateSettings: (patch) =>
        mutate("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }),
      createStaff: (input) =>
        mutate("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      setStaffActive: (id, active) =>
        mutate(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        }),
      sendPaymentLink: (id, amount) =>
        mutate(`/api/admin/requests/${id}/payment-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }),
      resendPaymentLink: (id) =>
        mutate(`/api/admin/requests/${id}/payment-link/resend`, { method: "POST" }),
    };
  }, [data, reload]);

  if (!data || !value) {
    return (
      <div className="admin-app min-h-full flex-1 bg-[#F3F4F6] px-6 py-10 text-sm text-[#6B7280]">
        {error || "Loading admin data…"}
      </div>
    );
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const store = useContext(AdminContext);

  if (!store) {
    throw new Error("useAdmin must be used within AdminProvider");
  }

  return store;
}
