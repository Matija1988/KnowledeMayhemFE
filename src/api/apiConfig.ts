const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");
