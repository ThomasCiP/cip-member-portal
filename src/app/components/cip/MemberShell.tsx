import { ReactNode, useState } from "react";
import {
  Home, UserCircle2, Users, CalendarDays, MessageSquare, Settings,
  ShieldCheck, Bell, ChevronDown, Search, X, ExternalLink, Heart, Lock,
  Network, LifeBuoy, LogOut,
} from "lucide-react";
import { CiPLogo, NAVY, GOLD, useTheme } from "./brand";
import { Screen } from "./types";

const TOP_NAV: { key: Screen; label: string; icon: any }[] = [
  { key: "dashboard", label: "Home",     icon: Home },
  { key: "network",   label: "Network",  icon: Network },
  { key: "groups",    label: "Groups",   icon: Users },
  { key: "events",    label: "Events",   icon: CalendarDays },
  { key: "messages",  label: "Messages", icon: MessageSquare },
  { key: "support",   label: "Support",  icon: LifeBuoy },
];

// ── Demo data ─────────────────────────────────────────────────────────
export const JOINED_GROUPS = [
  { id: "nsw-pp",    name: "NSW Politics & Prayer",     members: 142, visibility: "anonymous" as const },
  { id: "syd-civic", name: "Sydney Civic Faith Circle", members:  87, visibility: "visible"   as const },
  { id: "young-cip", name: "Young CiP",                 members: 213, visibility: "anonymous" as const },
];

export const SUGGESTED_GROUPS = [
  { id: "vic-pp",   name: "VIC Politics & Prayer",        members: 96  },
  { id: "rural-cf", name: "Rural Christians in Politics", members: 54  },
  { id: "qld-pp",   name: "QLD Politics & Prayer",        members: 118 },
];

export const UPCOMING_EVENTS = [
  { id: "e1", title: "National Prayer Breakfast", date: "Tue 19 May",  loc: "Canberra"   },
  { id: "e2", title: "NSW Members Briefing",      date: "Thu 28 May",  loc: "Online"     },
  { id: "e3", title: "Faith & Public Life Forum", date: "Sat 6 Jun",   loc: "Sydney"     },
];

function DonateModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl mx-4"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: GOLD }}
          >
            <Heart size={18} style={{ color: NAVY }} />
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <h2 style={{ color: NAVY }}>Help grow the movement</h2>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
          Your support helps CiP equip Christians to participate faithfully in politics and public life across Australia.
        </p>
        <button
          className="w-full mt-5 px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2"
          style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
        >
          Continue to donation page <ExternalLink size={14} />
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 px-5 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Reusable rail blocks ────────────────────────────────────────────────
export function RailCard({
  title, children, action,
}: {
  title?: string; children: ReactNode; action?: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <div
      className="rounded-2xl"
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      {title && (
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${theme.divider}` }}
        >
          <div className="text-xs uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>
            {title}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ProfileSummaryCard({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="h-16" style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a6b)` }} />
      <div className="px-4 pb-4 -mt-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white"
          style={{ background: NAVY, border: `3px solid ${theme.cardBg}`, fontWeight: 600 }}
        >
          SR
        </div>
        <div className="mt-2" style={{ color: theme.text, fontWeight: 600 }}>Sarah Reed</div>
        <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
          Policy Adviser · NSW · Anglican
        </div>
        <div
          className="mt-3 pt-3 text-xs flex items-center gap-1.5"
          style={{ borderTop: `1px solid ${theme.divider}`, color: theme.textMuted }}
        >
          <Lock size={11} /> Privacy-first profile
        </div>
        <button
          onClick={() => navigate("profile")}
          className="mt-3 w-full text-xs py-1.5 rounded-lg"
          style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
        >
          View profile
        </button>
      </div>
    </div>
  );
}

export function JoinedGroupsCard({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <RailCard
      title="Your groups"
      action={
        <button
          onClick={() => navigate("groups")}
          className="text-xs"
          style={{ color: GOLD, fontWeight: 600 }}
        >
          See all
        </button>
      }
    >
      <div className="space-y-2.5">
        {JOINED_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate("group-detail")}
            className="w-full flex items-center gap-2.5 text-left rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs"
              style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
            >
              {g.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs truncate" style={{ color: theme.text, fontWeight: 500 }}>
                {g.name}
              </div>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                {g.visibility === "anonymous" ? (<><Lock size={9} /> Watching anonymously</>) : (<>Visible</>)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </RailCard>
  );
}

export function UpcomingEventsRail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <RailCard
      title="Upcoming events"
      action={
        <button onClick={() => navigate("events")} className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>
          All events
        </button>
      }
    >
      <div className="space-y-3">
        {UPCOMING_EVENTS.map((e) => (
          <button key={e.id} onClick={() => navigate("event-detail")} className="w-full text-left">
            <div className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>{e.date}</div>
            <div className="text-sm mt-0.5" style={{ color: theme.text, fontWeight: 500 }}>{e.title}</div>
            <div className="text-xs" style={{ color: theme.textMuted }}>{e.loc}</div>
          </button>
        ))}
      </div>
    </RailCard>
  );
}

