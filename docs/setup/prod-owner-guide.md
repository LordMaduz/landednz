# Production setup: owner guide

Click-by-click steps for the accounts and keys **production** needs (plan Task C4, Steps 2–3). Same rules as [staging-owner-guide.md](staging-owner-guide.md):

- Paste keys only into the platform fields named below, or into your password manager. Never into chat, git or a screenshot.
- Dashboards change their menus now and then. If a label has moved, look for the same words in the settings menu.
- Every paid item uses the **cheapest option that works**. Upgrades are listed at the end with the trigger that should make you pay.

## What production is made of

```
Browser ──> landednz.co.nz (Vercel Hobby, Production)
              │
              └──> api.landednz.co.nz (Railway Hobby, Singapore) ──> Supabase landednz-prod (free, Sydney)
                                         │
                                         ├─> Anthropic (landednz-prod key, capped)
                                         ├─> OpenAI   (same key as staging, capped)
                                         └─> Sentry   (same projects as staging, free)
Browser ──> PostHog (page views, free tier)
```

## Cost at launch

| Item | Pick | Cost |
| --- | --- | --- |
| Domain `landednz.co.nz` | Cloudflare Registrar (sells at cost, no markup) | yearly fee shown at checkout; the only up-front payment |
| Railway (API) | Hobby | US$5/mo, includes US$5 of usage. A small API like ours should land at US$5–6 |
| Anthropic | pay per use, workspace limit | capped by you (suggested US$20/mo to start) |
| OpenAI | pay per use, existing budget | cents; existing US$10 cap stays |
| Vercel, Supabase, Sentry, PostHog, Google | free plans | US$0 |

**Expected total: about US$5–6/month + AI usage you cap + the yearly domain.**

## Checklist

- [x] 1. Domain `landednz.co.nz` registered at Cloudflare
- [x] 2. Railway Hobby plan + spend limits
- [x] 3. Google sign-in for production (Google Cloud project `landednz-prod`, published)
- [x] 4. Supabase `landednz-prod`: Google provider on, values in your password manager
- [x] 5. Anthropic workspace `landednz-prod` with a key and spend limit
- [x] 6. PostHog account + project
- [x] 7. `ADMIN_API_KEY` generated
- [x] 8. Privacy page wording for analytics: A chosen 2026-10-31, wording approved and applied (plus OpenAI, Sentry, hosting and contact filled in; Terms operator + contact filled in)
- [x] 9. Email forwarding for `privacy@` and `hello@landednz.co.nz` (section 9)
- [ ] 10. Paste the production secrets into Railway and Vercel (section 10)

Already done, nothing to do: OpenAI budget (staging guide §4), Sentry projects + token (§5), Vercel Branch Tracking = `production` (§6), CLI logins (`railway`, `vercel`, `supabase`, `gh` all checked 2026-10-31).

When all boxes are ticked, tell the agent "prod checklist done". The agent's part is at the end.

---

## 1. Domain (Cloudflare Registrar)

**Why Cloudflare:** it charges what the registry charges, with no markup, renews at the same price, and its free DNS is what we point at Vercel and Railway. `.co.nz` is on Cloudflare's supported list.

1. Open <https://dash.cloudflare.com/sign-up> and create a free account (or sign in).
2. Left menu → **Domain Registration** → **Register Domains**.
3. Search `landednz.co.nz`. If it is shown as available, **Purchase**.
   - It was unregistered on 2026-10-31 (whois). Optional: also buy `landednz.nz` and later forward it to `landednz.co.nz`, so no one else can take the look-alike. Never show `landednz.nz` on marketing or email.
4. **Term:** 1 year (minimum spend; you can renew or extend later at the same price).
5. **Contact details:** your real name and address (the `.nz` registry requires them; Cloudflare keeps them private where the registry allows).
6. **Auto-renew:** leave it **on**, so the site never drops off when the year ends.
7. Pay. The domain shows up under **Websites** with Cloudflare DNS already active.

