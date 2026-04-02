# MemberKit

A membership app I built with Convex, Stripe, and React. Users sign in with GitHub, can upgrade to PRO via Stripe Checkout, and PRO members get access to gated content. There's also a basic admin view for payments.

**Stack:** React · Vite · Convex · Convex Auth · Stripe · Resend · TypeScript · Vitest

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Convex project

```bash
npx convex dev
```

Log in when prompted and create a new project. The CLI will write `VITE_CONVEX_URL` to `.env.local` automatically. Leave this terminal running — it watches your backend files and syncs changes live.

### 3. Set up environment variables

Fill in `.env.local` with the following:

| Variable                | Where to get it                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `VITE_CONVEX_URL`       | Auto-filled by `npx convex dev`                                                               |
| `STRIPE_SECRET_KEY`     | [Stripe dashboard → API keys](https://dashboard.stripe.com/apikeys)                           |
| `STRIPE_WEBHOOK_SECRET` | [Stripe dashboard → Webhooks](https://dashboard.stripe.com/webhooks) — see step 5             |
| `STRIPE_PRO_PRICE_ID`   | Create a product + one-time price in Stripe, copy the `price_xxx` ID                          |
| `RESEND_API_KEY`        | [resend.com/api-keys](https://resend.com/api-keys) (optional — skips confirmation email if absent) |
| `RESEND_FROM_EMAIL`     | A verified sender in your Resend account (optional)                                           |
| `GITHUB_CLIENT_ID`      | [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET`  | Same OAuth app                                                                                |
| `JWT_PRIVATE_KEY`       | Run: `npx convex env set JWT_PRIVATE_KEY "$(node -e "const {generateKeyPairSync}=require('crypto');const {privateKey}=generateKeyPairSync('ed25519');process.stdout.write(privateKey.export({type:'pkcs8',format:'pem'}).replace(/\n/g,'\\n'))")"` |

The backend variables (`STRIPE_*`, `RESEND_*`, `GITHUB_*`, `JWT_PRIVATE_KEY`) need to be pushed to Convex as well — they don't get picked up from `.env.local`:

```bash
npx convex env set STRIPE_SECRET_KEY sk_test_xxx
npx convex env set STRIPE_WEBHOOK_SECRET whsec_xxx
# etc.
```

### 4. Set up GitHub OAuth

1. Go to [GitHub OAuth Apps](https://github.com/settings/developers) and create a new app
2. **Homepage URL:** `http://localhost:5173`
3. **Authorization callback URL:** `https://YOUR_DEPLOYMENT.convex.cloud/api/auth/callback/github`
4. Copy the Client ID and Secret into your env

### 5. Set up the Stripe webhook

1. In the [Stripe Webhooks dashboard](https://dashboard.stripe.com/webhooks), add an endpoint
2. URL: `https://YOUR_DEPLOYMENT.convex.cloud/stripe/webhook`
3. Event to listen for: `checkout.session.completed`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

For local testing with the Stripe CLI:

```bash
stripe listen --forward-to https://YOUR_DEPLOYMENT.convex.cloud/stripe/webhook
```

### 6. Run it

```bash
# Terminal 1 — keep this running
npx convex dev

# Terminal 2
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### 7. Make yourself an admin

Sign in first, then run this from the Convex dashboard (Functions panel):

```
makeAdmin({ email: "your@email.com" })
```

---

## Tests

```bash
npm test          # run once
npm run test:watch
```

Tests live in `src/tests/`:

- `webhook.test.ts` — signature verification, duplicate event handling, plan upgrade logic
- `proGuard.test.tsx` — access control for FREE vs PRO users

---

## Project structure

```
convex/
  schema.ts        # users + payments tables
  auth.ts          # Convex Auth config + getCurrentUser
  auth.config.ts   # GitHub OAuth provider
  users.ts         # createCheckoutSession action
  payments.ts      # payment queries/mutations + admin summary
  http.ts          # Stripe webhook handler + Resend email

src/
  components/
    Layout.tsx       # nav + page wrapper
    PlanBadge.tsx    # FREE / PRO badge
    ProGuard.tsx     # blocks non-PRO users
  pages/
    LoginPage.tsx         # GitHub sign-in
    BillingPage.tsx       # plan info + upgrade + payment history
    ProContentPage.tsx    # gated content
    AdminPaymentsPage.tsx # admin-only payments table
  lib/
    utils.ts         # formatDate, formatCurrency
  tests/
    setup.ts
    webhook.test.ts
    proGuard.test.tsx
```

---

## How the payment flow works

Stripe hosts the checkout page, so we never touch raw card data. When a user clicks upgrade, we create a Checkout session and redirect them. After payment, Stripe fires a `checkout.session.completed` webhook to Convex, which verifies the signature, records the payment, and upgrades the user's plan in a single mutation.

The only slightly interesting part is idempotency — Stripe can retry webhooks, so there's a unique index on `eventId`. If the same event comes in twice, the duplicate check catches it before any write happens.

Because Convex queries are reactive, the billing page and nav badge update the moment the webhook fires. No polling needed.

---

## What's done

- GitHub OAuth via Convex Auth
- Stripe Checkout + webhook with signature verification
- Idempotent payment recording
- Automatic plan upgrade on payment
- PRO access control (ProGuard)
- Admin payments table (role-gated)
- Optional Resend confirmation email
- 11 passing tests

## What I'd add next

- Stripe Customer Portal so users can manage or cancel
- Audit log for plan changes (who upgraded, when, from what)
- Email/password auth as an alternative to GitHub
- Pagination on the admin table
- An end-to-end test that fires a real webhook against a dev Convex instance
