export function passwordPolicyIssues(password: string): string[] {
  const issues: string[] = []
  if (password.length < 12) issues.push('Use at least 12 characters.')
  if (password.length > 72 || Buffer.byteLength(password, 'utf8') > 72) {
    issues.push('Password must fit within 72 UTF-8 bytes.')
  }

  const characterClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]
  if (characterClasses.filter((pattern) => pattern.test(password)).length < 3) {
    issues.push('Use at least three of these: lowercase, uppercase, number, and symbol.')
  }
  return issues
}

export function assertStrongPassword(password: string): void {
  if (passwordPolicyIssues(password).length > 0) {
    throw new Error('Password does not meet the required strength policy.')
  }
}
