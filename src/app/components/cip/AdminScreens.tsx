import { ReactNode, useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  LayoutDashboard, Users, LifeBuoy, CalendarDays, FileText, Lock,
  Settings, Bell, Search, Plus, Edit3, Eye, TrendingUp, ChevronDown,
  ShieldCheck, ArrowLeft, CheckCircle2, Circle, Network, X, MoreHorizontal,
  Inbox, Flag
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CiPLogo, NAVY, GOLD, useTheme } from "./brand";
import { Screen } from "./types";
import { useAuth } from "./AuthContext";
import { PARTIES, TRADITIONS, MemberNameLink } from "./MemberScreens";
import { FEDERAL_ELECTORATES } from "./electorates";
import { AutocompleteInput } from "./AutocompleteInput";

const ADMIN_ITEMS: { key: Screen; label: string; icon: any }[] = [
  { key: "admin-overview",  label: "Overview",      icon: LayoutDashboard },
  { key: "admin-members",   label: "Members",        icon: Users },
  { key: "admin-groups",    label: "Groups",         icon: Network },
  { key: "admin-support",   label: "Requests",       icon: LifeBuoy },
  { key: "admin-complaints",label: "Complaints",     icon: Flag },
  { key: "admin-enquiries", label: "Enquiries",      icon: Inbox },
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
            style={{ background: GOLD, color: "#fff", fontWeight: 700, letterSpacing: "0.06em" }}
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
            style={{ color: "rgba(255,255,255,0.95)" }}
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
              style={{ background: GOLD, color: "#fff", fontWeight: 700 }}
            >
              AD
            </div>
          </div>
        </header>
        <main id="admin-scroll" className="flex-1 overflow-y-auto p-8">{children}</main>
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
export function AdminOverview({ navigate }: { navigate: (s: Screen) => void }) {
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

      const { data: requests } = await supabase.from('support_requests').select('*, profiles!user_id(first_name, last_name)').order('created_at', { ascending: false });
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
                    <span className="text-sm" style={{ color: theme.text }}><MemberNameLink userId={p.id} name={`${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Member'} navigate={navigate} /></span>
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
export function AdminMembers({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from('profiles').select('*, profile_private(party, tradition)').order('created_at', { ascending: false });
      if (data) {
        setRows(data);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const handleAction = async (id: string, action: "suspend" | "unsuspend" | "delete") => {
    let error: any = null;
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this account? This cannot be easily undone.")) return;
      ({ error } = await supabase.from("profiles").update({ deleted_at: new Date().toISOString() }).eq("id", id));
    } else if (action === "suspend") {
      if (!confirm("Suspend this account?")) return;
      ({ error } = await supabase.from("profiles").update({ suspended_at: new Date().toISOString() }).eq("id", id));
    } else if (action === "unsuspend") {
      ({ error } = await supabase.from("profiles").update({ suspended_at: null }).eq("id", id));
    }
    if (error) {
      alert("Action failed: " + error.message);
      return;
    }
    setRows(rows.map(r => {
      if (r.id === id) {
        return {
          ...r,
          suspended_at: action === "suspend" ? new Date().toISOString() : action === "unsuspend" ? null : r.suspended_at,
          deleted_at: action === "delete" ? new Date().toISOString() : r.deleted_at
        };
      }
      return r;
    }));
  };

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
                    <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}><MemberNameLink userId={r.id} name={`${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Member'} navigate={navigate} /></div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{r.email}</div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.state}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.engagement}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profile_private?.party}</td>
                  <td className="px-5 py-3">
                    {r.creed_affirmed
                      ? <CheckCircle2 size={14} style={{ color: "#059669" }} />
                      : <Circle size={14} style={{ color: theme.divider }} />}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={r.deleted_at ? "Deleted" : r.suspended_at ? "Suspended" : r.onboarded ? "Active" : "Onboarding"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { localStorage.setItem('activeProfileUserId', r.id); navigate('member-profile'); }}
                        title="View profile"
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: theme.textMuted }}>
                        <Eye size={14} />
                      </button>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: theme.textMuted }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="bg-white rounded-lg shadow-xl p-1 z-50 border border-gray-100 text-sm min-w-[160px]" align="end">
                            {r.deleted_at ? (
                              <DropdownMenu.Item className="px-3 py-2 cursor-not-allowed outline-none rounded text-gray-400" disabled>Account Deleted</DropdownMenu.Item>
                            ) : (
                              <>
                                {r.suspended_at ? (
                                  <DropdownMenu.Item className="px-3 py-2 cursor-pointer hover:bg-gray-50 outline-none rounded" onClick={() => handleAction(r.id, "unsuspend")}>Unsuspend Account</DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item className="px-3 py-2 cursor-pointer hover:bg-gray-50 outline-none rounded" onClick={() => handleAction(r.id, "suspend")}>Suspend Account</DropdownMenu.Item>
                                )}
                                <DropdownMenu.Item className="px-3 py-2 cursor-pointer text-red-600 hover:bg-red-50 outline-none rounded" onClick={() => handleAction(r.id, "delete")}>Delete Account</DropdownMenu.Item>
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
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
        .select('*, profiles!user_id(first_name, last_name, state, profile_private(party))')
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
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}><MemberNameLink userId={r.user_id} name={`${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'Member'} navigate={navigate} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profiles?.state}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{r.profiles?.profile_private?.party}</td>
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
                      onClick={() => { localStorage.setItem("activeSupportRequestId", r.id); navigate("admin-support-detail"); }}
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

const SUPPORT_STATUSES = ["Submitted", "In review", "Awaiting member", "Matched", "Closed"];

export function AdminSupportDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("activeSupportRequestId");
    if (!id) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("support_requests")
        .select("*, profiles!user_id(first_name, last_name, state, creed_affirmed, profile_private(party, tradition))")
        .eq("id", id)
        .maybeSingle();
      setReq(data);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (status: string) => {
    if (!req) return;
    setSaving(true);
    const { error } = await supabase.from("support_requests").update({ status }).eq("id", req.id);
    setSaving(false);
    if (error) { alert("Could not update status: " + error.message); return; }
    setReq({ ...req, status });
  };

  const back = (
    <button
      onClick={() => navigate("admin-support")}
      className="flex items-center gap-1.5 text-sm mb-5"
      style={{ color: theme.textMuted }}
    >
      ← Back to queue
    </button>
  );

  if (loading) {
    return <div className="max-w-5xl">{back}<p className="text-sm" style={{ color: theme.textMuted }}>Loading…</p></div>;
  }
  if (!req) {
    return <div className="max-w-5xl">{back}<AdminCard className="p-8 text-center"><p className="text-sm" style={{ color: theme.textMuted }}>Request not found. Open one from the queue.</p></AdminCard></div>;
  }

  const p = req.profiles || {};
  const memberName = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Member";

  return (
    <div className="max-w-5xl">
      {back}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <AdminCard className="p-5">
            <StatusPill label={req.status} />
            <h2 className="mt-2" style={{ color: theme.text }}>{req.request_type}</h2>
            <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
              Submitted {new Date(req.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} by <MemberNameLink userId={req.user_id} name={memberName} navigate={navigate} />{p.state ? ` (${p.state})` : ""}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              {[
                ["Request type", req.request_type],
                ["Urgency", req.urgency],
                ["Status", req.status],
                ["Assigned", req.assigned_to ? "Assigned" : "Unassigned"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs mb-0.5" style={{ color: theme.textSubtle }}>{label}</div>
                  <div style={{ color: theme.text }}>{value || "—"}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
              <div className="text-xs mb-1.5" style={{ color: theme.textSubtle }}>Member's description</div>
              <div className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                {req.description || "No description provided."}
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard className="p-5">
            <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Member summary</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Name", memberName],
                ["State", p.state || "—"],
                ["Tradition", p.profile_private?.tradition || "—"],
                ["Party", p.profile_private?.party || "—"],
                ["Creed affirmed", p.creed_affirmed ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>{label}</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="mb-3 text-sm" style={{ color: theme.text }}>Update status</h3>
            <select
              value={req.status}
              disabled={saving}
              onChange={(e) => updateStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
            >
              {SUPPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

// ── Complaints (reported posts & comments) ──────────────────────────
const REPORT_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  open:      { bg: "#fee2e2", text: "#dc2626" },
  reviewing: { bg: "#fef3c7", text: "#92400e" },
  actioned:  { bg: "#d1fae5", text: "#065f46" },
  dismissed: { bg: "#f3f4f6", text: "#6b7280" },
};

export function AdminComplaints({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");

  const load = async () => {
    setLoading(true);
    const { data: reports } = await supabase.from("content_reports").select("*").order("created_at", { ascending: false });
    const list = reports || [];

    // Batch-load the reported content across the three source tables.
    const commentIds    = list.filter((r) => r.target_type === "comment").map((r) => r.target_id);
    const globalPostIds = list.filter((r) => r.target_type === "post" && r.post_type === "global").map((r) => r.target_id);
    const groupPostIds  = list.filter((r) => r.target_type === "post" && r.post_type === "group").map((r) => r.target_id);

    const [comments, gPosts, grPosts] = await Promise.all([
      commentIds.length    ? supabase.from("post_comments").select("id, content, user_id, removed_at").in("id", commentIds) : Promise.resolve({ data: [] as any[] }),
      globalPostIds.length ? supabase.from("global_posts").select("id, content, user_id, removed_at").in("id", globalPostIds) : Promise.resolve({ data: [] as any[] }),
      groupPostIds.length  ? supabase.from("group_posts").select("id, content, user_id, removed_at").in("id", groupPostIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const targetMap = new Map<string, any>();
    [...(comments.data || []), ...(gPosts.data || []), ...(grPosts.data || [])].forEach((t: any) => targetMap.set(t.id, t));

    // Resolve reporter + content-author names via the safe directory view.
    const nameIds = new Set<string>();
    list.forEach((r) => r.reporter_id && nameIds.add(r.reporter_id));
    targetMap.forEach((t) => t.user_id && nameIds.add(t.user_id));
    const { data: dir } = nameIds.size
      ? await supabase.from("member_directory").select("id, first_name, last_name").in("id", Array.from(nameIds))
      : { data: [] as any[] };
    const nameMap = new Map<string, string>();
    (dir || []).forEach((d: any) => nameMap.set(d.id, `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Member"));

    setRows(list.map((r) => {
      const t = targetMap.get(r.target_id);
      return {
        ...r,
        reporterName: r.reporter_id ? (nameMap.get(r.reporter_id) || "Member") : "AI monitor",
        targetContent: t ? t.content : "(content unavailable — it may have been deleted)",
        targetAuthor: t?.user_id ? (nameMap.get(t.user_id) || "Member") : "Unknown",
        targetAuthorId: t?.user_id || null,
        targetRemoved: !!t?.removed_at,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (r: any, status: string) => {
    await supabase.from("content_reports").update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", r.id);
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
  };

  const removeContent = async (r: any) => {
    if (!confirm("Remove this content from the platform? It will no longer be visible to members.")) return;
    const table = r.target_type === "comment" ? "post_comments" : (r.post_type === "global" ? "global_posts" : "group_posts");
    const { error } = await supabase.from(table).update({ removed_at: new Date().toISOString(), removed_by: user?.id }).eq("id", r.target_id);
    if (error) { alert("Could not remove content: " + error.message); return; }
    await supabase.from("content_reports").update({ status: "actioned", reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", r.id);
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "actioned", targetRemoved: true } : x)));
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const countBy = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <H1>Complaints</H1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Reported posts and comments — from members and the AI conduct monitor — awaiting review.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([["open", "Open"], ["reviewing", "Reviewing"], ["actioned", "Actioned"], ["dismissed", "Dismissed"], ["all", "All"]] as const).map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ background: filter === val ? NAVY : theme.cardBg, color: filter === val ? "#fff" : theme.textMuted, border: `1px solid ${theme.cardBorder}`, fontWeight: filter === val ? 600 : 400 }}>
            {lbl}{val !== "all" ? ` (${countBy(val)})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminCard className="p-8 text-center"><p className="text-sm" style={{ color: theme.textMuted }}>Loading complaints…</p></AdminCard>
      ) : filtered.length === 0 ? (
        <AdminCard className="p-8 text-center"><p className="text-sm" style={{ color: theme.textMuted }}>No complaints in this view.</p></AdminCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const st = REPORT_STATUS_STYLE[r.status] || REPORT_STATUS_STYLE.open;
            return (
              <AdminCard key={r.id} className="p-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.text, fontWeight: 600 }}>{r.status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: theme.pillBg, color: NAVY }}>{r.target_type}</span>
                  {r.ai_flagged && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#6d28d9", fontWeight: 600 }}>AI flagged</span>}
                  <span className="text-xs" style={{ color: theme.textMuted }}>{r.reason || "No reason given"}</span>
                </div>
                <div className="text-[11px] mt-1" style={{ color: theme.textSubtle }}>
                  Reported by <MemberNameLink userId={r.reporter_id} name={r.reporterName} navigate={navigate} /> · {new Date(r.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </div>

                <div className="mt-3 rounded-xl p-3" style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}` }}>
                  <div className="text-xs mb-1" style={{ color: theme.textSubtle }}>
                    {r.target_type === "comment" ? "Comment" : "Post"} by <MemberNameLink userId={r.targetAuthorId} name={r.targetAuthor} navigate={navigate} />{r.targetRemoved ? " · removed" : ""}
                  </div>
                  <div className="text-sm whitespace-pre-wrap" style={{ color: theme.text }}>{r.targetContent}</div>
                </div>

                {r.details && (
                  <div className="text-xs mt-2" style={{ color: theme.textMuted }}>
                    <span style={{ fontWeight: 600 }}>Reporter note:</span> {r.details}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {!r.targetRemoved && (
                    <button onClick={() => removeContent(r)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#b42318", color: "#fff", fontWeight: 600 }}>
                      Remove content
                    </button>
                  )}
                  {r.status !== "reviewing" && r.status !== "actioned" && (
                    <button onClick={() => setStatus(r, "reviewing")} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Start review</button>
                  )}
                  {r.status !== "actioned" && (
                    <button onClick={() => setStatus(r, "actioned")} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Mark actioned</button>
                  )}
                  {r.status !== "dismissed" && (
                    <button onClick={() => setStatus(r, "dismissed")} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: theme.cardBorder, color: theme.text }}>Dismiss</button>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Enquiries (public-website contact / subscribe submissions) ──────────
const ENQUIRY_SOURCE_LABELS: Record<string, string> = {
  home_contact: "Website contact form",
  contact_page: "Contact page",
  subscribe: "Newsletter signup",
};
const ENQUIRY_STATUSES = ["New", "In progress", "Resolved"];

export function AdminEnquiries() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchRows = async () => {
    const { data } = await supabase.from("contact_requests").select("*").order("created_at", { ascending: false });
    if (data) setRows(data);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_requests").update({ status }).eq("id", id);
    if (error) { alert("Could not update status: " + error.message); return; }
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const statusColor = (s: string) =>
    s === "Resolved" ? { bg: "#d1fae5", text: "#065f46" }
    : s === "In progress" ? { bg: "#fef3c7", text: "#92400e" }
    : { bg: "#dbeafe", text: "#1d4ed8" };

  const visible = filter === "all" ? rows : rows.filter(r => r.status === filter);
  const newCount = rows.filter(r => r.status === "New").length;

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <H1>Enquiries</H1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Contact and subscribe submissions from the public website.{newCount > 0 ? ` ${newCount} new.` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["all", ...ENQUIRY_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1 rounded-full text-xs border"
            style={{
              borderColor: theme.divider,
              color: filter === s ? "#fff" : theme.textMuted,
              background: filter === s ? NAVY : "transparent",
            }}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: theme.textMuted }}>Loading…</p>
      ) : visible.length === 0 ? (
        <AdminCard className="p-8 text-center">
          <p className="text-sm" style={{ color: theme.textMuted }}>No enquiries yet.</p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {visible.map(r => {
            const meta = r.metadata && typeof r.metadata === "object" ? r.metadata : {};
            const metaEntries = Object.entries(meta).filter(([, v]) => v);
            const sc = statusColor(r.status);
            return (
              <AdminCard key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: theme.text }}>{r.name || "Anonymous"}</span>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs"
                        style={{ background: sc.bg, color: sc.text, fontWeight: 500 }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      {ENQUIRY_SOURCE_LABELS[r.source] || r.source}
                      {r.request_type ? ` · ${r.request_type}` : ""}
                      {" · "}
                      {new Date(r.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg border shrink-0"
                    style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }}
                  >
                    {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="mt-3 grid gap-1.5 text-sm" style={{ color: theme.text }}>
                  {r.email && <div><span style={{ color: theme.textMuted }}>Email: </span><a href={`mailto:${r.email}`} className="underline">{r.email}</a></div>}
                  {r.phone && <div><span style={{ color: theme.textMuted }}>Phone: </span>{r.phone}</div>}
                  {r.organisation && <div><span style={{ color: theme.textMuted }}>Organisation: </span>{r.organisation}</div>}
                  {r.location && <div><span style={{ color: theme.textMuted }}>Location: </span>{r.location}</div>}
                  {metaEntries.map(([k, v]) => (
                    <div key={k}><span style={{ color: theme.textMuted }}>{k}: </span>{String(v)}</div>
                  ))}
                  {r.message && (
                    <div className="mt-1 p-3 rounded-lg text-sm leading-relaxed" style={{ background: theme.bg, color: theme.text }}>
                      {r.message}
                    </div>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminEvents() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("In person");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*, event_attendees(count)').order('created_at', { ascending: false });
    if (data) {
      setRows(data.map(e => [
        e.title,
        new Date(e.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        e.type,
        e.location,
        e.event_attendees?.[0]?.count || 0,
        e.status,
        ""
      ]));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !date) return;
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      title,
      date,
      type,
      location,
      description,
      status: "Upcoming",
      created_by: user?.id,
    });
    setCreating(false);
    if (error) {
      alert("Error creating event: " + error.message);
    } else {
      setShowCreate(false);
      setTitle("");
      setDate("");
      setType("In person");
      setLocation("");
      setDescription("");
      fetchEvents();
    }
  };

  return (
    <div className="relative">
      <AdminTablePage
        title="Events"
        subtitle="Manage CiP-hosted events."
        ctaLabel="Create event"
        onCtaClick={() => setShowCreate(true)}
        columns={["Title", "Date", "Type", "Location", "Registrations", "Status", ""]}
        rows={rows}
        renderStatus={(row) => <StatusPill label={row[5] as string} />}
      />

      {showCreate && (
        <div className="absolute top-0 right-0 z-50 w-full max-w-md p-6 rounded-2xl shadow-xl border" style={{ background: theme.bg, borderColor: theme.cardBorder }}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold" style={{ color: theme.text }}>Create New Event</h2>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Event Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm p-2 rounded-lg border outline-none" style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Date & Time</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm p-2 rounded-lg border outline-none" style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Format</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full text-sm p-2 rounded-lg border outline-none" style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }}>
                <option value="In person">In person</option>
                <option value="Virtual">Virtual</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Location / Link</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full text-sm p-2 rounded-lg border outline-none" style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full text-sm p-2 rounded-lg border outline-none" style={{ background: theme.bg, borderColor: theme.cardBorder, color: theme.text }} />
            </div>
          </div>
          
          <button onClick={handleCreate} disabled={creating || !title || !date} className="w-full py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ background: GOLD, color: "#fff", fontWeight: 600 }}>
            {creating ? "Creating..." : "Save Event"}
          </button>
        </div>
      )}
    </div>
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
  title, subtitle, ctaLabel, onCtaClick, columns, rows, renderStatus,
}: {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  onCtaClick?: () => void;
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
        {ctaLabel && (
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            <Plus size={13} /> {ctaLabel}
          </button>
        )}
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

export function AdminPrivacy({ navigate }: { navigate: (s: Screen) => void }) {
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
    const { error } = await supabase.from('data_requests').update({ status: 'Processed' }).eq('id', id);
    if (error) {
      alert("Could not mark as processed: " + error.message);
      return;
    }
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
                <span className="text-sm" style={{ color: theme.text }}><MemberNameLink userId={r.user_id} name={`${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'Member'} navigate={navigate} /></span>
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
                <span className="text-sm" style={{ color: theme.text }}><MemberNameLink userId={r.user_id} name={`${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'Member'} navigate={navigate} /></span>
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
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVis, setEditVis] = useState("public");
  const [editCaveatType, setEditCaveatType] = useState("electorate");
  const [editCaveatValue, setEditCaveatValue] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editGroupType, setEditGroupType] = useState("standard");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editReligion, setEditReligion] = useState("");
  const [editPartyAffiliation, setEditPartyAffiliation] = useState("");
  const [editProfession, setEditProfession] = useState("");
  const [editChristianOrgIdentifiers, setEditChristianOrgIdentifiers] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (g: any) => {
    setShowCreate(false);
    setEditName(g.name || "");
    setEditDesc(g.description || "");
    setEditVis(g.visibility || "public");
    setEditCaveatType(g.caveat_type || "electorate");
    setEditCaveatValue(g.caveat_value || "");
    setEditImageUrl(g.image_url || "");
    setEditGroupType(g.group_type || "standard");
    setEditWebsiteUrl(g.website_url || "");
    setEditLocation(g.location || "");
    setEditReligion(g.religion || "");
    setEditPartyAffiliation(g.party_affiliation || "");
    setEditProfession(g.profession || "");
    setEditChristianOrgIdentifiers(g.christian_org_identifiers || "");
    setShowEdit(g.id);
    document.getElementById('admin-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      setUploadingImage(true);
      const { error: uploadError } = await supabase.storage.from('group_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('group_images').getPublicUrl(fileName);
      setEditImageUrl(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    if (!user || !showEdit) return;
    // Allow empty name to be fixed rather than silently failing if it was empty in DB
    const finalName = editName.trim() || "Unnamed Group";
    
    setSavingEdit(true);
    const updatePayload: any = {
      name: finalName,
      description: editDesc,
      visibility: editVis,
      caveat_type: editVis === "restricted" ? editCaveatType : null,
      caveat_value: editVis === "restricted" ? editCaveatValue : null,
      image_url: editImageUrl
    };
    
    if (editGroupType === "organisation") {
      updatePayload.website_url = editWebsiteUrl;
      updatePayload.location = editLocation;
      updatePayload.religion = editReligion;
      updatePayload.party_affiliation = editPartyAffiliation;
      updatePayload.profession = editProfession;
      updatePayload.christian_org_identifiers = editChristianOrgIdentifiers;
    }

    const { error } = await supabase.from('groups').update(updatePayload).eq("id", showEdit);
    setSavingEdit(false);
    
    if (error) {
      alert("Failed to update group: " + error.message);
    } else {
      setShowEdit(null);
      loadGroups();
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      setUploadingImage(true);
      
      const { error: uploadError } = await supabase.storage
        .from('group_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('group_images').getPublicUrl(fileName);
      setNewImageUrl(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };
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
      image_url: newImageUrl,
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
      setNewImageUrl("");
      setShowCreate(false);
      loadGroups();
    }
  };

  const handleGroupAction = async (id: string, action: "suspend" | "unsuspend" | "delete") => {
    let error: any = null;
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this group? This cannot be easily undone.")) return;
      ({ error } = await supabase.from("groups").update({ deleted_at: new Date().toISOString() }).eq("id", id));
    } else if (action === "suspend") {
      if (!confirm("Suspend this group? It will no longer appear in member feeds.")) return;
      ({ error } = await supabase.from("groups").update({ suspended_at: new Date().toISOString() }).eq("id", id));
    } else if (action === "unsuspend") {
      ({ error } = await supabase.from("groups").update({ suspended_at: null }).eq("id", id));
    }
    if (error) {
      alert("Action failed: " + error.message);
      return;
    }
    setGroups(groups.map(g => {
      if (g.id === id) {
        return {
          ...g,
          suspended_at: action === "suspend" ? new Date().toISOString() : action === "unsuspend" ? null : g.suspended_at,
          deleted_at: action === "delete" ? new Date().toISOString() : g.deleted_at
        };
      }
      return g;
    }));
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
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium block" style={{ color: theme.text }}>Group Image (Optional)</label>
              <div className="flex items-center gap-4">
                {newImageUrl ? (
                  <img src={newImageUrl} alt="Group Preview" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: NAVY }}>
                    {newName ? newName.split(" ").map(w => w[0] || "").slice(0, 2).join("") : "Img"}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" id="adminGroupImageUpload" className="hidden" onChange={uploadImage} disabled={uploadingImage} />
                  <label htmlFor="adminGroupImageUpload" className="cursor-pointer px-4 py-2 text-sm rounded-lg border inline-block" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                    {uploadingImage ? "Uploading..." : "Upload image"}
                  </label>
                </div>
              </div>
            </div>
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
                    onChange={e => {
                      const type = e.target.value;
                      setNewCaveatType(type);
                      if (type === "party") setNewCaveatValue(PARTIES[0]);
                      else if (type === "tradition") setNewCaveatValue(TRADITIONS[0]);
                      else setNewCaveatValue("");
                    }}
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
                  {newCaveatType === "party" ? (
                    <select
                      value={newCaveatValue || PARTIES[0]}
                      onChange={e => setNewCaveatValue(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none"
                      style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
                    >
                      {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : newCaveatType === "tradition" ? (
                    <select
                      value={newCaveatValue || TRADITIONS[0]}
                      onChange={e => setNewCaveatValue(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none"
                      style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
                    >
                      {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <AutocompleteInput 
                      value={newCaveatValue} 
                      onChange={setNewCaveatValue} 
                      options={FEDERAL_ELECTORATES} 
                      placeholder="e.g. Bennelong" 
                    />
                  )}
                </div>
              </>
            )}
            <button 
              onClick={handleCreate} disabled={creating || !newName.trim() || (newVis === "restricted" && !newCaveatValue.trim())}
              className="w-full py-2 rounded-lg text-sm disabled:opacity-50"
              style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
            >
              {creating ? "Creating..." : "Save Group"}
            </button>
          </div>
        </AdminCard>
      )}

      {showEdit && (
        <AdminCard className="p-5 mb-5 border border-dashed border-gray-300 relative">
          <button onClick={() => setShowEdit(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"><X size={16}/></button>
          <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Edit Group</h3>
          <div className="space-y-4 max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium block" style={{ color: theme.text }}>Group Image (Optional)</label>
              <div className="flex items-center gap-4">
                {editImageUrl ? (
                  <img src={editImageUrl} alt="Group Preview" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: NAVY }}>
                    {editName ? editName.split(" ").map(w => w[0] || "").slice(0, 2).join("") : "Img"}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" id="adminGroupImageUploadEdit" className="hidden" onChange={uploadEditImage} disabled={uploadingImage} />
                  <label htmlFor="adminGroupImageUploadEdit" className="cursor-pointer px-4 py-2 text-sm rounded-lg border inline-block" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                    {uploadingImage ? "Uploading..." : "Upload image"}
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Group Name</label>
              <input 
                value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Description</label>
              <textarea 
                value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: theme.inputBorder, background: theme.inputBg, color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Visibility</label>
              <select 
                value={editVis} 
                onChange={e => setEditVis(e.target.value)}
                className="w-full text-sm p-2 rounded-lg outline-none"
                style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="restricted">Restricted (Curated)</option>
              </select>
            </div>
            {editVis === "restricted" && (
              <div className="p-3 rounded-lg border bg-gray-50 space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Caveat Type</label>
                  <select 
                    value={editCaveatType} 
                    onChange={e => setEditCaveatType(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg outline-none bg-white border"
                  >
                    <option value="electorate">Same Federal Electorate</option>
                    <option value="party">Same Political Party</option>
                    <option value="tradition">Same Christian Tradition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.text }}>Caveat Value</label>
                  {editCaveatType === "party" ? (
                    <select
                      value={editCaveatValue}
                      onChange={e => setEditCaveatValue(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none bg-white border"
                    >
                      <option value="">Select a party...</option>
                      {PARTIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : editCaveatType === "tradition" ? (
                    <select
                      value={editCaveatValue}
                      onChange={e => setEditCaveatValue(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none bg-white border"
                    >
                      <option value="">Select a tradition...</option>
                      {TRADITIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <AutocompleteInput
                      options={FEDERAL_ELECTORATES}
                      value={editCaveatValue}
                      onChange={setEditCaveatValue}
                      placeholder="Start typing electorate..."
                    />
                  )}
                </div>
              </div>
            )}

            {editGroupType === "organisation" && (
              <div className="p-4 rounded-lg border bg-gray-50 space-y-4">
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>Organisation Details</h4>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Website URL</label>
                  <input 
                    value={editWebsiteUrl} onChange={e => setEditWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Location</label>
                  <input 
                    value={editLocation} onChange={e => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Religion Filter</label>
                    <select
                      value={editReligion} onChange={e => setEditReligion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                    >
                      <option value="">Any</option>
                      {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Party Filter</label>
                    <select
                      value={editPartyAffiliation} onChange={e => setEditPartyAffiliation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                    >
                      <option value="">Any</option>
                      {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Profession</label>
                    <input 
                      value={editProfession} onChange={e => setEditProfession(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: theme.text }}>Identifiers</label>
                    <input 
                      value={editChristianOrgIdentifiers} onChange={e => setEditChristianOrgIdentifiers(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleUpdate} disabled={savingEdit || (editVis === "restricted" && (!editCaveatValue || !editCaveatValue.trim()))}
              className="w-full py-2 rounded-lg text-sm disabled:opacity-50 mt-2"
              style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
            >
              {savingEdit ? "Saving..." : "Update Group"}
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
              <th className="text-left px-5 py-3 text-xs" style={{ color: theme.textMuted, fontWeight: 500, background: theme.tableHead }}>Status</th>
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
                    <div className="flex items-center gap-3">
                      {g.image_url ? (
                        <img src={g.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: NAVY }}>
                          {(g.name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div style={{ color: theme.text, fontWeight: 500 }}>{g.name}</div>
                        <div className="text-xs mt-0.5 truncate max-w-sm" style={{ color: theme.textMuted }}>{g.description || "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>
                    <span className="capitalize">{g.visibility}</span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={g.deleted_at ? "Deleted" : g.suspended_at ? "Suspended" : "Active"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(g)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                        <Edit3 size={11} /> Edit
                      </button>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-1.5 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="bg-white rounded-lg shadow-xl p-1 z-50 border border-gray-100 text-sm min-w-[160px]" align="end">
                            {g.deleted_at ? (
                              <DropdownMenu.Item className="px-3 py-2 cursor-not-allowed outline-none rounded text-gray-400" disabled>Group Deleted</DropdownMenu.Item>
                            ) : (
                              <>
                                {g.suspended_at ? (
                                  <DropdownMenu.Item className="px-3 py-2 cursor-pointer hover:bg-gray-50 outline-none rounded" onClick={() => handleGroupAction(g.id, "unsuspend")}>Unsuspend Group</DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item className="px-3 py-2 cursor-pointer hover:bg-gray-50 outline-none rounded" onClick={() => handleGroupAction(g.id, "suspend")}>Suspend Group</DropdownMenu.Item>
                                )}
                                <DropdownMenu.Item className="px-3 py-2 cursor-pointer text-red-600 hover:bg-red-50 outline-none rounded" onClick={() => handleGroupAction(g.id, "delete")}>Delete Group</DropdownMenu.Item>
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
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