import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/store/auth-store";

export function toAuthUser(user: User): AuthUser {
  const fullName = user.user_metadata.full_name;

  return {
    id: user.id,
    name:
      typeof fullName === "string" && fullName.trim()
        ? fullName.trim()
        : user.email?.split("@")[0] ?? "Cliente",
    email: user.email ?? "",
  };
}
