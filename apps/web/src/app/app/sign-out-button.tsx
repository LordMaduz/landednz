"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/signin");
  }

  return (
    <button type="button" onClick={signOut}>
      Sign out
    </button>
  );
}
