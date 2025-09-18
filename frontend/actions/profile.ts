"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { profileSchema } from "@/schemas";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Unauthorized" };
  }

  const data = { name: (formData.get("name") || "").toString() };
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    // return the first error key; client will localize
    const message = parsed.error.issues[0]?.message || "invalid";
    return { ok: false, message };
  }
  const { name } = parsed.data;

  await db.user.update({ where: { id: session.user.id }, data: { name } });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}
