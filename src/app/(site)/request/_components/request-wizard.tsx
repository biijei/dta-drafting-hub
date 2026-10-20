"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import { Copy, FileCheck, FileText, Info } from "lucide-react";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { Controller, useForm, type Control, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
  clearDraft,
  contactMethods,
  emptyDraft,
  getDraftSnapshot,
  getServerDraft,
  subscribeDraft,
  writeDraft,
  type ClientInfo,
  type Confirmation,
  type RequestDraft,
  type UploadedFile,
} from "@/content/request-draft";
import {
  getService,
  services,
  type Service,
  type ServiceField,
} from "@/content/services";
import { Dropdown } from "@/components/ui/dropdown";
import { PageLoading } from "@/components/ui/page-loading";
import { EmptyState } from "@/components/ui/empty-state";
import { FileDropzone } from "@/components/ui/file-dropzone";

const steps = ["Details/Documents", "Client Info", "Review", "Confirmation"];
const maxFileBytes = 10 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "doc", "docx", "jpg", "jpeg", "png"]);

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy";

const clientSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Enter your phone number"),
  company: z.string(),
  country: z.string().trim().min(1, "Enter your country"),
  region: z.string(),
  contactMethod: z.enum(["Email", "Phone", "Both"]),
});

type RequestWizardProps = {
  initialSlug: string;
};

function detailsSchema(service: Service) {
  return z.object(
    Object.fromEntries(
      service.fields.map((field) => [
        field.id,
        field.required
          ? z
              .string()
              .trim()
              .min(1, field.requiredMessage ?? "This field is required")
          : z.string(),
      ]),
    ),
  );
}

function extensionOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "") : "";
}

function displayValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function resolveDraft(stored: RequestDraft | null, initialSlug: string) {
  let next = emptyDraft(initialSlug);

  if (stored) {
    if (!initialSlug || stored.slug === initialSlug) {
      next = stored;
    } else {
      next = { ...emptyDraft(initialSlug), client: stored.client };
    }
  }

  if (next.confirmation && next.step !== 3) {
    return { ...next, step: 3 };
  }

  if (!next.confirmation && next.step > 2) {
    return { ...next, step: 2 };
  }

  return next;
}

export function RequestWizard({ initialSlug }: RequestWizardProps) {
  const stored = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getServerDraft,
  );

  if (stored === undefined) {
    return <PageLoading label="Loading your request" />;
  }

  return <RequestFlow initialSlug={initialSlug} stored={stored} />;
}

