# Staging setup: owner guide

Click-by-click steps for the accounts and keys **staging** needs. Production comes later and repeats most of this with `prod` names.

Rules for every step:

- Paste keys only into the platform fields named below, or into your password manager. Never into chat, git or a screenshot.
- Dashboards change their menus now and then. If a label below has moved, look for the same words in the settings menu.

## What staging is made of

```
Browser ──> Vercel (web, Preview)  ──> Render (API, free, Singapore) ──> Supabase landednz-staging (Sydney)
                                         │
                                         ├─> Anthropic (chat answers, landednz-staging key)
                                         ├─> OpenAI   (embeddings for search)
                                         └─> Sentry   (error reports)
```

Not needed for staging: **Railway** (production API only), the **domain** (staging uses the free `*.vercel.app` and `*.onrender.com` addresses) and **PostHog** (keeps test traffic out of real analytics; analytics stays off when its key is empty).

## Checklist

- [x] Supabase `landednz-staging` in Sydney
- [x] GitHub: `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`, `STAGING_SUPABASE_SECRET_KEY`
- [x] 1. Render account, GitHub connected
- [x] 2. Google sign-in for staging (own Google Cloud project `landednz-staging`)
- [x] 3. Anthropic workspace `landednz-staging` with a key and spend limit
- [x] 4. OpenAI key has a spend limit
- [x] 5. Sentry: account + plugin, projects `landednz-web` + `landednz-api` and DSNs, auth token `vercel-sourcemaps`
- [x] 6. Vercel Branch Tracking = `production` (already done, by your account)

When all boxes are ticked, tell the agent. It creates the Render service and the Vercel Preview settings in Task C3, and at that point tells you which values to paste into which dashboard field.

---

## 1. Render (staging API host)

**What it is:** a hosting service that runs our API from the `Dockerfile` in the repo. The free plan costs nothing; the trade-off is that the API sleeps after 15 minutes without traffic and takes about a minute to wake. That is fine for staging and is why production uses Railway instead. `render.yaml` in the repo already describes the service, so you only create the account.

1. Go to <https://render.com> → **Get Started** → **Sign up with GitHub** (use the account that owns the `landednz` repo).
2. Approve the GitHub authorisation screen.
3. Signing up does not ask about repositories. Render asks only when it first needs a repo, so give it access from GitHub directly:
   - Open <https://github.com/apps/render/installations/new> → pick the account that owns the repo.
   - Choose **Only select repositories** → pick the LandedNZ repo → **Install** (or **Save** if Render is already installed).
4. Do **not** create a service yet, and you do not need a payment card. Ignore the "Create a new …" page with the service tiles. The agent creates the service from `render.yaml` in C3 (Render calls this a **Blueprint**).

Done when: <https://github.com/settings/installations> lists **Render** with access to the LandedNZ repo.

---

## 2. Google sign-in for staging

**What it is:** "Sign in with Google" works because Google knows our app as an **OAuth client**, which has a Client ID and a Client Secret. Google only sends users back to addresses listed on that client. Staging gets its own Google Cloud project and client. That keeps it apart from the local-dev project (`landednz-dev`, see `docs/setup/google-oauth.md`), so a staging change can't break local sign-in. You can delete or rotate one without touching the other.

### 2a. Create the project

1. Open <https://console.cloud.google.com/>.
2. Top bar: open the **project selector** (it shows the current project name) → **New Project**.
3. **Project name:** `landednz-staging`. **Organization / Location:** leave **No organization**. → **Create**.
4. When the notification says it is ready, click **Select Project**. Check that the top bar now shows `landednz-staging`. The next steps all apply to whichever project is shown there.

### 2b. Set up the consent screen (Google Auth Platform)

1. Left menu (☰) → **APIs & Services** → **OAuth consent screen**. On a new project this opens **Google Auth Platform** with a **Get started** button. Click it.
2. **App Information:**
   - **App name:** `LandedNZ Staging`
   - **User support email:** your email → **Next**
3. **Audience:** **External** → **Next**.
4. **Contact Information:** your email → **Next**.
5. Tick the agreement → **Continue** → **Create**.
6. Left menu → **Branding**:
   - Scroll to **Authorized domains** → **Add domain** → `caksnoejabxbakjijyjz.supabase.co`
   - **Save**. If Google refuses that domain, skip this step: apps in Testing do not need it, and the agent will handle it in C3.
7. Left menu → **Audience**:
   - **Publishing status** must say **Testing**. Leave it like that; only production gets published.
   - **Test users** → **Add users** → your Google email and any testers' emails → **Save**.
   - While in Testing, only these emails can sign in to staging.
8. Left menu → **Data Access** → **Add or remove scopes**:
   - Tick `.../auth/userinfo.email`, `.../auth/userinfo.profile` and `openid`.
   - **Update** → **Save**.
   - These three need no Google review.

### 2c. Create the OAuth client

1. Left menu → **Clients** → **Create client**. On older screens: **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
2. **Application type:** **Web application**.
3. **Name:** `LandedNZ Staging`.
4. **Authorized JavaScript origins:** leave empty.
5. **Authorized redirect URIs** → **Add URI** → paste exactly:

   ```
   https://caksnoejabxbakjijyjz.supabase.co/auth/v1/callback
   ```

6. **Create**.
7. A dialog shows the **Client ID** (ends `.apps.googleusercontent.com`) and the **Client Secret**. Copy both into your password manager now. Google may not show the secret again; if it is lost, open the client → **Add secret**.

