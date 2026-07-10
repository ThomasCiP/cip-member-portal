import { useState, useEffect, useRef, useCallback, Component, ErrorInfo, ReactNode } from "react";
import { supabase } from "../lib/supabase";

import { Screen } from "./components/cip/types";
import { ThemeContext, getTheme, NAVY, GOLD } from "./components/cip/brand";
import { useAuth } from "./components/cip/AuthContext";
import {
  SignupScreen, SignInScreen, AccountScreen, CreedScreen, BlockedScreen, WelcomeScreen, DeletedAccountScreen,
  UpdatePasswordScreen
} from "./components/cip/PublicScreens";
import { MemberShell } from "./components/cip/MemberShell";
import {
  Dashboard, ProfileScreen, MemberProfileScreen, NetworkHub, GroupDetailScreen,
  EventsScreen, EventDetail, MessagesScreen, SupportScreen,
  DonateScreen, SettingsScreen, PrivacyScreen, NotificationsScreen,
} from "./components/cip/MemberScreens";
import {
  AdminShell, AdminOverview, AdminMembers, AdminSupport, AdminSupportDetail,
  AdminEvents, AdminContent, AdminDonations, AdminPrivacy, AdminGroups, AdminEnquiries,
  AdminComplaints,
} from "./components/cip/AdminScreens";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Something went wrong in this tab.</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const PUBLIC_SCREENS: Screen[] = ["signup", "signin", "account", "creed", "blocked", "welcome", "deleted-account", "update-password"];
const ADMIN_SCREENS: Screen[] = [
  "admin-overview", "admin-members", "admin-support", "admin-support-detail", "admin-complaints",
  "admin-enquiries", "admin-events", "admin-content", "admin-resources", "admin-announcements",
  "admin-affiliated", "admin-donations", "admin-privacy", "admin-groups",
];

function normalizeMember(s: Screen): Screen {
  if (s === "event-detail") return "events";
  // Groups, Orgs and their detail pages now live inside the Network hub, so they
  // all highlight the single "Network" top-nav item.
  if (s === "group-detail" || s === "groups" || s === "organisations" || s === "member-profile") return "network";
  if (s === "privacy") return "settings";
  if (s === "donate") return "dashboard";
  return s;
}

function isRecoveryLanding() {
  if (typeof window === "undefined") return false;
  // resetPasswordForEmail redirects to "…/?reset=true"; the recovery token also
  // arrives as "type=recovery" in the URL hash.
  return new URLSearchParams(window.location.search).get("reset") === "true"
    || window.location.hash.includes("type=recovery");
}

// The screen the back button falls back to when there's nothing left in the
// in-app history — i.e. the CiP homepage.
const HOME_SCREEN: Screen = "dashboard";

