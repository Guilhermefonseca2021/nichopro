"use client";

import { useState } from "react";
import { BadgeCheck, LogOut, Mail, ShieldCheck } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthUser } from "@/store/auth-store";

type AccountPanelProps = {
  user: AuthUser;
  supabase: SupabaseClient;
};

export function AccountPanel({ user, supabase }: AccountPanelProps) {
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Não foi possível encerrar a sessão. Tente novamente.");
      setIsSigningOut(false);
    }
  }

  return (
    <section className="w-full max-w-[430px]">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a55d4]">
          Acesso confirmado
        </p>
        <h1 className="mt-2 text-[32px] font-extrabold tracking-[-0.04em] text-[#21182d] sm:text-[36px]">
          Olá, {user.name}!
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#81788a]">
          Sua conta NichoPro está pronta. Em breve, você poderá explorar seus
          nichos e prompts favoritos por aqui.
        </p>
      </div>

      <div className="rounded-2xl border border-[#eee8f3] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-purple-50 text-[#7133bd]">
            <Mail size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9a91a2]">
              E-mail da conta
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[#30253b]">
              {user.email}
            </p>
          </div>
          <BadgeCheck size={19} className="ml-auto shrink-0 text-emerald-500" />
        </div>

        <div className="my-5 border-t border-dashed border-[#eee8f3]" />
        <div className="flex items-start gap-3">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#8e5bc7]" />
          <p className="text-xs leading-5 text-[#81788a]">
            Sua senha é protegida pelo serviço de autenticação e nunca fica
            armazenada em texto aberto nesta aplicação.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e7e2eb] text-sm font-semibold text-[#766c80] transition hover:bg-[#f1edf5] hover:text-[#3b2b4c] disabled:opacity-50"
        >
          <LogOut size={16} />
          {isSigningOut ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </section>
  );
}
