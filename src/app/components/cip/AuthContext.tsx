import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, initialAuthHash } from "../../../lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileLocally: (updates: any) => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null, loading: true, refreshProfile: async () => {}, updateProfileLocally: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userObj: User) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userObj.id).single();
    if (data) {
      // Sensitive fields live in the owner-only profile_private table; merge them in.
      const { data: priv } = await supabase.from("profile_private").select("party, tradition").eq("user_id", userObj.id).maybeSingle();
      setProfile({ ...data, party: priv?.party ?? null, tradition: priv?.tradition ?? null });
    } else {
      setProfile({
        id: userObj.id,
        first_name: userObj.user_metadata?.first_name || "",
        last_name: userObj.user_metadata?.last_name || "",
        onboarded: false,
      });
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user);
    }
  };

  const updateProfileLocally = (updates: any) => {
    setProfile((prev: any) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    (async () => {
      let session = (await supabase.auth.getSession()).data.session;
      // A verify/recovery email link carries the session in the URL hash. If the
      // client's automatic detection didn't establish it, set it explicitly so
      // the user isn't bounced to sign-in after confirming their email.
      if (!session && initialAuthHash.includes("access_token")) {
        const p = new URLSearchParams(initialAuthHash.replace(/^#/, ""));
        const access_token = p.get("access_token");
        const refresh_token = p.get("refresh_token");
        if (access_token && refresh_token) {
          session = (await supabase.auth.setSession({ access_token, refresh_token })).data.session;
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, updateProfileLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
