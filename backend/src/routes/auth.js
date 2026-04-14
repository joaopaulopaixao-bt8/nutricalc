const express = require("express");
const prisma = require("../lib/prisma");
const {
  buildPasswordResetToken,
  buildSessionToken,
  sanitizeUser,
  verifyGoogleIdToken,
  hashPassword,
  verifyPassword,
  hashToken,
} = require("../services/authService");
const { requireAuth } = require("../middleware/auth");
const { removeAvatarByUrl, saveAvatarFromDataUrl } = require("../services/avatarService");
const { calculateNavyBodyFat } = require("../services/bodyFatService");

const router = express.Router();

function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

async function createSession(userId, provider = "password", requestIp = null) {
  const sessionToken = buildSessionToken();
  const now = new Date();
  await prisma.authSession.create({
    data: {
      userId,
      tokenHash: sessionToken.tokenHash,
      provider,
      lastSeenAt: now,
      lastSeenIp: requestIp,
      expiresAt: sessionToken.expiresAt,
    },
  });
  return sessionToken;
}

async function syncUserBodyMetrics(userId) {
  const latestMetric = await prisma.bodyMetricEntry.findFirst({
    where: { userId },
    orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      weight: latestMetric?.weight ?? null,
      height: latestMetric?.height ?? null,
      age: latestMetric?.age ?? null,
      bodyFatPercentage: latestMetric?.bodyFatPercentage ?? null,
    },
  });
}

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
  return res.json({ user: sanitizeUser(user) });
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, email, sex, birthDate, avatarDataUrl, removeAvatar } = req.body;
    const currentUser = await prisma.user.findUnique({ where: { id: req.authUser.id } });
    if (!currentUser) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    const data = {};

    if (typeof name === "string") {
      const normalizedName = name.trim();
      if (!normalizedName) {
        return res.status(400).json({ error: "Informe um nome valido." });
      }
      data.name = normalizedName;
    }

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return res.status(400).json({ error: "Informe um email valido." });
      }
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id: req.authUser.id },
        },
      });
      if (existingEmail) {
        return res.status(409).json({ error: "Esse email ja esta em uso." });
      }
      data.email = normalizedEmail;
    }

    if (typeof sex === "string") {
      const normalizedSex = sex.trim().toUpperCase();
      if (normalizedSex && !["M", "F"].includes(normalizedSex)) {
        return res.status(400).json({ error: "Sexo invalido. Use M ou F." });
      }
      data.sex = normalizedSex || null;
    }

    if (birthDate !== undefined) {
      if (!birthDate) {
        data.birthDate = null;
      } else {
        const parsedBirthDate = new Date(birthDate);
        if (Number.isNaN(parsedBirthDate.getTime())) {
          return res.status(400).json({ error: "Data de nascimento invalida." });
        }
        data.birthDate = parsedBirthDate;
      }
    }

    if (removeAvatar) {
      removeAvatarByUrl(currentUser.avatarUrl);
      data.avatarUrl = null;
    }

    if (avatarDataUrl) {
      const savedAvatarUrl = saveAvatarFromDataUrl(avatarDataUrl, req.authUser.id);
      if (currentUser.avatarUrl) {
        removeAvatarByUrl(currentUser.avatarUrl);
      }
      data.avatarUrl = savedAvatarUrl;
    }

    const user = await prisma.user.update({
      where: { id: req.authUser.id },
      data,
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/me/body-metrics", requireAuth, async (req, res) => {
  try {
    const days = Number(req.query.days) || 0;
    const metrics = await prisma.bodyMetricEntry.findMany({
      where: {
        userId: req.authUser.id,
        ...(days > 0
          ? {
              recordedAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      orderBy: { recordedAt: "desc" },
      take: days > 0 ? 120 : 60,
    });
    return res.json({ metrics });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/me/body-metrics", requireAuth, async (req, res) => {
  try {
    const { weight, height, age, bodyFatPercentage, recordedAt, notes, source } = req.body;

    const parsedWeight = weight === "" || weight === undefined || weight === null ? null : Number(weight);
    const parsedHeight = height === "" || height === undefined || height === null ? null : Number(height);
    const parsedAge = age === "" || age === undefined || age === null ? null : Number(age);
    const parsedBodyFat =
      bodyFatPercentage === "" || bodyFatPercentage === undefined || bodyFatPercentage === null
        ? null
        : Number(bodyFatPercentage);

    if ([parsedWeight, parsedHeight, parsedAge, parsedBodyFat].some((value) => value !== null && Number.isNaN(value))) {
      return res.status(400).json({ error: "Os dados corporais precisam ser numéricos." });
    }

    if (parsedWeight === null && parsedHeight === null && parsedAge === null && parsedBodyFat === null) {
      return res.status(400).json({ error: "Informe pelo menos uma medida corporal." });
    }

    const metricEntry = await prisma.bodyMetricEntry.create({
      data: {
        userId: req.authUser.id,
        weight: parsedWeight,
        height: parsedHeight,
        age: parsedAge,
        bodyFatPercentage: parsedBodyFat,
        source: source || "manual",
        notes: notes ? String(notes).trim() : null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });

    const updatedUser = await syncUserBodyMetrics(req.authUser.id);

    return res.status(201).json({
      metric: metricEntry,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch("/me/body-metrics/:id", requireAuth, async (req, res) => {
  try {
    const metric = await prisma.bodyMetricEntry.findUnique({
      where: { id: req.params.id },
    });

    if (!metric) {
      return res.status(404).json({ error: "Registro corporal nao encontrado." });
    }
    if (metric.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Voce nao pode editar esse registro corporal." });
    }

    const { weight, height, age, bodyFatPercentage, recordedAt, notes, source } = req.body;

    const parsedWeight = weight === "" || weight === undefined || weight === null ? null : Number(weight);
    const parsedHeight = height === "" || height === undefined || height === null ? null : Number(height);
    const parsedAge = age === "" || age === undefined || age === null ? null : Number(age);
    const parsedBodyFat =
      bodyFatPercentage === "" || bodyFatPercentage === undefined || bodyFatPercentage === null
        ? null
        : Number(bodyFatPercentage);

    if ([parsedWeight, parsedHeight, parsedAge, parsedBodyFat].some((value) => value !== null && Number.isNaN(value))) {
      return res.status(400).json({ error: "Os dados corporais precisam ser numéricos." });
    }

    if (parsedWeight === null && parsedHeight === null && parsedAge === null && parsedBodyFat === null) {
      return res.status(400).json({ error: "Informe pelo menos uma medida corporal." });
    }

    const updatedMetric = await prisma.bodyMetricEntry.update({
      where: { id: metric.id },
      data: {
        weight: parsedWeight,
        height: parsedHeight,
        age: parsedAge,
        bodyFatPercentage: parsedBodyFat,
        recordedAt: recordedAt ? new Date(recordedAt) : metric.recordedAt,
        notes: notes !== undefined ? (notes ? String(notes).trim() : null) : metric.notes,
        source: source || metric.source,
      },
    });

    const updatedUser = await syncUserBodyMetrics(req.authUser.id);

    return res.json({
      metric: updatedMetric,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete("/me/body-metrics/:id", requireAuth, async (req, res) => {
  try {
    const metric = await prisma.bodyMetricEntry.findUnique({
      where: { id: req.params.id },
    });

    if (!metric) {
      return res.status(404).json({ error: "Registro corporal nao encontrado." });
    }
    if (metric.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Voce nao pode excluir esse registro corporal." });
    }

    await prisma.bodyMetricEntry.delete({
      where: { id: metric.id },
    });

    const updatedUser = await syncUserBodyMetrics(req.authUser.id);

    return res.json({
      ok: true,
      deletedId: metric.id,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/me/body-fat/navy", requireAuth, async (req, res) => {
  try {
    const result = calculateNavyBodyFat(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/me/diets", requireAuth, async (req, res) => {
  try {
    const { objective, numMeals, targetKcalMax, days } = req.query;
    const parsedMeals = Number(numMeals) || null;
    const parsedTargetKcalMax = Number(targetKcalMax) || null;
    const parsedDays = Number(days) || 0;

    const diets = await prisma.diet.findMany({
      where: {
        userId: req.authUser.id,
        ...(objective && objective !== "all" ? { objective } : {}),
        ...(parsedMeals ? { numMeals: parsedMeals } : {}),
        ...(parsedTargetKcalMax ? { targetKcal: { lte: parsedTargetKcalMax } } : {}),
        ...(parsedDays > 0
          ? {
              createdAt: {
                gte: new Date(Date.now() - parsedDays * 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        objective: true,
        objectivePct: true,
        targetKcal: true,
        numMeals: true,
        createdAt: true,
        snapshotWeight: true,
        snapshotHeight: true,
        snapshotAge: true,
        snapshotBodyFatPercentage: true,
      },
    });

    return res.json({ diets });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/me/diets/:id", requireAuth, async (req, res) => {
  try {
    const diet = await prisma.diet.findUnique({
      where: { id: req.params.id },
      select: { id: true, userId: true },
    });

    if (!diet) {
      return res.status(404).json({ error: "Dieta nao encontrada." });
    }
    if (diet.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Voce nao pode excluir essa dieta." });
    }

    await prisma.report.deleteMany({
      where: {
        userId: req.authUser.id,
        dietId: diet.id,
      },
    });

    await prisma.diet.delete({
      where: { id: diet.id },
    });

    return res.json({ ok: true, deletedId: diet.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/me/reports", requireAuth, async (req, res) => {
  try {
    const { objective, days } = req.query;
    const parsedDays = Number(days) || 0;

    const reports = await prisma.report.findMany({
      where: {
        userId: req.authUser.id,
        ...(objective && objective !== "all" ? { objective } : {}),
        ...(parsedDays > 0
          ? {
              createdAt: {
                gte: new Date(Date.now() - parsedDays * 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        dietId: true,
        title: true,
        reportType: true,
        objective: true,
        createdAt: true,
      },
    });

    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/me/reports/:id", requireAuth, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
    });
    if (!report) {
      return res.status(404).json({ error: "Relatorio nao encontrado." });
    }
    if (report.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Voce nao pode acessar esse relatorio." });
    }
    return res.json({ report });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/me/reports/:id", requireAuth, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: { id: true, userId: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Relatorio nao encontrado." });
    }
    if (report.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Voce nao pode excluir esse relatorio." });
    }

    await prisma.report.delete({
      where: { id: report.id },
    });

    return res.json({ ok: true, deletedId: report.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/me/reports", requireAuth, async (req, res) => {
  try {
    const { dietId, title, reportType, objective, htmlContent } = req.body;
    if (!title || !htmlContent) {
      return res.status(400).json({ error: "Informe o titulo e o conteudo do relatorio." });
    }

    if (dietId) {
      const diet = await prisma.diet.findUnique({ where: { id: dietId } });
      if (!diet || diet.userId !== req.authUser.id) {
        return res.status(403).json({ error: "Voce nao pode vincular esse relatorio a essa dieta." });
      }
    }

    const report = await prisma.report.create({
      data: {
        userId: req.authUser.id,
        dietId: dietId || null,
        title: String(title).trim(),
        reportType: reportType || "diet_pdf",
        objective: objective || null,
        htmlContent: String(htmlContent),
      },
      select: {
        id: true,
        dietId: true,
        title: true,
        reportType: true,
        objective: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ report });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();

    if (!normalizedName) {
      return res.status(400).json({ error: "Informe seu nome." });
    }
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Informe um email valido." });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: "Ja existe uma conta com esse email." });
    }

    const now = new Date();
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        lastLoginAt: now,
        lastAccessAt: now,
        lastAccessIp: getRequestIp(req),
      },
    });

    const session = await createSession(user.id, "password", getRequestIp(req));

    return res.status(201).json({
      token: session.rawToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash || !verifyPassword(password || "", user.passwordHash)) {
      return res.status(401).json({ error: "Email ou senha invalidos." });
    }

    const requestIp = getRequestIp(req);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastAccessAt: new Date(),
        lastAccessIp: requestIp,
      },
    });

    const session = await createSession(user.id, "password", requestIp);
    return res.json({
      token: session.rawToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    const googleProfile = await verifyGoogleIdToken(credential);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleProfile.googleId },
          { email: googleProfile.email },
        ],
      },
    });

    if (!user) {
      const now = new Date();
      user = await prisma.user.create({
        data: {
          name: googleProfile.name,
          email: googleProfile.email,
          googleId: googleProfile.googleId,
          avatarUrl: googleProfile.avatarUrl,
          lastLoginAt: now,
          lastAccessAt: now,
          lastAccessIp: getRequestIp(req),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || googleProfile.name,
          email: user.email || googleProfile.email,
          googleId: user.googleId || googleProfile.googleId,
          avatarUrl: user.avatarUrl || googleProfile.avatarUrl,
          lastLoginAt: new Date(),
          lastAccessAt: new Date(),
          lastAccessIp: getRequestIp(req),
        },
      });
    }

    const session = await createSession(user.id, "google", getRequestIp(req));
    return res.json({
      token: session.rawToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    await prisma.authSession.deleteMany({
      where: { tokenHash: req.authSession.tokenHash },
    });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/request-password-reset", async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Informe um email valido." });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.json({ ok: true });
    }

    const resetToken = buildPasswordResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetToken.tokenHash,
        expiresAt: resetToken.expiresAt,
      },
    });

    return res.json({
      ok: true,
      ...(process.env.NODE_ENV !== "production"
        ? { devResetToken: resetToken.rawToken }
        : {}),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token de recuperacao ausente." });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const passwordReset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!passwordReset || passwordReset.usedAt || passwordReset.expiresAt <= new Date()) {
      return res.status(400).json({ error: "Token de recuperacao invalido ou expirado." });
    }

    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: {
        passwordHash: hashPassword(password),
      },
    });

    await prisma.passwordResetToken.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