// Screen navigation is a state machine with no URL routing, so screen changes
// were never recorded in the browser's history. That meant the nav bar / OS
// back button popped straight out of the app. This hook mirrors each screen
// change into the History API so back moves between screens instead, and when
// the in-app history is exhausted it traps back on the homepage rather than
// letting the user leave the app.
function useHistoryScreen(initial: Screen) {
  const [screen, setScreenState] = useState<Screen>(initial);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  // Seed the first history entry so there's always an in-app screen to land on.
  useEffect(() => {
    window.history.replaceState({ cipScreen: screenRef.current }, "");
  }, []);

  useEffect(() => {
    function onPop(e: PopStateEvent) {
      const next = (e.state && e.state.cipScreen) as Screen | undefined;
      if (next) {
        // Returning to a screen we previously pushed — just sync state.
        setScreenState(next);
      } else {
        // Popped past our own history: nothing in-app to go back to. Keep the
        // user inside the app on the homepage and re-seed a history entry so a
        // further back press has somewhere to land too.
        setScreenState(HOME_SCREEN);
        window.history.pushState({ cipScreen: HOME_SCREEN }, "");
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // User-initiated navigation: push a new history entry so back returns here.
  const navigate = useCallback((next: Screen) => {
    if (screenRef.current !== next) {
      window.history.pushState({ cipScreen: next }, "");
    }
    setScreenState(next);
  }, []);

  // Forced/auth-driven transitions: replace the current entry instead of
  // pushing, so they don't pollute the back stack (e.g. you shouldn't be able
  // to "go back" to the sign-in screen after being auto-redirected in).
  const replace = useCallback((next: Screen) => {
    window.history.replaceState({ cipScreen: next }, "");
    setScreenState(next);
  }, []);

  return { screen, navigate, replace };
}

export default function App() {
  const { user, loading } = useAuth();
  const { screen, navigate, replace } = useHistoryScreen(isRecoveryLanding() ? "update-password" : "signup");
  const [dark, setDark] = useState(false);
  const theme = getTheme(dark);

  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [profileStatus, setProfileStatus] = useState<{ suspended_at?: string | null, deleted_at?: string | null } | null>(null);

  // Email confirmation / auth-callback landings carry the session in the URL
  // hash. Hold a "finishing sign-in" state (rather than flashing the signup
  // form) until Supabase establishes the session, so a just-verified user goes
  // straight into onboarding instead of being bounced to sign-in. Falls back
  // after a timeout if the one-time token never yields a session.
  const isAuthCallback = useRef(typeof window !== "undefined" && /access_token=/.test(window.location.hash));
  const [authWaitDone, setAuthWaitDone] = useState(false);
  useEffect(() => {
    if (!isAuthCallback.current) return;
    const t = setTimeout(() => setAuthWaitDone(true), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function checkProfile() {
      if (user) {
        const { data } = await supabase.from("profiles").select("onboarded, suspended_at, deleted_at").eq("id", user.id).single();
        if (data) {
           setOnboarded(data.onboarded);
           setProfileStatus({ suspended_at: data.suspended_at, deleted_at: data.deleted_at });
        } else {
           setOnboarded(false); // Default to false if profile doesn't have it yet
           setProfileStatus({});
        }
      }
    }
    if (user && !loading) {
       checkProfile();
    }
  }, [user, loading]);

  // Recovery links fire PASSWORD_RECOVERY; route to the set-new-password screen.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") replace("update-password");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    // Suspended/deleted users must never reach the member area — not even by
    // navigating away from the blocked screen. These checks depend on `screen`
    // so any attempt to leave immediately re-forces the blocked/deleted state.
    if (user && profileStatus?.deleted_at) {
      supabase.auth.signOut();
      replace("deleted-account");
      return;
    }
    if (user && profileStatus?.suspended_at) {
      if (screen !== "blocked") replace("blocked");
      return;
    }
    if (user && PUBLIC_SCREENS.includes(screen)) {
      if (screen !== "deleted-account" && screen !== "blocked" && screen !== "update-password") {
        replace("dashboard");
      }
    } else if (!user && !PUBLIC_SCREENS.includes(screen)) {
      replace("signup");
    }
  }, [user, loading, screen, profileStatus, replace]);

  if (loading || (user && onboarded === null) || (isAuthCallback.current && !user && !authWaitDone)) {
    return <div className="min-h-screen flex items-center justify-center">Finishing sign-in…</div>;
  }



  const isPublic = PUBLIC_SCREENS.includes(screen);
  const isAdmin = ADMIN_SCREENS.includes(screen) && user?.email?.endsWith("@christiansinpolitics.com");

  const memberContent = (() => {
    switch (screen) {
      case "dashboard":    return <Dashboard navigate={navigate} onboarded={onboarded ?? true} setOnboarded={setOnboarded} />;
      case "profile":      return <ProfileScreen />;
      case "member-profile": return <MemberProfileScreen navigate={navigate} />;
      case "network":      return <NetworkHub navigate={navigate} />;
      case "groups":       return <NetworkHub navigate={navigate} initialTab="groups" />;
      case "organisations":return <NetworkHub navigate={navigate} initialTab="orgs" />;
      case "group-detail": return <GroupDetailScreen navigate={navigate} />;
      case "events":       return <EventsScreen navigate={navigate} />;
      case "event-detail": return <EventDetail navigate={navigate} />;
      case "messages":     return <MessagesScreen navigate={navigate} />;
      case "support":      return <SupportScreen />;
      case "donate":       return <DonateScreen />;
      case "privacy":      return <PrivacyScreen navigate={navigate} />;
      case "settings":     return <SettingsScreen navigate={navigate} />;
      case "notifications": return <NotificationsScreen navigate={navigate} />;
      default:             return <Dashboard navigate={navigate} onboarded={onboarded ?? true} setOnboarded={setOnboarded} />;
    }
  })();

  const adminContent = (() => {
    switch (screen) {
      case "admin-overview":       return <AdminOverview navigate={navigate} />;
      case "admin-members":        return <AdminMembers navigate={navigate} />;
      case "admin-groups":         return <ErrorBoundary><AdminGroups /></ErrorBoundary>;
      case "admin-support":        return <AdminSupport navigate={navigate} />;
      case "admin-support-detail": return <AdminSupportDetail navigate={navigate} />;
      case "admin-complaints":     return <ErrorBoundary><AdminComplaints navigate={navigate} /></ErrorBoundary>;
      case "admin-enquiries":      return <AdminEnquiries />;
      case "admin-events":         return <AdminEvents />;
      case "admin-content":
      case "admin-resources":
      case "admin-announcements":
      case "admin-affiliated":     return <AdminContent />;
      case "admin-donations":      return <AdminDonations />;
      case "admin-privacy":        return <AdminPrivacy navigate={navigate} />;
      default:                     return <AdminOverview />;
    }
  })();

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), theme }}>
      <div className="size-full min-h-screen relative" style={{ background: theme.bg }}>
        {isPublic && (
          <>
            {screen === "signup"  && <SignupScreen navigate={navigate} />}
            {screen === "signin"  && <SignInScreen navigate={navigate} />}
            {screen === "account" && <AccountScreen navigate={navigate} />}
            {screen === "creed"   && <CreedScreen navigate={navigate} />}
            {screen === "blocked" && <BlockedScreen navigate={navigate} />}
            {screen === "welcome" && <WelcomeScreen navigate={navigate} />}
            {screen === "deleted-account" && <DeletedAccountScreen navigate={navigate} />}
            {screen === "update-password" && <UpdatePasswordScreen navigate={navigate} />}
          </>
        )}

        {!isPublic && !isAdmin && (
          <MemberShell
            current={normalizeMember(screen)}
            navigate={navigate}
            fullWidth={screen === "messages"}
          >
            <ErrorBoundary>
              {memberContent}
            </ErrorBoundary>
          </MemberShell>
        )}

        {isAdmin && (
          <AdminShell
            current={screen}
            navigate={navigate}
            exitAdmin={() => navigate("dashboard")}
          >
            {adminContent}
          </AdminShell>
        )}
      </div>
    </ThemeContext.Provider>
  );
}


