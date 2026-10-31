// The account button's name, initials and photo: Google's full name and picture, else the email
export function userBadge(user: { email?: string; user_metadata?: { full_name?: string; name?: string; avatar_url?: string; picture?: string } }) {
  const email = user.email ?? ''
  const avatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? '').trim()
  if (fullName) {
    const words = fullName.split(/\s+/)
    const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
    return { name: fullName, initials, email, avatar }
  }
  return { name: email, initials: (email[0] ?? '?').toUpperCase(), email, avatar }
}
