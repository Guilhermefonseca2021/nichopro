import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AccessStatus,
  DashboardUser,
  PaymentStatus,
  UserRole,
} from "@/lib/dashboard/types";

type AdminContext = {
  client: SupabaseClient;
  userId: string;
};

const accessStatuses: AccessStatus[] = ["pending", "approved", "rejected"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid"];
const roles: UserRole[] = ["user", "admin"];

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin(request: NextRequest): Promise<AdminContext | NextResponse> {
  const client = getSupabaseAdminClient();
  if (!client) {
    return responseError(
      "Configure SUPABASE_SECRET_KEY no ambiente do servidor para habilitar a administração de usuários.",
      503,
    );
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return responseError("Sessão não encontrada.", 401);
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return responseError("Sessão inválida ou expirada.", 401);
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return responseError("Não foi possível verificar as permissões da conta.", 500);
  }
  if (profile?.role !== "admin") {
    return responseError("Acesso restrito a administradores.", 403);
  }

  return { client, userId: data.user.id };
}

function isResponse(value: AdminContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

async function getDashboardUsers(
  client: SupabaseClient,
): Promise<DashboardUser[]> {
  const [{ data: profiles, error: profilesError }, { data: authData, error: authError }] =
    await Promise.all([
      client
        .from("profiles")
        .select("id, full_name, role, access_status, payment_status, created_at")
        .order("created_at", { ascending: false }),
      client.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }
  if (authError) {
    throw new Error(authError.message);
  }

  const emails = new Map(
    authData.users.map((user: User) => [user.id, user.email ?? ""]),
  );
  return (profiles ?? []).map((profile) => ({
    ...profile,
    email: emails.get(profile.id) ?? "",
  })) as DashboardUser[];
}

export async function GET(request: NextRequest) {
  const context = await requireAdmin(request);
  if (isResponse(context)) {
    return context;
  }

  try {
    return NextResponse.json({ users: await getDashboardUsers(context.client) });
  } catch {
    return responseError("Não foi possível carregar os usuários.", 500);
  }
}

export async function POST(request: NextRequest) {
  const context = await requireAdmin(request);
  if (isResponse(context)) {
    return context;
  }

  let body: { email?: unknown; fullName?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return responseError("Envie os dados do usuário em JSON.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const role = body.role;

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    fullName.length < 2 ||
    fullName.length > 100 ||
    typeof role !== "string" ||
    !roles.includes(role as UserRole)
  ) {
    return responseError("Informe nome, e-mail válido e perfil da conta.", 400);
  }

  for (let page = 1; ; page += 1) {
    const { data: existingUsers, error: existingUsersError } =
      await context.client.auth.admin.listUsers({ page, perPage: 1000 });
    if (existingUsersError) {
      return responseError("Não foi possível verificar se o e-mail já está cadastrado.", 500);
    }
    if (
      existingUsers.users.some(
        (user) => user.email?.toLowerCase() === email,
      )
    ) {
      return responseError("Já existe uma conta com este e-mail.", 409);
    }
    if (existingUsers.users.length < 1000) break;
  }

  const { data, error } = await context.client.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: new URL("/dashboard", request.url).toString(),
  });

  if (error || !data.user) {
    return responseError(
      error?.message ?? "Não foi possível criar o convite para esta conta.",
      400,
    );
  }

  const { error: profileError } = await context.client
    .from("profiles")
    .upsert(
      {
        id: data.user.id,
        full_name: fullName,
        role,
        access_status: "pending",
        payment_status: "pending",
      },
      { onConflict: "id" },
    );

  if (profileError) {
    return responseError("A conta foi convidada, mas não foi possível configurar seu perfil.", 500);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const context = await requireAdmin(request);
  if (isResponse(context)) {
    return context;
  }

  let body: {
    id?: unknown;
    email?: unknown;
    fullName?: unknown;
    role?: unknown;
    accessStatus?: unknown;
    paymentStatus?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return responseError("Envie as alterações em JSON.", 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return responseError("Identificador de usuário inválido.", 400);
  }

  const profileUpdates: Record<string, string> = {};
  if (typeof body.fullName === "string") {
    const fullName = body.fullName.trim();
    if (fullName.length < 2 || fullName.length > 100) {
      return responseError("O nome deve ter entre 2 e 100 caracteres.", 400);
    }
    profileUpdates.full_name = fullName;
  }
  if (typeof body.role === "string") {
    if (!roles.includes(body.role as UserRole)) {
      return responseError("Perfil de usuário inválido.", 400);
    }
    if (id === context.userId && body.role !== "admin") {
      return responseError("Você não pode remover seu próprio acesso administrativo.", 400);
    }
    if (body.role !== "admin") {
      const { count, error } = await context.client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if (error) {
        return responseError("Não foi possível validar os administradores ativos.", 500);
      }
      if ((count ?? 0) <= 1) {
        const { data: target } = await context.client
          .from("profiles")
          .select("role")
          .eq("id", id)
          .maybeSingle();
        if (target?.role === "admin") {
          return responseError("É necessário manter pelo menos um administrador.", 400);
        }
      }
    }
    profileUpdates.role = body.role;
  }
  if (typeof body.accessStatus === "string") {
    if (!accessStatuses.includes(body.accessStatus as AccessStatus)) {
      return responseError("Status de acesso inválido.", 400);
    }
    profileUpdates.access_status = body.accessStatus;
  }
  if (typeof body.paymentStatus === "string") {
    if (!paymentStatuses.includes(body.paymentStatus as PaymentStatus)) {
      return responseError("Status de pagamento inválido.", 400);
    }
    profileUpdates.payment_status = body.paymentStatus;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return responseError("Informe um e-mail válido.", 400);
    }
    const { error } = await context.client.auth.admin.updateUserById(id, { email });
    if (error) {
      return responseError(error.message, 400);
    }
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await context.client
      .from("profiles")
      .update(profileUpdates)
      .eq("id", id);
    if (error) {
      return responseError("Não foi possível salvar as alterações do usuário.", 500);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const context = await requireAdmin(request);
  if (isResponse(context)) {
    return context;
  }

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return responseError("Envie o identificador do usuário em JSON.", 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id || id === context.userId) {
    return responseError("Não é possível excluir sua própria conta administrativa.", 400);
  }

  const { data: target, error: targetError } = await context.client
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  if (targetError) {
    return responseError("Não foi possível verificar a conta selecionada.", 500);
  }
  if (target?.role === "admin") {
    const { count, error } = await context.client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) {
      return responseError("Não foi possível validar os administradores ativos.", 500);
    }
    if ((count ?? 0) <= 1) {
      return responseError("É necessário manter pelo menos um administrador.", 400);
    }
  }

  const { error } = await context.client.auth.admin.deleteUser(id);
  if (error) {
    return responseError("Não foi possível excluir esta conta.", 400);
  }

  return NextResponse.json({ ok: true });
}
