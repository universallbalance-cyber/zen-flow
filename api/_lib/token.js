// Signs/verifies small entitlement tokens: base64url(payload) + "." + HMAC-SHA256 signature.
const crypto = require('crypto');

function getSecret() {
  const secret = process.env.ENTITLEMENT_SECRET;
  if (!secret) {
    throw new Error('ENTITLEMENT_SECRET is not configured');
  }
  return secret;
}

function sign(payloadBase64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadBase64).digest('base64url');
}

function signToken(payload) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadBase64}.${sign(payloadBase64)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return false;

  const expected = sign(payloadBase64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    return JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch {
    return false;
  }
}

module.exports = { signToken, verifyToken };
