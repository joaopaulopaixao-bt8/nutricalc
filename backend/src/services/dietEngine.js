// Diet generation engine - runs server-side
// Prioritizes realistic meal composition, plausible portions, and macro coherence.
const {
  resolveDietGenerationConfig,
  normalizeText,
} = require("../config/dietGenerationConfig");

const PRIMARY_PROTEIN_SHARE = {
  cafe: 0.75,
  lanche: 0.75,
  principal: 0.75,
};

const FOOD_LIMITS_BY_NAME = {
  "Leite desnatado": { min: 100, max: 400, step: 50 },
  "Ovo inteiro cozido": { min: 50, max: 200, step: 50 },
  "Clara de ovo": { min: 33, max: 200, step: 33 },
  "Gema de ovo": { min: 17, max: 68, step: 17 },
  "Whey protein (30g)": { min: 30, max: 60, step: 30 },
  "Caseina (30g)": { min: 30, max: 60, step: 30 },
  "Pao frances": { min: 50, max: 150, step: 50 },
};

const SUBGROUP_LIMITS = {
  ave_magra: { min: 100, max: 250, step: 5 },
  ave: { min: 100, max: 250, step: 5 },
  bovina_magra: { min: 100, max: 250, step: 5 },
  bovina: { min: 100, max: 250, step: 5 },
  peixe_magro: { min: 100, max: 250, step: 5 },
  peixe_gordo: { min: 100, max: 250, step: 5 },
  peixe: { min: 100, max: 250, step: 5 },
  frutos_mar: { min: 100, max: 250, step: 5 },
  suina: { min: 100, max: 250, step: 5 },
  oleaginosa: { min: 10, max: 40, step: 5 },
  oleaginosa_pasta: { min: 10, max: 40, step: 5 },
  oleo: { min: 5, max: 20, step: 5 },
  queijo_gord: { min: 15, max: 60, step: 5 },
  queijo: { min: 20, max: 80, step: 5 },
  queijo_magro: { min: 30, max: 120, step: 5 },
  laticinio: { min: 80, max: 250, step: 10 },
  fruta: { min: 60, max: 250, step: 10 },
  pao: { min: 40, max: 150, step: 10 },
  tapioca: { min: 40, max: 160, step: 10 },
  cereal_cafe: { min: 20, max: 100, step: 5 },
  arroz: { min: 80, max: 220, step: 10 },
  massa: { min: 80, max: 220, step: 10 },
  tuberculo: { min: 80, max: 250, step: 10 },
  leguminosa: { min: 60, max: 180, step: 10 },
};

const DEFAULT_LIMITS_BY_CATEGORY = {
  protein: { min: 30, max: 250, step: 5 },
  carb: { min: 30, max: 220, step: 10 },
  fat: { min: 5, max: 40, step: 5 },
};

const MEAL_RULES = {
  cafe: {
    primaryProteinSubGroups: ["ovo", "queijo_magro", "queijo", "laticinio", "suplemento"],
    secondaryProteinSubGroups: ["frio", "embutido"],
    secondaryProteinNames: ["Leite desnatado"],
    primaryFatSubGroups: ["queijo_gord", "queijo", "queijo_magro", "oleaginosa", "oleaginosa_pasta", "ovo", "laticinio_gord"],
    primaryFatNames: ["Pasta de amendoim", "Manteiga de amendoim"],
    preferredCarbSubGroups: ["pao", "tapioca", "cereal_cafe", "fruta"],
  },
  lanche: {
    primaryProteinSubGroups: ["ovo", "queijo_magro", "queijo", "laticinio", "suplemento"],
    secondaryProteinSubGroups: ["frio", "embutido"],
    secondaryProteinNames: ["Leite desnatado"],
    primaryFatSubGroups: ["queijo_gord", "queijo", "queijo_magro", "oleaginosa", "oleaginosa_pasta", "ovo", "laticinio_gord"],
    primaryFatNames: ["Pasta de amendoim", "Manteiga de amendoim"],
    preferredCarbSubGroups: ["fruta", "pao", "tapioca", "cereal_cafe"],
  },
  principal: {
    primaryProteinSubGroups: ["ave_magra", "ave", "bovina_magra", "bovina", "peixe_magro", "peixe_gordo", "peixe", "frutos_mar", "suina", "outra"],
    secondaryProteinSubGroups: ["leguminosa", "vegetal"],
    secondaryProteinNames: [],
    primaryFatSubGroups: ["oleo", "fruta_gord", "outro", "laticinio_gord"],
    primaryFatNames: ["Azeite de oliva", "Oleo de abacate", "Abacate"],
    preferredCarbSubGroups: ["arroz", "massa", "tuberculo", "cereal", "legume", "farinaceo"],
  },
};

const UNIT_PORTIONS = {
  "Ovo inteiro cozido": 50,
  "Clara de ovo": 33,
  "Gema de ovo": 17,
  "Pao frances": 50,
  "Whey protein (30g)": 30,
  "Caseina (30g)": 30,
};

let runtimeConfig = resolveDietGenerationConfig();

function getMealLabels(n) {
  const map = {
    3: ["Café da manhã", "Almoço", "Jantar"],
    4: ["Café da manhã", "Almoço", "Jantar", "Lanche da tarde"],
    5: ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar"],
    6: ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar", "Ceia"],
  };
  return map[n] || Array.from({ length: n }, (_, i) => `Refeição ${i + 1}`);
}

function getMealType(label) {
  const l = normalizeText(label);
  if (l.includes("cafe")) return "cafe";
  if (l.includes("lanche") || l.includes("ceia")) return "lanche";
  return "principal";
}

function isAlmoco(label) {
  return normalizeText(label).includes("almoco");
}

function isJantar(label) {
  return normalizeText(label).includes("jantar");
}

function isBreakfast(label) {
  return getMealType(label) === "cafe";
}

function getMealRule(label) {
  return runtimeConfig.mealRules[getMealType(label)] || runtimeConfig.mealRules.principal;
}

function foodsForMeal(foods, label) {
  const type = getMealType(label);
  const jan = isJantar(label);
  return foods.filter((food) => {
    if (food.mealTypes.includes(type)) return true;
    if (jan && food.mealTypes.includes("jantar_adj")) return true;
    if (
      jan &&
      food.mealTypes.includes("lanche") &&
      (
        (food.category === "protein" && isDinnerSandwichProtein(food)) ||
        (food.category === "carb" && (isDinnerSandwichCarb(food) || isFruit(food)))
      )
    ) {
      return true;
    }
    return false;
  });
}

function isFruit(food) {
  return food.subGroup === "fruta";
}

