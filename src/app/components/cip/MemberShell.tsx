import { ReactNode, useState, useEffect, useRef } from "react";
import {
  Home, UserCircle2, CalendarDays, MessageSquare, Settings,
  ShieldCheck, Bell, ChevronDown, Search, X, ExternalLink, Heart, Lock,
  Network, Activity, LogOut, ArrowUpRight, Plus, LifeBuoy
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "./AuthContext";
import { CiPLogo, NAVY, GOLD, useTheme } from "./brand";
import { Screen } from "./types";
import { usePullToRefresh } from "../../../lib/usePullToRefresh";
import { SUPPORT_PATHWAYS, NewSupportRequestModal, useIncomingRequests, useNotificationBadges, ComposeOverlay } from "./MemberScreens";

const TOP_NAV: { key: Screen; label: string; icon: any }[] = [
  { key: "dashboard", label: "Home",     icon: Home },
  { key: "network",   label: "Network",  icon: Network },
  { key: "events",    label: "Events",   icon: CalendarDays },
  { key: "messages",  label: "Messages", icon: MessageSquare },
];

// ── Dynamic Data Rails ────────────────────────────────────────────────

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
        {/* Secure online giving isn't live yet — don't imply a working payment flow. */}
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          We're still setting up secure online donations. Please get in touch and we'll help you
          give directly in the meantime.
        </p>
        <button
          disabled
          className="w-full mt-4 px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          style={{ background: "#f1f5f9", color: "#64748b", fontWeight: 600 }}
        >
          Coming soon
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 px-5 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700"
        >
          Close
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

export function ProfileSummaryCard({ navigate, profile }: { navigate: (s: Screen) => void; profile: any }) {
  const { theme } = useTheme();
  
  const firstName = profile?.first_name || "Member";
  const lastName = profile?.last_name || "";
  const initials = (firstName[0] || "") + (lastName ? (lastName[0] || "") : "");
  const fullName = `${firstName} ${lastName}`.trim();
  const subtitle = [profile?.job_title, profile?.state, profile?.tradition].filter(Boolean).join(" · ") || "Welcome to the Network";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="h-16" style={{ background: "#f1f5f9" }} />
      <div className="px-4 pb-4 -mt-8">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={fullName} className="w-16 h-16 rounded-full object-cover" style={{ border: `3px solid ${theme.cardBg}` }} />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white"
            style={{ background: NAVY, border: `3px solid ${theme.cardBg}`, fontWeight: 600 }}
          >
            {initials}
          </div>
        )}
        <div className="mt-2" style={{ color: theme.text, fontWeight: 600 }}>{fullName}</div>
        <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
          {subtitle}
        </div>
        <div
          className="mt-3 pt-3 text-xs flex items-center gap-1.5"
          style={{ borderTop: `1px solid ${theme.divider}`, color: theme.textMuted }}
        >
          <Lock size={11} /> You control what you share
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
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('group_members').select('..., groups(*)').eq('user_id', user.id).then(({ data }) => {
      if (data) setGroups(data.map((d: any) => d.groups).filter((g: any) => g && g.group_type !== 'organisation'));
    });
  }, [user]);

  return (
    <RailCard
      title="Your groups"
      action={<button onClick={() => navigate("groups")} className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>See all</button>}
    >
      {groups.length === 0 ? (
        <div className="text-sm py-4 text-center" style={{ color: theme.textMuted }}>You haven't joined any groups yet.</div>
      ) : (
        <div className="space-y-2.5">
          {groups.map((g: any) => (
            <button
              key={g.id}
              onClick={() => {
                localStorage.setItem('activeGroupId', g.id);
                localStorage.setItem('isOrgDetail', 'false');
                navigate("group-detail");
              }}
              className="w-full flex items-center gap-2.5 text-left rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs"
                style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
              >
                {g.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs truncate" style={{ color: theme.text, fontWeight: 500 }}>{g.name}</div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                  {g.visibility === "private" ? (<><Lock size={9} /> Private</>) : (<>Visible</>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </RailCard>
  );
}

export function UpcomingEventsRail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Graceful fail if events table doesn't exist yet. Only public events here.
    supabase.from('events').select('*').eq('visibility', 'public').limit(3).then(({ data, error }) => {
      if (data && !error) setEvents(data);
    });
  }, []);

  return (
    <RailCard
      title="Upcoming events"
      action={<button onClick={() => navigate("events")} className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>All events</button>}
    >
      {events.length === 0 ? (
        <div className="text-sm py-4 text-center" style={{ color: theme.textMuted }}>No upcoming events scheduled.</div>
      ) : (
        <div className="space-y-3">
          {events.map((e: any) => (
            <button key={e.id} onClick={() => navigate("event-detail")} className="w-full text-left">
              <div className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>{new Date(e.date).toLocaleDateString()}</div>
              <div className="text-sm mt-0.5" style={{ color: theme.text, fontWeight: 500 }}>{e.title}</div>
              <div className="text-xs" style={{ color: theme.textMuted }}>{e.location || "Online"}</div>
            </button>
          ))}
        </div>
      )}
    </RailCard>
  );
}

// Mirrors the "Get Involved" tab: quick shortcuts to the core support
// pathways. Clicking one opens the same request form used on that page.
export function GetStartedRail({ navigate }: { navigate?: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [activePathway, setActivePathway] = useState<any>(null);

  return (
    <>
      <RailCard
        title="Get started"
        action={navigate && <button onClick={() => navigate("support")} className="text-xs" style={{ color: GOLD, fontWeight: 600 }}>See all</button>}
      >
        <div className="space-y-1">
          {SUPPORT_PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePathway(p)}
                className="w-full flex items-center gap-2.5 text-left rounded-lg px-2 py-2 hover:bg-black/5 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: theme.pillBg, color: NAVY }}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs" style={{ color: theme.text, fontWeight: 500 }}>{p.title}</div>
                </div>
                <ArrowUpRight size={13} style={{ color: theme.textMuted }} />
              </button>
            );
          })}
        </div>
      </RailCard>
      {activePathway && (
        <NewSupportRequestModal pathway={activePathway} onClose={() => setActivePathway(null)} />
      )}
    </>
  );
}

