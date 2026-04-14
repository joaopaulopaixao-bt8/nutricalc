function normalizeText(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const DEFAULT_DIET_GENERATION_CONFIG = {
  primaryProteinShare: {
    cafe: 0.75,
    lanche: 0.75,
    principal: 0.75,
  },
  preferredCarbGlycemicIndex: "all",
  foodLimitsByName: {
    "Leite desnatado": { min: 100, max: 400, step: 50 },
    "Ovo inteiro cozido": { min: 50, max: 200, step: 50 },
    "Clara de ovo": { min: 33, max: 200, step: 33 },
    "Gema de ovo": { min: 17, max: 68, step: 17 },
    "Whey protein (30g)": { min: 30, max: 60, step: 30 },
    "Caseína (30g)": { min: 30, max: 60, step: 30 },
    "Pão francês": { min: 50, max: 150, step: 50 },
  },
  subgroupLimits: {
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
  },
  defaultLimitsByCategory: {
    protein: { min: 30, max: 250, step: 5 },
    carb: { min: 30, max: 220, step: 10 },
    fat: { min: 5, max: 40, step: 5 },
  },
  mealRules: {
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
      primaryFatNames: ["Azeite de oliva", "Óleo de abacate", "Abacate"],
      preferredCarbSubGroups: ["arroz", "massa", "tuberculo", "cereal", "legume", "farinaceo"],
    },
  },
  unitPortions: {
    "Ovo inteiro cozido": 50,
    "Clara de ovo": 33,
    "Gema de ovo": 17,
    "Pão francês": 50,
    "Whey protein (30g)": 30,
    "Caseína (30g)": 30,
  },
};

function mergeLimitMap(baseMap, overrideMap = {}) {
  const merged = { ...baseMap };
  Object.entries(overrideMap).forEach(([key, value]) => {
    merged[key] = { ...(baseMap[key] || {}), ...value };
  });
  return merged;
}

function resolveDietGenerationConfig(overrides = {}) {
  const merged = {
    ...DEFAULT_DIET_GENERATION_CONFIG,
    ...overrides,
    primaryProteinShare: {
      ...DEFAULT_DIET_GENERATION_CONFIG.primaryProteinShare,
      ...(overrides.primaryProteinShare || {}),
    },
    foodLimitsByName: mergeLimitMap(
      DEFAULT_DIET_GENERATION_CONFIG.foodLimitsByName,
      overrides.foodLimitsByName
    ),
    subgroupLimits: mergeLimitMap(
      DEFAULT_DIET_GENERATION_CONFIG.subgroupLimits,
      overrides.subgroupLimits
    ),
    defaultLimitsByCategory: mergeLimitMap(
      DEFAULT_DIET_GENERATION_CONFIG.defaultLimitsByCategory,
      overrides.defaultLimitsByCategory
    ),
    mealRules: {
      ...DEFAULT_DIET_GENERATION_CONFIG.mealRules,
      ...(overrides.mealRules || {}),
    },
    unitPortions: {
      ...DEFAULT_DIET_GENERATION_CONFIG.unitPortions,
      ...(overrides.unitPortions || {}),
    },
  };

  return {
    ...merged,
    foodLimitsByNormalizedName: Object.fromEntries(
      Object.entries(merged.foodLimitsByName).map(([name, value]) => [normalizeText(name), value])
    ),
    unitPortionsByNormalizedName: Object.fromEntries(
      Object.entries(merged.unitPortions).map(([name, value]) => [normalizeText(name), value])
    ),
  };
}

module.exports = {
  DEFAULT_DIET_GENERATION_CONFIG,
  resolveDietGenerationConfig,
  normalizeText,
};
