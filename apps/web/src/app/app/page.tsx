import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingProfile, type GetProfileResponse } from "@/lib/api";
import { SignOutButton } from "./sign-out-button";

export default function AppPage() {
  return (
    <main>
      <h1>Your roadmap</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=%2Fapp");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile: GetProfileResponse | null = null;
  try {
    profile = await getOnboardingProfile(session!.access_token);
  } catch (err) {
    if ((err as { status?: number }).status !== 404) throw err;
  }

  return (
    <>
      <p>Signed in as {user.email}</p>
      {profile ? (
        <p>
          Profile: {profile.visaType}, {profile.city}
        </p>
      ) : (
        <p>No profile yet</p>
      )}
      <SignOutButton />
    </>
  );
}
