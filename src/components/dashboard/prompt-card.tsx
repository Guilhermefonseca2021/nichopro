"use client";

import { Copy, Heart, Pencil, Sparkles } from "lucide-react";
import type { Prompt } from "@/lib/dashboard/types";

type PromptCardProps = {
  prompt: Prompt;
  subnicheName: string;
  isAdmin: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
};

export function PromptCard({
  prompt,
  subnicheName,
  isAdmin,
  isFavorite,
  onOpen,
  onEdit,
  onToggleFavorite,
}: PromptCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#ece6f0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-950/5">
      <div className="relative aspect-[1.42] overflow-hidden">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver ${prompt.title}`}
          className="absolute inset-0 block w-full text-left"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.01]"
            style={{
              backgroundImage: `linear-gradient(180deg,transparent 35%,rgba(22,12,30,.6)),url("${prompt.image_url}")`,
            }}
          />
        </button>
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            {prompt.category}
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[11px] font-medium text-white/90">
            <Sparkles size={12} /> {subnicheName}
          </span>
        </div>
        <button
          type="button"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-4">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <h3 className="truncate text-sm font-bold text-[#30253b]">{prompt.title}</h3>
          <p className="mt-1.5 line-clamp-2 min-h-9 text-xs leading-[18px] text-[#81788a]">
            {prompt.description}
          </p>
        </button>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e7d5f8] text-xs font-bold text-[#7133bd] transition hover:bg-[#f8f2ff]"
          >
            <Copy size={14} /> Ver prompt
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Editar ${prompt.title}`}
              className="grid size-9 place-items-center rounded-lg border border-[#e7d5f8] text-[#7133bd] transition hover:bg-[#f8f2ff]"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
