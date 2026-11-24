"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Prompt, PromptInput, Subniche } from "@/lib/dashboard/types";

type PromptEditorProps = {
  subniches: Subniche[];
  prompt: Prompt | null;
  onClose: () => void;
  onSave: (input: PromptInput, id?: string) => Promise<void>;
};

const emptyForm: PromptInput = {
  subniche_id: "",
  title: "",
  description: "",
  image_url: "",
  prompt_text: "",
  category: "Todos",
  is_published: true,
};

export function PromptEditor({ subniches, prompt, onClose, onSave }: PromptEditorProps) {
  const [form, setForm] = useState<PromptInput>(() =>
    prompt
      ? {
          subniche_id: prompt.subniche_id,
          title: prompt.title,
          description: prompt.description,
          image_url: prompt.image_url,
          prompt_text: prompt.prompt_text,
          category: prompt.category,
          is_published: prompt.is_published,
        }
      : { ...emptyForm, subniche_id: subniches[0]?.id ?? "" },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PromptInput>(key: K, value: PromptInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form, prompt?.id);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o card.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-[#e7e2eb] bg-white px-3.5 text-sm text-[#30253b] outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#150c20]/65 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-editor-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a55d4]">
              Biblioteca
            </p>
            <h2 id="prompt-editor-title" className="mt-1 text-xl font-extrabold text-[#21182d]">
              {prompt ? "Editar card" : "Novo card de prompt"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar formulário"
            onClick={onClose}
            className="rounded-lg p-2 text-[#81788a] hover:bg-[#f4f0f7]"
          >
            <X size={19} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-[#4c4356]">
            Título do card
            <input
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ex.: Foto de produto irresistível"
              className={inputClass}
            />
          </label>

          <label className="block text-xs font-semibold text-[#4c4356]">
            Nicho e subnicho
            <select
              required
              value={form.subniche_id}
              onChange={(event) => update("subniche_id", event.target.value)}
              className={inputClass}
            >
              {subniches.map((subniche) => (
                <option key={subniche.id} value={subniche.id}>
                  {subniche.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-[#4c4356]">
            Descrição do card
            <textarea
              required
              rows={2}
              maxLength={400}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Explique o resultado que este prompt ajuda a criar."
              className="mt-1.5 w-full resize-y rounded-xl border border-[#e7e2eb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
            />
          </label>

          <label className="block text-xs font-semibold text-[#4c4356]">
            Link da imagem
            <span className="relative mt-1.5 block">
              <ImagePlus
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
              />
              <input
                required
                type="url"
                value={form.image_url}
                onChange={(event) => update("image_url", event.target.value)}
                placeholder="https://..."
                className={`${inputClass} mt-0 pl-10`}
              />
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#4c4356]">
              Categoria
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className={inputClass}
              >
                {["Todos", "Flyers", "Tratamento", "Com Pessoas", "Cenários Criativos"].map(
                  (category) => (
                    <option key={category}>{category}</option>
                  ),
                )}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-3 text-xs font-semibold text-[#4c4356]">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => update("is_published", event.target.checked)}
                className="size-4 accent-[#7936c5]"
              />
              Publicado para usuários
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#4c4356]">
            Prompt completo
            <textarea
              required
              rows={6}
              value={form.prompt_text}
              onChange={(event) => update("prompt_text", event.target.value)}
              placeholder="Descreva o prompt completo que o cliente poderá consultar e copiar."
              className="mt-1.5 w-full resize-y rounded-xl border border-[#e7e2eb] bg-white px-3.5 py-3 text-sm leading-6 outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving || subniches.length === 0}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7832cf] to-[#6322b4] text-sm font-bold text-white disabled:opacity-50"
          >
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? "Salvando..." : prompt ? "Salvar alterações" : "Publicar card"}
          </button>
        </form>
      </section>
    </div>
  );
}
