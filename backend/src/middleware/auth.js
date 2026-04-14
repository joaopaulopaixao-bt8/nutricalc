const prisma = require("../lib/prisma");
const { hashToken, sanitizeUser } = require("../services/authService");
const ACCESS_AUDIT_WINDOW_MS = 1000 * 60 * 15;
const AUTH_COOKIE_NAME = "nutricalc_session";

function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

function getCookieValue(req, name) {
  const cookieHeader = req.headers.cookie || "";
  if (!cookieHeader) return "";

  const cookies = cookieHeader.split(";");
  for (const rawCookie of cookies) {
    const [rawName, ...rest] = rawCookie.split("=");
    if (!rawName || rest.length === 0) continue;
    if (rawName.trim() !== name) continue;
    return decodeURIComponent(rest.join("=").trim());
  }

  return "";
}

async function attachAuthUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [, bearerToken] = authHeader.match(/^Bearer\s+(.+)$/i) || [];
    const rawToken = bearerToken || getCookieValue(req, AUTH_COOKIE_NAME);

    if (!rawToken) {
      req.authUser = null;
      req.authSession = null;
      return next();
    }

    const session = await prisma.authSession.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      req.authUser = null;
      req.authSession = null;
      return next();
    }

    const requestIp = getRequestIp(req);
    const shouldRefreshAudit =
      !session.lastSeenAt || Date.now() - new Date(session.lastSeenAt).getTime() > ACCESS_AUDIT_WINDOW_MS;

    if (shouldRefreshAudit) {
      prisma.authSession.update({
        where: { id: session.id },
        data: {
          lastSeenAt: new Date(),
          lastSeenIp: requestIp,
        },
      }).catch(() => {});

      prisma.user.update({
        where: { id: session.user.id },
        data: {
          lastAccessAt: new Date(),
          lastAccessIp: requestIp,
        },
      }).catch(() => {});
      session.user.lastAccessAt = new Date();
      session.user.lastAccessIp = requestIp;
    }

    req.authSession = session;
    req.authUser = sanitizeUser(session.user);
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({ error: "Autenticacao obrigatoria." });
  }
  return next();
}

module.exports = {
  AUTH_COOKIE_NAME,
  attachAuthUser,
  requireAuth,
};
