export type UserRole = "user" | "admin";
export type AccessStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  access_status: AccessStatus;
  payment_status: PaymentStatus;
  created_at: string;
};

export type DashboardUser = Profile & {
  email: string;
};

export type Niche = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  accent: string;
  sort_order: number;
};

export type Subniche = {
  id: string;
  niche_id: string;
  name: string;
  slug: string;
  cover_image_url: string;
  sort_order: number;
};

export type Prompt = {
  id: string;
  subniche_id: string;
  title: string;
  description: string;
  image_url: string;
  prompt_text: string;
  category: string;
  is_published: boolean;
  created_at: string;
};

export type PromptInput = Omit<Prompt, "id" | "created_at">;

export type NicheInput = Pick<Niche, "name" | "description" | "cover_image_url">;

export type SubnicheInput = Pick<Subniche, "name" | "cover_image_url">;

export type DashboardSection =
  | "home"
  | "niches"
  | "library"
  | "favorites"
  | "account"
  | "users";
