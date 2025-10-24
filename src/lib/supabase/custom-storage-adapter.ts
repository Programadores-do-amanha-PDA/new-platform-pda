import { SupportedStorage } from "@supabase/supabase-js";

export const customStorageAdapter: SupportedStorage = {
  getItem: (key) => {
    return globalThis.localStorage.getItem(key);
  },
  setItem: (key, value) => {
    globalThis.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    globalThis.localStorage.removeItem(key);
  },
};
