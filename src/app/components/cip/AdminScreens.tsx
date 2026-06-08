import { ReactNode, useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  LayoutDashboard, Users, LifeBuoy, CalendarDays, FileText, Lock,
  Settings, Bell, Search, Plus, Edit3, Eye, TrendingUp, ChevronDown,
  ShieldCheck, ArrowLeft, CheckCircle2, Circle, Network, X
} from "lucide-react";
import { CiPLogo, NAVY, GOLD, useTheme } from "./brand";
import { Screen } from "./types";
import { useAuth } from "./AuthContext";

const ADMIN_ITEMS: { key: Screen; label: string; icon: any }[] = [
  { key: "admin-overview",  label: "Overview",      icon: LayoutDashboard },
  { key: "admin-members",   label: "Members",        icon: Users },
  { key: "admin-groups",    label: "Groups",         icon: Network },
  { key: "admin-support",   label: "Requests",       icon: LifeBuoy },
  { key: "admin-events",    label: "Events",         icon: CalendarDays },
  { key: "admin-content",   label: "Content",        icon: FileText },
  { key: "admin-privacy",   label: "Data & Privacy", icon: Lock },
];

export function AdminShell({
  current, navigate, exitAdmin, children,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  exitAdmin: () => void;
  children: ReactNode;
}) {
  const { theme } = useTheme();

  // Determine active nav item (admin-resources/announcements/affiliated map to admin-content)
  const activeKey = ["admin-resources", "admin-announcements", "admin-affiliated"].includes(current)
    ? "admin-content"
    : current;

  return (
    <div className="flex h-screen w-full" style={{ background: theme.bg }}>
      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col" style={{ background: "#0a1f3a" }}>
        <div className="px-4 py-5 mb-1">
          <CiPLogo light size={26} />
          <div
            className="mt-2.5 inline-block px-2 py-0.5 rounded-full text-[10px]"
            style={{ background: GOLD, color: NAVY, fontWeight: 700, letterSpacing: "0.06em" }}
          >
            ADMIN
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {ADMIN_ITEMS.map((it) => {
            const Icon = it.icon;
            const active = activeKey === it.key;
            return (
              <button
                key={it.key}
                onClick={() => navigate(it.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
                style={{
                  background: active ? "rgba(201,162,39,0.15)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? `2px solid ${GOLD}` : "2px solid transparent",
                }}
              >
                <Icon size={15} />
                <span>{it.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={exitAdmin}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <ArrowLeft size={12} /> Back to member view
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 px-6 flex items-center gap-3 shrink-0"
          style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.divider}` }}
        >
          <div className="flex-1 max-w-sm relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input
              placeholder="Search members, requests, events…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: theme.tableHead, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={16} style={{ color: theme.textMuted }} />
            </button>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: GOLD, color: NAVY, fontWeight: 700 }}
            >
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

// ── Shared admin primitives ─────────────────────────────────────────
function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      {children}
    </div>
  );
}

function H1({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return <h1 style={{ color: theme.text }}>{children}</h1>;
}

function Pill({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs"
      style={{ background: theme.pillBg, color: NAVY, fontWeight: 500 }}
    >
      {children}
    </span>
  );
}

function StatusPill({ label, color }: { label: string; color?: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "Published":   { bg: "#d1fae5", text: "#065f46" },
    "Draft":       { bg: "#f3f4f6", text: "#6b7280" },
    "Scheduled":   { bg: "#dbeafe", text: "#1d4ed8" },
    "Approved":    { bg: "#d1fae5", text: "#065f46" },
    "In review":   { bg: "#fef3c7", text: "#92400e" },
    "Submitted":   { bg: "#dbeafe", text: "#1d4ed8" },
    "Matched":     { bg: "#d1fae5", text: "#065f46" },
    "Active":      { bg: "#d1fae5", text: "#065f46" },
    "Onboarding":  { bg: "#fef3c7", text: "#92400e" },
  };
  const style = map[label] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs"
      style={{ background: style.bg, color: style.text, fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

// ── Admin Overview ──────────────────────────────────────────────────
export function AdminOverview() {
  const { theme } = useTheme();
  const [stats, setStats] = useState([
    { l: "Total members", v: "0", d: "" },
    { l: "Completed onboarding", v: "0", d: "" },
    { l: "Affirmed creed", v: "0", d: "" },
    { l: "Interested in party", v: "0", d: "" },
    { l: "Support requests open", v: "0", d: "" },
  ]);
  const [supportQueue, setSupportQueue] = useState<any[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [openSupportCount, setOpenSupportCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profiles) {
        setStats(prev => {
          const newStats = [...prev];
          newStats[0].v = profiles.length.toString();
          newStats[1].v = profiles.filter(p => p.onboarded).length.toString();
          newStats[2].v = profiles.filter(p => p.creed_affirmed).length.toString();
          newStats[3].v = profiles.filter(p => p.engagement && p.engagement.toLowerCase().includes('party')).length.toString();
          return newStats;
        });
        setRecentSignups(profiles.slice(0, 5));
      }

      const { data: requests } = await supabase.from('support_requests').select('*, profiles!inner(first_name, last_name)').order('created_at', { ascending: false });
      if (requests) {
        const openReqs = requests.filter(r => r.status !== 'Closed');
        setOpenSupportCount(openReqs.length);
        setStats(prev => {
          const newStats = [...prev];
          newStats[4].v = openReqs.length.toString();
          return newStats;
        });
        setSupportQueue(openReqs.slice(0, 5));
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <H1>Admin overview</H1>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Live from database</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4 mb-7">
        {stats.map((s) => (
          <AdminCard key={s.l} className="p-4">
            <div className="text-xs" style={{ color: theme.textMuted }}>{s.l}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <div style={{ color: theme.text, fontSize: 26, fontWeight: 700 }}>{s.v}</div>
              {s.d && (
                <span
                  className="text-xs"
                  style={{ color: s.d === "urgent" ? "#dc2626" : "#059669" }}
                >
                  {s.d !== "urgent" && <TrendingUp size={10} className="inline mr-0.5" />}
                  {s.d}
                </span>
              )}
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Support queue snapshot */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: theme.text }}>Support queue</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>{openSupportCount} open</span>
          </div>
          <div className="space-y-2">
            {supportQueue.length === 0 ? (
               <div className="text-sm p-3" style={{ color: theme.textMuted }}>No open support requests.</div>
            ) : (
              supportQueue.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: theme.tableHead }}
                >
                  <div className="text-sm truncate mr-3" style={{ color: theme.text }}>{r.request_type}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill label={r.status} />
                    <span className="text-xs" style={{ color: theme.textSubtle }}>{r.urgency}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Recent sign-ups */}
        <AdminCard className="p-5">
          <h3 className="mb-4" style={{ color: theme.text }}>Recent sign-ups</h3>
          <div className="space-y-2">
            {recentSignups.length === 0 ? (
               <div className="text-sm p-3" style={{ color: theme.textMuted }}>No sign-ups yet.</div>
            ) : (
              recentSignups.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: theme.tableHead }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
                    >
                      {p.first_name ? p.first_name.charAt(0) : "?"}
                    </div>
                    <span className="text-sm" style={{ color: theme.text }}>{p.first_name} {p.last_name}</span>
                    <span className="text-xs" style={{ color: theme.textSubtle }}>{p.state}</span>
                  </div>
                  <span className="text-xs" style={{ color: theme.textSubtle }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

// ── Admin Members ──────────────────────────────────────────────────
export function AdminMembers() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) {
        setRows(data);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <H1>Members</H1>
        <button
          className="px-4 py-2 rounded-xl text-sm border"
          style={{ borderColor: theme.cardBorder, color: theme.text }}
        >
          Export (admin only)
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["All states", "NSW", "VIC", "QLD", "WA", "SA", "TAS"].map((s) => (
          <button key={s} className="px-3 py-1 rounded-full text-xs border" style={{ borderColor: theme.divider, color: theme.textMuted }}>
            {s}
          </button>
        ))}
        <div className="w-px h-4 mx-1" style={{ background: theme.divider }} />
        {["Engagement ▾", "Status ▾"].map((s) => (
          <button key={s} className="px-3 py-1 rounded-full text-xs border" style={{ borderColor: theme.divider, color: theme.textMuted }}>
            {s}
          </button>
        ))}
      </div>

      <AdminCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
              {["Member", "State", "Engagement", "Party", "Creed", "Status", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-4 text-center text-sm text-gray-500">Loading members...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-4 text-center text-sm text-gray-500">No members found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${theme.divider}` }}>
                  <td className="px-5 py-3">
                    <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{r.first_name} {r.last_name}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{r.email}</div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.state}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.engagement}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.party}</td>
                  <td className="px-5 py-3">
                    {r.creed_affirmed
                      ? <CheckCircle2 size={14} style={{ color: "#059669" }} />
                      : <Circle size={14} style={{ color: theme.divider }} />}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={r.onboarded ? "Active" : "Onboarding"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: theme.textMuted }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

// ── Admin Support queue ────────────────────────────────────────────
export function AdminSupport({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ open: 0, inReview: 0, awaiting: 0, matched: 0 });

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('support_requests')
        .select('*, profiles!user_id(first_name, last_name, state, party)')
        .order('created_at', { ascending: false });

      if (data) {
        setRows(data);
        setCounts({
          open: data.filter((r) => r.status === 'Submitted').length,
          inReview: data.filter((r) => r.status === 'In review').length,
          awaiting: data.filter((r) => r.status === 'Awaiting member').length,
          matched: data.filter((r) => r.status === 'Matched').length,
        });
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <div className="max-w-7xl">
      <div className="mb-5">
        <H1>Support requests</H1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Triage, assign and track member support requests.</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Submitted", count: counts.open, color: "#fee2e2", text: "#dc2626" },
          { label: "In review", count: counts.inReview, color: "#fef3c7", text: "#92400e" },
          { label: "Awaiting member", count: counts.awaiting, color: "#fde8d8", text: "#c2410c" },
          { label: "Matched", count: counts.matched, color: "#d1fae5", text: "#065f46" },
        ].map((s) => (
          <AdminCard key={s.label} className="p-4 text-center">
            <div className="text-2xl" style={{ color: theme.text, fontWeight: 700 }}>{s.count}</div>
            <div
              className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ background: s.color, color: s.text }}
            >
              {s.label}
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
              {["Request", "Member", "State", "Party", "Urgency", "Assigned", "Status", "Updated", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-5 py-4 text-center text-sm text-gray-500">Loading requests...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-4 text-center text-sm text-gray-500">No support requests.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${theme.divider}` }}>
                  <td className="px-4 py-3" style={{ color: theme.text, fontWeight: 500 }}>{r.request_type}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profiles?.first_name} {r.profiles?.last_name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profiles?.state}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profiles?.party}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: r.urgency === "High" ? "#fee2e2" : r.urgency === "Medium" ? "#fef3c7" : "#f3f4f6",
                        color: r.urgency === "High" ? "#dc2626" : r.urgency === "Medium" ? "#92400e" : "#6b7280",
                      }}
                    >
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.assigned_to ? "Assigned" : "Unassigned"}</td>
                  <td className="px-4 py-3"><StatusPill label={r.status} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textSubtle }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate("admin-support-detail")}
                      className="text-xs px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: theme.cardBorder, color: theme.text }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

export function AdminSupportDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate("admin-support")}
        className="flex items-center gap-1.5 text-sm mb-5"
        style={{ color: theme.textMuted }}
      >
        ← Back to queue
      </button>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <AdminCard className="p-5">
            <StatusPill label="In review" />
            <h2 className="mt-2" style={{ color: theme.text }}>Connect to local branch (Sydney)</h2>
            <div className="text-xs mt-1" style={{ color: theme.textMuted }}>Submitted 2 hours ago by Sarah Reed (NSW)</div>
            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              {[
                ["Request type", "Connect me to a local branch"],
                ["Pathway interest", "Joining a party"],
                ["Party guidance attached", "Yes"],
                ["Consent to contact", "Granted"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs mb-0.5" style={{ color: theme.textSubtle }}>{label}</div>
                  <div style={{ color: theme.text }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
              <div className="text-xs mb-1.5" style={{ color: theme.textSubtle }}>Member's description</div>
              <div className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                "I'd love to attend a Sydney branch meeting but don't know anyone. Could someone introduce me to a local branch contact?"
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="mb-3" style={{ color: theme.text }}>Admin notes</h3>
            <textarea
              rows={4}
              placeholder="Internal notes (not visible to member)…"
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
              style={{ borderColor: theme.inputBorder, background: theme.tableHead, color: theme.text }}
            />
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 rounded-xl text-xs" style={{ background: NAVY, color: "#fff" }}>Save note</button>
              <button className="px-3 py-2 rounded-xl text-xs border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Record introduction made</button>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard className="p-5">
            <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Member summary</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Name", "Sarah Reed"],
                ["State", "NSW"],
                ["Tradition", "Anglican"],
                ["Engagement", "Interested in joining a party"],
                ["Creed affirmed", "Yes"],
                ["Consent", "Granted"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>{label}</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Actions</h3>
            <div className="space-y-2">
              <select
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
              >
                <option>Assign to admin…</option>
                <option>Mick Andrews</option>
                <option>Jess Carter</option>
              </select>
              <select
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
              >
                <option>Update status…</option>
                <option>Submitted</option>
                <option>In review</option>
                <option>Awaiting member response</option>
                <option>Matched / introduced</option>
                <option>Closed</option>
              </select>
              <button className="w-full px-3 py-2 rounded-xl text-xs" style={{ background: NAVY, color: "#fff" }}>
                Send message to member
              </button>
              <button className="w-full px-3 py-2 rounded-xl text-xs border" style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
                Close request
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

export function AdminEvents() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*, event_attendees(count)').order('created_at', { ascending: false });
      if (data) {
        setRows(data.map(e => [
          e.title,
          e.date,
          e.type,
          e.location,
          e.event_attendees?.[0]?.count || 0,
          e.status,
          ""
        ]));
      }
    };
    fetchEvents();
  }, []);

  return (
    <AdminTablePage
      title="Events"
      subtitle="Manage CiP-hosted events."
      ctaLabel="Create event"
      columns={["Title", "Date", "Type", "Location", "Registrations", "Status", ""]}
      rows={rows}
      renderStatus={(row) => <StatusPill label={row[5] as string} />}
    />
  );
}

// ── Admin Content (Resources + Announcements + Affiliated) ──────────
export function AdminContent() {
  const [tab, setTab] = useState<"resources" | "announcements" | "affiliated">("resources");
  const { theme } = useTheme();

  const [resourceRows, setResourceRows] = useState<any[]>([]);
  const [announcementRows, setAnnouncementRows] = useState<any[]>([]);
  const [affiliatedRows, setAffiliatedRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      if (tab === "resources") {
        const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (data) setResourceRows(data.map(r => [r.title, r.type, r.category, r.author, r.featured ? "Yes" : "No"]));
      } else if (tab === "announcements") {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setAnnouncementRows(data.map(a => [a.title, a.category, a.cta_text || "-", a.status, new Date(a.created_at).toLocaleDateString()]));
      } else if (tab === "affiliated") {
        const { data } = await supabase.from('affiliated_orgs').select('*').order('created_at', { ascending: false });
        if (data) setAffiliatedRows(data.map(o => [o.organisation, o.category, o.poc_name, o.poc_type, o.status]));
      }
    };
    fetchContent();
  }, [tab]);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <H1>Content</H1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Manage resources, announcements and affiliated groups.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
        >
          <Plus size={13} />
          {tab === "resources" ? "Add resource" : tab === "announcements" ? "Compose" : "Add organisation"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: theme.tableHead, border: `1px solid ${theme.divider}` }}>
        {(["resources", "announcements", "affiliated"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm capitalize transition-colors"
            style={{
              background: tab === t ? theme.cardBg : "transparent",
              color: tab === t ? theme.text : theme.textMuted,
              fontWeight: tab === t ? 600 : 400,
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content tables */}
      <AdminCard className="overflow-hidden">
        {tab === "resources" && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
                {["Title", "Type", "Category", "Author / Provider", "Featured", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resourceRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < resourceRows.length - 1 ? `1px solid ${theme.divider}` : "none" }}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-5 py-3 text-xs" style={{ color: j === 0 ? theme.text : theme.textMuted, fontWeight: j === 0 ? 500 : 400 }}>{cell}</td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}><Edit3 size={11} /> Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "announcements" && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
                {["Title", "Category", "CTA", "Status", "Posted", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcementRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < announcementRows.length - 1 ? `1px solid ${theme.divider}` : "none" }}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-5 py-3 text-xs" style={{ color: j === 0 ? theme.text : j === 3 ? undefined : theme.textMuted, fontWeight: j === 0 ? 500 : 400 }}>
                      {j === 3 ? <StatusPill label={cell as string} /> : cell}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}><Edit3 size={11} /> Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "affiliated" && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
                {["Organisation", "Category", "POC", "POC type", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliatedRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < affiliatedRows.length - 1 ? `1px solid ${theme.divider}` : "none" }}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-5 py-3 text-xs" style={{ color: j === 0 ? theme.text : j === 4 ? undefined : theme.textMuted, fontWeight: j === 0 ? 500 : 400 }}>
                      {j === 4 ? <StatusPill label={cell as string} /> : cell}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}><Edit3 size={11} /> Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
}

// ── Generic admin table page ───────────────────────────────────────
function AdminTablePage({
  title, subtitle, ctaLabel, columns, rows, renderStatus,
}: {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  columns: string[];
  rows: (string | React.ReactNode)[][];
  renderStatus?: (row: (string | React.ReactNode)[]) => React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <H1>{title}</H1>
          {subtitle && <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{subtitle}</p>}
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
        >
          <Plus size={13} /> {ctaLabel}
        </button>
      </div>
      <AdminCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
              {columns.map((c) => (
                <th key={c} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${theme.divider}` : "none" }}>
                {r.slice(0, -1).map((cell, j) => (
                  <td
                    key={j}
                    className="px-5 py-3 text-xs"
                    style={{ color: j === 0 ? theme.text : theme.textMuted, fontWeight: j === 0 ? 500 : 400 }}
                  >
                    {j === r.length - 2 && renderStatus ? renderStatus(r) : cell}
                  </td>
                ))}
                <td className="px-5 py-3 text-right">
                  <button
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: theme.cardBorder, color: theme.textMuted }}
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

export function AdminDonations() {
  const { theme } = useTheme();
  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <H1>Donations</H1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Donation processing will be connected to an external provider.</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[["Donate clicks (30d)", "57"], ["External redirects", "57"], ["Provider status", "Pending integration"], ["Active donation URL", "fairpay.cip.org.au"]].map(([l, v]) => (
          <AdminCard key={l} className="p-4">
            <div className="text-xs" style={{ color: theme.textMuted }}>{l}</div>
            <div className="mt-1 text-lg" style={{ color: theme.text, fontWeight: 700 }}>{v}</div>
          </AdminCard>
        ))}
      </div>
      <AdminCard className="p-5">
        <h3 className="mb-2" style={{ color: theme.text }}>External donation URL</h3>
        <p className="text-sm mb-3" style={{ color: theme.textMuted }}>The Donate button redirects to this external provider URL.</p>
        <div className="flex gap-2">
          <input
            defaultValue="https://fairpay.cip.org.au/donate"
            className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
          />
          <button className="px-4 py-2 rounded-xl text-sm" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>Save</button>
        </div>
      </AdminCard>
    </div>
  );
}

