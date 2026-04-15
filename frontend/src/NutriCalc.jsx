import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  calculateNavyBodyFat,
  createMyReport,
  calculateTDEE,
  createBodyMetric,
  deleteBodyMetric,
  deleteMyDiet,
  deleteMyReport,
  fetchMyReport,
  fetchMyReports,
  fetchMyDiets,
  fetchFoods,
  fetchBodyMetrics,
  fetchDietGenerationConfig,
  fetchCurrentUser,
  generateDiet as generateDietRequest,
  getDiet,
  loginUser,
  loginWithGoogle,
  logoutUser,
  requestPasswordReset,
  registerUser,
  resetPassword,
  updateBodyMetric,
  updateCurrentUser,
} from "./api.js";

// ============================================================
// TACO DB — Each food tagged with: mealTypes (cafe/lanche/principal), subGroup for coherent swaps
// ============================================================
const TACO = {
  protein: [
    { id:"p1", name:"Peito de frango grelhado", kcal:159, prot:32, carb:0, fat:3.2, mt:["principal"], sg:"ave_magra" },
    { id:"p2", name:"Coxa de frango s/ pele", kcal:163, prot:26, carb:0, fat:6.5, mt:["principal"], sg:"ave" },
    { id:"p3", name:"Peito de peru defumado", kcal:130, prot:21, carb:2.5, fat:3.8, mt:["cafe","lanche"], sg:"frio" },
    { id:"p4", name:"Patinho grelhado", kcal:219, prot:35.9, carb:0, fat:7.3, mt:["principal"], sg:"bovina_magra" },
    { id:"p5", name:"Maminha grelhada", kcal:212, prot:32.4, carb:0, fat:8.5, mt:["principal"], sg:"bovina" },
    { id:"p6", name:"Alcatra grelhada", kcal:235, prot:32, carb:0, fat:11, mt:["principal"], sg:"bovina" },
    { id:"p7", name:"Coxão mole grelhado", kcal:215, prot:32.4, carb:0, fat:8.9, mt:["principal"], sg:"bovina" },
    { id:"p8", name:"Músculo cozido", kcal:171, prot:26.8, carb:0, fat:6.7, mt:["principal"], sg:"bovina" },
    { id:"p9", name:"Lagarto grelhado", kcal:206, prot:33.4, carb:0, fat:7.5, mt:["principal"], sg:"bovina_magra" },
    { id:"p10", name:"Filé mignon grelhado", kcal:220, prot:32.8, carb:0, fat:9.5, mt:["principal"], sg:"bovina" },
    { id:"p11", name:"Lombo suíno assado", kcal:210, prot:30.2, carb:0, fat:9.8, mt:["principal"], sg:"suina" },
    { id:"p12", name:"Tilápia grelhada", kcal:124, prot:26.2, carb:0, fat:2, mt:["principal"], sg:"peixe_magro" },
    { id:"p13", name:"Salmão grelhado", kcal:208, prot:27.3, carb:0, fat:10.5, mt:["principal"], sg:"peixe_gordo" },
    { id:"p14", name:"Atum em conserva", kcal:166, prot:26.2, carb:0, fat:6.4, mt:["principal","lanche"], sg:"peixe" },
    { id:"p15", name:"Sardinha assada", kcal:164, prot:25, carb:0, fat:7, mt:["principal"], sg:"peixe" },
    { id:"p16", name:"Merluza cozida", kcal:89, prot:18.9, carb:0, fat:1.3, mt:["principal"], sg:"peixe_magro" },
    { id:"p17", name:"Camarão cozido", kcal:90, prot:18.4, carb:0, fat:1.5, mt:["principal"], sg:"frutos_mar" },
    { id:"p18", name:"Ovo inteiro cozido", kcal:146, prot:13.3, carb:0.6, fat:9.5, mt:["cafe","principal","lanche"], sg:"ovo" },
    { id:"p19", name:"Clara de ovo", kcal:44, prot:9.7, carb:0.8, fat:0, mt:["cafe","lanche"], sg:"ovo" },
    { id:"p20", name:"Queijo cottage", kcal:98, prot:11.5, carb:3.4, fat:4.3, mt:["cafe","lanche"], sg:"queijo_magro" },
    { id:"p21", name:"Queijo minas frescal", kcal:264, prot:17.4, carb:3.2, fat:20.2, mt:["cafe","lanche"], sg:"queijo" },
    { id:"p22", name:"Iogurte natural desnatado", kcal:42, prot:4.1, carb:5.6, fat:0.3, mt:["cafe","lanche"], sg:"laticinio" },
    { id:"p23", name:"Ricota fresca", kcal:140, prot:12.6, carb:3.5, fat:8.1, mt:["cafe","lanche"], sg:"queijo_magro" },
    { id:"p24", name:"Whey protein (30g)", kcal:120, prot:24, carb:3, fat:1.5, mt:["lanche","cafe"], sg:"suplemento" },
    { id:"p25", name:"Carne seca desfiada", kcal:230, prot:33.8, carb:0, fat:10.5, mt:["principal"], sg:"bovina" },
    { id:"p26", name:"Frango desfiado", kcal:163, prot:31.5, carb:0, fat:3.8, mt:["principal"], sg:"ave_magra" },
    { id:"p27", name:"Sobrecoxa s/ pele", kcal:183, prot:24.2, carb:0, fat:9.5, mt:["principal"], sg:"ave" },
    { id:"p28", name:"Pintado grelhado", kcal:118, prot:23.5, carb:0, fat:2.8, mt:["principal"], sg:"peixe_magro" },
    { id:"p29", name:"Carne moída magra", kcal:212, prot:26.7, carb:0, fat:11.5, mt:["principal"], sg:"bovina" },
    { id:"p30", name:"Peito de pato", kcal:201, prot:23.5, carb:0, fat:11.5, mt:["principal"], sg:"ave" },
    { id:"p31", name:"Coelho assado", kcal:173, prot:29, carb:0, fat:6, mt:["principal"], sg:"outra" },
    { id:"p32", name:"Linguiça de frango", kcal:169, prot:17.5, carb:2, fat:10, mt:["principal","cafe"], sg:"embutido" },
    { id:"p33", name:"Presunto magro", kcal:110, prot:16.5, carb:2, fat:4, mt:["cafe","lanche"], sg:"frio" },
    { id:"p34", name:"Blanquet de peru", kcal:118, prot:19.5, carb:2.8, fat:3.2, mt:["cafe","lanche"], sg:"frio" },
    { id:"p35", name:"Leite desnatado", kcal:35, prot:3.4, carb:5, fat:0.2, mt:["cafe","lanche"], sg:"laticinio" },
    { id:"p36", name:"Tofu firme", kcal:76, prot:8.1, carb:1.9, fat:4.8, mt:["principal","lanche"], sg:"vegetal" },
    { id:"p37", name:"Proteína de soja", kcal:330, prot:51, carb:21, fat:1, mt:["principal"], sg:"vegetal" },
    { id:"p38", name:"Grão-de-bico cozido", kcal:164, prot:8.9, carb:27.4, fat:2.6, mt:["principal"], sg:"leguminosa" },
    { id:"p39", name:"Lentilha cozida", kcal:93, prot:6.3, carb:16.3, fat:0.5, mt:["principal"], sg:"leguminosa" },
    { id:"p40", name:"Feijão preto cozido", kcal:77, prot:4.5, carb:14, fat:0.5, mt:["principal"], sg:"leguminosa" },
    { id:"p41", name:"Caseína (30g)", kcal:115, prot:23, carb:3.5, fat:1, mt:["lanche","cafe"], sg:"suplemento" },
    { id:"p42", name:"Acém cozido", kcal:198, prot:26, carb:0, fat:10.2, mt:["principal"], sg:"bovina" },
  ],
  carb: [
    { id:"c1", name:"Arroz branco cozido", kcal:128, prot:2.5, carb:28.1, fat:0.2, mt:["principal"], sg:"arroz" },
    { id:"c2", name:"Arroz integral cozido", kcal:124, prot:2.6, carb:25.8, fat:1, mt:["principal"], sg:"arroz" },
    { id:"c3", name:"Batata-doce cozida", kcal:77, prot:0.6, carb:18.4, fat:0.1, mt:["principal"], sg:"tuberculo" },
    { id:"c4", name:"Batata inglesa cozida", kcal:52, prot:1.2, carb:11.9, fat:0.1, mt:["principal"], sg:"tuberculo" },
    { id:"c5", name:"Mandioca cozida", kcal:125, prot:0.6, carb:30.1, fat:0.3, mt:["principal"], sg:"tuberculo" },
    { id:"c6", name:"Macarrão cozido", kcal:102, prot:3.4, carb:19.9, fat:0.5, mt:["principal"], sg:"massa" },
    { id:"c7", name:"Macarrão integral", kcal:111, prot:4.6, carb:21.8, fat:0.6, mt:["principal"], sg:"massa" },
    { id:"c8", name:"Pão francês", kcal:300, prot:8, carb:58.6, fat:3.1, mt:["cafe","lanche"], sg:"pao" },
    { id:"c9", name:"Pão integral", kcal:253, prot:9.4, carb:49.3, fat:2.9, mt:["cafe","lanche"], sg:"pao" },
    { id:"c10", name:"Aveia em flocos", kcal:394, prot:13.9, carb:66.6, fat:8.5, mt:["cafe","lanche"], sg:"cereal_cafe" },
    { id:"c11", name:"Banana prata", kcal:98, prot:1.3, carb:26, fat:0.1, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c12", name:"Banana da terra cozida", kcal:117, prot:0.7, carb:30.9, fat:0.2, mt:["principal"], sg:"tuberculo" },
    { id:"c13", name:"Manga", kcal:64, prot:0.4, carb:16.7, fat:0.3, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c14", name:"Maçã", kcal:56, prot:0.3, carb:15.2, fat:0, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c15", name:"Mamão papaia", kcal:40, prot:0.5, carb:10.4, fat:0.1, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c16", name:"Tapioca (goma)", kcal:342, prot:0.1, carb:84.8, fat:0.1, mt:["cafe","lanche"], sg:"tapioca" },
    { id:"c17", name:"Cuscuz de milho", kcal:113, prot:2.6, carb:23.3, fat:0.8, mt:["cafe","principal"], sg:"cereal" },
    { id:"c18", name:"Milho verde cozido", kcal:131, prot:3.6, carb:28.6, fat:0.8, mt:["principal"], sg:"cereal" },
    { id:"c19", name:"Inhame cozido", kcal:97, prot:2, carb:23.2, fat:0.1, mt:["principal"], sg:"tuberculo" },
    { id:"c20", name:"Quinoa cozida", kcal:120, prot:4.4, carb:21.3, fat:1.9, mt:["principal"], sg:"cereal" },
    { id:"c21", name:"Granola", kcal:421, prot:9.8, carb:65.2, fat:14.2, mt:["cafe","lanche"], sg:"cereal_cafe" },
    { id:"c22", name:"Mel", kcal:309, prot:0.3, carb:84, fat:0, mt:["cafe","lanche"], sg:"acucar" },
    { id:"c23", name:"Açaí polpa pura", kcal:58, prot:0.8, carb:6.2, fat:3.9, mt:["lanche"], sg:"fruta" },
    { id:"c24", name:"Farinha de mandioca", kcal:361, prot:1.6, carb:87.9, fat:0.3, mt:["principal"], sg:"farinaceo" },
    { id:"c25", name:"Abóbora cozida", kcal:28, prot:0.8, carb:7, fat:0, mt:["principal"], sg:"legume" },
    { id:"c26", name:"Beterraba cozida", kcal:32, prot:1.2, carb:7.2, fat:0, mt:["principal"], sg:"legume" },
    { id:"c27", name:"Cenoura crua", kcal:34, prot:1.3, carb:7.7, fat:0.2, mt:["principal"], sg:"legume" },
    { id:"c28", name:"Pão de queijo", kcal:363, prot:5.3, carb:34.2, fat:23.1, mt:["cafe","lanche"], sg:"pao" },
    { id:"c29", name:"Torrada integral", kcal:353, prot:12.5, carb:61.7, fat:6.8, mt:["cafe","lanche"], sg:"pao" },
    { id:"c30", name:"Pipoca (milho)", kcal:374, prot:11.8, carb:64.6, fat:5.6, mt:["lanche"], sg:"cereal_cafe" },
    { id:"c31", name:"Farinha de aveia", kcal:388, prot:15, carb:65, fat:7.5, mt:["cafe","lanche"], sg:"cereal_cafe" },
    { id:"c32", name:"Mingau de aveia", kcal:68, prot:2.4, carb:11.8, fat:1.5, mt:["cafe"], sg:"cereal_cafe" },
    { id:"c33", name:"Crepioca", kcal:190, prot:8.5, carb:20, fat:8, mt:["cafe","lanche"], sg:"tapioca" },
    { id:"c34", name:"Wrap integral", kcal:280, prot:8.2, carb:46, fat:6.5, mt:["lanche","principal"], sg:"pao" },
    { id:"c35", name:"Mandioquinha cozida", kcal:80, prot:0.9, carb:19.3, fat:0.2, mt:["principal"], sg:"tuberculo" },
    { id:"c36", name:"Uva", kcal:53, prot:0.7, carb:13.6, fat:0.2, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c37", name:"Melancia", kcal:33, prot:0.9, carb:8.1, fat:0, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c38", name:"Abacaxi", kcal:48, prot:0.9, carb:12.3, fat:0.1, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c39", name:"Morango", kcal:30, prot:0.9, carb:6.8, fat:0.3, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c40", name:"Laranja", kcal:37, prot:1, carb:8.9, fat:0.1, mt:["cafe","lanche","jantar_adj"], sg:"fruta" },
    { id:"c41", name:"Polenta", kcal:68, prot:1.5, carb:14.3, fat:0.5, mt:["principal"], sg:"cereal" },
    { id:"c42", name:"Macarrão de arroz", kcal:109, prot:0.9, carb:25, fat:0.2, mt:["principal"], sg:"massa" },
  ],
  fat: [
    { id:"f1", name:"Azeite de oliva", kcal:884, prot:0, carb:0, fat:100, mt:["principal","cafe","lanche"], sg:"oleo" },
    { id:"f2", name:"Óleo de coco", kcal:862, prot:0, carb:0, fat:100, mt:["cafe","principal"], sg:"oleo" },
    { id:"f3", name:"Manteiga s/ sal", kcal:726, prot:0.8, carb:0.1, fat:82.4, mt:["cafe"], sg:"manteiga" },
    { id:"f4", name:"Pasta de amendoim", kcal:594, prot:25.3, carb:17.6, fat:49.4, mt:["cafe","lanche"], sg:"oleaginosa_pasta" },
    { id:"f5", name:"Castanha-do-pará", kcal:643, prot:14.5, carb:12.3, fat:63.5, mt:["lanche","cafe"], sg:"oleaginosa" },
    { id:"f6", name:"Castanha de caju", kcal:570, prot:18.5, carb:29.1, fat:46.3, mt:["lanche","cafe"], sg:"oleaginosa" },
    { id:"f7", name:"Amendoim torrado", kcal:589, prot:27.2, carb:12.5, fat:49.2, mt:["lanche"], sg:"oleaginosa" },
    { id:"f8", name:"Nozes", kcal:620, prot:14, carb:18.4, fat:59.4, mt:["lanche","cafe"], sg:"oleaginosa" },
    { id:"f9", name:"Amêndoas", kcal:581, prot:18.6, carb:29.5, fat:47.3, mt:["lanche","cafe"], sg:"oleaginosa" },
    { id:"f10", name:"Abacate", kcal:96, prot:1.2, carb:6, fat:8.4, mt:["cafe","lanche","principal"], sg:"fruta_gord" },
    { id:"f11", name:"Creme de leite", kcal:202, prot:2.4, carb:3.7, fat:20.2, mt:["principal"], sg:"laticinio_gord" },
    { id:"f12", name:"Queijo parmesão", kcal:453, prot:35.6, carb:1.7, fat:33.5, mt:["principal"], sg:"queijo_gord" },
    { id:"f13", name:"Queijo muçarela", kcal:330, prot:22.6, carb:3, fat:25.2, mt:["cafe","principal"], sg:"queijo_gord" },
    { id:"f14", name:"Chocolate amargo 70%", kcal:528, prot:6, carb:42, fat:38, mt:["lanche"], sg:"outro" },
    { id:"f15", name:"Coco ralado seco", kcal:592, prot:5.7, carb:26.4, fat:54.7, mt:["cafe","lanche"], sg:"coco" },
    { id:"f16", name:"Linhaça", kcal:495, prot:14.1, carb:43.3, fat:32.3, mt:["cafe","lanche"], sg:"semente" },
    { id:"f17", name:"Chia", kcal:486, prot:16.5, carb:42.1, fat:30.7, mt:["cafe","lanche"], sg:"semente" },
    { id:"f18", name:"Semente de girassol", kcal:570, prot:20.8, carb:20, fat:49.8, mt:["lanche"], sg:"semente" },
    { id:"f19", name:"Azeite de dendê", kcal:884, prot:0, carb:0, fat:100, mt:["principal"], sg:"oleo" },
    { id:"f20", name:"Tahine (gergelim)", kcal:595, prot:17, carb:21.2, fat:53.8, mt:["lanche","cafe"], sg:"semente" },
    { id:"f21", name:"Requeijão cremoso", kcal:257, prot:7.5, carb:2.4, fat:24.5, mt:["cafe","lanche"], sg:"laticinio_gord" },
    { id:"f22", name:"Azeitona preta", kcal:140, prot:1, carb:4.8, fat:13, mt:["principal"], sg:"outro" },
    { id:"f23", name:"Macadâmia", kcal:718, prot:7.9, carb:13.8, fat:75.8, mt:["lanche"], sg:"oleaginosa" },
    { id:"f24", name:"Pistache torrado", kcal:562, prot:20.2, carb:27.2, fat:45.3, mt:["lanche"], sg:"oleaginosa" },
    { id:"f25", name:"Leite de coco", kcal:197, prot:1.4, carb:3.1, fat:21.3, mt:["principal","cafe"], sg:"coco" },
    { id:"f26", name:"Manteiga de cacau", kcal:884, prot:0, carb:0, fat:100, mt:["cafe"], sg:"manteiga" },
    { id:"f27", name:"Cream cheese", kcal:342, prot:6.2, carb:3.5, fat:34.2, mt:["cafe","lanche"], sg:"laticinio_gord" },
    { id:"f28", name:"Ghee", kcal:900, prot:0, carb:0, fat:99.8, mt:["cafe","principal"], sg:"manteiga" },
    { id:"f29", name:"Gordura de coco", kcal:862, prot:0, carb:0, fat:100, mt:["cafe","principal"], sg:"oleo" },
    { id:"f30", name:"Avelã", kcal:646, prot:15, carb:16.7, fat:60.8, mt:["lanche","cafe"], sg:"oleaginosa" },
    { id:"f31", name:"Semente de abóbora", kcal:446, prot:30.2, carb:10.7, fat:35.4, mt:["lanche"], sg:"semente" },
    { id:"f32", name:"Queijo provolone", kcal:351, prot:25.6, carb:2.1, fat:26.6, mt:["cafe","principal"], sg:"queijo_gord" },
    { id:"f33", name:"Gema de ovo", kcal:352, prot:16.1, carb:1.6, fat:31.9, mt:["cafe"], sg:"ovo" },
    { id:"f34", name:"Queijo brie", kcal:334, prot:20.8, carb:0.5, fat:27.7, mt:["cafe","lanche"], sg:"queijo_gord" },
    { id:"f35", name:"Bacon", kcal:541, prot:37, carb:0.1, fat:42, mt:["cafe","principal"], sg:"suina" },
    { id:"f36", name:"Mix de nuts", kcal:607, prot:17, carb:20, fat:52, mt:["lanche"], sg:"oleaginosa" },
    { id:"f37", name:"Óleo de abacate", kcal:884, prot:0, carb:0, fat:100, mt:["principal"], sg:"oleo" },
    { id:"f38", name:"Queijo coalho", kcal:320, prot:21.5, carb:2, fat:25, mt:["cafe","principal"], sg:"queijo_gord" },
    { id:"f39", name:"Manteiga de amendoim", kcal:588, prot:25, carb:20, fat:50, mt:["cafe","lanche"], sg:"oleaginosa_pasta" },
    { id:"f40", name:"Coco fresco", kcal:354, prot:3.3, carb:15.2, fat:33.5, mt:["lanche"], sg:"coco" },
  ],
};

const ACT = [
  { label:"Sedentário", desc:"Pouco exercício", factor:1.2 },
  { label:"Leve", desc:"1-3x/semana", factor:1.375 },
  { label:"Moderado", desc:"3-5x/semana", factor:1.55 },
  { label:"Intenso", desc:"6-7x/semana", factor:1.725 },
  { label:"Muito intenso", desc:"2x/dia ou pesado", factor:1.9 },
];

const FAV_LIM = { protein:2, carb:3, fat:1 };

const MACRO_PRESETS = [
  { key: "balanced", label: "Dieta equilibrada", values: { p: 2.0, c: 3.0, f: 0.8 } },
  { key: "recomp", label: "Recomposição", values: { p: 2.2, c: 2.5, f: 0.8 } },
  { key: "cut", label: "Emagrecimento", values: { p: 2.4, c: 1.8, f: 0.7 } },
  { key: "gain", label: "Hipertrofia", values: { p: 2.0, c: 4.2, f: 0.8 } },
  { key: "lowcarb", label: "Low carb", values: { p: 2.2, c: 1.2, f: 1.0 } },
];

const MEAL_SHARE_TEMPLATES = {
  3: [30, 40, 30],
  4: [25, 35, 15, 25],
  5: [20, 10, 30, 15, 25],
  6: [18, 10, 27, 12, 23, 10],
};

const DEFAULT_GENERATION_CONFIG = {
  primaryProteinShare: { cafe: 0.75, lanche: 0.75, principal: 0.75 },
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
    bovina_magra: { min: 100, max: 250, step: 5 },
    peixe_magro: { min: 100, max: 250, step: 5 },
  },
};

const ROLE_LABELS = {
  core: "Principal",
  flex: "Flex",
  accessory: "Acessório",
};

const PUBLIC_PAGES = new Set(["landing", "auth", "privacy", "terms", "methodology"]);

function getPublicPageFromHash() {
  if (typeof window === "undefined") return "landing";

  const normalized = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
  if (!normalized) return "landing";
  if (normalized === "entrar" || normalized === "login" || normalized === "cadastro") return "auth";
  if (normalized === "privacidade") return "privacy";
  if (normalized === "termos") return "terms";
  if (normalized === "metodologia" || normalized === "fontes") return "methodology";
  return "landing";
}

function getHashForPublicPage(page) {
  switch (page) {
    case "auth":
      return "#/entrar";
    case "privacy":
      return "#/privacidade";
    case "terms":
      return "#/termos";
    case "methodology":
      return "#/metodologia";
    default:
      return "#/";
  }
}

function buildUniformMealDistribution(shares) {
  return shares.map(share => ({ prot: share, carb: share, fat: share }));
}

function normalizeShares(shares) {
  const total = shares.reduce((sum, share) => sum + share, 0);
  if (total === 100) return shares;
  const scaled = shares.map(share => Math.max(0, Math.round((share / Math.max(total, 1)) * 100)));
  let diff = 100 - scaled.reduce((sum, share) => sum + share, 0);
  let index = 0;
  while (diff !== 0 && scaled.length > 0) {
    const current = index % scaled.length;
    if (diff > 0) {
      scaled[current] += 1;
      diff -= 1;
    } else if (scaled[current] > 0) {
      scaled[current] -= 1;
      diff += 1;
    }
    index += 1;
  }
  return scaled;
}

function rebalanceMealShares(currentShares, changedIndex, nextValue) {
  const shares = [...currentShares];
  const clamped = Math.max(0, Math.min(100, nextValue));
  const oldValue = shares[changedIndex];
  shares[changedIndex] = clamped;
  let diff = 100 - shares.reduce((sum, share) => sum + share, 0);
  const otherIndexes = shares.map((_, index) => index).filter(index => index !== changedIndex);

  if (otherIndexes.length === 0) return [100];

  if (diff === 0) return shares;

  if (diff > 0) {
    while (diff > 0) {
      let moved = false;
      for (const index of otherIndexes) {
        shares[index] += 1;
        diff -= 1;
        moved = true;
        if (diff === 0) break;
      }
      if (!moved) break;
    }
    return shares;
  }

  diff = Math.abs(diff);
  while (diff > 0) {
    let moved = false;
    const sortedIndexes = [...otherIndexes].sort((a, b) => shares[b] - shares[a]);
    for (const index of sortedIndexes) {
      if (shares[index] <= 0) continue;
      shares[index] -= 1;
      diff -= 1;
      moved = true;
      if (diff === 0) break;
    }
    if (!moved) {
      shares[changedIndex] = Math.max(0, shares[changedIndex] - diff);
      diff = 0;
    }
  }

  if (shares[changedIndex] !== clamped && oldValue !== clamped) {
    return normalizeShares(shares);
  }

  return shares;
}

function normalizeFoods(category, foods) {
  return foods.map(food => ({
    ...food,
    cat: category,
    mt: food.mealTypes || food.mt || [],
    sg: food.subGroup || food.sg,
    glycemicIndexLevel: food.glycemicIndexLevel || null,
    planningRole: food.planningRole || "core",
  }));
}

function normalizeDietResult(apiDiet, subLists) {
  return {
    ...apiDiet,
    meals: (apiDiet.meals || []).map(meal => ({
      num: meal.number,
      label: meal.label,
      foods: (meal.foods || []).map(food => ({
        ...food,
        isFav: food.isFavorite,
        subs: food.substitutions || [],
      })),
    })),
    subLists,
  };
}

function normalizeStoredDietResult(savedDiet, subLists) {
  return normalizeDietResult(
    {
      ...(savedDiet.generatedPlan || {}),
      dietId: savedDiet.id,
      createdAt: savedDiet.createdAt,
      targetKcal: savedDiet.targetKcal ?? savedDiet.generatedPlan?.targetKcal,
      objective: savedDiet.objective ?? savedDiet.generatedPlan?.objective,
      objectivePct: savedDiet.objectivePct ?? savedDiet.generatedPlan?.objectivePct,
      snapshot: {
        weight: savedDiet.snapshotWeight ?? null,
        height: savedDiet.snapshotHeight ?? null,
        age: savedDiet.snapshotAge ?? null,
        bodyFatPercentage: savedDiet.snapshotBodyFatPercentage ?? null,
      },
    },
    subLists,
  );
}

const UNIT_LABELS = {
  "Ovo inteiro cozido": { unit: "un", gramsPerUnit: 50 },
  "Clara de ovo": { unit: "un", gramsPerUnit: 33 },
  "Pão francês": { unit: "un", gramsPerUnit: 50 },
};

function formatPortion(name, grams) {
  const rule = UNIT_LABELS[name];
  if (!rule) return `${grams}g`;

  const units = Math.max(1, Math.round(grams / rule.gramsPerUnit));
  const label = units === 1 ? rule.unit : rule.unit;
  return `${units} ${label} (${grams}g)`;
}

function formatMetricValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "—";
  const formatted = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
  return `${formatted}${suffix}`;
}

function formatAuditDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

function formatMetricSource(source) {
  if (source === "navy_formula") return "Estimativa Navy";
  if (source === "professional_assessment") return "Avaliação profissional";
  return "Registro manual";
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  const baseUrl = (() => {
    if (typeof window !== "undefined") {
      const { hostname } = window.location;
      const isLocalHost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.");
      if (!isLocalHost) {
        return "";
      }
    }
    return import.meta.env.VITE_API_URL || "";
  })();
  if (baseUrl) {
    return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
  }
  if (typeof window !== "undefined" && /^\/uploads\//.test(value)) {
    const { protocol, hostname, port } = window.location;
    if (port === "5173") {
      return `${protocol}//${hostname}:3001${value}`;
    }
  }
  return value;
}

function getAgeFromBirthDate(value) {
  if (!value) return "";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "";
}

function getThemeVars() {
  return {
    "--app-bg": "linear-gradient(145deg,#0a0e1a 0%,#0f172a 40%,#0c1220 100%)",
    "--app-text": "#e2e8f0",
    "--field-bg": "rgba(255,255,255,0.05)",
    "--field-bg-solid": "#172033",
    "--field-fg": "#e2e8f0",
    "--field-border": "rgba(255,255,255,0.1)",
    "--field-placeholder": "#64748b",
    "--btn-bg": "transparent",
    "--btn-border": "rgba(255,255,255,0.1)",
    "--btn-fg": "#cbd5e1",
    "--btn-primary-fg": "#0f172a",
    "--btn-primary-bg": "linear-gradient(135deg,#84cc16,#65a30d)",
  };
}

