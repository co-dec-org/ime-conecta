import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/utils";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = normalizeUsername(body?.username ?? "");
  const password = body?.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ ok: false, message: "Usuario o clave inválidos." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: users, error: profileError } = await admin
    .from("authorized_users")
    .select("id,auth_user_id,email,first_name,last_name,status")
    .eq("status", "activo")
    .not("first_name", "is", null);

  if (profileError) {
    return NextResponse.json({ ok: false, message: "No pudimos validar el acceso." }, { status: 500 });
  }

  const profile = users?.find((user) => normalizeUsername(user.first_name ?? "") === username);

  if (!profile?.email) {
    return NextResponse.json({ ok: false, message: "Usuario o clave inválidos." }, { status: 401 });
  }

  const email = normalizeEmail(profile.email);
  let authUserId = profile.auth_user_id as string | null;
  let authUserMetadata: Record<string, unknown> = {};

  if (authUserId) {
    const { data: authUser } = await admin.auth.admin.getUserById(authUserId);
    authUserMetadata = authUser.user?.user_metadata ?? {};
  } else {
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      return NextResponse.json({ ok: false, message: "No pudimos preparar el acceso." }, { status: 500 });
    }
    const existing = authUsers.users.find((user) => normalizeEmail(user.email ?? "") === email);
    if (existing) {
      authUserId = existing.id;
      authUserMetadata = existing.user_metadata ?? {};
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: email,
        email_confirm: true,
        user_metadata: {
          authorized_user_id: profile.id,
          full_name: `${profile.first_name} ${profile.last_name}`.trim()
        }
      });
      if (createError) {
        return NextResponse.json({ ok: false, message: "No pudimos preparar el acceso." }, { status: 500 });
      }
      authUserId = created.user.id;
      authUserMetadata = created.user.user_metadata ?? {};
    }
  }

  const supabase = await createClient();
  let { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error && !authUserMetadata.password_changed_at && password === email && authUserId) {
    const { error: updatePasswordError } = await admin.auth.admin.updateUserById(authUserId, {
      email,
      email_confirm: true,
      password: email,
      user_metadata: {
        ...authUserMetadata,
        authorized_user_id: profile.id,
        full_name: `${profile.first_name} ${profile.last_name}`.trim()
      }
    });

    if (!updatePasswordError) {
      const retry = await supabase.auth.signInWithPassword({ email, password });
      error = retry.error;
    }
  }

  if (error) {
    return NextResponse.json({ ok: false, message: "Usuario o clave inválidos." }, { status: 401 });
  }

  const now = new Date().toISOString();
  await admin
    .from("authorized_users")
    .update({
      auth_user_id: authUserId,
      last_validated_at: now,
      last_active_at: now,
      force_revalidation: false
    })
    .eq("id", profile.id);

  return NextResponse.json({ ok: true });
}
