"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { AccessGate } from "@/components/dashboard/access-gate";
import { AdminUsers } from "@/components/dashboard/admin-users";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HomeOverview } from "@/components/dashboard/home-overview";
import { NicheExplorer } from "@/components/dashboard/niche-explorer";
import { PromptLibrary } from "@/components/dashboard/prompt-library";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  DashboardSection,
  Niche,
  NicheInput,
  Profile,
  Prompt,
  PromptInput,
  Subniche,
  SubnicheInput,
  UserRole,
} from "@/lib/dashboard/types";
import { toAuthUser } from "@/lib/auth-user";
import { useAuthStore } from "@/store/auth-store";

const favoritesMigrationError =
  "Não foi possível carregar os favoritos. Aplique a migration 202611230002_dashboard_features.sql no Supabase e tente novamente.";

export function DashboardScreen() {
  const router = useRouter();
  const setAuthUser = useAuthStore((state) => state.setUser);
  const [supabase] = useState(() => getSupabaseClient());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [subniches, setSubniches] = useState<Subniche[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesError, setFavoritesError] = useState("");
  const [section, setSection] = useState<DashboardSection>("home");
  const [selectedSubnicheId, setSelectedSubnicheId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!supabase) {
      setError("Configure o acesso ao Supabase para abrir o dashboard.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      setError("Não foi possível validar sua sessão.");
      setLoading(false);
      return;
    }
    if (!session?.user) {
      router.replace("/");
      return;
    }

    setAuthUser(toAuthUser(session.user));
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, access_status, payment_status, created_at")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileError || !currentProfile) {
      setError(
        profileError
          ? "Não foi possível ler o perfil no Supabase. Execute a migração do dashboard no SQL Editor e tente novamente."
          : "Seu login está confirmado, mas ainda não existe um perfil no banco. Execute a migração do dashboard no SQL Editor e tente novamente.",
      );
      setLoading(false);
      return;
    }

    setProfile(currentProfile as Profile);
    if (
      currentProfile.role !== "admin" &&
      (currentProfile.access_status !== "approved" ||
        currentProfile.payment_status !== "paid")
    ) {
      setNiches([]);
      setSubniches([]);
      setPrompts([]);
      setFavorites([]);
      setFavoritesError("");
      setLoading(false);
      return;
    }

    const fetchAllPrompts = async () => {
      const rows: Prompt[] = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error: promptQueryError } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);
        if (promptQueryError) return { data: rows, error: promptQueryError };
        rows.push(...((data ?? []) as Prompt[]));
        if (!data || data.length < pageSize) return { data: rows, error: null };
      }
    };

    const [
      { data: nicheData, error: nicheError },
      { data: subnicheData, error: subnicheError },
      { data: promptData, error: promptError },
      { data: favoriteData, error: favoriteError },
    ] = await Promise.all([
      supabase.from("niches").select("*").order("sort_order"),
      supabase.from("subniches").select("*").order("sort_order"),
      fetchAllPrompts(),
      supabase
        .from("prompt_favorites")
        .select("prompt_id")
        .eq("user_id", session.user.id),
    ]);

    const dataError = nicheError ?? subnicheError ?? promptError;
    if (dataError) {
      setError(
        "Não foi possível carregar a biblioteca. Confirme se a migração do dashboard foi aplicada no Supabase.",
      );
      setLoading(false);
      return;
    }

    setNiches((nicheData ?? []) as Niche[]);
    setSubniches((subnicheData ?? []) as Subniche[]);
    setPrompts((promptData ?? []) as Prompt[]);
    if (favoriteError) {
      setFavorites([]);
      setFavoritesError(favoritesMigrationError);
    } else {
      setFavorites((favoriteData ?? []).map((item) => item.prompt_id));
      setFavoritesError("");
    }
    setLoading(false);
  }, [router, setAuthUser, supabase]);

  useEffect(() => {
    void Promise.resolve()
      .then(loadDashboard)
      .catch(() => {
        setError("Não foi possível carregar o dashboard. Tente novamente.");
        setLoading(false);
      });
  }, [loadDashboard]);

  const getAccessToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  async function savePrompt(input: PromptInput, id?: string) {
    if (!supabase || profile?.role !== "admin") {
      throw new Error("Somente administradores podem publicar prompts.");
    }

    const query = id
      ? supabase.from("prompts").update(input).eq("id", id)
      : supabase.from("prompts").insert({ ...input, created_by: profile.id });
    const { data, error: saveError } = await query.select("id").maybeSingle();
    if (saveError || !data) {
      throw new Error(saveError?.message ?? "O card não foi salvo.");
    }
    await loadDashboard();
  }

  async function saveNiche(id: string, input: NicheInput) {
    if (!supabase || profile?.role !== "admin") {
      throw new Error("Somente administradores podem editar os nichos.");
    }
    const { data, error: saveError } = await supabase
      .from("niches")
      .update(input)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (saveError || !data) {
      throw new Error(saveError?.message ?? "O nicho não foi encontrado.");
    }
    setNiches((current) =>
      current.map((niche) => (niche.id === id ? { ...niche, ...input } : niche)),
    );
  }

  async function saveSubniche(id: string, input: SubnicheInput) {
    if (!supabase || profile?.role !== "admin") {
      throw new Error("Somente administradores podem editar os subnichos.");
    }
    const { data, error: saveError } = await supabase
      .from("subniches")
      .update(input)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (saveError || !data) {
      throw new Error(saveError?.message ?? "O subnicho não foi encontrado.");
    }
    setSubniches((current) =>
      current.map((subniche) =>
        subniche.id === id ? { ...subniche, ...input } : subniche,
      ),
    );
  }

  async function toggleFavorite(promptId: string) {
    if (!supabase || !profile) return;
    const isFavorite = favorites.includes(promptId);
    const result = isFavorite
      ? await supabase
          .from("prompt_favorites")
          .delete()
          .eq("user_id", profile.id)
          .eq("prompt_id", promptId)
          .select("prompt_id")
          .maybeSingle()
      : await supabase
          .from("prompt_favorites")
          .insert({ user_id: profile.id, prompt_id: promptId })
          .select("prompt_id")
          .maybeSingle();

    if (result.error || !result.data) {
      setFavoritesError(
        result.error?.message
          ? `${favoritesMigrationError} (${result.error.message})`
          : "O favorito selecionado não foi encontrado.",
      );
      return;
    }
    setFavorites((current) =>
      isFavorite
        ? current.filter((favoriteId) => favoriteId !== promptId)
        : [...current, promptId],
    );
    setFavoritesError("");
  }

  async function refreshFavorites() {
    if (!supabase || !profile) return;
    const { data, error: refreshError } = await supabase
      .from("prompt_favorites")
      .select("prompt_id")
      .eq("user_id", profile.id);
    if (refreshError) {
      setFavoritesError(favoritesMigrationError);
      return;
    }
    setFavorites(data.map((item) => item.prompt_id));
    setFavoritesError("");
  }

  async function deletePrompt(prompt: Prompt) {
    if (!supabase || profile?.role !== "admin") return;
    if (!window.confirm(`Excluir o card “${prompt.title}”?`)) return;
    const { data, error: deleteError } = await supabase
      .from("prompts")
      .delete()
      .eq("id", prompt.id)
      .select("id")
      .maybeSingle();
    if (deleteError || !data) {
      setError("Não foi possível excluir o card. Tente novamente.");
      return;
    }
    setPrompts((current) => current.filter((item) => item.id !== prompt.id));
    setFavorites((current) => current.filter((id) => id !== prompt.id));
  }

  async function saveAccountName(name: string) {
    if (!supabase || !profile) throw new Error("Não foi possível identificar sua conta.");
    const { data, error: saveError } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", profile.id)
      .select("id")
      .maybeSingle();
    if (saveError || !data) {
      throw new Error(
        saveError?.message ??
          "Não foi possível atualizar o nome. Confirme se a migration 202611230002_dashboard_features.sql foi aplicada.",
      );
    }
    setProfile((current) => current ? { ...current, full_name: name } : current);
    const currentAuthUser = useAuthStore.getState().user;
    if (currentAuthUser) setAuthUser({ ...currentAuthUser, name });
  }

  async function changePassword(password: string) {
    if (!supabase) throw new Error("Configure o acesso ao Supabase para alterar sua senha.");
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) throw new Error(passwordError.message);
  }

  async function signOut() {
    if (supabase) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError("Não foi possível encerrar a sessão. Tente novamente.");
        return;
      }
    }
    setAuthUser(null);
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5fa]">
        <div className="flex items-center gap-3 text-sm text-[#81788a]">
          <span className="size-7 animate-spin rounded-full border-[3px] border-[#e9dcf8] border-t-[#7936c5]" />
          Abrindo sua biblioteca...
        </div>
      </main>
    );
  }

  if (error || !profile || !supabase) {
    async function retryDashboard() {
      setError("");
      setLoading(true);
      try {
        await loadDashboard();
      } catch {
        setError("Não foi possível carregar o dashboard. Tente novamente.");
        setLoading(false);
      }
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5fa] px-5">
        <div role="alert" className="max-w-xl rounded-2xl border border-rose-200 bg-white p-6 text-sm leading-6 text-rose-800 shadow-sm">
          <p>{error || "Não foi possível abrir o dashboard."}</p>
          <button
            type="button"
            onClick={() => void retryDashboard()}
            className="mt-5 rounded-xl bg-[#7133bd] px-4 py-2.5 font-bold text-white"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="ml-3 mt-5 rounded-xl border border-[#e7e2eb] px-4 py-2.5 font-bold text-[#7133bd]"
          >
            Sair e voltar ao login
          </button>
        </div>
      </main>
    );
  }

  const role = profile.role as UserRole;
  const accessBlocked =
    role !== "admin" &&
    (profile.access_status !== "approved" || profile.payment_status !== "paid");
  const authUser = useAuthStore.getState().user;
  const user = {
    id: profile.id,
    name: profile.full_name || authUser?.name || "Cliente",
    email: authUser?.email ?? "",
  };
  const selectedSubniche =
    subniches.find((item) => item.id === selectedSubnicheId) ?? null;

  function openSubniche(subnicheId: string) {
    setSelectedSubnicheId(subnicheId);
    setSection("library");
  }

  let content: ReactNode;
  if (accessBlocked && section !== "account") {
    content = (
      <AccessGate
        name={profile.full_name || "cliente"}
        accessStatus={profile.access_status}
        paymentStatus={profile.payment_status}
        onManageAccount={() => setSection("account")}
      />
    );
  } else if (section === "account") {
    content = (
      <AccountSettings
        name={profile.full_name || ""}
        email={user.email}
        onSaveName={saveAccountName}
        onChangePassword={changePassword}
      />
    );
  } else if (role === "admin" && section === "users") {
    content = <AdminUsers getAccessToken={getAccessToken} />;
  } else if (section === "niches") {
    content = (
      <NicheExplorer
        niches={niches}
        subniches={subniches}
        prompts={prompts}
        isAdmin={role === "admin"}
        onOpenSubniche={openSubniche}
        onSaveNiche={saveNiche}
        onSaveSubniche={saveSubniche}
      />
    );
  } else if (section === "home") {
    content = (
      <HomeOverview
        niches={niches}
        subniches={subniches}
        prompts={prompts}
        onOpenSubniche={openSubniche}
        onExploreNiches={() => setSection("niches")}
      />
    );
  } else if (section === "favorites" && favoritesError) {
    content = (
      <section className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-sm sm:p-9">
        <h1 className="text-xl font-extrabold text-[#30253b]">Favoritos indisponíveis</h1>
        <p role="alert" className="mt-2 text-sm leading-6 text-[#81788a]">
          {favoritesError}
        </p>
        <button
          type="button"
          onClick={() => void refreshFavorites()}
          className="mt-5 rounded-xl bg-[#7133bd] px-4 py-2.5 text-xs font-bold text-white"
        >
          Tentar novamente
        </button>
      </section>
    );
  } else {
    content = (
      <PromptLibrary
        key={`${section}-${selectedSubniche?.id ?? "all"}`}
        niches={niches}
        subniches={subniches}
        prompts={prompts}
        isAdmin={role === "admin"}
        favorites={favorites}
        favoritesOnly={section === "favorites"}
        initialNicheId={section === "library" ? selectedSubniche?.niche_id ?? null : null}
        initialSubnicheId={section === "library" ? selectedSubniche?.id ?? null : null}
        onSave={savePrompt}
        onDelete={(prompt) => void deletePrompt(prompt)}
        onToggleFavorite={(promptId) => void toggleFavorite(promptId)}
      />
    );
  }

  return (
    <DashboardShell
      user={user}
      role={role}
      section={section}
      onSectionChange={setSection}
      onSignOut={() => void signOut()}
    >
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {favoritesError && section !== "favorites" && (
        <p role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {favoritesError}
        </p>
      )}
      {content}
    </DashboardShell>
  );
}
