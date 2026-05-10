import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { OnboardingFlow } from "./components/cip/OnboardingFlow";
import { Screen } from "./components/cip/types";
import { ThemeContext, getTheme, NAVY, GOLD } from "./components/cip/brand";
import { useAuth } from "./components/cip/AuthContext";
import {
  SignupScreen, SignInScreen, AccountScreen, CreedScreen, BlockedScreen, WelcomeScreen,
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

const PUBLIC_SCREENS: Screen[] = ["signup", "signin", "account", "creed", "blocked", "welcome"];
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
        setScreen("dashboard");
      } else if (!user && !PUBLIC_SCREENS.includes(screen)) {
        setScreen("signup");
      }
    }
  }, [user, loading]);

  if (loading || (user && onboarded === null)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && onboarded === false) {
    return (
      <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), theme }}>
        <OnboardingFlow user={user} onComplete={() => { setOnboarded(true); setScreen("dashboard"); }} />
      </ThemeContext.Provider>
    );
  }

  const isPublic = PUBLIC_SCREENS.includes(screen);
  const isAdmin = ADMIN_SCREENS.includes(screen);

  const memberContent = (() => {
    switch (screen) {
      case "dashboard":    return <Dashboard navigate={setScreen} />;
      case "profile":      return <ProfileScreen />;
      case "network":      return <NetworkScreen navigate={setScreen} />;
      case "groups":       return <GroupsScreen navigate={setScreen} />;
      case "group-detail": return <GroupDetailScreen navigate={setScreen} />;
      case "events":       return <EventsScreen navigate={setScreen} />;
      case "event-detail": return <EventDetail navigate={setScreen} />;
      case "messages":     return <MessagesScreen />;
      case "support":      return <SupportScreen />;
      case "donate":       return <DonateScreen />;
      case "privacy":      return <PrivacyScreen />;
      case "settings":     return <SettingsScreen />;
      default:             return <Dashboard navigate={setScreen} />;
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

        <PrototypeNav screen={screen} setScreen={setScreen} />
      </div>
    </ThemeContext.Provider>
  );
}

function PrototypeNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);
  const groups: { label: string; items: { k: Screen; l: string }[] }[] = [
    {
      label: "Public flow",
      items: [
        { k: "signup",  l: "1. Sign up" },
        { k: "account", l: "2. Account creation" },
        { k: "creed",   l: "3. Nicene Creed" },
        { k: "blocked", l: "3a. Blocked (cannot affirm)" },
        { k: "welcome", l: "4. Welcome" },
      ],
    },
    {
      label: "Member area",
      items: [
        { k: "dashboard",    l: "5. Home feed" },
        { k: "profile",      l: "6. Profile (editable)" },
        { k: "network",      l: "7. Network" },
        { k: "groups",       l: "8. Groups" },
        { k: "group-detail", l: "8a. Group detail" },
        { k: "events",       l: "9. Events" },
        { k: "event-detail", l: "9a. Event detail" },
        { k: "messages",     l: "10. Messages" },
        { k: "support",      l: "11. Support pathways" },
        { k: "donate",       l: "12. Donate" },
        { k: "settings",     l: "13. Settings" },
        { k: "privacy",      l: "13a. Privacy" },
      ],
    },
    {
      label: "Admin console",
      items: [
        { k: "admin-overview",       l: "Admin overview" },
        { k: "admin-members",        l: "Members" },
        { k: "admin-support",        l: "Requests queue" },
        { k: "admin-support-detail", l: "Request detail" },
        { k: "admin-events",         l: "Events" },
        { k: "admin-content",        l: "Content" },
        { k: "admin-privacy",        l: "Data & Privacy" },
        { k: "admin-donations",      l: "Donations" },
      ],
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          className="mb-2 w-72 max-h-[72vh] overflow-y-auto rounded-2xl shadow-2xl"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}
        >
          <div
            className="px-4 py-3 text-xs rounded-t-2xl"
            style={{ background: NAVY, color: "#fff" }}
          >
            🗺 Prototype navigator — jump to any screen
          </div>
          <div className="p-2">
            {groups.map((g) => (
              <div key={g.label} className="mb-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400">{g.label}</div>
                {g.items.map((it) => (
                  <button
                    key={it.k}
                    onClick={() => { setScreen(it.k); setOpen(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                    style={{
                      color: screen === it.k ? GOLD : "#374151",
                      fontWeight: screen === it.k ? 600 : 400,
                    }}
                  >
                    {it.l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2.5 rounded-full shadow-lg text-sm"
        style={{ background: NAVY, color: "#fff", fontWeight: 500 }}
      >
        {open ? "✕ Close" : "🗺 Screens"}
      </button>
    </div>
  );
}
