"use client";

import { useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

const DISMISS_MS = 4000;

const kindClass: Record<ToastKind, string> = {
  success: "bg-[#D1FF95] text-[#0D1B4B]",
  error: "bg-[#E25555] text-white",
  info: "bg-[#0D1B4B] text-white",
};

let items: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<(next: ToastItem[]) => void>();

function emit(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener(items));
}

function push(kind: ToastKind, message: string) {
  const id = nextId + 1;
  nextId = id;
  emit([...items, { id, kind, message }]);
  window.setTimeout(() => {
    emit(items.filter((item) => item.id !== id));
  }, DISMISS_MS);
}

export const toast = {
  success(message: string) {
    push("success", message);
  },
  error(message: string) {
    push("error", message);
  },
  info(message: string) {
    push("info", message);
  },
};

export function Toaster() {
  const [current, setCurrent] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(items);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  if (current.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-20 right-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {current.map((item) => (
        <p
          key={item.id}
          role={item.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${kindClass[item.kind]}`}
        >
          {item.message}
        </p>
      ))}
    </div>
  );
}
