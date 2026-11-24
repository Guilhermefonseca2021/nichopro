"use client";

import {
  Check,
  Clock3,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserEditor } from "@/components/dashboard/user-editor";
import type {
  AccessStatus,
  DashboardUser,
  PaymentStatus,
  UserRole,
} from "@/lib/dashboard/types";

type AdminUsersProps = {
  getAccessToken: () => Promise<string | null>;
};

type UserEditorValues = {
  fullName: string;
  email: string;
  role: UserRole;
};

export function AdminUsers({ getAccessToken }: AdminUsersProps) {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");

  const request = useCallback(
    async (method: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
      const response = await fetch("/api/admin/users", {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível completar a operação.");
      return result;
    },
    [getAccessToken],
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await request("GET");
      setUsers(result.users as DashboardUser[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return users.filter((user) => {
      const matchesTerm =
        !term ||
        user.full_name.toLocaleLowerCase("pt-BR").includes(term) ||
        user.email.toLocaleLowerCase("pt-BR").includes(term);
      const matchesFilter =
        filter === "all" ||
        user.access_status === "pending" ||
        user.payment_status === "pending";
      return matchesTerm && matchesFilter;
    });
  }, [filter, query, users]);

  async function saveUser(values: UserEditorValues) {
    if (editingUser) {
      await request("PATCH", {
        id: editingUser.id,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });
    } else {
      await request("POST", {
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });
    }
    await loadUsers();
  }

  async function updateStatus(
    user: DashboardUser,
    field: "accessStatus" | "paymentStatus",
    value: AccessStatus | PaymentStatus,
  ) {
    setBusyUserId(user.id);
    setError("");
    try {
      await request("PATCH", { id: user.id, [field]: value });
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...(field === "accessStatus"
                  ? { access_status: value as AccessStatus }
                  : { payment_status: value as PaymentStatus }),
              }
            : item,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar.");
    } finally {
      setBusyUserId("");
    }
  }

  async function deleteUser(user: DashboardUser) {
    if (!window.confirm(`Excluir a conta de ${user.full_name} (${user.email})?`)) return;
    setBusyUserId(user.id);
    setError("");
    try {
      await request("DELETE", { id: user.id });
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir.");
    } finally {
      setBusyUserId("");
    }
  }

  const pendingCount = users.filter(
    (user) => user.access_status === "pending" || user.payment_status === "pending",
  ).length;
  const approvedCount = users.filter(
    (user) => user.access_status === "approved" && user.payment_status === "paid",
  ).length;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#8a55d4]">
            Área administrativa
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#21182d] sm:text-3xl">
            Usuários e acessos
          </h1>
          <p className="mt-2 text-sm text-[#81788a]">
            Aprove solicitações, confirme pagamentos e gerencie contas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setCreating(true);
          }}
          className="flex h-10 items-center gap-2 rounded-xl bg-[#7133bd] px-4 text-xs font-bold text-white hover:bg-[#5e279e]"
        >
          <Plus size={16} /> Criar usuário
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total de contas" value={users.length} icon={UserRound} />
        <SummaryCard label="Aguardando liberação" value={pendingCount} icon={Clock3} />
        <SummaryCard label="Acesso ativo" value={approvedCount} icon={ShieldCheck} />
      </div>

      <div className="rounded-2xl border border-[#ece6f0] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold ${filter === "all" ? "bg-[#292035] text-white" : "bg-[#f3eff6] text-[#61576b]"}`}
            >
              Todos ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold ${filter === "pending" ? "bg-[#292035] text-white" : "bg-[#f3eff6] text-[#61576b]"}`}
            >
              Pendentes ({pendingCount})
            </button>
          </div>
          <label className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-[#e7e2eb] px-3 text-[#81788a]">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nome ou e-mail"
              className="w-full text-xs outline-none placeholder:text-[#aaa2b2]"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-[#81788a]">Carregando usuários...</p>
        ) : visibleUsers.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#81788a]">Nenhum usuário encontrado.</p>
        ) : (
          <div className="space-y-3">
            {visibleUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-[#eee8f3] p-4 transition hover:border-[#d8c6e9]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1e7fc] font-bold text-[#7235b2]">
                      {user.full_name.charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#30253b]">
                        {user.full_name || "Sem nome"}
                      </span>
                      <span className="block truncate text-xs text-[#81788a]">{user.email}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`}>
                      {user.role === "admin" ? "ADMIN" : "USUÁRIO"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditingUser(user);
                      }}
                      aria-label={`Editar ${user.full_name}`}
                      className="rounded-lg p-2 text-[#7133bd] hover:bg-[#f5effb]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteUser(user)}
                      disabled={busyUserId === user.id}
                      aria-label={`Excluir ${user.full_name}`}
                      className="rounded-lg p-2 text-[#9b5361] hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-[#f0ebf3] pt-3 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-[#81788a]">
                    Aprovação
                    <select
                      value={user.access_status}
                      disabled={busyUserId === user.id}
                      onChange={(event) =>
                        void updateStatus(user, "accessStatus", event.target.value as AccessStatus)
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-[#e7e2eb] bg-white px-2.5 text-xs font-semibold text-[#4c4356] outline-none focus:border-[#9c60e9]"
                    >
                      <option value="pending">Aguardando revisão</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Não aprovado</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-[#81788a]">
                    Pagamento
                    <select
                      value={user.payment_status}
                      disabled={busyUserId === user.id}
                      onChange={(event) =>
                        void updateStatus(user, "paymentStatus", event.target.value as PaymentStatus)
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-[#e7e2eb] bg-white px-2.5 text-xs font-semibold text-[#4c4356] outline-none focus:border-[#9c60e9]"
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                  </label>
                </div>
                {user.access_status === "approved" && user.payment_status === "paid" && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <Check size={14} /> Acesso liberado à biblioteca
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {(creating || editingUser) && (
        <UserEditor
          key={editingUser?.id ?? "new-user"}
          user={editingUser}
          onClose={() => {
            setCreating(false);
            setEditingUser(null);
          }}
          onSave={saveUser}
        />
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ece6f0] bg-white p-4 shadow-sm">
      <span className="grid size-10 place-items-center rounded-xl bg-[#f3eaff] text-[#7133bd]">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-xl font-extrabold text-[#30253b]">{value}</span>
        <span className="block text-[11px] text-[#81788a]">{label}</span>
      </span>
    </div>
  );
}