Google says new settings can take a few minutes, sometimes hours, to apply.

### 2d. Turn on Google in Supabase staging

1. Open <https://supabase.com/dashboard/project/caksnoejabxbakjijyjz/auth/providers>. By hand: project **landednz-staging** → left sidebar **Authentication** → **Sign In / Providers**.
2. Click **Google** in the provider list.
3. Switch **Enable Sign in with Google** on.
4. Paste the **Client ID** into **Client IDs** and the **Client Secret** into **Client Secret (for OAuth)**.
5. Turn **Skip nonce checks** on, to match the local setup (`skip_nonce_check = true`).
6. Click **Save**.

The **URL Configuration** page (Site URL and Redirect URLs) needs the staging web address. That address exists only after C3, and the agent gives you the exact values then.

---

## 3. Anthropic workspace (chat answers)

**What it is:** the Anthropic Console groups API keys into **workspaces**. Each workspace has its own keys, its own monthly spend limit and its own usage graph. Separate staging and production workspaces mean a runaway staging test can never spend production's budget, and you can see exactly what each environment costs.

1. Open <https://console.anthropic.com> and sign in. (It may redirect to `platform.claude.com`; that is the same console.)
2. Make sure billing is set up: **Settings** → **Billing**. API usage needs credit or a card. This is separate from a Claude.ai subscription.
3. **Settings** → **Workspaces** → **Create Workspace** → name `landednz-staging` → **Create**.
4. Open the new workspace → **Limits** → set a **monthly spend limit** of **US$20** → **Save**.
5. **Settings** → **API Keys** → **Create Key**:
   - **Workspace:** `landednz-staging`
   - **Name:** `landednz-staging-render`
   - **Create**, then copy the key (starts `sk-ant-`) straight into your password manager. It is shown only once.

Staging uses model `claude-sonnet-5-5`; the agent sets that in `render.yaml`, so there is nothing to choose here.

---

## 4. OpenAI (search embeddings)

**What it is:** the API turns questions and knowledge-base text into embeddings (number lists) through OpenAI, so search can find the right content. Your existing key is fine for staging.

1. Open <https://platform.openai.com/settings/organization/limits> (or **Settings** → **Limits**).
2. Set a monthly **budget** of **US$10** and save. Embeddings cost very little, so this only guards against a bug.
3. Keep the existing key in your password manager; Render gets it in C3.

---

## 5. Sentry (error reports)

**What it is:** when the web app or API throws an error, Sentry records it with the stack trace and the release, and can email you. Without it, staging errors only appear in Render's logs. The code already includes Sentry and turns it on only when a **DSN** (the project's address) is set. The free **Developer** plan is enough.

Staging and production share the same two projects. The agent tags each event with its environment so you can filter them.

### 5a. Account and agent access (done)

- Sentry account and organization exist.
- The Sentry plugin for Claude Code is installed with `npx @sentry/agent-plugin install`. It gives the agent the Sentry MCP server. The first time the agent uses it, a browser window asks you to log in to Sentry and approve access. Approve it for the `landednz` organization.

### 5b. Projects and DSNs (the agent does this)

Using the Sentry MCP server, the agent:

1. Creates project `landednz-web` (platform Next.js) and project `landednz-api` (platform Node.js).
2. Reads each project's DSN. A DSN is not a secret: the web one ships to every browser.
3. Does **not** run Sentry's setup wizard or "instrument" skill. The code already has Sentry (`apps/api/src/instrument.ts`, the web Sentry config), so re-instrumenting would duplicate it.

### 5c. Auth token (you do this)

The web build uploads source maps so errors show our real code lines. That needs a token, and tokens are secrets, so you create it:

1. Sentry → **Settings** → **Developer Settings** → **Organization Tokens** (or **Settings** → **Auth Tokens**) → **Create New Token**.
2. Name: `vercel-sourcemaps` → **Create**.
3. Copy the token (starts `sntrys_`) to your password manager. It is shown only once. You paste it into Vercel in C3.

---

## 6. Vercel (already done)

Settings → **Environments** → **Production** → **Branch Tracking** = `production`. With that set, pushes to `main` build **Preview** deployments, and Preview is our staging web app. Nothing else to do now; C3 sets the Preview environment variables.

---

## After the checklist

Tell the agent "staging checklist done". It then:

1. Verifies what it can from the CLIs (`render`, `vercel`, `supabase`, `gh`).
2. Creates the Render service, gets its URL, and lists the values to paste in each dashboard (Render env vars, Vercel Preview env vars, Supabase URL Configuration).
3. Sets `STAGING_API_URL` and `STAGING_WEB_URL` in GitHub, runs the staging workflow and checks sign-in end to end.

## Later, for production (not now)

| Item | Production step |
| --- | --- |
| Railway | Hobby plan, about US$5/month. Always on, no cold starts. |
| Domain | `landednz.co.nz` for the production site and `api.landednz.co.nz` for the API. |
| Supabase | `landednz-prod` exists already; its values go into Railway and Vercel Production. |
| Google | Repeat section 2 as Google Cloud project `landednz-prod` with callback `https://cauaowrnsivggivsopad.supabase.co/auth/v1/callback`, enable Google in Supabase `landednz-prod`, and publish the consent screen so anyone can sign in. |
| Anthropic | Workspace `landednz-prod`, US$50 limit, its own key. |
| PostHog | Create the account and project; page views are checked in the production smoke test. |
