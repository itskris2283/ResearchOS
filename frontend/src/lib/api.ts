import axios from "axios";
import type { ApiResponse } from "@/types";

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string)?.trim();
  if (!envUrl) return "/api/v1";
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

function normalizeUrl(url: string): string {
  const [path, ...qsParts] = url.split("?");
  const qs = qsParts.length ? `?${qsParts.join("?")}` : "";
  const needsSlash = path.split("/").length === 2 && !path.endsWith("/");
  return needsSlash ? `${path}/${qs}` : path + qs;
}

export async function apiGet<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(normalizeUrl(url), { params });
  return data;
}

export async function apiPost<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(normalizeUrl(url), body);
  return data;
}

export async function apiPatch<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(normalizeUrl(url), body);
  return data;
}

export async function apiDelete<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(normalizeUrl(url), { params });
  return data;
}

export default api;