Do **not** add any DNS records yourself. The agent sends you the exact list in Step 3 of C4 (apex and `www` → Vercel, `api` → Railway), and they all need **Proxy status: DNS only** (grey cloud). Vercel and Railway issue their own certificates, so the orange proxy would get in the way.

**Send back:** "domain done". Nothing secret.

**About the name:** `landed.nz` and `landed.co.nz` are taken, and `landednz.com` is a live NZ relocation business called "Landed" (property research, viewings, moving help), so it has the same audience as us. No IPONZ trademark was found for it, so we keep LandedNZ. To limit the mix-up: always write **LandedNZ** (never just "Landed"), always give the full address `landednz.co.nz` (people type `.com` by default), and claim the LandedNZ social handles early.

**One domain, many names:** subdomains cost nothing extra, because each one is just a DNS record. The app stays at `landednz.co.nz` and the API at `api.landednz.co.nz`. Later, the same domain can carry business email (`hello@`, `support@`) and your portfolio (`ruchira.landednz.co.nz`); see "Later".

---

## 2. Railway (production API host)

**What it is:** runs the API from the repo's `Dockerfile`, always on, no cold starts. Billed per second of RAM/CPU plus traffic; the US$5 Hobby fee is a usage credit, so at our size it is mostly the whole bill.

### 2a. Hobby plan

1. Open <https://railway.com/account/billing> (you are already signed in as the CLI account).
2. Choose **Hobby** → add a card → confirm. Do **not** pick Pro (US$20).

### 2b. Spend limits (the safety net)

