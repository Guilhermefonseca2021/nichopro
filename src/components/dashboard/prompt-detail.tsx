"use client";

import { Check, Copy, Heart, X } from "lucide-react";
import { useState } from "react";
import type { Prompt } from "@/lib/dashboard/types";

type PromptDetailProps = {
  prompt: Prompt;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
};

export function PromptDetail({ prompt, isFavorite, onClose, onToggleFavorite }: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Não foi possível copiar. Selecione e copie o texto manualmente.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#150c20]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div
          className="relative h-52 bg-cover bg-center sm:h-64"
          style={{
            backgroundImage: `linear-gradient(180deg,transparent,rgba(20,12,27,.65)),url("${prompt.image_url}")`,
          }}
        >
          <button
            type="button"
            aria-label="Fechar prompt"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 text-[#39274c] hover:bg-white"
          >
            <X size={18} />
          </button>
          <span className="absolute bottom-4 left-5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {prompt.category}
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <h2 id="prompt-detail-title" className="text-xl font-extrabold text-[#21182d] sm:text-2xl">
            {prompt.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#81788a]">{prompt.description}</p>
          <button
            type="button"
            aria-pressed={isFavorite}
            onClick={onToggleFavorite}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#e7d5f8] px-3 text-xs font-bold text-[#7133bd] transition hover:bg-[#f8f2ff]"
          >
            <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </button>
          <div className="mt-5 rounded-2xl border border-[#eee7f5] bg-[#faf8fc] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a55d4]">
              Prompt completo
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#4c4356]">
              {prompt.prompt_text}
            </p>
          </div>
          {copyError && (
            <p role="alert" className="mt-3 text-xs text-rose-700">
              {copyError}
            </p>
          )}
          <button
            type="button"
            onClick={copyPrompt}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7832cf] to-[#6322b4] text-sm font-bold text-white transition hover:opacity-95"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Prompt copiado!" : "Copiar prompt"}
          </button>
        </div>
      </section>
    </div>
  );
}
