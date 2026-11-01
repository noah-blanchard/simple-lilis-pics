"use client";

import { createSupabaseBrowserClient } from "@lili/core/supabase/browser";
import { PillButton } from "@lili/ui/components/PillButton";
import { useRouter } from "next/navigation";

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
