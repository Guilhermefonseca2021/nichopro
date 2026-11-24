"use client";

import { ArrowRight, Image as ImageIcon, Search, Sparkles } from "lucide-react";
import type { Niche, Prompt, Subniche } from "@/lib/dashboard/types";

type HomeOverviewProps = {
  niches: Niche[];
  subniches: Subniche[];
  prompts: Prompt[];
  onOpenSubniche: (subnicheId: string) => void;
  onExploreNiches: () => void;
};

export function HomeOverview({
  niches,
  subniches,
  prompts,
  onOpenSubniche,
  onExploreNiches,
}: HomeOverviewProps) {
  return (
    <div>
      <section className="relative overflow-hidden rounded-[26px] bg-[#24152f] p-6 text-white sm:p-9 lg:p-11">
        <div className="absolute -right-10 -top-20 size-72 rounded-full bg-[#7435ba]/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-purple-100">
            <Sparkles size={13} /> BIBLIOTECA NICHOPRO
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[42px]">
            Ideias prontas para destacar o seu negócio.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
            Explore um nicho, escolha uma especialidade e encontre prompts criados para
            transformar suas ideias em conteúdo.
          </p>
          <button
            type="button"
            onClick={onExploreNiches}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#5e279e] transition hover:bg-purple-50"
          >
            <Search size={15} /> Explorar nichos <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#8a55d4]">
              Encontre sua área
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#21182d]">
              Comece por um nicho
            </h2>
          </div>
          <span className="text-xs text-[#8a8191]">
            {prompts.length} {prompts.length === 1 ? "prompt disponível" : "prompts disponíveis"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {niches.map((niche) => {
            const nicheSubniches = subniches.filter((item) => item.niche_id === niche.id);
            const promptCount = prompts.filter((prompt) =>
              nicheSubniches.some((item) => item.id === prompt.subniche_id),
            ).length;

            return (
              <article
                key={niche.id}
                className="overflow-hidden rounded-2xl border border-[#ece6f0] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={onExploreNiches}
                  className="group relative block h-36 w-full overflow-hidden text-left text-white"
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(18,12,25,.86),rgba(18,12,25,.2)),url("${niche.cover_image_url}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="relative flex h-full flex-col justify-end p-4">
                    <span className="text-lg font-extrabold">{niche.name}</span>
                    <span className="mt-1 text-[11px] text-white/75">
                      {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
                    </span>
                  </span>
                </button>
                <div className="p-3.5">
                  <p className="line-clamp-2 min-h-9 text-xs leading-[18px] text-[#81788a]">
                    {niche.description}
                  </p>
                  {nicheSubniches.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {nicheSubniches.slice(0, 3).map((subniche) => (
                        <button
                          key={subniche.id}
                          type="button"
                          onClick={() => onOpenSubniche(subniche.id)}
                          className="rounded-full bg-[#f4eff9] px-2.5 py-1.5 text-[10px] font-semibold text-[#7133bd] transition hover:bg-[#eadcf8]"
                        >
                          {subniche.name}
                        </button>
                      ))}
                      {nicheSubniches.length > 3 && (
                        <button
                          type="button"
                          onClick={onExploreNiches}
                          className="rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-[#81788a] hover:bg-[#f4eff9]"
                        >
                          +{nicheSubniches.length - 3}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#a198aa]">
                      <ImageIcon size={13} /> Em breve
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
