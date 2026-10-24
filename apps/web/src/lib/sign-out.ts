import { createClient } from './supabase/client'

// Signs out and goes to the landing page with a full reload on purpose: drops every in-memory store of the signed-out user
export async function signOutAndLeave() {
  await createClient().auth.signOut()
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign('/')
}