export function SuggestedGroupsRail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <RailCard title="Suggested groups">
      <div className="space-y-3">
        {SUGGESTED_GROUPS.map((g) => (
          <div key={g.id} className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs"
              style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
            >
              {g.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs truncate" style={{ color: theme.text, fontWeight: 500 }}>{g.name}</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>{g.members} members</div>
            </div>
            <button
              onClick={() => navigate("group-detail")}
              className="text-[10px] px-2 py-1 rounded-md"
              style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

export function SupportStatusRail({ navigate }: { navigate?: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <RailCard
      title="Your support requests"
      action={
        navigate && (
          <button onClick={() => navigate("support")} className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>
            Manage
          </button>
        )
      }
    >
      <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>
        Connect to a local branch
      </div>
      <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
        In review · CiP team responded yesterday
      </div>
      <div
        className="mt-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
        style={{ background: "#fef3c7", color: "#92400e", fontWeight: 500 }}
      >
        Awaiting your reply
      </div>
    </RailCard>
  );
}

export function DonateRail({ onDonate }: { onDonate: () => void }) {
  const { theme } = useTheme();
  return (
    <div className="rounded-2xl p-5" style={{ background: NAVY, color: "#fff" }}>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
        style={{ background: GOLD }}
      >
        <Heart size={16} style={{ color: NAVY }} />
      </div>
      <div style={{ fontWeight: 600 }}>Support CiP</div>
      <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
        Help equip Christians for faithful public life.
      </div>
      <button
        onClick={onDonate}
        className="mt-3 w-full py-2 rounded-lg text-sm"
        style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
      >
        Donate
      </button>
      <div className="hidden" style={{ color: theme.text }} />
    </div>
  );
}

// ── Top header ────────────────────────────────────────────────────────
function TopHeader({
  current, navigate, onDonate,
}: { current: Screen; navigate: (s: Screen) => void; onDonate: () => void }) {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header
      className="h-16 px-6 flex items-center gap-4 shrink-0 sticky top-0 z-30"
      style={{ background: NAVY, borderBottom: `1px solid rgba(255,255,255,0.08)` }}
    >
      <div className="shrink-0">
        <CiPLogo light size={28} />
      </div>

      <div className="hidden md:block flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.55)" }} />
        <input
          placeholder="Search groups, events, people…"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: `1px solid rgba(255,255,255,0.12)`,
          }}
        />
      </div>

      <nav className="flex items-center gap-1 ml-auto md:ml-0">
        {TOP_NAV.map((it) => {
          const Icon = it.icon;
          const active = current === it.key;
          return (
            <button
              key={it.key}
              onClick={() => navigate(it.key)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded-md transition-colors min-w-[64px]"
              style={{
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                fontWeight: active ? 600 : 400,
                background: active ? "rgba(201,162,39,0.15)" : "transparent",
                borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
              }}
            >
              <Icon size={16} />
              <span className="text-[10px] mt-0.5">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={16} style={{ color: "rgba(255,255,255,0.75)" }} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: GOLD }}
          />
        </button>
        <button
          onClick={onDonate}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
        >
          Donate
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{ background: GOLD, color: NAVY, fontWeight: 700 }}
            >
              SR
            </div>
            <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-40"
              style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Sarah Reed</div>
                <div className="text-[11px]" style={{ color: theme.textMuted }}>Policy Adviser · NSW</div>
              </div>
              {[
                { l: "Profile",   k: "profile" as Screen,         icon: UserCircle2 },
                { l: "Settings",  k: "settings" as Screen,        icon: Settings },
                { l: "Privacy",   k: "privacy" as Screen,         icon: Lock },
                { l: "Admin",     k: "admin-overview" as Screen,  icon: ShieldCheck },
              ].map((it) => {
                const I = it.icon;
                return (
                  <button
                    key={it.l}
                    onClick={() => { setMenuOpen(false); navigate(it.k); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50"
                    style={{ color: theme.text }}
                  >
                    <I size={13} style={{ color: theme.textMuted }} />
                    {it.l}
                  </button>
                );
              })}
              <button
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50"
                style={{ color: theme.text, borderTop: `1px solid ${theme.divider}` }}
              >
                <LogOut size={13} style={{ color: theme.textMuted }} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Main shell ───────────────────────────────────────────────────────────
export function MemberShell({
  current,
  navigate,
  children,
  rightRail,
  leftRail,
  fullWidth = false,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  children: ReactNode;
  rightRail?: ReactNode;
  leftRail?: ReactNode;
  fullWidth?: boolean;
}) {
  const { theme } = useTheme();
  const [donateOpen, setDonateOpen] = useState(false);

  const defaultLeft = (
    <div className="space-y-4">
      <ProfileSummaryCard navigate={navigate} />
      <JoinedGroupsCard navigate={navigate} />
    </div>
  );
  const defaultRight = (
    <div className="space-y-4">
      <UpcomingEventsRail navigate={navigate} />
      <SuggestedGroupsRail navigate={navigate} />
      <SupportStatusRail navigate={navigate} />
      <DonateRail onDonate={() => setDonateOpen(true)} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: theme.bg }}>
      <TopHeader current={current} navigate={navigate} onDonate={() => setDonateOpen(true)} />

      <main className="flex-1 overflow-hidden">
        {fullWidth ? (
          <div className="h-full">{children}</div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div
              className="max-w-[1400px] mx-auto p-6 grid gap-6"
              style={{ gridTemplateColumns: "260px minmax(0,1fr) 300px" }}
            >
              <div className="hidden lg:block">{leftRail ?? defaultLeft}</div>
              <div className="min-w-0">{children}</div>
              <div className="hidden lg:block">{rightRail ?? defaultRight}</div>
            </div>
          </div>
        )}
      </main>

      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
