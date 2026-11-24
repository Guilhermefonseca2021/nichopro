"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/auth/brand-mark";
import { AccountPanel } from "@/components/auth/account-panel";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthVisual } from "@/components/auth/auth-visual";
import { toAuthUser } from "@/lib/auth-user";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

export function AuthScreen() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isReady, setIsReady] = useState(!supabase);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ? toAuthUser(session.user) : null);
      }
    });

    supabase.auth.getSession().then(
      ({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setSessionError("Não foi possível validar sua sessão. Recarregue a página.");
        } else {
          setUser(data.session?.user ? toAuthUser(data.session.user) : null);
        }
        setIsReady(true);
      },
      () => {
        if (isMounted) {
          setSessionError("Não foi possível conectar ao serviço de autenticação.");
          setIsReady(true);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, supabase]);

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <AuthVisual />
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10 sm:px-10 lg:px-12">
        <div className="pointer-events-none absolute -right-36 -top-32 size-80 rounded-full bg-purple-100/70 blur-3xl lg:hidden" />
        <div className="absolute left-6 top-6 sm:left-10 sm:top-8 lg:hidden">
          <BrandMark />
        </div>

        <div className="relative z-10 w-full max-w-[430px] pt-12 lg:pt-0">
          {!isReady ? (
            <div className="flex min-h-72 items-center justify-center">
              <span className="size-8 animate-spin rounded-full border-[3px] border-[#e9dcf8] border-t-[#7936c5]" />
              <span className="sr-only">Validando sua sessão...</span>
            </div>
          ) : sessionError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800"
            >
              {sessionError}
            </div>
          ) : user && supabase ? (
            <AccountPanel user={user} supabase={supabase} />
          ) : (
            <AuthForm supabase={supabase} onAuthenticated={setUser} />
          )}
        </div>

        <p className="relative z-10 mt-10 text-center text-[11px] text-[#aaa2b2] lg:absolute lg:bottom-8">
          Feito para quem transforma boas ideias em bons negócios.
        </p>
      </section>
    </main>
  );
}
