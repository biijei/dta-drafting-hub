# How a request moves through the app

The site is a Next.js app. The browser talks only to this app. The app talks to Supabase (database, staff login, private file storage), PayPal (the quoted charge), and Resend (email). Clients do not get an account. Staff do.

## Who connects to what

- The public site and the admin panel are the same Next.js server.
- Database and storage writes use the Supabase service role in `src/lib/supabase/admin.ts`. Row level security is on and there is no public policy, so the browser never queries Supabase directly for requests or files.
- Staff sign-in uses the Supabase cookie client in `src/lib/supabase/server.ts`. `POST /api/admin/login` calls `signInWithPassword`. Each admin route then calls `requireStaff()` and rejects an inactive profile.
- A client session is an httpOnly cookie, `dta_track`, created by `src/lib/track-session.ts`. It stores a token in `track_sessions` for 14 days. It is set when the request is submitted and again when the client looks the request up.
- PayPal orders are created on the server in `src/lib/paypal.ts`. The browser never chooses the amount.
- Every email goes through `sendMail` in `src/lib/mail.ts`. That function calls Resend with `RESEND_API_KEY` and `EMAIL_FROM`, and appends the disclaimer from Admin Settings. If the key, the from-address, or the recipient is missing, the email is skipped and the request is still saved. A Resend rejection is logged and does not roll the request back.

## Request statuses

- **Pending Review.** The client submitted files. No price yet. Draft upload and “Mark in progress” are blocked.
- **Awaiting Payment.** An owner saved a USD price and a PayPal approval link. Work has not started.
- **Submitted.** PayPal’s capture webhook matched that price. Work can start.
- **In Progress.** A staff member marked the paid request in progress. Allowed from Submitted, or again from Revision Requested.
- **Awaiting Your Review.** A draft was uploaded. The client can approve it or request changes.
- **Revision Requested.** The client sent a change note. Staff can upload another draft.
- **Approved.** The client approved the draft. The final file can be uploaded.
- **Completed.** The final file was uploaded.

The payment row is separate. It becomes **Paid** only inside the capture webhook. Until then the request’s payment display stays **Pending**.

## Emails

Each message includes a button. Client buttons open `/track-request/<Request ID>`. Business buttons open `/admin/requests/<id>`. If staff are signed out, login returns them to that request. The business address is the primary email in Admin Settings. If that field is empty, the message goes to `BUSINESS_EMAIL` in env.

- Submit → client. Request received, with **Track your request**. `sendRequestReceived`.
- Submit → business. A different message: review the files, set the USD price, and email the PayPal link. Button: **Set the price**. `sendNewRequestAlert`.
- Owner generates or resends a link → client. Amount and **Pay with PayPal**. `sendPaymentLink`. Resend uses the stored link and does not create a new order.
- Capture webhook marks the request paid → client. Payment received and work has started. **Open your request**. `sendWorkStarted`.
- That same capture → business. Payment is confirmed; start the work or assign a specialist. **Open the request**. `sendPaymentReceivedAlert`. A repeated capture does not send it again.
- Draft upload → client. `sendDraftReady`, with **Open your request**.
- Client asks for changes → business. `sendRevisionAlert`, with **Open the request**.
- Client approves the draft → business. `sendApprovedAlert`, with **Upload the final document**.
- Final upload → client. `sendCompleted`, with **Open your request**.

## The path

### 1. Client submits

The wizard is `src/app/(site)/request/_components/request-wizard.tsx`. Review ends with **Submit request**. There is no PayPal button and the catalog price is not charged.

`POST /api/requests` receives multipart form data: `serviceSlug`, `client` JSON, `details` JSON, and up to 8 files. It checks the service and required fields, takes the next public id (`DTA-YYYY-#####`) from `next_public_id()`, and inserts a `requests` row with status **Pending Review** and `amount_cents` 0. Files go into the private `request-files` bucket and a `files` row of kind `client_upload`. It writes an activity line, emails the client and the business inbox, and sets the track cookie.

The confirmation screen shows the Request ID. **View request workspace** opens `/track-request/<id>`. That page calls `GET /api/track/requests/[id]`, which loads the request only when the cookie matches. The Payment tab says the request is being priced.

If the cookie is missing, `POST /api/track/lookup` with the Request ID and the email on the request sets a new cookie.

### 2. Owner prices it

Staff open `/admin`. The panel loads through `src/lib/admin-store.tsx` (`/api/admin/me`, requests, clients, payments, overview, users, settings). Overview pending actions include **Pending Review** (“Set a price”) and **Awaiting Payment**.

On the request page, owners see **Price and payment link**. Specialists can read the price. Both payment routes return 403 for a specialist.

`POST /api/admin/requests/[id]/payment-link` accepts `{ amount }` in USD. It creates a PayPal order for that exact amount, stores the request id in PayPal `custom_id`, and keeps the `approve` / `payer-action` URL. It writes `amount_cents`, `paypal_order_id`, and `payment_url`, sets **Awaiting Payment**, emails the client, and writes an activity line. Setting a new price before payment creates a new order and a new email. The new link replaces the old one.

`POST /api/admin/requests/[id]/payment-link/resend` emails the stored link again.

The client’s Payment tab, while **Awaiting Payment**, shows the amount and **Pay with PayPal**, which opens `payment_url`. Approve and revision stay off.

### 3. The client pays

The approval link does not capture money. The buyer approves on PayPal. PayPal then calls this app.

`POST /api/paypal/webhook` verifies the signature with `PAYPAL_WEBHOOK_ID`.

- `CHECKOUT.ORDER.APPROVED`: the server captures that order. Capturing an order that is already captured is ignored.
- `PAYMENT.CAPTURE.COMPLETED`: the server finds the request by `paypal_order_id`, rejects a non-USD amount or an amount that does not match `amount_cents`, inserts a `payments` row (**Paid**, unique capture id), and moves the request from **Awaiting Payment** to **Submitted**. It emails the client that work has started. A second delivery of the same capture changes nothing.

The buyer does not have to return to the site for this to happen. Localhost cannot receive the webhook, so a sandbox payment stays **Awaiting Payment** until the webhook can reach the deployed URL.

### 4. Work, review, and the final file

Draft upload and **Mark in progress** stay unavailable until the status is **Submitted** or later.

- `PATCH /api/admin/requests/[id]` with `{ status: "In Progress" }` moves Submitted or Revision Requested to **In Progress**. The same route saves an internal note or an assignee. Notes are not shown to the client.
- `POST /api/admin/requests/[id]/documents` with kind `draft` stores the file, sets **Awaiting Your Review**, and emails the client. A draft is rejected once the status is **Approved** or **Completed**. Kind `final` is accepted only when the status is **Approved**; it sets **Completed** and emails the client.
- `GET /api/files/[id]` returns a 60-second signed download URL. The caller must be staff, or the client whose track cookie matches that request.

The client, on **Awaiting Your Review**:

- `POST /api/track/requests/[id]/approve` sets **Approved** and emails the Settings primary address, or `BUSINESS_EMAIL` in env, to upload the final document.
- `POST /api/track/requests/[id]/revisions` stores the note and any new files, sets **Revision Requested**, and emails the Settings primary address or `BUSINESS_EMAIL` in env.

Staff upload another draft (back to **Awaiting Your Review**) or, after approval, the final file (**Completed**). The client downloads that file from the workspace.
