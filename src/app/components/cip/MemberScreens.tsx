import { useState, ReactNode } from "react";
import { Screen } from "./types";
import { NAVY, GOLD, useTheme } from "./brand";
import {
  CalendarDays, Clock, MapPin, Lock, ShieldCheck, Users,
  ChevronRight, ExternalLink, Heart, Sun, Moon, Eye, EyeOff,
  Pin, MessageCircle, ThumbsUp, Send, MoreHorizontal, X,
  FileText, Shield, AlertTriangle, UserPlus, Image as ImageIcon,
  Link2, Globe, CheckCircle2, Circle, Briefcase, Flag, Church,
  Plus, LifeBuoy, ArrowRight, Search, Filter,
} from "lucide-react";

// ── Shared primitives ─────────────────────────────────────────────────
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
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

function Pill({ children, color, fg }: { children: ReactNode; color?: string; fg?: string }) {
  const { theme } = useTheme();
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs"
      style={{ background: color ?? theme.pillBg, color: fg ?? NAVY, fontWeight: 500 }}
    >
      {children}
    </span>
  );
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs"
      style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, full }: { children: ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs ${full ? "w-full" : ""}`}
      style={{ background: NAVY, color: "#fff", fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

function GoldButton({ children, onClick, full }: { children: ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs ${full ? "w-full" : ""}`}
      style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Home feed (admin controlled) ─────────────────────────────────────
const FEED_TYPE_COLORS: Record<string, string> = {
  Announcement: "#ede9fe",
  Event:        "#dbeafe",
  Resource:     "#d1fae5",
  Opportunity:  "#fef3c7",
  Reflection:   "#fce7f3",
  Support:      "#fde8d8",
  Donate:       "#f5e6c8",
};

const FEED_ITEMS: {
  type: string; title: string; body: string; cta: string; date: string; image?: boolean; cta2?: string;
}[] = [
  {
    type: "Announcement",
    title: "Liberal pre-selection nominations open in QLD",
    body: "Nominations close 14 June. CiP can connect interested members with current branch members for a private conversation before you decide.",
    cta: "Express interest",
    date: "2 days ago",
  },
  {
    type: "Event",
    title: "Faithful Politics: An evening with Tim Costello",
    body: "A wide-ranging conversation about discipleship in public life. Q&A included. Wed 27 May · 7:00 PM AEST · Online.",
    cta: "Register",
    date: "3 days ago",
    image: true,
  },
  {
    type: "Reflection",
    title: "On disagreeing well: a short reflection from our chair",
    body: "Public life is increasingly polarised. How do we hold convictions while loving those who hold different ones? A 4-minute read.",
    cta: "Read more",
    date: "5 days ago",
  },
  {
    type: "Resource",
    title: "New: Branch meetings — an inside look",
    body: "What to expect at your first branch meeting, how to prepare, and how to make the most of it. 8-min video.",
    cta: "View resource",
    date: "1 week ago",
  },
  {
    type: "Support",
    title: "Considering standing for council? Talk to us first.",
    body: "Local government is a meaningful entry point. Our team can walk you through what's involved and connect you with someone who's done it.",
    cta: "Request support",
    date: "1 week ago",
  },
  {
    type: "Opportunity",
    title: "Summer policy internship — Federal Senator's office",
    body: "Six-week policy internship for current students. Christian applicants encouraged to apply.",
    cta: "Read more",
    date: "1 week ago",
  },
  {
    type: "Donate",
    title: "Help us reach more young Christians considering public service",
    body: "Your support funds the mentoring conversations, training events and pastoral care that quietly shape Australia's next generation of public servants.",
    cta: "Donate",
    date: "2 weeks ago",
  },
];

