"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { settingsSchema } from "@/schemas";

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Unauthorized" };
  }
  // Parse & validate with zod
  const data = {
    preferredLanguage: (formData.get("preferredLanguage") || "en").toString(),
    marketingEmails: formData.get("marketingEmails") ? true : false,
  };
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("\n");
    return { ok: false, message };
  }
  const { preferredLanguage, marketingEmails } = parsed.data;

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage, marketingEmails } as any,
    });
    const reload = true; // if language changed, a reload is appropriate for Maps/Places
    return { ok: true, reload, preferredLanguage };
  } catch (e: any) {
    // Likely the migration hasn't been applied yet; return a helpful message
    const message =
      e?.message?.includes("column") && e?.message?.includes("does not exist")
        ? "Database not migrated: please run `npx prisma migrate dev --name add_user_preferences` (dev) or `npx prisma migrate deploy` (prod)."
        : e?.message || "Failed to update settings";
    return { ok: false, message };
  }
}
