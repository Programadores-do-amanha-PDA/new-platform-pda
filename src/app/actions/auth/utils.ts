import createClient from "@/lib/supabase/client";

export const getAuthUser = async (jwt: string) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) throw "user not found";
    return user;
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return data.session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return false;
  }
};