function getGlycemicRank(food) {
  const level = food?.glycemicIndexLevel || "medio";
  return { baixo: 2, medio: 1, alto: 0 }[level] ?? 1;
}

function isSameGlycemicLevel(a, b) {
  return Boolean(a?.glycemicIndexLevel) && a?.glycemicIndexLevel === b?.glycemicIndexLevel;
}

function matchesPreferredGlycemicIndex(food) {
  const preference = runtimeConfig.preferredCarbGlycemicIndex || "all";
  if (preference === "all") return true;
  if (!food?.glycemicIndexLevel) return false;
  if (preference === "baixo_medio") {
    return food.glycemicIndexLevel === "baixo" || food.glycemicIndexLevel === "medio";
  }
  return food.glycemicIndexLevel === preference;
}

function isNamed(food, expected) {
  return normalizeText(food.name) === normalizeText(expected);
}

function includesName(food, expected) {
  return normalizeText(food.name).includes(normalizeText(expected));
}

function isPrimaryProtein(food, label) {
  const rule = getMealRule(label);
  if (rule.secondaryProteinNames.some((name) => isNamed(food, name))) return false;
  return rule.primaryProteinSubGroups.includes(food.subGroup);
}

function isBreakfastEggProtein(food) {
  return food.subGroup === "ovo" && (isNamed(food, "Ovo inteiro cozido") || includesName(food, "ovo"));
}

function isBreakfastSolidFallback(food) {
  return ["frio", "ave_magra", "ave"].includes(food.subGroup);
}

function isBreakfastDairyProtein(food) {
  return ["laticinio", "queijo_magro", "queijo"].includes(food.subGroup);
}

function isBreakfastSupplement(food) {
  return food.subGroup === "suplemento";
}

function isSnack(label) {
  return getMealType(label) === "lanche";
}

function isSnackSupplement(food) {
  return food.subGroup === "suplemento";
}

function isSnackLightProtein(food) {
  return ["laticinio", "queijo_magro", "frio", "peixe"].includes(food.subGroup);
}

function isSnackSolidProtein(food) {
  return ["ovo", "ave_magra", "ave", "bovina_magra", "bovina", "peixe", "frio"].includes(food.subGroup);
}

function isSnackShakeCarb(food) {
  return ["fruta", "cereal_cafe"].includes(food.subGroup);
}

function isDinnerPlateProtein(food) {
  return ["ave_magra", "ave", "bovina_magra", "bovina", "peixe_magro", "peixe_gordo", "peixe", "frutos_mar", "suina", "outra"].includes(food.subGroup);
}

function isDinnerSandwichProtein(food) {
  return ["ovo", "frio", "queijo_magro", "ave_magra", "ave", "bovina_magra", "bovina", "peixe"].includes(food.subGroup);
}

function isDinnerPlateCarb(food) {
  return ["arroz", "massa", "tuberculo", "cereal", "farinaceo"].includes(food.subGroup);
}

function isDinnerSandwichCarb(food) {
  return ["pao", "tapioca"].includes(food.subGroup);
}

function isSecondaryProtein(food, label) {
  const rule = getMealRule(label);
  return rule.secondaryProteinNames.some((name) => isNamed(food, name)) || rule.secondaryProteinSubGroups.includes(food.subGroup);
}

function isStructuralLegumeProtein(food) {
  return food.subGroup === "leguminosa";
}

function isPrimaryFat(food, label) {
  const rule = getMealRule(label);
  return rule.primaryFatNames.some((name) => isNamed(food, name)) || rule.primaryFatSubGroups.includes(food.subGroup);
}

function isPreferredCarb(food, label) {
  const rule = getMealRule(label);
  if (isAlmoco(label) || isJantar(label)) return !isFruit(food);
  return rule.preferredCarbSubGroups.includes(food.subGroup);
}

function coherentSubs(food, allFoods, label, n = 3) {
  const pool = foodsForMeal(allFoods, label).filter((candidate) => candidate.id !== food.id);
  const sameSubGroup = pool.filter((candidate) => candidate.subGroup === food.subGroup);
  const diffSubGroup = pool.filter((candidate) => candidate.subGroup !== food.subGroup);
  return [...sameSubGroup, ...diffSubGroup].slice(0, n);
}

function rankSubstitutionCandidates(candidates, sourceFood) {
  return [...candidates].sort((a, b) => {
    const aSame = a.subGroup === sourceFood.subGroup ? 1 : 0;
    const bSame = b.subGroup === sourceFood.subGroup ? 1 : 0;
    if (aSame !== bSame) return bSame - aSame;

    if (sourceFood.category === "carb") {
      const aPreferredGly = matchesPreferredGlycemicIndex(a) ? 1 : 0;
      const bPreferredGly = matchesPreferredGlycemicIndex(b) ? 1 : 0;
      if (aPreferredGly !== bPreferredGly) return bPreferredGly - aPreferredGly;

      const aSameGly = isSameGlycemicLevel(a, sourceFood) ? 1 : 0;
      const bSameGly = isSameGlycemicLevel(b, sourceFood) ? 1 : 0;
      if (aSameGly !== bSameGly) return bSameGly - aSameGly;
    }

    const roleRank = { core: 2, flex: 1, accessory: 0 };
    const aRole = roleRank[a.planningRole] || 0;
    const bRole = roleRank[b.planningRole] || 0;
    if (aRole !== bRole) return bRole - aRole;

    return a.name.localeCompare(b.name);
  });
}

function uniqueCandidates(candidates) {
  return candidates.filter((candidate, index, arr) => arr.findIndex((item) => item.id === candidate.id) === index);
}

function getProteinSubstitutionPool(food, allFoods, label) {
  const pool = foodsForMeal(allFoods.proteins, label).filter((candidate) => candidate.id !== food.id);

  if (isBreakfast(label)) {
    const ordered = [
      ...pool.filter((candidate) => isBreakfastEggProtein(candidate)),
      ...pool.filter((candidate) => isBreakfastDairyProtein(candidate) && !includesName(candidate, "leite")),
      ...pool.filter((candidate) => isBreakfastSolidFallback(candidate)),
      ...pool.filter((candidate) => isBreakfastSupplement(candidate)),
    ];
    return uniqueCandidates(ordered);
  }

  if (isSnack(label)) {
    const ordered = [
      ...pool.filter((candidate) => isSnackSupplement(food) && isSnackSupplement(candidate)),
      ...pool.filter((candidate) => isSnackSolidProtein(candidate)),
      ...pool.filter((candidate) => isSnackLightProtein(candidate)),
    ];
    return uniqueCandidates(ordered);
  }

  if (isJantar(label) && !isDinnerPlateProtein(food)) {
    const ordered = [
      ...pool.filter((candidate) => candidate.subGroup === "frio"),
      ...pool.filter((candidate) => candidate.subGroup === "queijo_magro"),
      ...pool.filter((candidate) => candidate.subGroup === "ovo"),
    ];
    return uniqueCandidates(ordered);
  }

  const mainMealProteins = pool.filter((candidate) => isDinnerPlateProtein(candidate));
  return rankSubstitutionCandidates(mainMealProteins, food);
}

