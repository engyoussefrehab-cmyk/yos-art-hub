import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in-not-admin"; session: Session }
  | { status: "admin"; session: Session };

export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    const check = async (session: Session | null) => {
      if (!mounted) return;
      if (!session) {
        setState({ status: "signed-out" });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setState(
        data
          ? { status: "admin", session }
          : { status: "signed-in-not-admin", session },
      );
    };

    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
