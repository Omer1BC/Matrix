import { Profile, ProfileUpdate, SeenStatus } from "../types";
import { createClient } from "./client";
import { sawHomepage, sawLearn, sawSolve } from "../../lib/supabase/auth";

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
    .eq("type", "Learn")
    .order("id", {ascending: true});

  if (problems_error) throw problems_error

  const problemsToADD = problems?.map(({ problem_id, category_id, prerequisite,is_locked_by_default, title, order, type }) => ({
    problem_id: problem_id,        
    user_id: data.user!.id,
    category_id: category_id,
    is_unlocked: !is_locked_by_default,
    title: title,
    prerequisite: prerequisite,
    order: order,
    type: type,
  })) ?? [];

  const {error: problem_completions_error} = await supabase.from("problem_completions").insert(problemsToADD);
  
  if(problem_completions_error) throw problem_completions_error;

  return { pending: true as const, reservedUserName: username, problemsToADD };
}

/**
 * Used for the class demo. Creates a random account with randomized account details for anonymity via current time in milliseconds.
 * @returns user with the credentials 
 */
export async function randomSignUp(redirectTo?: string) {

  const currDate = new Date();

  const userName = "JohnDoe" + currDate.getTime();
  const password = "secret1"
  const email = userName + "@gmail.com";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      user_name: userName,
      first_name: "John",
      last_name: "Doe",
      email: email,
    });
    if (profileErr) throw profileErr;
    // return { pending: false as const };
  }

  const {data: problems, error: problems_error} = await supabase
    .from("problems")
    .select("*")
    .eq("type", "Learn")
    .order("id", {ascending: true});

  if (problems_error) throw problems_error

  const problemsToADD = problems?.map(({ problem_id, category_id, prerequisite,is_locked_by_default, title, order, type }) => ({
    problem_id: problem_id,        
    user_id: data.user!.id,
    category_id: category_id,
    is_unlocked: !is_locked_by_default,
    title: title,
    prerequisite: prerequisite,
    order: order,
    type: type,
  })) ?? [];

  const {error: problem_completions_error} = await supabase.from("problem_completions").insert(problemsToADD);
  
  if(problem_completions_error) throw problem_completions_error;

  return { pending: true as const, reservedUserName: userName, problemsToADD };
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

export async function syncProblemCompletions() {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;

  const uid = auth.user?.id;
  if (!uid) throw new Error("Not authenticated");

  try {

    const { data: allProblems, error: problemError } = await supabase
      .from("problems")
      .select("*");

    if (problemError) throw problemError;
    if (!allProblems) return;

    const { data: userCompletions, error: completionError } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("user_id", uid);

    if (completionError) throw completionError;

    const existingProblemIds = new Set(userCompletions?.map(pc => pc.problem_id));

    // Prepare missing completions
    const missingCompletions = allProblems
      .filter(p => !existingProblemIds.has(p.problem_id))
      .map(p => ({
        user_id: uid,
        problem_id: p.problem_id,        
      category_id: p.category_id,
      is_unlocked: !p.is_locked_by_default,
      title: p.title,
      prerequisite: p.prerequisite,
      order: p.order,
      type: p.type,
      }));

    if (missingCompletions.length === 0) return; // Nothing to add

    // Upsert to avoid duplicates (on user_id + problem_id)
    const { data, error } = await supabase
   .from("problem_completions")
    .upsert(missingCompletions, {
    onConflict: ["user_id", "problem_id"] as unknown as string, 
    });

    if (error) throw error;

    console.log("Synced problem completions:", data);
  } catch (err) {
    console.error("Failed to sync problem completions:", err);
  }
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

export async function updateTokensUsed(tokens: number) {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (profileErr) throw profileErr;

  const new_tokens = (profile?.total_tokens_used || 0) + tokens;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({"total_tokens_used": new_tokens})
    .eq('id', uid);

  if (updateErr) throw updateErr;
}

export async function sawHomepage() {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = auth.user?.id;
  if (!uid) return null;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({"saw_homepage": true})
    .eq('id', uid);
  
  if (updateErr) throw updateErr;
}

export async function sawLearn() {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = auth.user?.id;
  if (!uid) return null;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({"saw_learn": true})
    .eq('id', uid);
  
  if (updateErr) throw updateErr;
}

export async function sawSolve() {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = auth.user?.id;
  if (!uid) return null;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({"saw_solve": true})
    .eq('id', uid);

  if (updateErr) throw updateErr;
}

export const getSeenStatus = async (): Promise<SeenStatus> => {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    return { homepage: false, learn: false, solve: false };
  }
  const uid = auth.user?.id;
  if (!uid) {
    return { homepage: false, learn: false, solve: false };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("saw_homepage, saw_learn, saw_solve")
    .eq("id", uid)
    .single();

  if (error || !data) {
    return { homepage: false, learn: false, solve: false };
  }

  return {
    homepage: data.saw_homepage,
    learn: data.saw_learn,
    solve: data.saw_solve,
  }
}