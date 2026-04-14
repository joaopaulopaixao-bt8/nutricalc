const crypto = require("crypto");

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_DURATION_MS = 1000 * 60 * 30;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, expectedHash] = storedHash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(derivedKey, "hex"),
    Buffer.from(expectedHash, "hex"),
  );
}

function generateOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildSessionToken() {
  const token = generateOpaqueToken();
  return {
    rawToken: token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

function buildPasswordResetToken() {
  const token = generateOpaqueToken();
  return {
    rawToken: token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_DURATION_MS),
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    googleLinked: Boolean(user.googleId),
    avatarUrl: user.avatarUrl,
    sex: user.sex,
    birthDate: user.birthDate,
    weight: user.weight,
    height: user.height,
    age: user.age,
    bodyFatPercentage: user.bodyFatPercentage,
    lastLoginAt: user.lastLoginAt,
    lastAccessAt: user.lastAccessAt,
    lastAccessIp: user.lastAccessIp,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function verifyGoogleIdToken(idToken) {
  if (!idToken) {
    throw new Error("Google credential ausente.");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || "Nao foi possivel validar o login Google.");
  }

  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (expectedClientId && data.aud !== expectedClientId) {
    throw new Error("Token Google invalido para esta aplicacao.");
  }

  if (!data.email_verified) {
    throw new Error("A conta Google precisa ter email verificado.");
  }

  return {
    googleId: data.sub,
    email: data.email,
    name: data.name || data.given_name || data.email,
    avatarUrl: data.picture || null,
  };
}

module.exports = {
  buildPasswordResetToken,
  buildSessionToken,
  sanitizeUser,
  verifyGoogleIdToken,
  hashPassword,
  hashToken,
  verifyPassword,
};
