"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PromptCard } from "@/components/dashboard/prompt-card";
import { PromptDetail } from "@/components/dashboard/prompt-detail";
import { PromptEditor } from "@/components/dashboard/prompt-editor";
import type { Niche, Prompt, PromptInput, Subniche } from "@/lib/dashboard/types";

const pageSize = 12;

type PromptLibraryProps = {
  niches: Niche[];
  subniches: Subniche[];
  prompts: Prompt[];
  isAdmin: boolean;
  favorites: string[];
  favoritesOnly?: boolean;
  initialNicheId?: string | null;
  initialSubnicheId?: string | null;
  onSave: (input: PromptInput, id?: string) => Promise<void>;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (promptId: string) => void;
};

export function PromptLibrary({
  niches,
  subniches,
  prompts,
  isAdmin,
  favorites,
  favoritesOnly = false,
  initialNicheId,
  initialSubnicheId,
  onSave,
  onDelete,
  onToggleFavorite,
}: PromptLibraryProps) {
  const [query, setQuery] = useState("");
  const [activeNicheId, setActiveNicheId] = useState(() => {
    if (initialNicheId) return initialNicheId;
    return (
      subniches.find((item) => item.id === initialSubnicheId)?.niche_id ?? "all"
    );
  });
  const [activeSubnicheId, setActiveSubnicheId] = useState(
    initialSubnicheId ?? "all",
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const visibleSubniches = useMemo(
    () =>
      activeNicheId === "all"
        ? subniches
        : subniches.filter((subniche) => subniche.niche_id === activeNicheId),
    [activeNicheId, subniches],
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(prompts.map((prompt) => prompt.category)))
        .filter((category) => category && category !== "Todos")
        .sort((left, right) => left.localeCompare(right, "pt-BR")),
    [prompts],
  );
  const visiblePrompts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const favoriteIds = new Set(favorites);
    return prompts.filter((prompt) => {
      const subniche = subniches.find((item) => item.id === prompt.subniche_id);
      const niche = niches.find((item) => item.id === subniche?.niche_id);
      const matchesNiche =
        activeNicheId === "all" || subniche?.niche_id === activeNicheId;
      const matchesSubniche =
        activeSubnicheId === "all" || prompt.subniche_id === activeSubnicheId;
      const matchesCategory =
        activeCategory === "all" || prompt.category === activeCategory;
      const matchesFavorite = !favoritesOnly || favoriteIds.has(prompt.id);
      const matchesTerm =
        !term ||
        [prompt.title, prompt.description, prompt.prompt_text, subniche?.name, niche?.name]
          .some((value) => value?.toLocaleLowerCase("pt-BR").includes(term));
      return (
        matchesNiche &&
        matchesSubniche &&
        matchesCategory &&
        matchesFavorite &&
        matchesTerm
      );
    });
  }, [
    activeCategory,
    activeNicheId,
    activeSubnicheId,
    favorites,
    favoritesOnly,
    niches,
    prompts,
    query,
    subniches,
  ]);
  const pageCount = Math.max(1, Math.ceil(visiblePrompts.length / pageSize));
  const displayPage = Math.min(currentPage, pageCount);
  const pagePrompts = visiblePrompts.slice(
    (displayPage - 1) * pageSize,
    displayPage * pageSize,
  );
  const selectedNiche = niches.find((niche) => niche.id === activeNicheId);

  function chooseNiche(nicheId: string) {
    setActiveNicheId(nicheId);
    setActiveSubnicheId("all");
    setActiveCategory("all");
    setCurrentPage(1);
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-[26px] bg-[#24152f] p-5 text-white sm:p-8 lg:p-9">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={
            selectedNiche?.cover_image_url
              ? { backgroundImage: `url("${selectedNiche.cover_image_url}")` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f25] via-[#1a0f25]/90 to-[#1a0f25]/45" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-purple-100">
            <Sparkles size={13} /> {favoritesOnly ? "SEUS FAVORITOS" : "BIBLIOTECA DE PROMPTS"}
          </span>
          <h1 className="mt-4 max-w-xl text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[36px]">
            {favoritesOnly
              ? "Os prompts que você guardou."
              : selectedNiche
                ? `Prompts para ${selectedNiche.name}.`
                : "Encontre o prompt ideal para sua ideia."}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
            {favoritesOnly
              ? "Sua lista pessoal de referências fica salva nesta conta."
              : "Filtre por nicho, especialidade ou categoria e abra um card para consultar o prompt completo."}
          </p>
          <label className="mt-5 flex h-11 max-w-[560px] items-center gap-2.5 rounded-xl bg-white px-3.5 text-[#81788a] shadow-lg">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nome, descrição ou conteúdo..."
              className="w-full bg-transparent text-sm text-[#30253b] outline-none placeholder:text-[#aaa2b2]"
            />
          </label>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#8a55d4]">
              {favoritesOnly ? "Coleção pessoal" : selectedNiche?.name ?? "Todos os nichos"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#21182d]">
              {favoritesOnly ? "Favoritos" : "Prompts disponíveis"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8a8191]">
              {visiblePrompts.length} {visiblePrompts.length === 1 ? "prompt" : "prompts"}
            </span>
            {isAdmin && !favoritesOnly && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#7133bd] px-4 text-xs font-bold text-white transition hover:bg-[#5e279e]"
              >
                <Plus size={16} /> Novo card
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81788a]">
            Nicho
            <select
              value={activeNicheId}
              onChange={(event) => chooseNiche(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e7e2eb] bg-white px-3 text-xs font-medium normal-case tracking-normal text-[#30253b] outline-none focus:border-[#9c60e9]"
            >
              <option value="all">Todos os nichos</option>
              {niches.map((niche) => (
                <option key={niche.id} value={niche.id}>
                  {niche.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81788a]">
            Especialidade
            <select
              value={activeSubnicheId}
              onChange={(event) => {
                setActiveSubnicheId(event.target.value);
                setCurrentPage(1);
              }}
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e7e2eb] bg-white px-3 text-xs font-medium normal-case tracking-normal text-[#30253b] outline-none focus:border-[#9c60e9]"
            >
              <option value="all">Todas as especialidades</option>
              {visibleSubniches.map((subniche) => (
                <option key={subniche.id} value={subniche.id}>
                  {subniche.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#81788a]">
            Categoria
            <select
              value={activeCategory}
              onChange={(event) => {
                setActiveCategory(event.target.value);
                setCurrentPage(1);
              }}
              className="mt-1.5 h-10 w-full rounded-xl border border-[#e7e2eb] bg-white px-3 text-xs font-medium normal-case tracking-normal text-[#30253b] outline-none focus:border-[#9c60e9]"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        {pagePrompts.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {pagePrompts.map((prompt) => {
              const subniche = subniches.find((item) => item.id === prompt.subniche_id);
              return (
                <div key={prompt.id} className="relative">
                  <PromptCard
                    prompt={prompt}
                    subnicheName={subniche?.name ?? "Nicho"}
                    isAdmin={isAdmin}
                    isFavorite={favorites.includes(prompt.id)}
                    onOpen={() => setSelectedPrompt(prompt)}
                    onEdit={() => setEditingPrompt(prompt)}
                    onToggleFavorite={() => onToggleFavorite(prompt.id)}
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDelete(prompt)}
                      className="absolute right-14 top-3 rounded-lg bg-black/50 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-rose-700"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-[#d9cde3] bg-white/60 px-5 py-12 text-center">
            <p className="font-semibold text-[#30253b]">
              {favoritesOnly ? "Você ainda não salvou nenhum prompt" : "Nenhum prompt encontrado"}
            </p>
            <p className="mt-1 text-sm text-[#81788a]">
              {isAdmin && !favoritesOnly
                ? "Crie um card ou ajuste os filtros para encontrar resultados."
                : "Tente outros filtros ou volte mais tarde para conferir as novidades."}
            </p>
          </div>
        )}

        {pageCount > 1 && (
          <nav
            aria-label="Paginação de prompts"
            className="mt-6 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              disabled={displayPage === 1}
              onClick={() => setCurrentPage(displayPage - 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e7e2eb] bg-white px-3 text-xs font-semibold text-[#5b5065] disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Anterior
            </button>
            <span className="text-xs text-[#81788a]" aria-live="polite">
              Página {displayPage} de {pageCount}
            </span>
            <button
              type="button"
              disabled={displayPage === pageCount}
              onClick={() => setCurrentPage(displayPage + 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e7e2eb] bg-white px-3 text-xs font-semibold text-[#5b5065] disabled:opacity-40"
            >
              Próxima <ChevronRight size={15} />
            </button>
          </nav>
        )}
      </section>

      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt}
          isFavorite={favorites.includes(selectedPrompt.id)}
          onClose={() => setSelectedPrompt(null)}
          onToggleFavorite={() => onToggleFavorite(selectedPrompt.id)}
        />
      )}
      {(isCreating || editingPrompt) && (
        <PromptEditor
          key={editingPrompt?.id ?? "new-prompt"}
          subniches={subniches}
          prompt={editingPrompt}
          onClose={() => {
            setIsCreating(false);
            setEditingPrompt(null);
          }}
          onSave={onSave}
        />
      )}
    </div>
  );
}
