import { connection } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/admin";

type MailAction = {
  label: string;
  href: string;
};

type MailInput = {
  to: string;
  subject: string;
  text: string;
  action?: MailAction;
};

type BusinessSettings = {
  disclaimer: string;
  primaryEmail: string;
  businessName: string;
};

async function readBusinessSettings() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("disclaimer, primary_email, business_name")
    .eq("id", 1)
    .maybeSingle();

  return { data, error };
}

function mapBusinessSettings(
  data: {
    disclaimer: string | null;
    primary_email: string | null;
    business_name: string | null;
  } | null,
): BusinessSettings {
  return {
    disclaimer: data?.disclaimer?.trim() ?? "",
    primaryEmail: data?.primary_email?.trim() ?? "",
    businessName: data?.business_name?.trim() || "DTA Drafting Hub",
  };
}

async function disclaimer() {
  const { data } = await readBusinessSettings();
  return mapBusinessSettings(data);
}

export async function loadPublicDisclaimer() {
  await connection();
  const { data, error } = await readBusinessSettings();

  if (error) {
    throw new Error("Could not load the disclaimer.");
  }

  return mapBusinessSettings(data).disclaimer;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function actionButton(action: MailAction) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="border-radius:999px;background:#0C1B4D"><a href="${escapeHtml(action.href)}" style="display:inline-block;padding:12px 22px;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(action.label)}</a></td></tr></table>`;
}

function htmlBody(text: string, action: MailAction | undefined, disclaimerText: string) {
  const paragraphs = text
    .split("\n")
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#121826">${escapeHtml(line)}</p>`,
    )
    .join("");
  const button = action ? actionButton(action) : "";
  const footer = disclaimerText
    ? `<p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#6B7280">${escapeHtml(disclaimerText)}</p>`
    : "";

  return `<div>${paragraphs}${button}${footer}</div>`;
}

export async function sendMail(input: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from || !input.to) {
    console.error("Email skipped because Resend or the recipient is not configured.");
    return;
  }

  const settings = await disclaimer();
  const footer = settings.disclaimer ? `\n\n${settings.disclaimer}` : "";
  const actionLine =
    input.action && !input.text.includes(input.action.href)
      ? `\n\n${input.action.label}: ${input.action.href}`
      : "";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: `${input.text}${actionLine}${footer}`,
    html: htmlBody(input.text, input.action, settings.disclaimer),
  });

  if (error) {
    console.error("Resend rejected an email.", error);
  }
}

function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

function trackRequestUrl(requestId: string) {
  return `${siteOrigin()}/track-request/${encodeURIComponent(requestId)}`;
}

function adminRequestUrl(requestUuid: string) {
  return `${siteOrigin()}/admin/requests/${requestUuid}`;
}

function fallbackBusinessEmail() {
  return process.env.BUSINESS_EMAIL?.trim() ?? "";
}

async function sendToBusiness(input: Omit<MailInput, "to">) {
  const settings = await disclaimer();
  const to = settings.primaryEmail || fallbackBusinessEmail();

  if (!to) {
    console.error("Business email skipped because Settings and BUSINESS_EMAIL are empty.");
    return;
  }

  await sendMail({ ...input, to });
}

export async function sendRequestReceived(input: {
  to: string;
  requestId: string;
  title: string;
}) {
  const href = trackRequestUrl(input.requestId);

  await sendMail({
    to: input.to,
    subject: `We received your request ${input.requestId}`,
    action: { label: "Track your request", href },
    text: [
      `We received your ${input.title} request and will review the files you sent.`,
      `Your Request ID is ${input.requestId}.`,
      `After review, we will email a payment link for the quoted amount. You can pay by card or PayPal, and a card payment does not need a PayPal account. Work starts after that payment is confirmed.`,
      `Track it at ${href} using this Request ID and this email address.`,
    ].join("\n"),
  });
}

export async function sendNewRequestAlert(input: {
  requestUuid: string;
  requestId: string;
  title: string;
  clientName: string;
}) {
  const href = adminRequestUrl(input.requestUuid);

  await sendToBusiness({
    subject: `Set a price for ${input.requestId}`,
    action: { label: "Set the price", href },
    text: [
      `${input.clientName} submitted a ${input.title} request.`,
      `Request ID: ${input.requestId}`,
      "Review the files, set the USD price, and email the payment link.",
      href,
    ].join("\n"),
  });
}

