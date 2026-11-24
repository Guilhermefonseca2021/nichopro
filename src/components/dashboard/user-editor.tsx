"use client";

import { LoaderCircle, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { DashboardUser, UserRole } from "@/lib/dashboard/types";

type UserEditorProps = {
  user?: DashboardUser | null;
  onClose: () => void;
  onSave: (values: { fullName: string; email: string; role: UserRole }) => Promise<void>;
};

export function UserEditor({ user, onClose, onSave }: UserEditorProps) {
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "user");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ fullName, email, role });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-[#e7e2eb] bg-white px-3.5 text-sm outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#150c20]/65 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-editor-title"
        className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a55d4]">
              {user ? "Editar conta" : "Novo acesso"}
            </p>
            <h2 id="user-editor-title" className="mt-1 text-xl font-extrabold text-[#21182d]">
              {user ? "Dados do usuário" : "Convidar usuário"}
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
            Nome completo
            <input
              required
              minLength={2}
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs font-semibold text-[#4c4356]">
            E-mail
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs font-semibold text-[#4c4356]">
            Perfil
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className={inputClass}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          {!user && (
            <p className="rounded-xl bg-[#f7f0ff] px-3.5 py-3 text-xs leading-5 text-[#5a347f]">
              A pessoa receberá um convite por e-mail para definir a senha. O novo
              acesso começa pendente e precisa ser aprovado e marcado como pago.
            </p>
          )}
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
            {saving ? "Salvando..." : user ? "Salvar alterações" : "Enviar convite"}
          </button>
        </form>
      </section>
    </div>
  );
}
