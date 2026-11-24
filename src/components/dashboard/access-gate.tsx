"use client";

import { Clock3, CreditCard, ShieldAlert, UserRound } from "lucide-react";
import type { AccessStatus, PaymentStatus } from "@/lib/dashboard/types";

type AccessGateProps = {
  name: string;
  accessStatus: AccessStatus;
  paymentStatus: PaymentStatus;
  onManageAccount: () => void;
};

export function AccessGate({
  name,
  accessStatus,
  paymentStatus,
  onManageAccount,
}: AccessGateProps) {
  const isRejected = accessStatus === "rejected";
  const Icon = isRejected ? ShieldAlert : paymentStatus === "pending" && accessStatus === "approved" ? CreditCard : Clock3;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[#eee7f5] bg-white p-7 text-center shadow-sm sm:p-10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f3eaff] text-[#7936c5]">
        <Icon size={26} />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#8a55d4]">
        Acesso à biblioteca
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#21182d] sm:text-3xl">
        {isRejected ? "Acesso não liberado" : `Estamos preparando seu acesso, ${name}`}
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#81788a]">
        {isRejected
          ? "Sua solicitação não foi aprovada. Entre em contato com a equipe para saber mais."
          : accessStatus !== "approved"
            ? "Sua conta foi criada e está aguardando a aprovação do administrador. Você poderá acessar os prompts assim que seu acesso for liberado."
            : "Seu acesso foi aprovado e está aguardando a confirmação do pagamento pelo administrador. A biblioteca será liberada assim que estiver tudo certo."}
      </p>
      <div className="mt-7 inline-flex flex-wrap justify-center gap-2">
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${accessStatus === "approved" ? "bg-emerald-50 text-emerald-700" : isRejected ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
          Aprovação: {accessStatus === "approved" ? "Liberada" : isRejected ? "Recusada" : "Pendente"}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          Pagamento: {paymentStatus === "paid" ? "Confirmado" : "Pendente"}
        </span>
      </div>
      <div>
        <button
          type="button"
          onClick={onManageAccount}
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl border border-[#e7d5f8] px-4 text-xs font-bold text-[#7133bd] transition hover:bg-[#f8f2ff]"
        >
          <UserRound size={15} /> Minha conta
        </button>
      </div>
    </div>
  );
}