function getCarbSubstitutionPool(food, allFoods, label) {
  const carbPool = foodsForMeal(allFoods.carbs, label).filter((candidate) => candidate.id !== food.id);

  if (isStructuralLegumeProtein(food)) {
    const legumeProteins = foodsForMeal(allFoods.proteins, label).filter(
      (candidate) => candidate.id !== food.id && isStructuralLegumeProtein(candidate)
    );
    const ordered = [
      ...legumeProteins.filter((candidate) => includesName(candidate, "feijao")),
      ...legumeProteins.filter((candidate) => !includesName(candidate, "feijao")),
      ...carbPool.filter((candidate) => isDinnerPlateCarb(candidate)),
    ];
    return uniqueCandidates(ordered);
  }

  if (isBreakfast(label)) {
    const ordered = [
      ...carbPool.filter((candidate) => ["pao", "tapioca", "cereal_cafe"].includes(candidate.subGroup)),
      ...carbPool.filter((candidate) => isFruit(candidate)),
    ];
    return rankSubstitutionCandidates(uniqueCandidates(ordered), food);
  }

  if (isSnack(label)) {
    const ordered = [
      ...carbPool.filter((candidate) => isSnackShakeCarb(candidate)),
      ...carbPool.filter((candidate) => isDinnerSandwichCarb(candidate)),
      ...carbPool.filter((candidate) => isFruit(candidate)),
    ];
    return rankSubstitutionCandidates(uniqueCandidates(ordered), food);
  }

  if (isJantar(label)) {
    const ordered = isDinnerSandwichCarb(food)
      ? [
          ...carbPool.filter((candidate) => isDinnerSandwichCarb(candidate)),
          ...carbPool.filter((candidate) => isFruit(candidate)),
        ]
      : carbPool.filter((candidate) => isDinnerPlateCarb(candidate));

    return rankSubstitutionCandidates(uniqueCandidates(ordered), food);
  }

  return rankSubstitutionCandidates(carbPool.filter((candidate) => isDinnerPlateCarb(candidate)), food);
}

function getFatSubstitutionPool(food, allFoods, label) {
  const pool = foodsForMeal(allFoods.fats, label).filter((candidate) => candidate.id !== food.id);
  return rankSubstitutionCandidates(pool.filter((candidate) => isPrimaryFat(candidate, label)), food);
}

function roundToStep(value, step, min) {
  return Math.max(min, Math.round(value / step) * step);
}

function getFoodLimits(food) {
  return (
    runtimeConfig.foodLimitsByNormalizedName[normalizeText(food.name)] ||
    runtimeConfig.subgroupLimits[food.subGroup] ||
    runtimeConfig.defaultLimitsByCategory[food.category] ||
    { min: 5, max: 250, step: 5 }
  );
}

function normalizePortion(food, grams, minOverride) {
  const limits = getFoodLimits(food);
  const unitSize = runtimeConfig.unitPortionsByNormalizedName[normalizeText(food.name)];
  const min = minOverride ?? limits.min;
  const max = limits.max;
  const step = unitSize || limits.step || 5;
  const bounded = Math.min(max, Math.max(grams, min));
  const rounded = roundToStep(bounded, step, min);
  return Math.min(max, rounded);
}

function clampPortion(food, grams, minOverride) {
  if (grams <= 0) return 0;
  return normalizePortion(food, grams, minOverride);
}

function gramsForMacro(food, macro, target) {
  if (!food || !food[macro] || target <= 0) return 0;
  return (target / food[macro]) * 100;
}

function minimumMeaningfulCarb(food) {
  const limits = getFoodLimits(food);
  return Math.max(limits.min, isFruit(food) ? 60 : 40);
}

function recalcMealTotal(meal) {
  return meal.foods.reduce((sum, food) => sum + (food.kcal * food.grams) / 100, 0);
}

function getFoodMacroContribution(food, macro, grams) {
  return ((food?.[macro] || 0) * grams) / 100;
}

function summarizeFoods(foods, label) {
  return foods.reduce(
    (acc, food) => {
      acc.prot += getFoodMacroContribution(food, "prot", food.grams);
      acc.carb += getFoodMacroContribution(food, "carb", food.grams);
      acc.fat += getFoodMacroContribution(food, "fat", food.grams);
      acc.kcal += getFoodMacroContribution(food, "kcal", food.grams);
      if (food.role === "protein" && isPrimaryProtein(food, label)) {
        acc.primaryProtein += getFoodMacroContribution(food, "prot", food.grams);
      }
      if (food.role === "fat" && isPrimaryFat(food, label)) {
        acc.primaryFat += getFoodMacroContribution(food, "fat", food.grams);
      }
      if (food.role === "protein" && getMealType(label) === "principal" && isPrimaryProtein(food, label)) {
        acc.primaryFat += getFoodMacroContribution(food, "fat", food.grams);
      }
      if (food.role === "protein" && getMealType(label) !== "principal" && ["ovo", "queijo", "queijo_magro"].includes(food.subGroup)) {
        acc.primaryFat += getFoodMacroContribution(food, "fat", food.grams);
      }
      return acc;
    },
    { prot: 0, carb: 0, fat: 0, kcal: 0, primaryProtein: 0, primaryFat: 0 }
  );
}

function proteinMealScore(food, label, recentProteins, recentSubGroups, mealIndex) {
  let score = 0;
  const primary = isPrimaryProtein(food, label);
  const secondary = isSecondaryProtein(food, label);
  const mainMeal = getMealType(label) === "principal";

  if (isBreakfast(label)) {
    if (isBreakfastEggProtein(food)) score += 80;
    else if (food.subGroup === "ovo") score += 45;
    else if (isBreakfastSolidFallback(food)) score += 28;
    else if (isBreakfastDairyProtein(food)) score += 16;
    else if (isBreakfastSupplement(food)) score -= 18;
  }

  if (isSnack(label)) {
    if (isSnackSupplement(food)) score += 58;
    else if (isSnackLightProtein(food)) score += 24;
    else if (food.subGroup === "ovo") score += 18;
    else if (isSnackSolidProtein(food)) score += 8;
    if (["queijo", "queijo_gord"].includes(food.subGroup)) score -= 10;
  }

  if (isJantar(label)) {
    if (isDinnerPlateProtein(food)) score += 24;
    else if (isDinnerSandwichProtein(food)) score += 12;
  }

  if (primary) score += 40;
  if (secondary) score += 12;
  if (!primary && !secondary) score -= 16;
  if (food.planningRole === "core") score += 12;
  if (food.planningRole === "flex") score += 4;
  if (food.planningRole === "accessory") score -= 20;
  if (isBreakfast(label) && ["queijo", "queijo_magro"].includes(food.subGroup)) score -= 14;
  if (isBreakfast(label) && food.subGroup === "laticinio") score -= 8;
  if (includesName(food, "leite")) score -= 25;
  if (recentProteins.includes(food.id)) score -= 24;
  if (recentSubGroups.includes(food.subGroup)) score -= 12;
  if (mainMeal && food.carb > 10) score -= 8;
  if (!mainMeal && ["ave_magra", "ave", "bovina_magra", "bovina", "suina"].includes(food.subGroup)) score -= 8;
  if (mealIndex % 2 === 0) score -= food.name.localeCompare("N");

  return score;
}

