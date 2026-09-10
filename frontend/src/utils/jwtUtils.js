/**
 * JWT Utilities
 * Lightweight helpers for decoding and inspecting JWT tokens
 * without an external dependency (pure base64 approach).
 */

/**
 * Decode the payload of a JWT token.
 * @param {string} token - The raw JWT string (three base64url parts separated by dots)
 * @returns {object|null} Parsed payload object, or null if invalid.
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Pad to multiple of 4
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
    const decoded = atob(padded)
    // Convert binary string to UTF-8
    const jsonString = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonString)
  } catch (err) {
    console.warn('[jwtUtils] Failed to decode token:', err)
    return null
  }
}

/**
 * Check whether a JWT token has expired.
 * @param {string} token - The raw JWT string.
 * @returns {boolean} true if expired or invalid, false if still valid.
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload || typeof payload.exp !== 'number') return true
  // exp is in seconds; Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000
}

/**
 * Extract the subject (email / username) from the JWT payload.
 * Spring Security typically places the username in the `sub` claim.
 * @param {string} token - The raw JWT string.
 * @returns {string|null} The `sub` claim value, or null.
 */
export function getEmailFromToken(token) {
  const payload = decodeToken(token)
  if (!payload) return null
  return payload.sub ?? payload.email ?? null
}

/**
 * Extract the role from the JWT payload (if present).
 * The backend may include roles in different claim names.
 * @param {string} token - The raw JWT string.
 * @returns {string|null}
 */
export function getRoleFromToken(token) {
  const payload = decodeToken(token)
  if (!payload) return null
  // Try common claim keys used by Spring Security / custom JWTs
  return (
    payload.role ??
    payload.roles?.[0] ??
    payload.authorities?.[0] ??
    null
  )
}
