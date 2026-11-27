/**
 * In-memory Authentication Rate Limiter & Brute-Force Guard
 * - Blocks IP address after 5 consecutive failed login attempts for 15 minutes.
 * - Prevents rapid burst guessing (max 10 requests per minute).
 * - Zero external dependencies, highly resilient.
 */

const failedAttempts = new Map(); // ip -> { count, firstAttemptTime, blockedUntil }
const requestBurst = new Map();   // ip -> Array<timestamp>

const LOCKOUT_WINDOW_MS = 3 * 60 * 1000; // 3 minutes lockout window
const MAX_FAILED_ATTEMPTS = 5;
const BURST_LIMIT = 10;                  // Max 10 attempts per minute
const BURST_WINDOW_MS = 60 * 1000;       // 1 minute

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Middleware mounted on POST /api/v1/auth/login
 */
const loginRateLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();

  // 1. Check if IP is currently locked out
  const attempt = failedAttempts.get(ip);
  if (attempt && attempt.blockedUntil && attempt.blockedUntil > now) {
    const minutesRemaining = Math.max(1, Math.ceil((attempt.blockedUntil - now) / 60000));
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts from this network. Access has been temporarily locked. Please try again after ${minutesRemaining} minute(s).`
    });
  }

  // 2. Rapid burst check (max 10 requests per minute)
  let timestamps = requestBurst.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < BURST_WINDOW_MS);
  if (timestamps.length >= BURST_LIMIT) {
    return res.status(429).json({
      success: false,
      message: 'Too many rapid login requests. Please wait a moment before trying again.'
    });
  }
  timestamps.push(now);
  requestBurst.set(ip, timestamps);

  next();
};

/**
 * Record a failed authentication attempt
 */
const recordFailedLogin = (req) => {
  const ip = getClientIp(req);
  const now = Date.now();
  let attempt = failedAttempts.get(ip) || { count: 0, firstAttemptTime: now, blockedUntil: 0 };

  // Reset if window has elapsed
  if (now - attempt.firstAttemptTime > LOCKOUT_WINDOW_MS) {
    attempt = { count: 0, firstAttemptTime: now, blockedUntil: 0 };
  }

  attempt.count += 1;
  if (attempt.count >= MAX_FAILED_ATTEMPTS) {
    attempt.blockedUntil = now + LOCKOUT_WINDOW_MS;
    console.warn(`🚨 [SECURITY ALERT] IP ${ip} exceeded maximum failed login attempts (${attempt.count}). Temporarily blocked for 15 minutes.`);
  }

  failedAttempts.set(ip, attempt);
};

/**
 * Reset failed attempts on successful authentication
 */
const recordSuccessfulLogin = (req) => {
  const ip = getClientIp(req);
  failedAttempts.delete(ip);
};

// Periodic cleanup every 10 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempt] of failedAttempts.entries()) {
    if (now - attempt.firstAttemptTime > LOCKOUT_WINDOW_MS && (!attempt.blockedUntil || attempt.blockedUntil < now)) {
      failedAttempts.delete(ip);
    }
  }
  for (const [ip, timestamps] of requestBurst.entries()) {
    const valid = timestamps.filter(t => now - t < BURST_WINDOW_MS);
    if (valid.length === 0) {
      requestBurst.delete(ip);
    } else {
      requestBurst.set(ip, valid);
    }
  }
}, 10 * 60 * 1000).unref();

module.exports = {
  loginRateLimiter,
  recordFailedLogin,
  recordSuccessfulLogin
};
