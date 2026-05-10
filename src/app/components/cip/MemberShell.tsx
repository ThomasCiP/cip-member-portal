import { ReactNode } from "react";
import {
  LayoutDashboard,
  UserCircle2,
  Compass,
  Vote,
  LifeBuoy,
  CalendarDays,
  BookOpen,
  Building2,
  Megaphone,
  Heart,
  Lock,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { CiPLogo, NAVY, GOLD, WARM } from "./brand";
import { Screen } from "./types";

const ITEMS: { key: Screen; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: UserCircle2 },
  { key: "pathways", label: "Political Pathways", icon: Compass },
  { key: "guidance", label: "Party Guidance", icon: Vote },
  { key: "support", label: "Support Requests", icon: LifeBuoy },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "resources", label: "Resources", icon: BookOpen },
  { key: "affiliated", label: "Affiliated Groups", icon: Building2 },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "donate", label: "Donate", icon: Heart },
  { key: "privacy", label: "Privacy & Settings", icon: Lock },
];

export function MemberShell({
  current,
  navigate,
  children,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full" style={{ background: WARM }}>
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 flex flex-col"
        style={{ background: NAVY, color: "#fff" }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <CiPLogo light />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = current === it.key;
            return (
              <button
                key={it.key}
                onClick={() => navigate(it.key)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left"
                style={{
                  background: active ? "rgba(201,162,39,0.12)" : "transparent",
                  borderLeft: active ? `3px solid ${GOLD}` : "3px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.78)",
                }}
              >
                <Icon size={16} />
                <span>{it.label}</span>
              </button>
            );
          })}
        </nav>
        <div
          className="px-5 py-4 text-xs"
          style={{ color: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          Christian first. Politics second.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 px-6 flex items-center gap-4 border-b shrink-0"
          style={{ background: "#fff", borderColor: "#e7e2d6" }}
        >
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search resources, events, announcements…"
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none"
              style={{ background: "#f4f1ea" }}
            />
          </div>
          <button
            onClick={() => navigate("donate")}
            className="px-4 py-2 rounded-md text-sm"
            style={{ background: GOLD, color: NAVY, fontWeight: 500 }}
          >
            Donate
          </button>
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell size={18} style={{ color: NAVY }} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: GOLD }}
            />
          </button>
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-gray-100">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: NAVY, color: "#fff" }}
            >
              SR
            </div>
            <ChevronDown size={14} style={{ color: NAVY }} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
