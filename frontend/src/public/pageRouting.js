export const PUBLIC_PAGES = new Set(["landing", "auth", "privacy", "terms", "methodology"]);

export function normalizePublicPage(page) {
  return PUBLIC_PAGES.has(page) ? page : "landing";
}

export function getPublicPageFromHash(hashValue) {
  const hash =
    typeof hashValue === "string"
      ? hashValue
      : typeof window !== "undefined"
        ? window.location.hash
        : "";

  const normalized = hash.replace(/^#\/?/, "").trim().toLowerCase();
  if (!normalized) return "landing";
  if (normalized === "entrar" || normalized === "login" || normalized === "cadastro") return "auth";
  if (normalized === "privacidade") return "privacy";
  if (normalized === "termos") return "terms";
  if (normalized === "metodologia" || normalized === "fontes") return "methodology";
  return "landing";
}

export function getHashForPublicPage(page) {
  switch (normalizePublicPage(page)) {
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
