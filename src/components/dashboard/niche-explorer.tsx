"use client";

import { ArrowRight, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";
import { NicheEditor } from "@/components/dashboard/niche-editor";
import type {
  Niche,
  NicheInput,
  Prompt,
  Subniche,
  SubnicheInput,
} from "@/lib/dashboard/types";

type NicheExplorerProps = {
  niches: Niche[];
  subniches: Subniche[];
  prompts: Prompt[];
  isAdmin: boolean;
  onOpenSubniche: (subnicheId: string) => void;
  onSaveNiche: (id: string, input: NicheInput) => Promise<void>;
  onSaveSubniche: (id: string, input: SubnicheInput) => Promise<void>;
};

export function NicheExplorer({
  niches,
  subniches,
  prompts,
  isAdmin,
  onOpenSubniche,
  onSaveNiche,
  onSaveSubniche,
}: NicheExplorerProps) {
  const [editing, setEditing] = useState<{ niche: Niche; subniche?: Subniche } | null>(null);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#8a55d4]">
          Navegue por assunto
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#21182d] sm:text-3xl">
          Explore os nichos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#81788a]">
          Escolha uma área e depois uma especialidade para encontrar os prompts certos.
        </p>
      </div>

      <div className="space-y-6">
        {niches.map((niche) => {
          const nicheSubniches = subniches.filter((item) => item.niche_id === niche.id);
          const nichePromptCount = prompts.filter((prompt) =>
            nicheSubniches.some((item) => item.id === prompt.subniche_id),
          ).length;

          return (
            <section
              key={niche.id}
              className="overflow-hidden rounded-3xl border border-[#ece6f0] bg-white shadow-sm"
            >
              <div
                className="relative flex min-h-40 items-end justify-between gap-4 bg-cover bg-center p-5 text-white sm:min-h-48 sm:p-7"
                style={{
                  backgroundImage: `linear-gradient(90deg,rgba(20,12,28,.9),rgba(20,12,28,.24)),url("${niche.cover_image_url}")`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    <Sparkles size={12} /> {nichePromptCount} prompts
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">{niche.name}</h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
                    {niche.description}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditing({ niche })}
                    aria-label={`Editar ${niche.name}`}
                    className="relative grid size-9 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35"
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                {nicheSubniches.map((subniche) => {
                  const count = prompts.filter(
                    (prompt) => prompt.subniche_id === subniche.id,
                  ).length;

                  return (
                    <article
                      key={subniche.id}
                      className="group relative overflow-hidden rounded-2xl border border-[#eee8f2] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenSubniche(subniche.id)}
                        className="block w-full text-left"
                      >
                        <div
                          role="img"
                          aria-label={subniche.name}
                          className="h-36 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                          style={{
                            backgroundImage: `linear-gradient(180deg,transparent 35%,rgba(22,12,30,.68)),url("${subniche.cover_image_url}")`,
                          }}
                        />
                        <div className="flex items-center justify-between gap-3 p-3.5">
                          <span>
                            <span className="block text-sm font-bold text-[#30253b]">
                              {subniche.name}
                            </span>
                            <span className="mt-1 block text-[11px] text-[#81788a]">
                              {count} {count === 1 ? "prompt" : "prompts"}
                            </span>
                          </span>
                          <ArrowRight
                            size={16}
                            className="shrink-0 text-[#8a55d4] transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditing({ niche, subniche })}
                          aria-label={`Editar ${subniche.name}`}
                          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-[#7133bd] shadow transition hover:bg-white"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </article>
                  );
                })}
                {nicheSubniches.length === 0 && (
                  <p className="col-span-full rounded-xl bg-[#faf8fc] px-4 py-8 text-center text-sm text-[#81788a]">
                    Nenhuma especialidade cadastrada neste nicho.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <NicheEditor
          key={`${editing.niche.id}-${editing.subniche?.id ?? "niche"}`}
          niche={editing.niche}
          subniche={editing.subniche}
          onClose={() => setEditing(null)}
          onSaveNiche={onSaveNiche}
          onSaveSubniche={onSaveSubniche}
        />
      )}
    </div>
  );
}
