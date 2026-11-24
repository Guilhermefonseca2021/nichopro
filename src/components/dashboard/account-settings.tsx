"use client";

import { KeyRound, LoaderCircle, Mail, Save, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

type AccountSettingsProps = {
  name: string;
  email: string;
  onSaveName: (name: string) => Promise<void>;
  onChangePassword: (password: string) => Promise<void>;
};

export function AccountSettings({
  name,
  email,
  onSaveName,
  onChangePassword,
}: AccountSettingsProps) {
  const [fullName, setFullName] = useState(name);
  const [nameMessage, setNameMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-[#e7e2eb] bg-white px-3.5 text-sm text-[#30253b] outline-none focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100";

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameError("");
    setNameMessage("");
    setSavingName(true);
    try {
      await onSaveName(fullName.trim());
      setNameMessage("Nome atualizado.");
    } catch (error) {
      setNameError(error instanceof Error ? error.message : "Não foi possível atualizar o nome.");
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (password !== confirmPassword) {
      setPasswordError("As senhas não correspondem.");
      return;
    }
    setSavingPassword(true);
    try {
      await onChangePassword(password);
      setPassword("");
      setConfirmPassword("");
      setPasswordMessage("Senha alterada com sucesso.");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Não foi possível alterar a senha.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#8a55d4]">
          Seus dados
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#21182d] sm:text-3xl">
          Minha conta
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#81788a]">
          Atualize seu nome ou defina uma nova senha. Sua senha nunca é armazenada pela aplicação.
        </p>
      </div>

      <div className="grid gap-5">
        <section className="rounded-3xl border border-[#ece6f0] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f3eaff] text-[#7936c5]">
              <UserRound size={19} />
            </span>
            <div>
              <h2 className="font-bold text-[#30253b]">Dados do perfil</h2>
              <p className="text-xs text-[#81788a]">Seu nome e e-mail de acesso</p>
            </div>
          </div>

          <form onSubmit={saveName} className="space-y-4">
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
              <span className="relative mt-1.5 block">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
                />
                <input
                  readOnly
                  value={email}
                  className={`${inputClass} bg-[#faf8fc] pl-10 text-[#81788a]`}
                />
              </span>
            </label>
            {nameError && <p role="alert" className="text-xs text-rose-700">{nameError}</p>}
            {nameMessage && <p role="status" className="text-xs text-emerald-700">{nameMessage}</p>}
            <button
              type="submit"
              disabled={savingName || fullName.trim() === name}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#7133bd] px-4 text-xs font-bold text-white transition hover:bg-[#5e279e] disabled:opacity-50"
            >
              {savingName ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar nome
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-[#ece6f0] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f3eaff] text-[#7936c5]">
              <KeyRound size={19} />
            </span>
            <div>
              <h2 className="font-bold text-[#30253b]">Alterar senha</h2>
              <p className="text-xs text-[#81788a]">Use uma senha com pelo menos 8 caracteres</p>
            </div>
          </div>

          <form onSubmit={changePassword} className="space-y-4">
            <label className="block text-xs font-semibold text-[#4c4356]">
              Nova senha
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-semibold text-[#4c4356]">
              Confirmar nova senha
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
              />
            </label>
            {passwordError && <p role="alert" className="text-xs text-rose-700">{passwordError}</p>}
            {passwordMessage && <p role="status" className="text-xs text-emerald-700">{passwordMessage}</p>}
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e7d5f8] px-4 text-xs font-bold text-[#7133bd] transition hover:bg-[#f8f2ff] disabled:opacity-50"
            >
              {savingPassword && <LoaderCircle size={15} className="animate-spin" />}
              Atualizar senha
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
