# Google OAuth Setup for LandedNZ

**Required for:** AC-1-06 Google OAuth end-to-end flow
**Purpose:** Configure Google Cloud Console and Supabase for local OAuth development

---

## Prerequisites

- Node.js 22 LTS (check with `node --version`)
- Google account
- Supabase running locally (`supabase start`)
- Project cloned and `.env.local` configured

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Create Project"** or use the project selector dropdown
4. Enter project name: `landednz-dev` (or any name you prefer)
5. Click **"Create"**

## Step 2: Enable Required APIs

1. In your new project, go to **APIs & Services > Library**
2. Search for **"Google+ API"** → Click and press **"Enable"**
3. Search for **"People API"** → Click and press **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Fill in required fields:
   - **App name**: `LandedNZ`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **"Save and Continue"**
5. Skip scopes (click **"Save and Continue"**)
6. Skip test users (click **"Save and Continue"**)

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Set **Name**: `LandedNZ Local Dev`
5. **Authorized redirect URIs** — click **"Add URI"** and enter:
   ```
   http://127.0.0.1:54321/auth/v1/callback
   ```
   ⚠️ **This exact URL is critical** — it's your local Supabase Auth endpoint
6. Click **"Create"**

## Step 5: Save Your Credentials

After creation, you'll see a popup with:
- **Client ID**: `something.apps.googleusercontent.com`
- **Client Secret**: `random-string`

**Copy these values** — you'll need them for the next step.

---

## Step 6: Configure Supabase

The Supabase config has already been updated with the Google provider block. You need to:

1. **Edit `supabase/config.toml`:**
   - Find: `client_id = "YOUR_GOOGLE_CLIENT_ID_HERE"`
   - Replace with your actual Client ID from Step 5

2. **Edit `supabase/.env`:**
   - Find: `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE`
   - Replace with your actual Client Secret from Step 5

3. **Restart Supabase:**
   ```bash
   supabase stop
   supabase start
   ```

## Step 7: Verify Setup

Run `supabase status` and confirm:
- ✅ All services show as "Started"
- ✅ Project URL: `http://127.0.0.1:54321`
- ✅ Authentication Keys section shows publishable/secret keys

Your environment variables should be in `.env.local`:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/landednz
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_...
```

---

## Troubleshooting

**Google OAuth errors:**
- Verify redirect URI exactly matches: `http://127.0.0.1:54321/auth/v1/callback`
- Check that Google+ API and People API are both enabled
- Confirm `skip_nonce_check = true` in `supabase/config.toml` Google section

**Supabase errors:**
- Ensure `supabase stop && supabase start` after config changes
- Verify `.env` file is in `supabase/.env`, not root `.env`
- Check that `client_id` in config.toml matches exactly from Google

**Environment variable errors:**
- Confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are in `.env.local` (not `.env`)
- Use the "Publishable" key from `supabase status`, never the "Secret" key for mobile

---

## Security Notes

- ✅ **Client ID**: Safe to commit in `config.toml` — it's public
- ⚠️ **Client Secret**: Never commit — always use `env(...)` substitution
- ✅ **Publishable Key**: Safe for mobile apps — designed for client-side use
- ❌ **Secret Key**: Never use in mobile — server-side only

---

This setup is complete when you can run `supabase status` without errors and see the Google provider in Supabase Studio at `http://127.0.0.1:54323`.