import { api, request } from "@/api/client";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};
type AuthState = {
  token: string | null;
  userId: string | null;
  roles: string[];
  signIn: (name: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  restore: () => Promise<void>;
  clearSession: () => Promise<void>;
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      roles: [],
      signIn: async (name, password) => {
        const result = await request<{
          token: string;
          req?: { _id?: string; id?: string; roles?: string[] };
        }>({
          url: "/api/v1/auth/login",
          method: "POST",
          data: { name, password },
        });
        set({
          token: result.token,
          userId: result.req?._id ?? result.req?.id ?? null,
          roles: result.req?.roles ?? [],
        });
      },
      signUp: async (name, email, password) => {
        await request({
          url: "/api/v1/auth/register",
          method: "POST",
          data: {
            name,
            email,
            password,
            cpassword: password,
            isVisibleInRanking: true,
          },
        });
        await get().signIn(name, password);
      },
      restore: async () => {
        if (!get().token) return;
        const me = await request<{
          _id?: string;
          id?: string;
          roles?: string[];
        }>({ url: "/api/v1/auth/me" });
        set({ userId: me._id ?? me.id ?? null, roles: me.roles ?? [] });
      },
      clearSession: async () => {
        api.defaults.headers.common.Authorization = null;
        set({ token: null, userId: null, roles: [] });
      },
    }),
    {
      name: "liftcontext-session",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