function carbMealScore(food, label, mealIndex) {
  let score = 0;
  const mainMeal = getMealType(label) === "principal";

  if (isPreferredCarb(food, label)) score += 18;
  if (food.planningRole === "core") score += 10;
  if (food.planningRole === "flex") score += 3;
  if (food.planningRole === "accessory") score -= 18;
  if (mainMeal && ["arroz", "massa", "tuberculo", "cereal", "farinaceo"].includes(food.subGroup)) score += 18;
  if (isJantar(label) && isDinnerPlateCarb(food)) score += 10;
  if (isJantar(label) && isDinnerSandwichCarb(food)) score += 8;
  if (mainMeal && food.subGroup === "legume") score -= 18;
  if (mainMeal && isFruit(food)) score -= 30;
  if (!mainMeal && ["pao", "tapioca", "cereal_cafe"].includes(food.subGroup)) score += 16;
  if (!mainMeal && isFruit(food)) score += 2;
  if (food.subGroup === "acucar") score -= 18;
  if (food.subGroup === "legume" && !mainMeal) score -= 10;
  if (!mainMeal && food.glycemicIndexLevel === "baixo") score += 8;
  if (!mainMeal && food.glycemicIndexLevel === "medio") score += 4;
  if (!mainMeal && food.glycemicIndexLevel === "alto" && !["tapioca", "pao"].includes(food.subGroup)) score -= 6;
  if (mainMeal && food.glycemicIndexLevel === "baixo") score += 4;
  if (mainMeal && food.glycemicIndexLevel === "alto" && food.subGroup === "legume") score -= 2;
  if (matchesPreferredGlycemicIndex(food)) score += 16;
  if (!matchesPreferredGlycemicIndex(food) && runtimeConfig.preferredCarbGlycemicIndex !== "all") score -= 10;
  if (mealIndex % 2 === 1) score -= food.name.length % 7;

  return score;
}

function fatMealScore(food, label, mealIndex) {
  let score = 0;

  if (isPrimaryFat(food, label)) score += 24;
  if (food.planningRole === "core") score += 10;
  if (food.planningRole === "flex") score += 3;
  if (food.planningRole === "accessory") score -= 16;
  if (isNamed(food, "Azeite de oliva")) score += 18;
  if (isNamed(food, "Óleo de abacate")) score += 14;
  if (isNamed(food, "Abacate")) score += 12;
  if (isNamed(food, "Azeite de dendê")) score -= 10;
  if (food.subGroup === "oleo" && getMealType(label) !== "principal") score -= 10;
  if (food.subGroup === "outro" && !isNamed(food, "Abacate")) score -= 6;
  if (mealIndex % 2 === 0) score -= food.name.length % 5;

  return score;
}

