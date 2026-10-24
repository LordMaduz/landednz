// The account button's name and initials: Google's full name, else the email
export function userBadge(user: { email?: string; user_metadata?: { full_name?: string; name?: string } }) {
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? '').trim()
  if (fullName) {
    const words = fullName.split(/\s+/)
    const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
    return { name: fullName, initials }
  }
  const email = user.email ?? ''
  return { name: email, initials: (email[0] ?? '?').toUpperCase() }
}