1. Open your workspace → **Usage** (<https://railway.com/workspace/usage>).
2. Under **Usage limits → Compute**:
   - **Custom email alert:** `US$6`. Railway emails you; nothing stops.
   - **Hard limit:** `US$10`. When usage hits this, Railway **takes the API offline** until the next billing cycle or until you raise the limit. You get warnings at 75 % and 90 % first.
3. **Save.**

Why US$10: it is double the expected bill, so normal traffic never hits it, but a runaway bug or abuse costs at most US$10. If an alert email arrives, tell the agent before raising anything.

### 2c. GitHub access

1. Open <https://github.com/apps/railway-app/installations/new> → your account → **Only select repositories** → the LandedNZ repo → **Install** (or **Save**).

Do **not** create a project or service. The agent creates it from the CLI and sets the non-secret settings; then it tells you which secrets to paste into which Railway field.

**Send back:** "railway done". Nothing secret.

---

## 3. Google sign-in for production

Same as staging guide §2, with production names, **plus one extra step: publish**, so anyone with a Google account can sign in (staging stays in Testing, which allows only listed test users).

### 3a. Project

1. <https://console.cloud.google.com/> → project selector → **New Project**.
2. **Project name:** `landednz-prod`, **No organization** → **Create** → **Select Project**. Check the top bar shows `landednz-prod`.

### 3b. Consent screen

1. ☰ → **APIs & Services** → **OAuth consent screen** → **Get started**.
2. **App name:** `LandedNZ`. **User support email:** your email → **Next**.
3. **Audience:** **External** → **Next**. **Contact information:** your email → **Next** → tick the agreement → **Create**.
4. **Data Access** → **Add or remove scopes** → tick `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid` → **Update** → **Save**. These are non-sensitive scopes: no Google app review is needed.
5. **Audience** → **Publishing status: Testing** → **Publish app** → **Confirm**. It should now read **In production**.

**What users will see:** until Google brand-verifies the app, the Google screen may say "continue to `cauaowrnsivggivsopad.supabase.co`" instead of showing the LandedNZ name and logo. Sign-in works either way. Brand verification is free and is a later step (see "Later"), because it needs the live domain, home page and privacy page first.

### 3c. OAuth client

1. **Clients** → **Create client** → **Web application** → name `LandedNZ Production`.
2. **Authorized redirect URIs** → **Add URI** → exactly:

   ```
   https://cauaowrnsivggivsopad.supabase.co/auth/v1/callback
   ```

3. **Create** → copy the **Client ID** and **Client Secret** into your password manager.

---

## 4. Supabase `landednz-prod` (already exists, free plan)

### 4a. Google provider (Google is the only sign-in method in production)

1. Open <https://supabase.com/dashboard/project/cauaowrnsivggivsopad/auth/providers>.
2. **Google** → enable → paste the Client ID (**Client IDs**) and Client Secret → **Skip nonce checks** on → **Save**.
3. **Email** → switch **off** → **Save**. Supabase turns Email on for every new project, so it will show as enabled until you do this. "Email" here means email-and-password sign-up and sign-in; production uses Google only. The web app already hides the password form in production (`NEXT_PUBLIC_AUTH_PASSWORD_ENABLED=false`), but with Email on, anyone could still create a password account by calling Supabase directly. Switching it off blocks that on the server too.

### 4b. Values for the agent's paste list

From **Project Settings**, copy into your password manager (not chat):

- **Database → Connection string → Session pooler** URL, with your DB password filled in → this is `DATABASE_URL`.
- **API → Project URL** (`https://cauaowrnsivggivsopad.supabase.co`).
- **API Keys → Publishable key** and **Secret key**.

Leave **Authentication → URL Configuration** alone; the agent gives you the exact Site URL and Redirect URLs once the domain is live.

**Free-plan facts you should know** (no action):

- A free project **pauses after a week of no database activity**. Our `health.yml` workflow runs `SELECT 1` through `/health` every 6 hours, which counts as activity.
- The free plan has **no downloadable backups**. If the database were lost, user accounts and progress would be gone (content can be rebuilt from the repo). See "Later" for when to pay for Pro.

---

## 5. Anthropic workspace `landednz-prod`

1. <https://console.anthropic.com> → **Settings** → **Workspaces** → **Create Workspace** → `landednz-prod`.
2. Open it → **Limits** → monthly spend limit **US$20** → **Save**. (The plan suggested US$50; US$20 is the minimum-spend start. Each user is also capped at 20 Guide questions a day by `GUIDE_DAILY_CAP`.)
3. **Settings** → **API Keys** → **Create Key** → workspace `landednz-prod`, name `landednz-prod-railway` → copy the `sk-ant-…` key to your password manager (shown once).

If the limit is hit, the Guide stops answering until next month or until you raise it. Usage is visible per workspace, so you can see what production costs.

---

## 6. PostHog (page views)

1. <https://us.posthog.com/signup> → sign up (free; **don't add a card**). Region **US Cloud**: no NZ/AU region exists, both are equally far.
2. Name the organization `LandedNZ`, project `landednz-prod`.
3. Skip the install wizard (the code already includes PostHog and turns it on only when the key is set).
4. **Project settings** → copy the **Project API key** (`phc_…`) and the host (`https://us.i.posthog.com`). The project key is public by design (it ships to browsers), but keep it with the others for the paste list.

**Why no card:** without a card PostHog stays on the free plan (1 million events a month) and drops anything above it instead of billing you.

---

## 7. `ADMIN_API_KEY`

Production must have one: after each content deploy the agent calls `POST /admin/recalculate` with it.

1. In this Claude Code prompt type:

   ```
   ! openssl rand -hex 32 | pbcopy
   ```

   It copies a random 64-character key to your clipboard without printing it.
2. Paste it straight into your password manager as `LandedNZ prod ADMIN_API_KEY`.

---

## 8. Privacy page and analytics (your judgement)

`apps/web/src/content/legal/privacy.md` does not mention analytics today. Turning PostHog on in production collects page views, and NZ's Privacy Act 2020 (principle 3) expects people to be told what is collected and why.

Options:

- **A (recommended):** the agent adds one plain sentence to the privacy page (page views and device type through PostHog, to improve the app, no selling of data) before release. You approve the wording.
- **B:** launch with PostHog **off** (leave its key empty) and add it later with the wording.

**Decided 2026-10-31: A.** Applied to `privacy.md` with the approved wording.

---

## 9. Email forwarding (Cloudflare Email Routing, free)

The Privacy page lists `privacy@landednz.co.nz` and the Terms page lists `hello@landednz.co.nz`. Both forward to your Gmail, so your personal address never shows publicly.

1. Cloudflare dashboard → **Compute** → **Email Service** → **Email Routing** → **Onboard Domain** → pick **landednz.co.nz** → **Done**. Cloudflare adds its MX, SPF and DKIM records (the only DNS records you add yourself); they take 5–15 minutes.
2. **Destination addresses** → enter your Gmail → open the email Cloudflare sends → **Verify email address**. Rules stay disabled until this is done.
3. Back on **Email Routing**, click **landednz.co.nz** in the domain list → **Routing Rules** tab → **Create routing rule**: **Email pattern** `privacy`, **Action** "Send to an email", **Destination** your Gmail → **Save**. Repeat for `hello`.
4. Send a test email to each address from another account and check it arrives.

This receives mail only. Replying from `hello@` needs a mail provider (see "Later: Business email").

**Send back:** "email done".

---

## 10. Paste the production secrets (about 10 minutes)

The agent has already set every value that is not a secret, in Railway and in Vercel. Seven values are left; all of them are already in your password manager from earlier sections. Copy each one from the password manager and paste it straight into the field named. Nothing goes into chat.

### 10a. Railway: 5 variables

1. Open <https://railway.com/project/4d334943-61ff-40c0-a2e5-7e2fb16eaef7> (project **landednz-prod**, environment **production**).
2. Click the **api** box → **Variables** tab.
3. For each row below: click **+ New Variable** → type the **Name** exactly → paste the **Value** → **Add**.

   | Name | Value (from your password manager) | Saved in |
   | --- | --- | --- |
   | `DATABASE_URL` | Supabase `landednz-prod` **Session pooler** URL, with the DB password filled in (starts `postgresql://postgres.cauaowrnsivggivsopad:`, port `5432`) | §4b |
   | `SUPABASE_SECRET_KEY` | Supabase `landednz-prod` **Secret key** (starts `sb_secret_`). Not the Publishable key. | §4b |
   | `ANTHROPIC_API_KEY` | `landednz-prod-railway` key (starts `sk-ant-`) | §5 |
   | `OPENAI_API_KEY` | the same OpenAI key staging uses (starts `sk-`) | staging guide §4 |
   | `ADMIN_API_KEY` | `LandedNZ prod ADMIN_API_KEY` (64 letters and digits) | §7 |

4. Check the list: you should now see these 5 plus `SENTRY_DSN`, `SUPABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`, `AI_MODE`, `ANTHROPIC_MODEL`, `TRUST_PROXY`, `BETA_MODE`. If a name has a typo, click the **⋮** on that row → **Delete**, and add it again.
5. Railway shows a bar at the top: **Apply 5 changes** → click it → **Deploy**. The first deploy is safe: nothing points at it yet (the domain comes on release day). It may fail its health check until the agent fills the database in the next step; that is expected.

### 10b. Vercel: 2 variables

1. Open <https://vercel.com/lordmaduzs-projects/landednz/settings/environment-variables>.
2. For each row below: **Add Environment Variable** → **Key** → **Value** → **Environments**: tick **Production only** (untick Preview and Development) → set **Sensitive** as shown → **Save**.

   | Key | Value | Sensitive |
   | --- | --- | --- |
   | `SENTRY_AUTH_TOKEN` | the `vercel-sourcemaps` token (starts `sntrys_`, staging guide §5c) | **on** |
   | `NEXT_PUBLIC_POSTHOG_KEY` | PostHog `landednz-prod` **Project API key** (starts `phc_`, §6) | off (it is public by design) |

3. Ignore Vercel's "Redeploy" prompt. The next production deploy picks the values up.

### What the agent does after you send back

1. Fills the production database: tables, the knowledge base, search embeddings and the search index (`railway run` from `apps/api`).
2. Redeploys the API and checks `/health` returns 200.
3. Reports back with the API URL and the result.

**Send back:** "secrets done".

---

## After the checklist: the agent's part (C4 Steps 1–3)

1. **Security review** of what production will ship; findings fixed in a PR first.
2. **Railway**: create project `landednz-prod` and service from the repo, branch `production`, Singapore region, watch paths `apps/api/**` and `packages/types/**`. Service config lives in `.railway/railway.ts` (Railway's config-as-code format; the old `railway.json` stops working on 2026-12-01). Non-secret env is in that file (`NODE_ENV=production`, `AI_MODE=live`, `ANTHROPIC_MODEL=claude-sonnet-5-5`, `TRUST_PROXY=true`, `BETA_MODE=true`, `CORS_ORIGIN=https://landednz.co.nz,https://www.landednz.co.nz`, `SUPABASE_URL`); then a paste list for you with each secret and its Railway field.
3. **Database**: run the migrations on `landednz-prod`. The guide migration's vector-index rebuild needs more memory than the free plan's default (it failed on staging), so the agent runs it the same way it fixed staging, then seeds content and syncs embeddings.
4. **Vercel Production** env (paste list for you), domain `landednz.co.nz` + `www` added to the project, `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED=false`.
5. **DNS**: the exact Cloudflare records (all **DNS only**), then checks for HTTPS on all three names, recorded in `deploy-runbook.md`.
6. **Supabase URL Configuration** values for you (Site URL `https://landednz.co.nz`, redirect URLs).
7. GitHub variable `PROD_API_URL=https://api.landednz.co.nz`.

The release itself (Step 4, `scripts/release.sh 0`) still waits for PR #17 to merge and for your staging test (Plan B Task 11).

---

## Later: when to pay more (not now)

| Upgrade | Cost | Pay when |
| --- | --- | --- |
| **Vercel Pro** | US$20/mo | Vercel's Hobby plan is for **non-commercial** use only. LandedNZ takes no payments and shows no ads today, so Hobby fits. Upgrade **before** you charge users, run ads, or sell/promote it as a paid product (or the site is part of paid work). Vercel can stop Hobby projects without notice. |
| **Supabase Pro** | US$25/mo | When real users' data matters (daily backups kept 7 days, no pausing). Recommended once people rely on their saved roadmap. |
| **Railway limits** | — | Raise the US$10 hard limit only if the alert shows real traffic, not a bug. |
| **Anthropic limit** | — | Raise when monthly usage approaches US$20 with real users. |
| **Business email** | mail provider's plan | When you want `hello@landednz.co.nz`. Pick a provider (Zoho Mail, Google Workspace); the agent gives you its MX/SPF/DKIM records for Cloudflare. The domain itself costs nothing more. |
| **Portfolio subdomain** | free (DNS record) | When the portfolio is ready: `ruchira.landednz.co.nz` → its host. It moves with the LandedNZ domain if the product ever changes. |
| **LandedNZ trademark** | IPONZ fee per class | Before public launch: file "LandedNZ" at <https://www.iponz.govt.nz>, given the other "Landed" business. Check the current fee on the IPONZ site. |
| **Google brand verification** | free | After launch, once `landednz.co.nz` shows the home page and privacy page: shows the LandedNZ name/logo on the Google screen. Needs the domain verified in Google Search Console. |

Sources (checked 2026-10-31): [Railway pricing](https://docs.railway.com/pricing/plans), [Railway cost control](https://docs.railway.com/pricing/cost-control), [Cloudflare TLD policies](https://www.cloudflare.com/tld-policies), [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines), [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing), [Supabase pricing](https://supabase.com/pricing), [Google app audience](https://support.google.com/cloud/answer/15549945?hl=en), [Google brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification), [PostHog pricing](https://posthog.com/pricing).