export async function sendPaymentLink(input: {
  to: string;
  requestId: string;
  title: string;
  amount: string;
  url: string;
}) {
  await sendMail({
    to: input.to,
    subject: `Pay for your request ${input.requestId}`,
    action: { label: "Pay now", href: input.url },
    text: [
      `The price for your ${input.title} request is ${input.amount}.`,
      `Pay by card, PayPal, or another method offered at checkout: ${input.url}`,
      `A card payment does not need a PayPal account.`,
      `Request ID: ${input.requestId}`,
      `This link replaces any earlier payment link for this request. Work starts after the payment is confirmed.`,
      `You can also open ${trackRequestUrl(input.requestId)} with this Request ID and this email, then use the Payment tab.`,
    ].join("\n"),
  });
}

export async function sendWorkStarted(input: {
  to: string;
  requestId: string;
  title: string;
}) {
  const href = trackRequestUrl(input.requestId);

  await sendMail({
    to: input.to,
    subject: `Payment received for ${input.requestId}`,
    action: { label: "Open your request", href },
    text: [
      `Payment is confirmed for your ${input.title} request.`,
      `Request ID: ${input.requestId}`,
      `Work has started. Track progress at ${href} with this Request ID and this email address.`,
    ].join("\n"),
  });
}

export async function sendPaymentReceivedAlert(input: {
  requestUuid: string;
  requestId: string;
  title: string;
  clientName: string;
}) {
  const href = adminRequestUrl(input.requestUuid);

  await sendToBusiness({
    subject: `Payment received for ${input.requestId}`,
    action: { label: "Open the request", href },
    text: [
      `Payment is confirmed for ${input.clientName}'s ${input.title} request.`,
      `Request ID: ${input.requestId}`,
      "Start the work, or assign it to a specialist.",
      href,
    ].join("\n"),
  });
}

export async function sendDraftReady(input: {
  to: string;
  requestId: string;
  title: string;
  note: string;
}) {
  const href = trackRequestUrl(input.requestId);

  await sendMail({
    to: input.to,
    subject: `Your draft is ready (${input.requestId})`,
    action: { label: "Open your request", href },
    text: [
      `A draft of your ${input.title} request is ready for review.`,
      `Request ID: ${input.requestId}`,
      `Note from DTA: ${input.note}`,
      `Open ${href}, enter your Request ID and this email, then download the draft. You can approve it or request changes.`,
    ].join("\n"),
  });
}

export async function sendApprovedAlert(input: {
  requestUuid: string;
  requestId: string;
  title: string;
  clientName: string;
}) {
  const href = adminRequestUrl(input.requestUuid);

  await sendToBusiness({
    subject: `Draft approved for ${input.requestId}`,
    action: { label: "Upload the final document", href },
    text: [
      `${input.clientName} approved the draft for ${input.requestId}.`,
      `Service: ${input.title}`,
      "Upload the final document from the admin panel.",
      href,
    ].join("\n"),
  });
}

export async function sendRevisionAlert(input: {
  requestUuid: string;
  requestId: string;
  clientName: string;
  note: string;
}) {
  const href = adminRequestUrl(input.requestUuid);

  await sendToBusiness({
    subject: `Revision requested for ${input.requestId}`,
    action: { label: "Open the request", href },
    text: [
      `${input.clientName} requested changes on ${input.requestId}.`,
      input.note,
      "The note and any new files are in the admin panel.",
      href,
    ].join("\n"),
  });
}

export async function sendCompleted(input: {
  to: string;
  requestId: string;
  title: string;
}) {
  const href = trackRequestUrl(input.requestId);

  await sendMail({
    to: input.to,
    subject: `Your document is complete (${input.requestId})`,
    action: { label: "Open your request", href },
    text: [
      `Your ${input.title} request ${input.requestId} is complete.`,
      `Open ${href} with your Request ID and this email to download the final document.`,
    ].join("\n"),
  });
}