export function SupportStatusRail({ navigate }: { navigate?: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const loadRequests = () => {
    if (!user) return;
    supabase.from('support_requests').select('*').eq('user_id', user.id).then(({ data, error }) => {
      if (data && !error) setRequests(data);
    });
  };

  useEffect(() => { loadRequests(); }, [user]);

  return (
    <>
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
        {requests.length === 0 ? (
          <div className="text-sm py-3 text-center" style={{ color: theme.textMuted }}>No active support requests.</div>
        ) : (
          <div className="mb-3">
            {requests.map((req: any) => (
              <div key={req.id} className="mb-3 last:mb-0">
                <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{req.request_type || req.title || "Support Request"}</div>
                <div className="text-xs mt-1" style={{ color: theme.textMuted }}>Status: {req.status}</div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setCreating(true)}
          className="w-full py-2 rounded-lg text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
          style={{ border: `1px dashed ${theme.cardBorder}`, color: theme.text }}
        >
          <Plus size={13} /> Create a request
        </button>
      </RailCard>
      {creating && (
        <NewSupportRequestModal pathway={null} onClose={(refresh) => { setCreating(false); if (refresh) loadRequests(); }} />
      )}
    </>
  );
}

export function DonateRail({ onDonate }: { onDonate: () => void }) {
  const { theme } = useTheme();
  return (
    <div className="rounded-2xl p-5" style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
        style={{ background: GOLD }}
      >
        <Heart size={16} style={{ color: NAVY }} />
      </div>
      <div style={{ fontWeight: 600 }}>Get Involved</div>
      <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
        Help equip Christians for faithful public life.
      </div>
      <button
        onClick={onDonate}
        className="mt-3 w-full py-2 rounded-lg text-sm"
        style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
      >
        Donate
      </button>
      <div className="hidden" style={{ color: theme.text }} />
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────
export function NotificationBell({ navigate }: { navigate?: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      // Announcements now arrive as real notification rows (fanned out on publish),
      // so a single notifications query is the whole feed.
      const { data } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(data || []);
    }
    loadNotifications();

    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (n: any) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    if (!n.isAnnouncement) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id);
    }
    // Connection requests are actioned in Network → My network (Accept/Decline live there).
    if (n.type === 'connection_invite' && navigate) {
      localStorage.setItem('activeNetworkTab', 'network');
      setOpen(false);
      navigate('network');
    } else if ((n.type === 'mention' || n.type === 'group_mention') && navigate) {
      const d = n.data || {};
      setOpen(false);
      if (d.post_type === 'group' && d.group_id) {
        localStorage.setItem('activeGroupId', d.group_id);
        localStorage.removeItem('isOrgDetail');
        navigate('group-detail');
      } else navigate('dashboard');
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell size={16} strokeWidth={2.5} style={{ color: NAVY }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#ef4444" }}
          />
        )}
      </button>

      {open && (
        <div 
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="p-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            <h3 className="text-sm" style={{ fontWeight: 600, color: theme.text }}>Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 cursor-pointer hover:bg-black/5 transition-colors"
                  style={{ background: n.read ? theme.bg : theme.cardBg, borderBottom: `1px solid ${theme.divider}` }}
                >
                  <div className="flex gap-2">
                    <div className="mt-0.5">
                      {n.read ? null : <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "#ef4444" }} />}
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: theme.text, fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{n.message}</div>
                      <div className="text-[10px] mt-1" style={{ color: theme.textSubtle }}>{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm" style={{ color: theme.textMuted }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile dropdown menu (avatar) ─────────────────────────────────────────
// Extracted so it can render top-left on mobile and top-right on desktop
// without duplicating the menu logic.
function ProfileMenu({
  navigate, profile, onDonate, align = "right",
}: { navigate: (s: Screen) => void; profile: any; onDonate: () => void; align?: "left" | "right" }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu when clicking outside it (mirrors NotificationBell).
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = profile?.first_name || "Member";
  const lastName = profile?.last_name || "";
  const initials = (firstName[0] || "") + (lastName ? (lastName[0] || "") : "");
  const fullName = `${firstName} ${lastName}`.trim();
  const subtitle = [profile?.job_title, profile?.state].filter(Boolean).join(" · ") || "Member";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={initials} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
            style={{ background: GOLD, color: "#fff", fontWeight: 700 }}
          >
            {initials}
          </div>
        )}
        <ChevronDown size={12} strokeWidth={2.5} style={{ color: NAVY }} />
      </button>
      {menuOpen && (
        <div
          className={`absolute ${align === "left" ? "left-0" : "right-0"} top-12 w-56 max-w-[calc(100vw-1rem)] rounded-xl shadow-xl overflow-hidden z-40`}
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{fullName}</div>
            <div className="text-[11px]" style={{ color: theme.textMuted }}>{subtitle}</div>
          </div>
          {[
            { l: "Profile",   k: "profile" as Screen,         icon: UserCircle2 },
            { l: "Settings",  k: "settings" as Screen,        icon: Settings },
            { l: "Notifications", k: "notifications" as Screen, icon: Bell },
            { l: "Your support requests", k: "support" as Screen, icon: LifeBuoy },
            { l: "Privacy",   k: "privacy" as Screen,         icon: Lock },
            ...(profile?.is_admin === true ? [{ l: "Admin", k: "admin-overview" as Screen, icon: ShieldCheck, desktopOnly: true }] : []),
          ].map((it: any) => {
            const I = it.icon;
            return (
              <button
                key={it.l}
                onClick={() => { setMenuOpen(false); navigate(it.k); }}
                className={`w-full items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50 ${it.desktopOnly ? "hidden lg:flex" : "flex"}`}
                style={{ color: theme.text }}
              >
                <I size={13} style={{ color: theme.textMuted }} />
                {it.l}
              </button>
            );
          })}
          {/* Donate — mobile only (desktop keeps the standalone header Donate button). */}
          <button
            onClick={() => { setMenuOpen(false); onDonate(); }}
            className="w-full md:hidden flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50"
            style={{ color: theme.text }}
          >
            <Heart size={13} style={{ color: theme.textMuted }} />
            Donate
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50"
            style={{ color: theme.text, borderTop: `1px solid ${theme.divider}` }}
          >
            <LogOut size={13} style={{ color: theme.textMuted }} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Top header ────────────────────────────────────────────────────────
// Two breakpoint-gated layouts: the desktop layout (hidden md:flex) is the
// original header verbatim; the mobile layout (md:hidden) is LinkedIn-style —
// profile avatar top-left, Messages top-right, no logo/bell/Donate button.
function TopHeader({
  current, navigate, onDonate, profile
}: { current: Screen; navigate: (s: Screen) => void; onDonate: () => void; profile: any }) {
  const { count: incomingCount } = useIncomingRequests();
  const badges = useNotificationBadges();

  return (
    <header
      className="min-h-16 px-4 md:px-6 flex items-center gap-4 shrink-0 sticky top-0 z-30"
      style={{ background: "#fff", borderBottom: `1px solid #e5e7eb`, paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Mobile: profile avatar top-left */}
      <div className="md:hidden">
        <ProfileMenu navigate={navigate} profile={profile} onDonate={onDonate} align="left" />
      </div>

      {/* Desktop: CiP logo */}
      <div className="hidden md:block shrink-0">
        <CiPLogo size={28} />
      </div>

      {/* Desktop: search */}
      <div className="hidden md:block flex-1 max-w-sm relative">
        <Search size={14} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: NAVY }} />
        <input
          placeholder="Search groups, events, people…"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: "#f1f5f9",
            color: NAVY,
            border: `1px solid #e5e7eb`,
          }}
        />
      </div>

      {/* Desktop: nav */}
      <nav className="hidden md:flex items-center gap-1 md:ml-0">
        {TOP_NAV.map((it) => {
          const Icon = it.icon;
          const active = current === it.key;
          return (
            <button
              key={it.key}
              onClick={() => navigate(it.key)}
              className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-md transition-colors min-w-[64px]"
              style={{
                color: active ? NAVY : "rgba(90,79,207,0.9)",
                fontWeight: active ? 600 : 400,
                background: active ? "rgba(90,79,207,0.1)" : "transparent",
                borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
              }}
            >
              <Icon size={16} strokeWidth={2.5} />
              {((it.key === "network" && (incomingCount > 0 || badges.hasNetworkPosts)) || (it.key === "messages" && badges.unreadMessages) || (it.key === "events" && badges.hasNewEvents)) && (
                <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
              )}
              <span className="text-[10px] mt-0.5">{it.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop: right cluster (bell + Donate + avatar) */}
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <NotificationBell navigate={navigate} />
        <button
          onClick={onDonate}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
        >
          Donate
        </button>
        <ProfileMenu navigate={navigate} profile={profile} onDonate={onDonate} align="right" />
      </div>

      {/* Mobile: Messages top-right */}
      <button
        onClick={() => navigate("messages")}
        className="md:hidden ml-auto relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Messages"
      >
        <MessageSquare size={22} strokeWidth={2.5} style={{ color: NAVY }} />
        {badges.unreadMessages && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
        )}
      </button>
    </header>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────
// LinkedIn-style: Home · Network · + (center compose) · Events · Alerts.
// Messages lives in the top-right header instead. Hidden from `md` up.
const BOTTOM_NAV: { key: Screen; label: string; icon: any }[] = [
  { key: "dashboard",     label: "Home",    icon: Home },
  { key: "network",       label: "Network", icon: Network },
  { key: "events",        label: "Events",  icon: CalendarDays },
  { key: "notifications", label: "Alerts",  icon: Bell },
];

export function BottomNav({ current, navigate, onCompose }: { current: Screen; navigate: (s: Screen) => void; onCompose: () => void }) {
  const { count: incomingCount } = useIncomingRequests();
  const badges = useNotificationBadges();

  const dot = (key: Screen) =>
    (key === "network" && (incomingCount > 0 || badges.hasNetworkPosts)) ||
    (key === "events" && badges.hasNewEvents);

  const tab = (it: { key: Screen; label: string; icon: any }) => {
    const Icon = it.icon;
    const active = current === it.key;
    return (
      <button
        key={it.key}
        onClick={() => navigate(it.key)}
        className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
        style={{ color: active ? NAVY : "rgba(90,79,207,0.9)", fontWeight: active ? 600 : 400 }}
      >
        <Icon size={20} strokeWidth={2.5} />
        {dot(it.key) && (
          <span className="absolute top-1.5 right-[calc(50%-16px)] w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
        )}
        <span className="text-[10px]">{it.label}</span>
      </button>
    );
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch"
      style={{ background: "#fff", borderTop: "1px solid #e5e7eb", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tab(BOTTOM_NAV[0])}
      {tab(BOTTOM_NAV[1])}
      {/* Center compose button */}
      <button
        onClick={onCompose}
        className="flex-1 flex items-center justify-center py-1.5"
        aria-label="Create post"
      >
        <span
          className="flex items-center justify-center w-12 h-9 rounded-xl"
          style={{ background: NAVY }}
        >
          <Plus size={22} strokeWidth={2.75} style={{ color: "#fff" }} />
        </span>
      </button>
      {tab(BOTTOM_NAV[2])}
      {tab(BOTTOM_NAV[3])}
    </nav>
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
  flushMobile = false,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  children: ReactNode;
  rightRail?: ReactNode;
  leftRail?: ReactNode;
  fullWidth?: boolean;
  flushMobile?: boolean;
}) {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [donateOpen, setDonateOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  // Message screens hide the footer nav (see below).
  const showBottomNav = !["messages"].includes(current as string);

  // Pull-to-refresh (#16). The shell owns the scroll container, so the gesture
  // lives here and screens opt in by listening for 'cip:pull-refresh'. The feed
  // already listens for 'cip:feed-refresh', so that is fired too and Dashboard
  // needs no change. Waits a beat for listeners to reload before hiding the
  // spinner, so the loading state is actually visible.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { distance, refreshing, threshold } = usePullToRefresh(
    scrollRef,
    async () => {
      window.dispatchEvent(new Event('cip:pull-refresh'));
      window.dispatchEvent(new Event('cip:feed-refresh'));
      await new Promise((r) => setTimeout(r, 700));
    },
    !fullWidth,
  );

  const defaultLeft = (
    <div className="space-y-4">
      <ProfileSummaryCard navigate={navigate} profile={profile} />
      <DonateRail onDonate={() => setDonateOpen(true)} />
    </div>
  );

  const defaultRight = (
    <div className="space-y-4">
      <GetStartedRail navigate={navigate} />
      <UpcomingEventsRail navigate={navigate} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: theme.bg }}>
      <TopHeader current={current} navigate={navigate} onDonate={() => setDonateOpen(true)} profile={profile} />

      <main className="flex-1 overflow-hidden">
        {fullWidth ? (
          // No bottom nav on messaging, so the thread can use the full height
          // (its own composer sits at the bottom).
          <div className="h-full">{children}</div>
        ) : (
          <div ref={scrollRef} className="h-full overflow-y-auto">
            {/* Pull-to-refresh indicator: follows the finger, then spins. */}
            <div
              className="md:hidden flex items-end justify-center overflow-hidden"
              style={{ height: distance, transition: distance === 0 ? "height 180ms ease-out" : undefined }}
              aria-hidden={distance === 0}
            >
              <div className="pb-2 flex items-center gap-1.5 text-[11px]" style={{ color: theme.textMuted }}>
                <Activity
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                  style={{ transform: refreshing ? undefined : `rotate(${Math.min(distance / threshold, 1) * 180}deg)` }}
                />
                {refreshing ? "Refreshing…" : distance >= threshold ? "Release to refresh" : "Pull to refresh"}
              </div>
            </div>
            <div
              className={`max-w-[1400px] mx-auto ${flushMobile ? "px-0 py-4" : "p-4"} md:p-6 pb-24 lg:pb-6 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]`}
            >
              <div className="hidden lg:block">{leftRail ?? defaultLeft}</div>
              <div className="min-w-0">{children}</div>
              <div className="hidden lg:block">{rightRail ?? defaultRight}</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer nav stays on every member screen except messaging, where the
          thread + composer own the full height. Posting is the ComposeOverlay,
          which already covers the nav at a higher z-index. */}
      {showBottomNav && (
        <BottomNav current={current} navigate={navigate} onCompose={() => setComposeOpen(true)} />
      )}

      {composeOpen && <ComposeOverlay navigate={navigate} onClose={() => setComposeOpen(false)} />}
      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
