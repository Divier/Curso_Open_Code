import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

export function generateInvitationCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueCode(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateInvitationCode();
    const { data, error } = await supabase
      .from("invitations")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      throw new Error("Failed to verify invitation code uniqueness");
    }

    if (!data) {
      return code;
    }
  }

  throw new Error("Could not generate unique invitation code after multiple attempts");
}
