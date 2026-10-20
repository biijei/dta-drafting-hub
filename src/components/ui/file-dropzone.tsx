"use client";

import { CloudUpload, X } from "lucide-react";
import { useId } from "react";

const accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

type FileDropzoneProps = {
  files: { name: string }[];
  onAdd: (files: File[]) => void;
  onRemove: (name: string) => void;
  multiple?: boolean;
};

export function FileDropzone({
  files,
  onAdd,
  onRemove,
  multiple = true,
}: FileDropzoneProps) {
  const inputId = useId();

  function addFromList(list: FileList | null) {
    const incoming = Array.from(list ?? []);

    if (!incoming.length) {
      return;
    }

    onAdd(multiple ? incoming : incoming.slice(0, 1));
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFromList(event.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-navy/20 bg-navy-wash px-6 py-10 text-center"
      >
        <CloudUpload className="h-8 w-8 text-navy" strokeWidth={1.5} aria-hidden />
        <span className="mt-4 text-sm font-medium text-ink">
          Drop {multiple ? "files" : "a file"} here, or click to browse
        </span>
        <span className="mt-1 text-sm text-muted">
          PDF, DOC, DOCX, JPG, PNG — max 10 MB per file
        </span>
        <input
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            addFromList(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {files.length ? (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2 text-sm"
            >
              <span className="truncate text-ink">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(file.name)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-notice hover:text-ink"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