function FeedPost({ item, navigate }: { item: typeof FEED_ITEMS[number]; navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <Card className="overflow-hidden">
      {item.image && (
        <div
          className="h-44 w-full"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a6b 60%, ${GOLD})` }}
        />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            CiP
          </div>
          <div className="text-xs" style={{ color: theme.text, fontWeight: 600 }}>
            Christians in Politics
          </div>
          <span className="text-xs" style={{ color: theme.textSubtle }}>·</span>
          <span className="text-xs" style={{ color: theme.textSubtle }}>{item.date}</span>
          <div className="ml-auto">
            <Pill color={FEED_TYPE_COLORS[item.type]}>{item.type}</Pill>
          </div>
        </div>
        <h3 className="text-base" style={{ color: theme.text, fontWeight: 600 }}>
          {item.title}
        </h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
          {item.body}
        </p>
        <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
          <PrimaryButton onClick={() => {
            if (item.cta === "Register") navigate("event-detail");
            else if (item.cta === "Donate") navigate("donate");
          }}>
            {item.cta}
          </PrimaryButton>
          <span className="text-[11px] ml-auto inline-flex items-center gap-1" style={{ color: theme.textSubtle }}>
            <Lock size={10} /> Posted by CiP · No public comments
          </span>
        </div>
      </div>
    </Card>
  );
}

export function Dashboard({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      {/* Read-only composer */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            SR
          </div>
          <div
            className="flex-1 px-4 py-2.5 rounded-full text-sm"
            style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}
          >
            <Lock size={11} className="inline mr-2" />
            The Home feed is curated by CiP. Join a group to participate in discussion.
          </div>
        </div>
      </Card>

      {FEED_ITEMS.map((item, i) => (
        <FeedPost key={i} item={item} navigate={navigate} />
      ))}
    </div>
  );
}

// ── Profile (read-only) ──────────────────────────────────────────────
const PROFILE_ACTIVITY = [
  { type: "Event", title: "Registered: Faithful Politics with Tim Costello", date: "3 days ago" },
  { type: "Resource", title: "Saved: Branch meetings — an inside look", date: "1 week ago" },
  { type: "Support", title: "Open request: Connect to a local branch", date: "2 weeks ago" },
  { type: "Group", title: "Joined: NSW Politics & Prayer (anonymous)", date: "3 weeks ago" },
];

const PARTIES = [
  "No affiliation", "Independent", "Australian Labor Party", "Liberal Party of Australia",
  "The Nationals", "Australian Greens", "One Nation", "Family First",
  "Australian Christians", "Other",
];

const STATES = [
  "Australian Capital Territory", "New South Wales", "Northern Territory",
  "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
];

const TRADITIONS = [
  "Anglican", "Baptist", "Catholic", "Churches of Christ",
  "Eastern Orthodox", "Lutheran", "Pentecostal / Charismatic",
  "Presbyterian / Reformed", "Salvation Army", "Seventh-day Adventist",
  "Uniting Church", "Independent / Non-denominational",
  "Other recognised Christian tradition",
];

interface ProfileData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  bio: string;
  state: string;
  federalElectorate: string;
  stateElectorate: string;
  party: string;
  tradition: string;
  showParty: boolean;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: "Sarah",
  lastName: "Reed",
  jobTitle: "Policy Adviser",
  bio: "Anglican lay leader exploring how to participate faithfully in political life. Currently learning, listening and praying about state-level engagement in NSW.",
  state: "New South Wales",
  federalElectorate: "Bennelong",
  stateElectorate: "Ryde",
  party: "No affiliation",
  tradition: "Anglican",
  showParty: false,
};

function FormField({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="text-xs block" style={{ color: theme.text, fontWeight: 600 }}>{label}</label>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>{hint}</div>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { theme } = useTheme();
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg outline-none text-sm"
      style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const { theme } = useTheme();
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg outline-none text-sm appearance-none"
        style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: theme.textMuted }} />
    </div>
  );
}

function ProfileMetaRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="mt-0.5 shrink-0" style={{ color: theme.textMuted }} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px]" style={{ color: theme.textSubtle }}>{label}</div>
        <div className="text-sm" style={{ color: theme.text }}>{value}</div>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);

  const startEdit = () => { setDraft(profile); setEditing(true); };
  const save = () => { setProfile(draft); setEditing(false); };
  const cancel = () => setEditing(false);

  const initials = (profile.firstName[0] ?? "") + (profile.lastName[0] ?? "");

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-32" style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a6b 60%, ${GOLD})` }} />
        <div className="px-6 pb-5 -mt-12">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl"
            style={{ background: NAVY, border: `4px solid ${theme.cardBg}`, fontWeight: 600 }}
          >
            {initials}
          </div>
          <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 style={{ color: theme.text }}>{profile.firstName} {profile.lastName}</h1>
              {profile.jobTitle && (
                <p className="text-sm mt-0.5" style={{ color: theme.textMuted, fontWeight: 500 }}>
                  {profile.jobTitle}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Pill color={theme.pillBg}><MapPin size={10} /> {profile.state}</Pill>
                <Pill color="#ede9fe"><Church size={10} /> {profile.tradition}</Pill>
                {profile.showParty && (
                  <Pill color="#fef3c7" fg="#92400e"><Flag size={10} /> {profile.party}</Pill>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: theme.textSubtle }}>
                <Lock size={11} /> Privacy-first profile · Visible only to CiP and where you reveal in groups
              </div>
            </div>
            {!editing && <GhostButton onClick={startEdit}>Edit profile</GhostButton>}
          </div>
        </div>
      </Card>

      {editing ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Edit profile</h3>
            <span className="text-[11px]" style={{ color: theme.textSubtle }}>
              <Lock size={10} className="inline mr-1" />
              You control what's shared, per group
            </span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <FormField label="First name">
              <TextInput value={draft.firstName} onChange={(v) => setDraft({ ...draft, firstName: v })} />
            </FormField>
            <FormField label="Last name">
              <TextInput value={draft.lastName} onChange={(v) => setDraft({ ...draft, lastName: v })} />
            </FormField>
            <FormField label="Job title or secondary title" hint="Shown under your name. Optional.">
              <TextInput value={draft.jobTitle} onChange={(v) => setDraft({ ...draft, jobTitle: v })} placeholder="e.g. Policy Adviser, Lay leader" />
            </FormField>
            <FormField label="State / territory">
              <SelectInput value={draft.state} onChange={(v) => setDraft({ ...draft, state: v })} options={STATES} />
            </FormField>
            <FormField label="Federal electorate" hint="Optional. Used only for electorate-based groups.">
              <TextInput value={draft.federalElectorate} onChange={(v) => setDraft({ ...draft, federalElectorate: v })} placeholder="e.g. Bennelong" />
            </FormField>
            <FormField label="State electorate" hint="Optional.">
              <TextInput value={draft.stateElectorate} onChange={(v) => setDraft({ ...draft, stateElectorate: v })} placeholder="e.g. Ryde" />
            </FormField>
            <FormField label="Political party affiliation" hint='Pick "No affiliation" if you prefer.'>
              <SelectInput value={draft.party} onChange={(v) => setDraft({ ...draft, party: v })} options={PARTIES} />
            </FormField>
            <FormField label="Christian tradition" hint="Set during sign-up. You can refine here.">
              <SelectInput value={draft.tradition} onChange={(v) => setDraft({ ...draft, tradition: v })} options={TRADITIONS} />
            </FormField>
          </div>

          <FormField label="Short bio" hint="A line or two about you. Optional.">
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            />
          </FormField>

          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: theme.text }}>
            <input
              type="checkbox"
              checked={draft.showParty}
              onChange={(e) => setDraft({ ...draft, showParty: e.target.checked })}
            />
            <span>Show my political party affiliation on my profile header</span>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={save}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
            >
              Save changes
            </button>
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
            >
              Cancel
            </button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-5">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>About</h3>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
              {profile.bio}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm mb-4" style={{ color: theme.text, fontWeight: 600 }}>Profile details</h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <ProfileMetaRow icon={Briefcase} label="Title"             value={profile.jobTitle || "—"} />
              <ProfileMetaRow icon={MapPin}    label="State"             value={profile.state} />
              <ProfileMetaRow icon={MapPin}    label="Federal electorate" value={profile.federalElectorate || "—"} />
              <ProfileMetaRow icon={MapPin}    label="State electorate"  value={profile.stateElectorate || "—"} />
              <ProfileMetaRow icon={Flag}      label="Political party"   value={profile.party} />
              <ProfileMetaRow icon={Church}    label="Christian tradition" value={profile.tradition} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Your activity</h3>
              <span className="text-[11px]" style={{ color: theme.textSubtle }}>
                <Lock size={10} className="inline mr-1" />
                Personal posting is not enabled in v1
              </span>
            </div>
            <div className="space-y-3">
              {PROFILE_ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${theme.divider}` }}
                >
                  <div className="shrink-0">
                    <Pill color={FEED_TYPE_COLORS[a.type] ?? "#f3f4f6"}>{a.type}</Pill>
                  </div>
                  <div className="flex-1 text-sm" style={{ color: theme.text }}>{a.title}</div>
                  <div className="text-xs" style={{ color: theme.textSubtle }}>{a.date}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Groups discovery ─────────────────────────────────────────────────
const ALL_GROUPS = [
  { id: "nsw-pp", name: "NSW Politics & Prayer", desc: "Monthly prayer and political reflection for NSW members.", members: 142, joined: true, visibility: "anonymous" },
  { id: "syd-civic", name: "Sydney Civic Faith Circle", desc: "Sydney-based group focused on local government and council engagement.", members: 87, joined: true, visibility: "visible" },
  { id: "young-cip", name: "Young CiP", desc: "Members under 35 finding their feet in politics and public life.", members: 213, joined: true, visibility: "anonymous" },
  { id: "vic-pp", name: "VIC Politics & Prayer", desc: "Victorian counterpart to NSW Politics & Prayer.", members: 96, joined: false, visibility: null },
  { id: "rural-cf", name: "Rural Christians in Politics", desc: "Members from regional and rural Australia.", members: 54, joined: false, visibility: null },
  { id: "qld-pp", name: "QLD Politics & Prayer", desc: "Queensland prayer and policy discussion group.", members: 118, joined: false, visibility: null },
  { id: "policy-women", name: "Christian Women in Public Policy", desc: "A supportive space for women considering or already serving in public roles.", members: 71, joined: false, visibility: null },
];

function GroupCard({ g, navigate }: { g: typeof ALL_GROUPS[number]; navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
          style={{ background: theme.pillBg, color: NAVY, fontWeight: 700 }}
        >
          {g.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("group-detail")}
              className="text-sm hover:underline text-left"
              style={{ color: theme.text, fontWeight: 600 }}
            >
              {g.name}
            </button>
            {g.joined && g.visibility === "anonymous" && (
              <Pill color="#f3f4f6" fg="#6b7280"><Lock size={10} /> Anonymous</Pill>
            )}
            {g.joined && g.visibility === "visible" && (
              <Pill color="#d1fae5" fg="#065f46"><Eye size={10} /> Visible</Pill>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMuted }}>
            {g.desc}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: theme.textSubtle }}>{g.members} members</span>
            {g.joined ? (
              <GhostButton onClick={() => navigate("group-detail")}>Open</GhostButton>
            ) : (
              <PrimaryButton onClick={() => navigate("group-detail")}>Join</PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Mock network used by the Create Group invite step
const MY_NETWORK = [
  { id: "n1", name: "Hannah K.",  title: "Local government candidate" },
  { id: "n2", name: "Daniel S.",  title: "Lay preacher · Policy nerd" },
  { id: "n3", name: "Priya M.",   title: "Researcher · Young CiP" },
  { id: "n4", name: "James P.",   title: "Education policy" },
  { id: "n5", name: "Margaret O.", title: "Christian Women in Public Policy" },
  { id: "n6", name: "Andrew T.",  title: "Anglican lay leader" },
];

type GroupVisibility = "public" | "private" | "restricted";
type Caveat = "electorate" | "party" | "tradition";

const CAVEAT_OPTIONS: { id: Caveat; label: string; hint: string; icon: any }[] = [
  { id: "electorate", label: "Same federal electorate", hint: "Members must list the same federal electorate as the group's electorate.", icon: MapPin },
  { id: "party",      label: "Same political party",   hint: "Members must list the same political party affiliation.", icon: Flag },
  { id: "tradition",  label: "Same Christian tradition", hint: "Members must share the same Christian tradition.", icon: Church },
];

function CreateGroupModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const { theme } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [vis, setVis] = useState<GroupVisibility>("private");
  const [caveat, setCaveat] = useState<Caveat>("electorate");
  const [caveatValue, setCaveatValue] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const toggleInvite = (id: string) => setInvited({ ...invited, [id]: !invited[id] });
  const invitedCount = Object.values(invited).filter(Boolean).length;
  const canNext1 = name.trim().length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <div>
            <h3 style={{ color: theme.text, fontWeight: 600 }}>Create a group</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: theme.textSubtle }}>
              <span style={{ color: step >= 1 ? NAVY : theme.textSubtle, fontWeight: step === 1 ? 600 : 400 }}>1. Basics</span>
              <ChevronRight size={11} />
              <span style={{ color: step >= 2 ? NAVY : theme.textSubtle, fontWeight: step === 2 ? 600 : 400 }}>2. Who can join</span>
              <ChevronRight size={11} />
              <span style={{ color: step >= 3 ? NAVY : theme.textSubtle, fontWeight: step === 3 ? 600 : 400 }}>3. Invite</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={16} style={{ color: theme.textMuted }} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <FormField label="Group name">
                <TextInput value={name} onChange={setName} placeholder="e.g. Bennelong Christians in Politics" />
              </FormField>
              <FormField label="Short description" hint="What is this group about? Members will see this on the discover page.">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Monthly prayer and discussion for Christians in the Bennelong electorate."
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
                />
              </FormField>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {([
                { v: "public",     label: "Public",     hint: "Any CiP member can find and join this group.",                   icon: Globe },
                { v: "private",    label: "Private",    hint: "Invite-only. Only people you invite from your network can join.", icon: Lock },
                { v: "restricted", label: "Restricted", hint: "Public to CiP members who match a specific criterion (caveat).",  icon: ShieldCheck },
              ] as const).map((opt) => {
                const I = opt.icon;
                const active = vis === opt.v;
                return (
                  <button
                    key={opt.v}
                    onClick={() => setVis(opt.v)}
                    className="w-full text-left rounded-xl px-4 py-3 flex items-start gap-3 transition-colors"
                    style={{
                      background: active ? "#f0f7ff" : theme.bg,
                      border: `1px solid ${active ? "#bfdbfe" : theme.cardBorder}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: active ? NAVY : theme.pillBg, color: active ? "#fff" : NAVY }}
                    >
                      <I size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{opt.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{opt.hint}</div>
                    </div>
                  </button>
                );
              })}

              {vis === "restricted" && (
                <div
                  className="mt-2 rounded-xl p-4 space-y-3"
                  style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}` }}
                >
                  <div className="text-xs" style={{ color: theme.text, fontWeight: 600 }}>
                    Caveat — only members who match can join
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    {CAVEAT_OPTIONS.map((c) => {
                      const I = c.icon;
                      const active = caveat === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCaveat(c.id)}
                          className="text-left rounded-lg px-3 py-2.5"
                          style={{
                            background: active ? "#fff" : theme.cardBg,
                            border: `1px solid ${active ? NAVY : theme.cardBorder}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <I size={12} style={{ color: NAVY }} />
                            <span className="text-xs" style={{ color: theme.text, fontWeight: 600 }}>{c.label}</span>
                          </div>
                          <div className="text-[11px] mt-1 leading-snug" style={{ color: theme.textMuted }}>{c.hint}</div>
                        </button>
                      );
                    })}
                  </div>
                  <FormField
                    label={
                      caveat === "electorate" ? "Federal electorate" :
                      caveat === "party"      ? "Political party" :
                                                "Christian tradition"
                    }
                  >
                    {caveat === "party" ? (
                      <SelectInput value={caveatValue || PARTIES[0]} onChange={setCaveatValue} options={PARTIES} />
                    ) : caveat === "tradition" ? (
                      <SelectInput value={caveatValue || TRADITIONS[0]} onChange={setCaveatValue} options={TRADITIONS} />
                    ) : (
                      <TextInput value={caveatValue} onChange={setCaveatValue} placeholder="e.g. Bennelong" />
                    )}
                  </FormField>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                {vis === "private"
                  ? "Invite people from your network. They'll receive an invitation to join."
                  : "Invite a few people from your network to seed the group. You can invite more later."}
              </div>
              <div className="mt-3 rounded-xl divide-y" style={{ border: `1px solid ${theme.cardBorder}`, borderColor: theme.divider }}>
                {MY_NETWORK.map((p) => {
                  const checked = !!invited[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleInvite(p.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                      style={{ borderBottom: `1px solid ${theme.divider}`, background: checked ? "#f0f7ff" : "transparent" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs"
                        style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                      >
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{p.name}</div>
                        <div className="text-[11px]" style={{ color: theme.textSubtle }}>{p.title}</div>
                      </div>
                      <div
                        className="w-5 h-5 rounded shrink-0 flex items-center justify-center"
                        style={{ background: checked ? NAVY : "#fff", border: `1px solid ${checked ? NAVY : theme.cardBorder}` }}
                      >
                        {checked && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-xs" style={{ color: theme.textSubtle }}>
                {invitedCount} {invitedCount === 1 ? "person" : "people"} selected
              </div>
            </div>
          )}
        </div>

        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${theme.divider}` }}
        >
          <button
            onClick={() => (step === 1 ? onClose() : setStep((step - 1) as 1 | 2))}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={step === 1 && !canNext1}
              className="px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
              style={{
                background: step === 1 && !canNext1 ? theme.cardBorder : NAVY,
                color: step === 1 && !canNext1 ? theme.textMuted : "#fff",
                fontWeight: 600,
              }}
            >
              Continue <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={() => onCreate(name)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
            >
              Create group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function GroupsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<"joined" | "discover" | "yours">("joined");
  const [createOpen, setCreateOpen] = useState(false);

  const list =
    tab === "joined"   ? ALL_GROUPS.filter((g) => g.joined) :
    tab === "discover" ? ALL_GROUPS.filter((g) => !g.joined) :
                         []; // groups created by current user (none yet in mock)

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: theme.text }}>Groups</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Join existing groups, or start your own — public to all CiP members, private and invite-only,
              or restricted to people who share your electorate, party or tradition.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5 shrink-0"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            <Plus size={14} /> Create group
          </button>
        </div>
        <div className="mt-4 flex gap-1 p-1 rounded-lg w-fit" style={{ background: theme.bg }}>
          {([
            ["joined", "Your groups"],
            ["discover", "Discover"],
            ["yours", "Created by you"],
          ] as const).map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-md text-xs"
              style={{
                background: tab === t ? theme.cardBg : "transparent",
                color: tab === t ? theme.text : theme.textMuted,
                fontWeight: tab === t ? 600 : 400,
                border: tab === t ? `1px solid ${theme.cardBorder}` : "1px solid transparent",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </Card>

      {list.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {list.map((g) => <GroupCard key={g.id} g={g} navigate={navigate} />)}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ background: theme.pillBg }}
          >
            <Users size={20} style={{ color: NAVY }} />
          </div>
          <h3 className="mt-3 text-sm" style={{ color: theme.text, fontWeight: 600 }}>
            You haven't created any groups yet
          </h3>
          <p className="text-xs mt-1.5 max-w-sm mx-auto" style={{ color: theme.textMuted }}>
            Start a group around your electorate, party, tradition or any shared CiP interest.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            <Plus size={13} /> Create your first group
          </button>
        </Card>
      )}

      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreate={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

// ── Group detail ─────────────────────────────────────────────────────
const GROUP_POSTS = [
  {
    pinned: true,
    author: "Group moderator",
    avatar: "GM",
    role: "Moderator",
    date: "Pinned",
    body: "Welcome to NSW Politics & Prayer. Please read the group rules below before posting. We pray together on the first Tuesday of each month at 7pm.",
    likes: 18, comments: 4,
  },
  {
    author: "Daniel S.",
    avatar: "DS",
    role: "Visible member",
    date: "Yesterday",
    body: "Sharing a thoughtful piece on the Voice referendum aftermath and how Christian voters reflected on the outcome. Worth a slow read this weekend.",
    link: "https://example.org/article",
    likes: 12, comments: 6,
  },
  {
    author: "Hannah K.",
    avatar: "HK",
    role: "Visible member",
    date: "3 days ago",
    body: "Anyone else attending the State Council meeting next week? Would be good to compare notes afterwards. Happy to host a coffee debrief.",
    likes: 7, comments: 9,
  },
];

const GROUP_MEMBERS = [
  { id: "1", name: "Daniel S.", bio: "Lay preacher, policy nerd. NSW.", state: "NSW", connected: false },
  { id: "2", name: "Hannah K.", bio: "Local government candidate, mum of three.", state: "NSW", connected: true },
  { id: "3", name: "James P.", bio: "Anglican, working in education policy.", state: "NSW", connected: false },
  { id: "4", name: "Priya M.", bio: "Considering pre-selection. Listening for now.", state: "NSW", connected: false },
];

function RevealModal({ onClose, onReveal }: { onClose: () => void; onReveal: () => void }) {
  const { theme } = useTheme();
  const [opts, setOpts] = useState({
    firstName: true, fullName: false, photo: true, state: false,
    bio: true, party: false, church: false,
  });
  const toggle = (k: keyof typeof opts) => setOpts({ ...opts, [k]: !opts[k] });

  const Row = ({ k, label, hint }: { k: keyof typeof opts; label: string; hint?: string }) => (
    <button
      onClick={() => toggle(k)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
      style={{ background: opts[k] ? "#f0f7ff" : theme.bg, border: `1px solid ${opts[k] ? "#bfdbfe" : theme.cardBorder}` }}
    >
      <div
        className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
        style={{ background: opts[k] ? NAVY : "#fff", border: `1px solid ${opts[k] ? NAVY : theme.cardBorder}` }}
      >
        {opts[k] && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <div className="flex-1">
        <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{label}</div>
        {hint && <div className="text-[11px]" style={{ color: theme.textSubtle }}>{hint}</div>}
      </div>
    </button>
  );

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: GOLD }}
          >
            <ShieldCheck size={16} style={{ color: NAVY }} />
          </div>
          <div className="flex-1">
            <h3 style={{ color: theme.text, fontWeight: 600 }}>Reveal your profile to this group?</h3>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: theme.textMuted }}>
              You can choose to become visible to members of this group. This will allow others
              in the group to see your selected profile details and interact with your posts and
              comments. You can change your visibility later.
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Row k="firstName" label="Show first name only" />
          <Row k="fullName"  label="Show full name" />
          <Row k="photo"     label="Show profile photo" />
          <Row k="state"     label="Show state / territory" />
          <Row k="bio"       label="Show short bio" />
          <Row k="party"     label="Show political party interest" hint="Optional · off by default" />
          <Row k="church"    label="Show church tradition" hint="Optional · off by default" />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            Stay anonymous
          </button>
          <button
            onClick={onReveal}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            Reveal my profile
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ConnectModal({ name, onClose, onSend }: { name: string; onClose: () => void; onSend: () => void }) {
  const { theme } = useTheme();
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 style={{ color: theme.text, fontWeight: 600 }}>Send connection request?</h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
          You can send a connection request to <strong style={{ color: theme.text }}>{name}</strong> because
          you are both visible in this group. Direct messaging will only become available if they accept.
        </p>
        <label className="block mt-4 text-xs" style={{ color: theme.text, fontWeight: 500 }}>
          Optional short message
        </label>
        <textarea
          rows={3}
          placeholder="Hi, I noticed your post on local council engagement…"
          className="w-full mt-1 px-3 py-2 rounded-lg outline-none text-sm"
          style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
        />
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            Send request
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function GroupDetailScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [connectName, setConnectName] = useState<string | null>(null);
  const [tab, setTab] = useState<"feed" | "members" | "events" | "resources" | "about">("feed");

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-28" style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a6b)` }} />
        <div className="px-5 pb-4 -mt-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-3">
              <div
                className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center"
                style={{ background: GOLD, color: NAVY, fontWeight: 700, fontSize: 22, border: `4px solid ${theme.cardBg}` }}
              >
                NP
              </div>
              <div className="pb-1">
                <h1 style={{ color: theme.text }}>NSW Politics & Prayer</h1>
                <div className="flex items-center gap-3 text-xs mt-1" style={{ color: theme.textMuted }}>
                  <span className="inline-flex items-center gap-1"><Users size={12} /> 142 members</span>
                  <span className="inline-flex items-center gap-1"><Globe size={12} /> Private group</span>
                  <span className="inline-flex items-center gap-1"><Shield size={12} /> Moderated</span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate("groups")} className="text-xs hover:underline" style={{ color: NAVY }}>
              ← All groups
            </button>
          </div>

          {/* Privacy status bar */}
          <div
            className="mt-4 rounded-xl p-3 flex items-center gap-3 flex-wrap"
            style={{ background: visible ? "#ecfdf5" : "#fff7ed", border: `1px solid ${visible ? "#a7f3d0" : "#fed7aa"}` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: visible ? "#10b981" : "#f59e0b" }}
            >
              {visible ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs" style={{ color: visible ? "#065f46" : "#92400e", fontWeight: 600 }}>
                {visible ? "Visible in this group" : "Watching anonymously"}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: visible ? "#047857" : "#b45309" }}>
                {visible
                  ? "Other group members can see your selected profile details and interact with your posts."
                  : "You are currently watching anonymously. Other members cannot see that you are in this group."}
              </div>
            </div>
            {visible ? (
              <GhostButton onClick={() => setVisible(false)}>Hide my profile</GhostButton>
            ) : (
              <GoldButton onClick={() => setRevealOpen(true)}>Reveal my profile to this group</GoldButton>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            {([
              ["feed", "Feed"],
              ["members", "Members"],
              ["events", "Events"],
              ["resources", "Resources"],
              ["about", "About"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="px-4 py-2.5 text-xs whitespace-nowrap"
                style={{
                  color: tab === k ? NAVY : theme.textMuted,
                  fontWeight: tab === k ? 600 : 400,
                  borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {tab === "feed" && (
        <div className="space-y-4">
          {/* Composer */}
          <Card className="p-4">
            {visible ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs"
                    style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                  >
                    SR
                  </div>
                  <input
                    placeholder="Share something with the group…"
                    className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                    style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${theme.divider}` }}>
                  <GhostButton><ImageIcon size={12} className="inline mr-1" /> Image</GhostButton>
                  <GhostButton><Link2 size={12} className="inline mr-1" /> Link</GhostButton>
                  <div className="ml-auto"><PrimaryButton>Post</PrimaryButton></div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: theme.bg, border: `1px dashed ${theme.cardBorder}` }}
              >
                <Lock size={14} style={{ color: theme.textMuted }} />
                <div className="text-xs flex-1" style={{ color: theme.textMuted }}>
                  You're watching anonymously. Reveal your profile to post, comment or react.
                </div>
                <GhostButton onClick={() => setRevealOpen(true)}>Reveal</GhostButton>
              </div>
            )}
          </Card>

          {GROUP_POSTS.map((p, i) => (
            <Card key={i} className="p-5">
              {p.pinned && (
                <div className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: GOLD, fontWeight: 600 }}>
                  <Pin size={12} /> Pinned by moderator
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs"
                  style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
                >
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{p.author}</span>
                    <span className="text-xs" style={{ color: theme.textSubtle }}>· {p.role} · {p.date}</span>
                  </div>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.text }}>{p.body}</p>
                  {p.link && (
                    <a
                      className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                      style={{ color: NAVY }}
                    >
                      <Link2 size={11} /> {p.link}
                    </a>
                  )}
                  <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.divider}` }}>
                    <button className="text-xs inline-flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                      <ThumbsUp size={12} /> {p.likes}
                    </button>
                    <button className="text-xs inline-flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                      <MessageCircle size={12} /> {p.comments} comments
                    </button>
                    {!visible && (
                      <span className="text-[11px] ml-auto inline-flex items-center gap-1" style={{ color: theme.textSubtle }}>
                        <Lock size={10} /> Reveal to react or comment
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "members" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>
              Visible members ({GROUP_MEMBERS.length})
            </h3>
            <span className="text-[11px]" style={{ color: theme.textSubtle }}>
              <Lock size={10} className="inline mr-1" />
              Anonymous members aren't shown here
            </span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {GROUP_MEMBERS.map((m) => (
              <div
                key={m.id}
                className="rounded-xl p-3"
                style={{ border: `1px solid ${theme.cardBorder}`, background: theme.bg }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs"
                    style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                  >
                    {m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>{m.name}</div>
                    <div className="text-[11px]" style={{ color: theme.textSubtle }}>{m.state}</div>
                  </div>
                </div>
                <p className="text-xs mt-2 leading-snug" style={{ color: theme.textMuted }}>{m.bio}</p>
                <div className="mt-3">
                  {m.connected ? (
                    <Pill color="#d1fae5" fg="#065f46">Connected</Pill>
                  ) : (
                    <button
                      onClick={() => setConnectName(m.name)}
                      disabled={!visible}
                      className="text-xs px-3 py-1.5 rounded-lg w-full inline-flex items-center justify-center gap-1.5"
                      style={{
                        background: visible ? NAVY : theme.cardBorder,
                        color: visible ? "#fff" : theme.textMuted,
                        fontWeight: 500,
                        cursor: visible ? "pointer" : "not-allowed",
                      }}
                    >
                      <UserPlus size={11} /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!visible && (
            <div
              className="mt-4 px-3 py-2.5 rounded-lg text-xs flex items-center gap-2"
              style={{ background: "#fff7ed", color: "#92400e", border: "1px solid #fed7aa" }}
            >
              <Lock size={12} /> Reveal your profile to connect with members.
            </div>
          )}
        </Card>
      )}

      {tab === "events" && (
        <Card className="p-5">
          <h3 className="text-sm mb-3" style={{ color: theme.text, fontWeight: 600 }}>Group events</h3>
          <div className="space-y-3">
            {[
              { title: "Monthly prayer meeting", date: "Tue 3 Jun · 7:00 PM", loc: "Online" },
              { title: "Sydney coffee + civic chat", date: "Sat 14 Jun · 10:00 AM", loc: "Surry Hills" },
            ].map((e) => (
              <div key={e.title} className="flex items-center gap-3 py-2" style={{ borderBottom: `1px solid ${theme.divider}` }}>
                <CalendarDays size={16} style={{ color: GOLD }} />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{e.title}</div>
                  <div className="text-xs" style={{ color: theme.textMuted }}>{e.date} · {e.loc}</div>
                </div>
                <GhostButton>RSVP</GhostButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "resources" && (
        <Card className="p-5">
          <h3 className="text-sm mb-3" style={{ color: theme.text, fontWeight: 600 }}>Group resources</h3>
          <div className="space-y-3">
            {[
              { title: "How to attend a state branch meeting", kind: "Guide" },
              { title: "Praying for elected officials", kind: "Liturgy" },
              { title: "What pre-selection actually involves", kind: "Video" },
            ].map((r) => (
              <div key={r.title} className="flex items-center gap-3 py-2" style={{ borderBottom: `1px solid ${theme.divider}` }}>
                <FileText size={16} style={{ color: theme.textMuted }} />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{r.title}</div>
                  <div className="text-xs" style={{ color: theme.textMuted }}>{r.kind}</div>
                </div>
                <GhostButton>Open</GhostButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "about" && (
        <Card className="p-5">
          <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>About this group</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
            NSW Politics & Prayer is a private group for NSW members to pray for our state, share
            reflections on current political issues, and support one another in faithful public life.
          </p>
          <h4 className="text-xs mt-5 uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>
            Group rules
          </h4>
          <ol className="mt-2 space-y-1.5 text-sm list-decimal pl-5" style={{ color: theme.text }}>
            <li>Speak with charity. Disagree without contempt.</li>
            <li>No partisan campaigning. Reflection and discussion only.</li>
            <li>Respect anonymous members. Never try to identify them.</li>
            <li>Keep group conversations inside the group.</li>
            <li>Report concerns to the moderators or CiP staff.</li>
          </ol>
          <h4 className="text-xs mt-5 uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>
            Moderators
          </h4>
          <div className="mt-2 text-sm" style={{ color: theme.text }}>Andrew T. · Bethany W.</div>
        </Card>
      )}

      {revealOpen && (
        <RevealModal onClose={() => setRevealOpen(false)} onReveal={() => { setVisible(true); setRevealOpen(false); }} />
      )}
      {connectName && (
        <ConnectModal name={connectName} onClose={() => setConnectName(null)} onSend={() => setConnectName(null)} />
      )}
    </div>
  );
}

// ── Events ───────────────────────────────────────────────────────────
const EVENTS = [
  { id: "e1", title: "National Prayer Breakfast", date: "Tue 19 May · 7:30 AM", loc: "Canberra", kind: "In person" },
  { id: "e2", title: "NSW Members Briefing", date: "Thu 28 May · 7:00 PM", loc: "Online", kind: "Online" },
  { id: "e3", title: "Faith & Public Life Forum", date: "Sat 6 Jun · 10:00 AM", loc: "Sydney", kind: "In person" },
  { id: "e4", title: "Faithful Politics with Tim Costello", date: "Wed 27 May · 7:00 PM", loc: "Online", kind: "Online" },
  { id: "e5", title: "Young CiP gathering", date: "Fri 11 Jul · 6:30 PM", loc: "Melbourne", kind: "In person" },
];

export function EventsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 style={{ color: theme.text }}>Events</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          CiP gatherings, prayer meetings and civic forums. Open to all members.
        </p>
      </Card>
      <Card>
        <div className="divide-y" style={{ borderColor: theme.divider }}>
          {EVENTS.map((e, i) => (
            <button
              key={e.id}
              onClick={() => navigate("event-detail")}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${theme.divider}` }}
            >
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex flex-col items-center justify-center"
                style={{ background: theme.pillBg, color: NAVY }}
              >
                <CalendarDays size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{e.title}</div>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: theme.textMuted }}>
                  <span className="inline-flex items-center gap-1"><Clock size={11} /> {e.date}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.loc}</span>
                </div>
              </div>
              <Pill color={e.kind === "Online" ? "#dbeafe" : "#fef3c7"}>{e.kind}</Pill>
              <ChevronRight size={14} style={{ color: theme.textSubtle }} />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EventDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <button onClick={() => navigate("events")} className="text-xs hover:underline" style={{ color: NAVY }}>
        ← All events
      </button>
      <Card className="overflow-hidden">
        <div className="h-44" style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a6b 60%, ${GOLD})` }} />
        <div className="p-6">
          <Pill color="#dbeafe">Online · Free</Pill>
          <h1 className="mt-3" style={{ color: theme.text }}>Faithful Politics with Tim Costello</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm" style={{ color: theme.textMuted }}>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> Wed 27 May · 7:00 PM AEST</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> Online (Zoom)</span>
            <span className="inline-flex items-center gap-1.5"><Users size={14} /> 132 registered</span>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: theme.text }}>
            Join us for a wide-ranging conversation with Tim Costello about discipleship, public life
            and how Christian values shape engagement with politics in Australia today. Q&A included.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <GoldButton>Register</GoldButton>
            <GhostButton>Add to calendar</GhostButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Messages ─────────────────────────────────────────────────────────
const CONNECTIONS = [
  { id: "1", name: "Hannah K.", group: "NSW Politics & Prayer", last: "Thanks Sarah, that's really helpful — talk soon.", time: "2h", unread: 0, active: true },
  { id: "2", name: "Daniel S.", group: "NSW Politics & Prayer", last: "Yes I'll send through the article tonight.", time: "1d", unread: 2, active: false },
  { id: "3", name: "Priya M.", group: "Young CiP", last: "Would love to hear how you found pre-selection.", time: "3d", unread: 0, active: false },
];

const PENDING_RECEIVED = [
  { id: "p1", name: "James P.", group: "NSW Politics & Prayer", message: "Hi Sarah, would value connecting given your council work." },
];

const PENDING_SENT = [
  { id: "s1", name: "Margaret O.", group: "Christian Women in Public Policy" },
];

const THREAD = [
  { from: "them", body: "Hi Sarah, glad we connected. I noticed your comment on the council post — really thoughtful.", time: "Yesterday" },
  { from: "me",   body: "Thanks Hannah, appreciated yours too. Are you going to the next state meeting?", time: "Yesterday" },
  { from: "them", body: "Planning to. Want to grab coffee beforehand?", time: "Yesterday" },
  { from: "me",   body: "Yes please — let's lock something in.", time: "2h" },
  { from: "them", body: "Thanks Sarah, that's really helpful — talk soon.", time: "2h" },
];

export function MessagesScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<"messages" | "received" | "sent" | "blocked">("messages");
  const [active, setActive] = useState(CONNECTIONS[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredConnections = CONNECTIONS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.last.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col" style={{ background: theme.bg }}>
      {/* Page header strip */}
      <div
        className="px-8 py-5 shrink-0"
        style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.divider}` }}
      >
        <h1 style={{ color: theme.text }}>Messaging</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Direct messaging is only available between members who've accepted a connection request through a shared group.
        </p>
      </div>

      {/* Two-pane messenger */}
      <div className="flex-1 min-h-0 px-8 py-6">
        <div
          className="h-full rounded-2xl overflow-hidden flex"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          {/* Left pane */}
          <div
            className="w-[340px] shrink-0 flex flex-col min-h-0"
            style={{ borderRight: `1px solid ${theme.divider}` }}
          >
            {/* List header */}
            <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${theme.divider}` }}>
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>
                  Conversations
                </div>
                <button className="p-1.5 rounded-md hover:bg-gray-100" title="More options">
                  <MoreHorizontal size={16} style={{ color: theme.textMuted }} />
                </button>
              </div>

              <div className="relative mt-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages"
                  className="w-full pl-3 pr-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
                />
              </div>

              <div className="flex gap-1 mt-3">
                {([
                  ["messages", "Inbox"],
                  ["received", `Requests${PENDING_RECEIVED.length ? ` · ${PENDING_RECEIVED.length}` : ""}`],
                  ["sent", "Sent"],
                  ["blocked", "Blocked"],
                ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap"
                    style={{
                      background: tab === k ? NAVY : "transparent",
                      color: tab === k ? "#fff" : theme.textMuted,
                      border: `1px solid ${tab === k ? NAVY : theme.cardBorder}`,
                      fontWeight: tab === k ? 600 : 500,
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* List body */}
            <div className="flex-1 overflow-y-auto">
              {tab === "messages" && filteredConnections.map((c) => {
                const isActive = active.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(c)}
                    className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors"
                    style={{
                      background: isActive ? theme.bg : "transparent",
                      borderBottom: `1px solid ${theme.divider}`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="text-sm truncate"
                          style={{ color: theme.text, fontWeight: c.unread > 0 ? 700 : 600 }}
                        >
                          {c.name}
                        </div>
                        <div className="text-[10px] ml-auto shrink-0" style={{ color: theme.textSubtle }}>
                          {c.time}
                        </div>
                      </div>
                      <div className="text-[11px] truncate" style={{ color: theme.textSubtle }}>
                        via {c.group}
                      </div>
                      <div
                        className="text-xs mt-1 truncate"
                        style={{ color: c.unread > 0 ? theme.text : theme.textMuted, fontWeight: c.unread > 0 ? 500 : 400 }}
                      >
                        {c.last}
                      </div>
                    </div>
                    {c.unread > 0 && (
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: GOLD }}
                      />
                    )}
                  </button>
                );
              })}

              {tab === "messages" && filteredConnections.length === 0 && (
                <div className="p-8 text-center text-xs" style={{ color: theme.textSubtle }}>
                  No conversations match your search.
                </div>
              )}

              {tab === "received" && PENDING_RECEIVED.map((p) => (
                <div key={p.id} className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.divider}` }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{p.name}</div>
                      <div className="text-[11px]" style={{ color: theme.textSubtle }}>via {p.group}</div>
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
                        {p.message}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <PrimaryButton>Accept</PrimaryButton>
                        <GhostButton>Decline</GhostButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tab === "sent" && PENDING_SENT.map((p) => (
                <div key={p.id} className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.divider}` }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{p.name}</div>
                      <div className="text-[11px]" style={{ color: theme.textSubtle }}>via {p.group}</div>
                      <div className="mt-2">
                        <Pill color="#fef3c7" fg="#92400e">Request sent</Pill>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tab === "blocked" && (
                <div className="p-10 text-center text-xs" style={{ color: theme.textSubtle }}>
                  You haven't blocked anyone.
                </div>
              )}
            </div>
          </div>

          {/* Right pane: thread */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {tab === "messages" ? (
              <>
                {/* Thread header */}
                <div
                  className="px-6 py-4 flex items-center gap-3 shrink-0 relative"
                  style={{ borderBottom: `1px solid ${theme.divider}` }}
                >
                  <div
                    className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm"
                    style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                  >
                    {active.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base" style={{ color: theme.text, fontWeight: 600 }}>
                      {active.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                      Connected through <span style={{ fontWeight: 500 }}>{active.group}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <MoreHorizontal size={18} style={{ color: theme.textMuted }} />
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-6 top-16 w-56 rounded-xl shadow-xl z-10 overflow-hidden"
                      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    >
                      {[
                        { l: "Report conversation", icon: AlertTriangle },
                        { l: "Block member", icon: X },
                        { l: "Remove connection", icon: UserPlus },
                      ].map((it) => {
                        const I = it.icon;
                        return (
                          <button
                            key={it.l}
                            onClick={() => setMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-gray-50"
                            style={{ color: theme.text }}
                          >
                            <I size={13} style={{ color: theme.textMuted }} />
                            {it.l}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Safety banner */}
                <div
                  className="px-6 py-2.5 text-[11px] flex items-start gap-2 shrink-0"
                  style={{ background: "#fff7ed", color: "#92400e", borderBottom: `1px solid ${theme.divider}` }}
                >
                  <Shield size={12} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">
                    CiP connections are intended for encouragement, support and faithful participation in
                    public life. Please communicate with charity and respect.
                  </span>
                </div>

                {/* Thread body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
                  <div className="text-center text-[11px]" style={{ color: theme.textSubtle }}>
                    Yesterday
                  </div>
                  {THREAD.map((m, i) => {
                    const mine = m.from === "me";
                    return (
                      <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
                        {!mine && (
                          <div
                            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] mt-auto"
                            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                          >
                            {active.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </div>
                        )}
                        <div className="max-w-[60%]">
                          <div
                            className="rounded-2xl px-4 py-2.5"
                            style={{
                              background: mine ? NAVY : theme.bg,
                              color: mine ? "#fff" : theme.text,
                              border: mine ? "none" : `1px solid ${theme.cardBorder}`,
                              borderBottomRightRadius: mine ? 4 : 16,
                              borderBottomLeftRadius: mine ? 16 : 4,
                            }}
                          >
                            <div className="text-sm leading-relaxed">{m.body}</div>
                          </div>
                          <div
                            className={`text-[10px] mt-1 px-1 ${mine ? "text-right" : "text-left"}`}
                            style={{ color: theme.textSubtle }}
                          >
                            {m.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <div className="px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${theme.divider}` }}>
                  <div
                    className="flex items-end gap-2 rounded-2xl px-3 py-2"
                    style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}` }}
                  >
                    <textarea
                      rows={1}
                      placeholder="Write a message…"
                      className="flex-1 px-2 py-1.5 text-sm outline-none resize-none bg-transparent"
                      style={{ color: theme.text, minHeight: 32, maxHeight: 120 }}
                    />
                    <button
                      className="p-2 rounded-md hover:bg-gray-200/50"
                      title="Add link"
                    >
                      <Link2 size={15} style={{ color: theme.textMuted }} />
                    </button>
                    <button
                      className="px-4 py-1.5 rounded-lg text-sm inline-flex items-center gap-1.5"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      <Send size={13} /> Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: theme.pillBg }}
                >
                  <MessageCircle size={22} style={{ color: NAVY }} />
                </div>
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>
                  {tab === "received" && "Connection requests"}
                  {tab === "sent" && "Pending sent requests"}
                  {tab === "blocked" && "Blocked members"}
                </div>
                <p className="text-xs mt-2 max-w-xs" style={{ color: theme.textMuted }}>
                  Select an item from the list on the left to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Donate ───────────────────────────────────────────────────────────
export function DonateScreen() {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <Card className="p-8 text-center">
        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ background: GOLD }}
        >
          <Heart size={20} style={{ color: NAVY }} />
        </div>
        <h1 className="mt-4" style={{ color: theme.text }}>Support CiP</h1>
        <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed" style={{ color: theme.textMuted }}>
          Your gift funds the mentoring conversations, training events and pastoral care that
          quietly shape Australia's next generation of faithful public servants.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {["$25", "$50", "$100", "$250", "Other"].map((a) => (
            <button
              key={a}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
            >
              {a}
            </button>
          ))}
        </div>
        <button
          className="mt-6 px-6 py-3 rounded-xl inline-flex items-center gap-2"
          style={{ background: GOLD, color: NAVY, fontWeight: 600 }}
        >
          Continue to donation page <ExternalLink size={14} />
        </button>
      </Card>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────
export function SettingsScreen() {
  const { theme, dark, toggle } = useTheme();
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 style={{ color: theme.text }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Account, notifications and appearance.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Appearance</h3>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
            {dark ? <Moon size={14} /> : <Sun size={14} />} Dark mode
          </div>
          <button
            onClick={toggle}
            className="w-11 h-6 rounded-full relative transition-colors"
            style={{ background: dark ? GOLD : "#d1d5db" }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
              style={{ left: dark ? 22 : 2 }}
            />
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Notifications</h3>
        <div className="space-y-3 mt-3">
          {[
            "CiP announcements and events",
            "Group activity in groups I've joined",
            "New connection requests",
            "Direct messages",
            "Donation reminders",
          ].map((label, i) => (
            <div key={i} className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
              <span>{label}</span>
              <input type="checkbox" defaultChecked={i < 4} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Account</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between"><span style={{ color: theme.textMuted }}>Email</span><span style={{ color: theme.text }}>sarah.reed@example.com</span></div>
          <div className="flex items-center justify-between"><span style={{ color: theme.textMuted }}>Member since</span><span style={{ color: theme.text }}>March 2026</span></div>
        </div>
        <div className="flex gap-2 mt-4">
          <GhostButton>Change password</GhostButton>
          <GhostButton>Download my data</GhostButton>
        </div>
      </Card>
    </div>
  );
}

// ── Privacy ──────────────────────────────────────────────────────────
const VISIBILITY_ROWS = [
  { name: "NSW Politics & Prayer", status: "Anonymous" },
  { name: "Sydney Civic Faith Circle", status: "Visible" },
  { name: "Young CiP", status: "Anonymous" },
  { name: "Christian Women in Public Policy", status: "Pending approval" },
];

const VISIBILITY_COLORS: Record<string, { bg: string; fg: string; icon: any }> = {
  Anonymous:          { bg: "#f3f4f6", fg: "#374151", icon: EyeOff },
  Visible:            { bg: "#d1fae5", fg: "#065f46", icon: Eye },
  "Pending approval": { bg: "#fef3c7", fg: "#92400e", icon: Circle },
  "Left group":       { bg: "#fee2e2", fg: "#991b1b", icon: X },
};

export function PrivacyScreen() {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: theme.pillBg }}
          >
            <ShieldCheck size={18} style={{ color: NAVY }} />
          </div>
          <div>
            <h1 style={{ color: theme.text }}>Privacy</h1>
            <p className="text-sm mt-0.5" style={{ color: theme.textMuted }}>
              Always make it obvious who can see what. You decide what to reveal, and where.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Group visibility</h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMuted }}>
          Your visibility is set per group. Being visible in one group does not make you visible in others.
        </p>

        <div className="mt-4 divide-y" style={{ borderColor: theme.divider }}>
          {VISIBILITY_ROWS.map((r) => {
            const v = VISIBILITY_COLORS[r.status];
            const Icon = v.icon;
            return (
              <div key={r.name} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs"
                  style={{ background: theme.pillBg, color: NAVY, fontWeight: 600 }}
                >
                  {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 500 }}>{r.name}</div>
                  <div className="inline-flex items-center gap-1 text-[11px] mt-0.5 px-1.5 py-0.5 rounded-md" style={{ background: v.bg, color: v.fg, fontWeight: 500 }}>
                    <Icon size={10} /> {r.status}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <GhostButton>Change visibility</GhostButton>
                  <GhostButton>Hide profile</GhostButton>
                  <GhostButton>Leave group</GhostButton>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Connections & messages</h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMuted }}>
          You can only be messaged by members you've connected with through a shared group.
          Connections persist even if you later hide your profile from a group.
        </p>
        <div className="space-y-3 mt-4 text-sm" style={{ color: theme.text }}>
          <div className="flex items-center justify-between">
            <span>Allow new connection requests</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Show me to other visible group members</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Allow CiP staff to introduce me to other members</span>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Data</h3>
        <div className="flex gap-2 mt-3 flex-wrap">
          <GhostButton>Download my data</GhostButton>
          <GhostButton>Delete my account</GhostButton>
        </div>
      </Card>
    </div>
  );
}

// ── Network ──────────────────────────────────────────────────────────
const NETWORK = [
  { id: "n1", name: "Hannah K.",   title: "Local government candidate",   group: "NSW Politics & Prayer",         state: "NSW", since: "Apr 2026" },
  { id: "n2", name: "Daniel S.",   title: "Lay preacher · Policy nerd",   group: "NSW Politics & Prayer",         state: "NSW", since: "Apr 2026" },
  { id: "n3", name: "Priya M.",    title: "Researcher",                   group: "Young CiP",                     state: "VIC", since: "Mar 2026" },
  { id: "n4", name: "James P.",    title: "Education policy",             group: "NSW Politics & Prayer",         state: "NSW", since: "Mar 2026" },
  { id: "n5", name: "Margaret O.", title: "Public sector executive",      group: "Christian Women in Public Policy", state: "ACT", since: "Feb 2026" },
  { id: "n6", name: "Andrew T.",   title: "Anglican lay leader",          group: "Sydney Civic Faith Circle",     state: "NSW", since: "Feb 2026" },
];

export function NetworkScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All groups");

  const groupOptions = ["All groups", ...Array.from(new Set(NETWORK.map((n) => n.group)))];
  const filtered = NETWORK.filter(
    (n) =>
      (groupFilter === "All groups" || n.group === groupFilter) &&
      (n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.title.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: theme.text }}>Your network</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              {NETWORK.length} accepted connections from groups you're visible in. You can message,
              invite to a new group, or remove a connection at any time.
            </p>
          </div>
          <button
            onClick={() => navigate("groups")}
            className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            <UserPlus size={13} /> Find more in groups
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or title"
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
            />
          </div>
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-lg text-sm outline-none appearance-none"
              style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
            >
              {groupOptions.map((g) => <option key={g}>{g}</option>)}
            </select>
            <ChevronRight size={11} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: theme.textMuted }} />
          </div>
        </div>
      </Card>

      {filtered.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm"
                  style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                >
                  {n.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>{n.name}</div>
                  <div className="text-xs truncate" style={{ color: theme.textMuted }}>{n.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>{n.state}</div>
                </div>
              </div>
              <div className="text-[11px] mt-3" style={{ color: theme.textSubtle }}>
                Connected through <span style={{ color: theme.textMuted, fontWeight: 500 }}>{n.group}</span> · {n.since}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => navigate("messages")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                  style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                >
                  <Send size={11} /> Message
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
                >
                  View
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="text-sm" style={{ color: theme.textMuted }}>
            No connections match your search.
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Support ──────────────────────────────────────────────────────────
const SUPPORT_PATHWAYS = [
  {
    id: "branch",
    icon: MapPin,
    title: "Connect to a local branch",
    desc: "Be introduced to current members of a political party branch in your electorate so you can attend a meeting and see how it works.",
    cta: "Request introduction",
  },
  {
    id: "council",
    icon: Users,
    title: "Stand for local council",
    desc: "We'll connect you with someone who has run for council, and walk you through the steps, timing and costs involved.",
    cta: "Start a conversation",
  },
  {
    id: "preselection",
    icon: Briefcase,
    title: "Explore pre-selection",
    desc: "If you're considering pre-selection at state or federal level, our team can talk you through what's involved and connect you with someone who's done it.",
    cta: "Request a chat",
  },
  {
    id: "pastoral",
    icon: Heart,
    title: "Pastoral support",
    desc: "Standing for office, working in policy or serving in public life can be lonely. We can connect you with a pastor or chaplain for a confidential conversation.",
    cta: "Request pastoral care",
  },
  {
    id: "mentor",
    icon: UserPlus,
    title: "Be matched with a mentor",
    desc: "We'll pair you with a more experienced member who can mentor you for a season as you grow in faith and public life.",
    cta: "Request a mentor",
  },
  {
    id: "policy",
    icon: FileText,
    title: "Policy / discernment help",
    desc: "Wrestling with a policy area through a Christian lens? We can connect you with a thoughtful peer or a relevant resource.",
    cta: "Ask CiP",
  },
];

const SUPPORT_REQUESTS = [
  { id: "r1", title: "Connect to a local branch",      status: "In review",                  updated: "2 days ago" },
  { id: "r2", title: "Pastoral conversation",          status: "Awaiting member response",   updated: "Yesterday" },
  { id: "r3", title: "Explore pre-selection",          status: "Matched / introduced",       updated: "2 weeks ago" },
];

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  "Submitted":                 { bg: "#dbeafe", fg: "#1d4ed8" },
  "In review":                 { bg: "#fef3c7", fg: "#92400e" },
  "Awaiting member response":  { bg: "#fde8d8", fg: "#c2410c" },
  "Matched / introduced":      { bg: "#d1fae5", fg: "#065f46" },
  "Closed":                    { bg: "#f3f4f6", fg: "#6b7280" },
};

function NewSupportRequestModal({ pathway, onClose }: { pathway: typeof SUPPORT_PATHWAYS[number]; onClose: () => void }) {
  const { theme } = useTheme();
  const Icon = pathway.icon;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <div
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: theme.pillBg, color: NAVY }}
          >
            <Icon size={16} />
          </div>
          <div className="flex-1">
            <h3 style={{ color: theme.text, fontWeight: 600 }}>{pathway.title}</h3>
            <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>
              CiP staff will receive this request and reply within a few days.
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={16} style={{ color: theme.textMuted }} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{pathway.desc}</p>
          <FormField label="What would help most?" hint="Optional — share a bit of context so we can route this well.">
            <textarea
              rows={4}
              placeholder="A few sentences about where you're at and what you're hoping for…"
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            />
          </FormField>
          <FormField label="How urgent is this?">
            <div className="flex gap-2">
              {["No rush", "Within a month", "This week"].map((u, i) => (
                <button
                  key={u}
                  className="flex-1 px-3 py-2 rounded-lg text-xs"
                  style={{
                    border: `1px solid ${i === 1 ? NAVY : theme.cardBorder}`,
                    background: i === 1 ? "#f0f7ff" : theme.cardBg,
                    color: theme.text,
                    fontWeight: i === 1 ? 600 : 400,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </FormField>
        </div>
        <div
          className="px-6 py-4 flex items-center justify-end gap-2"
          style={{ borderTop: `1px solid ${theme.divider}` }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

export function SupportScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<typeof SUPPORT_PATHWAYS[number] | null>(null);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: GOLD }}
          >
            <LifeBuoy size={18} style={{ color: NAVY }} />
          </div>
          <div>
            <h1 style={{ color: theme.text }}>Support pathways</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              CiP isn't an open forum or a self-serve directory — but our team can help you take
              your next step. Pick a pathway and we'll be in touch.
            </p>
          </div>
        </div>
      </Card>

      {/* Pathway grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {SUPPORT_PATHWAYS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className="p-5 flex flex-col">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: theme.pillBg, color: NAVY }}
                >
                  <Icon size={16} />
                </div>
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{p.title}</div>
              </div>
              <p className="text-xs mt-3 leading-relaxed flex-1" style={{ color: theme.textMuted }}>
                {p.desc}
              </p>
              <button
                onClick={() => setSelected(p)}
                className="mt-4 w-full px-3 py-2 rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
              >
                {p.cta} <ArrowRight size={11} />
              </button>
            </Card>
          );
        })}
      </div>

      {/* Existing requests */}
      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Your support requests</h3>
        <div className="mt-3 divide-y" style={{ borderColor: theme.divider }}>
          {SUPPORT_REQUESTS.map((r, i) => {
            const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.Submitted;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 py-3"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${theme.divider}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{r.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>Updated {r.updated}</div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.fg, fontWeight: 500 }}
                >
                  {r.status}
                </span>
                <ChevronRight size={14} style={{ color: theme.textSubtle }} />
              </div>
            );
          })}
        </div>
      </Card>

      {selected && (
        <NewSupportRequestModal pathway={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
