const API_URL = import.meta.env.VITE_API_URL || "";

async function parseResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.error || "API request failed");
  }
  return data;
}

function buildRequestOptions(extra = {}) {
  return {
    credentials: "include",
    ...extra,
  };
}

export async function fetchFoods(category) {
  const url = category ? `${API_URL}/api/foods?category=${category}` : `${API_URL}/api/foods`;
  const res = await fetch(url, buildRequestOptions());
  return parseResponse(res);
}

export async function fetchDietGenerationConfig() {
  const res = await fetch(`${API_URL}/api/config/diet-generation`, buildRequestOptions());
  return parseResponse(res);
}

export async function calculateTDEE(data) {
  const res = await fetch(`${API_URL}/api/tdee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function generateDiet(data) {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function getDiet(id) {
  const res = await fetch(`${API_URL}/api/diet/${id}`, buildRequestOptions());
  return parseResponse(res);
}

export async function fetchMyDiets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.objective && filters.objective !== "all") params.set("objective", filters.objective);
  if (filters.numMeals && filters.numMeals !== "all") params.set("numMeals", String(filters.numMeals));
  if (filters.targetKcalMax) params.set("targetKcalMax", String(filters.targetKcalMax));
  if (filters.days && filters.days !== "all") params.set("days", String(filters.days));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/api/auth/me/diets${query}`, buildRequestOptions());
  return parseResponse(res);
}

export async function fetchMyReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.objective && filters.objective !== "all") params.set("objective", filters.objective);
  if (filters.days && filters.days !== "all") params.set("days", String(filters.days));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/api/auth/me/reports${query}`, buildRequestOptions());
  return parseResponse(res);
}

export async function deleteMyDiet(dietId) {
  const res = await fetch(`${API_URL}/api/auth/me/diets/${dietId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
  });
  return parseResponse(res);
}

export async function deleteMyReport(reportId) {
  const res = await fetch(`${API_URL}/api/auth/me/reports/${reportId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
  });
  return parseResponse(res);
}

export async function createMyReport(data) {
  const res = await fetch(`${API_URL}/api/auth/me/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function fetchMyReport(reportId) {
  const res = await fetch(`${API_URL}/api/auth/me/reports/${reportId}`, buildRequestOptions());
  return parseResponse(res);
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify({ credential }),
  });
  return parseResponse(res);
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_URL}/api/auth/me`, buildRequestOptions());
  return parseResponse(res);
}

export async function updateCurrentUser(data) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function fetchBodyMetrics(days) {
  const suffix = days ? `?days=${days}` : "";
  const res = await fetch(`${API_URL}/api/auth/me/body-metrics${suffix}`, buildRequestOptions());
  return parseResponse(res);
}

export async function createBodyMetric(data) {
  const res = await fetch(`${API_URL}/api/auth/me/body-metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function updateBodyMetric(metricId, data) {
  const res = await fetch(`${API_URL}/api/auth/me/body-metrics/${metricId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function deleteBodyMetric(metricId) {
  const res = await fetch(`${API_URL}/api/auth/me/body-metrics/${metricId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
  });
  return parseResponse(res);
}

export async function calculateNavyBodyFat(data) {
  const res = await fetch(`${API_URL}/api/auth/me/body-fat/navy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
  });
  return parseResponse(res);
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_URL}/api/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify({ email }),
  });
  return parseResponse(res);
}

export async function resetPassword(data) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...buildRequestOptions(),
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}
