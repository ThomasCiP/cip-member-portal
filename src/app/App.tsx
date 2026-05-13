import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import { Screen } from "./components/cip/types";
import { ThemeContext, getTheme, NAVY, GOLD } from "./components/cip/brand";
import { useAuth } from "./components/cip/AuthContext";
import {
  SignupScreen, SignInScreen, AccountScreen, CreedScreen, BlockedScreen, WelcomeScreen, DeletedAccountScreen
} from "./components/cip/PublicScreens";
import { MemberShell } from "./components/cip/MemberShell";
import {
  Dashboard, ProfileScreen, NetworkScreen, GroupsScreen, GroupDetailScreen,
  EventsScreen, EventDetail, MessagesScreen, SupportScreen,
  DonateScreen, SettingsScreen, PrivacyScreen,
} from "./components/cip/MemberScreens";
import {
  AdminShell, AdminOverview, AdminMembers, AdminSupport, AdminSupportDetail,
  AdminEvents, AdminContent, AdminDonations, AdminPrivacy,
} from "./components/cip/AdminScreens";

const PUBLIC_SCREENS: Screen[] = ["signup", "signin", "account", "creed", "blocked", "welcome", "deleted-account"];
const ADMIN_SCREENS: Screen[] = [
  "admin-overview", "admin-members", "admin-support", "admin-support-detail",
  "admin-events", "admin-content", "admin-resources", "admin-announcements",
  "admin-affiliated", "admin-donations", "admin-privacy",
];

function normalizeMember(s: Screen): Screen {
  if (s === "event-detail") return "events";
  if (s === "group-detail") return "groups";
  if (s === "privacy") return "settings";
  if (s === "donate") return "dashboard";
  return s;
}

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>("signup");
  const [dark, setDark] = useState(false);
  const theme = getTheme(dark);

  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkProfile() {
      if (user) {
        const { data } = await supabase.from("profiles").select("onboarded").eq("id", user.id).single();
        if (data) {
           setOnboarded(data.onboarded);
        } else {
           setOnboarded(false); // Default to false if profile doesn't have it yet
        }
      }
    }
    if (user && !loading) {
       checkProfile();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading) {
      if (user && PUBLIC_SCREENS.includes(screen)) {
        if (screen !== "deleted-account") {
          setScreen("dashboard");
        }
      } else if (!user && !PUBLIC_SCREENS.includes(screen)) {
        setScreen("signup");
      }
    }
  }, [user, loading, screen]);

  if (loading || (user && onboarded === null)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }



  const isPublic = PUBLIC_SCREENS.includes(screen);
  const isAdmin = ADMIN_SCREENS.includes(screen) && user?.email?.endsWith("@christiansinpolitics.com");

  const memberContent = (() => {
    switch (screen) {
      case "dashboard":    return <Dashboard navigate={setScreen} onboarded={onboarded ?? true} setOnboarded={setOnboarded} />;
      case "profile":      return <ProfileScreen />;
      case "network":      return <NetworkScreen navigate={setScreen} />;
      case "groups":       return <GroupsScreen navigate={setScreen} />;
      case "group-detail": return <GroupDetailScreen navigate={setScreen} />;
      case "events":       return <EventsScreen navigate={setScreen} />;
      case "event-detail": return <EventDetail navigate={setScreen} />;
      case "messages":     return <MessagesScreen />;
      case "support":      return <SupportScreen />;
      case "donate":       return <DonateScreen />;
      case "privacy":      return <PrivacyScreen navigate={setScreen} />;
      case "settings":     return <SettingsScreen navigate={setScreen} />;
      default:             return <Dashboard navigate={setScreen} onboarded={onboarded ?? true} setOnboarded={setOnboarded} />;
    }
  })();

  const adminContent = (() => {
    switch (screen) {
      case "admin-overview":       return <AdminOverview />;
      case "admin-members":        return <AdminMembers />;
      case "admin-support":        return <AdminSupport navigate={setScreen} />;
      case "admin-support-detail": return <AdminSupportDetail navigate={setScreen} />;
      case "admin-events":         return <AdminEvents />;
      case "admin-content":
      case "admin-resources":
      case "admin-announcements":
      case "admin-affiliated":     return <AdminContent />;
      case "admin-donations":      return <AdminDonations />;
      case "admin-privacy":        return <AdminPrivacy />;
      default:                     return <AdminOverview />;
    }
  })();

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), theme }}>
      <div className="size-full min-h-screen relative" style={{ background: theme.bg }}>
        {isPublic && (
          <>
            {screen === "signup"  && <SignupScreen navigate={setScreen} />}
            {screen === "signin"  && <SignInScreen navigate={setScreen} />}
            {screen === "account" && <AccountScreen navigate={setScreen} />}
            {screen === "creed"   && <CreedScreen navigate={setScreen} />}
            {screen === "blocked" && <BlockedScreen navigate={setScreen} />}
            {screen === "welcome" && <WelcomeScreen navigate={setScreen} />}
            {screen === "deleted-account" && <DeletedAccountScreen navigate={setScreen} />}
          </>
        )}

        {!isPublic && !isAdmin && (
          <MemberShell
            current={normalizeMember(screen)}
            navigate={setScreen}
            fullWidth={screen === "messages"}
          >
            {memberContent}
          </MemberShell>
        )}

        {isAdmin && (
          <AdminShell
            current={screen}
            navigate={setScreen}
            exitAdmin={() => setScreen("dashboard")}
          >
            {adminContent}
          </AdminShell>
        )}
      </div>
    </ThemeContext.Provider>
  );
}