function sortFoodsForMeal(pool, scoreFn) {
  return [...pool].sort((a, b) => {
    const diff = scoreFn(b) - scoreFn(a);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

function chooseProteinAccessories(pool, label, mainProtein, remainingProtTarget) {
  if (remainingProtTarget <= 6) return [];

  if (isBreakfast(label)) {
    const candidates = pool.filter((food) => food.id !== mainProtein?.id);
    const breakfastOrdered = [
      ...candidates.filter((food) => food.subGroup === "ovo"),
      ...candidates.filter((food) => food.subGroup === "queijo_magro"),
      ...candidates.filter((food) => food.subGroup === "laticinio"),
      ...candidates.filter((food) => food.subGroup === "queijo"),
      ...candidates.filter((food) => food.subGroup === "frio"),
      ...candidates.filter((food) => food.subGroup === "suplemento"),
    ].filter((food, index, arr) => arr.findIndex((candidate) => candidate.id === food.id) === index);

    const accessory = breakfastOrdered[0];
    if (!accessory) return [];

    const accessoryProteinTarget = Math.min(
      remainingProtTarget,
      mainProtein?.subGroup === "ovo" ? remainingProtTarget * 0.35 : remainingProtTarget * 0.5
    );
    const grams = clampPortion(
      accessory,
      gramsForMacro(accessory, "prot", accessoryProteinTarget),
      getFoodLimits(accessory).min
    );

    if (grams <= 0) return [];
    return [{ ...accessory, grams, role: "protein_accessory" }];
  }

  if (isSnack(label)) {
    const candidates = pool.filter((food) => food.id !== mainProtein?.id);
    if (isSnackSupplement(mainProtein || {}) && remainingProtTarget <= 10) return [];

    const ordered = [
      ...candidates.filter((food) => food.subGroup === "ovo"),
      ...candidates.filter((food) => isSnackLightProtein(food)),
      ...candidates.filter((food) => isSnackSolidProtein(food) && !isSnackSupplement(food)),
    ].filter((food, index, arr) => arr.findIndex((candidate) => candidate.id === food.id) === index);

    const accessory = ordered[0];
    if (!accessory) return [];

    const accessoryProteinTarget = Math.min(
      remainingProtTarget,
      isSnackSupplement(mainProtein || {}) ? remainingProtTarget * 0.25 : remainingProtTarget * 0.45
    );
    const grams = clampPortion(
      accessory,
      gramsForMacro(accessory, "prot", accessoryProteinTarget),
      getFoodLimits(accessory).min
    );

    if (grams <= 0) return [];
    return [{ ...accessory, grams, role: "protein_accessory" }];
  }

  if (isJantar(label) && mainProtein && !isDinnerPlateProtein(mainProtein)) {
    const candidates = pool.filter((food) => food.id !== mainProtein?.id);
    const ordered = [
      ...candidates.filter((food) => food.subGroup === "frio"),
      ...candidates.filter((food) => food.subGroup === "queijo_magro"),
      ...candidates.filter((food) => food.subGroup === "ovo"),
    ].filter((food, index, arr) => arr.findIndex((candidate) => candidate.id === food.id) === index);

    const accessory = ordered[0];
    if (!accessory) return [];

    const accessoryProteinTarget = Math.min(remainingProtTarget, 8);
    const grams = clampPortion(
      accessory,
      gramsForMacro(accessory, "prot", accessoryProteinTarget),
      getFoodLimits(accessory).min
    );

    if (grams <= 0) return [];
    return [{ ...accessory, grams, role: "protein_accessory" }];
  }

  if (getMealType(label) === "principal") {
    const candidates = pool.filter((food) => food.id !== mainProtein?.id);
    const structuralOptions = [
      ...candidates.filter((food) => isStructuralLegumeProtein(food) && includesName(food, "feijao")),
      ...candidates.filter((food) => isStructuralLegumeProtein(food) && !includesName(food, "feijao")),
    ].filter((food, index, arr) => arr.findIndex((candidate) => candidate.id === food.id) === index);

    const accessory = structuralOptions[0];
    if (!accessory) return [];

    const accessoryProteinTarget = Math.min(8, Math.max(4, remainingProtTarget * 0.35));
    const grams = clampPortion(
      accessory,
      gramsForMacro(accessory, "prot", accessoryProteinTarget),
      getFoodLimits(accessory).min
    );

    if (grams <= 0) return [];
    return [{ ...accessory, grams, role: "protein_accessory" }];
  }

  const candidates = pool.filter((food) => food.id !== mainProtein?.id);
  const primary = candidates.filter((food) => isPrimaryProtein(food, label));
  const fallback = candidates.filter((food) => isSecondaryProtein(food, label));
  const source = primary.length > 0 ? primary : fallback;
  if (source.length === 0) return [];

  const accessory = source[0];
  const grams = clampPortion(accessory, gramsForMacro(accessory, "prot", remainingProtTarget), getFoodLimits(accessory).min);
  if (grams <= 0) return [];

  return [{ ...accessory, grams, role: "protein_accessory" }];
}

function chooseCarbsForMeal(carbPool, label, targetCarbs) {
  if (carbPool.length === 0 || targetCarbs <= 0) return [];

  const sorted = sortFoodsForMeal(carbPool, (food) => carbMealScore(food, label, 0));
  if (isSnack(label)) {
    const mainCarb =
      sorted.find((food) => isSnackShakeCarb(food)) ||
      sorted.find((food) => !isFruit(food)) ||
      sorted[0];

    if (!mainCarb) return [];

    const selections = [];
    const canUseFruitAccessory = targetCarbs >= 20;
    const fruit = sorted.find((food) => isFruit(food) && food.id !== mainCarb.id);

    if (!canUseFruitAccessory || !fruit || isFruit(mainCarb)) {
      selections.push({ food: mainCarb, targetCarbs });
      return selections;
    }

    const fruitTarget = Math.min(16, Math.max(8, targetCarbs * 0.35));
    selections.push({ food: mainCarb, targetCarbs: Math.max(0, targetCarbs - fruitTarget) });
    selections.push({ food: fruit, targetCarbs: fruitTarget });
    return selections;
  }

  if (isJantar(label)) {
    const dinnerPlateCarb = sorted.find((food) => isDinnerPlateCarb(food));
    if (dinnerPlateCarb) {
      return [{ food: dinnerPlateCarb, targetCarbs }];
    }

    const sandwichCarb = sorted.find((food) => isDinnerSandwichCarb(food)) || sorted.find((food) => !isFruit(food)) || sorted[0];
    if (!sandwichCarb) return [];

    const selections = [];
    const fruit = sorted.find((food) => isFruit(food) && food.id !== sandwichCarb.id);
    if (!fruit || targetCarbs < 25) {
      selections.push({ food: sandwichCarb, targetCarbs });
      return selections;
    }

    const fruitTarget = Math.min(14, Math.max(8, targetCarbs * 0.3));
    selections.push({ food: sandwichCarb, targetCarbs: Math.max(0, targetCarbs - fruitTarget) });
    selections.push({ food: fruit, targetCarbs: fruitTarget });
    return selections;
  }

  const mainCarb = getMealType(label) === "principal"
    ? sorted.find((food) => !isFruit(food) && food.subGroup !== "legume") || sorted.find((food) => !isFruit(food)) || sorted[0]
    : sorted.find((food) => !isFruit(food)) || sorted[0];
  if (!mainCarb) return [];

  const selections = [];
  const useFruitAccessory = getMealType(label) !== "principal" && targetCarbs >= 35;
  const fruit = sorted.find((food) => isFruit(food) && food.id !== mainCarb.id);
  const secondary = sorted.find((food) => !isFruit(food) && food.id !== mainCarb.id);

  if (!useFruitAccessory || !fruit) {
    selections.push({ food: mainCarb, targetCarbs });
    return selections;
  }

  const fruitTarget = Math.min(20, Math.max(10, targetCarbs * 0.22));
  selections.push({ food: mainCarb, targetCarbs: Math.max(0, targetCarbs - fruitTarget) });
  selections.push({ food: fruit, targetCarbs: fruitTarget });

  if (secondary && selections[0].targetCarbs > 55 && secondary.id !== fruit.id) {
    const shifted = Math.min(15, selections[0].targetCarbs * 0.2);
    selections[0].targetCarbs -= shifted;
    selections.push({ food: secondary, targetCarbs: shifted });
  }

  return selections;
}

function chooseProteinForMeal(protPool, label, attempt) {
  if (protPool.length === 0) return null;

  if (isBreakfast(label)) {
    const eggCandidates = protPool.filter((food) => isBreakfastEggProtein(food));
    if (eggCandidates.length > 0) {
      return eggCandidates[Math.min(attempt, eggCandidates.length - 1)] || eggCandidates[0];
    }

    const solidFallbacks = protPool.filter((food) => isBreakfastSolidFallback(food));
    if (solidFallbacks.length > 0) {
      return solidFallbacks[Math.min(attempt, solidFallbacks.length - 1)] || solidFallbacks[0];
    }

    const dairyFallbacks = protPool.filter((food) => isBreakfastDairyProtein(food) && !includesName(food, "leite"));
    if (dairyFallbacks.length > 0) {
      return dairyFallbacks[Math.min(attempt, dairyFallbacks.length - 1)] || dairyFallbacks[0];
    }

    const supplementFallbacks = protPool.filter((food) => isBreakfastSupplement(food));
    if (supplementFallbacks.length > 0) {
      return supplementFallbacks[Math.min(attempt, supplementFallbacks.length - 1)] || supplementFallbacks[0];
    }
  }

  if (isSnack(label)) {
    const supplementCandidates = protPool.filter((food) => isSnackSupplement(food));
    if (supplementCandidates.length > 0) {
      return supplementCandidates[Math.min(attempt, supplementCandidates.length - 1)] || supplementCandidates[0];
    }

    const solidCandidates = protPool.filter((food) => isSnackSolidProtein(food));
    if (solidCandidates.length > 0) {
      return solidCandidates[Math.min(attempt, solidCandidates.length - 1)] || solidCandidates[0];
    }

    const lightCandidates = protPool.filter((food) => isSnackLightProtein(food));
    if (lightCandidates.length > 0) {
      return lightCandidates[Math.min(attempt, lightCandidates.length - 1)] || lightCandidates[0];
    }
  }

  if (isJantar(label)) {
    const plateCandidates = protPool.filter((food) => isDinnerPlateProtein(food));
    if (plateCandidates.length > 0) {
      return plateCandidates[Math.min(attempt, plateCandidates.length - 1)] || plateCandidates[0];
    }

    const sandwichCandidates = protPool.filter((food) => isDinnerSandwichProtein(food));
    if (sandwichCandidates.length > 0) {
      return sandwichCandidates[Math.min(attempt, sandwichCandidates.length - 1)] || sandwichCandidates[0];
    }
  }

  return protPool[attempt % Math.max(1, protPool.length)] || null;
}

function buildSubs(food, grams, role, allFoods, label) {
  const macro = role === "protein" ? "prot" : role === "carb" ? "carb" : "fat";
  const targetMacro = getFoodMacroContribution(food, macro, grams);

  const pool =
    role === "protein"
      ? getProteinSubstitutionPool(food, allFoods, label)
      : role === "carb"
        ? getCarbSubstitutionPool(food, allFoods, label)
        : getFatSubstitutionPool(food, allFoods, label);

  return pool.slice(0, 4).map((sub) => ({
    id: sub.id,
    name: sub.name,
    grams: clampPortion(sub, gramsForMacro(sub, macro, targetMacro), getFoodLimits(sub).min),
    prot: sub.prot,
    carb: sub.carb,
    fat: sub.fat,
    kcal: sub.kcal,
    glycemicIndexLevel: sub.glycemicIndexLevel || null,
  }));
}

function validateMealStructure(foods, label, targets) {
  const summary = summarizeFoods(foods, label);
  const issues = [];
  const minPrimaryProteinShare = runtimeConfig.primaryProteinShare[getMealType(label)] || 0.75;

  foods.forEach((food) => {
    const limits = getFoodLimits(food);
    if (food.grams > limits.max) {
      issues.push(`portion:${food.name}`);
    }
  });

  if (summary.prot > 0) {
    const primaryShare = summary.primaryProtein / summary.prot;
    if (primaryShare < minPrimaryProteinShare) {
      issues.push("primary_protein_share");
    }
  }

  const secondaryProteinDominance = foods
    .filter((food) => food.role !== "protein")
    .some((food) => getFoodMacroContribution(food, "prot", food.grams) > summary.primaryProtein);
  if (secondaryProteinDominance) {
    issues.push("secondary_protein_dominance");
  }

  if (summary.prot < targets.prot * 0.82) issues.push("low_protein");
  if (summary.carb < targets.carb * 0.75 && targets.carb > 20) issues.push("low_carb");
  if (summary.fat < targets.fat * 0.65 && targets.fat > 8) issues.push("low_fat");

  if (summary.fat > 0 && getMealType(label) !== "principal") {
    const fatShare = summary.primaryFat / summary.fat;
    if (fatShare < 0.55) {
      issues.push("fat_source_quality");
    }
  }

  return { valid: issues.length === 0, issues, summary };
}

function buildMealCandidate({
  label,
  mealIndex,
  targets,
  pools,
  recentProteins,
  recentSubGroups,
  attempt,
  favSet,
}) {
  const protPool = sortFoodsForMeal(pools.proteins, (food) =>
    proteinMealScore(food, label, recentProteins, recentSubGroups, mealIndex)
  );
  const carbPool = sortFoodsForMeal(pools.carbs, (food) => carbMealScore(food, label, mealIndex));
  const fatPool = sortFoodsForMeal(pools.fats, (food) => fatMealScore(food, label, mealIndex));
  const foods = [];

  const proteinChoice = chooseProteinForMeal(protPool, label, attempt);
  if (proteinChoice) {
    const primaryTarget = targets.prot * (runtimeConfig.primaryProteinShare[getMealType(label)] || 0.75);
    const grams = clampPortion(proteinChoice, gramsForMacro(proteinChoice, "prot", primaryTarget), getFoodLimits(proteinChoice).min);
    if (grams > 0) {
      foods.push({
        ...proteinChoice,
        grams,
        role: "protein",
        isFavorite: favSet.has(proteinChoice.id),
      });
    }
  }

  const proteinSummary = summarizeFoods(foods, label);
  const accessories = chooseProteinAccessories(protPool, label, proteinChoice, Math.max(0, targets.prot - proteinSummary.prot));
  accessories.forEach((food) => {
    foods.push({
      ...food,
      isFavorite: favSet.has(food.id),
    });
  });

  const carbTarget = Math.max(0, targets.carb - summarizeFoods(foods, label).carb);
  chooseCarbsForMeal(carbPool, label, carbTarget).forEach(({ food, targetCarbs }) => {
    const grams = clampPortion(food, gramsForMacro(food, "carb", targetCarbs), minimumMeaningfulCarb(food));
    if (grams <= 0) return;
    foods.push({
      ...food,
      grams,
      role: "carb",
      isFavorite: favSet.has(food.id),
    });
  });

  const fatTarget = Math.max(0, targets.fat - summarizeFoods(foods, label).fat);
  const fatChoice = fatPool[attempt % Math.max(1, fatPool.length)] || null;
  const dinnerSandwichMode =
    isJantar(label) &&
    foods.some((food) => food.role === "protein" && isDinnerSandwichProtein(food) && !isDinnerPlateProtein(food)) &&
    foods.some((food) => food.role === "carb" && isDinnerSandwichCarb(food));
  if (fatChoice && fatTarget > 2 && !dinnerSandwichMode) {
    const grams = clampPortion(fatChoice, gramsForMacro(fatChoice, "fat", fatTarget), getFoodLimits(fatChoice).min);
    if (grams > 0) {
      foods.push({
        ...fatChoice,
        grams,
        role: "fat",
        isFavorite: favSet.has(fatChoice.id),
      });
    }
  }

  const proteinGap = targets.prot - summarizeFoods(foods, label).prot;
  const mainProtein = foods.find((food) => food.role === "protein");
  if (proteinGap > 8 && mainProtein) {
    mainProtein.grams = clampPortion(
      mainProtein,
      mainProtein.grams + gramsForMacro(mainProtein, "prot", proteinGap),
      getFoodLimits(mainProtein).min
    );
  }

  for (let iter = 0; iter < 4; iter++) {
    const summary = summarizeFoods(foods, label);
    const diff = summary.kcal - targets.kcal;
    if (Math.abs(diff) <= 35) break;

    const mainCarb = foods.find((food) => food.role === "carb");
    const mainFat = foods.find((food) => food.role === "fat");

    if (diff > 0 && mainFat) {
      mainFat.grams = clampPortion(mainFat, Math.max(0, mainFat.grams - 5), 5);
    }
    if (diff > 0 && mainCarb) {
      mainCarb.grams = clampPortion(mainCarb, Math.max(0, mainCarb.grams - 10), minimumMeaningfulCarb(mainCarb));
    }
    if (diff < 0 && mainCarb) {
      mainCarb.grams = clampPortion(mainCarb, mainCarb.grams + 10, minimumMeaningfulCarb(mainCarb));
    } else if (diff < 0 && mainFat) {
      mainFat.grams = clampPortion(mainFat, mainFat.grams + 5, 5);
    }
  }

  const cleanFoods = foods.filter((food) => food.grams > 0).map((food) => {
    const role =
      food.role === "protein_accessory"
        ? getMealType(label) === "principal" && isStructuralLegumeProtein(food)
          ? "carb"
          : "protein"
        : food.role;
    return {
      id: food.id,
      name: food.name,
      grams: food.grams,
      role,
      sourceRole: food.role,
      isFavorite: food.isFavorite,
      prot: food.prot,
      carb: food.carb,
      fat: food.fat,
      kcal: food.kcal,
      subGroup: food.subGroup,
      glycemicIndexLevel: food.glycemicIndexLevel || null,
      substitutions: buildSubs(food, food.grams, role, pools, label),
    };
  });

  const validation = validateMealStructure(cleanFoods, label, targets);
  const penalty =
    validation.issues.length * 100 +
    Math.abs(validation.summary.prot - targets.prot) * 2 +
    Math.abs(validation.summary.carb - targets.carb) +
    Math.abs(validation.summary.fat - targets.fat) * 2;

  return { foods: cleanFoods, validation, penalty };
}

function scaleMealFoods(meals, ratio) {
  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      if (food.role === "protein" && food.sourceRole !== "protein_accessory") return;
      food.grams = clampPortion(food, food.grams * ratio, getFoodLimits(food).min);
      if (food.substitutions) {
        food.substitutions.forEach((sub) => {
          sub.grams = clampPortion(sub, sub.grams * ratio, getFoodLimits(sub).min);
        });
      }
    });
    meal.foods = meal.foods.filter((food) => food.grams > 0);
  });
}