function RequestFlow({
  initialSlug,
  stored,
}: {
  initialSlug: string;
  stored: RequestDraft | null;
}) {
  const serviceLocked = Boolean(initialSlug && getService(initialSlug));
  const draft = resolveDraft(stored, initialSlug);
  const [fileError, setFileError] = useState("");
  const [blobs, setBlobs] = useState<File[]>([]);
  const service = getService(draft.slug);
  const visibleDraft = {
    ...draft,
    files: blobs.map((file) => ({ name: file.name, size: file.size })),
  };

  function commit(next: RequestDraft) {
    writeDraft(next);
  }

  function addFiles(list: FileList | File[]) {
    const accepted: UploadedFile[] = [];
    let error = "";

    for (const file of Array.from(list)) {
      const extension = extensionOf(file.name);
      if (!allowedExtensions.has(extension) || file.size > maxFileBytes) {
        error = "Use PDF, DOC, DOCX, JPG, or PNG files up to 10 MB each.";
        continue;
      }
      accepted.push({ name: file.name, size: file.size });
    }

    setFileError(error);
    if (!accepted.length) {
      return;
    }

    const names = new Set(blobs.map((file) => file.name));
    const incoming = Array.from(list).filter(
      (file) =>
        accepted.some((item) => item.name === file.name) && !names.has(file.name),
    );
    setBlobs((current) => [...current, ...incoming]);
  }

  function removeFile(name: string) {
    setBlobs((current) => current.filter((file) => file.name !== name));
  }

  function chooseService(slug: string) {
    if (draft.slug !== slug) {
      setBlobs([]);
    }

    commit({
      ...draft,
      slug,
      details: draft.slug === slug ? draft.details : {},
      confirmation: null,
      files: [],
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <RequestStepper
        step={draft.step}
        onStep={(step) => {
          if (step > 2) {
            return;
          }

          commit({
            ...draft,
            step,
            confirmation: null,
          });
        }}
      />
      {draft.step === 0 ? (
        <DetailsStep
          service={service}
          serviceLocked={serviceLocked}
          details={visibleDraft.details}
          files={visibleDraft.files}
          fileError={fileError}
          onSlug={chooseService}
          onFiles={addFiles}
          onRemoveFile={removeFile}
          onContinue={(details) =>
            commit({ ...draft, details, step: 1, confirmation: null, files: [] })
          }
        />
      ) : null}
      {draft.step === 1 ? (
        <ClientStep
          client={draft.client}
          onBack={() => commit({ ...draft, step: 0 })}
          onContinue={(client) =>
            commit({
              ...draft,
              client,
              step: 2,
              confirmation: null,
              files: [],
            })
          }
        />
      ) : null}
      {draft.step === 2 && service ? (
        <ReviewStep
          service={service}
          draft={visibleDraft}
          files={blobs}
          onEdit={(step) => commit({ ...draft, step, confirmation: null, files: [] })}
          onSubmitted={(confirmation) =>
            commit({ ...draft, step: 3, confirmation, files: [] })
          }
        />
      ) : null}
      {draft.step === 3 && draft.confirmation ? (
        <ConfirmationStep confirmation={draft.confirmation} onHome={clearDraft} />
      ) : null}
    </div>
  );
}

function RequestStepper({
  step,
  onStep,
}: {
  step: number;
  onStep: (step: number) => void;
}) {
  return (
    <div className="bg-navy">
      <ol className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-y-2 px-4 py-5">
        {steps.map((label, index) => {
          const complete = index < step;
          const current = index === step;

          return (
            <li key={label} className="flex items-center">
              {index > 0 ? (
                <span className="mx-2 h-px w-6 bg-white/25 sm:mx-3 sm:w-10" />
              ) : null}
              {complete ? (
                <button
                  type="button"
                  onClick={() => onStep(index)}
                  className="rounded-full bg-[#CCFFCC] px-3 py-1.5 text-xs font-medium text-ink sm:text-sm"
                >
                  {label}
                </button>
              ) : (
                <span
                  aria-current={current ? "step" : undefined}
                  className={clsx(
                    "px-3 py-1.5 text-xs sm:text-sm",
                    current
                      ? "rounded-full bg-sand font-medium text-ink"
                      : "text-white/60",
                  )}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DetailsStep({
  service,
  serviceLocked,
  details,
  files,
  fileError,
  onSlug,
  onFiles,
  onRemoveFile,
  onContinue,
}: {
  service: Service | undefined;
  serviceLocked: boolean;
  details: Record<string, string>;
  files: UploadedFile[];
  fileError: string;
  onSlug: (slug: string) => void;
  onFiles: (files: FileList | File[]) => void;
  onRemoveFile: (name: string) => void;
  onContinue: (details: Record<string, string>) => void;
}) {
  const [serviceError, setServiceError] = useState("");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Upload Documents
      </h1>
      <p className="mt-2 text-sm text-muted">
        Attach any supporting documents for your request. This step is optional.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <FileDropzone files={files} onAdd={onFiles} onRemove={onRemoveFile} />
        {fileError ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {fileError}
          </p>
        ) : null}
      </div>

      {service ? (
        <ServiceDetailsForm
          key={service.slug}
          service={service}
          serviceLocked={serviceLocked}
          details={details}
          serviceError={serviceError}
          onSlug={(slug) => {
            setServiceError("");
            onSlug(slug);
          }}
          onInvalidService={() => setServiceError("Select a service")}
          onContinue={onContinue}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
          <ServiceSelect slug="" onSlug={(slug) => {
            setServiceError("");
            onSlug(slug);
          }} />
          {serviceError ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {serviceError}
            </p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setServiceError("Select a service")}
              className="rounded-full bg-navy px-10 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ServiceSelect({
  slug,
  onSlug,
}: {
  slug: string;
  onSlug: (slug: string) => void;
}) {
  const selectId = useId();
  const labelId = useId();

  return (
    <div>
      <label id={labelId} className="block text-sm font-semibold text-ink">
        Which service do you need?
        <span className="text-red-700"> *</span>
      </label>
      <Dropdown
        id={selectId}
        labelledBy={labelId}
        className="mt-2"
        value={slug}
        onChange={onSlug}
        options={[
          { value: "", label: "Select a service" },
          ...services.map((item) => ({ value: item.slug, label: item.title })),
        ]}
      />
    </div>
  );
}

function ServiceDetailsForm({
  service,
  serviceLocked,
  details,
  serviceError,
  onSlug,
  onInvalidService,
  onContinue,
}: {
  service: Service;
  serviceLocked: boolean;
  details: Record<string, string>;
  serviceError: string;
  onSlug: (slug: string) => void;
  onInvalidService: () => void;
  onContinue: (details: Record<string, string>) => void;
}) {
  const schema = detailsSchema(service);
  const defaultValues = Object.fromEntries(
    service.fields.map((field) => [field.id, details[field.id] ?? ""]),
  );
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string>>,
    defaultValues,
  });

  return (
    <form
      className="mt-6"
      noValidate
      onSubmit={(event) => {
        if (!serviceLocked && !service.slug) {
          event.preventDefault();
          onInvalidService();
          return;
        }
        void form.handleSubmit(onContinue)(event);
      }}
    >
      <div className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
        <div className="space-y-5">
          {serviceLocked ? null : (
            <div>
              <ServiceSelect slug={service.slug} onSlug={onSlug} />
              {serviceError ? (
                <p className="mt-2 text-sm text-red-700" role="alert">
                  {serviceError}
                </p>
              ) : null}
            </div>
          )}
          {service.fields.map((field) =>
            field.type === "select" ? (
              <ServiceSelectField
                key={field.id}
                field={field}
                control={form.control}
                error={form.formState.errors[field.id]?.message}
              />
            ) : (
              <ServiceFieldInput
                key={field.id}
                field={field}
                registration={form.register(field.id)}
                error={form.formState.errors[field.id]?.message}
              />
            ),
          )}
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="rounded-full bg-navy px-10 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
        >
          Next
        </button>
      </div>
    </form>
  );
}

function ServiceSelectField({
  field,
  control,
  error,
}: {
  field: ServiceField;
  control: Control<Record<string, string>>;
  error?: string;
}) {
  const inputId = useId();
  const labelId = useId();

  return (
    <div>
      <label id={labelId} className="block text-sm font-semibold text-ink">
        {field.label}
        {field.required ? <span className="text-red-700"> *</span> : null}
      </label>
      <Controller
        name={field.id}
        control={control}
        render={({ field: input }) => (
          <Dropdown
            id={inputId}
            labelledBy={labelId}
            name={input.name}
            value={input.value ?? ""}
            onChange={input.onChange}
            onBlur={input.onBlur}
            ariaInvalid={Boolean(error)}
            className="mt-2"
            options={[
              { value: "", label: field.placeholder },
              ...(field.options ?? []).map((option) => ({
                value: option,
                label: option,
              })),
            ]}
          />
        )}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ServiceFieldInput({
  field,
  registration,
  error,
}: {
  field: ServiceField;
  registration: ReturnType<ReturnType<typeof useForm<Record<string, string>>>["register"]>;
  error?: string;
}) {
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
        {field.label}
        {field.required ? <span className="text-red-700"> *</span> : null}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          rows={4}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          className={clsx(fieldClass, "mt-2 resize-y")}
          {...registration}
        />
      ) : null}
      {field.type === "text" || field.type === "date" ? (
        <input
          id={inputId}
          type={field.type === "date" ? "date" : "text"}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          className={clsx(fieldClass, "mt-2")}
          {...registration}
        />
      ) : null}
      {error ? (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ClientStep({
  client,
  onBack,
  onContinue,
}: {
  client: ClientInfo;
  onBack: () => void;
  onContinue: (client: ClientInfo) => void;
}) {
  const form = useForm<ClientInfo>({
    resolver: zodResolver(clientSchema),
    defaultValues: client,
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;
  const [method, setMethod] = useState(client.contactMethod);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Your details
      </h1>
      <p className="mt-2 text-sm text-muted">
        Tell us how to reach you about this request.
      </p>
      <form
        className="mt-8"
        noValidate
        onSubmit={handleSubmit(onContinue)}
      >
        <div className="rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Full Name"
              required
              placeholder="Enter your full name"
              registration={register("fullName")}
              error={errors.fullName?.message}
            />
            <TextField
              label="Email Address"
              required
              type="email"
              placeholder="you@example.com"
              registration={register("email")}
              error={errors.email?.message}
            />
            <TextField
              label="Phone Number"
              required
              type="tel"
              placeholder="+1 555 000 0000"
              registration={register("phone")}
              error={errors.phone?.message}
            />
            <TextField
              label="Company Name (optional)"
              placeholder="If applicable"
              registration={register("company")}
            />
            <TextField
              label="Country"
              required
              placeholder="Your country"
              registration={register("country")}
              error={errors.country?.message}
            />
            <TextField
              label="State / Region"
              placeholder="Your state or region"
              registration={register("region")}
            />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-ink">
              Preferred communication method
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {contactMethods.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={method === item}
                  onClick={() => {
                    setMethod(item);
                    setValue("contactMethod", item, { shouldValidate: true });
                  }}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-sm font-medium text-ink",
                    method === item
                      ? "bg-[#CCFFCC]"
                      : "border border-sand bg-white hover:bg-sand/40",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-line px-8 py-2.5 text-sm font-medium text-ink hover:border-navy"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-full bg-navy px-10 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
          >
            Next
          </button>
        </div>
      </form>
    </section>
  );
}

function TextField({
  label,
  placeholder,
  registration,
  error,
  required,
  type = "text",
}: {
  label: string;
  placeholder: string;
  registration: ReturnType<ReturnType<typeof useForm<ClientInfo>>["register"]>;
  error?: string;
  required?: boolean;
  type?: string;
}) {
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={clsx(fieldClass, "mt-2")}
        {...registration}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReviewStep({
  service,
  draft,
  files,
  onEdit,
  onSubmitted,
}: {
  service: Service;
  draft: RequestDraft;
  files: File[];
  onEdit: (step: number) => void;
  onSubmitted: (confirmation: Confirmation) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    const body = new FormData();
    body.set("serviceSlug", service.slug);
    body.set("client", JSON.stringify(draft.client));
    body.set("details", JSON.stringify(draft.details));
    files.forEach((file) => body.append("files", file));

    try {
      const response = await fetch("/api/requests", { method: "POST", body });
      const payload = (await response.json()) as {
        error?: string;
        confirmation?: Confirmation;
      };

      if (!response.ok || !payload.confirmation) {
        setError(payload.error || "Could not submit the request.");
        return;
      }

      onSubmitted(payload.confirmation);
    } catch {
      setError("Could not submit the request.");
    } finally {
      setBusy(false);
    }
  }
  const clientRows = [
    ["Name", draft.client.fullName],
    ["Email", draft.client.email],
    ["Phone", draft.client.phone],
    ["Company", displayValue(draft.client.company)],
    ["Country", draft.client.country],
    ["State / Region", displayValue(draft.client.region)],
    ["Preferred contact", draft.client.contactMethod],
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Review your request
      </h1>
      <p className="mt-2 text-sm text-muted">{service.title}</p>

      <div className="mt-8 space-y-4">
        <ReviewCard title="Client Information" onEdit={() => onEdit(1)}>
          <dl className="grid gap-4 sm:grid-cols-2">
            {clientRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </ReviewCard>

        <ReviewCard title="Request Details" onEdit={() => onEdit(0)}>
          <dl className="space-y-4">
            {service.fields.map((field) => (
              <div
                key={field.id}
                className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="text-sm text-muted">{field.label}</dt>
                <dd className="text-sm font-medium text-ink sm:text-right">
                  {displayValue(draft.details[field.id])}
                </dd>
              </div>
            ))}
          </dl>
        </ReviewCard>

        <ReviewCard title="Documents" actionLabel="Re-upload" onEdit={() => onEdit(0)}>
          {draft.files.length ? (
            <ul className="space-y-3">
              {draft.files.map((file) => (
                <li key={file.name} className="text-sm font-medium text-ink">
                  {file.name}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents attached"
              description="You can go back and upload files, or submit without them."
            />
          )}
        </ReviewCard>

        <aside
          role="note"
          className="flex gap-4 rounded-2xl border border-gold/50 border-l-4 border-l-gold bg-navy-wash px-5 py-5 sm:px-6"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-light text-navy">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-wide text-navy-bright uppercase">
              For your review
            </p>
            <h2 className="mt-1 text-base font-semibold text-ink">
              What happens next
            </h2>
            <p className="mt-2 text-sm leading-6 text-navy-mid">
              Submit the request and files now. DTA reviews them and emails a
              payment link for the quoted USD amount. You can pay by card or
              PayPal. Work starts after that payment is confirmed.
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="rounded-full bg-navy px-6 py-3 text-sm font-medium text-white hover:bg-navy/90 disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit request"}
        </button>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ReviewCard({
  title,
  actionLabel = "Edit",
  onEdit,
  children,
}: {
  title: string;
  actionLabel?: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-ink hover:border-navy"
        >
          {actionLabel}
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function ConfirmationStep({
  confirmation,
  onHome,
}: {
  confirmation: Confirmation;
  onHome: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const rows = [
    ["Service", confirmation.title],
    ["Status", "Pending review"],
    ["Payment", "Link emailed after review"],
    ["Turnaround", confirmation.turnaround],
    ["Next step", "Watch for the payment email"],
  ];

  async function copyRequestId() {
    try {
      await navigator.clipboard.writeText(confirmation.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <div className="overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_0%,#24367f_0%,#0d1b4b_46%,#070f2c_100%)] px-5 py-10 text-center sm:px-10 sm:py-14">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-navy ring-4 ring-violet/50">
          <FileCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
          <span className="block text-lime">Request submitted</span>
          <span className="mt-2 block text-white">successfully</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gold">
          We received your request. DTA will review the files and email a payment
          link for the quoted amount. Please save your Request ID.
        </p>
        <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-white/10 px-5 py-6 sm:px-6">
          <p className="text-sm text-gold">Your Request ID</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {confirmation.id}
            </p>
            <button
              type="button"
              onClick={() => void copyRequestId()}
              aria-label="Copy request ID"
              className="group relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-lime hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span
                role="status"
                className={clsx(
                  "pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium whitespace-nowrap text-navy opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                  copied && "opacity-100",
                )}
              >
                {copied ? "Copied" : "Copy request ID"}
              </span>
            </button>
          </div>
        </div>
        <dl className="mx-auto mt-6 max-w-lg rounded-2xl bg-white px-5 py-2 text-left text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0"
            >
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-semibold text-ink">
                {label === "Status" ? (
                  <span className="inline-flex rounded-full bg-lime px-3 py-1 text-xs font-semibold text-navy">
                    {value}
                  </span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/track-request/${confirmation.id}`}
            className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            View request workspace
          </Link>
          <Link
            href="/"
            onClick={onHome}
            className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
