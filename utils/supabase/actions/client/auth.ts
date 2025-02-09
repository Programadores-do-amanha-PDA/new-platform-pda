"use client";

import { createClient } from "../../client";

export const getAuthUser = async (jwt: string) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) throw "user not found";
    return user;
  } catch (_) {
    return false;
  }
};

export const getSession = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return data.session;
  } catch (_) {
    return false;
  }
};

export const onAuthStateChange = (
  updateAuthState: (
    session: {
      access_token: string;
    } | null
  ) => Promise<void>
) => {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange(async (_, session) => {
    await updateAuthState(session);
  });
};