function getFoodSourceMap(allFoods) {
  return new Map(
    [...allFoods.proteins, ...allFoods.carbs, ...allFoods.fats].map((food) => [food.id, food])
  );
}

function refreshMealFoodFromSubstitution(food, replacement, label, allFoods, sourceMap) {
  const source = sourceMap.get(replacement.id);
  if (!source) return food;

  return {
    id: source.id,
    name: source.name,
    grams: replacement.grams,
    role: food.role,
    sourceRole: food.sourceRole || food.role,
    isFavorite: food.isFavorite,
    prot: source.prot,
    carb: source.carb,
    fat: source.fat,
    kcal: source.kcal,
    subGroup: source.subGroup,
    glycemicIndexLevel: source.glycemicIndexLevel || null,
    substitutions: buildSubs(source, replacement.grams, food.role, allFoods, label),
  };
}

function diversifyDayMeals(meals, allFoods) {
  const sourceMap = getFoodSourceMap(allFoods);

  for (let i = 1; i < meals.length; i++) {
    const previousMeal = meals[i - 1];
    const currentMeal = meals[i];
    const previousProtein = previousMeal.foods.find((food) => food.role === "protein");
    const currentProtein = currentMeal.foods.find((food) => food.role === "protein");

    if (previousProtein && currentProtein && previousProtein.id === currentProtein.id) {
      const alternative = (currentProtein.substitutions || []).find((sub) => sub.id !== previousProtein.id);
      if (alternative) {
        const index = currentMeal.foods.findIndex((food) => food.role === "protein");
        currentMeal.foods[index] = refreshMealFoodFromSubstitution(
          currentProtein,
          alternative,
          currentMeal.label,
          allFoods,
          sourceMap
        );
      }
    }

    const previousMainCarb = previousMeal.foods.find((food) => food.role === "carb" && !isStructuralLegumeProtein(food));
    const currentMainCarb = currentMeal.foods.find((food) => food.role === "carb" && !isStructuralLegumeProtein(food));

    if (
      previousMainCarb &&
      currentMainCarb &&
      previousMainCarb.id === currentMainCarb.id &&
      getMealType(previousMeal.label) === "principal" &&
      getMealType(currentMeal.label) === "principal"
    ) {
      const alternative = (currentMainCarb.substitutions || []).find(
        (sub) => sub.id !== previousMainCarb.id
      );
      if (alternative) {
        const index = currentMeal.foods.findIndex(
          (food) => food.role === "carb" && !isStructuralLegumeProtein(food)
        );
        currentMeal.foods[index] = refreshMealFoodFromSubstitution(
          currentMainCarb,
          alternative,
          currentMeal.label,
          allFoods,
          sourceMap
        );
      }
    }

    if (getMealType(currentMeal.label) === "lanche") {
      const previousSnack = meals.slice(0, i).reverse().find((meal) => getMealType(meal.label) === "lanche");
      if (previousSnack) {
        const previousSnackProtein = previousSnack.foods.find((food) => food.role === "protein");
        const currentSnackProtein = currentMeal.foods.find((food) => food.role === "protein");
        const previousSnackCarb = previousSnack.foods.find((food) => food.role === "carb");
        const currentSnackCarb = currentMeal.foods.find((food) => food.role === "carb");

        if (
          previousSnackProtein &&
          currentSnackProtein &&
          previousSnackCarb &&
          currentSnackCarb &&
          previousSnackProtein.id === currentSnackProtein.id &&
          previousSnackCarb.id === currentSnackCarb.id
        ) {
          const otherCurrentCarbIds = currentMeal.foods
            .filter((food) => food.role === "carb" && food.id !== currentSnackCarb.id)
            .map((food) => food.id);
          const carbAlternative = (currentSnackCarb.substitutions || []).find(
            (sub) => sub.id !== previousSnackCarb.id && !otherCurrentCarbIds.includes(sub.id)
          );
          if (carbAlternative) {
            const index = currentMeal.foods.findIndex((food) => food.role === "carb");
            currentMeal.foods[index] = refreshMealFoodFromSubstitution(
              currentSnackCarb,
              carbAlternative,
              currentMeal.label,
              allFoods,
              sourceMap
            );
          }
        }
      }
    }
  }
}

