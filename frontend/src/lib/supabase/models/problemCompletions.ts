import { createClient } from "../client";
import type {
  ProblemCompletion,
  ProblemCompletionCreate,
  ProblemCompletionUpdate,
} from "@/lib/types/types";

export async function createProblemCompletion(input: ProblemCompletionCreate) {
  const supabase = createClient();

  const payload = {
    user_id: input.userId,
    problem_id: input.problemId,
    is_completed: input.isCompleted ?? false,
    is_attempted: input.isAttempted ?? false,
    completion_date: input.completionDate ?? null,
    user_solution: input.userSolution ?? "",
    attempts_count: input.attemptsCount ?? 0,
    hints_used: input.hintsUsed ?? 0,
    time_spent_seconds: input.timeSpentSeconds ?? 0,
    test_cases_passed: input.testCasesPassed ?? 0,
    total_test_cases: input.totalTestCases ?? 0,
    points_earned: input.pointsEarned ?? 0,
    efficiency_score: input.efficiencyScore ?? 0.0,
  };

  const { data, error } = await supabase
    .from("problem_completions")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function getProblemCompletions(opts?: {
  userId?: string;
  problemId?: number;
  isCompleted?: boolean;
  isAttempted?: boolean;
}) {
  const supabase = createClient();

  let q = supabase
    .from("problem_completions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (opts?.userId !== undefined) q = q.eq("user_id", opts.userId);
  if (opts?.problemId !== undefined) q = q.eq("problem_id", opts.problemId);
  if (opts?.isCompleted !== undefined)
    q = q.eq("is_completed", opts.isCompleted);
  if (opts?.isAttempted !== undefined)
    q = q.eq("is_attempted", opts.isAttempted);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProblemCompletion[];
}

export async function getProblemCompletionForUserProblem(
  userId: string,
  problemId: number
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("problem_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function updateProblemCompletion(
  id: number,
  patch: ProblemCompletionUpdate
) {
  const supabase = createClient();

  const payload: Partial<ProblemCompletion> & { updated_at?: string } = {};

  if (patch.isCompleted !== undefined) payload.is_completed = patch.isCompleted;
  if (patch.isAttempted !== undefined) payload.is_attempted = patch.isAttempted;
  if (patch.completionDate !== undefined)
    payload.completion_date = patch.completionDate;
  if (patch.userSolution !== undefined)
    payload.user_solution = patch.userSolution;
  if (patch.attemptsCount !== undefined)
    payload.attempts_count = patch.attemptsCount;
  if (patch.hintsUsed !== undefined) payload.hints_used = patch.hintsUsed;
  if (patch.timeSpentSeconds !== undefined)
    payload.time_spent_seconds = patch.timeSpentSeconds;
  if (patch.testCasesPassed !== undefined)
    payload.test_cases_passed = patch.testCasesPassed;
  if (patch.totalTestCases !== undefined)
    payload.total_test_cases = patch.totalTestCases;
  if (patch.pointsEarned !== undefined)
    payload.points_earned = patch.pointsEarned;
  if (patch.efficiencyScore !== undefined)
    payload.efficiency_score = patch.efficiencyScore;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("problem_completions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function deleteProblemCompletion(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("problem_completions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/**
 * Gets all of the problems associated with the logged in user
 * @returns  Array of json objects of each problem
 */
export async function getAllUserProblems() {
  const supabase = createClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("type", "Learn")
      .order("order", { ascending: true });
    if (problem_error) throw problem_error;
    return data;
  }
  return [];
}

/**
 * Gets all of the problems associated with the specific user
 * @returns Json of Json Objects
 */
export async function getAllUserProblemsAsJson() {
  const supabase = createClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("type", "Learn")
      .order("order", { ascending: true });
    if (problem_error) throw problem_error;

    const jsonOfJson = data?.reduce((acc, row) => {
      acc[row.order] = row;
      return acc;
    }, {} as Record<string, (typeof data)[0]>);

    return jsonOfJson;
  }
}

/**
 * Provides a problem that is associated with the user using an id
 * @param problem_id problem id associated with problem
 * @returns Json object
 */
export async function getUserProblemById(problem_id: string) {
  const supabase = createClient();

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

export async function updateUserProblemCompletion(
  id: number,
  problem_id: string,
  category_id: string,
  test_cases: number,
  userSolution: string | undefined
) {
  const supabase = createClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  const { error: update_error } = await supabase
    .from("problem_completions")
    .update({
      is_completed: true,
      test_cases_passed: test_cases,
      total_test_cases: test_cases,
      user_solution: userSolution || "",
      completion_date: new Date().toISOString(),
    })
    .eq("problem_id", problem_id)
    .eq("user_id", user.user.id);

  if (update_error) throw update_error;

  const { error: update_next_problem_error } = await supabase
    .from("problem_completions")
    .update({ is_unlocked: true })
    .eq("prerequisite", problem_id)
    .eq("user_id", user.user.id)
    .eq("category_id", category_id);

  if (update_next_problem_error) throw update_next_problem_error;

  return null;
}

/**
 * Calculates the percentage of problems the user has completed under problem_completions table
 * @returns Decimal percentage
 */
export async function calculateProblemCompletion(): Promise<number> {
  const supabase = createClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  const { data: problems, error: retrieve_error } = await supabase
    .from("problem_completions")
    .select("*")
    .eq("user_id", user.user.id)
    .eq("type", "Learn");

  if (retrieve_error) throw retrieve_error;

  const total_problems = problems.length;

  const completed_problems = problems.filter((problem) => problem.is_completed);

  return (completed_problems.length / total_problems) * 100;
}
