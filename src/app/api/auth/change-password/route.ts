import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";

  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: "La clave debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, message: "Sesión expirada." }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ ok: false, message: "No pudimos cambiar la clave." }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      password_changed_at: new Date().toISOString()
    }
  });

  return NextResponse.json({ ok: true });
}
