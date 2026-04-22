const express = require("express");
const { generateDiet } = require("../services/dietEngine");
const { DEFAULT_DIET_GENERATION_CONFIG } = require("../config/dietGenerationConfig");
const prisma = require("../lib/prisma");
const { checkAvatarStorageHealth, runAvatarStorageWriteCheck } = require("../services/avatarService");

const router = express.Router();

const DIET_TYPES = new Set(["traditional", "carnivore", "carnivore_eggs_dairy"]);
const CARB_FREE_DIET_TYPES = new Set(["carnivore", "carnivore_eggs_dairy"]);

function normalizeDietType(value) {
  return DIET_TYPES.has(value) ? value : "traditional";
}

function allowsCarbCategory(dietType) {
  return !CARB_FREE_DIET_TYPES.has(dietType);
}

function isCompatibleWithDiet(item, dietType) {
  if (dietType === "traditional") return true;
  if (!allowsCarbCategory(dietType) && item.category === "carb") return false;
  return Array.isArray(item.dietTags) && item.dietTags.includes(dietType);
}

// ---- FOODS ----
router.get("/foods", async (req, res) => {
  try {
    const { category } = req.query;
    const dietType = normalizeDietType(req.query.dietType);
    if (category === "carb" && !allowsCarbCategory(dietType)) {
      return res.json([]);
    }

    const where = {
      ...(category ? { category } : {}),
      ...(dietType !== "traditional" ? { dietTags: { has: dietType } } : {}),
    };
    const foods = await prisma.food.findMany({ where, orderBy: { name: "asc" } });
    res.json(foods);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const dietType = normalizeDietType(req.query.dietType);
    const where = dietType === "traditional" ? {} : { dietTags: { has: dietType } };
    const recipes = await prisma.recipe.findMany({ where, orderBy: { name: "asc" } });
    res.json(recipes);
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
      generationConfig, dietType: rawDietType, selectedRecipeIds, fixedMeals,
      // User data for saving
      userName, weight, height, age, sex, activityLevel, bodyFatPercentage,
      objective, objectivePct, protPerKg, carbPerKg, fatPerKg,
    } = req.body;
    const dietType = normalizeDietType(rawDietType);

    // Fetch selected foods from DB
    const foods = await prisma.food.findMany({
      where: { id: { in: selectedFoodIds } },
    });
    const compatibleFoods = foods.filter((food) => isCompatibleWithDiet(food, dietType));
    if (compatibleFoods.length !== foods.length) {
      return res.status(400).json({ error: "A seleção contém alimentos incompatíveis com o estilo alimentar escolhido." });
    }
    if (!allowsCarbCategory(dietType) && compatibleFoods.some((food) => food.category === "carb")) {
      return res.status(400).json({ error: "Dietas carnívoras não aceitam alimentos classificados como carboidrato." });
    }

    const requestedRecipeIds = Array.isArray(selectedRecipeIds) ? selectedRecipeIds : [];
    const recipes = requestedRecipeIds.length > 0
      ? await prisma.recipe.findMany({ where: { id: { in: requestedRecipeIds } } })
      : [];
    const compatibleRecipes = recipes.filter((recipe) => isCompatibleWithDiet(recipe, dietType));
    if (compatibleRecipes.length !== recipes.length) {
      return res.status(400).json({ error: "A seleção contém receitas incompatíveis com o estilo alimentar escolhido." });
    }

    const effectiveCarbGrams = allowsCarbCategory(dietType) ? carbGrams : 0;

    const result = generateDiet({
      targetKcal, protGrams, carbGrams: effectiveCarbGrams, fatGrams,
      numMeals,
      mealDistribution,
      foods: compatibleFoods,
      favoriteIds,
      generationConfig,
      recipes: compatibleRecipes,
      fixedMeals,
    });
    const enrichedResult = {
      ...result,
      targetKcal,
      targetMacros: {
        protGrams,
        carbGrams: effectiveCarbGrams,
        fatGrams,
      },
      dietType,
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
        dietType,
        objective: objective || "maintenance",
        objectivePct: objectivePct || 0,
        targetKcal,
        protPerKg: protPerKg || 2.0,
        carbPerKg: allowsCarbCategory(dietType) ? (carbPerKg || 3.0) : 0,
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
        selectedRecipeIds: requestedRecipeIds,
        fixedMeals: fixedMeals || null,
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
