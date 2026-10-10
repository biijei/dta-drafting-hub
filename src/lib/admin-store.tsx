"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  adminSeed,
  adminUserName,
  formatFileSize,
  formatUploadedAt,
  type AdminData,
  type AdminDocument,
  type AdminRequest,
  type AdminSettings,
} from "@/content/admin";

const DATA_KEY = "dta-admin-data";
const SESSION_KEY = "dta-admin-session";

export type AdminSession = {
  name: string;
  email: string;
};

type AdminStoreValue = {
  data: AdminData;
  updateRequest: (id: string, patch: Partial<AdminRequest>) => void;
  addDocument: (requestId: string, file: File) => void;
  removeDocument: (requestId: string, documentId: string) => void;
  updateSettings: (patch: Partial<AdminSettings>) => void;
};

const AdminContext = createContext<AdminStoreValue | null>(null);

function isAdminData(value: unknown): value is AdminData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as AdminData;

  return (
    Array.isArray(data.requests) &&
    Array.isArray(data.clients) &&
    Array.isArray(data.payments) &&
    Boolean(data.settings)
  );
}

export function readSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as AdminSession;

    if (!session?.email || !session?.name) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function writeSession(email: string) {
  const session: AdminSession = { name: adminUserName, email };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(adminSeed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(DATA_KEY);

    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);

        if (isAdminData(parsed)) {
          setData(parsed);
        }
      } catch {
        setData(adminSeed);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data, ready]);

  const value = useMemo<AdminStoreValue>(
    () => ({
      data,
      updateRequest: (id, patch) => {
        setData((current) => ({
          ...current,
          requests: current.requests.map((request) =>
            request.id === id ? { ...request, ...patch } : request,
          ),
        }));
      },
      addDocument: (requestId, file) => {
        setData((current) => ({
          ...current,
          requests: current.requests.map((request) => {
            if (request.id !== requestId) {
              return request;
            }

            const group =
              request.documents[0]?.group ?? "Uploaded documents";
            const document: AdminDocument = {
              id: `doc-${Date.now()}`,
              filename: file.name.replace(/\.[^.]+$/, ""),
              size: formatFileSize(file.size),
              uploadedAt: formatUploadedAt(new Date()),
              author: "DTA Admin",
              note: "Uploaded from the admin panel.",
              group,
            };

            return {
              ...request,
              documents: [document, ...request.documents],
            };
          }),
        }));
      },
      removeDocument: (requestId, documentId) => {
        setData((current) => ({
          ...current,
          requests: current.requests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  documents: request.documents.filter(
                    (document) => document.id !== documentId,
                  ),
                }
              : request,
          ),
        }));
      },
      updateSettings: (patch) => {
        setData((current) => ({
          ...current,
          settings: { ...current.settings, ...patch },
        }));
      },
    }),
    [data],
  );

  if (!ready) {
    return <div className="admin-app min-h-full flex-1 bg-[#F3F4F6]" />;
  }

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const store = useContext(AdminContext);

  if (!store) {
    throw new Error("useAdmin must be used within AdminProvider");
  }

  return store;
}
