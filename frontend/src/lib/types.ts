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
  created_at: string;
};
