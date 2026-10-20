# Make DTA functional

The app does not talk to Supabase, PayPal, or Resend until the values in `.env.example` are filled in as `.env.local`. Do these steps in order. Restart `npm run dev` after saving `.env.local`.

## 1. Supabase project

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Go to **Project Settings → API**.
3. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the `anon` `public` key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`.

Keep the service role key on the server only. Never put it in client code or commit `.env.local`.

## 2. Database and private files

1. Open **SQL Editor → New query**.
2. Paste the full contents of `supabase/migrations/001_init.sql` and run it.
3. That script creates the tables, turns on row level security with no public access, and creates a private Storage bucket named `request-files`.
4. Confirm the bucket under **Storage**. It must stay private. Downloads are issued by the app as short-lived signed URLs.

If the bucket insert fails, create a bucket named `request-files` yourself and leave **Public bucket** off. Set the file size limit to 10 MB.

## 3. Admin login

1. Open **Authentication → Sign In / Providers** and leave **Email** on.
2. Turn off public sign-ups so visitors cannot create admin accounts. Under **Authentication → Sign In / Providers → Email**, disable **Allow new users to sign up** if that toggle is shown. Also open **Authentication → Settings** and turn off **Allow new users to sign up** if it appears there.
3. Open **Authentication → Users → Add user**. Create the first owner with an email and password, and mark the email confirmed.
4. Run this in the SQL editor, using that email:

```sql
insert into public.profiles (id, full_name, email, role, active)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  'owner',
  true
from auth.users
where email = 'you@example.com'
on conflict (id) do update
set role = 'owner',
    active = true;
```

5. Sign in at `/admin/login`.
6. Open **Settings** and save the business email. New-request, payment, revision, and approval alerts go to that address. If it is empty, they go to `BUSINESS_EMAIL`.
7. Further staff are created from **Settings → Team**. That form creates a specialist. Specialists can work requests. They cannot change business settings or add staff.

## 4. PayPal

The client submits a request before paying. An owner sets the USD price in the admin panel, and the server creates a PayPal order for that amount.

1. Open the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) and create a sandbox app.
2. Copy the sandbox client ID into `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
3. Copy the secret into `PAYPAL_CLIENT_SECRET`.
4. Leave `PAYPAL_ENV=sandbox`.
5. Under the app, add a webhook for both `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`.
   - The approval event tells the server to capture the order. The capture event is what marks the request paid.
   - Local testing cannot receive PayPal webhooks, so a sandbox payment will not move the request to Submitted until the webhook can reach the deployed site.
   - For a deployed site, set the webhook URL to `https://<your-domain>/api/paypal/webhook` and copy the webhook ID into `PAYPAL_WEBHOOK_ID`.
6. When you are ready for real charges, create a live app, replace the client ID and secret, set the live webhook, and set `PAYPAL_ENV=live`.

## 5. Resend

1. Create an API key at [resend.com](https://resend.com) and set `RESEND_API_KEY`.
2. Verify the domain you will send from.
3. Set `EMAIL_FROM` to an address on that domain, for example `DTA Drafting Hub <notifications@yourdomain.com>`.
4. Set `BUSINESS_EMAIL` to the inbox that should receive business alerts when Admin Settings has no primary email, for example `admin@dtadraftinghub.com`.
5. Set `NEXT_PUBLIC_SITE_URL` to the public site origin, with no trailing slash. Locally that is `http://localhost:3000`.

These messages are sent:

- The client, when the request is submitted: request received, with the Request ID.
- The business email from Settings, when the request is submitted: set a price.
- The client, when an owner sends a payment link: the quoted amount and PayPal link.
- The client, after PayPal confirms payment: work has started.
- The business email from Settings, after PayPal confirms payment: start the work or assign it.
- The client, when a draft is uploaded: draft ready.
- The business email from Settings, when the client requests a revision.
- The business email from Settings, when the client approves the draft: upload the final document.
- The client, when the final file is uploaded: request completed.

Until the domain is verified, Resend will reject mail. The request is still saved.

## 6. Check the flow

1. Choose a service, complete the form, and submit the request. It is saved as Pending Review.
2. Save the Request ID. Open **Track My Request** and enter that ID plus the email on the request.
3. Sign in as an owner, open the request, set a USD price, and send the payment link. After PayPal confirms payment, assign the request, upload a draft with a review note, and confirm the client email.
4. As the client, download the draft and either approve it or send a revision with a note.
5. After approval, upload the final file. The request becomes **Completed** and the client can download it from the workspace.
