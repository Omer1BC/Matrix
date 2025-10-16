import { createClient } from "./client";

const supabase = createClient();

export async function getAllCategories() {
    const { data, error } = await supabase.from("problem_categories").select("*");

    if( error ) throw error;

    return data;
}

export async function getAllUserProblems() {
    const {data: user, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
        const { data, error: problem_error } = await supabase.from("problem_completions").select("*").eq("user_id", user.user.id).order("problem_id", {ascending: true});
        if (problem_error) throw problem_error;
        return data;
    }
    return [];
}

export async function getUserProblemById(problem_id: string) {

    const {data: user, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
        const { data, error: problem_error } = await supabase.from("problem_completions").select("*").eq("problem_id", problem_id).eq("user_id", user.user.id).maybeSingle();
        if (problem_error) throw problem_error;
        return data;
    }

    if (error) throw error;

    return null;
}

export async function getProblemById(problem_id: string) {
    const { data, error } = await supabase.from("problems").select("*").eq("problem_id", problem_id).maybeSingle();

    if (error) throw error;

    return data;
}

export async function updateNotes(problem_id: string, notes: string) {
    const {data: user, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
        const { error: update_error } = await supabase.from("problem_completions").update({"notes": notes}).eq("problem_id", problem_id).eq("user_id", user.user.id);
        if (update_error) throw update_error;
    }

    if (error) throw error;

    return null;
}