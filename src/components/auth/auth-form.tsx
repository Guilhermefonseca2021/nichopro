"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toAuthUser } from "@/lib/auth-user";
import type { AuthUser } from "@/store/auth-store";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  supabase: SupabaseClient | null;
  onAuthenticated: (user: AuthUser) => void;
};

export function AuthForm({ supabase, onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("A autenticação ainda não foi configurada neste projeto.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });

        if (error) {
          setMessage(error.message);
        } else if (data.session && data.user) {
          onAuthenticated(toAuthUser(data.user));
        } else {
          changeMode("login");
          setMessage(
            "Cadastro recebido! Confira seu e-mail para confirmar a conta e depois entre.",
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setMessage("E-mail ou senha inválidos. Confira seus dados e tente novamente.");
        } else if (data.user) {
          onAuthenticated(toAuthUser(data.user));
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Não foi possível conectar. ${error.message}`
          : "Não foi possível conectar ao serviço de autenticação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-[430px]">
      <div className="mb-9 lg:hidden">
        <p className="text-sm font-extrabold tracking-tight text-[#261b35]">
          Nicho<span className="text-[#762bd2]">Pro</span>
        </p>
      </div>

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a55d4]">
          {isSignup ? "Comece agora" : "Bem-vindo de volta"}
        </p>
        <h1 className="mt-2 text-[32px] font-extrabold tracking-[-0.04em] text-[#21182d] sm:text-[36px]">
          {isSignup ? "Crie sua conta" : "Entre na sua conta"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#81788a]">
          {isSignup
            ? "Crie seu acesso gratuito e encontre inspiração para sua marca."
            : "Acesse seus prompts favoritos e continue criando."}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#efedf2] p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => changeMode("login")}
          className={`rounded-lg px-4 py-2.5 transition ${!isSignup ? "bg-white text-[#39274c] shadow-sm" : "text-[#81788a] hover:text-[#39274c]"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className={`rounded-lg px-4 py-2.5 transition ${isSignup ? "bg-white text-[#39274c] shadow-sm" : "text-[#81788a] hover:text-[#39274c]"}`}
        >
          Criar conta
        </button>
      </div>

      {!supabase && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"
        >
          Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> para ativar o login.
          Veja as instruções no README.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#4c4356]">
              Nome completo
            </span>
            <span className="relative block">
              <UserRound
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
              />
              <input
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como podemos te chamar?"
                className="h-12 w-full rounded-xl border border-[#e7e2eb] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aaa2b2] focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
              />
            </span>
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#4c4356]">
            E-mail
          </span>
          <span className="relative block">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
            />
            <input
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="h-12 w-full rounded-xl border border-[#e7e2eb] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aaa2b2] focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#4c4356]">
            <span>Senha</span>
            {isSignup && <span className="font-normal text-[#9a91a2]">Mínimo de 8 caracteres</span>}
          </span>
          <span className="relative block">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
            />
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              type={passwordVisible ? "text" : "password"}
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-[#e7e2eb] bg-white pl-10 pr-12 text-sm outline-none transition placeholder:text-[#aaa2b2] focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
            />
            <button
              type="button"
              aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#93899d] hover:text-[#542990]"
            >
              {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        {message && (
          <p
            role="status"
            className="rounded-xl border border-[#e8d9f7] bg-[#f7f0ff] px-4 py-3 text-xs leading-5 text-[#5a347f]"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!supabase || isSubmitting}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7832cf] to-[#6322b4] px-5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? "Aguarde..."
            : isSignup
              ? "Criar minha conta"
              : "Entrar"}
          {!isSubmitting && (
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-[#9a91a2]">
        Ao continuar, você concorda com nossos{" "}
        <a href="#termos" className="font-semibold text-[#6e36a9] hover:underline">
          Termos de uso
        </a>{" "}
        e{" "}
        <a href="#privacidade" className="font-semibold text-[#6e36a9] hover:underline">
          Política de privacidade
        </a>
        .
      </p>
    </section>
  );
}