function validateDayStructure(meals) {
  const issues = [];

  for (let i = 1; i < meals.length; i++) {
    const previousMeal = meals[i - 1];
    const currentMeal = meals[i];
    const previousProtein = previousMeal.foods.find((food) => food.role === "protein");
    const currentProtein = currentMeal.foods.find((food) => food.role === "protein");

    if (previousProtein && currentProtein && previousProtein.id === currentProtein.id) {
      issues.push(`repeated_protein:${previousMeal.label}:${currentMeal.label}`);
    }

    const previousMainCarb = previousMeal.foods.find((food) => food.role === "carb" && !isStructuralLegumeProtein(food));
    const currentMainCarb = currentMeal.foods.find((food) => food.role === "carb" && !isStructuralLegumeProtein(food));

    if (
      previousMainCarb &&
      currentMainCarb &&
      previousMainCarb.id === currentMainCarb.id &&
      getMealType(previousMeal.label) === "principal" &&
      getMealType(currentMeal.label) === "principal"
    ) {
      issues.push(`repeated_main_carb:${previousMeal.label}:${currentMeal.label}`);
    }
  }

  const snackMeals = meals.filter((meal) => getMealType(meal.label) === "lanche");
  for (let i = 1; i < snackMeals.length; i++) {
    const previousSnackProtein = snackMeals[i - 1].foods.find((food) => food.role === "protein");
    const currentSnackProtein = snackMeals[i].foods.find((food) => food.role === "protein");
    const previousSnackCarb = snackMeals[i - 1].foods.find((food) => food.role === "carb");
    const currentSnackCarb = snackMeals[i].foods.find((food) => food.role === "carb");

    if (
      previousSnackProtein &&
      currentSnackProtein &&
      previousSnackCarb &&
      currentSnackCarb &&
      previousSnackProtein.id === currentSnackProtein.id &&
      previousSnackCarb.id === currentSnackCarb.id
    ) {
      issues.push(`repeated_snack_pattern:${snackMeals[i - 1].label}:${snackMeals[i].label}`);
    }
  }

  return { valid: issues.length === 0, issues };
}

