"use client";

import { useRouter } from "next/navigation";
import { PillButton } from "@/components/PillButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <PillButton variant="danger" size="sm" onClick={onSignOut}>
      Sign out
    </PillButton>
  );
}
