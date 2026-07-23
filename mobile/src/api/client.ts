import { useAuthStore } from "@/state/auth-store";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export type ApiErrorEnvelope = {
  error: { code: string; message: string; details?: readonly string[] };
};
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly details: readonly string[] = [],
  ) {
    super(code);
  }
}
export const resolveApiUrl = () => {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    String(Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000");
  return Platform.OS === "android" && raw.includes("localhost")
    ? raw.replace("localhost", "10.0.2.2")
    : raw;
};
export const api = axios.create({
  baseURL: resolveApiUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = useAuthStore.getState().language;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<ApiErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data?.error;
    if (status === 401) void useAuthStore.getState().clearSession();
    if (payload)
      throw new ApiError(status, payload.code, payload.details ?? []);
    throw new ApiError(status, status === 403 ? "FORBIDDEN" : "NETWORK_ERROR");
  },
);
export const request = async <T>(
  config: AxiosRequestConfig,
  signal?: AbortSignal,
): Promise<T> => {
  const requestConfig: AxiosRequestConfig = signal
    ? { ...config, signal }
    : config;
  return (await api.request<T>(requestConfig)).data;
};
export const createIdempotencyKey = (scope: string, id: string) =>
  `${scope}:${id}`;
