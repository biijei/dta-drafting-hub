"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import { CloudUpload, FileCheck, X } from "lucide-react";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
  buildTrackedRequest,
  clearDraft,
  contactMethods,
  createQuote,
  createRequestId,
  emptyDraft,
  getDraftSnapshot,
  getServerDraft,
  readSubmittedRequest,
  saveSubmittedRequest,
  subscribeDraft,
  writeDraft,
  type ClientInfo,
  type RequestDraft,
  type UploadedFile,
} from "@/content/request-draft";
import {
  formatAud,
  getService,
  services,
  type Service,
  type ServiceField,
} from "@/content/services";
import type { TrackedRequest } from "@/content/track-request";

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

  if (next.submittedId && !readSubmittedRequest(next.submittedId)) {
    return { ...next, submittedId: null, step: Math.min(next.step, 2) };
  }

  if (next.submittedId && next.step !== 3) {
    return { ...next, step: 3 };
  }

  if (!next.submittedId && next.step > 2) {
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
    return <div className="min-h-[24rem] flex-1 bg-white" />;
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
  const submitted = draft.submittedId
    ? (readSubmittedRequest(draft.submittedId) ?? null)
    : null;
  const service = getService(draft.slug);

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

    const names = new Set(draft.files.map((file) => file.name));
    commit({
      ...draft,
      files: [...draft.files, ...accepted.filter((file) => !names.has(file.name))],
    });
  }

  function removeFile(name: string) {
    commit({
      ...draft,
      files: draft.files.filter((file) => file.name !== name),
    });
  }

  function chooseService(slug: string) {
    commit({
      ...draft,
      slug,
      details: draft.slug === slug ? draft.details : {},
      quote: null,
      submittedId: null,
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <RequestStepper
        step={draft.step}
        onStep={(step) =>
          commit({
            ...draft,
            step,
            submittedId: step < 3 ? null : draft.submittedId,
          })
        }
      />
      {draft.step === 0 ? (
        <DetailsStep
          service={service}
          serviceLocked={serviceLocked}
          details={draft.details}
          files={draft.files}
          fileError={fileError}
          onSlug={chooseService}
          onFiles={addFiles}
          onRemoveFile={removeFile}
          onContinue={(details) =>
            commit({ ...draft, details, step: 1, submittedId: null })
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
              quote: draft.quote ?? createQuote(),
              submittedId: null,
            })
          }
        />
      ) : null}
      {draft.step === 2 && service && draft.quote ? (
        <ReviewStep
          service={service}
          draft={draft}
          onEdit={(step) => commit({ ...draft, step, submittedId: null })}
          onContinue={() => {
            const id = createRequestId();
            const request = buildTrackedRequest(draft, service, id);
            saveSubmittedRequest(request);
            commit({ ...draft, step: 3, submittedId: id });
          }}
        />
      ) : null}
      {draft.step === 3 && submitted ? (
        <ConfirmationStep request={submitted} onHome={clearDraft} />
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
      <ol className="mx-auto flex w-full max-w-3xl items-center justify-center overflow-x-auto px-4 py-5">
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
                  className="rounded-full bg-navy-soft px-3 py-1.5 text-xs font-medium text-ink sm:text-sm"
                >
                  {label}
                </button>
              ) : (
                <span
                  aria-current={current ? "step" : undefined}
                  className={clsx(
                    "px-3 py-1.5 text-xs sm:text-sm",
                    current
                      ? "rounded-full bg-gold-light font-medium text-ink"
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
  const uploadId = useId();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Upload Documents
      </h1>
      <p className="mt-2 text-sm text-muted">
        Attach any supporting documents for your request. This step is optional.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <label
          htmlFor={uploadId}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onFiles(event.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center rounded-2xl bg-navy-wash px-6 py-14 text-center"
        >
          <CloudUpload className="h-8 w-8 text-navy" strokeWidth={1.5} aria-hidden />
          <span className="mt-4 text-sm text-muted">
            PDF, DOC, DOCX, JPG, PNG — max 10 MB per file
          </span>
          <input
            id={uploadId}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) {
                onFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />
        </label>
        {files.length ? (
          <ul className="mt-4 space-y-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.name)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-notice hover:text-ink"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
  return (
    <label className="block text-sm font-semibold text-ink">
      Which service do you need?
      <span className="text-red-700"> *</span>
      <select
        value={slug}
        onChange={(event) => onSlug(event.target.value)}
        className={clsx(fieldClass, "mt-2")}
      >
        <option value="">Select a service</option>
        {services.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
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
          {service.fields.map((field) => (
            <ServiceFieldInput
              key={field.id}
              field={field}
              registration={form.register(field.id)}
              error={form.formState.errors[field.id]?.message}
            />
          ))}
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
      {field.type === "select" ? (
        <select
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={clsx(fieldClass, "mt-2")}
          {...registration}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
                    "rounded-full px-4 py-2 text-sm font-medium",
                    method === item
                      ? "bg-navy text-white"
                      : "border border-line bg-white text-ink hover:border-navy",
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
  onEdit,
  onContinue,
}: {
  service: Service;
  draft: RequestDraft;
  onEdit: (step: number) => void;
  onContinue: () => void;
}) {
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
        Review / payment
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
            <p className="text-sm text-muted">No documents attached.</p>
          )}
        </ReviewCard>

        <article className="rounded-2xl border border-line bg-card px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-ink">Quote Reference</h2>
            <p className="text-sm font-semibold text-ink">
              {draft.quote?.reference}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">Expires: {draft.quote?.expires}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted">Service fee — {service.title}</dt>
              <dd className="font-medium text-ink">{formatAud(service.price)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tax</dt>
              <dd>—</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Discount</dt>
              <dd>—</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold text-ink">
              <dt>Total</dt>
              <dd>{formatAud(service.price)}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-navy px-10 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
        >
          Next
        </button>
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
  request,
  onHome,
}: {
  request: TrackedRequest;
  onHome: () => void;
}) {
  const rows = [
    ["Service", request.title],
    ["Payment", request.payment.status.toUpperCase()],
    ["Turnaround", request.estimatedCompletion],
    ["Next step", "Await confirmation email"],
  ];

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-16 text-center">
      <FileCheck className="h-12 w-12 text-navy" strokeWidth={1.5} aria-hidden />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
        Request Submitted Successfully
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        We&apos;ve received your request and will be in touch shortly. Please
        save your Request ID.
      </p>
      <div className="mt-8 w-full rounded-2xl bg-navy-wash px-6 py-6">
        <p className="text-sm text-muted">Your Request ID</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {request.id}
        </p>
      </div>
      <dl className="mt-6 w-full rounded-2xl border border-line px-5 py-4 text-left text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/track-request/${request.id}`}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
        >
          View request workspace
        </Link>
        <Link
          href="/"
          onClick={onHome}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-navy"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
