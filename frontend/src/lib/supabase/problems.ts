import { createClient } from "./client";

const supabase = createClient();

export async function getAllCategories() {
  const { data, error } = await supabase.from("problem_categories").select("*");

  if (error) throw error;

  return data;
}

export async function getAllUserProblems() {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("user_id", user.user.id)
      .order("problem_id", { ascending: true });
    if (problem_error) throw problem_error;
    return data;
  }
  return [];
}

export async function getUserProblemById(problem_id: string) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("problem_id", problem_id)
      .eq("user_id", user.user.id)
      .maybeSingle();
    if (problem_error) throw problem_error;
    return data;
  }

  if (error) throw error;

  return null;
}

export async function getProblemById(problem_id: string) {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_id", problem_id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function updateNotes(problem_id: string, notes: string) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { error: update_error } = await supabase
      .from("problem_completions")
      .update({ notes: notes })
      .eq("problem_id", problem_id)
      .eq("user_id", user.user.id);
    if (update_error) throw update_error;
  }

  if (error) throw error;

  return null;
}

export async function saveNotes(payload: {
  user_id: string;
  problem_id: string;
  notes: string;
}) {
  const res = await fetch("http://localhost:8000/api/save-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (data as any)?.error || `save_notes failed (${res.status})`
    );
  return data;
}

export async function updateUserProblemCompletion(
  problem_id: string,
  test_cases: number,
  current
) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  const { error: update_error } = await supabase
    .from("problem_completions")
    .update({
      is_completed: true,
      test_cases_passed: test_cases,
      total_test_cases: test_cases,
      user_solution: current,
    })
    .eq("problem_id", problem_id)
    .eq("user_id", user.user.id);

  if (update_error) throw error;

  return null;
}

// get all problems for a section
// compute number of completed vs incomplted
// calculate perecentage
// return percentage