export function AdminPrivacy() {
  const { theme } = useTheme();
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [exportRequests, setExportRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase.from('data_requests').select('*, profiles!user_id(first_name, last_name)').order('created_at', { ascending: false });
      if (data) {
        setDeletionRequests(data.filter(r => r.request_type === 'Deletion' && r.status !== 'Processed'));
        setExportRequests(data.filter(r => r.request_type === 'Export' && r.status !== 'Processed'));
      }
    };
    fetchRequests();
  }, []);

  const markProcessed = async (id: string) => {
    await supabase.from('data_requests').update({ status: 'Processed' }).eq('id', id);
    setDeletionRequests(prev => prev.filter(r => r.id !== id));
    setExportRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <H1>Data & Privacy</H1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Manage deletion requests, data exports, consent withdrawals and access audit logs.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5 mb-5">
        <AdminCard className="p-5">
          <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Deletion requests</h3>
          {deletionRequests.length === 0 ? (
            <div className="text-sm text-gray-500">No pending deletion requests.</div>
          ) : (
            deletionRequests.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: theme.tableHead }}>
                <span className="text-sm" style={{ color: theme.text }}>{r.profiles?.first_name} {r.profiles?.last_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: theme.textSubtle }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  <button onClick={() => markProcessed(r.id)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Processed</button>
                </div>
              </div>
            ))
          )}
        </AdminCard>
        <AdminCard className="p-5">
          <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Data export requests</h3>
          {exportRequests.length === 0 ? (
            <div className="text-sm text-gray-500">No pending export requests.</div>
          ) : (
            exportRequests.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: theme.tableHead }}>
                <span className="text-sm" style={{ color: theme.text }}>{r.profiles?.first_name} {r.profiles?.last_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: theme.textSubtle }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  <button onClick={() => markProcessed(r.id)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Process</button>
                </div>
              </div>
            ))
          )}
        </AdminCard>
      </div>
      <AdminCard className="overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${theme.divider}`, background: theme.tableHead }}>
          <span className="text-xs" style={{ color: theme.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Consent & access audit log
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
              {["Member", "Action", "When", "Admin"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-6 text-center text-sm text-gray-500">
                No audit logs recorded yet.
              </td>
            </tr>
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

export function AdminGroups() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVis, setNewVis] = useState("public");
  const [newCaveatType, setNewCaveatType] = useState("electorate");
  const [newCaveatValue, setNewCaveatValue] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) {
        console.error("Error loading groups:", error);
        alert("Error loading groups: " + error.message);
      }
      if (data) {
        // Sort in memory just in case created_at is missing from DB schema
        data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setGroups(data);
      }
    } catch (e: any) {
      console.error("Exception loading groups:", e);
      alert("Exception loading groups: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from('groups').insert({
      name: newName,
      description: newDesc,
      visibility: newVis,
      caveat_type: newVis === "restricted" ? newCaveatType : null,
      caveat_value: newVis === "restricted" ? newCaveatValue : null,
      created_by: user.id
    });
    setCreating(false);
    if (error) {
      alert("Failed to create group: " + error.message);
    } else {
      setNewName("");
      setNewDesc("");
      setNewVis("public");
      setNewCaveatType("electorate");
      setNewCaveatValue("");
      setShowCreate(false);
      loadGroups();
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <H1>Groups</H1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage community and special interest groups.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
        >
          <Plus size={13} /> Create group
        </button>
      </div>

      {showCreate && (
        <AdminCard className="p-5 mb-5 border border-dashed border-gray-300 relative">
          <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"><X size={16}/></button>
          <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Create New Group</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Group Name</label>
              <input 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
                placeholder="e.g. Christian Lawyers Network"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Description</label>
              <textarea 
                value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
                placeholder="What is this group about?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Visibility</label>
              <select 
                value={newVis} 
                onChange={e => setNewVis(e.target.value)}
                className="w-full text-sm p-2 rounded-lg outline-none"
                style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="restricted">Restricted (Curated)</option>
              </select>
            </div>
            {newVis === "restricted" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Caveat Type</label>
                  <select 
                    value={newCaveatType} 
                    onChange={e => setNewCaveatType(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg outline-none"
                    style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
                  >
                    <option value="electorate">Same Federal Electorate</option>
                    <option value="party">Same Political Party</option>
                    <option value="tradition">Same Christian Tradition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Caveat Value</label>
                  <input
                    type="text"
                    value={newCaveatValue}
                    onChange={e => setNewCaveatValue(e.target.value)}
                    placeholder={
                      newCaveatType === "electorate" ? "e.g. Bennelong" :
                      newCaveatType === "party" ? "e.g. Liberal Party" :
                      "e.g. Catholic"
                    }
                    className="w-full text-sm p-2 rounded-lg outline-none"
                    style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
                  />
                </div>
              </>
            )}
            <button 
              onClick={handleCreate} disabled={creating || !newName.trim() || (newVis === "restricted" && !newCaveatValue.trim())}
              className="w-full py-2 rounded-lg text-sm disabled:opacity-50"
              style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
            >
              {creating ? "Creating..." : "Save Group"}
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.divider}` }}>
              <th className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>Group Name</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>Privacy</th>
              <th className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>Created</th>
              <th className="text-right px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-gray-500">Loading groups...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-gray-500">No groups found. Create one above!</td></tr>
            ) : (
              groups.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: i < groups.length - 1 ? `1px solid ${theme.divider}` : "none" }}>
                  <td className="px-5 py-3">
                    <div style={{ color: theme.text, fontWeight: 500 }}>{g.name}</div>
                    <div className="text-xs mt-0.5 truncate max-w-sm" style={{ color: theme.textMuted }}>{g.description || "No description"}</div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>
                    <span className="capitalize">{g.visibility}</span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <Edit3 size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}