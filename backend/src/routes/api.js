const express = require("express");
const { generateDiet } = require("../services/dietEngine");
const { DEFAULT_DIET_GENERATION_CONFIG } = require("../config/dietGenerationConfig");
const prisma = require("../lib/prisma");
const { checkAvatarStorageHealth, runAvatarStorageWriteCheck } = require("../services/avatarService");

const router = express.Router();

// ---- FOODS ----
router.get("/foods", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const foods = await prisma.food.findMany({ where, orderBy: { name: "asc" } });
    res.json(foods);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/config/diet-generation", (req, res) => {
  res.json(DEFAULT_DIET_GENERATION_CONFIG);
});

router.get("/health/avatar-storage", async (req, res) => {
  try {
    const health = await checkAvatarStorageHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/avatar-storage/write-check", async (req, res) => {
  try {
    const result = await runAvatarStorageWriteCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- TDEE CALCULATION ----
router.post("/tdee", (req, res) => {
  const { weight, height, age, sex, activityLevel } = req.body;
  
  const factors = [1.2, 1.375, 1.55, 1.725, 1.9];
  const bmr = sex === "M"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  
  const tdee = Math.round(bmr * factors[activityLevel]);
  
  res.json({
    bmr: Math.round(bmr),
    tdee,
    formula: "Mifflin-St Jeor",
    activityFactor: factors[activityLevel],
  });
});

// ---- GENERATE DIET ----
router.post("/generate", async (req, res) => {
  try {
    const {
      targetKcal, protGrams, carbGrams, fatGrams,
      numMeals, mealDistribution, selectedFoodIds, favoriteIds,
      generationConfig,
      // User data for saving
      userName, weight, height, age, sex, activityLevel, bodyFatPercentage,
      objective, objectivePct, protPerKg, carbPerKg, fatPerKg,
    } = req.body;

    // Fetch selected foods from DB
    const foods = await prisma.food.findMany({
      where: { id: { in: selectedFoodIds } },
    });

    const result = generateDiet({
      targetKcal, protGrams, carbGrams, fatGrams,
      numMeals, mealDistribution, foods, favoriteIds, generationConfig,
    });
    const enrichedResult = {
      ...result,
      targetKcal,
      targetMacros: {
        protGrams,
        carbGrams,
        fatGrams,
      },
      objective: objective || "maintenance",
      objectivePct: objectivePct || 0,
      numMeals,
    };

    let user;
    if (req.authUser?.id) {
      user = await prisma.user.update({
        where: { id: req.authUser.id },
        data: {
          name: userName || req.authUser.name || null,
          weight,
          height,
          age,
          bodyFatPercentage,
          sex,
          activity: activityLevel,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: userName || null,
          weight,
          height,
          age,
          bodyFatPercentage,
          sex,
          activity: activityLevel,
        },
      });
    }

    const diet = await prisma.diet.create({
      data: {
        userId: user.id,
        objective: objective || "maintenance",
        objectivePct: objectivePct || 0,
        targetKcal,
        protPerKg: protPerKg || 2.0,
        carbPerKg: carbPerKg || 3.0,
        fatPerKg: fatPerKg || 0.8,
        snapshotWeight: weight ?? null,
        snapshotHeight: height ?? null,
        snapshotAge: age ?? null,
        snapshotBodyFatPercentage: bodyFatPercentage ?? null,
        snapshotSex: sex ?? null,
        snapshotActivity: activityLevel ?? null,
        numMeals,
        mealDistribution,
        selectedFoodIds,
        favoriteIds: favoriteIds || [],
        generatedPlan: enrichedResult,
      },
    });

    res.json({ ...enrichedResult, dietId: diet.id, userId: user.id, createdAt: diet.createdAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ---- GET SAVED DIET ----
router.get("/diet/:id", async (req, res) => {
  try {
    const diet = await prisma.diet.findUnique({
      where: { id: req.params.id },
    });
    if (!diet) return res.status(404).json({ error: "Diet not found" });
    if (!req.authUser?.id) {
      return res.status(401).json({ error: "Faça login para abrir dietas salvas." });
    }
    if (diet.userId !== req.authUser.id) {
      return res.status(403).json({ error: "Você não pode acessar essa dieta." });
    }
    res.json(diet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
