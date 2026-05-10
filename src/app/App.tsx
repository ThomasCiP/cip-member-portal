import { useState, useEffect } from "react";
import { Screen } from "./components/cip/types";
import { useAuth } from "./components/cip/AuthContext";
import {
  SignupScreen, AccountScreen, CreedScreen, BlockedScreen, WelcomeScreen,
} from "./components/cip/PublicScreens";
import { MemberShell } from "./components/cip/MemberShell";
import {
  Dashboard, ProfileScreen, PathwaysScreen, GuidanceScreen,
  SupportScreen, SupportConfirm, EventsScreen, EventDetail, EventConfirm,
  ResourcesScreen, AffiliatedScreen, AnnouncementsScreen, DonateScreen, PrivacyScreen,
} from "./components/cip/MemberScreens";
import {
  AdminShell, AdminOverview, AdminMembers, AdminSupport, AdminSupportDetail,
  AdminEvents, AdminResources, AdminAnnouncements, AdminAffiliated,
  AdminDonations, AdminPrivacy,
} from "./components/cip/AdminScreens";
import { NAVY, GOLD } from "./components/cip/brand";

const PUBLIC_SCREENS: Screen[] = ["signup", "account", "creed", "blocked", "welcome"];
const ADMIN_SCREENS: Screen[] = [
  "admin-overview", "admin-members", "admin-support", "admin-support-detail",
  "admin-events", "admin-resources", "admin-announcements", "admin-affiliated",
  "admin-donations", "admin-privacy",
];

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>("signup");

  useEffect(() => {
    if (!loading) {
      if (user && PUBLIC_SCREENS.includes(screen)) {
        setScreen("dashboard");
      } else if (!user && !PUBLIC_SCREENS.includes(screen)) {
        setScreen("signup");
      }
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isPublic = PUBLIC_SCREENS.includes(screen);
  const isAdmin = ADMIN_SCREENS.includes(screen);

  const memberContent = (() => {
    switch (screen) {
      case "dashboard": return <Dashboard navigate={setScreen} />;
      case "profile": return <ProfileScreen />;
      case "pathways": return <PathwaysScreen navigate={setScreen} />;
      case "guidance": return <GuidanceScreen navigate={setScreen} />;
      case "support": return <SupportScreen navigate={setScreen} />;
      case "support-confirm": return <SupportConfirm navigate={setScreen} />;
      case "events": return <EventsScreen navigate={setScreen} />;
      case "event-detail": return <EventDetail navigate={setScreen} />;
      case "event-confirm": return <EventConfirm navigate={setScreen} />;
      case "resources": return <ResourcesScreen />;
      case "affiliated": return <AffiliatedScreen />;
      case "announcements": return <AnnouncementsScreen />;
      case "donate": return <DonateScreen />;
      case "privacy": return <PrivacyScreen />;
      default: return <Dashboard navigate={setScreen} />;
    }
  })();

  const adminContent = (() => {
    switch (screen) {
      case "admin-overview": return <AdminOverview />;
      case "admin-members": return <AdminMembers />;
      case "admin-support": return <AdminSupport navigate={setScreen} />;
      case "admin-support-detail": return <AdminSupportDetail navigate={setScreen} />;
      case "admin-events": return <AdminEvents />;
      case "admin-resources": return <AdminResources />;
      case "admin-announcements": return <AdminAnnouncements />;
      case "admin-affiliated": return <AdminAffiliated />;
      case "admin-donations": return <AdminDonations />;
      case "admin-privacy": return <AdminPrivacy />;
      default: return <AdminOverview />;
    }
  })();

  return (
    <div className="size-full min-h-screen relative">
      {isPublic && (
        <>
          {screen === "signup" && <SignupScreen navigate={setScreen} />}
          {screen === "account" && <AccountScreen navigate={setScreen} />}
          {screen === "creed" && <CreedScreen navigate={setScreen} />}
          {screen === "blocked" && <BlockedScreen navigate={setScreen} />}
          {screen === "welcome" && <WelcomeScreen navigate={setScreen} />}
        </>
      )}

      {!isPublic && !isAdmin && (
        <MemberShell current={normalizeMember(screen)} navigate={setScreen}>
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

      {/* Prototype quick-jump (bottom right) */}
      <PrototypeNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

function normalizeMember(s: Screen): Screen {
  // map sub-screens (event-detail, event-confirm, support-confirm) to a sidebar item
  if (s === "event-detail" || s === "event-confirm") return "events";
  if (s === "support-confirm") return "support";
  return s;
}

function PrototypeNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);
  const groups: { label: string; items: { k: Screen; l: string }[] }[] = [
    {
      label: "Public",
      items: [
        { k: "signup", l: "1. Sign up" },
        { k: "account", l: "2. Account creation" },
        { k: "creed", l: "3. Nicene Creed" },
        { k: "blocked", l: "3a. Blocked" },
        { k: "welcome", l: "4. Welcome" },
      ],
    },
    {
      label: "Member",
      items: [
        { k: "dashboard", l: "5. Dashboard" },
        { k: "profile", l: "6. Profile" },
        { k: "pathways", l: "7. Pathways" },
        { k: "guidance", l: "8. Party guidance" },
        { k: "support", l: "9. Support request" },
        { k: "events", l: "10. Events" },
        { k: "affiliated", l: "11. Affiliated groups" },
        { k: "resources", l: "12. Resources" },
        { k: "announcements", l: "13. Announcements" },
        { k: "donate", l: "14. Donate" },
        { k: "privacy", l: "15. Privacy" },
      ],
    },
    {
      label: "Admin",
      items: [
        { k: "admin-overview", l: "16. Admin overview" },
        { k: "admin-members", l: "Members" },
        { k: "admin-support", l: "Support queue" },
        { k: "admin-support-detail", l: "Support detail" },
        { k: "admin-events", l: "Events" },
        { k: "admin-resources", l: "Resources" },
        { k: "admin-announcements", l: "Announcements" },
        { k: "admin-affiliated", l: "Affiliated groups" },
        { k: "admin-donations", l: "Donations" },
        { k: "admin-privacy", l: "Privacy / data" },
      ],
    },
  ];
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          className="mb-2 w-72 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl"
          style={{ background: "#fff", border: "1px solid #e7e2d6" }}
        >
          <div
            className="px-4 py-3 text-xs"
            style={{ background: NAVY, color: "#fff", borderRadius: "0.75rem 0.75rem 0 0" }}
          >
            Prototype navigator — jump to any screen
          </div>
          <div className="p-2">
            {groups.map((g) => (
              <div key={g.label} className="mb-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">{g.label}</div>
                {g.items.map((it) => (
                  <button
                    key={it.k}
                    onClick={() => { setScreen(it.k); setOpen(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-gray-100"
                    style={{ color: screen === it.k ? GOLD : NAVY, fontWeight: screen === it.k ? 600 : 400 }}
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
        {open ? "Close" : "🗺  Screens"}
      </button>
    </div>
  );
}
