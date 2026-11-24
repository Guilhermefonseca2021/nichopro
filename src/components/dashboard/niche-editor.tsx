"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Niche, NicheInput, Subniche, SubnicheInput } from "@/lib/dashboard/types";

type NicheEditorProps = {
  niche: Niche;
  subniche?: Subniche;
  onClose: () => void;
  onSaveNiche: (id: string, input: NicheInput) => Promise<void>;
  onSaveSubniche: (id: string, input: SubnicheInput) => Promise<void>;
};

export function NicheEditor({
  niche,
  subniche,
  onClose,
  onSaveNiche,
  onSaveSubniche,
}: NicheEditorProps) {
  const [name, setName] = useState(subniche?.name ?? niche.name);
  const [description, setDescription] = useState(niche.description);
  const [imageUrl, setImageUrl] = useState(
    subniche?.cover_image_url ?? niche.cover_image_url,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (subniche) {
        await onSaveSubniche(subniche.id, {
          name: name.trim(),
          cover_image_url: imageUrl.trim(),
        });
      } else {
        await onSaveNiche(niche.id, {
          name: name.trim(),
          description: description.trim(),
          cover_image_url: imageUrl.trim(),
        });
      }
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar as alterações do nicho.",
      );
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
        aria-labelledby="niche-editor-title"
        className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a55d4]">
              Administração de nichos
            </p>
            <h2 id="niche-editor-title" className="mt-1 text-xl font-extrabold text-[#21182d]">
              Editar {subniche ? "subnicho" : "nicho"}
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
            Nome
            <input
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </label>

          {!subniche && (
            <label className="block text-xs font-semibold text-[#4c4356]">
              Descrição
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1.5 w-full resize-y rounded-xl border border-[#e7e2eb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100"
              />
            </label>
          )}

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
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className={`${inputClass} mt-0 pl-10`}
              />
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7832cf] to-[#6322b4] text-sm font-bold text-white disabled:opacity-50"
          >
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </section>
    </div>
  );
}
