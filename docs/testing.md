# What to test

Run `supabase/migrations/002_quote_payment.sql` first if submit returns “Could not save the request.” Use a sandbox PayPal app. Webhook checks need the deployed site, not localhost.

## Client

- Submit a service with the required fields. Review shows **Submit request** and does not show a PayPal button or a charge.
- Confirmation shows a Request ID and says a payment link comes after review. The client email has **Track your request**.
- The Settings primary email receives a different message with **Set the price**. That button opens the request after sign-in.
- Track with that ID and the same email. Payment says the request is being priced. Approve and revision are unavailable.
- After an owner sends a link, Payment shows the quoted amount and **Pay with PayPal**.
- After the capture webhook, the status is **Submitted** and a receipt is shown. The client email has **Open your request**. The Settings email says to start the work or assign a specialist, with **Open the request**.

## Owner

- The new request appears as **Pending Review**, with pending action “Set a price.”
- Enter a USD amount and use **Generate and email link**. Status becomes **Awaiting Payment**. The client email contains that amount and link.
- **Resend link** sends the same link and does not change the amount.
- Enter a different amount before payment. A new email arrives, and the old link is no longer the one stored.
- Before payment, draft upload and **Mark in progress** are unavailable.
- After payment, mark in progress, upload a draft with a note, and confirm the client email.

## Specialist

- Can open the request and see the price.
- **Generate and email link** and **Resend link** are not available. Calling either route returns 403.

## After payment

- Client can download the draft, approve it, or send a revision note.
- A revision emails the primary address in Settings and sets **Revision Requested**.
- Final upload is available only after **Approved**. It sets **Completed**, emails the client, and the file downloads from the workspace.

## PayPal webhook

- The webhook lists both `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`.
- A matching capture sets **Submitted** and inserts one **Paid** row.
- Sending the same capture again does not add a second payment or a second “work started” email.
- A capture whose amount does not match the quote does not mark the request paid.
