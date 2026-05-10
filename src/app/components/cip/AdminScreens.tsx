import { ReactNode } from "react";
import {
  LayoutDashboard, Users, LifeBuoy, CalendarDays, BookOpen, Megaphone,
  Building2, Heart, Lock, Settings, Bell, Search, Plus, Edit3, Eye,
  TrendingUp, ChevronDown,
} from "lucide-react";
import { CiPLogo, NAVY, GOLD, MUTED_BLUE } from "./brand";
import { Screen } from "./types";

const ADMIN_ITEMS: { key: Screen; label: string; icon: any }[] = [
  { key: "admin-overview", label: "Overview", icon: LayoutDashboard },
  { key: "admin-members", label: "Members", icon: Users },
  { key: "admin-support", label: "Support Requests", icon: LifeBuoy },
  { key: "admin-events", label: "Events", icon: CalendarDays },
  { key: "admin-resources", label: "Resources", icon: BookOpen },
  { key: "admin-announcements", label: "Announcements", icon: Megaphone },
  { key: "admin-affiliated", label: "Affiliated Groups", icon: Building2 },
  { key: "admin-donations", label: "Donations", icon: Heart },
  { key: "admin-privacy", label: "Privacy / Data Requests", icon: Lock },
];

export function AdminShell({
  current,
  navigate,
  exitAdmin,
  children,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  exitAdmin: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-gray-50">
      <aside className="w-64 shrink-0 flex flex-col" style={{ background: "#0a1f3a", color: "#fff" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <CiPLogo light />
          <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px]" style={{ background: GOLD, color: NAVY, fontWeight: 600 }}>
            ADMIN
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {ADMIN_ITEMS.map((it) => {
            const Icon = it.icon;
            const active = current === it.key;
            return (
              <button
                key={it.key}
                onClick={() => navigate(it.key)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left"
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
          <button
            onClick={() => navigate("admin-overview")}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={exitAdmin} className="text-xs text-white/70 hover:text-white">
            ← Back to member view
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center gap-4 border-b bg-white shrink-0">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search members, requests, events…" className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none bg-gray-100" />
          </div>
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell size={18} style={{ color: NAVY }} />
          </button>
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: GOLD, color: NAVY, fontWeight: 600 }}>AD</div>
            <ChevronDown size={14} style={{ color: NAVY }} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

function H1({ children }: { children: ReactNode }) {
  return <h1 style={{ color: NAVY, fontWeight: 600 }}>{children}</h1>;
}
function Card({ children, className = "" }: any) {
  return <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>{children}</div>;
}
function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ background: MUTED_BLUE, color: NAVY }}>{children}</span>;
}

/* ---------- Overview ---------- */
export function AdminOverview() {
  const stats = [
    { l: "New members (30d)", v: "82", d: "+18%" },
    { l: "Completed onboarding", v: "61", d: "+12%" },
    { l: "Affirmed Nicene Creed", v: "94%", d: "" },
    { l: "Interested in joining a party", v: "143", d: "" },
    { l: "Already in parties", v: "207", d: "" },
    { l: "Support requests submitted", v: "39", d: "" },
    { l: "Awaiting action", v: "11", d: "urgent" },
    { l: "Event registrations (30d)", v: "412", d: "" },
    { l: "Resource opens (30d)", v: "1,284", d: "" },
    { l: "Donate clicks (30d)", v: "57", d: "" },
  ];
  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <H1>Admin overview</H1>
        <div className="text-sm text-gray-500">Last updated 2 mins ago</div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.l}>
            <div className="text-xs text-gray-500">{s.l}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div style={{ color: NAVY, fontSize: 24, fontWeight: 600 }}>{s.v}</div>
              {s.d && (
                <span className="text-xs" style={{ color: s.d === "urgent" ? "#a93030" : "#0b8a3d" }}>
                  {s.d !== "urgent" && <TrendingUp size={12} className="inline mr-0.5" />}
                  {s.d}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-6">
        <Card>
          <h3 style={{ color: NAVY }}>Support queue snapshot</h3>
          <div className="mt-4 space-y-2">
            {[
              ["Connect to local branch (Sydney)", "In review", "High"],
              ["Help me choose a party", "Awaiting member", "Medium"],
              ["Mentor others", "Submitted", "Low"],
            ].map(([t, s, u], i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <div className="text-sm" style={{ color: NAVY }}>{t}</div>
                <div className="flex gap-2 items-center">
                  <Pill>{s}</Pill>
                  <span className="text-xs text-gray-500">{u}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ color: NAVY }}>Recent member sign-ups</h3>
          <div className="mt-4 space-y-2 text-sm">
            {["S. Reed (NSW)", "M. Abadi (VIC)", "J. Patel (QLD)", "A. McLeod (WA)", "L. Tran (NSW)"].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                <span style={{ color: NAVY }}>{m}</span>
                <span className="text-xs text-gray-500">{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Members ---------- */
export function AdminMembers() {
  const rows = [
    { n: "Sarah Reed", e: "sarah@example.com", st: "NSW", eng: "Interested in joining", party: "Not sure", needs: "Branch intro", status: "Active" },
    { n: "Mark Abadi", e: "mark@example.com", st: "VIC", eng: "Active in branch", party: "Liberal", needs: "Mentoring", status: "Active" },
    { n: "Jess Patel", e: "jess@example.com", st: "QLD", eng: "Public servant", party: "Prefer not to say", needs: "Resources", status: "Active" },
    { n: "Andrew McLeod", e: "andrew@example.com", st: "WA", eng: "Just curious", party: "Not sure", needs: "Pathways", status: "Onboarding" },
    { n: "Lucy Tran", e: "lucy@example.com", st: "NSW", eng: "Campaign volunteer", party: "ALP", needs: "Candidate selection info", status: "Active" },
  ];
  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <H1>Members</H1>
        <button className="px-4 py-2 rounded-md text-sm border" style={{ borderColor: NAVY, color: NAVY }}>Export (admin only)</button>
      </div>
      <Card className="mb-4">
        <div className="flex flex-wrap gap-2">
          {["All states", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((s) => (
            <button key={s} className="px-3 py-1 rounded-full text-xs border border-gray-300" style={{ color: NAVY }}>{s}</button>
          ))}
          <span className="mx-2 text-gray-300">|</span>
          {["Engagement", "Party interest", "Support needs"].map((s) => (
            <button key={s} className="px-3 py-1 rounded-full text-xs border border-gray-300" style={{ color: NAVY }}>{s} ▾</button>
          ))}
        </div>
      </Card>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#faf7f0", color: NAVY }}>
            <tr>
              {["Member", "State", "Engagement", "Party", "Needs", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div style={{ color: NAVY, fontWeight: 500 }}>{r.n}</div>
                  <div className="text-xs text-gray-500">{r.e}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{r.st}</td>
                <td className="px-4 py-3 text-gray-700">{r.eng}</td>
                <td className="px-4 py-3 text-gray-700">{r.party}</td>
                <td className="px-4 py-3 text-gray-700">{r.needs}</td>
                <td className="px-4 py-3"><Pill>{r.status}</Pill></td>
                <td className="px-4 py-3 text-right">
                  <button className="px-2 py-1 rounded-md hover:bg-gray-100" style={{ color: NAVY }}><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- Support queue ---------- */
export function AdminSupport({ navigate }: { navigate: (s: Screen) => void }) {
  const rows = [
    { t: "Connect to local branch", n: "Sarah Reed", st: "NSW", p: "Not sure", u: "High", a: "M. Andrews", s: "In review", d: "2h" },
    { t: "Help me choose a party", n: "Lucy Tran", st: "NSW", p: "—", u: "Medium", a: "Unassigned", s: "Submitted", d: "4h" },
    { t: "Mentor others", n: "Mark Abadi", st: "VIC", p: "Liberal", u: "Low", a: "J. Carter", s: "Matched", d: "1d" },
    { t: "Connect to advocacy group", n: "Jess Patel", st: "QLD", p: "—", u: "Medium", a: "Unassigned", s: "Submitted", d: "1d" },
  ];
  return (
    <div className="max-w-7xl">
      <H1>Support requests</H1>
      <p className="text-sm text-gray-600 mt-1">Triage, assign and track member support requests.</p>
      <Card className="!p-0 overflow-hidden mt-5">
        <table className="w-full text-sm">
          <thead style={{ background: "#faf7f0", color: NAVY }}>
            <tr>
              {["Request", "Member", "State", "Party/Pathway", "Urgency", "Assigned", "Status", "Updated", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3" style={{ color: NAVY, fontWeight: 500 }}>{r.t}</td>
                <td className="px-4 py-3">{r.n}</td>
                <td className="px-4 py-3">{r.st}</td>
                <td className="px-4 py-3">{r.p}</td>
                <td className="px-4 py-3">{r.u}</td>
                <td className="px-4 py-3">{r.a}</td>
                <td className="px-4 py-3"><Pill>{r.s}</Pill></td>
                <td className="px-4 py-3 text-gray-500">{r.d} ago</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => navigate("admin-support-detail")} className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminSupportDetail({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-5xl">
      <button onClick={() => navigate("admin-support")} className="text-sm mb-3" style={{ color: NAVY }}>← Back to queue</button>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Card>
            <Pill>In review</Pill>
            <h2 className="mt-2" style={{ color: NAVY }}>Connect to local branch (Sydney)</h2>
            <div className="text-sm text-gray-600 mt-1">Submitted 2 hours ago by Sarah Reed (NSW)</div>
            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <div><div className="text-gray-500">Request type</div><div style={{ color: NAVY }}>Connect me to a local branch</div></div>
              <div><div className="text-gray-500">Pathway interest</div><div style={{ color: NAVY }}>Joining a party</div></div>
              <div><div className="text-gray-500">Party guidance attached</div><div style={{ color: NAVY }}>Yes</div></div>
              <div><div className="text-gray-500">Consent to contact</div><div style={{ color: NAVY }}>Granted</div></div>
            </div>
            <div className="mt-5">
              <div className="text-gray-500 text-sm">Description</div>
              <div className="text-sm mt-1" style={{ color: NAVY }}>
                "I'd love to attend a Sydney branch meeting but don't know anyone. Could someone introduce me?"
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ color: NAVY }}>Admin notes</h3>
            <textarea rows={4} placeholder="Internal notes (not visible to member)…" className="w-full mt-2 px-3 py-2 rounded-md border outline-none border-gray-200 bg-gray-50" />
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>Save note</button>
              <button className="px-3 py-2 rounded-md text-sm border" style={{ borderColor: NAVY, color: NAVY }}>Record introduction made</button>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <h3 style={{ color: NAVY }}>Member summary</h3>
            <div className="mt-3 text-sm space-y-1.5">
              <div><span className="text-gray-500">Name:</span> Sarah Reed</div>
              <div><span className="text-gray-500">State:</span> NSW</div>
              <div><span className="text-gray-500">Tradition:</span> Anglican</div>
              <div><span className="text-gray-500">Engagement:</span> Interested in joining a party</div>
              <div><span className="text-gray-500">Affirmed Creed:</span> Yes</div>
            </div>
          </Card>
          <Card>
            <h3 style={{ color: NAVY }}>Actions</h3>
            <div className="space-y-2 mt-3">
              <select className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50">
                <option>Assign to admin…</option>
                <option>Mick Andrews</option>
                <option>Jess Carter</option>
              </select>
              <select className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50">
                <option>Update status…</option>
                <option>Submitted</option>
                <option>In review</option>
                <option>Awaiting member response</option>
                <option>Matched / introduced</option>
                <option>Closed</option>
              </select>
              <button className="w-full px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>Send message to member</button>
              <button className="w-full px-3 py-2 rounded-md text-sm border" style={{ borderColor: "#a93030", color: "#a93030" }}>Close request</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Generic admin list pages ---------- */
function AdminList({ title, columns, rows, ctaLabel }: { title: string; columns: string[]; rows: any[][]; ctaLabel: string }) {
  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <H1>{title}</H1>
        <button className="px-4 py-2 rounded-md text-sm inline-flex items-center gap-2" style={{ background: NAVY, color: "#fff" }}>
          <Plus size={14} /> {ctaLabel}
        </button>
      </div>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#faf7f0", color: NAVY }}>
            <tr>
              {columns.map((c) => <th key={c} className="text-left px-4 py-3 font-medium">{c}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                {r.map((cell, j) => (
                  <td key={j} className="px-4 py-3" style={{ color: j === 0 ? NAVY : undefined, fontWeight: j === 0 ? 500 : undefined }}>
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button className="text-sm inline-flex items-center gap-1" style={{ color: NAVY }}><Edit3 size={14} /> Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminEvents() {
  return (
    <AdminList
      title="Events"
      ctaLabel="Create event"
      columns={["Title", "Date", "Type", "Location", "Registrations", "Status"]}
      rows={[
        ["Faithful Politics with Tim Costello", "27 May", "Public lecture", "Online", "184", <Pill key="a">Published</Pill>],
        ["Sydney Members Prayer", "31 May", "Prayer", "Sydney CBD", "26", <Pill key="b">Published</Pill>],
        ["Public Service Pathway Briefing", "10 Jun", "Training", "Online", "92", <Pill key="c">Published</Pill>],
        ["Brisbane Members Dinner", "13 Jun", "Fellowship", "Brisbane", "12", <Pill key="d">Draft</Pill>],
      ]}
    />
  );
}

export function AdminResources() {
  return (
    <AdminList
      title="Resources"
      ctaLabel="Add resource"
      columns={["Title", "Type", "Category", "Author/Provider", "Featured"]}
      rows={[
        ["Politics — A Case for Christian Engagement", "Book", "Christian formation", "John Anderson", <Pill key="a">Featured</Pill>],
        ["How to Join a Political Party", "Article", "Political literacy", "CiP Guide", "—"],
        ["Faithfulness in Public Life", "Bible study", "Christian formation", "CiP", "—"],
        ["Candidate Selection 101", "Course", "Candidate selection", "CiP", <Pill key="b">Featured</Pill>],
      ]}
    />
  );
}

export function AdminAnnouncements() {
  return (
    <AdminList
      title="Announcements"
      ctaLabel="Compose announcement"
      columns={["Title", "Category", "CTA", "Status", "Posted"]}
      rows={[
        ["Liberal pre-selection nominations open in QLD", "Opportunity", "Express interest", <Pill key="a">Published</Pill>, "2d"],
        ["Summer policy internship", "Internship", "Read more", <Pill key="b">Published</Pill>, "5d"],
        ["Public Service briefing", "Training", "Register", <Pill key="c">Scheduled</Pill>, "—"],
        ["National prayer gathering", "Prayer", "Register", <Pill key="d">Published</Pill>, "1w"],
      ]}
    />
  );
}

export function AdminAffiliated() {
  return (
    <AdminList
      title="Affiliated groups"
      ctaLabel="Add organisation"
      columns={["Organisation", "Category", "POC", "POC type", "Status"]}
      rows={[
        ["Freedom for Faith", "Advocacy group", "Mike Southon", "CiP member", <Pill key="a">Approved</Pill>],
        ["Rebuild Australia", "Training / mobilisation", "Jane Watson", "External", <Pill key="b">Approved</Pill>],
        ["Christians for Labor", "Political network", "David Anderson", "CiP member", <Pill key="c">Approved</Pill>],
      ]}
    />
  );
}

export function AdminDonations() {
  return (
    <div className="max-w-7xl">
      <H1>Donations</H1>
      <p className="text-sm text-gray-600 mt-1">Donation processing will be connected to FairPay.</p>
      <div className="grid grid-cols-4 gap-4 mt-5">
        {[
          ["Donate clicks (30d)", "57"],
          ["External redirects", "57"],
          ["FairPay status", "Pending integration"],
          ["Active donate URL", "fairpay.cip.org.au"],
        ].map(([l, v]) => (
          <Card key={l}>
            <div className="text-xs text-gray-500">{l}</div>
            <div style={{ color: NAVY, fontSize: 22, fontWeight: 600 }} className="mt-1">{v}</div>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <h3 style={{ color: NAVY }}>External donation URL</h3>
        <p className="text-sm text-gray-600 mt-1">At launch, the Donate button redirects to an external provider URL.</p>
        <div className="flex gap-2 mt-3">
          <input defaultValue="https://fairpay.cip.org.au/donate" className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm" />
          <button className="px-4 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>Save</button>
        </div>
      </Card>
    </div>
  );
}

export function AdminPrivacy() {
  return (
    <div className="max-w-6xl">
      <H1>Privacy / data requests</H1>
      <p className="text-sm text-gray-600 mt-1">Audit deletion requests, data exports and consent withdrawals.</p>
      <div className="grid grid-cols-2 gap-5 mt-5">
        <Card>
          <h3 style={{ color: NAVY }}>Deletion requests</h3>
          <div className="mt-3 space-y-2 text-sm">
            {[["A. Smith (NSW)", "1d ago"], ["P. Lin (VIC)", "3d ago"]].map(([n, t], i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span style={{ color: NAVY }}>{n}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t}</span>
                  <button className="px-3 py-1 rounded-md text-xs border" style={{ borderColor: NAVY, color: NAVY }}>Review</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ color: NAVY }}>Data export requests</h3>
          <div className="mt-3 space-y-2 text-sm">
            {[["S. Reed (NSW)", "5h ago"]].map(([n, t], i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span style={{ color: NAVY }}>{n}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t}</span>
                  <button className="px-3 py-1 rounded-md text-xs border" style={{ borderColor: NAVY, color: NAVY }}>Process</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="col-span-2">
          <h3 style={{ color: NAVY }}>Consent withdrawals & admin access audit</h3>
          <table className="w-full text-sm mt-3">
            <thead style={{ color: NAVY }}>
              <tr><th className="text-left py-2">Member</th><th className="text-left py-2">Action</th><th className="text-left py-2">When</th><th className="text-left py-2">Admin</th></tr>
            </thead>
            <tbody>
              {[
                ["L. Tran", "Withdrew intro consent", "2d ago", "—"],
                ["M. Abadi", "Profile viewed", "1d ago", "M. Andrews"],
                ["J. Patel", "Internal note added", "1d ago", "J. Carter"],
              ].map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {r.map((c, j) => <td key={j} className="py-2 text-gray-700">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
