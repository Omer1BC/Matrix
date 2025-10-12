// Enums

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Difficulty = "easy" | "medium" | "hard";

// Profiles |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type ProfileState = {
  firstName: string;
  lastName: string;
  learningStyle: string;
  email: string;
};

export type PasswordState = {
  current: string;
  new: string;
  confirm: string;
};

export type ProfileUpdate = {
  firstName?: string | null;
  lastName?: string | null;
  learningStyle?: string | null;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  learning_style: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string | null;
};

// Category Prerequisites |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type CategoryPrerequisite = {
  id: number;
  category_id: number;
  required_category_id: number;
  min_completion_percentage: number;
  created_at: string;
};

export type CategoryPrerequisiteCreate = {
  categoryId: number;
  requiredCategoryId: number;
  minCompletionPercentage?: number;
};

export type CategoryPrerequisiteUpdate = {
  categoryId?: number;
  requiredCategoryId?: number;
  minCompletionPercentage?: number;
};

// Problem Categories |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type ProblemCategory = {
  id: number;
  key: string;
  title: string;
  icon: string;
  order: number;
  description: string;
  is_locked_by_default: boolean;
  created_at: string;
  updated_at: string;
};

export type ProblemCategoryCreate = {
  key: string;
  title: string;
  icon: string;
  order?: number;
  description?: string;
  isLockedByDefault?: boolean;
};

export type ProblemCategoryUpdate = {
  key?: string;
  title?: string;
  icon?: string;
  order?: number;
  description?: string;
  isLockedByDefault?: boolean;
};

// Problems ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type Problem = {
  id: number;
  category_id: number;
  problem_id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  order: number;
  is_locked_by_default: boolean;
  points_reward: number;
  method_stub: string;
  solution: string | null;
  test_cases: Json;
  input_args: Json;
  tools: Json;
  created_at: string;
  updated_at: string;
};

export type ProblemCreate = {
  categoryId: number;
  problemId: string;
  title: string;
  description: string;
  methodStub: string;
  difficulty?: Difficulty;
  order?: number;
  isLockedByDefault?: boolean;
  pointsReward?: number;
  solution?: string | null;
  testCases?: Json;
  inputArgs?: Json;
  tools?: Json;
};

export type ProblemUpdate = {
  categoryId?: number;
  problemId?: string;
  title?: string;
  description?: string;
  methodStub?: string;
  difficulty?: Difficulty;
  order?: number;
  isLockedByDefault?: boolean;
  pointsReward?: number;
  solution?: string | null;
  testCases?: Json;
  inputArgs?: Json;
  tools?: Json;
};

// Problem Completions |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type ProblemCompletion = {
  id: number;
  user_id: string;
  problem_id: number;
  is_completed: boolean;
  is_attempted: boolean;
  completion_date: string | null;
  first_attempt_date: string;
  user_solution: string;
  attempts_count: number;
  hints_used: number;
  time_spent_seconds: number;
  test_cases_passed: number;
  total_test_cases: number;
  points_earned: number;
  efficiency_score: number;
  created_at: string;
  updated_at: string;
};

export type ProblemCompletionCreate = {
  userId: string;
  problemId: number;
  isCompleted?: boolean;
  isAttempted?: boolean;
  completionDate?: string | null;
  firstAttemptDate?: string;
  userSolution?: string;
  attemptsCount?: number;
  hintsUsed?: number;
  timeSpentSeconds?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  pointsEarned?: number;
  efficiencyScore?: number;
};

export type ProblemCompletionUpdate = {
  isCompleted?: boolean;
  isAttempted?: boolean;
  completionDate?: string | null;
  userSolution?: string;
  attemptsCount?: number;
  hintsUsed?: number;
  timeSpentSeconds?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  pointsEarned?: number;
  efficiencyScore?: number;
};

// User Progress |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

export type UserProgress = {
  user_id: string;
  total_points: number;
  current_level: number;
  experience_points: number;
  current_category_id: number | null;
  current_problem_id: number | null;
  achievements_earned: Json;
  updated_at: string;
};

export type UserProgressCreate = {
  userId: string;
  totalPoints?: number;
  currentLevel?: number;
  experiencePoints?: number;
  currentCategoryId?: number | null;
  currentProblemId?: number | null;
  achievementsEarned?: Json;
};

export type UserProgressUpdate = {
  totalPoints?: number;
  currentLevel?: number;
  experiencePoints?: number;
  currentCategoryId?: number | null;
  currentProblemId?: number | null;
  achievementsEarned?: Json;
};
