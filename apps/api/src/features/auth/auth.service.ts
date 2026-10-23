import { createRemoteJWKSet, jwtVerify } from 'jose'
import { Prisma } from '../../generated/prisma/client.js'
import { config } from '../../shared/config.js'
import { db } from '../../shared/db.js'
import { logger } from '../../shared/logger.js'
import { AppError } from '../../shared/errors.js'

interface AuthVerifyResult {
  userId: string
  email: string
  isNewUser: boolean
  hasProfile: boolean
}

// JWKS endpoint for JWT verification
const JWKS = createRemoteJWKSet(new URL(`${config.supabaseUrl}/auth/v1/.well-known/jwks.json`))

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

  // Attempt to create user — if exists, catch Prisma P2002
  let isNewUser = false
  try {
    await db.user.create({
      data: {
        id: userId,
        email: email,
      },
    })
    isNewUser = true
    logger.info({ userId, email }, 'New user created from JWT')
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // Unique constraint violation — user already exists
      isNewUser = false
      logger.debug({ userId }, 'User already exists')
    } else {
      // Unexpected DB error
      logger.error({ err, userId }, 'User creation failed')
      throw err
    }
  }

  // Check if user has profile
  const profileCount = await db.userProfile.count({
    where: { userId },
  })
  const hasProfile = profileCount > 0

  return {
    userId,
    email,
    isNewUser,
    hasProfile,
  }
}