function computeMetricTrend(metrics, key) {
  const sorted = [...metrics]
    .filter((metric) => metric[key] !== null && metric[key] !== undefined)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  if (sorted.length === 0) {
    return { points: [], firstValue: null, lastValue: null, delta: null };
  }

  const values = sorted.map((metric) => Number(metric[key]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const width = 320;
  const height = 130;
  const points = sorted.map((metric, index) => {
    const x = sorted.length === 1 ? width / 2 : (index / (sorted.length - 1)) * width;
    const y = height - ((Number(metric[key]) - min) / range) * height;
    return {
      id: metric.id,
      x,
      y,
      label: new Date(metric.recordedAt).toLocaleDateString("pt-BR"),
      value: Number(metric[key]),
    };
  });

  return {
    points,
    firstValue: values[0],
    lastValue: values[values.length - 1],
    delta: values.length >= 2 ? values[values.length - 1] - values[0] : 0,
  };
}

function buildReportHtml({
  activityLabel,
  actualTotals,
  diet,
  macrosPerKg,
  objective,
  objectivePct,
  tdee,
  targetKcal,
  targetMacros,
  userData,
  userName,
}) {
  const mealsHtml = (diet.meals || []).map((meal) => {
    const mealTotals = meal.foods.reduce((acc, food) => {
      const ratio = food.grams / 100;
      return {
        kcal: acc.kcal + Math.round(food.kcal * ratio),
        prot: acc.prot + food.prot * ratio,
        carb: acc.carb + food.carb * ratio,
        fat: acc.fat + food.fat * ratio,
      };
    }, { kcal: 0, prot: 0, carb: 0, fat: 0 });

    const rows = meal.foods.map((food) => {
      const substitutions = (food.subs || []).map((sub) => `
        <tr style="background:#f0fdf4;font-size:11px;color:#666">
          <td style="padding:4px 12px;border:1px solid #e5e7eb">↻ ${sub.name}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center">${formatPortion(sub.name, sub.grams)}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center">${(sub.prot * sub.grams / 100).toFixed(1)}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center">${(sub.carb * sub.grams / 100).toFixed(1)}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center">${(sub.fat * sub.grams / 100).toFixed(1)}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center">${Math.round(sub.kcal * sub.grams / 100)}</td>
        </tr>
      `).join("");

      return `
        <tr>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:500">${food.isFav ? "★ " : ""}${food.name}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;font-weight:600">${formatPortion(food.name, food.grams)}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${(food.prot * food.grams / 100).toFixed(1)}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${(food.carb * food.grams / 100).toFixed(1)}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${(food.fat * food.grams / 100).toFixed(1)}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;font-weight:600">${Math.round(food.kcal * food.grams / 100)}</td>
        </tr>
        ${substitutions}
      `;
    }).join("");

    return `
      <div style="margin-bottom:20px">
        <h3 style="color:#166534;margin:0 0 8px;font-size:15px">${meal.label}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#166534;color:white">
              <th style="padding:6px 12px;text-align:left">Alimento</th>
              <th style="padding:6px 8px;width:60px">Qtde</th>
              <th style="padding:6px 8px;width:50px">Prot</th>
              <th style="padding:6px 8px;width:50px">Carb</th>
              <th style="padding:6px 8px;width:50px">Gord</th>
              <th style="padding:6px 8px;width:50px">Kcal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background:#f0fdf4;font-weight:700">
              <td style="padding:6px 12px;border:1px solid #e5e7eb">Total</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center"></td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${mealTotals.prot.toFixed(1)}g</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${mealTotals.carb.toFixed(1)}g</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${mealTotals.fat.toFixed(1)}g</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${mealTotals.kcal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Plano Alimentar - ${userName || "NutriCalc"}</title><style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;color:#1e293b;padding:40px;max-width:800px;margin:0 auto}h1{font-size:28px;color:#166534;margin-bottom:4px}h2{font-size:18px;color:#166534;margin:24px 0 12px;border-bottom:2px solid #84cc16;padding-bottom:4px}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #84cc16}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}.meta-item{background:#f0fdf4;padding:10px 14px;border-radius:8px;border-left:3px solid #84cc16}.meta-item strong{color:#166534}.summary-box{display:flex;gap:12px;margin:16px 0;justify-content:center;flex-wrap:wrap}.summary-card{background:#166534;color:white;padding:12px 20px;border-radius:10px;text-align:center;min-width:100px}.summary-card .val{font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace}.summary-card .lbl{font-size:10px;opacity:0.8;letter-spacing:0.1em}.toolbar{display:flex;justify-content:center;gap:12px;margin:0 0 24px}.toolbar button{padding:10px 16px;border-radius:10px;border:none;background:#166534;color:#fff;font-weight:700;cursor:pointer}.toolbar button.secondary{background:#e2e8f0;color:#0f172a}@media print{body{padding:20px}.toolbar{display:none}}</style></head><body>
  <div class="toolbar"><button onclick="window.print()">Salvar como PDF / Imprimir</button><button class="secondary" onclick="window.close()">Fechar</button></div>
  <div class="header"><h1>Plano Alimentar</h1><p style="color:#64748b;font-size:14px">Gerado por NutriCalc — Baseado em evidências</p>${userName ? `<p style="margin-top:8px;font-size:18px;font-weight:700;color:#166534">${userName}</p>` : ""}</div>
  <h2>Dados do cálculo</h2>
  <div class="meta"><div class="meta-item"><strong>Peso:</strong> ${userData.weight || "—"}kg</div><div class="meta-item"><strong>Altura:</strong> ${userData.height || "—"}cm</div><div class="meta-item"><strong>Idade:</strong> ${userData.age || "—"} anos</div><div class="meta-item"><strong>Sexo:</strong> ${userData.sex === "M" ? "Masculino" : userData.sex === "F" ? "Feminino" : "—"}</div><div class="meta-item"><strong>Atividade:</strong> ${activityLabel || "—"}</div><div class="meta-item"><strong>Objetivo:</strong> ${objective === "cutting" ? `Cutting ${objectivePct}%` : objective === "bulk" ? `Bulking +${objectivePct}%` : "Manutenção"}</div></div>
  <h2>Metas nutricionais</h2>
  <div class="summary-box"><div class="summary-card"><div class="lbl">TDEE</div><div class="val">${tdee || "—"}</div></div><div class="summary-card" style="background:#ef4444"><div class="lbl">META KCAL</div><div class="val">${targetKcal}</div></div><div class="summary-card" style="background:#dc2626"><div class="lbl">PROTEÍNA</div><div class="val">${targetMacros.protGrams}g</div></div><div class="summary-card" style="background:#d97706"><div class="lbl">CARBOIDRATO</div><div class="val">${targetMacros.carbGrams}g</div></div><div class="summary-card" style="background:#2563eb"><div class="lbl">GORDURA</div><div class="val">${targetMacros.fatGrams}g</div></div></div>
  <p style="margin:8px 0 4px;font-size:12px;color:#64748b">Macros: Proteína ${macrosPerKg.p}g/kg · Carboidrato ${macrosPerKg.c}g/kg · Gordura ${macrosPerKg.f}g/kg</p>
  <h2>Plano alimentar — ${(diet.meals || []).length} refeições</h2>
  <p style="font-size:12px;color:#64748b;margin-bottom:16px">Linhas verdes (↻) são substituições equivalentes. ★ = alimento favorito priorizado.</p>
  ${mealsHtml}
  <h2>Resumo do dia</h2>
  <div class="summary-box"><div class="summary-card" style="background:#dc2626"><div class="lbl">PROTEÍNA</div><div class="val">${Math.round(actualTotals.prot)}g</div></div><div class="summary-card" style="background:#d97706"><div class="lbl">CARBOIDRATO</div><div class="val">${Math.round(actualTotals.carb)}g</div></div><div class="summary-card" style="background:#2563eb"><div class="lbl">GORDURA</div><div class="val">${Math.round(actualTotals.fat)}g</div></div><div class="summary-card"><div class="lbl">TOTAL KCAL</div><div class="val">${actualTotals.kcal}</div></div></div>
  <div style="margin-top:20px;padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;font-size:12px;color:#166534"><strong>Diferença da meta:</strong> ${Math.abs(actualTotals.kcal - targetKcal)} kcal (${((Math.abs(actualTotals.kcal - targetKcal) / Math.max(targetKcal, 1)) * 100).toFixed(1)}%)</div>
  <h2>Decisões do planejamento</h2>
  <ul style="font-size:13px;color:#475569;line-height:1.8;padding-left:20px">
  <li>Fórmula: Mifflin-St Jeor (maior validação científica)</li>
  <li>Café da manhã: priorizou ovos, pães, laticínios, frutas</li>
  <li>Lanches: alimentos leves e práticos (frutas, whey, iogurte)</li>
  <li>Almoço: refeição completa sem frutas</li>
  <li>Jantar: refeição completa, frutas apenas se necessário para ajuste de carbs</li>
  <li>Substituições: mesma categoria alimentar e mesmo papel por refeição</li>
  <li>Cálculo cruzado: gordura de proteínas e carboidratos descontada do total</li>
  <li>Ajuste iterativo: porções refinadas para atingir meta calórica</li>
  </ul></body></html>`;
}

function openReportWindow(reportHtml) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  printWindow.document.write(reportHtml);
  printWindow.document.close();
  return true;
}

// Meal type mapping
function getMealType(mealLabel) {
  const l = mealLabel.toLowerCase();
  if (l.includes("café")) return "cafe";
  if (l.includes("lanche") || l.includes("ceia")) return "lanche";
  return "principal"; // almoço, jantar
}

function getMealLabels(n) {
  return { 3:["Café da manhã","Almoço","Jantar"], 4:["Café da manhã","Almoço","Jantar","Lanche da tarde"], 5:["Café da manhã","Lanche da manhã","Almoço","Lanche da tarde","Jantar"], 6:["Café da manhã","Lanche da manhã","Almoço","Lanche da tarde","Jantar","Ceia"] }[n] || Array.from({length:n},(_,i)=>`Refeição ${i+1}`);
}

function isJantar(label) { return label.toLowerCase().includes("jantar"); }
function isAlmoco(label) { return label.toLowerCase().includes("almoço"); }

// Filter foods compatible with meal type
function foodsForMeal(foods, mealLabel) {
  const type = getMealType(mealLabel);
  const jan = isJantar(mealLabel);
  return foods.filter(f => {
    if (!f.mt || !Array.isArray(f.mt)) return true; // fallback: allow if no mt
    if (f.mt.includes(type)) return true;
    if (jan && f.mt.includes("jantar_adj")) return true;
    return false;
  });
}

// Coherent substitutions: same subGroup first, then same mealType
function coherentSubs(food, allFoods, mealLabel, n=3) {
  if (!food) return [];
  const compatible = foodsForMeal(allFoods, mealLabel).filter(f => f.id !== food.id);
  const sameSg = compatible.filter(f => f.sg === food.sg);
  const diffSg = compatible.filter(f => f.sg !== food.sg);
  return [...sameSg, ...diffSg].slice(0, n);
}

// ============================================================
// SMART DIET GENERATION
// ============================================================
function generateDiet(params) {
  const { targetKcal, protGrams, carbGrams, fatGrams, meals, mealDistribution, selectedFoods, favoriteIds } = params;
  const favSet = new Set(favoriteIds || []);
  const mealLabels = getMealLabels(meals);

  const sortFavs = (foods) => {
    const f = foods.filter(x => favSet.has(x.id));
    const r = foods.filter(x => !favSet.has(x.id)).sort(() => Math.random() - 0.5);
    return [...f, ...r];
  };

  const allProt = selectedFoods.filter(f => f.cat === "protein");
  const allCarb = selectedFoods.filter(f => f.cat === "carb");
  const allFat = selectedFoods.filter(f => f.cat === "fat");

  const result = [];

  for (let i = 0; i < meals; i++) {
    const label = mealLabels[i];
    const dist = mealDistribution[i];
    const mPT = (protGrams * dist.prot) / 100;
    const mCT = (carbGrams * dist.carb) / 100;
    const mFT = (fatGrams * dist.fat) / 100;

    // Filter foods for this meal type
    const protPool = sortFavs(foodsForMeal(allProt, label));
    const carbPool = sortFavs(foodsForMeal(allCarb, label));
    const fatPool = sortFavs(foodsForMeal(allFat, label));

    // Almoço: exclude fruits from carbs
    const carbPoolFiltered = isAlmoco(label) ? carbPool.filter(f => f.sg !== "fruta") : carbPool;

    const mainP = protPool.length > 0 ? protPool[i % protPool.length] : null;
    const nCS = Math.min(2, carbPoolFiltered.length);
    const mainCs = []; for (let ci = 0; ci < nCS; ci++) mainCs.push(carbPoolFiltered[(i*2+ci) % carbPoolFiltered.length]);
    const mainF = fatPool.length > 0 ? fatPool[i % fatPool.length] : null;

    // Cross-macro calculation
    let pG = mainP && mainP.prot > 0 ? Math.round((mPT / mainP.prot) * 100) : 0;
    const fatFP = mainP ? mainP.fat * pG / 100 : 0;
    const carbFP = mainP ? mainP.carb * pG / 100 : 0;

    const remC = Math.max(0, mCT - carbFP);
    const cPS = remC / Math.max(1, nCS);
    let cGs = []; let fatFC = 0;
    mainCs.forEach(mc => {
      const g = mc && mc.carb > 0 ? Math.round((cPS / mc.carb) * 100) : 0;
      cGs.push(g);
      fatFC += mc ? mc.fat * g / 100 : 0;
    });

    const remF = Math.max(0, mFT - fatFP - fatFC);
    let fG = mainF && mainF.fat > 0 ? Math.round((remF / mainF.fat) * 100) : 0;

    // Iterative adjustment
    const mKcal = () => {
      let t = 0;
      if (mainP) t += mainP.kcal * pG / 100;
      mainCs.forEach((mc, ci) => { if (mc) t += mc.kcal * (cGs[ci]||0) / 100; });
      if (mainF) t += mainF.kcal * fG / 100;
      return Math.round(t);
    };

    for (let it = 0; it < 5; it++) {
      const actual = mKcal();
      const tgt = Math.round(targetKcal * ((dist.prot + dist.carb + dist.fat) / 300));
      const diff = actual - tgt;
      if (Math.abs(diff) <= 15) break;
      if (cGs.length > 0 && mainCs[0] && mainCs[0].kcal > 0) {
        cGs[0] = Math.max(10, cGs[0] - Math.round((diff * 0.6 / mainCs[0].kcal) * 100));
      }
      if (mainF && mainF.kcal > 0 && Math.abs(diff) > 30) {
        fG = Math.max(2, fG - Math.round((diff * 0.3 / mainF.kcal) * 100));
      }
    }

    const bSubs = (food, grams, cat) => {
      const pool = cat === "protein" ? allProt : cat === "carb" ? allCarb : allFat;
      const macro = cat === "protein" ? "prot" : cat === "carb" ? "carb" : "fat";
      const tgM = food[macro] * grams / 100;
      return coherentSubs(food, pool, label).map(s => ({
        ...s, grams: s[macro] > 0 ? Math.round((tgM / s[macro]) * 100) : grams,
      }));
    };

    const foods = [];
    if (mainP) foods.push({ ...mainP, grams: Math.max(10, pG), role: "protein", isFav: favSet.has(mainP.id), subs: bSubs(mainP, pG, "protein") });
    mainCs.forEach((mc, ci) => { if (mc) foods.push({ ...mc, grams: Math.max(10, cGs[ci]||0), role: "carb", isFav: favSet.has(mc.id), subs: bSubs(mc, cGs[ci]||0, "carb") }); });
    if (mainF) foods.push({ ...mainF, grams: Math.max(2, fG), role: "fat", isFav: favSet.has(mainF.id), subs: bSubs(mainF, fG, "fat") });

    result.push({ num: i+1, label, foods });
  }

  // Final proportional scaling
  let tot = 0;
  result.forEach(m => m.foods.forEach(f => { tot += f.kcal * f.grams / 100; }));
  tot = Math.round(tot);
  if (tot > 0) {
    const r = targetKcal / tot;
    if (Math.abs(r - 1) > 0.03) {
      result.forEach(m => m.foods.forEach(f => {
        f.grams = Math.max(5, Math.round(f.grams * r));
        if (f.subs) f.subs.forEach(s => { s.grams = Math.max(5, Math.round(s.grams * r)); });
      }));
    }
  }

  return { meals: result, subLists: { protein: allProt, carb: allCarb, fat: allFat } };
}

// ============================================================
// MAIN APP
// ============================================================
export default function NutriCalc() {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authBootstrapLoading, setAuthBootstrapLoading] = useState(true);
  const [publicPage, setPublicPage] = useState(() => getPublicPageFromHash());
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    resetEmail: "",
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [bodyMetrics, setBodyMetrics] = useState([]);
  const [bodyMetricsPeriod, setBodyMetricsPeriod] = useState(90);
  const [bodyMetricsLoading, setBodyMetricsLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [userDiets, setUserDiets] = useState([]);
  const [userDietsLoading, setUserDietsLoading] = useState(false);
  const [userDietsError, setUserDietsError] = useState("");
  const [userReports, setUserReports] = useState([]);
  const [userReportsLoading, setUserReportsLoading] = useState(false);
  const [userReportsError, setUserReportsError] = useState("");
  const [dietHistoryFilters, setDietHistoryFilters] = useState({
    objective: "all",
    numMeals: "all",
    targetKcalMax: "",
    days: 90,
  });
  const [reportHistoryFilters, setReportHistoryFilters] = useState({
    objective: "all",
    days: 90,
  });
  const [bodyMetricError, setBodyMetricError] = useState("");
  const [bodyMetricNotice, setBodyMetricNotice] = useState("");
  const [editingBodyMetricId, setEditingBodyMetricId] = useState("");
  const [bodyFatCalcOpen, setBodyFatCalcOpen] = useState(false);
  const [bodyFatCalcLoading, setBodyFatCalcLoading] = useState(false);
  const [bodyFatCalcError, setBodyFatCalcError] = useState("");
  const [bodyFatCalcResult, setBodyFatCalcResult] = useState(null);
  const [bodyFatCalcForm, setBodyFatCalcForm] = useState({
    sex: "",
    height: "",
    neck: "",
    waist: "",
    hip: "",
  });
  const [bodyMetricForm, setBodyMetricForm] = useState({
    weight: "",
    height: "",
    age: "",
    bodyFatPercentage: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    sex: "",
    birthDate: "",
    avatarDataUrl: "",
  });
  const [ud, setUd] = useState({ weight:"", height:"", age:"", sex:"M", al:2 });
  const [obj, setObj] = useState("maintenance");
  const [objPct, setObjPct] = useState(0);
  const [mc, setMc] = useState({ p:2.0, c:3.0, f:0.8 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("prioridades");
  const [generationConfig, setGenerationConfig] = useState(DEFAULT_GENERATION_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [selIds, setSelIds] = useState(new Set());
  const [favIds, setFavIds] = useState(new Set());
  const [nMeals, setNMeals] = useState(4);
  const [mealShares, setMealShares] = useState(MEAL_SHARE_TEMPLATES[4]);
  const [mDist, setMDist] = useState([]);
  const [diet, setDiet] = useState(null);
  const [expSubs, setExpSubs] = useState(new Set());
  const [fFilter, setFFilter] = useState("all");
  const [carbGlycemicFilter, setCarbGlycemicFilter] = useState("all");
  const [fSearch, setFSearch] = useState("");
  const [showSL, setShowSL] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [foodsByCategory, setFoodsByCategory] = useState({ protein: [], carb: [], fat: [] });
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodsError, setFoodsError] = useState("");
  const [foodsReloadKey, setFoodsReloadKey] = useState(0);
  const [tdeeData, setTdeeData] = useState(null);
  const [tdeeLoading, setTdeeLoading] = useState(false);
  const [tdeeError, setTdeeError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [appViewportWidth, setAppViewportWidth] = useState(() => (
    typeof window === "undefined" ? 1280 : window.innerWidth
  ));
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "";
  const resetTokenFromUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("resetToken") || "";
  }, []);
  const themeVars = getThemeVars();
  const appIsMobile = appViewportWidth < 768;
  const appIsTablet = appViewportWidth < 1024;
  const derivedProfileAge = getAgeFromBirthDate(profileForm.birthDate || authUser?.birthDate || "");
  const isProfileSetupRequired = Boolean(authUser) && (
    !authUser?.name ||
    !authUser?.sex ||
    !authUser?.birthDate ||
    authUser?.weight === null ||
    authUser?.weight === undefined ||
    authUser?.weight === "" ||
    authUser?.height === null ||
    authUser?.height === undefined ||
    authUser?.height === ""
  );
  const numericWeight = Number(ud.weight) || 0;
  const numericHeight = Number(ud.height) || 0;
  const numericAge = Number(ud.age) || 0;

  const applyAuthPayload = useCallback((payload) => {
    if (!payload?.user) return;
    setAuthUser(payload.user);
    setUserName((current) => current || payload.user.name || "");
    setAuthError("");
    setAuthNotice("");
    setAuthForm({
      name: payload.user.name || "",
      email: payload.user.email || "",
      password: "",
      resetEmail: payload.user.email || "",
      resetToken: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileForm({
      name: payload.user.name || "",
      email: payload.user.email || "",
      sex: payload.user.sex || "",
      birthDate: payload.user.birthDate ? String(payload.user.birthDate).slice(0, 10) : "",
      avatarDataUrl: "",
    });
    setBodyMetricForm({
      weight: payload.user.weight ?? "",
      height: payload.user.height ?? "",
      age: payload.user.age ?? "",
      bodyFatPercentage: payload.user.bodyFatPercentage ?? "",
    });
    setBodyFatCalcForm({
      sex: payload.user.sex || "",
      height: payload.user.height ?? "",
      neck: "",
      waist: "",
      hip: "",
    });
  }, []);

  const updateAuthForm = useCallback((key, value) => {
    setAuthForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateProfileForm = useCallback((key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const readFileAsDataUrl = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(new Error("Nao foi possivel ler a imagem selecionada."));
    };
    reader.readAsDataURL(file);
  }), []);

  const updateBodyMetricForm = useCallback((key, value) => {
    setBodyMetricForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateBodyFatCalcForm = useCallback((key, value) => {
    setBodyFatCalcForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setAppViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigatePublicPage = useCallback((page) => {
    const nextPage = PUBLIC_PAGES.has(page) ? page : "landing";
    if (typeof window !== "undefined") {
      const nextHash = getHashForPublicPage(nextPage);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
    setPublicPage(nextPage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncPublicPage = () => {
      setPublicPage(getPublicPageFromHash());
    };

    window.addEventListener("hashchange", syncPublicPage);
    return () => window.removeEventListener("hashchange", syncPublicPage);
  }, []);

  const updateDietHistoryFilter = useCallback((key, value) => {
    setDietHistoryFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateReportHistoryFilter = useCallback((key, value) => {
    setReportHistoryFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFoods() {
      setFoodsLoading(true);
      setFoodsError("");
      try {
        const [protein, carb, fat] = await Promise.all([
          fetchFoods("protein"),
          fetchFoods("carb"),
          fetchFoods("fat"),
        ]);

        if (cancelled) return;

        setFoodsByCategory({
          protein: normalizeFoods("protein", protein),
          carb: normalizeFoods("carb", carb),
          fat: normalizeFoods("fat", fat),
        });
      } catch (error) {
        if (!cancelled) setFoodsError("Nao foi possivel carregar os alimentos da API.");
      } finally {
        if (!cancelled) setFoodsLoading(false);
      }
    }

    loadFoods();
    return () => {
      cancelled = true;
    };
  }, [foodsReloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const payload = await fetchCurrentUser();
        if (!cancelled && payload?.user) {
          setAuthUser(payload.user);
          setUserName((current) => current || payload.user.name || "");
          setAuthForm((prev) => ({
            ...prev,
            name: prev.name || payload.user.name || "",
            email: prev.email || payload.user.email || "",
            resetEmail: prev.resetEmail || payload.user.email || "",
          }));
          setProfileForm({
            name: payload.user.name || "",
            email: payload.user.email || "",
            sex: payload.user.sex || "",
            birthDate: payload.user.birthDate ? String(payload.user.birthDate).slice(0, 10) : "",
            avatarDataUrl: "",
          });
          setBodyMetricForm({
            weight: payload.user.weight ?? "",
            height: payload.user.height ?? "",
            age: payload.user.age ?? "",
            bodyFatPercentage: payload.user.bodyFatPercentage ?? "",
          });
          setBodyFatCalcForm((prev) => ({
            ...prev,
            sex: payload.user.sex || prev.sex || "",
            height: payload.user.height ?? prev.height ?? "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setAuthUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthBootstrapLoading(false);
        }
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!resetTokenFromUrl) return;
    setPublicPage("auth");
    setAuthMode("reset");
    setAuthForm((prev) => ({
      ...prev,
      resetToken: resetTokenFromUrl,
      password: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setAuthError("");
    setAuthNotice("");
  }, [resetTokenFromUrl]);

  useEffect(() => {
    if (authUser) {
      document.title = "NutriCalc";
      return;
    }

    if (publicPage === "privacy") {
      document.title = "NutriCalc | Privacidade";
    } else if (publicPage === "terms") {
      document.title = "NutriCalc | Termos";
    } else if (publicPage === "methodology") {
      document.title = "NutriCalc | Metodologia";
    } else if (publicPage === "auth") {
      document.title = "NutriCalc | Acesso";
    } else {
      document.title = "NutriCalc | Planejamento alimentar";
    }
  }, [authUser, publicPage]);

  useEffect(() => {
    if (!authUser) return;
    const calculatedAge = getAgeFromBirthDate(authUser.birthDate);
    setUserName(authUser.name || "");
    setUd((prev) => ({
      ...prev,
      weight: authUser.weight ?? prev.weight ?? "",
      height: authUser.height ?? prev.height ?? "",
      age: calculatedAge || authUser.age || prev.age || "",
      sex: authUser.sex || prev.sex || "M",
    }));
    setBodyMetricForm((prev) => ({
      ...prev,
      weight: authUser.weight ?? prev.weight ?? "",
      height: authUser.height ?? prev.height ?? "",
      age: calculatedAge || authUser.age || prev.age || "",
      bodyFatPercentage: authUser.bodyFatPercentage ?? prev.bodyFatPercentage ?? "",
    }));
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !isProfileSetupRequired) return;
    setProfileOpen(true);
    setProfileError("");
    setProfileNotice("Complete seu perfil antes de montar a primeira dieta.");
  }, [authUser, isProfileSetupRequired]);

  useEffect(() => {
    let cancelled = false;

    async function loadGenerationConfig() {
      setConfigLoading(true);
      setConfigError("");
      try {
        const config = await fetchDietGenerationConfig();
        if (!cancelled && config) {
          setGenerationConfig({
            ...DEFAULT_GENERATION_CONFIG,
            ...config,
            primaryProteinShare: {
              ...DEFAULT_GENERATION_CONFIG.primaryProteinShare,
              ...(config.primaryProteinShare || {}),
            },
            foodLimitsByName: {
              ...DEFAULT_GENERATION_CONFIG.foodLimitsByName,
              ...(config.foodLimitsByName || {}),
            },
            subgroupLimits: {
              ...DEFAULT_GENERATION_CONFIG.subgroupLimits,
              ...(config.subgroupLimits || {}),
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setConfigError("Nao foi possivel carregar a configuracao da geracao.");
        }
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    }

    loadGenerationConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBodyMetrics() {
      if (!authUser || !profileOpen) return;
      setBodyMetricsLoading(true);
      setBodyMetricError("");
      try {
        const payload = await fetchBodyMetrics(bodyMetricsPeriod === "all" ? undefined : bodyMetricsPeriod);
        if (!cancelled) {
          setBodyMetrics(payload.metrics || []);
        }
      } catch (error) {
        if (!cancelled) setBodyMetricError("Nao foi possivel carregar o historico corporal.");
      } finally {
        if (!cancelled) setBodyMetricsLoading(false);
      }
    }

    loadBodyMetrics();
    return () => {
      cancelled = true;
    };
  }, [authUser, bodyMetricsPeriod, profileOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      if (!authUser) return;
      setDashboardLoading(true);
      try {
        const [metricsPayload, dietsPayload, reportsPayload] = await Promise.all([
          fetchBodyMetrics(90),
          fetchMyDiets({ days: 90 }),
          fetchMyReports({ days: 90 }),
        ]);
        if (cancelled) return;
        setBodyMetrics((prev) => (profileOpen ? prev : metricsPayload.metrics || []));
        setUserDiets(dietsPayload.diets || []);
        setUserReports(reportsPayload.reports || []);
      } catch (error) {
        if (!cancelled) {
          setUserDiets([]);
          setUserReports([]);
        }
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [authUser, profileOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserDiets() {
      if (!authUser || !profileOpen) return;
      setUserDietsLoading(true);
      setUserDietsError("");
      try {
        const payload = await fetchMyDiets(dietHistoryFilters);
        if (!cancelled) {
          setUserDiets(payload.diets || []);
        }
      } catch (error) {
        if (!cancelled) setUserDietsError("Nao foi possivel carregar as dietas salvas.");
      } finally {
        if (!cancelled) setUserDietsLoading(false);
      }
    }

    loadUserDiets();
    return () => {
      cancelled = true;
    };
  }, [authUser, dietHistoryFilters, profileOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserReports() {
      if (!authUser || !profileOpen) return;
      setUserReportsLoading(true);
      setUserReportsError("");
      try {
        const payload = await fetchMyReports(reportHistoryFilters);
        if (!cancelled) {
          setUserReports(payload.reports || []);
        }
      } catch (error) {
        if (!cancelled) setUserReportsError("Nao foi possivel carregar os relatorios salvos.");
      } finally {
        if (!cancelled) setUserReportsLoading(false);
      }
    }

    loadUserReports();
    return () => {
      cancelled = true;
    };
  }, [authUser, profileOpen, reportHistoryFilters]);

  useEffect(() => {
    let cancelled = false;

    async function loadTDEE() {
      if (!numericWeight || !numericHeight || !numericAge) {
        setTdeeData(null);
        return;
      }

      setTdeeLoading(true);
      setTdeeError("");
      try {
        const result = await calculateTDEE({
          weight: numericWeight,
          height: numericHeight,
          age: numericAge,
          sex: ud.sex,
          activityLevel: ud.al,
        });

        if (cancelled) return;
        if (typeof result?.tdee !== "number") throw new Error("Invalid TDEE response");
        setTdeeData(result);
      } catch (error) {
        if (!cancelled) {
          setTdeeData(null);
          setTdeeError("Nao foi possivel calcular o TDEE pela API.");
        }
      } finally {
        if (!cancelled) setTdeeLoading(false);
      }
    }

    loadTDEE();
    return () => {
      cancelled = true;
    };
  }, [numericAge, numericHeight, numericWeight, ud.al, ud.sex]);

  const tdee = tdeeData?.tdee || 0;

  const adjKcal = useMemo(() => Math.round(tdee * (1 + objPct/100)), [tdee, objPct]);

  const mg = useMemo(() => {
    const p = Math.round(mc.p * numericWeight), c = Math.round(mc.c * numericWeight), f = Math.round(mc.f * numericWeight);
    return { p, c, f, kcal: p*4 + c*4 + f*9 };
  }, [mc, numericWeight]);

  const activeMacroPreset = useMemo(() => {
    const preset = MACRO_PRESETS.find(item =>
      item.values.p === mc.p && item.values.c === mc.c && item.values.f === mc.f
    );
    return preset?.key || "custom";
  }, [mc]);

  const foodIndex = useMemo(() => {
    const map = new Map();
    Object.values(foodsByCategory).flat().forEach(food => {
      map.set(food.id, food);
    });
    return map;
  }, [foodsByCategory]);

  const selectedFoodsByCategory = useMemo(() => ({
    protein: foodsByCategory.protein.filter(food => selIds.has(food.id)),
    carb: foodsByCategory.carb.filter(food => selIds.has(food.id)),
    fat: foodsByCategory.fat.filter(food => selIds.has(food.id)),
  }), [foodsByCategory, selIds]);

  const selCount = useMemo(() => {
    return {
      p: selectedFoodsByCategory.protein.length,
      c: selectedFoodsByCategory.carb.length,
      f: selectedFoodsByCategory.fat.length,
    };
  }, [selectedFoodsByCategory]);

  const favC = useMemo(() => {
    let p=0,c=0,f=0;
    favIds.forEach(id => {
      const cat = foodIndex.get(id)?.cat;
      if (cat === "protein") p++;
      else if (cat === "carb") c++;
      else if (cat === "fat") f++;
    });
    return {p,c,f};
  }, [favIds, foodIndex]);

  const canAdv4 = selCount.p >= 4 && selCount.c >= 6 && selCount.f >= 2;
  const planningRoleSummary = useMemo(() => {
    return Object.values(foodsByCategory)
      .flat()
      .reduce((acc, food) => {
        const role = food.planningRole || "core";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, { core: 0, flex: 0, accessory: 0 });
  }, [foodsByCategory]);

  const updateFoodLimit = useCallback((foodName, field, value) => {
    setGenerationConfig((prev) => ({
      ...prev,
      foodLimitsByName: {
        ...prev.foodLimitsByName,
        [foodName]: {
          ...(prev.foodLimitsByName?.[foodName] || {}),
          [field]: Number(value) || 0,
        },
      },
    }));
  }, []);

  const updateSubgroupLimit = useCallback((subgroup, field, value) => {
    setGenerationConfig((prev) => ({
      ...prev,
      subgroupLimits: {
        ...prev.subgroupLimits,
        [subgroup]: {
          ...(prev.subgroupLimits?.[subgroup] || {}),
          [field]: Number(value) || 0,
        },
      },
    }));
  }, []);

  useEffect(() => {
    const template = MEAL_SHARE_TEMPLATES[nMeals] || normalizeShares(Array.from({ length: nMeals }, () => Math.floor(100 / nMeals)));
    setMealShares(template);
  }, [nMeals]);

  useEffect(() => {
    setMDist(buildUniformMealDistribution(mealShares));
  }, [mealShares]);

  useEffect(() => {
    if (mealShares.length !== nMeals) {
      const template = MEAL_SHARE_TEMPLATES[nMeals] || normalizeShares(Array.from({ length: nMeals }, () => Math.floor(100 / nMeals)));
      setMealShares(template);
    }
  }, [nMeals]);

  useEffect(() => { if (obj==="maintenance") setObjPct(0); else if (obj==="bulk") setObjPct(15); else setObjPct(-20); }, [obj]);

  const togSel = useCallback(id => {
    setSelIds(p => { const n = new Set(p); if (n.has(id)) { n.delete(id); setFavIds(q=>{const x=new Set(q);x.delete(id);return x;}); } else n.add(id); return n; });
  }, []);

  const togFav = useCallback(id => {
    const cat = foodIndex.get(id)?.cat || null;
    if (!cat) return;
    setFavIds(p => {
      const n=new Set(p); if (n.has(id)){n.delete(id);return n;}
      let c=0;
      n.forEach(fid => {
        if (foodIndex.get(fid)?.cat === cat) c++;
      });
      if (c<FAV_LIM[cat]) n.add(id); return n;
    });
  }, [foodIndex]);

  const doGenerate = useCallback(async () => {
    setGenerateError("");
    setIsGenerating(true);

    try {
      const d = await generateDietRequest({
        targetKcal: adjKcal,
        protGrams: mg.p,
        carbGrams: mg.c,
        fatGrams: mg.f,
        numMeals: nMeals,
        mealDistribution: mDist,
        selectedFoodIds: [...selIds],
        favoriteIds: [...favIds],
        generationConfig,
        userName,
        weight: numericWeight,
        height: numericHeight,
        age: numericAge,
        bodyFatPercentage: authUser?.bodyFatPercentage ?? "",
        sex: ud.sex,
        activityLevel: ud.al,
        objective: obj,
        objectivePct: objPct,
        protPerKg: mc.p,
        carbPerKg: mc.c,
        fatPerKg: mc.f,
      });

      setDiet(normalizeDietResult(d, selectedFoodsByCategory));
      setStep(6);
      setExpSubs(new Set());
      setShowSL(null);
    } catch (error) {
      setGenerateError("Nao foi possivel gerar a dieta pelo backend.");
    } finally {
      setIsGenerating(false);
    }
  }, [adjKcal, authUser?.bodyFatPercentage, favIds, generationConfig, mc, mg, mDist, nMeals, numericAge, numericHeight, numericWeight, obj, objPct, selIds, selectedFoodsByCategory, ud.al, ud.sex, userName]);

  const handleAuthSubmit = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const payload =
        authMode === "register"
          ? await registerUser({
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            })
          : await loginUser({
              email: authForm.email,
              password: authForm.password,
            });
      applyAuthPayload(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [applyAuthPayload, authForm.email, authForm.name, authForm.password, authMode]);

  const handlePasswordReset = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const payload = await requestPasswordReset(authForm.resetEmail || authForm.email);
      setAuthNotice(
        payload?.devResetToken
          ? `Token de teste gerado: ${payload.devResetToken}`
          : "Enviamos um email de recuperacao para o endereco cadastrado.",
      );
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [authForm.email, authForm.resetEmail]);

  const handleResetPasswordSubmit = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      if (!authForm.resetToken) {
        throw new Error("Token de redefinicao ausente.");
      }
      if (!authForm.newPassword || authForm.newPassword.length < 6) {
        throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");
      }
      if (authForm.newPassword !== authForm.confirmPassword) {
        throw new Error("As senhas nao conferem.");
      }

      await resetPassword({
        token: authForm.resetToken,
        password: authForm.newPassword,
      });

      if (typeof window !== "undefined") {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("resetToken");
        window.history.replaceState({}, "", cleanUrl.toString());
      }

      setAuthMode("login");
      setAuthForm((prev) => ({
        ...prev,
        password: "",
        resetToken: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setAuthNotice("Senha redefinida com sucesso. Agora voce ja pode entrar.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [authForm.confirmPassword, authForm.newPassword, authForm.resetToken]);

  const handleGoogleLogin = useCallback(async (credential) => {
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const payload = await loginWithGoogle(credential);
      applyAuthPayload(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [applyAuthPayload]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Even if logout fails, clear the in-memory session state to avoid trapping the UI.
    } finally {
      setAuthUser(null);
      setAuthMode("login");
      setAuthError("");
      setAuthNotice("");
      setProfileOpen(false);
      setBodyMetrics([]);
      setUserDiets([]);
      setUserReports([]);
    }
  }, []);

  const handleProfileAvatarChange = useCallback(async (file) => {
    if (!file) return;
    setProfileLoading(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const avatarDataUrl = await readFileAsDataUrl(file);
      setProfileForm((prev) => ({ ...prev, avatarDataUrl }));
      const payload = await updateCurrentUser({ avatarDataUrl });
      if (payload?.user) {
        setAuthUser(payload.user);
        setUserName((current) => current || payload.user.name || "");
        setAuthForm((prev) => ({
          ...prev,
          name: payload.user.name || prev.name || "",
          email: payload.user.email || prev.email || "",
          resetEmail: payload.user.email || prev.resetEmail || "",
        }));
        setProfileForm((prev) => ({
          ...prev,
          name: payload.user.name || prev.name || "",
          email: payload.user.email || prev.email || "",
          sex: payload.user.sex || prev.sex || "",
          birthDate: payload.user.birthDate ? String(payload.user.birthDate).slice(0, 10) : prev.birthDate,
          avatarDataUrl: "",
        }));
        setProfileNotice("Avatar salvo com sucesso.");
      }
    } catch (error) {
      setProfileForm((prev) => ({ ...prev, avatarDataUrl: "" }));
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, [readFileAsDataUrl]);

  const handleProfileSave = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const requiredWeight = String(bodyMetricForm.weight || "").trim();
      const requiredHeight = String(bodyMetricForm.height || "").trim();
      const calculatedAge = getAgeFromBirthDate(profileForm.birthDate);
      const hasAvatarChange = Boolean(profileForm.avatarDataUrl);
      const hasCoreProfileData =
        Boolean(String(profileForm.name || "").trim()) &&
        Boolean(profileForm.sex) &&
        Boolean(profileForm.birthDate) &&
        Boolean(requiredWeight) &&
        Boolean(requiredHeight);

      if (!hasAvatarChange && !String(profileForm.name || "").trim()) {
        throw new Error("Informe seu nome para continuar.");
      }
      if (!hasAvatarChange && !profileForm.sex) {
        throw new Error("Selecione seu sexo para calcular a dieta corretamente.");
      }
      if (!hasAvatarChange && !profileForm.birthDate) {
        throw new Error("Informe sua data de nascimento para calcular sua idade.");
      }
      if (!hasAvatarChange && (!requiredWeight || !requiredHeight)) {
        throw new Error("Preencha peso e altura antes de continuar.");
      }

      const payload = await updateCurrentUser({
        name: profileForm.name || undefined,
        email: profileForm.email || undefined,
        sex: profileForm.sex || null,
        birthDate: profileForm.birthDate || null,
        avatarDataUrl: profileForm.avatarDataUrl || undefined,
      });

      let nextUser = payload?.user || null;

      const shouldSaveMetric =
        hasCoreProfileData &&
        !authUser ||
        (
          hasCoreProfileData && (
            Number(authUser.weight ?? "") !== Number(requiredWeight) ||
            Number(authUser.height ?? "") !== Number(requiredHeight) ||
            Number(authUser.bodyFatPercentage ?? "") !== Number(bodyMetricForm.bodyFatPercentage || "") ||
            String(authUser.birthDate || "").slice(0, 10) !== String(profileForm.birthDate || "")
          )
        );

      if (shouldSaveMetric) {
        const metricPayload = await createBodyMetric({
          weight: requiredWeight,
          height: requiredHeight,
          age: calculatedAge,
          bodyFatPercentage: bodyMetricForm.bodyFatPercentage,
        });
        if (metricPayload?.metric) {
          setBodyMetrics((prev) => [metricPayload.metric, ...prev].slice(0, 120));
        }
        if (metricPayload?.user) {
          nextUser = {
            ...metricPayload.user,
            avatarUrl: metricPayload.user.avatarUrl || nextUser?.avatarUrl || authUser?.avatarUrl || null,
          };
        }
      }

      if (nextUser) {
        setAuthUser(nextUser);
        setUserName(nextUser.name || "");
        setAuthForm((prev) => ({
          ...prev,
          name: nextUser.name || "",
          email: nextUser.email || "",
          resetEmail: nextUser.email || "",
        }));
        setProfileForm({
          name: nextUser.name || "",
          email: nextUser.email || "",
          sex: nextUser.sex || "",
          birthDate: nextUser.birthDate ? String(nextUser.birthDate).slice(0, 10) : profileForm.birthDate,
          avatarDataUrl: "",
        });
        setBodyMetricForm({
          weight: nextUser.weight ?? requiredWeight,
          height: nextUser.height ?? requiredHeight,
          age: calculatedAge || nextUser.age || "",
          bodyFatPercentage: nextUser.bodyFatPercentage ?? bodyMetricForm.bodyFatPercentage ?? "",
        });
        setUd((prev) => ({
          ...prev,
          weight: nextUser.weight ?? requiredWeight,
          height: nextUser.height ?? requiredHeight,
          age: calculatedAge || nextUser.age || "",
          sex: nextUser.sex || prev.sex || "M",
        }));
        setProfileNotice(
          hasAvatarChange && !hasCoreProfileData
            ? "Avatar salvo com sucesso."
            : "Perfil salvo com sucesso. Agora você já pode montar sua dieta.",
        );
        if (hasCoreProfileData) {
          setProfileOpen(false);
        }
      }
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, [authUser, bodyMetricForm.bodyFatPercentage, bodyMetricForm.height, bodyMetricForm.weight, profileForm.avatarDataUrl, profileForm.birthDate, profileForm.email, profileForm.name, profileForm.sex]);

  const handleProfileAvatarRemove = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const payload = await updateCurrentUser({ removeAvatar: true });
      if (payload?.user) {
        setAuthUser(payload.user);
        setProfileForm((prev) => ({ ...prev, avatarDataUrl: "" }));
        setProfileNotice("Avatar removido.");
      }
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const handleBodyMetricSave = useCallback(async () => {
    setBodyMetricsLoading(true);
    setBodyMetricError("");
    setBodyMetricNotice("");
    try {
      const metricInput = {
        ...bodyMetricForm,
        age: getAgeFromBirthDate(profileForm.birthDate) || bodyMetricForm.age,
      };
      const payload = editingBodyMetricId
        ? await updateBodyMetric(editingBodyMetricId, metricInput)
        : await createBodyMetric(metricInput);
      if (payload?.metric) {
        setBodyMetrics((prev) => {
          if (editingBodyMetricId) {
            return prev.map((metric) => (metric.id === payload.metric.id ? payload.metric : metric));
          }
          return [payload.metric, ...prev].slice(0, 120);
        });
        if (payload.user) {
          setAuthUser(payload.user);
        }
        setBodyMetricForm({
          weight: payload.metric.weight ?? payload.user?.weight ?? "",
          height: payload.metric.height ?? payload.user?.height ?? "",
          age: payload.metric.age ?? payload.user?.age ?? "",
          bodyFatPercentage: payload.metric.bodyFatPercentage ?? payload.user?.bodyFatPercentage ?? "",
        });
        setEditingBodyMetricId("");
        setBodyMetricNotice(editingBodyMetricId ? "Registro corporal atualizado com sucesso." : "Registro corporal salvo com sucesso.");
      }
    } catch (error) {
      setBodyMetricError(error.message);
    } finally {
      setBodyMetricsLoading(false);
    }
  }, [bodyMetricForm, editingBodyMetricId, profileForm.birthDate]);

  const handleBodyMetricEdit = useCallback((metric) => {
    setEditingBodyMetricId(metric.id);
    setBodyMetricError("");
    setBodyMetricNotice("");
    setBodyMetricForm({
      weight: metric.weight ?? "",
      height: metric.height ?? "",
      age: metric.age ?? "",
      bodyFatPercentage: metric.bodyFatPercentage ?? "",
    });
  }, []);

  const handleBodyMetricCancelEdit = useCallback(() => {
    setEditingBodyMetricId("");
    setBodyMetricError("");
    setBodyMetricNotice("");
    setBodyMetricForm({
      weight: authUser?.weight ?? "",
      height: authUser?.height ?? "",
      age: authUser?.age ?? "",
      bodyFatPercentage: authUser?.bodyFatPercentage ?? "",
    });
  }, [authUser]);

  const handleBodyMetricDelete = useCallback(async (metricId) => {
    const confirmed = window.confirm("Deseja realmente excluir este registro corporal? Essa ação não pode ser desfeita.");
    if (!confirmed) return;

    setBodyMetricsLoading(true);
    setBodyMetricError("");
    setBodyMetricNotice("");

    try {
      const payload = await deleteBodyMetric(metricId);
      setBodyMetrics((prev) => prev.filter((metric) => metric.id !== metricId));
      if (payload?.user) {
        setAuthUser(payload.user);
        setBodyMetricForm((prev) => ({
          weight: payload.user.weight ?? prev.weight ?? "",
          height: payload.user.height ?? prev.height ?? "",
          age: payload.user.age ?? prev.age ?? "",
          bodyFatPercentage: payload.user.bodyFatPercentage ?? prev.bodyFatPercentage ?? "",
        }));
      }
      if (editingBodyMetricId === metricId) {
        setEditingBodyMetricId("");
      }
      setBodyMetricNotice("Registro corporal excluído com sucesso.");
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("nao encontrado")) {
        setBodyMetrics((prev) => prev.filter((metric) => metric.id !== metricId));
        if (editingBodyMetricId === metricId) {
          setEditingBodyMetricId("");
        }
        setBodyMetricNotice("O registro já não existia mais e foi removido da lista.");
      } else {
        setBodyMetricError(error.message);
      }
    } finally {
      setBodyMetricsLoading(false);
    }
  }, [editingBodyMetricId]);

  const handleBodyFatCalculate = useCallback(async () => {
    setBodyFatCalcLoading(true);
    setBodyFatCalcError("");
    try {
      const payload = await calculateNavyBodyFat(bodyFatCalcForm);
      setBodyFatCalcResult(payload);
    } catch (error) {
      setBodyFatCalcError(error.message);
      setBodyFatCalcResult(null);
    } finally {
      setBodyFatCalcLoading(false);
    }
  }, [bodyFatCalcForm]);

  const handleUseCalculatedBodyFat = useCallback(() => {
    if (!bodyFatCalcResult?.bodyFatPercentage) return;
    setBodyMetricForm((prev) => ({
      ...prev,
      bodyFatPercentage: bodyFatCalcResult.bodyFatPercentage,
      height: prev.height || bodyFatCalcForm.height || "",
    }));
    setBodyFatCalcOpen(false);
    setBodyMetricNotice("Percentual aplicado ao formulário corporal.");
  }, [bodyFatCalcForm.height, bodyFatCalcResult]);

  const handleSaveCalculatedBodyFat = useCallback(async () => {
    if (!bodyFatCalcResult?.bodyFatPercentage) return;
    setBodyMetricsLoading(true);
    setBodyFatCalcError("");
    try {
      const payload = await createBodyMetric({
        weight: bodyMetricForm.weight,
        height: bodyMetricForm.height || bodyFatCalcForm.height || "",
        age: getAgeFromBirthDate(profileForm.birthDate) || bodyMetricForm.age,
        bodyFatPercentage: bodyFatCalcResult.bodyFatPercentage,
        source: "navy_formula",
      });
      if (payload?.metric) {
        setBodyMetrics((prev) => [payload.metric, ...prev].slice(0, 120));
        if (payload.user) {
          setAuthUser(payload.user);
          setBodyMetricForm({
            weight: payload.user.weight ?? "",
            height: payload.user.height ?? "",
            age: payload.user.age ?? "",
            bodyFatPercentage: payload.user.bodyFatPercentage ?? "",
          });
        }
        setBodyMetricNotice("Estimativa salva no histórico corporal.");
        setBodyFatCalcOpen(false);
      }
    } catch (error) {
      setBodyFatCalcError(error.message);
    } finally {
      setBodyMetricsLoading(false);
    }
  }, [bodyFatCalcForm.height, bodyFatCalcResult, bodyMetricForm.age, bodyMetricForm.height, bodyMetricForm.weight, profileForm.birthDate]);

  const handleOpenSavedDiet = useCallback(async (dietId) => {
    try {
      setUserDietsError("");
      const payload = await getDiet(dietId);
      setDiet(normalizeStoredDietResult(payload, selectedFoodsByCategory));
      setProfileOpen(false);
      setStep(6);
      setExpSubs(new Set());
      setShowSL(null);
    } catch (error) {
      setUserDietsError(error.message || "Nao foi possivel abrir a dieta salva.");
    }
  }, [selectedFoodsByCategory]);

  const buildCurrentReportPayload = useCallback(() => {
    if (!diet) return null;
    const targetKcal = diet.targetKcal ?? adjKcal;
    const targetMacros = {
      protGrams: diet.targetMacros?.protGrams ?? mg.p,
      carbGrams: diet.targetMacros?.carbGrams ?? mg.c,
      fatGrams: diet.targetMacros?.fatGrams ?? mg.f,
    };
    const actualTotals = diet.meals.reduce((acc, meal) => {
      meal.foods.forEach((food) => {
        const ratio = food.grams / 100;
        acc.kcal += Math.round(food.kcal * ratio);
        acc.prot += food.prot * ratio;
        acc.carb += food.carb * ratio;
        acc.fat += food.fat * ratio;
      });
      return acc;
    }, { kcal: 0, prot: 0, carb: 0, fat: 0 });

    const objective = diet.objective ?? obj;
    const objectivePct = diet.objectivePct ?? objPct;
    const reportTitle = `Planejamento Alimentar - ${userName || authUser?.name || "NutriCalc"} - ${new Date().toLocaleDateString("pt-BR")}`;
    const userData = {
      weight: diet.snapshot?.weight ?? ud.weight,
      height: diet.snapshot?.height ?? ud.height,
      age: diet.snapshot?.age ?? ud.age,
      sex: ud.sex,
    };

    return {
      title: reportTitle,
      objective,
      htmlContent: buildReportHtml({
        activityLabel: ACT[ud.al]?.label || "—",
        actualTotals,
        diet,
        macrosPerKg: mc,
        objective,
        objectivePct,
        tdee: tdeeData?.tdee ?? tdee,
        targetKcal,
        targetMacros,
        userData,
        userName: userName || authUser?.name || "",
      }),
    };
  }, [adjKcal, authUser?.name, diet, mc, mg.c, mg.f, mg.p, obj, objPct, tdee, tdeeData?.tdee, ud.age, ud.al, ud.height, ud.sex, ud.weight, userName]);

  const handleOpenSavedReport = useCallback(async (reportId) => {
    try {
      setUserReportsError("");
      const payload = await fetchMyReport(reportId);
      const opened = openReportWindow(payload.report.htmlContent);
      if (!opened) {
        setUserReportsError("Permita popups para abrir o relatorio salvo.");
      }
    } catch (error) {
      setUserReportsError(error.message || "Nao foi possivel abrir o relatorio salvo.");
    }
  }, []);

  const handleDeleteSavedDiet = useCallback(async (dietId) => {
    const confirmed = window.confirm("Tem certeza que deseja apagar esta dieta da lista? Essa ação não pode ser desfeita.");
    if (!confirmed) return;
    try {
      setUserDietsError("");
      await deleteMyDiet(dietId);
      setUserDiets((prev) => prev.filter((item) => item.id !== dietId));
      if (diet?.dietId === dietId) {
        setDiet(null);
        setStep(1);
        setExpSubs(new Set());
        setShowSL(null);
      }
    } catch (error) {
      setUserDiets((prev) => prev.filter((item) => item.id !== dietId));
      if (diet?.dietId === dietId) {
        setDiet(null);
        setStep(1);
        setExpSubs(new Set());
        setShowSL(null);
      }
      setUserDietsError(error.message || "A dieta não foi encontrada no servidor. Ela foi removida da lista local.");
    }
  }, [diet]);

  const handleDeleteSavedReport = useCallback(async (reportId) => {
    const confirmed = window.confirm("Tem certeza que deseja apagar este relatório? Não será possível recuperar esse item depois. Para ter outro, será necessário gerar um novo relatório.");
    if (!confirmed) return;
    try {
      setUserReportsError("");
      await deleteMyReport(reportId);
      setUserReports((prev) => prev.filter((item) => item.id !== reportId));
    } catch (error) {
      setUserReports((prev) => prev.filter((item) => item.id !== reportId));
      setUserReportsError(error.message || "O relatório não foi encontrado no servidor. Ele foi removido da lista local.");
    }
  }, []);

  const handleStartNewDiet = useCallback(() => {
    setDiet(null);
    setExpSubs(new Set());
    setShowSL(null);
    setGenerateError("");
    setStep(1);
  }, []);

  const latestDiet = userDiets[0] || null;
  const latestReport = userReports[0] || null;
  const dashboardWeightTrend = computeMetricTrend(bodyMetrics, "weight");
  const dashboardBodyFatTrend = computeMetricTrend(bodyMetrics, "bodyFatPercentage");

  const togExp = k => setExpSubs(p=>{const n=new Set(p);if(n.has(k))n.delete(k);else n.add(k);return n;});
  const updMealShare = (i, v) => setMealShares(prev => rebalanceMealShares(prev, i, parseInt(v) || 0));
  const dSum = () => mealShares.reduce((s,x)=>s+x,0);
  const labels = getMealLabels(nMeals);

  const RC={protein:"#ef4444",carb:"#f59e0b",fat:"#3b82f6"};
  const RL={protein:"PROT",carb:"CARB",fat:"GORD"};

  // PDF generation
  const genPDF = async () => {
    if (!diet) return;
    setPdfLoading(true);
    try {
      const reportPayload = buildCurrentReportPayload();
      if (!reportPayload) return;
      const opened = openReportWindow(reportPayload.htmlContent);
      if (!opened) {
        alert("Permita popups para gerar o PDF");
        return;
      }
      if (authUser?.id) {
        const payload = await createMyReport({
          dietId: diet.dietId || null,
          title: reportPayload.title,
          reportType: "diet_pdf",
          objective: reportPayload.objective,
          htmlContent: reportPayload.htmlContent,
        });
        if (payload?.report) {
          setUserReports((prev) => [payload.report, ...prev].slice(0, 40));
        }
        if (diet.dietId) {
          setUserDiets((prev) => {
            const alreadyExists = prev.some((item) => item.id === diet.dietId);
            if (alreadyExists) return prev;
            const summary = {
              id: diet.dietId,
              objective: diet.objective ?? obj,
              objectivePct: diet.objectivePct ?? objPct,
              targetKcal: diet.targetKcal ?? adjKcal,
              numMeals: diet.meals?.length || nMeals,
              createdAt: diet.createdAt || new Date().toISOString(),
              snapshotWeight: diet.snapshot?.weight ?? ud.weight ?? null,
              snapshotHeight: diet.snapshot?.height ?? ud.height ?? null,
              snapshotAge: diet.snapshot?.age ?? ud.age ?? null,
              snapshotBodyFatPercentage: diet.snapshot?.bodyFatPercentage ?? authUser?.bodyFatPercentage ?? null,
            };
            return [summary, ...prev].slice(0, 40);
          });
        }
      }
      setProfileOpen(false);
      setShowSL(null);
      setExpSubs(new Set());
      setStep(1);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (authBootstrapLoading) {
    return (
      <div style={{...themeVars,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--app-bg)",color:"var(--app-text)",fontFamily:"'Outfit','Segoe UI',sans-serif",padding:24}}>
        <div style={{width:"100%",maxWidth:420,padding:"28px 24px",borderRadius:24,background:"rgba(15,23,42,0.92)",border:"1px solid rgba(132,204,22,0.16)",textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,0.28)"}}>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em"}}>Nutri<span style={{color:"#84cc16"}}>Calc</span></div>
          <div style={{fontSize:14,color:"#94a3b8",marginTop:10}}>Carregando seu acesso...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <PublicExperience
        authError={authError}
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authNotice={authNotice}
        googleClientId={googleClientId}
        onChangeAuthMode={(mode) => {
          navigatePublicPage("auth");
          setAuthMode(mode);
          setAuthError("");
          setAuthNotice("");
        }}
        onGoogleCredential={handleGoogleLogin}
        onNavigatePage={navigatePublicPage}
        onPasswordReset={handlePasswordReset}
        onResetPasswordSubmit={handleResetPasswordSubmit}
        onSubmit={handleAuthSubmit}
        onUpdateField={updateAuthForm}
        publicPage={publicPage}
        themeVars={themeVars}
      />
    );
  }

  if ((profileOpen || isProfileSetupRequired) && authUser) {
    return (
      <ProfileModal
        authUser={authUser}
        bodyFatCalcError={bodyFatCalcError}
        bodyFatCalcForm={bodyFatCalcForm}
        bodyFatCalcLoading={bodyFatCalcLoading}
        bodyFatCalcOpen={bodyFatCalcOpen}
        bodyFatCalcResult={bodyFatCalcResult}
        bodyMetricError={bodyMetricError}
        bodyMetricForm={bodyMetricForm}
        bodyMetricNotice={bodyMetricNotice}
        bodyMetrics={bodyMetrics}
        bodyMetricsLoading={bodyMetricsLoading}
        bodyMetricsPeriod={bodyMetricsPeriod}
        editingBodyMetricId={editingBodyMetricId}
        currentAvatarUrl={authUser.avatarUrl}
        dietHistoryFilters={dietHistoryFilters}
        reportHistoryFilters={reportHistoryFilters}
        onAvatarRemove={handleProfileAvatarRemove}
        onAvatarSelected={handleProfileAvatarChange}
        onBodyFatCalculate={handleBodyFatCalculate}
        onBodyMetricCancelEdit={handleBodyMetricCancelEdit}
        onBodyMetricDelete={handleBodyMetricDelete}
        onBodyMetricEdit={handleBodyMetricEdit}
        onBodyMetricSave={handleBodyMetricSave}
        onBodyFatCalcClose={() => setBodyFatCalcOpen(false)}
        onBodyFatCalcOpen={() => {
          setBodyFatCalcError("");
          setBodyFatCalcResult(null);
          setBodyFatCalcOpen(true);
        }}
        onClose={() => setProfileOpen(false)}
        onChangeBodyMetricsPeriod={setBodyMetricsPeriod}
        onDietDelete={handleDeleteSavedDiet}
        onDietOpen={handleOpenSavedDiet}
        onReportDelete={handleDeleteSavedReport}
        onReportOpen={handleOpenSavedReport}
        onSave={handleProfileSave}
        onSaveCalculatedBodyFat={handleSaveCalculatedBodyFat}
        onUpdateBodyFatCalcField={updateBodyFatCalcForm}
        onUpdateDietHistoryFilter={updateDietHistoryFilter}
        onUpdateReportHistoryFilter={updateReportHistoryFilter}
        onUpdateBodyMetricField={updateBodyMetricForm}
        onUpdateField={updateProfileForm}
        onUseCalculatedBodyFat={handleUseCalculatedBodyFat}
        profileError={profileError}
        profileForm={profileForm}
        profileLoading={profileLoading}
        profileNotice={profileNotice}
        setupRequired={isProfileSetupRequired}
        themeVars={themeVars}
        userDiets={userDiets}
        userDietsError={userDietsError}
        userDietsLoading={userDietsLoading}
        userReports={userReports}
        userReportsError={userReportsError}
        userReportsLoading={userReportsLoading}
      />
    );
  }

  return (
    <div style={{...themeVars,minHeight:"100vh",background:"var(--app-bg)",color:"var(--app-text)",fontFamily:"'Outfit','Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,zIndex:0,opacity:0.03,backgroundImage:`linear-gradient(rgba(132,204,22,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(132,204,22,0.3) 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>

      <header style={{position:"relative",zIndex:10,padding:appIsMobile?"12px 14px 10px":"20px 24px",borderBottom:"1px solid rgba(132,204,22,0.15)",display:"flex",alignItems:appIsMobile?"stretch":"center",justifyContent:"space-between",flexDirection:appIsMobile?"column":"row",gap:appIsMobile?10:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:appIsMobile?"space-between":"flex-start",width:appIsMobile?"100%":"auto"}}>
          <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#84cc16,#65a30d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#0f172a"}}>N</div>
          <span style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em"}}>Nutri<span style={{color:"#84cc16"}}>Calc</span></span>
          {appIsMobile && <div style={{marginLeft:"auto",fontSize:11,color:"#64748b"}}>Baseado em evidências</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",width:appIsMobile?"100%":"auto",justifyContent:appIsMobile?"flex-start":"flex-end"}}>
          {authUser ? (
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:appIsMobile?"8px 10px":"8px 12px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",width:appIsMobile?"100%":"auto",minWidth:0}}>
                <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",background:"linear-gradient(135deg,#1e293b,#334155)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#a3e635"}}>
                  {authUser.avatarUrl ? <img src={resolveMediaUrl(authUser.avatarUrl)} alt={authUser.name || "Usuario"} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : (authUser.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{authUser.name || "Usuário"}</div>
                  <div style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{authUser.email || "Conta ativa"}</div>
                </div>
              </div>
              <button onClick={() => { setProfileOpen(true); setProfileError(""); setProfileNotice(""); }} style={{...pB,padding:appIsMobile?"10px 12px":"10px 14px",borderColor:"rgba(132,204,22,0.2)",color:"#a3e635",background:"rgba(132,204,22,0.08)",flex:appIsMobile?"1 1 calc(50% - 26px)":"none",minWidth:appIsMobile?0:"auto"}}>Perfil</button>
              <button onClick={handleLogout} style={{...pB,padding:appIsMobile?"10px 12px":"10px 14px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1",flex:appIsMobile?"1 1 calc(50% - 26px)":"none",minWidth:appIsMobile?0:"auto"}}>Sair</button>
            </>
          ) : (
            <div style={{fontSize:13,color:"#94a3b8"}}>Acesso protegido</div>
          )}
          <button
            onClick={() => {
              setSettingsTab("prioridades");
              setSettingsOpen((prev) => !prev);
            }}
            style={{width:42,height:42,borderRadius:12,border:"1px solid rgba(132,204,22,0.2)",background:settingsOpen?"rgba(132,204,22,0.14)":"rgba(255,255,255,0.04)",color:settingsOpen?"#a3e635":"#cbd5e1",cursor:"pointer",fontSize:18,marginLeft:appIsMobile?0:"auto",flexShrink:0}}
            title="Configurações da geração"
          >
            ⚙
          </button>
          {!appIsMobile && <div style={{fontSize:13,color:"#64748b"}}>Baseado em evidências</div>}
        </div>
      </header>

      {authUser && (
        <div style={{position:"relative",zIndex:20,maxWidth:1080,margin:"16px auto 0",padding:appIsMobile?"0 14px":"0 24px"}}>
          <div style={{padding:appIsMobile?"16px":"18px 20px",borderRadius:24,background:"linear-gradient(135deg,rgba(132,204,22,0.14),rgba(15,23,42,0.82))",border:"1px solid rgba(132,204,22,0.2)",boxShadow:"0 18px 50px rgba(0,0,0,0.18)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:18,flexWrap:"wrap",flexDirection:appIsMobile?"column":"row"}}>
              <div style={{flex:"1 1 320px"}}>
                <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#bef264",fontWeight:800}}>Painel</div>
                <div style={{fontSize:appIsMobile?24:30,fontWeight:800,letterSpacing:"-0.03em",marginTop:4,lineHeight:1.05}}>Sua área no NutriCalc</div>
                <div style={{fontSize:14,color:"#cbd5e1",marginTop:8,maxWidth:620}}>
                  {authUser.name ? `${authUser.name}, seu histórico está pronto para você retomar a rotina sem perder o contexto.` : "Seu histórico está pronto para você retomar a rotina sem perder o contexto."}
                </div>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",width:appIsMobile?"100%":"auto",flexDirection:appIsMobile?"column":"row"}}>
                {latestDiet && (
                  <button onClick={() => handleOpenSavedDiet(latestDiet.id)} style={{...nBS,flex:"none",padding:"12px 18px",width:appIsMobile?"100%":"auto"}}>
                    Continuar de onde parei
                  </button>
                )}
                <button onClick={() => { setProfileOpen(true); setProfileError(""); setProfileNotice(""); }} style={{...pB,padding:"12px 18px",borderColor:"rgba(255,255,255,0.12)",color:"#e2e8f0",width:appIsMobile?"100%":"auto"}}>
                  Abrir perfil completo
                </button>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginTop:16}}>
              {[
                { label:"Peso atual", value: formatMetricValue(authUser.weight, " kg") },
                { label:"Gordura atual", value: formatMetricValue(authUser.bodyFatPercentage, "%") },
                { label:"Dietas salvas", value: String(userDiets.length) },
                { label:"Relatórios salvos", value: String(userReports.length) },
              ].map((item) => (
                <div key={item.label} style={{padding:"12px 14px",borderRadius:14,background:"rgba(15,23,42,0.62)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                  <div style={{fontSize:18,fontWeight:800,color:"#f8fafc",marginTop:6}}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:16}}>
              <div style={{padding:"14px",borderRadius:18,background:"rgba(15,23,42,0.58)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                  <div style={{fontSize:15,fontWeight:800}}>Resumo da evolução</div>
                  <div style={{fontSize:12,color:"#94a3b8"}}>Últimos 90 dias</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{padding:"12px",borderRadius:12,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.14)"}}>
                    <div style={{fontSize:11,color:"#bef264",textTransform:"uppercase",letterSpacing:"0.08em"}}>Peso</div>
                    <div style={{fontSize:20,fontWeight:800,marginTop:4}}>{formatMetricValue(dashboardWeightTrend.lastValue, " kg")}</div>
                    <div style={{fontSize:12,color:"#cbd5e1",marginTop:6}}>Variação: {dashboardWeightTrend.delta === null ? "—" : `${dashboardWeightTrend.delta > 0 ? "+" : ""}${dashboardWeightTrend.delta.toFixed(1)} kg`}</div>
                  </div>
                  <div style={{padding:"12px",borderRadius:12,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.14)"}}>
                    <div style={{fontSize:11,color:"#7dd3fc",textTransform:"uppercase",letterSpacing:"0.08em"}}>% de gordura</div>
                    <div style={{fontSize:20,fontWeight:800,marginTop:4}}>{formatMetricValue(dashboardBodyFatTrend.lastValue, "%")}</div>
                    <div style={{fontSize:12,color:"#cbd5e1",marginTop:6}}>Variação: {dashboardBodyFatTrend.delta === null ? "—" : `${dashboardBodyFatTrend.delta > 0 ? "+" : ""}${dashboardBodyFatTrend.delta.toFixed(1)}%`}</div>
                  </div>
                </div>
              </div>

              <div style={{padding:"14px",borderRadius:18,background:"rgba(15,23,42,0.58)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:10}}>Última dieta</div>
                {latestDiet ? (
                  <>
                    <div style={{fontSize:13,color:"#cbd5e1"}}>{latestDiet.objective === "cutting" ? "Plano de emagrecimento" : latestDiet.objective === "bulk" ? "Plano de ganho" : "Plano de manutenção"}</div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>{new Date(latestDiet.createdAt).toLocaleDateString("pt-BR")} • {latestDiet.targetKcal} kcal</div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>{latestDiet.numMeals} refeições</div>
                    <button onClick={() => handleOpenSavedDiet(latestDiet.id)} style={{...pB,marginTop:12,padding:"10px 14px",borderColor:"rgba(167,139,250,0.25)",color:"#c4b5fd",background:"rgba(167,139,250,0.08)"}}>
                      Abrir dieta
                    </button>
                  </>
                ) : (
                  <div style={{fontSize:13,color:"#94a3b8"}}>As dietas salvas vão aparecer aqui depois da primeira geração logada.</div>
                )}
              </div>

              <div style={{padding:"14px",borderRadius:18,background:"rgba(15,23,42,0.58)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:10}}>Último relatório</div>
                {latestReport ? (
                  <>
                    <div style={{fontSize:13,color:"#cbd5e1",lineHeight:1.45}}>{latestReport.title}</div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>{new Date(latestReport.createdAt).toLocaleDateString("pt-BR")}</div>
                    <button onClick={() => handleOpenSavedReport(latestReport.id)} style={{...pB,marginTop:12,padding:"10px 14px",borderColor:"rgba(249,115,22,0.25)",color:"#fdba74",background:"rgba(249,115,22,0.08)"}}>
                      Abrir relatório
                    </button>
                  </>
                ) : (
                  <div style={{fontSize:13,color:"#94a3b8"}}>Os relatórios salvos vão aparecer aqui depois do primeiro PDF gerado logado.</div>
                )}
              </div>
            </div>

            {dashboardLoading && (
              <div style={{marginTop:12,fontSize:12,color:"#94a3b8"}}>Atualizando resumo do painel...</div>
            )}
          </div>
        </div>
      )}

      {settingsOpen && (
        <div onClick={() => setSettingsOpen(false)} style={{position:"fixed",inset:0,zIndex:40,background:"rgba(3,7,18,0.42)"}}>
          <div onClick={(e) => e.stopPropagation()} style={{position:"absolute",top:88,right:24,width:"min(520px,calc(100vw - 32px))",padding:"18px 20px",borderRadius:18,background:"rgba(15,23,42,0.98)",border:"1px solid rgba(132,204,22,0.18)",boxShadow:"0 24px 80px rgba(0,0,0,0.35)",maxHeight:"calc(100vh - 112px)",overflowY:"auto",animation:"settingsPanelIn 0.22s ease-out"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#84cc16",fontWeight:700}}>Configuração</div>
                <div style={{fontSize:20,fontWeight:800}}>Regras da geração</div>
              </div>
              <button onClick={() => setSettingsOpen(false)} style={{background:"transparent",border:"none",color:"#94a3b8",fontSize:20,cursor:"pointer"}}>×</button>
            </div>

            {configError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{configError}</div>}
            {configLoading && <div style={{marginBottom:12,fontSize:13,color:"#94a3b8"}}>Carregando configuração central...</div>}

            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[
                { key:"prioridades", label:"Prioridades" },
                { key:"limites", label:"Limites" },
                { key:"base", label:"Base alimentar" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  style={{
                    ...pB,
                    padding:"8px 12px",
                    fontSize:12,
                    background:settingsTab===tab.key?"rgba(132,204,22,0.14)":"rgba(255,255,255,0.03)",
                    borderColor:settingsTab===tab.key?"#84cc16":"rgba(255,255,255,0.08)",
                    color:settingsTab===tab.key?"#a3e635":"#cbd5e1",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {settingsTab === "prioridades" && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <ConfigField label="Proteína principal café (%)" value={Math.round((generationConfig.primaryProteinShare?.cafe || 0) * 100)} onChange={(value) => setGenerationConfig((prev) => ({ ...prev, primaryProteinShare: { ...prev.primaryProteinShare, cafe: (Number(value) || 0) / 100 } }))} />
                  <ConfigField label="Proteína principal lanche (%)" value={Math.round((generationConfig.primaryProteinShare?.lanche || 0) * 100)} onChange={(value) => setGenerationConfig((prev) => ({ ...prev, primaryProteinShare: { ...prev.primaryProteinShare, lanche: (Number(value) || 0) / 100 } }))} />
                  <ConfigField label="Proteína principal almoço/jantar (%)" value={Math.round((generationConfig.primaryProteinShare?.principal || 0) * 100)} onChange={(value) => setGenerationConfig((prev) => ({ ...prev, primaryProteinShare: { ...prev.primaryProteinShare, principal: (Number(value) || 0) / 100 } }))} />
                </div>

                <div style={{marginBottom:8}}>
                  <label style={lS}>Preferência de carbo por índice glicêmico</label>
                  <CustomSelect
                    value={generationConfig.preferredCarbGlycemicIndex || "all"}
                    onChange={(nextValue) => setGenerationConfig((prev) => ({ ...prev, preferredCarbGlycemicIndex: nextValue }))}
                    options={[
                      { value: "all", label: "Sem preferência" },
                      { value: "baixo", label: "Priorizar IG baixo" },
                      { value: "baixo_medio", label: "Priorizar IG baixo e médio" },
                      { value: "medio", label: "Priorizar IG médio" },
                      { value: "alto", label: "Priorizar IG alto" },
                    ]}
                  />
                </div>
              </>
            )}

            {settingsTab === "limites" && (
              <>
                <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:10}}>Limites centrais fáceis de editar</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <ConfigField label="Leite máx. por refeição (ml)" value={generationConfig.foodLimitsByName?.["Leite desnatado"]?.max || 0} onChange={(value) => updateFoodLimit("Leite desnatado", "max", value)} />
                  <ConfigField label="Ovos máx. por refeição (g)" value={generationConfig.foodLimitsByName?.["Ovo inteiro cozido"]?.max || 0} onChange={(value) => updateFoodLimit("Ovo inteiro cozido", "max", value)} />
                  <ConfigField label="Whey máx. por refeição (g)" value={generationConfig.foodLimitsByName?.["Whey protein (30g)"]?.max || 0} onChange={(value) => updateFoodLimit("Whey protein (30g)", "max", value)} />
                  <ConfigField label="Caseína máx. por refeição (g)" value={generationConfig.foodLimitsByName?.["Caseína (30g)"]?.max || generationConfig.foodLimitsByName?.["Caseina (30g)"]?.max || 0} onChange={(value) => updateFoodLimit("Caseína (30g)", "max", value)} />
                  <ConfigField label="Carnes mín. refeição (g)" value={generationConfig.subgroupLimits?.ave_magra?.min || 0} onChange={(value) => updateSubgroupLimit("ave_magra", "min", value)} />
                  <ConfigField label="Carnes máx. refeição (g)" value={generationConfig.subgroupLimits?.ave_magra?.max || 0} onChange={(value) => updateSubgroupLimit("ave_magra", "max", value)} />
                </div>
              </>
            )}

            {settingsTab === "base" && (
              <>
                <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:10}}>Seed com papel alimentar</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {["core", "flex", "accessory"].map((role) => (
                    <div key={role} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                      <div style={{fontSize:11,color:"#84cc16",letterSpacing:"0.08em",textTransform:"uppercase"}}>{ROLE_LABELS[role]}</div>
                      <div style={{fontSize:24,fontWeight:800,marginTop:4}}>{planningRoleSummary[role] || 0}</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>
                        {role === "core" ? "Base da refeição" : role === "flex" ? "Pode liderar ou complementar" : "Usado como apoio"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{position:"relative",zIndex:10,padding:"16px 24px",display:"flex",gap:6}}>
        {[1,2,3,4,5,6].map(s=>(<div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?"linear-gradient(90deg,#84cc16,#a3e635)":"rgba(255,255,255,0.08)",transition:"all 0.4s"}}/>))}
      </div>
      <div style={{padding:"0 24px 8px",fontSize:12,color:"#64748b",position:"relative",zIndex:10}}>STEP {step} DE 6</div>

      <main style={{position:"relative",zIndex:10,maxWidth:720,margin:"0 auto",padding:"0 24px 80px"}}>

        {/* STEP 1 */}
        {step===1&&(<div style={{animation:"fadeIn 0.4s"}}>
          <h1 style={h1S}>Dados para montar a dieta</h1><p style={dS}>Seus dados vieram do perfil. Aqui você só confirma as informações e escolhe o nível de atividade.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
            {[
              { label:"Nome", value:userName || authUser?.name || "—" },
              { label:"Peso", value:formatMetricValue(ud.weight, " kg") },
              { label:"Altura", value:formatMetricValue(ud.height, " cm") },
              { label:"Idade", value:formatMetricValue(ud.age, " anos") },
              { label:"Sexo", value:ud.sex==="M"?"Masculino":ud.sex==="F"?"Feminino":"—" },
            ].map((item)=>(
              <div key={item.label} style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                <div style={{fontSize:16,fontWeight:800,color:"#e2e8f0",marginTop:6,lineHeight:1.35}}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap",padding:"12px 14px",borderRadius:14,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.16)"}}>
            <div style={{fontSize:13,color:"#d9f99d"}}>Se precisar corrigir peso, altura, sexo ou data de nascimento, volte ao perfil antes de continuar.</div>
            <button onClick={() => { setProfileOpen(true); setProfileError(""); setProfileNotice(""); }} style={{...pB,padding:"10px 14px",borderColor:"rgba(132,204,22,0.24)",color:"#a3e635",background:"rgba(132,204,22,0.08)"}}>Editar perfil</button>
          </div>
          <label style={lS}>Nível de atividade</label>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
            {ACT.map((a,i)=>(<button key={i} onClick={()=>setUd(p=>({...p,al:i}))} style={{...pB,textAlign:"left",padding:"12px 16px",background:ud.al===i?"rgba(132,204,22,0.1)":"rgba(255,255,255,0.03)",borderColor:ud.al===i?"#84cc16":"rgba(255,255,255,0.08)"}}><span style={{color:ud.al===i?"#84cc16":"#e2e8f0",fontWeight:600}}>{a.label}</span><span style={{color:"#64748b",fontSize:13,marginLeft:8}}>{a.desc}</span></button>))}
          </div>
          {foodsLoading&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:8,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.25)",color:"#84cc16",fontSize:13}}>Carregando alimentos da API...</div>}
          {foodsError&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><span>{foodsError}</span><button onClick={()=>setFoodsReloadKey(k=>k+1)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,0.35)",background:"rgba(239,68,68,0.12)",color:"#fecaca",cursor:"pointer"}}>Tentar novamente</button></div>}
          <NB onClick={()=>setStep(2)} disabled={foodsLoading||!!foodsError||!ud.weight||!ud.height||!ud.age||!ud.sex}/>
        </div>)}

        {/* STEP 2 */}
        {step===2&&(<div style={{animation:"fadeIn 0.4s"}}>
          <h1 style={h1S}>TDEE e objetivo</h1><p style={dS}>Seu gasto energético e meta calórica calculados pelo backend.</p>
          <div style={{textAlign:"center",padding:"32px 24px",marginBottom:32,background:"rgba(132,204,22,0.05)",borderRadius:16,border:"1px solid rgba(132,204,22,0.15)"}}>
            <div style={{fontSize:13,color:"#84cc16",fontWeight:600,marginBottom:8,letterSpacing:"0.1em"}}>SEU TDEE</div>
            <div style={{fontSize:56,fontWeight:900,color:"#84cc16",fontFamily:"'JetBrains Mono',monospace"}}>{tdeeLoading?"...":tdee}</div>
            <div style={{fontSize:16,color:"#94a3b8"}}>kcal / dia</div>
          </div>
          {tdeeError&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",fontSize:13}}>{tdeeError}</div>}
          <label style={lS}>Objetivo</label>
          <div style={{display:"flex",gap:8,marginBottom:24}}>
            {[{k:"cutting",l:"Cutting",c:"#ef4444"},{k:"maintenance",l:"Manutenção",c:"#84cc16"},{k:"bulk",l:"Bulking",c:"#3b82f6"}].map(o=>(<button key={o.k} onClick={()=>setObj(o.k)} style={{...pB,flex:1,background:obj===o.k?`${o.c}15`:"rgba(255,255,255,0.03)",borderColor:obj===o.k?o.c:"rgba(255,255,255,0.08)",color:obj===o.k?o.c:"#94a3b8",fontWeight:600}}>{o.l}</button>))}
          </div>
          {obj!=="maintenance"&&(<div style={{marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#94a3b8"}}>{obj==="cutting"?"Déficit":"Superávit"}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:obj==="cutting"?"#ef4444":"#3b82f6"}}>{objPct>0?"+":""}{objPct}%</span></div>
            <input type="range" min={obj==="cutting"?-30:5} max={obj==="cutting"?-5:30} value={objPct} onChange={e=>setObjPct(parseInt(e.target.value))} style={{width:"100%",accentColor:obj==="cutting"?"#ef4444":"#3b82f6"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span>{obj==="cutting"?"-30%":"+5%"}</span><span>{obj==="cutting"?"-5%":"+30%"}</span></div>
          </div>)}
          <div style={{textAlign:"center",padding:20,borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",marginBottom:32}}>
            <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>META CALÓRICA DIÁRIA</div>
            <div style={{fontSize:36,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:obj==="cutting"?"#ef4444":obj==="bulk"?"#3b82f6":"#84cc16"}}>{adjKcal} <span style={{fontSize:16,fontWeight:400}}>kcal</span></div>
          </div>
          <div style={{display:"flex",gap:12}}><BB onClick={()=>setStep(1)}/><NB onClick={()=>setStep(3)} disabled={tdeeLoading||!!tdeeError||!tdee}/></div>
        </div>)}

        {/* STEP 3 */}
        {step===3&&(<div style={{animation:"fadeIn 0.4s"}}>
          <h1 style={h1S}>Macronutrientes</h1><p style={dS}>Escolha uma estrutura pronta e refine em g/kg se quiser.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
            {MACRO_PRESETS.map(preset=>(
              <button
                key={preset.key}
                onClick={()=>setMc(preset.values)}
                style={{
                  ...pB,
                  padding:"12px 14px",
                  textAlign:"left",
                  background:activeMacroPreset===preset.key?"rgba(132,204,22,0.15)":"rgba(255,255,255,0.03)",
                  borderColor:activeMacroPreset===preset.key?"#84cc16":"rgba(255,255,255,0.08)",
                  color:activeMacroPreset===preset.key?"#84cc16":"#e2e8f0"
                }}
              >
                <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{preset.label}</div>
                <div style={{fontSize:11,color:"#94a3b8",fontFamily:"'JetBrains Mono',monospace"}}>P {preset.values.p} | C {preset.values.c} | G {preset.values.f}</div>
              </button>
            ))}
          </div>
          <div style={{marginBottom:20,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontSize:12,color:"#94a3b8"}}>
            Estrutura atual: <span style={{color:activeMacroPreset==="custom"?"#facc15":"#84cc16",fontWeight:700}}>{activeMacroPreset==="custom"?"Personalizada":MACRO_PRESETS.find(p=>p.key===activeMacroPreset)?.label}</span>
          </div>
          {[{key:"p",label:"Proteína",color:"#ef4444",min:1,max:3.5,st:0.1,mul:4},{key:"c",label:"Carboidrato",color:"#f59e0b",min:0.5,max:7,st:0.1,mul:4},{key:"f",label:"Gordura",color:"#3b82f6",min:0.3,max:2,st:0.05,mul:9}].map(m=>{
            const g=Math.round(mc[m.key]*ud.weight),k=g*m.mul;
            return(<div key={m.key} style={{padding:"16px 20px",borderRadius:12,marginBottom:12,background:`${m.color}08`,border:`1px solid ${m.color}25`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}><span style={{fontWeight:600,color:m.color}}>{m.label}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14}}><span style={{color:m.color,fontWeight:700,fontSize:20}}>{mc[m.key]}</span> g/kg</span></div>
              <input type="range" min={m.min} max={m.max} step={m.st} value={mc[m.key]} onChange={e=>setMc(p=>({...p,[m.key]:parseFloat(e.target.value)}))} style={{width:"100%",accentColor:m.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#94a3b8",marginTop:6}}><span>{g}g total</span><span>{k} kcal</span></div>
            </div>);
          })}
          <div style={{padding:"16px 20px",borderRadius:12,marginTop:20,marginBottom:32,background:Math.abs(mg.kcal-adjKcal)<=50?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${Math.abs(mg.kcal-adjKcal)<=50?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,color:"#64748b",marginBottom:2}}>KCAL MACROS</div><div style={{fontSize:24,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{mg.kcal}</div></div>
              <div style={{fontSize:24,color:"#475569"}}>vs</div>
              <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"#64748b",marginBottom:2}}>META</div><div style={{fontSize:24,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{adjKcal}</div></div>
            </div>
            <div style={{textAlign:"center",marginTop:8,fontSize:13,fontWeight:600,color:Math.abs(mg.kcal-adjKcal)<=50?"#22c55e":"#ef4444"}}>{Math.abs(mg.kcal-adjKcal)<=50?"✓ Dentro da margem (±50 kcal)":`⚠ Diferença de ${Math.abs(mg.kcal-adjKcal)} kcal`}</div>
          </div>
          <div style={{display:"flex",gap:12}}><BB onClick={()=>setStep(2)}/><NB onClick={()=>setStep(4)} disabled={Math.abs(mg.kcal-adjKcal)>50}/></div>
        </div>)}

        {/* STEP 4 */}
        {step===4&&(<div style={{animation:"fadeIn 0.4s"}}>
          <h1 style={h1S}>Escolha seus alimentos</h1><p style={dS}>Marque ★ nos favoritos — priorizados na dieta. Alimentos são filtrados por tipo de refeição automaticamente.</p>
          {foodsError&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><span>{foodsError}</span><button onClick={()=>setFoodsReloadKey(k=>k+1)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,0.35)",background:"rgba(239,68,68,0.12)",color:"#fecaca",cursor:"pointer"}}>Recarregar</button></div>}
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {[{l:"Proteínas",c:selCount.p,mn:4,cl:"#ef4444",fv:favC.p,fm:2},{l:"Carboidratos",c:selCount.c,mn:6,cl:"#f59e0b",fv:favC.c,fm:3},{l:"Gorduras",c:selCount.f,mn:2,cl:"#3b82f6",fv:favC.f,fm:1}].map(r=>(<div key={r.l} style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:r.c>=r.mn?`${r.cl}12`:"rgba(255,255,255,0.05)",border:`1px solid ${r.c>=r.mn?r.cl:"rgba(255,255,255,0.1)"}`,color:r.c>=r.mn?r.cl:"#94a3b8"}}><div>{r.c>=r.mn?"✓":""} {r.c}/{r.mn} {r.l}</div><div style={{fontSize:10,color:"#facc15",marginTop:2}}>★ {r.fv}/{r.fm} fav</div></div>))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{k:"all",l:"Todos"},{k:"protein",l:"Proteínas",c:"#ef4444"},{k:"carb",l:"Carboidratos",c:"#f59e0b"},{k:"fat",l:"Gorduras",c:"#3b82f6"}].map(f=>(<button key={f.k} onClick={()=>setFFilter(f.k)} style={{...pB,padding:"6px 14px",fontSize:12,background:fFilter===f.k?(f.c?`${f.c}15`:"rgba(132,204,22,0.1)"):"transparent",borderColor:fFilter===f.k?(f.c||"#84cc16"):"rgba(255,255,255,0.08)",color:fFilter===f.k?(f.c||"#84cc16"):"#64748b"}}>{f.l}</button>))}
          </div>
          {(fFilter==="all"||fFilter==="carb")&&(
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[{k:"all",l:"Todos"},{k:"baixo",l:"IG baixo"},{k:"medio",l:"IG médio"},{k:"alto",l:"IG alto"}].map(f=>(
                <button key={f.k} onClick={()=>setCarbGlycemicFilter(f.k)} style={{...pB,padding:"6px 12px",fontSize:11,background:carbGlycemicFilter===f.k?"rgba(56,189,248,0.14)":"transparent",borderColor:carbGlycemicFilter===f.k?"#38bdf8":"rgba(255,255,255,0.08)",color:carbGlycemicFilter===f.k?"#38bdf8":"#64748b"}}>
                  {f.l}
                </button>
              ))}
            </div>
          )}
          <input placeholder="Buscar alimento..." value={fSearch} onChange={e=>setFSearch(e.target.value)} style={{...iS,marginBottom:16,width:"100%",boxSizing:"border-box"}}/>
          {(fFilter==="all"||fFilter==="protein")&&<FS title="Proteínas" sub="Fav: até 2" color="#ef4444" foods={foodsByCategory.protein} sel={selIds} fav={favIds} onT={togSel} onF={togFav} search={fSearch}/>}
          {(fFilter==="all"||fFilter==="carb")&&<FS title="Carboidratos" sub="Fav: até 3" color="#f59e0b" foods={foodsByCategory.carb} sel={selIds} fav={favIds} onT={togSel} onF={togFav} search={fSearch} glyFilter={carbGlycemicFilter}/>}
          {(fFilter==="all"||fFilter==="fat")&&<FS title="Gorduras" sub="Fav: até 1" color="#3b82f6" foods={foodsByCategory.fat} sel={selIds} fav={favIds} onT={togSel} onF={togFav} search={fSearch}/>}
          <div style={{display:"flex",gap:12,marginTop:24}}><BB onClick={()=>setStep(3)}/><NB onClick={()=>setStep(5)} disabled={!canAdv4} label={canAdv4?"Próximo":"Selecione os mínimos"}/></div>
        </div>)}

        {/* STEP 5 */}
        {step===5&&(<div style={{animation:"fadeIn 0.4s"}}>
          <h1 style={h1S}>Peso das refeições</h1><p style={dS}>Arraste a barra da refeição e o restante do dia se ajusta automaticamente.</p>
          {generateError&&<div style={{marginBottom:16,padding:"10px 16px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",fontSize:13}}>{generateError}</div>}
          <label style={lS}>Número de refeições</label>
          <div style={{display:"flex",gap:8,marginBottom:28}}>{[3,4,5,6].map(n=>(<button key={n} onClick={()=>setNMeals(n)} style={{...pB,flex:1,background:nMeals===n?"rgba(132,204,22,0.15)":"rgba(255,255,255,0.03)",borderColor:nMeals===n?"#84cc16":"rgba(255,255,255,0.08)",color:nMeals===n?"#84cc16":"#94a3b8",fontWeight:700,fontSize:18}}>{n}</button>))}</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mealShares.map((share,i)=>(
              <div key={labels[i]} style={{padding:"16px 18px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{labels[i]}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:800,color:"#84cc16"}}>{share}%</span>
                </div>
                <input type="range" min={0} max={100} step={1} value={share} onChange={e=>updMealShare(i,e.target.value)} style={{width:"100%",accentColor:"#84cc16"}}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"12px 16px",borderRadius:10,background:dSum()===100?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${dSum()===100?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>Distribuição total do dia</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:800,color:dSum()===100?"#22c55e":"#ef4444"}}>{dSum()}%</span>
          </div>
          {dSum()!==100&&<div style={{marginTop:12,padding:"10px 16px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",fontSize:13}}>⚠ As refeições precisam fechar 100% do dia.</div>}
          <div style={{display:"flex",gap:12,marginTop:28}}><BB onClick={()=>setStep(4)}/><NB onClick={doGenerate} label={isGenerating?"Gerando...":"Gerar dieta"} disabled={isGenerating||dSum()!==100}/></div>
        </div>)}

        {/* STEP 6 */}
        {step===6&&diet&&(<div style={{animation:"fadeIn 0.4s"}}>
          {(() => {
            const displayTargetKcal = diet.targetKcal ?? adjKcal;
            const displayTargetProt = diet.targetMacros?.protGrams ?? mg.p;
            const displayTargetCarb = diet.targetMacros?.carbGrams ?? mg.c;
            const displayTargetFat = diet.targetMacros?.fatGrams ?? mg.f;
            const displayCreatedAt = diet.createdAt ? new Date(diet.createdAt).toLocaleDateString("pt-BR") : "";
            return (
              <>
          <h1 style={h1S}>Sua dieta</h1>
          <p style={dS}>
            Alimentos filtrados por tipo de refeição. Substituições coerentes por categoria. ★ = favorito.
            {displayCreatedAt ? ` Dieta salva em ${displayCreatedAt}.` : ""}
          </p>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {[{l:"META",v:`${displayTargetKcal}`,c:"#84cc16"},{l:"PROT",v:`${displayTargetProt}g`,c:"#ef4444"},{l:"CARB",v:`${displayTargetCarb}g`,c:"#f59e0b"},{l:"GORD",v:`${displayTargetFat}g`,c:"#3b82f6"}].map(c=>(<div key={c.l} style={{flex:1,minWidth:70,padding:"10px 10px",borderRadius:10,background:`${c.c}08`,border:`1px solid ${c.c}25`,textAlign:"center"}}><div style={{fontSize:9,color:c.c,fontWeight:600,letterSpacing:"0.1em"}}>{c.l}</div><div style={{fontSize:15,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{c.v}</div></div>))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{k:"protein",l:"Lista prot",c:"#ef4444"},{k:"carb",l:"Lista carb",c:"#f59e0b"},{k:"fat",l:"Lista gord",c:"#3b82f6"}].map(s=>(<button key={s.k} onClick={()=>setShowSL(showSL===s.k?null:s.k)} style={{...pB,padding:"6px 10px",fontSize:11,background:showSL===s.k?`${s.c}15`:"transparent",borderColor:showSL===s.k?s.c:"rgba(255,255,255,0.1)",color:showSL===s.k?s.c:"#64748b"}}>{s.l}</button>))}
          </div>
          {showSL&&diet.subLists&&(<div style={{marginBottom:16,padding:"14px",borderRadius:12,background:`${RC[showSL]}06`,border:`1px solid ${RC[showSL]}20`,maxHeight:240,overflowY:"auto"}}>
            <div style={{fontSize:11,fontWeight:700,color:RC[showSL],marginBottom:8,letterSpacing:"0.05em"}}>SUBSTITUIÇÕES — {RL[showSL]}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:5}}>
              {diet.subLists[showSL].map(f=>(<div key={f.id} style={{padding:"7px 9px",borderRadius:6,background:"rgba(255,255,255,0.03)",border:`1px solid ${favIds.has(f.id)?"#facc1540":"rgba(255,255,255,0.06)"}`,fontSize:11}}><div style={{fontWeight:500,color:"#e2e8f0",marginBottom:2}}>{favIds.has(f.id)&&<span style={{color:"#facc15",marginRight:3}}>★</span>}{f.name}</div><div style={{color:"#64748b",fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>P:{f.prot} C:{f.carb} G:{f.fat} | {f.kcal}kcal</div></div>))}
            </div>
          </div>)}

          {diet.meals.map(meal=>{
            const mt=meal.foods.reduce((a,f)=>{const r=f.grams/100;return{kcal:a.kcal+Math.round(f.kcal*r),prot:a.prot+ +(f.prot*r).toFixed(1),carb:a.carb+ +(f.carb*r).toFixed(1),fat:a.fat+ +(f.fat*r).toFixed(1)};},{kcal:0,prot:0,carb:0,fat:0});
            return(<div key={meal.num} style={{marginBottom:14,borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
              <div style={{padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <span style={{fontWeight:700,fontSize:14}}>{meal.label}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"#84cc16",fontSize:13}}>{mt.kcal} kcal</span>
              </div>
              {meal.foods.map((food,fi)=>{
                const sk=`${meal.num}-${fi}`,isE=expSubs.has(sk);
                return(<div key={fi}>
                  <div onClick={()=>food.subs?.length>0&&togExp(sk)} style={{padding:"9px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:food.subs?.length>0?"pointer":"default"}}>
                    <span style={{fontSize:8,fontWeight:800,padding:"2px 5px",borderRadius:3,background:`${RC[food.role]}20`,color:RC[food.role],letterSpacing:"0.05em"}}>{RL[food.role]}</span>
                    {food.isFav&&<span style={{color:"#facc15",fontSize:11}}>★</span>}
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{food.name}</div><div style={{fontSize:10,color:"#64748b",fontFamily:"'JetBrains Mono',monospace"}}>P:{(food.prot*food.grams/100).toFixed(1)}g C:{(food.carb*food.grams/100).toFixed(1)}g G:{(food.fat*food.grams/100).toFixed(1)}g</div></div>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13,color:"#e2e8f0",minWidth:86,textAlign:"right"}}>{formatPortion(food.name, food.grams)}</span>
                    {food.subs?.length>0&&<span style={{fontSize:9,color:"#64748b",transform:isE?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span>}
                  </div>
                  {isE&&food.subs?.map((sub,si)=>(<div key={si} style={{padding:"5px 16px 5px 44px",background:"rgba(132,204,22,0.02)",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:11,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:"#84cc16",fontSize:10}}>↻</span><span style={{color:"#94a3b8",flex:1}}>{sub.name}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#64748b",fontSize:10}}>P:{(sub.prot*sub.grams/100).toFixed(1)} C:{(sub.carb*sub.grams/100).toFixed(1)} G:{(sub.fat*sub.grams/100).toFixed(1)}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#94a3b8",fontSize:10,minWidth:86,textAlign:"right"}}>{formatPortion(sub.name, sub.grams)}</span>
                  </div>))}
                </div>);
              })}
              <div style={{padding:"7px 16px",display:"flex",justifyContent:"space-between",background:"rgba(255,255,255,0.02)",fontSize:10,color:"#64748b",fontFamily:"'JetBrains Mono',monospace"}}>
                <span>P:{mt.prot.toFixed(1)}g</span><span>C:{mt.carb.toFixed(1)}g</span><span>G:{mt.fat.toFixed(1)}g</span><span style={{color:"#84cc16",fontWeight:600}}>{mt.kcal} kcal</span>
              </div>
            </div>);
          })}

          {(()=>{ 
            const gt=diet.meals.reduce((a,m)=>{m.foods.forEach(f=>{const r=f.grams/100;a.kcal+=Math.round(f.kcal*r);a.prot+=f.prot*r;a.carb+=f.carb*r;a.fat+=f.fat*r;});return a;},{kcal:0,prot:0,carb:0,fat:0});
            const diff=Math.abs(gt.kcal-displayTargetKcal),pct=((diff/Math.max(displayTargetKcal,1))*100).toFixed(1);
            return(<div style={{padding:"16px 20px",borderRadius:12,marginTop:8,background:diff<=displayTargetKcal*0.05?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${diff<=displayTargetKcal*0.05?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"}`}}>
              <div style={{textAlign:"center",marginBottom:8,fontSize:11,color:"#64748b",letterSpacing:"0.1em"}}>TOTAL DO DIA</div>
              <div style={{display:"flex",justifyContent:"space-around",fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13,flexWrap:"wrap",gap:4}}>
                <span style={{color:"#ef4444"}}>P:{Math.round(gt.prot)}g</span><span style={{color:"#f59e0b"}}>C:{Math.round(gt.carb)}g</span><span style={{color:"#3b82f6"}}>G:{Math.round(gt.fat)}g</span><span style={{color:"#84cc16",fontSize:17}}>{gt.kcal} kcal</span>
              </div>
              <div style={{textAlign:"center",marginTop:8,fontSize:12,color:diff<=displayTargetKcal*0.05?"#22c55e":"#ef4444"}}>{diff<=displayTargetKcal*0.05?`✓ Dentro da margem (${pct}%)`:`⚠ ${pct}% de diferença`}</div>
            </div>);
          })()}

          <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
            <BB onClick={()=>setStep(5)}/>
            <button onClick={()=>{setDiet(null);setExpSubs(new Set());setShowSL(null);doGenerate();}} style={{...nBS,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",flex:"none",padding:"14px 20px"}}>↻ Regerar</button>
            <button onClick={handleStartNewDiet} style={{...nBS,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.24)",color:"#bfdbfe",flex:"none",padding:"14px 20px"}}>
              + Nova dieta
            </button>
            <button onClick={genPDF} disabled={pdfLoading} style={{...nBS,flex:"none",padding:"14px 20px",background:pdfLoading?"#475569":"linear-gradient(135deg,#84cc16,#65a30d)"}}>
              {pdfLoading?"Gerando...":"Gerar relatório"}
            </button>
          </div>
              </>
            );
          })()}
        </div>)}
      </main>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes settingsPanelIn{from{opacity:0;transform:translateY(-10px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}input[type="range"]{height:6px;-webkit-appearance:none;background:rgba(255,255,255,0.1);border-radius:3px;outline:none}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:currentColor;cursor:pointer;border:2px solid rgba(0,0,0,0.3)}select{background:var(--field-bg);color:var(--field-fg)}option{background:#ffffff;color:#0f172a}option:checked{background:#2563eb;color:#ffffff}input::placeholder,textarea::placeholder{color:var(--field-placeholder);opacity:1}`}</style>
    </div>
  );
}

function PublicExperience({
  authError,
  authForm,
  authLoading,
  authMode,
  authNotice,
  googleClientId,
  onChangeAuthMode,
  onGoogleCredential,
  onNavigatePage,
  onPasswordReset,
  onResetPasswordSubmit,
  onSubmit,
  onUpdateField,
  publicPage,
  themeVars,
}) {
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === "undefined" ? 1280 : window.innerWidth
  ));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const viewport = {
    width: viewportWidth,
    isMobile: viewportWidth < 768,
    isTablet: viewportWidth < 1024,
  };

  const publicShellStyle = {
    ...themeVars,
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(132,204,22,0.16), transparent 26%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 24%), linear-gradient(180deg, #08111f 0%, #0a0e1a 48%, #071018 100%)",
    color: "var(--app-text)",
    fontFamily: "'Outfit','Segoe UI',sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const handlePrimaryCta = (mode) => {
    onChangeAuthMode(mode);
  };

  const sharedLayoutProps = {
    onEnter: () => handlePrimaryCta("login"),
    onCreateAccount: () => handlePrimaryCta("register"),
    onNavigatePage,
    viewport,
  };

  if (publicPage === "auth") {
    return (
      <AuthModal
        authError={authError}
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authNotice={authNotice}
        googleClientId={googleClientId}
        onBackToLanding={() => onNavigatePage("landing")}
        onChangeMode={onChangeAuthMode}
        onGoogleCredential={onGoogleCredential}
        onNavigatePage={onNavigatePage}
        onPasswordReset={onPasswordReset}
        onResetPasswordSubmit={onResetPasswordSubmit}
        onSubmit={onSubmit}
        themeVars={themeVars}
        onUpdateField={onUpdateField}
      />
    );
  }

  let content = null;
  if (publicPage === "privacy") {
    content = <PrivacyPage {...sharedLayoutProps} />;
  } else if (publicPage === "terms") {
    content = <TermsPage {...sharedLayoutProps} />;
  } else if (publicPage === "methodology") {
    content = <MethodologyPage {...sharedLayoutProps} />;
  } else {
    content = <MarketingHome {...sharedLayoutProps} />;
  }

  return (
    <div style={publicShellStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,zIndex:0,opacity:0.05,backgroundImage:"linear-gradient(rgba(132,204,22,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.16) 1px,transparent 1px)",backgroundSize:"42px 42px",pointerEvents:"none"}} />
      <PublicHeader {...sharedLayoutProps} currentPage={publicPage} viewport={viewport} />
      <div style={{position:"relative",zIndex:1}}>{content}</div>
      <PublicFooter {...sharedLayoutProps} viewport={viewport} />
    </div>
  );
}

function PublicHeader({ currentPage, onCreateAccount, onEnter, onNavigatePage, viewport }) {
  const navButtonStyle = {
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.03)",
    color: "#cbd5e1",
    borderRadius: 999,
    padding: viewport.isMobile ? "10px 14px" : "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <header style={{position:"sticky",top:0,zIndex:5,padding:viewport.isMobile?"8px 14px 4px":"18px 24px 8px",backdropFilter:viewport.isMobile?"blur(8px)":"blur(18px)",background:viewport.isMobile?"linear-gradient(180deg,rgba(8,17,31,0.88),rgba(8,17,31,0.56))":"transparent"}}>
      <div style={{maxWidth:1180,margin:"0 auto",display:"flex",alignItems:viewport.isMobile?"stretch":"center",justifyContent:"space-between",gap:viewport.isMobile?12:18,flexWrap:"wrap",flexDirection:viewport.isMobile?"column":"row"}}>
        <button onClick={() => onNavigatePage("landing")} style={{display:"flex",alignItems:"center",gap:12,background:"transparent",border:"none",color:"#e2e8f0",cursor:"pointer",padding:0}}>
          <div style={{width:42,height:42,borderRadius:14,background:"linear-gradient(135deg,#84cc16,#65a30d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#0f172a",boxShadow:"0 16px 32px rgba(101,163,13,0.24)"}}>N</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:21,fontWeight:800,letterSpacing:"-0.03em"}}>Nutri<span style={{color:"#84cc16"}}>Calc</span></div>
            <div style={{fontSize:viewport.isMobile?11:12,color:"#94a3b8"}}>Planejamento alimentar com histórico pessoal</div>
          </div>
        </button>

        <div style={{display:viewport.isMobile?"grid":"flex",gridTemplateColumns:viewport.isMobile?"repeat(2, minmax(0, 1fr))":undefined,alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:viewport.isMobile?"stretch":"flex-end",width:viewport.isMobile?"100%":"auto"}}>
          {[
            { key: "methodology", label: "Metodologia" },
            { key: "privacy", label: "Privacidade" },
            { key: "terms", label: "Termos" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigatePage(item.key)}
              style={{
                ...navButtonStyle,
                borderColor: currentPage === item.key ? "rgba(132,204,22,0.34)" : "rgba(255,255,255,0.09)",
                background: currentPage === item.key ? "rgba(132,204,22,0.12)" : navButtonStyle.background,
                color: currentPage === item.key ? "#d9f99d" : navButtonStyle.color,
                width: viewport.isMobile ? "100%" : "auto",
              }}
            >
              {item.label}
            </button>
          ))}
          <button onClick={onEnter} style={{...navButtonStyle,borderColor:"rgba(132,204,22,0.26)",color:"#d9f99d",width:viewport.isMobile ? "100%" : "auto"}}>Entrar</button>
          <button onClick={onCreateAccount} style={{border:"none",borderRadius:999,padding:"11px 18px",cursor:"pointer",fontSize:13,fontWeight:800,background:"linear-gradient(135deg,#84cc16,#65a30d)",color:"#0f172a",boxShadow:"0 18px 32px rgba(101,163,13,0.24)",width:viewport.isMobile ? "100%" : "auto",gridColumn:viewport.isMobile ? "1 / -1" : "auto"}}>Criar conta</button>
        </div>
      </div>
    </header>
  );
}

function MarketingHome({ onCreateAccount, onEnter, onNavigatePage, viewport }) {
  const sectionWrap = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" };
  const cardStyle = {
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(9,14,26,0.78))",
    boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
  };
  const softCardStyle = {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  };

  return (
    <>
      <section style={{padding:viewport.isMobile?"18px 0 16px":"34px 0 26px"}}>
        <div style={{...sectionWrap,padding:viewport.isMobile?"0 14px":"0 24px",display:"grid",gridTemplateColumns:viewport.isTablet?"1fr":"minmax(0,1.15fr) minmax(320px,0.85fr)",gap:viewport.isMobile?16:28,alignItems:"stretch"}}>
          <div style={{...cardStyle,padding:viewport.isMobile?"20px 16px":"32px 30px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:viewport.isMobile?"8px 12px":"9px 14px",borderRadius:999,background:"rgba(132,204,22,0.1)",border:"1px solid rgba(132,204,22,0.16)",fontSize:viewport.isMobile?11:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#d9f99d"}}>
              Nutrição com histórico e acompanhamento
            </div>
            <h1 style={{fontSize:viewport.isMobile?"clamp(28px,9vw,36px)":"clamp(40px,6vw,68px)",lineHeight:viewport.isMobile?1.04:0.95,letterSpacing:viewport.isMobile?"-0.05em":"-0.06em",margin:viewport.isMobile?"14px 0 12px":"18px 0 16px",maxWidth:720}}>
              Seu planejamento alimentar em um painel claro, privado e pronto para evoluir com você.
            </h1>
            <p style={{fontSize:viewport.isMobile?15:18,lineHeight:viewport.isMobile?1.6:1.65,color:"#cbd5e1",maxWidth:700,margin:0}}>
              O NutriCalc reúne cálculo energético, geração de dieta, relatórios e histórico corporal em uma única conta. Você entra, organiza seu perfil e acompanha a evolução sem perder contexto entre uma sessão e outra.
            </p>

            <div style={{display:"flex",gap:12,marginTop:viewport.isMobile?20:26,flexWrap:"wrap",flexDirection:viewport.isMobile?"column":"row"}}>
              <button onClick={onEnter} style={{border:"none",borderRadius:999,padding:"15px 22px",cursor:"pointer",fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#84cc16,#65a30d)",color:"#0f172a",width:viewport.isMobile?"100%":"auto"}}>Entrar</button>
              <button onClick={onCreateAccount} style={{border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,padding:"15px 22px",cursor:"pointer",fontSize:15,fontWeight:700,background:"rgba(255,255,255,0.03)",color:"#e2e8f0",width:viewport.isMobile?"100%":"auto"}}>Criar conta</button>
              <button onClick={() => onNavigatePage("methodology")} style={{border:"1px solid rgba(59,130,246,0.22)",borderRadius:999,padding:"15px 22px",cursor:"pointer",fontSize:15,fontWeight:700,background:"rgba(59,130,246,0.08)",color:"#bfdbfe",width:viewport.isMobile?"100%":"auto"}}>Ver metodologia</button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginTop:viewport.isMobile?22:28}}>
              {[
                { value: "Conta individual", label: "Acesso pessoal com histórico privado" },
                { value: "Fluxo contínuo", label: "Dietas, relatórios e evolução no mesmo lugar" },
                { value: "Base técnica", label: "Metodologia, regras e contexto explicados publicamente" },
              ].map((item) => (
                <div key={item.value} style={{padding:"16px 18px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#f8fafc"}}>{item.value}</div>
                  <div style={{fontSize:13,lineHeight:1.5,color:"#94a3b8",marginTop:6}}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{...cardStyle,padding:viewport.isMobile?"16px":"24px",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:viewport.isMobile?14:18}}>
            <div style={{display:"grid",gap:14}}>
              <div style={{padding:"18px 18px 16px",borderRadius:22,background:"linear-gradient(135deg, rgba(132,204,22,0.12), rgba(59,130,246,0.08))",border:"1px solid rgba(132,204,22,0.18)"}}>
                <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#d9f99d"}}>Dentro do sistema</div>
                <div style={{fontSize:viewport.isMobile?21:24,fontWeight:800,marginTop:8,lineHeight:1.15}}>A conta vira o centro do acompanhamento, não só um acesso técnico.</div>
              </div>
              {[
                ["Perfil pessoal", "Nome, dados corporais, avatar e auditoria básica ajudam a manter um histórico consistente."],
                ["Dietas e relatórios", "O sistema salva o que foi gerado para evitar repetição e permitir revisão com contexto."],
                ["Evolução corporal", "Peso, altura, idade e percentual de gordura ficam organizados para comparação ao longo do tempo."],
              ].map(([title, description]) => (
                <div key={title} style={{padding:"16px 18px",borderRadius:18,background:"rgba(15,23,42,0.62)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#f8fafc"}}>{title}</div>
                  <div style={{fontSize:13,lineHeight:1.6,color:"#94a3b8",marginTop:6}}>{description}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 18px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#93c5fd"}}>Aviso importante</div>
              <div style={{fontSize:14,lineHeight:1.6,color:"#cbd5e1",marginTop:8}}>
                O NutriCalc apoia organização e planejamento alimentar. Ele não substitui avaliação de nutricionista, médico ou outro profissional de saúde.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:viewport.isMobile?"8px 0 8px":"12px 0 10px"}}>
        <div style={{...sectionWrap,padding:viewport.isMobile?"0 14px":"0 24px"}}>
          <div style={{...cardStyle,padding:viewport.isMobile?"22px 18px":"28px 26px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#93c5fd"}}>O que a pessoa encontra aqui</div>
                <div style={{fontSize:viewport.isMobile?24:30,fontWeight:800,letterSpacing:"-0.04em",marginTop:10,lineHeight:1.08}}>Uma entrada pública que explica o sistema antes de pedir login.</div>
              </div>
              <div style={{fontSize:14,lineHeight:1.7,color:"#94a3b8",maxWidth:420}}>
                Em vez de jogar a pessoa direto na autenticação, a home passa propósito, benefícios, segurança e contexto metodológico antes da decisão de entrar.
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:viewport.isMobile?18:22}}>
              {[
                { title: "Monte seu perfil", text: "Crie uma conta, complete os dados essenciais e deixe a base pronta para o sistema trabalhar com contexto." },
                { title: "Gere e salve dietas", text: "Centralize planos, relatórios e revisões sem depender de planilhas ou anotações soltas." },
                { title: "Acompanhe sua evolução", text: "Use o histórico corporal e de relatórios para enxergar continuidade e tomar decisões melhores." },
                { title: "Proteja o histórico", text: "Os dados ficam vinculados à sua conta, com acesso individual e rastros básicos de atividade." },
              ].map((item) => (
                <div key={item.title} style={{...softCardStyle,padding:"22px 20px"}}>
                  <div style={{fontSize:17,fontWeight:800,color:"#f8fafc"}}>{item.title}</div>
                  <div style={{fontSize:14,lineHeight:1.65,color:"#94a3b8",marginTop:10}}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:viewport.isMobile?"8px 0 8px":"10px 0 10px"}}>
        <div style={{...sectionWrap,padding:viewport.isMobile?"0 14px":"0 24px",display:"grid",gridTemplateColumns:viewport.isTablet?"1fr":"minmax(0,0.9fr) minmax(320px,1.1fr)",gap:18}}>
          <div style={{...cardStyle,padding:viewport.isMobile?"22px 18px":"26px 24px"}}>
            <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#d9f99d"}}>Para quem o NutriCalc faz sentido</div>
            <div style={{fontSize:viewport.isMobile?24:30,fontWeight:800,letterSpacing:"-0.04em",marginTop:10,lineHeight:1.08}}>Pessoas que querem organizar alimentação com continuidade e clareza.</div>
            <div style={{fontSize:15,lineHeight:1.75,color:"#94a3b8",marginTop:14}}>
              A proposta conversa melhor com quem quer sair do improviso e centralizar histórico, relatórios e métricas em um painel só, sem perder o fio entre um acesso e outro.
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
            {[
              ["Quem quer autonomia organizada", "Útil para quem precisa estruturar rotina alimentar e revisar decisões com calma."],
              ["Quem acompanha evolução corporal", "Ajuda a olhar tendência e histórico, não só um valor isolado do dia."],
              ["Quem valoriza transparência", "A entrada pública explica metodologia, privacidade e limites do sistema antes do login."],
              ["Quem quer contexto em uma conta só", "Dietas, relatórios e dados do perfil continuam acessíveis dentro do mesmo ambiente."],
            ].map(([title, text]) => (
              <div key={title} style={{...softCardStyle,padding:"20px 18px"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#f8fafc"}}>{title}</div>
                <div style={{fontSize:14,lineHeight:1.65,color:"#94a3b8",marginTop:8}}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:viewport.isMobile?"10px 0 8px":"16px 0 12px"}}>
        <div style={{...sectionWrap,padding:viewport.isMobile?"0 14px":"0 24px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
          {[
            { title: "Privacidade por conta", text: "A home já prepara a leitura do produto como espaço pessoal, com dados vinculados ao usuário autenticado." },
            { title: "Base técnica visível", text: "Metodologia e fontes ganham espaço próprio para reduzir sensação de caixa-preta." },
            { title: "Fluxo de acesso mais humano", text: "Primeiro o sistema se apresenta. Só depois a pessoa decide entrar ou criar conta." },
            { title: "Posicionamento mais profissional", text: "A entrada deixa claro o valor do produto e também os limites da ferramenta." },
          ].map((item) => (
            <div key={item.title} style={{...cardStyle,padding:"22px 20px"}}>
              <div style={{fontSize:17,fontWeight:800,color:"#f8fafc"}}>{item.title}</div>
              <div style={{fontSize:14,lineHeight:1.65,color:"#94a3b8",marginTop:10}}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:viewport.isMobile?"12px 0 8px":"18px 0 10px"}}>
        <div style={{...sectionWrap}}>
          <div style={{...cardStyle,padding:viewport.isMobile?"22px 18px":"28px 26px"}}>
            <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#d9f99d"}}>Como funciona</div>
            <div style={{fontSize:viewport.isMobile?24:32,fontWeight:800,letterSpacing:"-0.04em",marginTop:10,lineHeight:1.08}}>Um fluxo simples para sair do acesso e chegar ao acompanhamento.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginTop:22}}>
              {[
                ["1. Entrar ou criar conta", "A landing apresenta o produto e leva a pessoa para autenticação só quando ela decide continuar."],
                ["2. Completar o perfil", "Nome, sexo, data de nascimento, peso e altura deixam o cálculo mais consistente."],
                ["3. Gerar e revisar", "O sistema monta a dieta, permite salvar relatório e manter a análise acessível."],
                ["4. Acompanhar o histórico", "Você volta para revisar métricas, dietas anteriores e relatórios criados."],
              ].map(([title, text]) => (
                <div key={title} style={{padding:"18px 18px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#f8fafc"}}>{title}</div>
                  <div style={{fontSize:13,lineHeight:1.65,color:"#94a3b8",marginTop:8}}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:viewport.isMobile?"12px 0 34px":"18px 0 52px"}}>
        <div style={{...sectionWrap,padding:viewport.isMobile?"0 14px":"0 24px"}}>
          <div style={{...cardStyle,padding:viewport.isMobile?"22px 18px":"28px 26px",display:"grid",gridTemplateColumns:viewport.isTablet?"1fr":"minmax(0,1fr) auto",gap:18,alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#93c5fd"}}>Antes de entrar</div>
              <div style={{fontSize:viewport.isMobile?24:30,fontWeight:800,letterSpacing:"-0.04em",marginTop:10,lineHeight:1.08}}>Entenda como o NutriCalc funciona e entre só quando fizer sentido para você.</div>
              <div style={{fontSize:15,lineHeight:1.7,color:"#94a3b8",marginTop:10,maxWidth:760}}>
                A área pública existe para apresentar o produto com clareza. Você pode revisar privacidade, termos e metodologia agora, ou seguir direto para entrar e começar seu acompanhamento.
              </div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:viewport.isTablet?"stretch":"flex-end",flexDirection:viewport.isMobile?"column":"row"}}>
              <button onClick={onEnter} style={{border:"none",borderRadius:999,padding:"14px 18px",cursor:"pointer",background:"linear-gradient(135deg,#84cc16,#65a30d)",color:"#0f172a",fontWeight:800,width:viewport.isMobile?"100%":"auto"}}>Entrar</button>
              <button onClick={onCreateAccount} style={{border:"1px solid rgba(255,255,255,0.08)",borderRadius:999,padding:"14px 18px",cursor:"pointer",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontWeight:700,width:viewport.isMobile?"100%":"auto"}}>Criar conta</button>
              <button onClick={() => onNavigatePage("methodology")} style={{border:"1px solid rgba(59,130,246,0.18)",borderRadius:999,padding:"14px 18px",cursor:"pointer",background:"rgba(59,130,246,0.08)",color:"#bfdbfe",fontWeight:700,width:viewport.isMobile?"100%":"auto"}}>Ver metodologia</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PublicInfoPage({ eyebrow, title, intro, sections, onCreateAccount, onEnter, viewport }) {
  const summaryCards = sections.slice(0, 3).map((section) => section.title);
  return (
    <section style={{padding:viewport.isMobile?"20px 0 36px":"34px 0 56px"}}>
      <div style={{maxWidth:980,margin:"0 auto",padding:viewport.isMobile?"0 14px":"0 24px"}}>
        <div style={{borderRadius:28,padding:viewport.isMobile?"22px 18px":"30px 28px",border:"1px solid rgba(255,255,255,0.08)",background:"linear-gradient(180deg, rgba(15,23,42,0.92), rgba(8,14,24,0.86))",boxShadow:"0 30px 80px rgba(0,0,0,0.28)"}}>
          <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,color:"#d9f99d"}}>{eyebrow}</div>
          <h1 style={{fontSize:viewport.isMobile?"clamp(28px,9vw,36px)":"clamp(34px,5vw,52px)",lineHeight:viewport.isMobile?1.04:0.98,letterSpacing:"-0.05em",margin:"12px 0 14px"}}>{title}</h1>
          <p style={{fontSize:viewport.isMobile?15:17,lineHeight:viewport.isMobile?1.65:1.7,color:"#cbd5e1",margin:"0 0 24px",maxWidth:780}}>{intro}</p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
            {summaryCards.map((label) => (
              <div key={label} style={{padding:"14px 16px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:800,color:"#93c5fd"}}>Tópico central</div>
                <div style={{fontSize:15,fontWeight:800,color:"#f8fafc",marginTop:6,lineHeight:1.35}}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:26,flexDirection:viewport.isMobile?"column":"row"}}>
            <button onClick={onEnter} style={{border:"none",borderRadius:999,padding:"14px 20px",cursor:"pointer",fontSize:14,fontWeight:800,background:"linear-gradient(135deg,#84cc16,#65a30d)",color:"#0f172a",width:viewport.isMobile?"100%":"auto"}}>Entrar</button>
            <button onClick={onCreateAccount} style={{border:"1px solid rgba(255,255,255,0.09)",borderRadius:999,padding:"14px 20px",cursor:"pointer",fontSize:14,fontWeight:700,background:"rgba(255,255,255,0.03)",color:"#e2e8f0",width:viewport.isMobile?"100%":"auto"}}>Criar conta</button>
          </div>

          <div style={{display:"grid",gap:16}}>
            {sections.map((section) => (
              <div key={section.title} style={{padding:"20px 20px 18px",borderRadius:22,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:18,fontWeight:800,color:"#f8fafc"}}>{section.title}</div>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} style={{fontSize:14,lineHeight:1.7,color:"#94a3b8",margin:"10px 0 0"}}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyPage(props) {
  return (
    <PublicInfoPage
      {...props}
      eyebrow="Política de privacidade"
      title="Como o NutriCalc trata dados de acesso, perfil, histórico e informações do uso."
      intro="A proposta desta página é explicar de forma direta o que o produto guarda, para que usa esses dados e como isso se conecta à experiência real do sistema. É uma base pública de transparência, escrita para ser entendida antes mesmo do login."
      sections={[
        {
          title: "Quais dados entram no sistema",
          paragraphs: [
            "O NutriCalc trabalha com dados de conta, como nome, email e autenticação, e também com dados de uso ligados ao planejamento alimentar, como peso, altura, idade, percentual de gordura, dietas geradas e relatórios salvos.",
            "Esses dados ficam vinculados à conta autenticada e não aparecem como histórico público para outras contas no produto.",
          ],
        },
        {
          title: "Finalidade do uso",
          paragraphs: [
            "As informações servem para autenticar o acesso, personalizar o perfil, calcular necessidades energéticas, gerar dietas, salvar relatórios e acompanhar evolução corporal ao longo do tempo.",
            "Sem esse contexto mínimo, o sistema perde continuidade e deixa de entregar o histórico que faz parte da proposta do produto.",
          ],
        },
        {
          title: "Sessão, recuperação de senha e acesso",
          paragraphs: [
            "O backend já usa cookie de sessão com proteção HTTP-only para manter o acesso autenticado, reduzindo exposição de token no navegador.",
            "Quando o fluxo de recuperação de senha é acionado, o sistema gera link temporário e pode enviar esse acesso por email transacional configurado para o ambiente de produção.",
          ],
        },
        {
          title: "Armazenamento e continuidade do histórico",
          paragraphs: [
            "Os dados principais ficam persistidos em banco e os avatares são mantidos em storage persistente, evitando dependência de disco efêmero de servidor.",
            "A presença desta página na entrada pública do sistema reforça transparência antes do login e ajuda a alinhar expectativa de quem está conhecendo o produto agora.",
          ],
        },
      ]}
    />
  );
}

function TermsPage(props) {
  return (
    <PublicInfoPage
      {...props}
      eyebrow="Termos de uso"
      title="Condições gerais para uso do NutriCalc como ferramenta de apoio ao planejamento alimentar."
      intro="Os termos ajudam a posicionar o produto com clareza. A ideia aqui é explicar em linguagem simples qual é o papel do NutriCalc, o que cabe ao usuário e quais limites precisam ficar explícitos desde a entrada pública."
      sections={[
        {
          title: "Natureza da plataforma",
          paragraphs: [
            "O NutriCalc é uma aplicação de apoio a planejamento alimentar e organização de dados do usuário. Ele não promete diagnóstico, prescrição clínica nem decisão médica automatizada.",
            "Qualquer uso em contexto profissional ou de saúde deve respeitar avaliação humana adequada e responsabilidade do usuário ou do profissional envolvido.",
          ],
        },
        {
          title: "Responsabilidade do usuário",
          paragraphs: [
            "O usuário é responsável por revisar os próprios dados, informar medidas corretas e usar os resultados como apoio informativo, não como substituto de orientação especializada.",
            "Também cabe ao usuário manter a confidencialidade do próprio acesso e usar a plataforma de forma lícita e compatível com sua finalidade.",
          ],
        },
        {
          title: "Conta, disponibilidade e evolução do produto",
          paragraphs: [
            "O sistema pode evoluir em interface, regras e metodologia ao longo do tempo. Isso inclui ajustes de conteúdo institucional, textos legais, critérios de geração e componentes de segurança.",
            "A disponibilidade do serviço depende da infraestrutura online e dos fornecedores integrados usados pelo produto.",
          ],
        },
        {
          title: "Limites de responsabilidade",
          paragraphs: [
            "Os resultados do NutriCalc devem ser interpretados dentro do contexto de planejamento alimentar e acompanhamento individual. Eles não substituem consulta com nutricionista, médico ou outro profissional de saúde.",
            "Esta página ainda pode ganhar redação jurídica final, mas já entrega o posicionamento correto e transparente para a camada pública do sistema.",
          ],
        },
      ]}
    />
  );
}

function MethodologyPage(props) {
  return (
    <PublicInfoPage
      {...props}
      eyebrow="Metodologia e fontes"
      title="De onde vêm os cálculos, critérios e referências usados pelo NutriCalc."
      intro="Esta página existe para reduzir a sensação de caixa-preta. A proposta é mostrar que o sistema combina dados de perfil, base alimentar estruturada e regras próprias de composição para gerar planos, relatórios e histórico com continuidade."
      sections={[
        {
          title: "Base de cálculo e contexto do perfil",
          paragraphs: [
            "O NutriCalc parte dos dados de perfil e atividade para estimar gasto energético e orientar a montagem do plano alimentar. O sistema também usa percentual de gordura quando esse dado está disponível ou é calculado no fluxo interno.",
            "A lógica de perfil serve para contextualizar objetivo, distribuição de macros, quantidade de refeições e histórico salvo por usuário.",
          ],
        },
        {
          title: "Base alimentar e composição da dieta",
          paragraphs: [
            "A dieta é montada a partir de uma base de alimentos categorizada e enriquecida com grupos, subgrupos, limites de porção e adequação por tipo de refeição.",
            "Além das referências alimentares, o motor aplica critérios internos de distribuição entre refeições, presets de macros e preferências de geração para tornar o resultado coerente no uso prático.",
          ],
        },
        {
          title: "Histórico, relatórios e continuidade",
          paragraphs: [
            "O sistema salva dietas, relatórios e medições corporais para evitar que cada acesso comece do zero. Essa continuidade é parte da metodologia de produto, não só da interface.",
            "A proposta não é apenas gerar uma resposta pontual, mas permitir revisão, comparação e acompanhamento ao longo do tempo.",
          ],
        },
        {
          title: "Transparência agora e próximos refinamentos",
          paragraphs: [
            "Nesta Fase 1, a página já explica a estrutura geral do sistema e abre espaço para uma versão futura mais detalhada, com fórmulas nomeadas, fontes públicas listadas e notas metodológicas adicionais.",
            "Isso já melhora bastante a comunicação da home e ajuda a pessoa a entender a seriedade do produto antes de entrar na área autenticada.",
          ],
        },
      ]}
    />
  );
}

function PublicFooter({ onCreateAccount, onEnter, onNavigatePage, viewport }) {
  const linkStyle = {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: 0,
    fontSize: 13,
  };

  return (
    <footer style={{position:"relative",zIndex:2,padding:viewport.isMobile?"0 14px 22px":"0 24px 26px"}}>
      <div style={{maxWidth:1180,margin:"0 auto",paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:viewport.isMobile?"flex-start":"center",gap:16,flexWrap:"wrap",flexDirection:viewport.isMobile?"column":"row"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800}}>NutriCalc</div>
          <div style={{fontSize:13,color:"#94a3b8",marginTop:6}}>Planejamento alimentar, relatórios e histórico pessoal em uma única conta.</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <button onClick={() => onNavigatePage("privacy")} style={linkStyle}>Privacidade</button>
          <button onClick={() => onNavigatePage("terms")} style={linkStyle}>Termos</button>
          <button onClick={() => onNavigatePage("methodology")} style={linkStyle}>Metodologia</button>
          <button onClick={onEnter} style={linkStyle}>Entrar</button>
          <button onClick={onCreateAccount} style={{...linkStyle,color:"#d9f99d",fontWeight:700}}>Criar conta</button>
        </div>
      </div>
    </footer>
  );
}

function AuthModal({
  authError,
  authForm,
  authLoading,
  authMode,
  authNotice,
  googleClientId,
  onBackToLanding,
  onChangeMode,
  onGoogleCredential,
  onNavigatePage,
  onPasswordReset,
  onResetPasswordSubmit,
  onSubmit,
  themeVars,
  onUpdateField,
}) {
  const googleButtonRef = useRef(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [authViewportWidth, setAuthViewportWidth] = useState(() => (
    typeof window === "undefined" ? 1280 : window.innerWidth
  ));
  const authIsMobile = authViewportWidth < 768;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let cancelled = false;

    function renderGoogleButton() {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => {
          if (credential) onGoogleCredential(credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: authMode === "register" ? "signup_with" : "signin_with",
        shape: "pill",
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector('script[data-google-identity="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", renderGoogleButton, { once: true });
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [authMode, googleClientId, onGoogleCredential]);

  useEffect(() => {
    if (authMode !== "login") {
      setForgotPasswordOpen(false);
    }
  }, [authMode]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setAuthViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{...themeVars,minHeight:"100vh",background:"var(--app-bg)",color:"var(--app-text)",fontFamily:"'Outfit','Segoe UI',sans-serif",padding:authIsMobile?"14px 14px 18px":"32px 20px",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:460,borderRadius:24,background:"linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,14,26,0.98))",border:"1px solid rgba(132,204,22,0.18)",boxShadow:"0 32px 100px rgba(0,0,0,0.45)",padding:authIsMobile?"16px":"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:18}}>
          <div>
            <button onClick={onBackToLanding} style={{display:"inline-flex",alignItems:"center",gap:8,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#93c5fd",fontSize:12,fontWeight:700,marginBottom:12}}>
              ← Voltar para a apresentação
            </button>
            <div style={{fontSize:authIsMobile?27:30,fontWeight:900,letterSpacing:"-0.04em"}}>Nutri<span style={{color:"#84cc16"}}>Calc</span></div>
            <div style={{fontSize:authIsMobile?17:20,fontWeight:700,letterSpacing:"-0.02em",marginTop:8,lineHeight:1.2}}>{authMode === "register" ? "Criar sua conta" : "Acesse sua conta"}</div>
            <div style={{fontSize:authIsMobile?12:13,color:"#94a3b8",marginTop:6,lineHeight:1.55}}>
              {authMode === "register" ? "Entre no sistema para salvar dietas, relatórios e evolução corporal." : "Faça login para continuar de onde parou e centralizar seu histórico."}
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:18,flexDirection:authIsMobile?"column":"row"}}>
          {authMode !== "reset" && (
            <>
              <button onClick={() => onChangeMode("login")} style={{...pB,flex:1,background:authMode==="login"?"rgba(132,204,22,0.15)":"rgba(255,255,255,0.03)",borderColor:authMode==="login"?"#84cc16":"rgba(255,255,255,0.08)",color:authMode==="login"?"#a3e635":"#cbd5e1"}}>Entrar</button>
              <button onClick={() => onChangeMode("register")} style={{...pB,flex:1,background:authMode==="register"?"rgba(132,204,22,0.15)":"rgba(255,255,255,0.03)",borderColor:authMode==="register"?"#84cc16":"rgba(255,255,255,0.08)",color:authMode==="register"?"#a3e635":"#cbd5e1"}}>Criar conta</button>
            </>
          )}
        </div>

        {authMode === "reset" && (
          <>
            <div style={{marginBottom:14}}>
              <label style={lS}>Nova senha</label>
              <input type="password" value={authForm.newPassword} onChange={(e) => onUpdateField("newPassword", e.target.value)} placeholder="Digite a nova senha" style={iS} />
            </div>
            <div style={{marginBottom:14}}>
              <label style={lS}>Confirmar senha</label>
              <input type="password" value={authForm.confirmPassword} onChange={(e) => onUpdateField("confirmPassword", e.target.value)} placeholder="Repita a nova senha" style={iS} />
            </div>

            {authError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{authError}</div>}
            {authNotice && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.2)",color:"#d9f99d",fontSize:13}}>{authNotice}</div>}

            <button onClick={onResetPasswordSubmit} disabled={authLoading} style={{...nBS,width:"100%",marginBottom:12,opacity:authLoading?0.65:1}}>
              {authLoading ? "Processando..." : "Redefinir senha"}
            </button>

            <button onClick={() => onChangeMode("login")} style={{...pB,width:"100%",padding:"12px 16px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1"}}>
              Voltar para login
            </button>
          </>
        )}

        {authMode !== "reset" && authMode === "register" && (
          <div style={{marginBottom:14}}>
            <label style={lS}>Nome</label>
            <input value={authForm.name} onChange={(e) => onUpdateField("name", e.target.value)} placeholder="Digite seu nome" style={iS} />
          </div>
        )}
        {authMode !== "reset" && (
          <>
            <div style={{marginBottom:14}}>
              <label style={lS}>Email</label>
              <input value={authForm.email} onChange={(e) => onUpdateField("email", e.target.value)} placeholder="Digite seu email" style={iS} />
            </div>
            <div style={{marginBottom:14}}>
              <label style={lS}>Senha</label>
              <input type="password" value={authForm.password} onChange={(e) => onUpdateField("password", e.target.value)} placeholder="Digite sua senha" style={iS} />
            </div>

            {authError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{authError}</div>}
            {authNotice && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.2)",color:"#d9f99d",fontSize:13}}>{authNotice}</div>}

            <button onClick={onSubmit} disabled={authLoading} style={{...nBS,width:"100%",marginBottom:12,opacity:authLoading?0.65:1}}>
              {authLoading ? "Processando..." : authMode === "register" ? "Criar conta" : "Entrar"}
            </button>

            <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0",color:"#64748b",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em"}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}} />
              ou
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}} />
            </div>

            {googleClientId ? (
              <div ref={googleButtonRef} style={{display:"flex",justifyContent:"center",minHeight:44,marginBottom:10,overflow:"hidden",width:"100%"}} />
            ) : (
              <div style={{marginBottom:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#94a3b8",fontSize:12}}>
                Login com Google preparado. Basta definir <code>VITE_GOOGLE_CLIENT_ID</code> no frontend e <code>GOOGLE_CLIENT_ID</code> no backend.
              </div>
            )}

            {authMode === "login" && (
              <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
                <button
                  onClick={() => {
                    onUpdateField("resetEmail", authForm.resetEmail || authForm.email || "");
                    setForgotPasswordOpen(true);
                  }}
                  style={{background:"transparent",border:"none",padding:0,cursor:"pointer",fontSize:13,fontWeight:700,color:"#93c5fd"}}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            <div style={{marginTop:14,padding:authIsMobile?"10px 12px":"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#94a3b8",fontSize:12,lineHeight:1.55}}>
              Seus dados de saúde, dietas, relatórios e evolução corporal ficam vinculados apenas à sua conta. As páginas públicas de privacidade, termos e metodologia já fazem parte da entrada do produto.
            </div>
          </>
        )}

        <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginTop:16,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <button onClick={() => onNavigatePage("privacy")} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",fontSize:12,color:"#94a3b8"}}>Privacidade</button>
          <button onClick={() => onNavigatePage("terms")} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",fontSize:12,color:"#94a3b8"}}>Termos</button>
          <button onClick={() => onNavigatePage("methodology")} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",fontSize:12,color:"#94a3b8"}}>Metodologia</button>
        </div>
      </div>

      {forgotPasswordOpen && authMode === "login" && (
        <div style={{position:"fixed",inset:0,background:"rgba(2,6,23,0.74)",display:"flex",alignItems:"center",justifyContent:"center",padding:authIsMobile?14:20,zIndex:30}}>
          <div style={{width:"100%",maxWidth:430,borderRadius:24,background:"linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,14,26,0.98))",border:"1px solid rgba(132,204,22,0.18)",boxShadow:"0 32px 100px rgba(0,0,0,0.45)",padding:authIsMobile?"16px":"22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:16}}>
              <div>
                <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,color:"#d9f99d"}}>Recuperação de acesso</div>
                <div style={{fontSize:authIsMobile?20:22,fontWeight:800,letterSpacing:"-0.03em",marginTop:8}}>Recuperar senha</div>
                <div style={{fontSize:13,lineHeight:1.6,color:"#94a3b8",marginTop:8}}>
                  Informe o email da sua conta. Se ele estiver cadastrado, enviaremos as instruções para redefinir a senha.
                </div>
              </div>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                style={{width:34,height:34,borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#cbd5e1",cursor:"pointer",fontSize:18}}
                aria-label="Fechar recuperação de senha"
              >
                ×
              </button>
            </div>

            <div style={{marginBottom:14}}>
              <label style={lS}>Email para recuperação</label>
              <input value={authForm.resetEmail} onChange={(e) => onUpdateField("resetEmail", e.target.value)} placeholder="Digite seu email" style={iS} />
            </div>

            {authError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{authError}</div>}
            {authNotice && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.2)",color:"#d9f99d",fontSize:13}}>{authNotice}</div>}

            <div style={{display:"flex",gap:10,flexWrap:"wrap",flexDirection:authIsMobile?"column":"row"}}>
              <button onClick={onPasswordReset} disabled={authLoading} style={{...nBS,flex:1,opacity:authLoading?0.65:1,width:authIsMobile?"100%":"auto"}}>
                {authLoading ? "Processando..." : "Recuperar senha"}
              </button>
              <button onClick={() => setForgotPasswordOpen(false)} style={{...pB,padding:"12px 16px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1",width:authIsMobile?"100%":"auto"}}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileModal({
  authUser,
  bodyFatCalcError,
  bodyFatCalcForm,
  bodyFatCalcLoading,
  bodyFatCalcOpen,
  bodyFatCalcResult,
  bodyMetricError,
  bodyMetricForm,
  bodyMetricNotice,
  bodyMetrics,
  bodyMetricsLoading,
  bodyMetricsPeriod,
  editingBodyMetricId,
  currentAvatarUrl,
  dietHistoryFilters,
  reportHistoryFilters,
  onAvatarRemove,
  onAvatarSelected,
  onBodyFatCalculate,
  onBodyFatCalcClose,
  onBodyFatCalcOpen,
  onBodyMetricCancelEdit,
  onBodyMetricDelete,
  onBodyMetricEdit,
  onBodyMetricSave,
  onChangeBodyMetricsPeriod,
  onDietDelete,
  onClose,
  onDietOpen,
  onReportDelete,
  onReportOpen,
  onSave,
  onSaveCalculatedBodyFat,
  onUpdateBodyFatCalcField,
  onUpdateDietHistoryFilter,
  onUpdateReportHistoryFilter,
  onUpdateBodyMetricField,
  onUpdateField,
  onUseCalculatedBodyFat,
  profileError,
  profileForm,
  profileLoading,
  profileNotice,
  setupRequired,
  themeVars,
  userDiets,
  userDietsError,
  userDietsLoading,
  userReports,
  userReportsError,
  userReportsLoading,
}) {
  const previewAvatar = profileForm.avatarDataUrl || resolveMediaUrl(currentAvatarUrl);
  const calculatedAge = getAgeFromBirthDate(profileForm.birthDate || authUser.birthDate || "");
  const profileIsMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const periodOptions = [
    { value: 30, label: "30 dias" },
    { value: 90, label: "90 dias" },
    { value: 180, label: "180 dias" },
    { value: "all", label: "Tudo" },
  ];
  const orderedMetrics = [...bodyMetrics].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  const weightTrend = computeMetricTrend(bodyMetrics, "weight");
  const bodyFatTrend = computeMetricTrend(bodyMetrics, "bodyFatPercentage");

  return (
    <div style={{...themeVars,minHeight:"100vh",background:"var(--app-bg)",color:"var(--app-text)",fontFamily:"'Outfit','Segoe UI',sans-serif"}}>
      <div style={{maxWidth:1120,margin:"0 auto",padding:profileIsMobile ? "16px 14px 28px" : "24px 20px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:18,position:"sticky",top:0,zIndex:5,padding:profileIsMobile ? "8px 0 12px" : "12px 0 18px",background:"linear-gradient(180deg,rgba(10,14,26,0.98) 0%,rgba(10,14,26,0.9) 72%,rgba(10,14,26,0) 100%)",flexDirection:profileIsMobile ? "column" : "row"}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#84cc16",fontWeight:800}}>Perfil</div>
            <div style={{fontSize:profileIsMobile ? 26 : 32,fontWeight:800,letterSpacing:"-0.03em"}}>Minha conta</div>
            <div style={{fontSize:13,color:"#94a3b8",marginTop:6,lineHeight:1.55,maxWidth:720}}>
              {setupRequired
                ? "Preencha seus dados principais uma vez para liberar a montagem da dieta com tudo já preenchido."
                : "Atualize seus dados, acompanhe sua evolução e reabra dietas e relatórios sem perder o contexto."}
            </div>
          </div>
          {!setupRequired && <button onClick={onClose} style={{...pB,padding:"12px 16px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1",background:"rgba(255,255,255,0.04)",width:profileIsMobile ? "100%" : "auto"}}>Voltar ao painel</button>}
        </div>

        <div style={{padding:profileIsMobile ? "18px 14px" : "24px",borderRadius:24,background:"linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,14,26,0.98))",border:"1px solid rgba(132,204,22,0.18)",boxShadow:"0 32px 100px rgba(0,0,0,0.35)"}}>

        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:18,flexWrap:"wrap",flexDirection:profileIsMobile ? "column" : "row"}}>
          <div style={{width:profileIsMobile ? 76 : 84,height:profileIsMobile ? 76 : 84,borderRadius:"50%",overflow:"hidden",background:"linear-gradient(135deg,#1e293b,#334155)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"#a3e635",border:"1px solid rgba(255,255,255,0.08)"}}>
            {previewAvatar ? <img src={previewAvatar} alt="Avatar" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : (profileForm.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,flex:1,minWidth:220,width:profileIsMobile ? "100%" : "auto"}}>
            <label style={{...pB,padding:"10px 14px",display:"inline-flex",alignItems:"center",justifyContent:"center",borderColor:"rgba(132,204,22,0.2)",color:"#a3e635",background:"rgba(132,204,22,0.08)"}}>
              Escolher foto
              <input type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={(e) => onAvatarSelected(e.target.files?.[0])} />
            </label>
            <button onClick={onAvatarRemove} disabled={profileLoading || (!currentAvatarUrl && !profileForm.avatarDataUrl)} style={{...pB,padding:"10px 14px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1",opacity:profileLoading || (!currentAvatarUrl && !profileForm.avatarDataUrl) ? 0.5 : 1}}>
              Remover avatar
            </button>
            <div style={{fontSize:11,color:"#64748b"}}>Formatos aceitos: PNG, JPG ou WEBP. Tamanho máximo: 2 MB.</div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
          <div style={{gridColumn:"1 / -1"}}>
            <label style={lS}>Nome</label>
            <input value={profileForm.name} onChange={(e) => onUpdateField("name", e.target.value)} placeholder="Digite seu nome" style={iS} />
          </div>
          <div style={{gridColumn:"1 / -1"}}>
            <label style={lS}>Email</label>
            <input value={profileForm.email} onChange={(e) => onUpdateField("email", e.target.value)} placeholder="Digite seu email" style={iS} />
          </div>
          <div>
            <label style={lS}>Sexo</label>
            <CustomSelect
              value={profileForm.sex}
              onChange={(nextValue) => onUpdateField("sex", nextValue)}
              options={[
                { value: "", label: "Selecione" },
                { value: "M", label: "Masculino" },
                { value: "F", label: "Feminino" },
              ]}
            />
          </div>
            <div>
              <label style={lS}>Data de nascimento</label>
              <input type="date" value={profileForm.birthDate} onChange={(e) => onUpdateField("birthDate", e.target.value)} style={iS} />
            </div>
          </div>

        {setupRequired && (
          <div style={{marginTop:14,padding:"12px 14px",borderRadius:12,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.18)",fontSize:13,color:"#d9f99d"}}>
            Para montar sua dieta pela primeira vez, preencha nome, sexo, data de nascimento, peso e altura. A idade é calculada automaticamente.
          </div>
        )}

        <div style={{marginTop:18,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:10,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#f87171",fontWeight:800}}>Segurança</div>
              <div style={{fontSize:18,fontWeight:800}}>Segurança e privacidade</div>
            </div>
            <div style={{fontSize:12,color:"#94a3b8"}}>Auditoria básica da conta</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
            {[
              { label:"Último login", value: formatAuditDate(authUser.lastLoginAt) },
              { label:"Último acesso", value: formatAuditDate(authUser.lastAccessAt) },
              { label:"IP recente", value: authUser.lastAccessIp || "—" },
            ].map((item) => (
              <div key={item.label} style={{padding:"10px 12px",borderRadius:12,background:"rgba(15,23,42,0.6)",border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginTop:4,lineHeight:1.4}}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:12,color:"#94a3b8",lineHeight:1.5}}>
            Seus dados de perfil, evolução, dietas e relatórios ficam privados por usuário. O acesso é autenticado e o histórico salvo não aparece para outras contas.
          </div>
        </div>

        <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#84cc16",fontWeight:800}}>Saúde</div>
              <div style={{fontSize:18,fontWeight:800}}>Histórico corporal</div>
            </div>
            <div style={{fontSize:12,color:"#94a3b8"}}>Último estado salvo do perfil</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:14}}>
            {[{label:"Peso",value:authUser.weight ? `${authUser.weight} kg` : "—"},{label:"Altura",value:authUser.height ? `${authUser.height} cm` : "—"},{label:"Idade",value:authUser.age ? `${authUser.age} anos` : "—"},{label:"Gordura",value:authUser.bodyFatPercentage ? `${authUser.bodyFatPercentage}%` : "—"}].map((item) => (
              <div key={item.label} style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginTop:4}}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            <div>
              <label style={lS}>Peso (kg)</label>
              <input value={bodyMetricForm.weight} onChange={(e) => onUpdateBodyMetricField("weight", e.target.value)} placeholder="Ex: 82.4" style={iS} />
            </div>
            <div>
              <label style={lS}>Altura (cm)</label>
              <input value={bodyMetricForm.height} onChange={(e) => onUpdateBodyMetricField("height", e.target.value)} placeholder="Ex: 180" style={iS} />
            </div>
            <div>
              <label style={lS}>Idade calculada</label>
              <input value={calculatedAge} readOnly placeholder="Calculada pela data de nascimento" style={{...iS,opacity:0.78,background:"rgba(255,255,255,0.03)"}} />
            </div>
            <div>
              <label style={lS}>% de gordura</label>
              <input value={bodyMetricForm.bodyFatPercentage} onChange={(e) => onUpdateBodyMetricField("bodyFatPercentage", e.target.value)} placeholder="Ex: 14.5" style={iS} />
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:12}}>
            <button onClick={onBodyMetricSave} disabled={bodyMetricsLoading} style={{...nBS,flex:"none",padding:"12px 18px",opacity:bodyMetricsLoading?0.65:1}}>
              {bodyMetricsLoading ? "Salvando..." : editingBodyMetricId ? "Salvar alteração" : "Salvar registro corporal"}
            </button>
            {editingBodyMetricId && (
              <button onClick={onBodyMetricCancelEdit} style={{...pB,flex:"none",padding:"12px 18px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1"}}>
                Cancelar edição
              </button>
            )}
            <button onClick={onBodyFatCalcOpen} style={{...pB,flex:"none",padding:"12px 18px",borderColor:"rgba(56,189,248,0.25)",color:"#38bdf8",background:"rgba(56,189,248,0.08)"}}>
              Calcular meu percentual
            </button>
          </div>

          {bodyMetricError && <div style={{marginTop:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{bodyMetricError}</div>}
          {bodyMetricNotice && <div style={{marginTop:12,padding:"10px 12px",borderRadius:10,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.2)",color:"#d9f99d",fontSize:13}}>{bodyMetricNotice}</div>}

          <div style={{marginTop:14,maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:4}}>
            {orderedMetrics.length === 0 && !bodyMetricsLoading && (
              <div style={{padding:"14px 12px",borderRadius:14,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",fontSize:13,color:"#94a3b8"}}>Seu histórico corporal vai aparecer aqui assim que você salvar o primeiro registro.</div>
            )}
            {orderedMetrics.map((metric) => (
              <div
                key={metric.id}
                style={{
                  padding:"14px",
                  borderRadius:16,
                  border: editingBodyMetricId === metric.id ? "1px solid rgba(56,189,248,0.32)" : "1px solid rgba(255,255,255,0.08)",
                  background: editingBodyMetricId === metric.id ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                  boxShadow: editingBodyMetricId === metric.id ? "0 0 0 1px rgba(56,189,248,0.08) inset" : "none",
                }}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0"}}>{new Date(metric.recordedAt).toLocaleDateString("pt-BR")}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:6}}>
                      <span style={{fontSize:11,color:"#94a3b8"}}>{formatMetricSource(metric.source)}</span>
                      {editingBodyMetricId === metric.id && (
                        <span style={{padding:"4px 8px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#7dd3fc",background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.18)"}}>
                          Editando
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button onClick={() => onBodyMetricEdit(metric)} style={{...pB,padding:"8px 10px",fontSize:12,borderColor:"rgba(56,189,248,0.2)",color:"#7dd3fc",background:"rgba(56,189,248,0.08)"}}>
                      Editar
                    </button>
                    <button onClick={() => onBodyMetricDelete(metric.id)} style={{...pB,padding:"8px 10px",fontSize:12,borderColor:"rgba(239,68,68,0.2)",color:"#fca5a5",background:"rgba(239,68,68,0.08)"}}>
                      Excluir
                    </button>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginTop:12}}>
                  {[
                    { label: "Peso", value: formatMetricValue(metric.weight, " kg") },
                    { label: "Altura", value: formatMetricValue(metric.height, " cm") },
                    { label: "Idade", value: formatMetricValue(metric.age, " anos") },
                    { label: "Gordura", value: formatMetricValue(metric.bodyFatPercentage, "%") },
                  ].map((item) => (
                    <div key={item.label} style={{padding:"10px 12px",borderRadius:12,background:"rgba(15,23,42,0.58)",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginTop:4}}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {metric.notes && (
                  <div style={{marginTop:10,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:12,color:"#cbd5e1"}}>
                    {metric.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#f59e0b",fontWeight:800}}>Evolução</div>
              <div style={{fontSize:18,fontWeight:800}}>Minha evolução</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {periodOptions.map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => onChangeBodyMetricsPeriod(option.value)}
                  style={{
                    ...pB,
                    padding:"8px 12px",
                    fontSize:11,
                    borderColor:bodyMetricsPeriod === option.value ? "#f59e0b" : "rgba(255,255,255,0.12)",
                    background:bodyMetricsPeriod === option.value ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                    color:bodyMetricsPeriod === option.value ? "#fbbf24" : "#cbd5e1",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:14}}>
            {[
              { label:"Peso inicial", value: formatMetricValue(weightTrend.firstValue, " kg") },
              { label:"Peso atual", value: formatMetricValue(weightTrend.lastValue, " kg") },
              { label:"Gordura inicial", value: formatMetricValue(bodyFatTrend.firstValue, "%") },
              { label:"Gordura atual", value: formatMetricValue(bodyFatTrend.lastValue, "%") },
            ].map((item) => (
              <div key={item.label} style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginTop:4}}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            <MetricChart
              title="Peso"
              color="#84cc16"
              unit="kg"
              data={weightTrend}
              emptyText="Salve mais registros de peso para ver a linha de evolução."
            />
            <MetricChart
              title="% de gordura"
              color="#38bdf8"
              unit="%"
              data={bodyFatTrend}
              emptyText="Quando houver registros de gordura, o gráfico vai aparecer aqui."
            />
          </div>
        </div>

        <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#a78bfa",fontWeight:800}}>Dietas</div>
              <div style={{fontSize:18,fontWeight:800}}>Minhas dietas</div>
            </div>
            <div style={{fontSize:12,color:"#94a3b8"}}>Reabra dietas salvas com o snapshot corporal usado na geração.</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
            <div>
              <label style={lS}>Objetivo</label>
              <CustomSelect
                value={dietHistoryFilters.objective}
                onChange={(nextValue) => onUpdateDietHistoryFilter("objective", nextValue)}
                options={[
                  { value: "all", label: "Todos" },
                  { value: "maintenance", label: "Manutenção" },
                  { value: "cutting", label: "Emagrecimento" },
                  { value: "bulk", label: "Ganho" },
                ]}
              />
            </div>
            <div>
              <label style={lS}>Refeições</label>
              <CustomSelect
                value={dietHistoryFilters.numMeals}
                onChange={(nextValue) => onUpdateDietHistoryFilter("numMeals", nextValue)}
                options={[
                  { value: "all", label: "Todas" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4" },
                  { value: "5", label: "5" },
                  { value: "6", label: "6" },
                ]}
              />
            </div>
            <div>
              <label style={lS}>Período</label>
              <CustomSelect
                value={dietHistoryFilters.days}
                onChange={(nextValue) => onUpdateDietHistoryFilter("days", nextValue === "all" ? "all" : Number(nextValue))}
                options={[
                  { value: 30, label: "30 dias" },
                  { value: 90, label: "90 dias" },
                  { value: 180, label: "180 dias" },
                  { value: "all", label: "Tudo" },
                ]}
              />
            </div>
            <div>
              <label style={lS}>Até kcal</label>
              <input value={dietHistoryFilters.targetKcalMax} onChange={(e) => onUpdateDietHistoryFilter("targetKcalMax", e.target.value)} placeholder="Ex: 2200" style={iS} />
            </div>
          </div>

          {userDietsError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{userDietsError}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:280,overflowY:"auto"}}>
            {userDietsLoading && (
              <div style={{padding:"14px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontSize:13,color:"#94a3b8"}}>
                Carregando dietas salvas...
              </div>
            )}
            {!userDietsLoading && userDiets.length === 0 && (
              <div style={{padding:"14px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontSize:13,color:"#94a3b8"}}>
                Suas dietas salvas vão aparecer aqui conforme você gerar novos planos logado.
              </div>
            )}
            {userDiets.map((savedDiet) => (
              <div key={savedDiet.id} style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0"}}>
                      {savedDiet.objective === "cutting" ? "Plano de emagrecimento" : savedDiet.objective === "bulk" ? "Plano de ganho" : "Plano de manutenção"}
                    </div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>
                      {new Date(savedDiet.createdAt).toLocaleDateString("pt-BR")} • {savedDiet.numMeals} refeições • {savedDiet.targetKcal} kcal
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <button onClick={() => onDietOpen(savedDiet.id)} style={{...pB,padding:"10px 14px",borderColor:"rgba(167,139,250,0.25)",color:"#c4b5fd",background:"rgba(167,139,250,0.08)"}}>
                      Abrir dieta
                    </button>
                    <button onClick={() => onDietDelete(savedDiet.id)} style={{...pB,padding:"10px 14px",borderColor:"rgba(239,68,68,0.25)",color:"#fca5a5",background:"rgba(239,68,68,0.08)"}}>
                      Excluir
                    </button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                  {[
                    { label:"Peso", value: formatMetricValue(savedDiet.snapshotWeight, " kg") },
                    { label:"Altura", value: formatMetricValue(savedDiet.snapshotHeight, " cm") },
                    { label:"Idade", value: formatMetricValue(savedDiet.snapshotAge, " anos") },
                    { label:"Gordura", value: formatMetricValue(savedDiet.snapshotBodyFatPercentage, "%") },
                  ].map((item) => (
                    <div key={item.label} style={{padding:"8px 10px",borderRadius:10,background:"rgba(15,23,42,0.55)",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginTop:4}}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#f97316",fontWeight:800}}>Relatórios</div>
              <div style={{fontSize:18,fontWeight:800}}>Meus relatórios</div>
            </div>
            <div style={{fontSize:12,color:"#94a3b8"}}>Cada clique em gerar relatório pode virar um item salvo e reaberto depois.</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:14}}>
            <div>
              <label style={lS}>Objetivo</label>
              <CustomSelect
                value={reportHistoryFilters.objective}
                onChange={(nextValue) => onUpdateReportHistoryFilter("objective", nextValue)}
                options={[
                  { value: "all", label: "Todos" },
                  { value: "maintenance", label: "Manutenção" },
                  { value: "cutting", label: "Emagrecimento" },
                  { value: "bulk", label: "Ganho" },
                ]}
              />
            </div>
            <div>
              <label style={lS}>Período</label>
              <CustomSelect
                value={reportHistoryFilters.days}
                onChange={(nextValue) => onUpdateReportHistoryFilter("days", nextValue === "all" ? "all" : Number(nextValue))}
                options={[
                  { value: 30, label: "30 dias" },
                  { value: 90, label: "90 dias" },
                  { value: 180, label: "180 dias" },
                  { value: "all", label: "Tudo" },
                ]}
              />
            </div>
          </div>

          {userReportsError && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{userReportsError}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:240,overflowY:"auto"}}>
            {userReportsLoading && (
              <div style={{padding:"14px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontSize:13,color:"#94a3b8"}}>
                Carregando relatórios salvos...
              </div>
            )}
            {!userReportsLoading && userReports.length === 0 && (
              <div style={{padding:"14px 12px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontSize:13,color:"#94a3b8"}}>
                Seus relatórios vão aparecer aqui depois que você gerar o primeiro enquanto estiver logado.
              </div>
            )}
            {userReports.map((report) => (
              <div key={report.id} style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0"}}>{report.title}</div>
                  <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>
                    {new Date(report.createdAt).toLocaleDateString("pt-BR")} • {report.reportType === "diet_pdf" ? "Relatório de dieta" : report.reportType}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <button onClick={() => onReportOpen(report.id)} style={{...pB,padding:"10px 14px",borderColor:"rgba(249,115,22,0.25)",color:"#fdba74",background:"rgba(249,115,22,0.08)"}}>
                    Abrir relatório
                  </button>
                  <button onClick={() => onReportDelete(report.id)} style={{...pB,padding:"10px 14px",borderColor:"rgba(239,68,68,0.25)",color:"#fca5a5",background:"rgba(239,68,68,0.08)"}}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {bodyFatCalcOpen && (
          <div style={{marginTop:18,padding:"16px",borderRadius:16,background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.18)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase",color:"#38bdf8",fontWeight:800}}>Estimativa corporal</div>
                <div style={{fontSize:18,fontWeight:800}}>Calculadora Navy</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>Estimativa baseada na fórmula da Marinha dos EUA. É um bom ponto de partida, mas pode variar em relação à avaliação presencial.</div>
              </div>
              <button onClick={onBodyFatCalcClose} style={{background:"transparent",border:"none",color:"#94a3b8",fontSize:22,cursor:"pointer"}}>×</button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={lS}>Sexo</label>
                <CustomSelect
                  value={bodyFatCalcForm.sex}
                  onChange={(nextValue) => onUpdateBodyFatCalcField("sex", nextValue)}
                  options={[
                    { value: "", label: "Selecione" },
                    { value: "M", label: "Masculino" },
                    { value: "F", label: "Feminino" },
                  ]}
                />
              </div>
              <div>
                <label style={lS}>Altura (cm)</label>
                <input value={bodyFatCalcForm.height} onChange={(e) => onUpdateBodyFatCalcField("height", e.target.value)} placeholder="Ex: 180" style={iS} />
              </div>
              <div>
                <label style={lS}>Pescoço (cm)</label>
                <input value={bodyFatCalcForm.neck} onChange={(e) => onUpdateBodyFatCalcField("neck", e.target.value)} placeholder="Ex: 39" style={iS} />
              </div>
              <div>
                <label style={lS}>Cintura (cm)</label>
                <input value={bodyFatCalcForm.waist} onChange={(e) => onUpdateBodyFatCalcField("waist", e.target.value)} placeholder="Ex: 84" style={iS} />
              </div>
              {bodyFatCalcForm.sex === "F" && (
                <div>
                  <label style={lS}>Quadril (cm)</label>
                  <input value={bodyFatCalcForm.hip} onChange={(e) => onUpdateBodyFatCalcField("hip", e.target.value)} placeholder="Ex: 98" style={iS} />
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
              <button onClick={onBodyFatCalculate} disabled={bodyFatCalcLoading} style={{...nBS,flex:"none",padding:"12px 18px",opacity:bodyFatCalcLoading?0.65:1}}>
                {bodyFatCalcLoading ? "Calculando..." : "Calcular"}
              </button>
              {bodyFatCalcResult && (
                <>
                  <button onClick={onUseCalculatedBodyFat} style={{...pB,flex:"none",padding:"12px 18px",borderColor:"rgba(132,204,22,0.25)",color:"#a3e635",background:"rgba(132,204,22,0.08)"}}>
                    Usar este valor no perfil
                  </button>
                  <button onClick={onSaveCalculatedBodyFat} disabled={bodyMetricsLoading} style={{...pB,flex:"none",padding:"12px 18px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1"}}>
                    Salvar no histórico
                  </button>
                </>
              )}
            </div>

            {bodyFatCalcError && <div style={{marginTop:12,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{bodyFatCalcError}</div>}
            {bodyFatCalcResult && (
              <div style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:11,color:"#38bdf8",textTransform:"uppercase",letterSpacing:"0.08em"}}>Resultado estimado</div>
                <div style={{fontSize:28,fontWeight:800,color:"#e2e8f0",marginTop:4}}>{bodyFatCalcResult.bodyFatPercentage}%</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>{bodyFatCalcResult.note}</div>
              </div>
            )}
          </div>
        )}

        {profileError && <div style={{marginTop:14,padding:"10px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13}}>{profileError}</div>}
        {profileNotice && <div style={{marginTop:14,padding:"10px 12px",borderRadius:10,background:"rgba(132,204,22,0.08)",border:"1px solid rgba(132,204,22,0.2)",color:"#d9f99d",fontSize:13}}>{profileNotice}</div>}

        <div style={{display:"flex",gap:10,marginTop:20}}>
          {!setupRequired && <button onClick={onClose} style={{...pB,flex:1,padding:"12px 16px",borderColor:"rgba(255,255,255,0.12)",color:"#cbd5e1"}}>Voltar ao painel</button>}
          <button onClick={onSave} disabled={profileLoading} style={{...nBS,flex:1,opacity:profileLoading?0.65:1}}>
            {profileLoading ? "Salvando..." : setupRequired ? "Salvar e continuar" : "Salvar perfil"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

function MetricChart({ color, data, emptyText, title, unit }) {
  const hasData = data.points.length >= 2;
  const latestLabel = data.points.length > 0 ? data.points[data.points.length - 1].label : "—";
  const gradientId = `fill-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const deltaLabel =
    data.delta === null
      ? "—"
      : `${data.delta > 0 ? "+" : ""}${Number.isInteger(data.delta) ? data.delta : data.delta.toFixed(1)}${unit}`;

  return (
    <div style={{padding:"14px",borderRadius:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,marginBottom:10}}>
        <div>
          <div style={{fontSize:12,color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:800}}>{title}</div>
          <div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Última leitura em {latestLabel}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em"}}>Variação</div>
          <div style={{fontSize:16,fontWeight:800,color:data.delta === null ? "#e2e8f0" : data.delta <= 0 ? "#84cc16" : "#f59e0b"}}>{deltaLabel}</div>
        </div>
      </div>

      {hasData ? (
        <svg viewBox="0 0 320 160" style={{width:"100%",height:170,display:"block"}}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="0" y1="140" x2="320" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={data.points.map((point) => `${point.x},${point.y + 10}`).join(" ")}
          />
          <polygon
            fill={`url(#${gradientId})`}
            points={`0,140 ${data.points.map((point) => `${point.x},${point.y + 10}`).join(" ")} 320,140`}
          />
          {data.points.map((point) => (
            <g key={point.id}>
              <circle cx={point.x} cy={point.y + 10} r="4.5" fill={color} />
              <text x={point.x} y={point.y - 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">
                {formatMetricValue(point.value, unit)}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div style={{height:170,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 18px",color:"#94a3b8",fontSize:13}}>
          {emptyText}
        </div>
      )}
    </div>
  );
}

function FS({title,sub,color,foods,sel,fav,onT,onF,search,glyFilter="all"}){
  const searched=search?foods.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())):foods;
  const fl = glyFilter === "all" ? searched : searched.filter((food) => food.glycemicIndexLevel === glyFilter);
  const glyLabel = { baixo: "IG baixo", medio: "IG médio", alto: "IG alto" };
  return(<div style={{marginBottom:24}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${color}30`}}>
      <span style={{fontSize:13,fontWeight:700,color,letterSpacing:"0.05em"}}>{title} ({fl.length})</span><span style={{fontSize:10,color:"#64748b"}}>{sub}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:5,maxHeight:300,overflowY:"auto",paddingRight:4}}>
      {fl.map(food=>{const s=sel.has(food.id),f=fav.has(food.id);
        return(<div key={food.id} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 8px",borderRadius:8,background:s?`${color}12`:"rgba(255,255,255,0.02)",border:`1px solid ${f?"#facc15":s?color:"rgba(255,255,255,0.06)"}`,transition:"all 0.15s"}}>
          <button onClick={()=>onT(food.id)} style={{width:16,height:16,borderRadius:3,flexShrink:0,border:`2px solid ${s?color:"rgba(255,255,255,0.15)"}`,background:s?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#0f172a",fontWeight:900,cursor:"pointer",padding:0,outline:"none"}}>{s?"✓":""}</button>
          <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>onT(food.id)}>
            <div style={{fontSize:11,fontWeight:s?600:400,color:s?"#e2e8f0":"#94a3b8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{food.name}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'JetBrains Mono',monospace"}}>P:{food.prot} C:{food.carb} G:{food.fat} <span style={{color:"#64748b"}}>| {food.mt.join(",")}</span></div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:2,flexWrap:"wrap"}}>
              <div style={{fontSize:9,color:"#84cc16"}}>{ROLE_LABELS[food.planningRole || "core"]}</div>
              {food.cat === "carb" && food.glycemicIndexLevel && (
                <div style={{fontSize:9,color:"#38bdf8"}}>{glyLabel[food.glycemicIndexLevel] || `IG ${food.glycemicIndexLevel}`}</div>
              )}
            </div>
          </div>
          {s&&<button onClick={e=>{e.stopPropagation();onF(food.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:f?"#facc15":"rgba(255,255,255,0.12)",padding:"0 1px",outline:"none",transition:"color 0.15s"}} title="Favorito">★</button>}
        </div>);
      })}
    </div>
  </div>);
}

function ConfigField({ label, value, onChange }) {
  return (
    <div>
      <label style={lS}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={iS}
      />
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder = "Selecione" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedOption = options.find((option) => String(option.value) === String(value));

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...iS,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          cursor: "pointer",
          paddingRight: 44,
        }}
      >
        <span style={{ color: selectedOption ? "var(--field-fg)" : "var(--field-placeholder)" }}>
          {selectedOption?.label || placeholder}
        </span>
        <span
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            color: "#94a3b8",
            fontSize: 12,
            transition: "transform 0.18s ease",
            pointerEvents: "none",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            borderRadius: 12,
            overflow: "hidden",
            background: "#121827",
            border: "1px solid rgba(148,163,184,0.24)",
            boxShadow: "0 20px 40px rgba(2,6,23,0.45)",
          }}
        >
          {options.map((option) => {
            const selected = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: selected ? "rgba(96,165,250,0.18)" : "#121827",
                  color: selected ? "#f8fafc" : "#dbe4f0",
                  textAlign: "left",
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono',monospace",
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FG({label,value,onChange,type,placeholder}){return(<div><label style={lS}>{label}</label><input type={type||"number"} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={iS}/></div>);}
function NB({onClick,disabled,label}){return(<button onClick={onClick} disabled={disabled} style={{...nBS,opacity:disabled?0.4:1,pointerEvents:disabled?"none":"auto"}}>{label||"Próximo"} →</button>);}
function BB({onClick}){return(<button onClick={onClick} style={{padding:"14px 24px",borderRadius:10,fontSize:15,fontWeight:600,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",cursor:"pointer",outline:"none"}}>← Voltar</button>);}

const h1S={fontSize:28,fontWeight:800,marginBottom:4,letterSpacing:"-0.03em"};
const dS={color:"#94a3b8",marginBottom:32,fontSize:15};
const lS={display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:8,letterSpacing:"0.05em",textTransform:"uppercase"};
const iS={width:"100%",padding:"12px 16px",borderRadius:10,fontSize:16,background:"var(--field-bg)",border:"1px solid var(--field-border)",color:"var(--field-fg)",outline:"none",fontFamily:"'JetBrains Mono',monospace",boxSizing:"border-box",appearance:"none",WebkitAppearance:"none",MozAppearance:"none"};
const pB={padding:"10px 16px",borderRadius:10,fontSize:14,border:"1px solid var(--btn-border)",cursor:"pointer",outline:"none",transition:"all 0.15s",background:"var(--btn-bg)",color:"var(--btn-fg)"};
const nBS={flex:1,padding:"14px 24px",borderRadius:10,fontSize:15,fontWeight:700,background:"var(--btn-primary-bg)",border:"none",color:"var(--btn-primary-fg)",cursor:"pointer",outline:"none",letterSpacing:"-0.01em"};
const tS={padding:"10px 8px",fontSize:11,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",textAlign:"center"};
