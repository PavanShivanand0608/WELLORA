import bcrypt from 'bcryptjs'
import { AppError } from '../utils/AppError.js'
import { passwordPolicyIssues } from '../utils/passwordPolicy.js'

const bcryptCost = 12

export async function hashPassword(password: string): Promise<string> {
  const issues = passwordPolicyIssues(password)
  if (issues.length) {
    throw new AppError(400, 'INVALID_PASSWORD', issues.join(' '))
  }
  return bcrypt.hash(password, bcryptCost)
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}