function trimDayCalories(meals, targetKcal) {
  const getTotal = () => Math.round(meals.reduce((sum, meal) => sum + recalcMealTotal(meal), 0));

  for (let iter = 0; iter < 30 && getTotal() > targetKcal + 40; iter++) {
    let trimmed = false;

    const orderedFoods = meals.flatMap((meal) =>
      meal.foods.map((food) => ({ meal, food }))
    ).sort((a, b) => {
      const rank = (item) => {
        if (item.food.role === "fat") return 3;
        if (item.food.sourceRole === "protein_accessory") return 2;
        if (item.food.role === "carb") return 1;
        return 0;
      };
      const rankDiff = rank(b) - rank(a);
      if (rankDiff !== 0) return rankDiff;
      return b.food.kcal - a.food.kcal;
    });

    for (const item of orderedFoods) {
      const { food } = item;
      const limits = getFoodLimits(food);
      const step = food.role === "carb" ? Math.max(10, limits.step || 10) : Math.max(5, limits.step || 5);
      const next = clampPortion(food, food.grams - step, limits.min);
      if (next < food.grams) {
        food.grams = next;
        trimmed = true;
        break;
      }
    }

    if (!trimmed) break;
  }

  meals.forEach((meal) => {
    meal.foods = meal.foods.filter((food) => food.grams > 0);
  });
}

function generateDiet({
  targetKcal,
  protGrams,
  carbGrams,
  fatGrams,
  numMeals,
  mealDistribution,
  foods,
  favoriteIds,
  generationConfig,
}) {
  const previousConfig = runtimeConfig;
  runtimeConfig = resolveDietGenerationConfig(generationConfig);
  const favSet = new Set(favoriteIds || []);
  const labels = getMealLabels(numMeals);
  const allFoods = {
    proteins: foods.filter((food) => food.category === "protein"),
    carbs: foods.filter((food) => food.category === "carb"),
    fats: foods.filter((food) => food.category === "fat"),
  };

  const meals = [];
  const recentProteins = [];
  const recentSubGroups = [];

  try {
    for (let i = 0; i < numMeals; i++) {
      const label = labels[i];
      const dist = mealDistribution[i];
      const targets = {
        prot: (protGrams * dist.prot) / 100,
        carb: (carbGrams * dist.carb) / 100,
        fat: (fatGrams * dist.fat) / 100,
        kcal: Math.round(targetKcal * ((dist.prot + dist.carb + dist.fat) / 300)),
      };

      const pools = {
        proteins: foodsForMeal(allFoods.proteins, label),
        carbs: foodsForMeal(allFoods.carbs, label),
        fats: foodsForMeal(allFoods.fats, label),
      };

      let bestCandidate = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = buildMealCandidate({
          label,
          mealIndex: i,
          targets,
          pools,
          recentProteins,
          recentSubGroups,
          attempt,
          favSet,
        });

        if (!bestCandidate || candidate.penalty < bestCandidate.penalty) {
          bestCandidate = candidate;
        }
        if (candidate.validation.valid) break;
      }

      const mealFoods = bestCandidate ? bestCandidate.foods : [];
      meals.push({ number: i + 1, label, foods: mealFoods });

      const mealProtein = mealFoods.find((food) => food.role === "protein");
      if (mealProtein) {
        recentProteins.push(mealProtein.id);
        recentSubGroups.push(mealProtein.subGroup);
        if (recentProteins.length > 2) recentProteins.shift();
        if (recentSubGroups.length > 3) recentSubGroups.shift();
      }
    }

    let totalKcal = Math.round(meals.reduce((sum, meal) => sum + recalcMealTotal(meal), 0));
    diversifyDayMeals(meals, allFoods);

    totalKcal = Math.round(meals.reduce((sum, meal) => sum + recalcMealTotal(meal), 0));
    const ratio = targetKcal / Math.max(1, totalKcal);
    if (Math.abs(ratio - 1) > 0.04) {
      scaleMealFoods(meals, Math.max(0.9, Math.min(1.1, ratio)));
    }

    trimDayCalories(meals, targetKcal);
    totalKcal = Math.round(meals.reduce((sum, meal) => sum + recalcMealTotal(meal), 0));
    return { meals, targetKcal, actualKcal: totalKcal, dayValidation: validateDayStructure(meals) };
  } finally {
    runtimeConfig = previousConfig;
  }
}

module.exports = { generateDiet };
