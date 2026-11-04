import { jwtVerify } from 'jose'
import { Prisma } from '../../generated/prisma/client.js'
import { db } from '../../shared/db.js'
import { JWKS } from '../../shared/jwks.js'
import { logger } from '../../shared/logger.js'
import { AppError } from '../../shared/errors.js'

interface AuthVerifyResult {
  userId: string
  email: string
  isNewUser: boolean
  hasProfile: boolean
}

export async function verifyAndUpsertUser(token: string): Promise<AuthVerifyResult> {
  let payload: any // any: jose jwtVerify returns JWTPayload which needs extension access for email/sub

  try {
    // Verify JWT using ES256 JWKS (not HS256 secret)
    const { payload: verifiedPayload } = await jwtVerify(token, JWKS)
    payload = verifiedPayload
  } catch (err) {
    // All JWT verification errors → INVALID_TOKEN
    logger.warn({ err }, 'JWT verification failed')
    throw new AppError('INVALID_TOKEN', 'Invalid or expired JWT token', 401)
  }

  // Extract required claims
  const userId = payload.sub as string
  const email = payload.email as string

  if (!userId || !email) {
    throw new AppError('INVALID_TOKEN', 'JWT missing required claims (sub, email)', 401)
  }

  // The two do not depend on each other; together they cost one database round trip, not two
  const [isNewUser, profileCount] = await Promise.all([createUser(userId, email), db.userProfile.count({ where: { userId } })])
  const hasProfile = profileCount > 0

  return {
    userId,
    email,
    isNewUser,
    hasProfile,
  }
}
// Creates the user; false when it already exists (Prisma P2002)
async function createUser(userId: string, email: string): Promise<boolean> {
  try {
    await db.user.create({ data: { id: userId, email } })
    logger.info({ userId, email }, 'New user created from JWT')
    return true
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      logger.debug({ userId }, 'User already exists')
      return false
    }
    logger.error({ err, userId }, 'User creation failed')
    throw err
  }
}
