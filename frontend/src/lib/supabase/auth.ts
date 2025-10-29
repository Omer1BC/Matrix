import { Profile, ProfileUpdate } from "../types";
import { createClient } from "./client";

const supabase = createClient();

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function getUserProfile() {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  firstname: string,
  lastname: string,
  redirectTo?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      user_name: username,
      first_name: firstname,
      last_name: lastname,
      email: email,
    });
    if (profileErr) throw profileErr;
    // return { pending: false as const };
  }

  const {data: problems, error: problems_error} = await supabase
    .from("problems")
    .select("*")

  if (problems_error) throw problems_error

  const problemsToADD = problems?.map(({ problem_id, category_id, is_locked_by_default, title }) => ({
    problem_id: problem_id,        
    user_id: data.user!.id,
    category_id: category_id,
    is_unlocked: !is_locked_by_default,
    title: title,
  })) ?? [];

  const {error: problem_completions_error} = await supabase.from("problem_completions").insert(problemsToADD);
  
  if(problem_completions_error) throw problem_completions_error;

  return { pending: true as const, reservedUserName: username, problemsToADD };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: userProfile, error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", data.user?.id)
  .single();

  if (profileError) throw profileError;

  return userProfile;

}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });
  if (error) throw error;

  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;

  return data.user;
}

export async function updateUserProfile(profile: ProfileUpdate) {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;

  const uid = auth.user?.id;
  if (!uid) throw new Error("Not authenticated");

  const patch: Record<string, any> = { id: uid };
  if (profile.firstName !== undefined) patch.first_name = profile.firstName;
  if (profile.lastName !== undefined) patch.last_name = profile.lastName;
  if (profile.learningStyle !== undefined)
    patch.learning_style = profile.learningStyle;

  if (Object.keys(patch).length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", uid)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile() {

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error("No signed-in user found");

  const { error: delete_error } = await supabase.auth.admin.deleteUser(userId);
  if (delete_error) throw delete_error;
}

export async function isAdmin(): Promise<boolean> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) return false;

  return !!data?.is_admin;
}
