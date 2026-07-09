import { useState, useEffect, useRef, useCallback, useLayoutEffect, ReactNode, MouseEventHandler, CSSProperties } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "./AuthContext";
import { Screen } from "./types";
import { NAVY, GOLD, useTheme } from "./brand";
import { AutocompleteInput } from "./AutocompleteInput";
import { FEDERAL_ELECTORATES, STATE_ELECTORATES } from "./electorates";
import {
  CalendarDays, Clock, MapPin, Lock, ShieldCheck, Users,
  ChevronRight, ExternalLink, Heart, Sun, Moon, Eye, EyeOff,
  Pin, MessageCircle, MessageSquare, ThumbsUp, Send, MoreHorizontal, X,
  FileText, Shield, AlertTriangle, UserPlus, Image as ImageIcon,
  Link2, Globe, CheckCircle2, Circle, Briefcase, Flag, Church,
  Plus, LifeBuoy, ArrowRight, ArrowLeft, Search, Filter, Activity, ArrowUpRight,
  PartyPopper, Lightbulb, Laugh, Handshake, Pencil, Trash2
} from "lucide-react";

// ── Peer profile lookups ───────────────────────────────────────────────
// The base `profiles` table SELECT is owner/admin-only, so peer names/avatars
// are read from the safe `member_directory` view (no is_admin/role/moderation
// columns). Use these helpers instead of embedding `profiles(...)` for peers.
async function fetchAuthorMap(userIds: (string | null | undefined)[]): Promise<Map<string, any>> {
  const ids = Array.from(new Set(userIds.filter(Boolean))) as string[];
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from('member_directory')
    .select('id, first_name, last_name, avatar_url, job_title, state, bio')
    .in('id', ids);
  const map = new Map<string, any>();
  (data || []).forEach((p: any) => map.set(p.id, p));
  return map;
}

// Attach a `.profiles` object to each row (keyed on row.user_id) so existing
// render code that reads `row.profiles?.first_name` keeps working unchanged.
async function attachAuthors(rows: any[]): Promise<any[]> {
  const map = await fetchAuthorMap(rows.map(r => r.user_id));
  return rows.map(r => ({ ...r, profiles: map.get(r.user_id) || null }));
}

// ── Connection helpers (request → approve) ─────────────────────────────
// Single source of truth for network connections, replacing the four divergent
// inline copies. Connecting is now request → approve: requests start 'pending'
// and only the recipient's accept flips them to 'accepted'. All paths respect
// the DB unique-pair index (least/greatest) by pre-checking existence.
async function findConnection(userA: string, userB: string): Promise<any | null> {
  const { data } = await supabase.from('network_connections')
    .select('id, status, requester_id, receiver_id')
    .or(`and(requester_id.eq.${userA},receiver_id.eq.${userB}),and(requester_id.eq.${userB},receiver_id.eq.${userA})`)
    .limit(1).maybeSingle();
  return data || null;
}

// Own display name for notification copy.
async function fetchOwnName(userId: string): Promise<string> {
  const { data } = await supabase.from('profiles').select('first_name, last_name').eq('id', userId).maybeSingle();
  return `${data?.first_name || ''} ${data?.last_name || ''}`.trim();
}

// Create a pending request + notify the recipient. No-op if a connection
// already exists in either direction. Returns the resulting status, or null on error.
async function sendConnectionRequest(fromUserId: string, toUserId: string, fromName?: string): Promise<string | null> {
  const existing = await findConnection(fromUserId, toUserId);
  if (existing) return existing.status;

  const { error } = await supabase.from('network_connections').insert({
    requester_id: fromUserId,
    receiver_id: toUserId,
    status: 'pending',
  });
  if (error) return null;

  const name = fromName || (await fetchOwnName(fromUserId));
  await supabase.from('notifications').insert({
    user_id: toUserId,
    type: 'connection_invite',
    title: 'New Connection Request',
    message: `${name || 'Someone'} wants to connect with you.`,
  });
  return 'pending';
}

// Accept an incoming request + notify the original requester.
async function acceptConnection(connId: string, requesterId: string, myName?: string): Promise<boolean> {
  const { error } = await supabase.from('network_connections').update({ status: 'accepted' }).eq('id', connId);
  if (error) return false;
  await supabase.from('notifications').insert({
    user_id: requesterId,
    type: 'connection_accepted',
    title: 'Connection accepted',
    message: `${myName || 'A member'} accepted your connection request.`,
  });
  return true;
}

// Decline/withdraw a request by removing the row.
async function declineConnection(connId: string): Promise<boolean> {
  const { error } = await supabase.from('network_connections').delete().eq('id', connId);
  return !error;
}

// ── Shared primitives ─────────────────────────────────────────────────
function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: MouseEventHandler<HTMLDivElement> }) {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
      onClick={onClick}
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

function PrimaryButton({ children, onClick, full, disabled }: { children: ReactNode; onClick?: () => void; full?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs ${full ? "w-full" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
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
      style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

// Clickable member name → opens that member's read-only profile. Rendered as a
// `span role="link"` (not a <button>) so it can sit inside other clickable rows
// without invalid nesting; stopPropagation keeps a parent row's onClick from
// also firing. Falls back to plain text when we have no id/navigate.
export function MemberNameLink({ userId, name, navigate, className, style }: {
  userId?: string | null;
  name: string;
  navigate?: (s: Screen) => void;
  className?: string;
  style?: CSSProperties;
}) {
  if (!userId || !navigate) return <span className={className} style={style}>{name}</span>;
  const openProfile = () => {
    localStorage.setItem('activeProfileUserId', userId);
    navigate('member-profile');
  };
  return (
    <span
      role="link"
      tabIndex={0}
      className={className}
      style={{ ...style, cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); openProfile(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); openProfile(); } }}
    >
      {name}
    </span>
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

// ── Auto-growing textarea (LinkedIn-style composer) ──────────────────
function AutoGrowTextarea({
  value, minHeight = 44, maxHeight = 220, style, ...props
}: { value: string; minHeight?: number; maxHeight?: number; style?: CSSProperties; [key: string]: any }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);
  return (
    <textarea ref={ref} value={value} rows={1}
      style={{ minHeight, resize: "none", ...style }} {...props} />
  );
}

// ── Text clamped to N lines with a "…more"/"…less" toggle ─────────────
function ClampText({
  text, lines = 2, className, style,
}: { text: string; lines?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (expanded) return;
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded, lines]);
  const clampStyle: CSSProperties = expanded ? {} : {
    display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden",
  };
  return (
    <>
      <p ref={ref} className={className} style={{ ...style, ...clampStyle }}>{text}</p>
      {(overflowing || expanded) && (
        <button type="button" onClick={() => setExpanded((e) => !e)}
          className="text-xs mt-0.5" style={{ color: NAVY, fontWeight: 600, cursor: "pointer" }}>
          {expanded ? "…less" : "…more"}
        </button>
      )}
    </>
  );
}

// Renders a post body with inline edit + delete controls for the author.
function PostContent({ table, postId, body, isMine, onChanged, textColor }: {
  table: "global_posts" | "group_posts"; postId: string; body: string; isMine: boolean; onChanged?: () => void; textColor: string;
}) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    const { error } = await supabase.from(table).update({ content: draft.trim() }).eq("id", postId);
    setBusy(false);
    if (error) { alert("Could not update post: " + error.message); return; }
    setEditing(false);
    onChanged?.();
  };
  const remove = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from(table).delete().eq("id", postId);
    setBusy(false);
    if (error) { alert("Could not delete post: " + error.message); return; }
    onChanged?.();
  };

  if (editing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-y"
          style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
        <div className="flex gap-2">
          <PrimaryButton onClick={save} disabled={busy || !draft.trim()}>{busy ? "Saving…" : "Save"}</PrimaryButton>
          <GhostButton onClick={() => { setEditing(false); setDraft(body); }}>Cancel</GhostButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: textColor }}>{body}</p>
      {isMine && (
        <div className="flex gap-2 mt-2">
          <GhostButton onClick={() => { setDraft(body); setEditing(true); }}>Edit</GhostButton>
          <GhostButton onClick={remove}>Delete</GhostButton>
        </div>
      )}
    </>
  );
}

// ── LinkedIn-style reactions ──────────────────────────────────────────
const REACTIONS = [
  { key: "like",       label: "Like",       Icon: ThumbsUp,    color: "#0a66c2" },
  { key: "celebrate",  label: "Celebrate",  Icon: PartyPopper, color: "#44712e" },
  { key: "support",    label: "Support",    Icon: Handshake,   color: "#715e86" },
  { key: "love",       label: "Love",       Icon: Heart,       color: "#b24020" },
  { key: "insightful", label: "Insightful", Icon: Lightbulb,   color: "#c37d16" },
  { key: "funny",      label: "Funny",      Icon: Laugh,       color: "#1d9db7" },
] as const;
const REACTION_BY_KEY: Record<string, (typeof REACTIONS)[number]> =
  Object.fromEntries(REACTIONS.map((r) => [r.key, r]));

function ReactionBar({ postType, postId }: { postType: "global" | "group"; postId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [rows, setRows] = useState<{ reaction: string; user_id: string }[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("post_reactions")
      .select("reaction, user_id")
      .eq("post_type", postType)
      .eq("post_id", postId);
    setRows(data || []);
  }, [postType, postId]);
  useEffect(() => { load(); }, [load]);

  const mine = rows.find((r) => r.user_id === user?.id)?.reaction || null;
  const total = rows.length;
  const present = REACTIONS.filter((r) => rows.some((x) => x.reaction === r.key));

  const setReaction = async (key: string) => {
    if (!user) return;
    if (mine === key) {
      setRows((prev) => prev.filter((r) => r.user_id !== user.id));
      await supabase.from("post_reactions").delete()
        .eq("post_type", postType).eq("post_id", postId).eq("user_id", user.id);
    } else {
      setRows((prev) => [...prev.filter((r) => r.user_id !== user.id), { reaction: key, user_id: user.id }]);
      await supabase.from("post_reactions").upsert(
        { post_type: postType, post_id: postId, user_id: user.id, reaction: key },
        { onConflict: "post_type,post_id,user_id" }
      );
    }
    load();
  };

  const active = mine ? REACTION_BY_KEY[mine] : null;
  const ActiveIcon = active ? active.Icon : ThumbsUp;

  return (
    <div className="relative group/react">
      <button
        onClick={() => setReaction(mine || "like")}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-black/5"
        style={{ color: active ? active.color : theme.textMuted, fontWeight: active ? 600 : 500 }}
      >
        <ActiveIcon size={15} /> {active ? active.label : "Like"}
        {total > 0 && (
          <span className="ml-1 inline-flex items-center" style={{ color: theme.textSubtle }}>
            {present.slice(0, 3).map((r) => { const I = r.Icon; return <I key={r.key} size={11} style={{ color: r.color }} />; })}
            <span className="ml-1 text-[11px]">{total}</span>
          </span>
        )}
      </button>
      <div
        className="absolute bottom-full left-0 mb-1 hidden group-hover/react:flex items-center gap-1 px-2 py-1.5 rounded-full shadow-lg z-20"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
      >
        {REACTIONS.map((r) => {
          const I = r.Icon;
          return (
            <button key={r.key} title={r.label} onClick={() => setReaction(r.key)}
              className="p-1 rounded-full hover:scale-125 transition-transform" style={{ color: r.color }}>
              <I size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Comments ──────────────────────────────────────────────────────────
function CommentItem({ c, canModerate, navigate, onReport, onChanged }: {
  c: any; canModerate?: boolean; navigate?: (s: Screen) => void; onReport: (t: { type: "comment"; id: string }) => void; onChanged: () => void;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.content);
  const [busy, setBusy] = useState(false);
  const isMine = c.user_id === user?.id;
  const authorName = c.profiles ? `${c.profiles.first_name || ""} ${c.profiles.last_name || ""}`.trim() || "Member" : "Member";

  const save = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("post_comments")
      .update({ content: draft.trim(), edited_at: new Date().toISOString() }).eq("id", c.id);
    setBusy(false);
    if (error) { alert("Could not update comment: " + error.message); return; }
    setEditing(false); onChanged();
  };
  const remove = async () => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("post_comments").delete().eq("id", c.id);
    if (error) { alert("Could not delete comment: " + error.message); return; }
    onChanged();
  };

  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px]" style={{ background: GOLD, color: "#fff", fontWeight: 600 }}>
        {(authorName || "M").substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-3 py-2" style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}` }}>
          <div className="text-xs" style={{ color: theme.text, fontWeight: 600 }}>
            <MemberNameLink userId={c.user_id} name={authorName} navigate={navigate} />
          </div>
          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
                className="w-full px-2 py-1 rounded-lg text-sm border outline-none resize-y"
                style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
              <div className="flex gap-2">
                <PrimaryButton onClick={save} disabled={busy || !draft.trim()}>{busy ? "Saving…" : "Save"}</PrimaryButton>
                <GhostButton onClick={() => { setEditing(false); setDraft(c.content); }}>Cancel</GhostButton>
              </div>
            </div>
          ) : (
            <ClampText text={c.content} className="text-sm mt-0.5 whitespace-pre-wrap" style={{ color: theme.textMuted }} />
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-3 mt-1 ml-1 text-[11px]" style={{ color: theme.textSubtle }}>
            <span>{new Date(c.created_at).toLocaleDateString()}{c.edited_at ? " · edited" : ""}</span>
            {isMine && <button onClick={() => { setDraft(c.content); setEditing(true); }} className="hover:underline">Edit</button>}
            {(isMine || canModerate) && <button onClick={remove} className="hover:underline">Delete</button>}
            {!isMine && <button onClick={() => onReport({ type: "comment", id: c.id })} className="hover:underline inline-flex items-center gap-1"><Flag size={10} /> Report</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentSection({ postType, postId, authorId, groupId, commentPolicy, canModerate, navigate, onReport, onChanged }: {
  postType: "global" | "group"; postId: string; authorId?: string; groupId?: string | null;
  commentPolicy?: string; canModerate?: boolean; navigate?: (s: Screen) => void;
  onReport: (t: { type: "comment"; id: string }) => void; onChanged?: () => void;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("post_comments")
      .select("*").eq("post_type", postType).eq("post_id", postId).is("removed_at", null)
      .order("created_at", { ascending: true });
    setComments(await attachAuthors(data || []));
  }, [postType, postId]);
  useEffect(() => { load(); }, [load]);

  const reload = async () => { await load(); onChanged?.(); };

  // Resolve whether the current user may comment, per the post's comment policy.
  useEffect(() => {
    let active = true;
    (async () => {
      const policy = commentPolicy || "anyone";
      if (policy === "none") { if (active) setAllowed(false); return; }
      if (policy === "anyone" || !authorId || authorId === user?.id) { if (active) setAllowed(true); return; }
      const { data } = await supabase.from("network_connections").select("id")
        .or(`and(requester_id.eq.${user?.id},receiver_id.eq.${authorId}),and(requester_id.eq.${authorId},receiver_id.eq.${user?.id})`)
        .eq("status", "accepted").maybeSingle();
      if (active) setAllowed(!!data);
    })();
    return () => { active = false; };
  }, [commentPolicy, authorId, user?.id]);

  const add = async () => {
    if (!text.trim() || !user) return;
    setBusy(true);
    const body = text.trim();
    const { data, error } = await supabase.from("post_comments")
      .insert({ post_type: postType, post_id: postId, user_id: user.id, content: body })
      .select("id").single();
    setBusy(false);
    if (error) { alert("Could not post comment: " + error.message); return; }
    setText("");
    reload();
    // Fire-and-forget AI moderation; never blocks the user or surfaces errors.
    supabase.functions.invoke("moderate-comment", {
      body: { commentId: data?.id, postType, postId, authorId, groupId: groupId ?? null, content: body },
    }).catch(() => { /* best-effort moderation */ });
  };

  const policy = commentPolicy || "anyone";

  return (
    <div className="mt-3 space-y-3">
      {policy === "none" ? (
        <div className="text-xs text-center py-2" style={{ color: theme.textSubtle }}>
          <Lock size={11} className="inline mr-1" /> Comments are turned off for this post.
        </div>
      ) : allowed ? (
        <div className="flex gap-2 items-end">
          <AutoGrowTextarea
            value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }}
            placeholder="Add a comment…"
            minHeight={38}
            className="flex-1 px-3 py-2 rounded-2xl text-sm outline-none"
            style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          />
          <button onClick={add} disabled={busy || !text.trim()}
            className="px-3 rounded-full text-xs flex items-center"
            style={{ background: NAVY, color: "#fff", fontWeight: 600, opacity: busy || !text.trim() ? 0.6 : 1 }}>
            <Send size={14} />
          </button>
        </div>
      ) : (
        <div className="text-xs text-center py-2" style={{ color: theme.textSubtle }}>
          Only the author's connections can comment on this post.
        </div>
      )}
      {comments.map((c) => (
        <CommentItem key={c.id} c={c} canModerate={canModerate} navigate={navigate} onReport={onReport} onChanged={reload} />
      ))}
    </div>
  );
}

// ── Report flow ───────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Harassment or abuse", "Hate or discrimination", "Spam or scam",
  "Misinformation", "Off-topic or inappropriate", "Other",
];

function ReportModal({ target, postType, groupId, onClose }: {
  target: { type: "post" | "comment"; id: string };
  postType: "global" | "group"; groupId?: string | null; onClose: () => void;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("content_reports").insert({
      reporter_id: user.id,
      target_type: target.type,
      target_id: target.id,
      post_type: postType,
      group_id: groupId ?? null,
      reason,
      details: details.trim() || null,
    });
    if (error) { setBusy(false); alert("Could not submit report: " + error.message); return; }
    // Notify the group/company owner where there is one.
    if (groupId) {
      const { data: g } = await supabase.from("groups").select("created_by, name").eq("id", groupId).maybeSingle();
      if (g?.created_by && g.created_by !== user.id) {
        await supabase.from("notifications").insert({
          user_id: g.created_by,
          type: "content_reported",
          title: `A ${target.type} was reported`,
          message: `A ${target.type} in ${g.name || "your group"} was reported and is awaiting review.`,
        });
      }
    }
    setBusy(false); setDone(true);
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: "#dcfce7" }}>
              <CheckCircle2 size={22} style={{ color: "#16a34a" }} />
            </div>
            <h3 style={{ color: theme.text, fontWeight: 600 }}>Report submitted</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Thank you. Our team{groupId ? " and the group owner" : ""} will review this shortly.
            </p>
            <div className="mt-4"><PrimaryButton onClick={onClose}>Close</PrimaryButton></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Flag size={16} style={{ color: NAVY }} />
              <h3 style={{ color: theme.text, fontWeight: 600 }}>Report this {target.type}</h3>
            </div>
            <p className="text-xs mb-3" style={{ color: theme.textMuted }}>
              Reports are reviewed by CiP moderators. This platform also uses AI to monitor
              behaviour against the Member Conduct Agreement.
            </p>
            <label className="text-xs" style={{ color: theme.textMuted }}>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 mb-3 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
              {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="text-xs" style={{ color: theme.textMuted }}>Details (optional)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none resize-y"
              style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
            <div className="flex gap-2 mt-4 justify-end">
              <GhostButton onClick={onClose}>Cancel</GhostButton>
              <PrimaryButton onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit report"}</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Post "…" menu ─────────────────────────────────────────────────────
function PostMenu({ isMine, canModerate, onEdit, onDelete, onRemove, onReport, policy, onPolicyChange }: {
  isMine: boolean; canModerate?: boolean;
  onEdit: () => void; onDelete: () => void; onRemove: () => void; onReport: () => void;
  policy: string; onPolicyChange: (p: string) => void;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const item = "w-full text-left px-3 py-2 text-xs hover:bg-black/5 flex items-center gap-2";
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-full hover:bg-black/5" style={{ color: theme.textMuted }}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setOpen(false); setSubOpen(false); }} />
          <div className="absolute right-0 top-8 w-52 rounded-xl shadow-xl z-40 overflow-hidden py-1"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            {isMine && <button className={item} style={{ color: theme.text }} onClick={() => { setOpen(false); onEdit(); }}><Pencil size={13} /> Edit post</button>}
            {isMine && (
              <div>
                <button className={item} style={{ color: theme.text }} onClick={() => setSubOpen((s) => !s)}>
                  <MessageCircle size={13} /> Who can comment
                </button>
                {subOpen && (
                  <div className="pl-3">
                    {([["anyone", "Anyone"], ["connections", "Connections only"], ["none", "No one"]] as const).map(([val, lbl]) => (
                      <button key={val} className={item} style={{ color: policy === val ? NAVY : theme.textMuted, fontWeight: policy === val ? 600 : 400 }}
                        onClick={() => { onPolicyChange(val); setOpen(false); setSubOpen(false); }}>
                        {policy === val ? <CheckCircle2 size={13} /> : <Circle size={13} />} {lbl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isMine && <button className={item} style={{ color: "#b42318" }} onClick={() => { setOpen(false); onDelete(); }}><Trash2 size={13} /> Delete post</button>}
            {!isMine && canModerate && <button className={item} style={{ color: "#b42318" }} onClick={() => { setOpen(false); onRemove(); }}><Shield size={13} /> Remove (moderator)</button>}
            {!isMine && <button className={item} style={{ color: theme.text }} onClick={() => { setOpen(false); onReport(); }}><Flag size={13} /> Report post</button>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Unified member post (feed + group), LinkedIn-style ─────────────────
export function MemberPost({
  postType, postId, authorId, authorName, subtitle, body, imageUrl, commentPolicy,
  groupId, canModerate, navigate, onChanged, footer,
}: {
  postType: "global" | "group"; postId: string; authorId?: string; authorName: string;
  subtitle: string; body: string; imageUrl?: string | null; commentPolicy?: string;
  groupId?: string | null; canModerate?: boolean; navigate: (s: Screen) => void;
  onChanged?: () => void; footer?: ReactNode;
}) {
  const { theme, dark } = useTheme();
  const { user } = useAuth();
  const isMine = !!authorId && authorId === user?.id;
  const table = postType === "global" ? "global_posts" : "group_posts";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState(body);
  const [policy, setPolicy] = useState(commentPolicy || "anyone");
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [report, setReport] = useState<{ type: "post" | "comment"; id: string } | null>(null);
  const [removed, setRemoved] = useState(false);

  const loadCount = useCallback(async () => {
    const { count } = await supabase.from("post_comments")
      .select("id", { count: "exact", head: true })
      .eq("post_type", postType).eq("post_id", postId).is("removed_at", null);
    setCommentCount(count || 0);
  }, [postType, postId]);
  useEffect(() => { loadCount(); }, [loadCount]);

  const saveEdit = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    const { error } = await supabase.from(table).update({ content: draft.trim(), edited_at: new Date().toISOString() }).eq("id", postId);
    setBusy(false);
    if (error) { alert("Could not update post: " + error.message); return; }
    setText(draft.trim()); setEditing(false);
  };
  const del = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", postId);
    if (error) { alert("Could not delete post: " + error.message); return; }
    if (onChanged) onChanged(); else setRemoved(true);
  };
  const moderatorRemove = async () => {
    if (!confirm("Remove this post from the feed? This is a moderation action.")) return;
    const { error } = await supabase.from(table).update({ removed_at: new Date().toISOString(), removed_by: user?.id }).eq("id", postId);
    if (error) { alert("Could not remove post: " + error.message); return; }
    if (onChanged) onChanged(); else setRemoved(true);
  };
  const changePolicy = async (p: string) => {
    setPolicy(p);
    await supabase.from(table).update({ comment_policy: p }).eq("id", postId);
  };

  if (removed) return null;

  return (
    <Card className="overflow-hidden mb-4 p-5">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{ background: GOLD, color: "#fff", fontWeight: 600 }}>
          {(authorName || "M").substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-tight" style={{ color: dark ? theme.text : "#1a1a1a", fontWeight: 600 }}>
            <MemberNameLink userId={authorId} name={authorName} navigate={navigate} />
          </div>
          <div className="text-xs leading-tight mt-0.5" style={{ color: theme.textSubtle }}>{subtitle}</div>
        </div>
        <PostMenu
          isMine={isMine} canModerate={canModerate}
          onEdit={() => { setDraft(text); setEditing(true); }}
          onDelete={del} onRemove={moderatorRemove}
          onReport={() => setReport({ type: "post", id: postId })}
          policy={policy} onPolicyChange={changePolicy}
        />
      </div>

      {editing ? (
        <div className="mt-1 space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-y"
            style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
          <div className="flex gap-2">
            <PrimaryButton onClick={saveEdit} disabled={busy || !draft.trim()}>{busy ? "Saving…" : "Save"}</PrimaryButton>
            <GhostButton onClick={() => { setEditing(false); setDraft(text); }}>Cancel</GhostButton>
          </div>
        </div>
      ) : (
        <ClampText text={text} className="text-sm mt-1 leading-relaxed whitespace-pre-wrap" style={{ color: dark ? theme.textMuted : "#1a1a1a" }} />
      )}

      {imageUrl && !editing && (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.cardBorder}` }}>
          <img src={imageUrl} alt="Post attachment" className="w-full max-h-[520px] object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.divider}` }}>
        <ReactionBar postType={postType} postId={postId} />
        <button onClick={() => setShowComments((s) => !s)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-black/5" style={{ color: theme.textMuted, fontWeight: 500 }}>
          <MessageCircle size={15} /> {commentCount > 0 ? `${commentCount} ` : ""}Comment{commentCount === 1 ? "" : "s"}
        </button>
        {footer && <div className="ml-auto flex items-center gap-2">{footer}</div>}
      </div>

      {showComments && (
        <CommentSection
          postType={postType} postId={postId} authorId={authorId} groupId={groupId}
          commentPolicy={policy} canModerate={canModerate} navigate={navigate}
          onReport={(t) => setReport(t)} onChanged={loadCount}
        />
      )}

      {report && (
        <ReportModal target={report} postType={postType} groupId={groupId} onClose={() => { setReport(null); loadCount(); }} />
      )}
    </Card>
  );
}

function FeedPost({ item, navigate, onChanged }: { item: any; navigate: (s: Screen) => void; onChanged?: () => void }) {
  const { theme, dark } = useTheme();
  const { user } = useAuth();

  if (item.isGroupPost || item.isGlobalPost) {
    const isGlobal = !!item.isGlobalPost;
    const isMine = !!item.authorId && item.authorId === user?.id;
    const isAdmin = !!user?.email?.endsWith("@christiansinpolitics.com");
    return (
      <MemberPost
        postType={isGlobal ? "global" : "group"}
        postId={item.id}
        authorId={item.authorId}
        authorName={item.authorName}
        subtitle={isGlobal ? `Community Post · ${item.date}` : `Posted in ${item.groupName} · ${item.date}`}
        body={item.body}
        imageUrl={item.image_url}
        commentPolicy={item.comment_policy}
        groupId={isGlobal ? null : item.groupId}
        canModerate={isAdmin}
        navigate={navigate}
        onChanged={onChanged}
        footer={
          <>
            {!isGlobal && (
              <GhostButton onClick={() => {
                localStorage.setItem('activeGroupId', item.groupId);
                localStorage.setItem('isOrgDetail', item.groupType === 'organisation' ? 'true' : 'false');
                navigate("group-detail");
              }}>
                View in {item.groupType === 'organisation' ? 'organisation' : 'group'}
              </GhostButton>
            )}
            {item.authorId && !isMine && (
              <MessageAuthorButton targetUserId={item.authorId} navigate={navigate} />
            )}
          </>
        }
      />
    );
  }

  return (
    <Card className="overflow-hidden mb-4">
      {item.image && (
        <div
          className="h-44 w-full"
          style={{ background: "#f1f5f9" }}
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
          <div className="text-xs" style={{ color: dark ? theme.text : "#1a1a1a", fontWeight: 600 }}>
            Christians in Politics
          </div>
          <span className="text-xs" style={{ color: theme.textSubtle }}>·</span>
          <span className="text-xs" style={{ color: theme.textSubtle }}>{item.date}</span>
          <div className="ml-auto">
            <Pill color={FEED_TYPE_COLORS[item.type] || "#f3f4f6"}>{item.type}</Pill>
          </div>
        </div>
        {item.title && (
          <h3 className="text-base" style={{ color: dark ? theme.text : "#1a1a1a", fontWeight: 600 }}>
            {item.title}
          </h3>
        )}
        <ClampText text={item.body} className="text-sm mt-2 leading-relaxed" style={{ color: dark ? theme.textMuted : "#1a1a1a" }} />
        <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
          {item.cta && (
            <PrimaryButton onClick={() => {
              if (item.cta === "Register") navigate("event-detail");
              else if (item.cta === "Donate") navigate("donate");
            }}>
              {item.cta}
            </PrimaryButton>
          )}
          {item.cta2 && <GhostButton>{item.cta2}</GhostButton>}
          <span className="text-[11px] ml-auto inline-flex items-center gap-1" style={{ color: theme.textSubtle }}>
            <Lock size={10} /> Posted by CiP · No public comments
          </span>
        </div>
      </div>
    </Card>
  );
}

const POLICY_LABEL: Record<string, string> = {
  anyone: "Anyone can comment", connections: "Connections only", none: "No comments",
};

export function PostComposer({
  onPost,
  disabledClickAction,
  placeholder = "Share something with the community..."
}: {
  onPost: (content: string, opts?: { imageUrl?: string | null; commentPolicy?: string }) => Promise<boolean | void>;
  disabledClickAction?: () => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [commentPolicy, setCommentPolicy] = useState("anyone");
  const [policyOpen, setPolicyOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] || ''}`.toUpperCase()
    : "U";

  const disabled = !!disabledClickAction;

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const name = `${user.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(name, file);
    if (error) { setUploading(false); alert("Image upload failed: " + error.message); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(name);
    setImageUrl(data.publicUrl);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-4 rounded-xl space-y-3" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
      <div className="flex gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0"
          style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
        >
          {initials}
        </div>
        <div className="flex-1 relative">
          {disabled && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={disabledClickAction} />
          )}
          <AutoGrowTextarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled || posting}
            className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
            style={{ background: theme.bg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          />
        </div>
      </div>

      {imageUrl && (
        <div className="relative rounded-xl overflow-hidden ml-12" style={{ border: `1px solid ${theme.cardBorder}` }}>
          <img src={imageUrl} alt="Attachment preview" className="w-full max-h-72 object-cover" />
          <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${theme.divider}` }}>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <GhostButton onClick={disabled ? disabledClickAction : () => fileRef.current?.click()}>
          <ImageIcon size={12} className="inline mr-1" /> {uploading ? "Uploading…" : "Image"}
        </GhostButton>

        <div className="relative">
          <GhostButton onClick={disabled ? disabledClickAction : () => setPolicyOpen((o) => !o)}>
            <MessageCircle size={12} className="inline mr-1" /> {POLICY_LABEL[commentPolicy]}
          </GhostButton>
          {policyOpen && !disabled && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setPolicyOpen(false)} />
              <div className="absolute left-0 bottom-full mb-1 w-48 rounded-xl shadow-xl z-40 overflow-hidden py-1" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                {([["anyone", "Anyone"], ["connections", "Connections only"], ["none", "No one"]] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => { setCommentPolicy(val); setPolicyOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-black/5 flex items-center gap-2"
                    style={{ color: commentPolicy === val ? NAVY : theme.text, fontWeight: commentPolicy === val ? 600 : 400 }}>
                    {commentPolicy === val ? <CheckCircle2 size={13} /> : <Circle size={13} />} {lbl}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto relative">
          {disabled && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={disabledClickAction} />
          )}
          <PrimaryButton
            disabled={disabled || posting || uploading || (!content.trim() && !imageUrl)}
            onClick={async () => {
              if (!content.trim() && !imageUrl) return;
              setPosting(true);
              const ok = await onPost(content, { imageUrl, commentPolicy });
              // Keep the draft if the post failed so the user doesn't lose it.
              if (ok !== false) { setContent(""); setImageUrl(null); }
              setPosting(false);
            }}
          >
            {posting ? "Posting..." : "Post"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// Footer button on feed/group posts. Messaging now requires an accepted
// connection: if one exists we deep-link to the conversation, otherwise we send
// a connection request (request → approve).
function MessageAuthorButton({
  targetUserId,
  navigate,
  label = "Message author"
}: {
  targetUserId: string;
  navigate: (s: Screen) => void;
  label?: string;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [connState, setConnState] = useState<'loading' | 'none' | 'pending' | 'accepted'>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user || targetUserId === user.id) return;
      const existing = await findConnection(user.id, targetUserId);
      if (!cancelled) setConnState(existing ? existing.status : 'none');
    }
    check();
    return () => { cancelled = true; };
  }, [user, targetUserId]);

  // Don't show button if the target is the current user
  if (!user || targetUserId === user.id) return null;

  const openMessage = () => {
    // Deep-link the target conversation in MessagesScreen.
    localStorage.setItem('activeMessageUserId', targetUserId);
    navigate('messages');
  };

  const requestConnect = async () => {
    setBusy(true);
    const status = await sendConnectionRequest(user.id, targetUserId);
    setBusy(false);
    if (status) setConnState(status as any);
  };

  let icon = <MessageSquare size={12} />;
  let text: string = label;
  let onClick: (() => void) | undefined = openMessage;
  let disabled = busy || connState === 'loading';

  if (connState === 'none') { icon = <UserPlus size={12} />; text = 'Connect'; onClick = requestConnect; }
  else if (connState === 'pending') { icon = <Clock size={12} />; text = 'Request sent'; onClick = undefined; disabled = true; }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
    >
      {busy ? <><Clock size={12} /> Connecting…</> : <>{icon} {text}</>}
    </button>
  );
}

function GettingStartedWidget({ setOnboarded }: { setOnboarded: (b: boolean) => void }) {
  const { theme } = useTheme();
  const { user, refreshProfile, updateProfileLocally } = useAuth();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || "");
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || "");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [suburbSearch, setSuburbSearch] = useState("");
  const [suburbsData, setSuburbsData] = useState<any[]>([]);
  const [state, setState] = useState("");
  const [electorate, setElectorate] = useState("");
  const [stateElectorate, setStateElectorate] = useState("");
  const [party, setParty] = useState("No affiliation");
  const [tradition, setTradition] = useState("");
  const [showParty, setShowParty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [partyGroups, setPartyGroups] = useState<any[]>([]);
  const [selectedPartyGroupId, setSelectedPartyGroupId] = useState<string | null>(null);
  const [joinPartyGroup, setJoinPartyGroup] = useState(false);

  const hydratedRef = useRef(false);
  const snapshotRef = useRef("");

  // Load any previously-saved profile FIRST, so the autosave below never
  // overwrites existing data with the empty initial state on mount.
  useEffect(() => {
    async function hydrate() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const { data: priv } = await supabase.from("profile_private").select("party, tradition").eq("user_id", user.id).maybeSingle();
      const vals = {
        firstName: (data?.first_name ?? user.user_metadata?.first_name) || "",
        lastName: (data?.last_name ?? user.user_metadata?.last_name) || "",
        jobTitle: data?.job_title || "",
        bio: data?.bio || "",
        state: data?.state || "",
        electorate: data?.federal_electorate || "",
        stateElectorate: data?.state_electorate || "",
        party: priv?.party || "No affiliation",
        tradition: priv?.tradition || "",
        showParty: data?.show_party || false,
      };
      setFirstName(vals.firstName);
      setLastName(vals.lastName);
      setJobTitle(vals.jobTitle);
      setBio(vals.bio);
      setState(vals.state);
      setElectorate(vals.electorate);
      setStateElectorate(vals.stateElectorate);
      setParty(vals.party);
      setTradition(vals.tradition);
      setShowParty(vals.showParty);
      snapshotRef.current = JSON.stringify(vals);
      hydratedRef.current = true;
    }
    hydrate();
  }, [user]);

  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    const snapshot = JSON.stringify({ firstName, lastName, jobTitle, bio, state, electorate, stateElectorate, party, tradition, showParty });
    // Skip the debounced save until the user actually changes something.
    if (snapshot === snapshotRef.current) return;
    const timer = setTimeout(async () => {
      setAutoSaveStatus("Saving...");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle,
        bio: bio,
        state: state,
        federal_electorate: electorate,
        state_electorate: stateElectorate,
        show_party: showParty,
      });
      if (error) { setAutoSaveStatus("Save failed"); return; }
      await supabase.from("profile_private").upsert({ user_id: user.id, party, tradition });
      snapshotRef.current = snapshot;
      setAutoSaveStatus("Saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [firstName, lastName, jobTitle, bio, state, electorate, stateElectorate, party, tradition, showParty, user]);

  useEffect(() => {
    async function checkPartyGroup() {
      if (party === "No affiliation" || !party) {
        setJoinPartyGroup(false);
        setSelectedPartyGroupId(null);
        return;
      }
      const { data } = await supabase.from('groups')
        .select('*')
        .eq('caveat_type', 'party')
        .eq('caveat_value', party);
      if (data && data.length > 0) {
        setSelectedPartyGroupId(data[0].id);
      } else {
        setSelectedPartyGroupId(null);
      }
      setJoinPartyGroup(true); // Default check it, and it will always show
    }
    checkPartyGroup();
  }, [party]);

  useEffect(() => {
    let cancelled = false;
    async function searchSuburbs() {
      if (suburbSearch.length < 2) {
        setSuburbsData([]);
        return;
      }
      const { data } = await supabase.from('suburbs')
        .select('*')
        .ilike('suburb_name', `${suburbSearch}%`)
        .limit(10);
      if (!cancelled && data) setSuburbsData(data);
    }
    searchSuburbs();
    return () => { cancelled = true; };
  }, [suburbSearch]);

  const suburbOptions = suburbsData.map(s => `${s.suburb_name}, ${s.state} ${s.postcode}`);

  const handleSuburbSelect = (val: string) => {
    setSuburbSearch(val);
    const selected = suburbsData.find(s => `${s.suburb_name}, ${s.state} ${s.postcode}` === val);
    if (selected) {
      setState(selected.state);
      setElectorate(selected.federal_electorate || "");
      setStateElectorate(selected.state_electorate || "");
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user?.id,
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      bio: bio,
      state: state,
      federal_electorate: electorate,
      state_electorate: stateElectorate,
      show_party: showParty,
      onboarded: true
    });
    if (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
      return;
    }
    if (user) {
      await supabase.from("profile_private").upsert({ user_id: user.id, party, tradition });
    }

    // Helper to ensure an affinity group exists
    const ensureGroup = async (caveatType: string, caveatValue: string) => {
      if (!caveatValue || caveatValue === "No affiliation" || caveatValue === "Not applicable") return null;
      
      const { data } = await supabase.from('groups')
        .select('id')
        .eq('caveat_type', caveatType)
        .eq('caveat_value', caveatValue);
        
      if (data && data.length > 0) return data[0].id;
      
      const groupName = caveatType === 'party' ? `${caveatValue} Members` 
                      : caveatType === 'tradition' ? `${caveatValue} Tradition` 
                      : `${caveatValue} Electorate`;
      const desc = `Exclusive group for ${caveatValue} ${caveatType === 'party' ? 'members' : caveatType}.`;
      
      const { data: newGroup } = await supabase.from('groups')
        .insert({
          name: groupName,
          description: desc,
          visibility: 'restricted',
          group_type: 'standard',
          caveat_type: caveatType,
          caveat_value: caveatValue,
          created_by: user?.id
        })
        .select('id');
        
      if (newGroup && newGroup.length > 0) return newGroup[0].id;
      return null;
    };

    if (user) {
      if (joinPartyGroup && party && party !== "No affiliation") {
        const pId = await ensureGroup('party', party);
        if (pId) await supabase.from('group_members').upsert({ group_id: pId, user_id: user.id });
      }
    }

    updateProfileLocally({
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      bio: bio,
      state: state,
      federal_electorate: electorate,
      state_electorate: stateElectorate,
      party: party,
      tradition: tradition,
      show_party: showParty,
      onboarded: true,
    });
    refreshProfile(); // background sync
    setOnboarded(true);
  };

  const skip = async () => {
    await supabase.from("profiles").upsert({ id: user?.id, onboarded: true });
    setOnboarded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-2xl p-8 relative overflow-hidden my-auto shadow-2xl" style={{ borderColor: GOLD }}>
        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: GOLD }} />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: theme.text }}>Welcome to CiP!</h2>
            <p className="text-[15px] mt-2" style={{ color: theme.textMuted }}>
              Before you jump in, please complete your profile. These details help you connect with others in your electorate and state.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Job Title / Calling</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Policy Advisor, Teacher" className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Short Bio</label>
              <input value={bio} onChange={e => setBio(e.target.value)} placeholder="A short sentence about you..." className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Suburb or Postcode</label>
              <AutocompleteInput 
                value={suburbSearch} 
                onChange={handleSuburbSelect} 
                options={suburbOptions} 
                placeholder="e.g. Sydney, NSW 2000" 
              />
              {(state || electorate || stateElectorate) && (
                <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                  <span className="font-semibold">State:</span> {state || 'Unknown'} · <span className="font-semibold">Federal:</span> {electorate || 'Unknown'} · <span className="font-semibold">State Electorate:</span> {stateElectorate || 'Unknown'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Political Affiliation</label>
              <select value={party} onChange={e => setParty(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border outline-none appearance-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                {["No affiliation", "Independent", "Australian Labor Party", "Liberal Party of Australia", "The Nationals", "Australian Greens", "One Nation", "Family First"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: theme.text }}>Christian Tradition</label>
              <select value={tradition} onChange={e => setTradition(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border outline-none appearance-none" style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <option value="">Select Tradition</option>
                {["Anglican", "Assembly of God", "Baptist", "Catholic", "Coptic", "Eastern Orthodox", "Evangelical", "Lutheran", "Methodist", "Pentecostal", "Presbyterian", "Reformed", "Uniting Church", "Other Christian", "Prefer not to say"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" id="showPartyOnboard" checked={showParty} onChange={e => setShowParty(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: NAVY }} />
            <label htmlFor="showPartyOnboard" className="text-sm select-none" style={{ color: theme.text }}>
              Show political affiliation on my public profile
            </label>
          </div>

          {party && party !== "No affiliation" && (
            <div className="flex items-start gap-3 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <input type="checkbox" id="joinPartyGroup" checked={joinPartyGroup} onChange={e => setJoinPartyGroup(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: NAVY }} />
              <label htmlFor="joinPartyGroup" className="text-sm select-none font-semibold flex-1" style={{ color: theme.text }}>
                Join the exclusive {party} group?
              </label>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-8 pt-6 border-t" style={{ borderColor: theme.divider }}>
          <PrimaryButton onClick={saveProfile} disabled={loading} className="px-8 py-2.5 text-[15px]">
            {loading ? "Saving..." : "Save Profile & Continue"}
          </PrimaryButton>
          <button onClick={skip} className="text-[14px] font-medium hover:underline" style={{ color: theme.textMuted }}>
            Skip for now
          </button>
          {autoSaveStatus && (
            <span className="text-xs ml-auto" style={{ color: theme.textMuted }}>
              {autoSaveStatus}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

export function Dashboard({ navigate, onboarded, setOnboarded }: { navigate: (s: Screen) => void; onboarded?: boolean; setOnboarded?: (b: boolean) => void }) {
  const { theme } = useTheme();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFeed = useCallback(async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
      const myGroupIds = memberships ? memberships.map(m => m.group_id) : [];

      const { data: announcements } = await supabase.from('announcements')
        .select('*')
        .eq('status', 'Published')
        .order('created_at', { ascending: false })
        .limit(100);

      let groupPosts: any[] = [];
      if (myGroupIds.length > 0) {
        const { data: posts } = await supabase.from('group_posts')
          .select('*, groups(name, id, group_type)')
          .in('group_id', myGroupIds)
          .is('removed_at', null)
          .order('created_at', { ascending: false })
          .limit(100);
        if (posts) groupPosts = posts;
      }

      const { data: globalPostsData } = await supabase.from('global_posts')
        .select('*')
        .is('removed_at', null)
        .order('created_at', { ascending: false })
        .limit(100);
      const globalPosts = globalPostsData || [];

      // Resolve author names via the safe directory (peers aren't readable on the
      // base profiles table anymore).
      const authorMap = await fetchAuthorMap([
        ...groupPosts.map(p => p.user_id),
        ...globalPosts.map(p => p.user_id),
      ]);
      const authorName = (uid: string) => {
        const a = authorMap.get(uid);
        return a ? (`${a.first_name || ''} ${a.last_name || ''}`.trim() || "Member") : "Member";
      };

      const formattedAnnouncements = (announcements || []).map(a => ({
        id: a.id,
        isAnnouncement: true,
        type: a.category || "Announcement",
        title: a.title,
        body: "",
        cta: a.cta_text || "Read more",
        date: new Date(a.created_at).toLocaleDateString(),
        image: false,
        created_at: a.created_at
      }));

      const formattedPosts = groupPosts.map(p => ({
        id: p.id,
        isGroupPost: true,
        groupId: p.groups?.id,
        groupName: p.groups?.name || "Group",
        groupType: p.groups?.group_type || "standard",
        authorName: authorName(p.user_id),
        authorId: p.user_id,
        body: p.content,
        image_url: p.image_url,
        comment_policy: p.comment_policy,
        date: new Date(p.created_at).toLocaleDateString(),
        created_at: p.created_at
      }));

      const formattedGlobalPosts = globalPosts.map(p => ({
        id: p.id,
        isGlobalPost: true,
        type: "Community Post",
        authorName: authorName(p.user_id),
        authorId: p.user_id,
        body: p.content,
        image_url: p.image_url,
        comment_policy: p.comment_policy,
        date: new Date(p.created_at).toLocaleDateString(),
        created_at: p.created_at
      }));

      const combined = [...formattedAnnouncements, ...formattedPosts, ...formattedGlobalPosts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFeedItems(combined);
      setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleCreateGlobalPost = async (content: string, opts?: { imageUrl?: string | null; commentPolicy?: string }) => {
    if (!user) return false;
    const { error } = await supabase.from('global_posts').insert({
      user_id: user.id,
      content,
      image_url: opts?.imageUrl ?? null,
      comment_policy: opts?.commentPolicy ?? 'anyone',
    });
    if (error) {
      console.error("Failed to create post:", error);
      return false;
    }
    await fetchFeed();
    return true;
  };

  return (
    <div className="space-y-4">
      {onboarded === false && setOnboarded && (
        <GettingStartedWidget setOnboarded={setOnboarded} />
      )}
      <PostComposer onPost={handleCreateGlobalPost} placeholder="Share something with the whole community..." />

      {loading ? (
        <div className="p-12 text-center text-sm" style={{ color: theme.textMuted }}>
          Loading feed...
        </div>
      ) : feedItems.length > 0 ? (
        feedItems.map((item) => (
          <FeedPost key={item.id} item={item} navigate={navigate} onChanged={fetchFeed} />
        ))
      ) : (
        <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
          No new updates right now. Check back later!
        </div>
      )}
    </div>
  );
}

// ── Profile (read-only) ──────────────────────────────────────────────


export const PARTIES = [
  "No affiliation", "Independent", "Australian Labor Party", "Liberal Party of Australia",
  "The Nationals", "Australian Greens", "One Nation", "Family First",
  "Australian Christians", "Other",
];

const STATES = [
  "Australian Capital Territory", "New South Wales", "Northern Territory",
  "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
];

export const TRADITIONS = [
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
  avatarUrl?: string;
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
  avatarUrl: "",
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
  const { user, refreshProfile, updateProfileLocally } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [suburbSearch, setSuburbSearch] = useState("");
  const [suburbsData, setSuburbsData] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function searchSuburbs() {
      if (suburbSearch.length < 2) {
        setSuburbsData([]);
        return;
      }
      const { data } = await supabase.from('suburbs')
        .select('*')
        .ilike('suburb_name', `${suburbSearch}%`)
        .limit(10);
      if (!cancelled && data) setSuburbsData(data);
    }
    searchSuburbs();
    return () => { cancelled = true; };
  }, [suburbSearch]);

  const suburbOptions = suburbsData.map(s => `${s.suburb_name}, ${s.state} ${s.postcode}`);

  const handleSuburbSelect = (val: string) => {
    setSuburbSearch(val);
    const selected = suburbsData.find(s => `${s.suburb_name}, ${s.state} ${s.postcode}` === val);
    if (selected) {
      setDraft(prev => ({
        ...prev,
        state: selected.state,
        federalElectorate: selected.federal_electorate || "",
        stateElectorate: selected.state_electorate || ""
      }));
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data && !error) {
        const { data: priv } = await supabase.from("profile_private").select("party, tradition").eq("user_id", user.id).maybeSingle();
        const loadedProfile = {
          firstName: data.first_name || user.user_metadata?.first_name || "",
          lastName: data.last_name || user.user_metadata?.last_name || "",
          jobTitle: data.job_title || "",
          bio: data.bio || "",
          state: data.state || "",
          federalElectorate: data.federal_electorate || "",
          stateElectorate: data.state_electorate || "",
          party: priv?.party || "No affiliation",
          tradition: priv?.tradition || "",
          showParty: data.show_party || false,
          avatarUrl: data.avatar_url || "",
        };
        setProfile(loadedProfile);
        setDraft(loadedProfile);
      } else {
        const fallbackProfile = {
          ...DEFAULT_PROFILE,
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
        };
        setProfile(fallbackProfile);
        setDraft(fallbackProfile);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const startEdit = () => { setDraft(profile); setEditing(true); };
  const save = async () => {
    if (!user) return;
    setProfile(draft);
    setEditing(false);
    
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: draft.firstName,
      last_name: draft.lastName,
      job_title: draft.jobTitle,
      bio: draft.bio,
      state: draft.state,
      federal_electorate: draft.federalElectorate,
      state_electorate: draft.stateElectorate,
      show_party: draft.showParty,
      avatar_url: draft.avatarUrl,
    });

    if (error) {
      alert("Error saving profile: " + error.message);
      return;
    }
    await supabase.from("profile_private").upsert({ user_id: user.id, party: draft.party, tradition: draft.tradition });
    
    updateProfileLocally({
      first_name: draft.firstName,
      last_name: draft.lastName,
      job_title: draft.jobTitle,
      bio: draft.bio,
      state: draft.state,
      federal_electorate: draft.federalElectorate,
      state_electorate: draft.stateElectorate,
      party: draft.party,
      tradition: draft.tradition,
      show_party: draft.showParty,
      avatar_url: draft.avatarUrl,
    });
    refreshProfile(); // background sync
  };
  const cancel = () => setEditing(false);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      setLoading(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        alert("Error uploading image");
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      setDraft({ ...draft, avatarUrl: data.publicUrl });
      setLoading(false);
    } catch (error) {
      console.error("Error uploading avatar", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-gray-500">Loading profile...</div>;
  }

  const safeFirst = profile?.firstName || "";
  const safeLast = profile?.lastName || "";
  const initials = (safeFirst[0] || "") + (safeLast[0] || "");

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-32" style={{ background: "#f1f5f9" }} />
        <div className="px-6 pb-5 -mt-12">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" style={{ border: `4px solid ${theme.cardBg}` }} />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl"
              style={{ background: NAVY, border: `4px solid ${theme.cardBg}`, fontWeight: 600 }}
            >
              {initials}
            </div>
          )}
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
                <Lock size={11} /> You control what you share · Manage this in Privacy settings
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
          <div className="flex flex-col gap-4">
            <div className="col-span-full">
              <label className="text-xs font-bold mb-1 block" style={{ color: theme.text }}>Profile Picture</label>
              <div className="flex items-center gap-4">
                {draft.avatarUrl ? (
                  <img src={draft.avatarUrl} alt="Draft Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white" style={{ background: NAVY }}>{initials}</div>
                )}
                <div>
                  <input type="file" accept="image/*" id="avatarUpload" className="hidden" onChange={uploadAvatar} disabled={loading} />
                  <label htmlFor="avatarUpload" className="cursor-pointer px-4 py-2 text-sm rounded-lg border inline-block" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                    {loading ? "Uploading..." : "Upload new image"}
                  </label>
                </div>
              </div>
            </div>
            <FormField label="First name">
              <TextInput value={draft.firstName} onChange={(v) => setDraft({ ...draft, firstName: v })} />
            </FormField>
            <FormField label="Last name">
              <TextInput value={draft.lastName} onChange={(v) => setDraft({ ...draft, lastName: v })} />
            </FormField>
            <FormField label="Job title or secondary title" hint="Shown under your name. Optional.">
              <TextInput value={draft.jobTitle} onChange={(v) => setDraft({ ...draft, jobTitle: v })} placeholder="e.g. Policy Adviser, Lay leader" />
            </FormField>
            <FormField label="Suburb or Postcode" hint="Updates your state and electorates automatically.">
              <AutocompleteInput 
                value={suburbSearch} 
                onChange={handleSuburbSelect} 
                options={suburbOptions} 
                placeholder="e.g. Sydney, NSW 2000" 
              />
              {(draft.state || draft.federalElectorate || draft.stateElectorate) && (
                <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                  <span className="font-semibold">State:</span> {draft.state || 'Unknown'} · <span className="font-semibold">Federal:</span> {draft.federalElectorate || 'Unknown'} · <span className="font-semibold">State Electorate:</span> {draft.stateElectorate || 'Unknown'}
                </div>
              )}
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
              <div className="text-center text-sm py-8" style={{ color: theme.textMuted }}>
                No activity to show yet.
              </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Groups discovery ─────────────────────────────────────────────────
function GroupCard({ g, navigate, onJoin }: { g: any; navigate: (s: Screen) => void; onJoin?: (id: string) => void }) {
  const { theme } = useTheme();
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {g.image_url ? (
          <img src={g.image_url} alt={g.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div
            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: theme.pillBg, color: NAVY, fontWeight: 700 }}
          >
            {(g.name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                localStorage.setItem('activeGroupId', g.id);
                navigate("group-detail");
              }}
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
          <div className={`flex items-start sm:items-center mt-3 ${g.joined ? "justify-between" : "justify-end"}`}>
            {g.joined && <span className="text-xs shrink-0 mt-1 sm:mt-0" style={{ color: theme.textSubtle }}>{g.members} members</span>}
            {g.joined ? (
              <GhostButton onClick={() => {
                localStorage.setItem('activeGroupId', g.id);
                navigate("group-detail");
              }}>Open</GhostButton>
            ) : g.allowed === false ? (
              <div className="text-[11px] flex items-start gap-1.5 max-w-full text-left" style={{ color: "#92400e", background: "#fff7ed", padding: "6px 10px", borderRadius: "6px" }}>
                <Lock size={12} className="shrink-0 mt-0.5" /> 
                <span style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>{g.restrictionMessage}</span>
              </div>
            ) : (
              <PrimaryButton onClick={() => onJoin?.(g.id)}>Join</PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

type GroupVisibility = "public" | "private" | "restricted";
type Caveat = "electorate" | "party" | "tradition";

const CAVEAT_OPTIONS: { id: Caveat; label: string; hint: string; icon: any }[] = [
  { id: "electorate", label: "Same federal electorate", hint: "Members must list the same federal electorate as the group's electorate.", icon: MapPin },
  { id: "party",      label: "Same political party",   hint: "Members must list the same political party affiliation.", icon: Flag },
  { id: "tradition",  label: "Same Christian tradition", hint: "Members must share the same Christian tradition.", icon: Church },
];

function CreateGroupModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [vis, setVis] = useState<GroupVisibility>("private");
  const [caveat, setCaveat] = useState<Caveat>("electorate");
  const [caveatValue, setCaveatValue] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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
      setImageUrl(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

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
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold block" style={{ color: theme.text }}>Group Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Group Preview" className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: NAVY }}>
                      {name ? name.split(" ").map(w => w[0] || "").slice(0, 2).join("") : "Img"}
                    </div>
                  )}
                  <div>
                    <input type="file" accept="image/*" id="groupImageUpload" className="hidden" onChange={uploadImage} disabled={uploadingImage} />
                    <label htmlFor="groupImageUpload" className="cursor-pointer px-4 py-2 text-sm rounded-lg border inline-block" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      {uploadingImage ? "Uploading..." : "Upload image"}
                    </label>
                  </div>
                </div>
              </div>
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
                      <AutocompleteInput value={caveatValue} onChange={setCaveatValue} options={FEDERAL_ELECTORATES} placeholder="e.g. Bennelong" />
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
                {/* Network invites disabled for now */}
              <div className="mt-3 text-xs" style={{ color: theme.textSubtle }}>
                0 people selected
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
              onClick={async () => {
                if (user) {
                  // Caveats only apply to restricted groups. For party/tradition the
                  // select displays the first option as selected even when the user
                  // never changed it (caveatValue stays ""), so coerce to that shown
                  // default — otherwise the group stores an empty caveat and becomes
                  // unjoinable.
                  const isRestricted = vis === "restricted";
                  const effCaveatType = isRestricted ? caveat : null;
                  const effCaveatValue = !isRestricted ? null
                    : caveat === "party"     ? (caveatValue || PARTIES[0])
                    : caveat === "tradition" ? (caveatValue || TRADITIONS[0])
                    : caveatValue;
                  if (isRestricted && !effCaveatValue) {
                    alert("Please choose the criterion members must match (e.g. an electorate).");
                    return;
                  }
                  const { data, error } = await supabase.from("groups").insert({
                    name,
                    description: desc,
                    visibility: vis,
                    caveat_type: effCaveatType,
                    caveat_value: effCaveatValue,
                    image_url: imageUrl,
                    created_by: user.id
                  }).select().single();
                  
                  if (error) {
                    alert("Error creating group: " + error.message);
                    return;
                  }
                  
                  if (data) {
                    await supabase.from("group_members").insert({
                      group_id: data.id,
                      user_id: user.id,
                      role: "admin"
                    });
                    onCreate(name);
                  }
                }
              }}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
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
  const { user } = useAuth();
  const [tab, setTab] = useState<"joined" | "discover" | "yours">("joined");
  const [createOpen, setCreateOpen] = useState(false);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [myProfile, setMyProfile] = useState<any>(null);

  const fetchGroups = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data: groups } = await supabase.from("groups").select("*").is("deleted_at", null).is("suspended_at", null).neq("group_type", "organisation");
      const { data: members } = await supabase.from("group_members").select("group_id").eq("user_id", user.id);
      const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: priv } = await supabase.from("profile_private").select("party, tradition").eq("user_id", user.id).maybeSingle();
      const profile = profileRow ? { ...profileRow, party: priv?.party ?? null, tradition: priv?.tradition ?? null } : profileRow;

      let currentGroups = groups || [];
      let currentMemberships = new Set(members?.map((m: any) => m.group_id) || []);

      if (profile) {
        // Auto-sync missing affinity groups for instant recognition
        const ensureSync = async (type: string, val: string) => {
          if (!val || val === "No affiliation" || val === "Not applicable") return;
          let g = currentGroups.find(x => x.caveat_type === type && x.caveat_value === val);
          if (!g) {
            const name = type === 'party' ? `${val} Members` : type === 'tradition' ? `${val} Tradition` : `${val} Electorate`;
            const { data: newG } = await supabase.from('groups').insert({
              name,
              description: `Exclusive group for ${val} ${type === 'party' ? 'members' : type}.`,
              visibility: 'restricted',
              group_type: 'standard',
              caveat_type: type,
              caveat_value: val,
              created_by: user.id
            }).select().single();
            if (newG) {
              g = newG;
              currentGroups = [...currentGroups, g];
            }
          }
          if (g && !currentMemberships.has(g.id)) {
            await supabase.from('group_members').upsert({ group_id: g.id, user_id: user.id });
            currentMemberships.add(g.id);
          }
        };

        await ensureSync('party', profile.party);

        // Cleanup accidentally auto-created tradition/electorate groups created by this user
        const autoCreated = currentGroups.filter(g => 
          g.created_by === user.id && 
          (g.caveat_type === 'tradition' || g.caveat_type === 'electorate') &&
          g.description.startsWith('Exclusive group for ')
        );
        if (autoCreated.length > 0) {
          for (const bg of autoCreated) {
            await supabase.from('group_members').delete().eq('group_id', bg.id);
            await supabase.from('groups').delete().eq('id', bg.id);
          }
          currentGroups = currentGroups.filter(g => !autoCreated.find(a => a.id === g.id));
        }
      }

      setAllGroups(currentGroups);
      setMyMemberships(currentMemberships);
      if (profile) setMyProfile(profile);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleJoin = async (groupId: string) => {
    if (!user) return;
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id
    });
    if (!error) {
      fetchGroups();
    } else {
      alert("Error joining group: " + error.message);
    }
  };

  const list = allGroups.map(g => {
    let allowed = true;
    let restrictionMessage = "";

    if (g.visibility === "restricted") {
      if (g.caveat_type === "electorate" && myProfile?.federal_electorate !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must be in the ${g.caveat_value} electorate to join.`;
      } else if (g.caveat_type === "party" && myProfile?.party !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must be affiliated with ${g.caveat_value} to join.`;
      } else if (g.caveat_type === "tradition" && myProfile?.tradition !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must share the ${g.caveat_value} tradition to join.`;
      }
    }

    return {
      id: g.id,
      name: g.name,
      desc: g.description,
      members: 1, // Optional: You can do a count query later
      joined: myMemberships.has(g.id),
      visibility: g.visibility,
      created_by: g.created_by,
      image_url: g.image_url,
      allowed,
      restrictionMessage
    };
  }).filter(g => {
    if (tab === "joined") return g.joined;
    if (tab === "discover") return !g.joined;
    if (tab === "yours") return g.created_by === user?.id;
    return false;
  });

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

      {loading ? (
        <Card className="p-10 text-center text-sm text-gray-500">Loading groups...</Card>
      ) : list.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {list.map((g) => <GroupCard key={g.id} g={g} navigate={navigate} onJoin={handleJoin} />)}
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
          onCreate={() => { setCreateOpen(false); fetchGroups(); }}
        />
      )}
    </div>
  );
}

// ── Group detail ─────────────────────────────────────────────────────

function ConnectModal({ name, onClose, onSend }: { name: string; onClose: () => void; onSend: () => void }) {
  const { theme } = useTheme();
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 style={{ color: theme.text, fontWeight: 600 }}>Send connection request?</h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
          Send a connection request to <strong style={{ color: theme.text }}>{name}</strong>.
          Direct messaging will become available once they accept.
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
  const [connectUser, setConnectUser] = useState<{id: string, name: string} | null>(null);
  // Peer ids the current user is already connected to or has a pending request with,
  // so the Members tab can show Connected / Request sent instead of Connect.
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"feed" | "members" | "events" | "resources" | "about">("feed");
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupCreator, setGroupCreator] = useState("Loading...");
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [numFollowers, setNumFollowers] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useAuth();

  const refreshGroupPosts = async () => {
    if (!group) return;
    const { data } = await supabase.from('group_posts')
      .select('*')
      .eq('group_id', group.id)
      .is('removed_at', null)
      .order('created_at', { ascending: false });
    if (data) setGroupPosts(await attachAuthors(data));
  };

  const initGroup = useCallback(async () => {
      const groupId = localStorage.getItem('activeGroupId');
      if (!groupId) {
        navigate('groups');
        return;
      }
      const { data } = await supabase.from('groups').select('*').eq('id', groupId).single();
      if (data) {
        setGroup(data);
        if (data.created_by) {
          const { data: creator } = await supabase.from('member_directory').select('first_name, last_name').eq('id', data.created_by).maybeSingle();
          if (creator) {
            setGroupCreator(`${creator.first_name || ''} ${creator.last_name || ''}`.trim() || "Anonymous Member");
          } else {
            setGroupCreator("Admin");
          }
        }
      }
      
      const { data: postsData } = await supabase.from('group_posts')
        .select('*')
        .eq('group_id', groupId)
        .is('removed_at', null)
        .order('created_at', { ascending: false });
      if (postsData) setGroupPosts(await attachAuthors(postsData));
      setLoadingGroup(false);
      
      if (user) {
        const { data: myProf } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (myProf) setIsAdmin(myProf.is_admin || user.email?.endsWith("@christiansinpolitics.com") || false);

        // Load the current user's connections to label member cards correctly.
        const { data: conns } = await supabase.from('network_connections')
          .select('status, requester_id, receiver_id')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
        if (conns) {
          const accepted = new Set<string>();
          const pending = new Set<string>();
          for (const c of conns) {
            const peer = c.requester_id === user.id ? c.receiver_id : c.requester_id;
            if (c.status === 'accepted') accepted.add(peer);
            else if (c.status === 'pending') pending.add(peer);
          }
          setConnectedIds(accepted);
          setPendingIds(pending);
        }

        // Only fetch actual group members
        const { data: groupMembers } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
        if (groupMembers && groupMembers.length > 0) {
          setNumFollowers(groupMembers.length);
          setIsFollowing(groupMembers.some(m => m.user_id === user.id));
          const userIds = groupMembers.map(m => m.user_id).filter(id => id !== user.id);
          if (userIds.length > 0) {
            const { data: members } = await supabase.from('member_directory').select('*').in('id', userIds);
            if (members) setDbMembers(members);
          }
        }
      }
  }, [user, navigate]);

  useEffect(() => {
    initGroup();
  }, [initGroup]);

  const allMembers = [
    ...dbMembers.map(m => ({
      id: m.id,
      name: `${m.first_name || 'Member'} ${m.last_name || ''}`.trim(),
      state: m.state || '',
      bio: m.bio || 'New member',
      connected: connectedIds.has(m.id),
      pending: pendingIds.has(m.id),
    }))
  ];

  const handleDelete = async () => {
    if (!group || !window.confirm("Are you sure you want to delete this group?")) return;
    const { error } = await supabase.from('groups').delete().eq('id', group.id);
    if (error) {
      alert("Failed to delete group: " + error.message);
      return;
    }
    navigate('groups');
  };

  if (loadingGroup) {
    return <div className="p-12 text-center text-sm" style={{ color: theme.textMuted }}>Loading group...</div>;
  }
  if (!group) {
    return <div className="p-12 text-center text-sm" style={{ color: theme.textMuted }}>Group not found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden">
        {group.group_type === 'organisation' ? (
          <div className="bg-white">
            <div className="px-5 py-5">
              {/* Top-right buttons (Back, Edit, Delete) */}
              <div className="flex justify-end gap-3 items-center mb-4">
                {(group.created_by === user?.id || isAdmin) && (
                  <>
                    <button onClick={() => setEditOpen(true)} className="text-xs hover:underline" style={{ color: NAVY }}>
                      Edit
                    </button>
                    <button onClick={handleDelete} className="text-xs hover:underline text-red-600">
                      Delete
                    </button>
                  </>
                )}
                <button onClick={() => navigate("organisations")} className="text-xs hover:underline" style={{ color: NAVY }}>
                  ← All organisations
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="p-1 bg-white rounded-2xl shadow-sm shrink-0" style={{ border: `1px solid ${theme.cardBorder}` }}>
                  {group.image_url ? (
                    <img src={group.image_url} alt={group.name} className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover" />
                  ) : (
                    <div
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center"
                      style={{ background: GOLD, color: "#fff", fontWeight: 700, fontSize: 32 }}
                    >
                      {(group.name || "ORG").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                    </div>
                  )}
                </div>

                <div className="flex-1 mt-1 sm:mt-0">
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.text }}>{group.name}</h1>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: theme.text }}>
                    {group.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm mt-3" style={{ color: theme.textMuted }}>
                    <span className="font-medium text-gray-500">Organisation</span>
                    <span>•</span>
                    <span>{numFollowers} followers</span>
                    {group.website_url && (
                      <>
                        <span>•</span>
                        <a href={group.website_url.startsWith('http') ? group.website_url : `https://${group.website_url}`} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1 text-blue-600">
                          <ExternalLink size={12} /> Website
                        </a>
                      </>
                    )}
                  </div>

                  {/* Follow & Message Buttons */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        if (isFollowing) {
                          await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", user.id);
                          setIsFollowing(false);
                          setNumFollowers(f => f - 1);
                        } else {
                          await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id });
                          setIsFollowing(true);
                          setNumFollowers(f => f + 1);
                        }
                      }}
                      className="px-5 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
                      style={{ background: isFollowing ? "transparent" : NAVY, color: isFollowing ? NAVY : "#fff", border: isFollowing ? `1px solid ${NAVY}` : "none" }}
                    >
                      {isFollowing ? <CheckCircle2 size={16} /> : <Plus size={16} />} 
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    {group.created_by !== user?.id && (
                      <button
                        onClick={async () => {
                          if (!user || !group.created_by) return;
                          const existing = await findConnection(user.id, group.created_by);
                          if (existing?.status === 'accepted') {
                            localStorage.setItem('activeMessageUserId', group.created_by);
                            navigate('messages');
                            return;
                          }
                          if (existing?.status === 'pending') { alert('Connection request already pending.'); return; }
                          const status = await sendConnectionRequest(user.id, group.created_by);
                          alert(status ? 'Connection request sent. You can message once it is accepted.' : 'Could not send request.');
                        }}
                        className="px-5 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
                        style={{ background: "transparent", color: NAVY, border: `1px solid ${NAVY}` }}
                      >
                        {connectedIds.has(group.created_by) ? <><Send size={14} /> Message</> : <><UserPlus size={14} /> Connect</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {group.image_url ? (
                  <img src={group.image_url} alt={group.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center"
                    style={{ background: GOLD, color: "#fff", fontWeight: 700, fontSize: 20 }}
                  >
                    {(group.name || "GRP").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                  </div>
                )}
                <div>
                  <h1 className="text-xl" style={{ color: theme.text, fontWeight: 600 }}>{group.name}</h1>
                  <div className="flex items-center gap-3 text-xs mt-1" style={{ color: theme.textMuted }}>
                    <span className="inline-flex items-center gap-1"><Users size={12} /> {numFollowers} members</span>
                    <span className="inline-flex items-center gap-1"><Globe size={12} /> <span className="capitalize">{group.visibility}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(group.created_by === user?.id || isAdmin) && (
                  <button onClick={handleDelete} className="text-xs hover:underline text-red-600">
                    Delete group
                  </button>
                )}
                <button onClick={() => navigate("groups")} className="text-xs hover:underline" style={{ color: NAVY }}>
                  ← All groups
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Tabs */}
          <div className="px-5 mt-2 flex gap-1 overflow-x-auto" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            {([
              ["feed", "Feed"],
              ["members", group.group_type === 'organisation' ? "Employees" : "Members"],
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
      </Card>

      {tab === "feed" && (
        <div className="space-y-4">
          {/* Composer */}
          <Card className="p-4">
            <PostComposer
              onPost={async (content, opts) => {
                if (!group || !user) return false;
                const { error } = await supabase.from('group_posts').insert({
                  group_id: group.id,
                  user_id: user.id,
                  content,
                  image_url: opts?.imageUrl ?? null,
                  comment_policy: opts?.commentPolicy ?? 'anyone',
                });
                if (error) return false;
                await refreshGroupPosts();
                return true;
              }}
              placeholder="Share something with the group..."
            />
          </Card>

          {groupPosts.length > 0 ? (
            groupPosts.map((post: any) => {
              const authorName = post.profiles ? `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() || "Member" : "Member";
              return (
                <MemberPost
                  key={post.id}
                  postType="group"
                  postId={post.id}
                  authorId={post.user_id}
                  authorName={authorName}
                  subtitle={new Date(post.created_at).toLocaleDateString()}
                  body={post.content}
                  imageUrl={post.image_url}
                  commentPolicy={post.comment_policy}
                  groupId={group.id}
                  canModerate={isAdmin || group.created_by === user?.id}
                  navigate={navigate}
                  onChanged={refreshGroupPosts}
                  footer={post.user_id !== user?.id ? <MessageAuthorButton targetUserId={post.user_id} navigate={navigate} /> : null}
                />
              );
            })
          ) : (
            <div className="text-center text-sm py-10" style={{ color: theme.textMuted }}>
              No posts in this group yet.
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>
              {group.group_type === 'organisation' ? 'Employees' : 'Members'} ({allMembers.length})
            </h3>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {allMembers.map((m) => (
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
                    {(m.name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>
                      <MemberNameLink userId={m.id} name={m.name} navigate={navigate} />
                    </div>
                    <div className="text-[11px]" style={{ color: theme.textSubtle }}>{m.state}</div>
                  </div>
                </div>
                <p className="text-xs mt-2 leading-snug" style={{ color: theme.textMuted }}>{m.bio}</p>
                <div className="mt-3">
                  {m.connected ? (
                    <Pill color="#d1fae5" fg="#065f46">Connected</Pill>
                  ) : m.pending ? (
                    <Pill color="#fef3c7" fg="#92400e">Request sent</Pill>
                  ) : (
                    <button
                      onClick={() => setConnectUser({ id: m.id, name: m.name })}
                      className="text-xs px-3 py-1.5 rounded-lg w-full inline-flex items-center justify-center gap-1.5"
                      style={{ background: NAVY, color: "#fff", fontWeight: 500, cursor: "pointer" }}
                    >
                      <UserPlus size={11} /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "events" && (
        <Card className="p-5">
          <h3 className="text-sm mb-3" style={{ color: theme.text, fontWeight: 600 }}>Group events</h3>
          <div className="space-y-3">
            <div className="text-center py-6 text-sm" style={{ color: theme.textMuted }}>
              No events scheduled for this group.
            </div>
          </div>
        </Card>
      )}

      {tab === "resources" && (
        <Card className="p-5">
          <h3 className="text-sm mb-3" style={{ color: theme.text, fontWeight: 600 }}>Group resources</h3>
          <div className="space-y-3">
            <div className="text-center py-6 text-sm" style={{ color: theme.textMuted }}>
              No resources have been shared in this group.
            </div>
          </div>
        </Card>
      )}

      {tab === "about" && (
        <Card className="p-5">
          <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>About this {group.group_type === 'organisation' ? 'organisation' : 'group'}</h3>
          <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: theme.textMuted }}>
            {group.description || "No description provided."}
          </p>

          {group.group_type === 'organisation' ? (
             <>
               {group.website_url && (
                 <div className="mt-5">
                   <h4 className="text-xs uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>Website</h4>
                   <a href={group.website_url.startsWith('http') ? group.website_url : `https://${group.website_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm hover:underline" style={{ color: NAVY, fontWeight: 500 }}>
                     <ExternalLink size={14} /> {group.website_url}
                   </a>
                 </div>
               )}
               <div className="mt-5">
                 <h4 className="text-xs uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>Contact</h4>
                 <div className="mt-2 text-sm" style={{ color: theme.text }}>Managed by <MemberNameLink userId={group?.created_by} name={groupCreator} navigate={navigate} /></div>
                 {group.created_by !== user?.id && (
                   <button
                     onClick={async () => {
                       if (!user || !group.created_by) return;
                       const existing = await findConnection(user.id, group.created_by);
                       if (existing?.status === 'accepted') {
                         localStorage.setItem('activeMessageUserId', group.created_by);
                         navigate('messages');
                         return;
                       }
                       if (existing?.status === 'pending') { alert('Connection request already pending.'); return; }
                       const status = await sendConnectionRequest(user.id, group.created_by);
                       alert(status ? 'Connection request sent. You can message once it is accepted.' : 'Could not send request.');
                     }}
                     className="mt-3 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
                     style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
                   >
                     {connectedIds.has(group.created_by)
                       ? <><MessageCircle size={16} /> Message Organisation</>
                       : <><UserPlus size={16} /> Connect with Organisation</>}
                   </button>
                 )}
               </div>
             </>
          ) : (
            <>
              <h4 className="text-xs mt-5 uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>
                Group rules
              </h4>
              <ol className="mt-2 space-y-1.5 text-sm list-decimal pl-5" style={{ color: theme.text }}>
                <li>Speak with charity. Disagree without contempt.</li>
                <li>No partisan campaigning. Reflection and discussion only.</li>
                <li>Respect every member's privacy and the details they choose to share.</li>
                <li>Keep group conversations inside the group.</li>
                <li>Report concerns to the moderators or CiP staff.</li>
              </ol>
              <h4 className="text-xs mt-5 uppercase tracking-wider" style={{ color: theme.textMuted, fontWeight: 600 }}>
                Moderators
              </h4>
              <div className="mt-2 text-sm" style={{ color: theme.text }}><MemberNameLink userId={group?.created_by} name={groupCreator} navigate={navigate} /></div>
            </>
          )}
        </Card>
      )}

      {connectUser && (
        <ConnectModal
          name={connectUser.name}
          onClose={() => setConnectUser(null)}
          onSend={async () => {
            const target = connectUser;
            setConnectUser(null);
            if (user && target.id.length > 10) {
              const status = await sendConnectionRequest(user.id, target.id);
              if (status === 'pending') setPendingIds(prev => new Set(prev).add(target.id));
            }
          }}
        />
      )}
      {editOpen && (
        <OrganisationFormModal
          initialData={group}
          onClose={() => setEditOpen(false)}
          onSave={() => { setEditOpen(false); initGroup(); }}
        />
      )}
    </div>
  );
}

// ── Events ───────────────────────────────────────────────────────────

export function EventsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      if (data) setEvents(data);
      setLoading(false);
    }
    loadEvents();
  }, []);

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
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays size={24} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
              <div className="text-sm font-bold" style={{ color: theme.text }}>No upcoming events</div>
              <div className="text-xs mt-1" style={{ color: theme.textMuted }}>Check back later for new gatherings and forums.</div>
            </div>
          ) : (
            events.map((e, i) => (
              <button
                key={e.id}
                onClick={() => { localStorage.setItem('activeEventId', e.id); navigate("event-detail"); }}
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
                    <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.location}</span>
                  </div>
                </div>
                <Pill color={e.type === "Online" ? "#dbeafe" : "#fef3c7"}>{e.type}</Pill>
                <ChevronRight size={14} style={{ color: theme.textSubtle }} />
              </button>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export function EventDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      const eventId = localStorage.getItem('activeEventId');
      if (!eventId) {
        navigate('events');
        return;
      }
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (data) setEvent(data);
      setLoading(false);
    }
    loadEvent();
  }, [navigate]);

  if (loading) {
    return <div className="p-12 text-center text-sm" style={{ color: theme.textMuted }}>Loading event...</div>;
  }
  if (!event) {
    return <div className="p-12 text-center text-sm" style={{ color: theme.textMuted }}>Event not found.</div>;
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate("events")} className="text-xs hover:underline" style={{ color: NAVY }}>
        ← All events
      </button>
      <Card className="overflow-hidden">
        <div className="h-44" style={{ background: "#f1f5f9" }} />
        <div className="p-6">
          <Pill color="#dbeafe">{event.type || 'In-person'}</Pill>
          <h1 className="mt-3" style={{ color: theme.text }}>{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm" style={{ color: theme.textMuted }}>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {event.date}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {event.location}</span>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: theme.text }}>
            {event.description || "No description provided."}
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

export function MessagesScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [active, setActive] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [connections, setConnections] = useState<any[]>([]);
  // Peers with an accepted connection — kept separate from `connections` because
  // that list can also hold synthesized (not-yet-connected) conversations opened
  // via a deep-link. Used to decide whether the composer is unlocked.
  const [acceptedPeerIds, setAcceptedPeerIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerText, setComposerText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Tracks the open conversation so in-flight message fetches can discard their
  // results if the user has since switched conversations.
  const activePeerRef = useRef<string | null>(null);
  activePeerRef.current = active?.peerId ?? null;
  // Ensures the incoming deep-link is consumed exactly once (survives the
  // StrictMode dev double-mount).
  const deepLinkHandledRef = useRef(false);

  const loadNetwork = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('network_connections')
      .select('id, status, requester_id, receiver_id')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (data) {
      const dir = await fetchAuthorMap(data.map(c => (c.requester_id === user.id ? c.receiver_id : c.requester_id)));
      const acc: any[] = [];
      const accepted = new Set<string>();
      for (const c of data) {
         const peerId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
         const peer = dir.get(peerId);
         if (!peer) continue;
         accepted.add(peer.id);

         acc.push({
           id: c.id,
           peerId: peer.id,
           name: `${peer.first_name || 'Unknown'} ${peer.last_name || ''}`.trim(),
           title: peer.job_title || 'Member',
           group: "CiP Network",
           unread: 0,
           last: "",
           time: "",
         });
      }
      setAcceptedPeerIds(accepted);
      // Preserve any synthesized deep-link conversation already in the list.
      setConnections(prev => {
        const synthesized = prev.filter(c => !accepted.has(c.peerId) && String(c.id).startsWith('dm-'));
        return [...synthesized, ...acc];
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNetwork();
  }, [user]);

  // Deep-link: when navigated from a "Message" action, always open a chat with
  // the target — even if they aren't an accepted connection yet (synthesize a
  // conversation). History then loads via the [active] effect below.
  useEffect(() => {
    if (loading || deepLinkHandledRef.current || !user) return;
    const targetUserId = localStorage.getItem('activeMessageUserId');
    if (!targetUserId) return;
    deepLinkHandledRef.current = true;
    localStorage.removeItem('activeMessageUserId');
    (async () => {
      const existing = connections.find(c => c.peerId === targetUserId);
      if (existing) { setActive(existing); return; }
      const dir = await fetchAuthorMap([targetUserId]);
      const peer = dir.get(targetUserId);
      const convo = {
        id: `dm-${targetUserId}`,
        peerId: targetUserId,
        name: peer ? `${peer.first_name || 'Member'} ${peer.last_name || ''}`.trim() : 'Member',
        title: peer?.job_title || 'Member',
        group: 'CiP Network',
        unread: 0, last: '', time: '',
      };
      setConnections(prev => prev.some(c => c.peerId === targetUserId) ? prev : [convo, ...prev]);
      setActive(convo);
    })();
  }, [loading, connections, user]);

  const loadMessages = async (peerId: string) => {
    if (!user || !peerId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    // Drop stale responses: the user may have switched conversations mid-fetch.
    if (activePeerRef.current !== peerId) return;
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        from: m.sender_id === user.id ? 'me' : 'them',
        body: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    }
  };

  useEffect(() => {
    if (active && user) {
       loadMessages(active.peerId);
       const channel = supabase.channel(`messages_${active.peerId}`)
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
             loadMessages(active.peerId);
         }).subscribe();
       return () => { supabase.removeChannel(channel); };
    } else {
       setMessages([]);
    }
  }, [active, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // LinkedIn-style gating: you may send ONE message to someone you're not
  // connected to; the composer then locks until they accept your connection
  // request OR reply to that first message. Connected peers = unlimited.
  const isConnected = active ? acceptedPeerIds.has(active.peerId) : false;
  const theyReplied = messages.some(m => m.from === 'them');
  const iSent = messages.some(m => m.from === 'me');
  const composerLocked = !!active && !isConnected && !theyReplied && iSent;

  const handleSend = async () => {
    if (!user || !active || !composerText.trim() || composerLocked) return;
    const msg = composerText;
    const peerId = active.peerId;
    setComposerText("");

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      from: 'me',
      body: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: peerId,
      content: msg
    });

    if (error) {
      // Roll back the optimistic bubble and restore the draft so it isn't lost.
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setComposerText(msg);
      alert("Message failed to send. Please try again.");
    }
  };

  const filteredConnections = connections.filter(
    (c) => (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col" style={{ background: theme.bg }}>
      <div
        className="px-8 py-5 shrink-0"
        style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.divider}` }}
      >
        <h1 style={{ color: theme.text }}>Messaging</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Direct messaging is only available between members who've accepted a connection request through a shared group.
        </p>
      </div>

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
            <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${theme.divider}` }}>
              <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Conversations</div>
              <div className="relative mt-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages"
                  className="w-full pl-3 pr-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                 <div className="p-8 text-center text-xs" style={{ color: theme.textSubtle }}>Loading conversations...</div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-8 text-center text-xs leading-relaxed" style={{ color: theme.textSubtle }}>
                  You have no active conversations. Start connecting with members in your groups!
                </div>
              ) : (
                filteredConnections.map((c) => {
                  const isActive = active?.id === c.id;
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
                        {(c.name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-12">
                        <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>
                          <MemberNameLink userId={c.peerId} name={c.name} navigate={navigate} />
                        </div>
                        <div className="text-[11px] truncate" style={{ color: theme.textSubtle }}>
                          Connected via {c.group}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right pane */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {active ? (
              <>
                <div
                  className="px-6 py-4 flex items-center gap-3 shrink-0 relative"
                  style={{ borderBottom: `1px solid ${theme.divider}` }}
                >
                  <div
                    className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm"
                    style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                  >
                    {(active.name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base" style={{ color: theme.text, fontWeight: 600 }}>
                      <MemberNameLink userId={active.peerId} name={active.name} navigate={navigate} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
                  {messages.length === 0 && (
                    <div className="text-center text-[11px]" style={{ color: theme.textSubtle }}>
                      This is the beginning of your conversation with {active.name}.
                    </div>
                  )}
                  {messages.map((m) => {
                    const mine = m.from === "me";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
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
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${theme.divider}` }}>
                  {composerLocked && (
                    <div className="mb-2 text-[11px] leading-relaxed flex items-center gap-1.5" style={{ color: theme.textSubtle }}>
                      <Lock size={11} /> You can send one message until {active.name} accepts your connection request or replies.
                    </div>
                  )}
                  <div
                    className="flex items-end gap-2 rounded-2xl px-3 py-2"
                    style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, opacity: composerLocked ? 0.6 : 1 }}
                  >
                    <textarea
                      rows={1}
                      value={composerText}
                      disabled={composerLocked}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => {
                         if (e.key === "Enter" && !e.shiftKey) {
                           e.preventDefault();
                           handleSend();
                         }
                      }}
                      placeholder={composerLocked ? "Waiting for a reply or connection…" : "Write a message…"}
                      className="flex-1 px-2 py-1.5 text-sm outline-none resize-none bg-transparent disabled:cursor-not-allowed"
                      style={{ color: theme.text, minHeight: 32, maxHeight: 120 }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!composerText.trim() || composerLocked}
                      className="px-4 py-1.5 rounded-lg text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      <Send size={13} /> Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: theme.textMuted }}>
                <MessageSquare size={32} className="mb-4 opacity-50" />
                <p className="text-sm">Select a conversation to start messaging</p>
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
          style={{ background: GOLD, color: "#fff", fontWeight: 600 }}
        >
          Continue to donation page <ExternalLink size={14} />
        </button>
      </Card>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────

const NOTIFICATION_PREF_KEYS = [
  { key: "announcements", label: "CiP announcements and events" },
  { key: "group_activity", label: "Group activity in groups I've joined" },
  { key: "connection_requests", label: "New connection requests" },
  { key: "direct_messages", label: "Direct messages" },
  { key: "donation_reminders", label: "Donation reminders" },
] as const;

const DEFAULT_NOTIFICATION_PREFS: Record<string, boolean> = {
  email_enabled: true,
  announcements: true,
  group_activity: true,
  connection_requests: true,
  direct_messages: true,
  donation_reminders: false,
};

function PrefToggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-5 rounded-full relative transition-colors shrink-0"
      style={{ background: on ? NAVY : "#d1d5db" }}
      aria-label={`Toggle ${label}`}
    >
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: on ? 18 : 2 }} />
    </button>
  );
}

// Shared notification-preferences editor — the single writer of
// profiles.notification_preferences (master email toggle + per-type toggles).
export function NotificationPreferences() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(DEFAULT_NOTIFICATION_PREFS);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("notification_preferences").eq("id", user.id).single();
      if (data?.notification_preferences) setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...data.notification_preferences });
      setNotifLoading(false);
    }
    loadPrefs();
  }, [user]);

  const togglePref = async (key: string) => {
    if (!user) return;
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setNotifSaved(false);
    const { error } = await supabase.from("profiles").update({ notification_preferences: updated }).eq("id", user.id);
    if (!error) { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); }
  };

  const emailEnabled = notifPrefs.email_enabled !== false;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Notifications</h3>
        {notifSaved && (
          <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "#d1fae5", color: "#065f46", fontWeight: 500 }}>
            <CheckCircle2 size={10} /> Saved
          </span>
        )}
      </div>
      {notifLoading ? (
        <div className="text-xs py-2 mt-3" style={{ color: theme.textSubtle }}>Loading preferences…</div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            <div className="pr-4">
              <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Email me about notifications</div>
              <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>Sends to {user?.email || "your account email"}. In-app alerts stay on regardless.</div>
            </div>
            <PrefToggle on={emailEnabled} onClick={() => togglePref("email_enabled")} label="Email notifications" />
          </div>
          <div className="space-y-3" style={{ opacity: emailEnabled ? 1 : 0.45 }}>
            {NOTIFICATION_PREF_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
                <span>{label}</span>
                <PrefToggle on={!!notifPrefs[key]} onClick={() => togglePref(key)} label={label} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function NotificationsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (data) setItems(data);
      setLoading(false);
    }
    load();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  };

  const unread = items.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: theme.text }}>Notifications</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Your recent activity and email preferences.</p>
          </div>
          {unread > 0 && <GhostButton onClick={markAllRead}>Mark all read</GhostButton>}
        </div>
      </Card>

      <NotificationPreferences />

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Recent</h3>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-center" style={{ color: theme.textMuted }}>Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-center" style={{ color: theme.textMuted }}>No notifications yet.</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="px-5 py-3 flex items-start gap-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? "transparent" : GOLD }} />
              <div className="min-w-0">
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>{n.title}</div>
                <div className="text-sm" style={{ color: theme.textMuted }}>{n.message}</div>
                <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

export function SettingsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme, dark, toggle } = useTheme();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Notifications</h3>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Manage in-app and email notification preferences.</p>
          </div>
          <GhostButton onClick={() => navigate("notifications")}>Manage notifications</GhostButton>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Account</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between"><span style={{ color: theme.textMuted }}>Email</span><span style={{ color: theme.text }}>{user?.email || "Unknown"}</span></div>
          <div className="flex items-center justify-between"><span style={{ color: theme.textMuted }}>Member since</span><span style={{ color: theme.text }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Just now"}</span></div>
        </div>
        <div className="flex gap-2 mt-4">
          <GhostButton>Change password</GhostButton>
          <GhostButton>Download my data</GhostButton>
        </div>
      </Card>

      <Card className="p-5 border border-red-200">
        <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        <p className="text-xs text-red-500/80 mt-1 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          disabled={isDeleting}
          onClick={async () => {
            if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
              setIsDeleting(true);
              const { error } = await supabase.rpc("delete_current_user");
              if (error) {
                alert("Failed to delete account: " + error.message);
                setIsDeleting(false);
              } else {
                await supabase.auth.signOut();
                navigate("deleted-account");
              }
            }
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
        >
          {isDeleting ? "Deleting..." : "Delete account"}
        </button>
      </Card>
    </div>
  );
}

// ── Privacy ──────────────────────────────────────────────────────────
// Per-field profile visibility, persisted to profiles.privacy_preferences (jsonb),
// mirroring the notification_preferences pattern. The `party` toggle is stored on
// the separate profiles.show_party column. The member_directory view masks each
// field based on these values, so hiding a field removes it for other members.
const PRIVACY_FIELD_KEYS = [
  { key: "show_last_name",  label: "Last name" },
  { key: "show_photo",      label: "Profile photo" },
  { key: "show_job_title",  label: "Job title" },
  { key: "show_bio",        label: "Short bio" },
  { key: "show_state",      label: "Location / state" },
  { key: "show_electorate", label: "Electorate" },
] as const;

const PRIVACY_BEHAVIOUR_KEYS = [
  { key: "allow_connection_requests", label: "Allow new connection requests" },
  { key: "allow_messages",            label: "Allow direct messages from connections" },
] as const;

const DEFAULT_PRIVACY_PREFS: Record<string, boolean> = {
  discoverable: true,
  show_last_name: true,
  show_photo: true,
  show_job_title: true,
  show_bio: true,
  show_state: true,
  show_electorate: true,
  allow_connection_requests: true,
  allow_messages: true,
};

function PrivacyToggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-5 rounded-full relative transition-colors shrink-0"
      style={{ background: on ? NAVY : "#d1d5db" }}
      aria-label={`Toggle ${label}`}
    >
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: on ? 18 : 2 }} />
    </button>
  );
}

export function PrivacyScreen(_props: { navigate?: (s: Screen) => void } = {}) {
  const { theme } = useTheme();
  const { user, updateProfileLocally } = useAuth();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULT_PRIVACY_PREFS);
  const [showParty, setShowParty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("privacy_preferences, show_party")
        .eq("id", user.id)
        .single();
      if (data?.privacy_preferences) setPrefs({ ...DEFAULT_PRIVACY_PREFS, ...data.privacy_preferences });
      setShowParty(!!data?.show_party);
      setLoading(false);
    }
    load();
  }, [user]);

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const togglePref = async (key: string) => {
    if (!user) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    const { error } = await supabase.from("profiles").update({ privacy_preferences: updated }).eq("id", user.id);
    if (!error) { updateProfileLocally({ privacy_preferences: updated }); flashSaved(); }
  };

  const toggleParty = async () => {
    if (!user) return;
    const next = !showParty;
    setShowParty(next);
    const { error } = await supabase.from("profiles").update({ show_party: next }).eq("id", user.id);
    if (!error) { updateProfileLocally({ show_party: next }); flashSaved(); }
  };

  const savedPill = saved && (
    <span
      className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ background: "#d1fae5", color: "#065f46", fontWeight: 500 }}
    >
      <CheckCircle2 size={10} /> Saved
    </span>
  );

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: theme.pillBg }}>
            <ShieldCheck size={18} style={{ color: NAVY }} />
          </div>
          <div>
            <h1 style={{ color: theme.text }}>Privacy & data sharing</h1>
            <p className="text-sm mt-0.5" style={{ color: theme.textMuted }}>
              You decide what you share — from your whole profile down to individual details.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-5"><div className="text-xs" style={{ color: theme.textSubtle }}>Loading your privacy settings…</div></Card>
      ) : (
        <>
          {/* Master discoverability */}
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Discoverable</h3>
                {savedPill}
              </div>
              <PrivacyToggle on={!!prefs.discoverable} onClick={() => togglePref("discoverable")} label="Discoverable" />
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.textMuted }}>
              {prefs.discoverable
                ? "Other members can find you in the Network directory and search, and send you connection requests."
                : "You're hidden from the Network directory and search. Existing connections and your posts still show your first name."}
            </p>
          </Card>

          {/* Per-field sharing */}
          <Card className="p-5" style={{ opacity: prefs.discoverable ? 1 : 0.6 }}>
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>What others can see</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMuted }}>
              Your first name is always shown. Turn off anything you'd rather keep private.
            </p>
            <div className="space-y-3 mt-4">
              {PRIVACY_FIELD_KEYS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
                  <span>{label}</span>
                  <PrivacyToggle on={!!prefs[key]} onClick={() => togglePref(key)} label={label} />
                </div>
              ))}
              <div className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
                <span>Political party</span>
                <PrivacyToggle on={showParty} onClick={toggleParty} label="Political party" />
              </div>
            </div>
          </Card>

          {/* Behavioural controls */}
          <Card className="p-5">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>How others can reach you</h3>
            <div className="space-y-3 mt-4">
              {PRIVACY_BEHAVIOUR_KEYS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
                  <span>{label}</span>
                  <PrivacyToggle on={!!prefs[key]} onClick={() => togglePref(key)} label={label} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm" style={{ color: theme.text, fontWeight: 600 }}>Data</h3>
            <div className="flex gap-2 mt-3 flex-wrap">
              <GhostButton>Download my data</GhostButton>
              <GhostButton>Delete my account</GhostButton>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Member profile (read-only, another member) ───────────────────────
// Opened by clicking a member's name anywhere (see MemberNameLink). Reads the
// target id from localStorage and renders the privacy-masked member_directory
// row. All fields are nullable (the view masks hidden ones), so render each
// conditionally. Includes Message (always opens a chat) + Connect controls.
export function MemberProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [targetId] = useState(() => localStorage.getItem('activeProfileUserId'));
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [connState, setConnState] = useState<'loading' | 'none' | 'pending' | 'accepted'>('loading');
  const [connBusy, setConnBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!targetId) { setLoading(false); return; }
      const { data } = await supabase
        .from('member_directory')
        .select('id, first_name, last_name, avatar_url, job_title, bio, state, federal_electorate, state_electorate, show_party, party')
        .eq('id', targetId)
        .maybeSingle();
      if (!cancelled) { setMember(data); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [targetId]);

  useEffect(() => {
    let cancelled = false;
    async function checkConn() {
      if (!user || !targetId || targetId === user.id) { setConnState('none'); return; }
      const existing = await findConnection(user.id, targetId);
      if (!cancelled) setConnState(existing ? (existing.status as any) : 'none');
    }
    checkConn();
    return () => { cancelled = true; };
  }, [user, targetId]);

  const openMessage = () => {
    if (!targetId) return;
    localStorage.setItem('activeMessageUserId', targetId);
    navigate('messages');
  };

  const requestConnect = async () => {
    if (!user || !targetId) return;
    setConnBusy(true);
    const status = await sendConnectionRequest(user.id, targetId);
    setConnBusy(false);
    if (status) setConnState(status as any);
  };

  const BackBar = (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-1.5 text-sm mb-4"
      style={{ color: theme.textMuted }}
    >
      <ArrowLeft size={15} /> Back
    </button>
  );

  if (loading) {
    return (
      <div>
        {BackBar}
        <Card className="p-10 text-center"><div className="text-sm" style={{ color: theme.textMuted }}>Loading…</div></Card>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        {BackBar}
        <Card className="p-10 text-center">
          <div className="text-sm" style={{ color: theme.textMuted }}>This member isn't available.</div>
        </Card>
      </div>
    );
  }

  const name = `${member.first_name || 'Member'} ${member.last_name || ''}`.trim();
  const isSelf = user && targetId === user.id;
  const electorate = [member.federal_electorate, member.state_electorate].filter(Boolean).join(' · ');

  return (
    <div>
      {BackBar}
      <Card className="overflow-hidden">
        <div className="h-20" style={{ background: "#f1f5f9" }} />
        <div className="px-6 pb-6 -mt-10">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={name} className="w-20 h-20 rounded-full object-cover" style={{ border: `3px solid ${theme.cardBg}` }} />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: NAVY, border: `3px solid ${theme.cardBg}`, fontWeight: 600 }}
            >
              {(name || '').split(' ').map((w: string) => w[0] || '').slice(0, 2).join('')}
            </div>
          )}

          <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 style={{ color: theme.text }}>{name}</h1>
              {member.job_title && <div className="text-sm mt-0.5" style={{ color: theme.textMuted }}>{member.job_title}</div>}
            </div>
            {member.show_party && member.party && <Pill>{member.party}</Pill>}
          </div>

          {!isSelf && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                onClick={openMessage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
                style={{ background: NAVY, color: '#fff', fontWeight: 600 }}
              >
                <Send size={13} /> Message
              </button>
              {connState === 'accepted' ? (
                <Pill color="#d1fae5" fg="#065f46"><CheckCircle2 size={12} /> Connected</Pill>
              ) : connState === 'pending' ? (
                <Pill color="#fef3c7" fg="#92400e"><Clock size={12} /> Connection pending</Pill>
              ) : connState === 'none' ? (
                <button
                  onClick={requestConnect}
                  disabled={connBusy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
                >
                  {connBusy ? <><Clock size={13} /> Connecting…</> : <><UserPlus size={13} /> Connect</>}
                </button>
              ) : null}
            </div>
          )}

          {(member.state || electorate) && (
            <div className="mt-6 space-y-3 pt-5" style={{ borderTop: `1px solid ${theme.divider}` }}>
              {member.state && <ProfileMetaRow icon={MapPin} label="State" value={member.state} />}
              {electorate && <ProfileMetaRow icon={Flag} label="Electorate" value={electorate} />}
            </div>
          )}

          {member.bio && (
            <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${theme.divider}` }}>
              <div className="text-[11px] mb-1.5" style={{ color: theme.textSubtle }}>About</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.text }}>{member.bio}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Network ──────────────────────────────────────────────────────────

// Avatar initials bubble reused across Network cards.
function Initials({ name }: { name: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm"
      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
    >
      {(name || "").split(" ").map((w: string) => w[0] || "").slice(0, 2).join("")}
    </div>
  );
}

// Top-level "Network" container: hosts People / Orgs / Groups as sub-tabs.
// Each child screen keeps its own header + controls beneath the hub tab bar.
export function NetworkHub({ navigate, initialTab }: { navigate: (s: Screen) => void; initialTab?: 'people' | 'orgs' | 'groups' }) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<'people' | 'orgs' | 'groups'>(initialTab ?? 'people');

  const HubTab = ({ id, label }: { id: 'people' | 'orgs' | 'groups'; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className="px-4 py-2.5 text-sm whitespace-nowrap"
      style={{
        color: tab === id ? NAVY : theme.textMuted,
        fontWeight: tab === id ? 600 : 400,
        borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
        marginBottom: -1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 pb-0">
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <HubTab id="people" label="People" />
          <HubTab id="orgs" label="Organisations" />
          <HubTab id="groups" label="Groups" />
        </div>
      </Card>

      {tab === 'people' && <NetworkScreen navigate={navigate} />}
      {tab === 'orgs' && <OrganisationsScreen navigate={navigate} />}
      {tab === 'groups' && <GroupsScreen navigate={navigate} />}
    </div>
  );
}

export function NetworkScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<"discover" | "network">(() => {
    const t = localStorage.getItem('activeNetworkTab');
    if (t) localStorage.removeItem('activeNetworkTab');
    return t === 'network' ? 'network' : 'discover';
  });

  // My-network state
  const [connections, setConnections] = useState<any[]>([]);   // accepted
  const [incoming, setIncoming] = useState<any[]>([]);         // pending, I'm the receiver
  const [outgoingIds, setOutgoingIds] = useState<Set<string>>(new Set()); // pending, I'm the requester
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [netSearch, setNetSearch] = useState("");
  const [loadingNet, setLoadingNet] = useState(true);

  // Discover state
  const [discQuery, setDiscQuery] = useState("");
  const [discResults, setDiscResults] = useState<any[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(false);

  const loadNetwork = useCallback(async () => {
    if (!user) return;
    setLoadingNet(true);
    const { data } = await supabase
      .from('network_connections')
      .select('id, status, created_at, requester_id, receiver_id')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (data) {
      const peerIds = data.map((c: any) => (c.requester_id === user.id ? c.receiver_id : c.requester_id));
      const dir = await fetchAuthorMap(peerIds);
      const accepted: any[] = [];
      const incomingReqs: any[] = [];
      const outgoing = new Set<string>();
      const connected = new Set<string>();

      for (const c of data) {
        const peerId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
        const peer = dir.get(peerId);
        const card = {
          id: c.id,
          peerId,
          requesterId: c.requester_id,
          name: `${peer?.first_name || 'Member'} ${peer?.last_name || ''}`.trim(),
          title: peer?.job_title || 'Member',
          state: peer?.state || '',
          since: new Date(c.created_at).toLocaleDateString(),
        };
        if (c.status === 'accepted') { accepted.push(card); connected.add(peerId); }
        else if (c.status === 'pending' && c.receiver_id === user.id) incomingReqs.push(card);
        else if (c.status === 'pending' && c.requester_id === user.id) outgoing.add(peerId);
      }
      setConnections(accepted);
      setIncoming(incomingReqs);
      setOutgoingIds(outgoing);
      setConnectedIds(connected);
    }
    setLoadingNet(false);
  }, [user]);

  useEffect(() => { loadNetwork(); }, [loadNetwork]);

  // Discover search against the member directory (discoverable members only).
  const runDiscover = useCallback(async (q: string) => {
    if (!user) return;
    setLoadingDisc(true);
    let query = supabase
      .from('member_directory')
      .select('id, first_name, last_name, avatar_url, job_title, state, bio, allow_connection_requests')
      .eq('discoverable', true)
      .neq('id', user.id)
      .limit(30);
    const term = q.trim();
    if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,job_title.ilike.%${term}%`);
    const { data } = await query;
    setDiscResults(data || []);
    setLoadingDisc(false);
  }, [user]);

  // Load a default page when entering Discover; debounce subsequent searches.
  useEffect(() => {
    if (tab !== 'discover') return;
    const id = setTimeout(() => runDiscover(discQuery), 250);
    return () => clearTimeout(id);
  }, [tab, discQuery, runDiscover]);

  const handleConnect = async (targetId: string) => {
    if (!user) return;
    const status = await sendConnectionRequest(user.id, targetId);
    if (status === 'pending') setOutgoingIds(prev => new Set(prev).add(targetId));
  };

  const handleAccept = async (conn: any) => {
    if (!user) return;
    const myName = await fetchOwnName(user.id);
    const ok = await acceptConnection(conn.id, conn.requesterId, myName);
    if (ok) loadNetwork();
  };

  const handleDecline = async (conn: any) => {
    const ok = await declineConnection(conn.id);
    if (ok) loadNetwork();
  };

  const openMessage = (peerId: string) => {
    localStorage.setItem('activeMessageUserId', peerId);
    navigate('messages');
  };

  const filteredConnections = connections.filter(
    (n) => n.name.toLowerCase().includes(netSearch.toLowerCase()) || n.title.toLowerCase().includes(netSearch.toLowerCase())
  );

  const TabButton = ({ id, label, count }: { id: "discover" | "network"; label: string; count?: number }) => (
    <button
      onClick={() => setTab(id)}
      className="px-4 py-2.5 text-sm whitespace-nowrap"
      style={{
        color: tab === id ? NAVY : theme.textMuted,
        fontWeight: tab === id ? 600 : 400,
        borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
        marginBottom: -1,
      }}
    >
      {label}{typeof count === 'number' && count > 0 ? ` (${count})` : ''}
    </button>
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 pb-0">
        <h1 style={{ color: theme.text }}>People</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Find and connect with other Christians in politics, and manage your connections.
        </p>
        <div className="mt-4 flex gap-1 overflow-x-auto" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <TabButton id="discover" label="Discover" />
          <TabButton id="network" label="My network" count={incoming.length} />
        </div>
      </Card>

      {tab === 'discover' && (
        <>
          <Card className="p-4">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
              <input
                value={discQuery}
                onChange={(e) => setDiscQuery(e.target.value)}
                placeholder="Search members by name or job title"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
              />
            </div>
          </Card>

          {loadingDisc ? (
            <Card className="p-10 text-center"><div className="text-sm" style={{ color: theme.textMuted }}>Searching…</div></Card>
          ) : discResults.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {discResults.map((m) => {
                const name = `${m.first_name || 'Member'} ${m.last_name || ''}`.trim();
                const isConnected = connectedIds.has(m.id);
                const isPending = outgoingIds.has(m.id);
                return (
                  <Card key={m.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <Initials name={name} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>
                          <MemberNameLink userId={m.id} name={name} navigate={navigate} />
                        </div>
                        <div className="text-xs truncate" style={{ color: theme.textMuted }}>{m.job_title || 'Member'}</div>
                        {m.state && <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>{m.state}</div>}
                      </div>
                    </div>
                    {m.bio && <p className="text-xs mt-3 leading-snug" style={{ color: theme.textMuted }}>{m.bio}</p>}
                    <div className="mt-4">
                      {isConnected ? (
                        <button onClick={() => openMessage(m.id)} className="w-full px-3 py-1.5 rounded-lg text-xs inline-flex items-center justify-center gap-1.5" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>
                          <Send size={11} /> Message
                        </button>
                      ) : isPending ? (
                        <Pill color="#fef3c7" fg="#92400e">Request sent</Pill>
                      ) : m.allow_connection_requests === false ? (
                        <div className="text-[11px]" style={{ color: theme.textSubtle }}>Not accepting requests</div>
                      ) : (
                        <button onClick={() => handleConnect(m.id)} className="w-full px-3 py-1.5 rounded-lg text-xs inline-flex items-center justify-center gap-1.5" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>
                          <UserPlus size={11} /> Connect
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <div className="text-sm" style={{ color: theme.textMuted }}>
                {discQuery ? "No members match your search." : "No members to show yet."}
              </div>
            </Card>
          )}
        </>
      )}

      {tab === 'network' && (
        <>
          {/* Incoming requests */}
          {incoming.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm mb-3" style={{ color: theme.text, fontWeight: 600 }}>
                Connection requests ({incoming.length})
              </h3>
              <div className="space-y-3">
                {incoming.map((n) => (
                  <div key={n.id} className="flex items-center gap-3 flex-wrap">
                    <Initials name={n.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>
                        <MemberNameLink userId={n.peerId} name={n.name} navigate={navigate} />
                      </div>
                      <div className="text-xs truncate" style={{ color: theme.textMuted }}>{n.title}{n.state ? ` · ${n.state}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAccept(n)} className="px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Accept
                      </button>
                      <button onClick={() => handleDecline(n)} className="px-3 py-1.5 rounded-lg text-xs" style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
              <input
                value={netSearch}
                onChange={(e) => setNetSearch(e.target.value)}
                placeholder="Search your connections"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: theme.bg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}
              />
            </div>
          </Card>

          {loadingNet ? (
            <Card className="p-10 text-center"><div className="text-sm" style={{ color: theme.textMuted }}>Loading…</div></Card>
          ) : filteredConnections.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filteredConnections.map((n) => (
                <Card key={n.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <Initials name={n.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: theme.text, fontWeight: 600 }}>
                        <MemberNameLink userId={n.peerId} name={n.name} navigate={navigate} />
                      </div>
                      <div className="text-xs truncate" style={{ color: theme.textMuted }}>{n.title}</div>
                      {n.state && <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>{n.state}</div>}
                    </div>
                  </div>
                  <div className="text-[11px] mt-3" style={{ color: theme.textSubtle }}>
                    <span style={{ color: theme.textMuted, fontWeight: 500 }}>Connected</span> · {n.since}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => openMessage(n.peerId)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                      style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
                    >
                      <Send size={11} /> Message
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <div className="text-sm" style={{ color: theme.textMuted }}>
                {netSearch ? "No connections match your search." : "You have no connections yet. Head to Discover to find members."}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── Support ──────────────────────────────────────────────────────────
export const SUPPORT_PATHWAYS = [
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
    id: "party",
    icon: Flag,
    title: "Pick a political party",
    desc: "We'll help you explore the major parties, understand where each stands, and discern which one best fits your convictions and calling.",
    cta: "Request guidance",
  },
];


const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  "Submitted":                 { bg: "#dbeafe", fg: "#1d4ed8" },
  "In review":                 { bg: "#fef3c7", fg: "#92400e" },
  "Awaiting member response":  { bg: "#fde8d8", fg: "#c2410c" },
  "Matched / introduced":      { bg: "#d1fae5", fg: "#065f46" },
  "Closed":                    { bg: "#f3f4f6", fg: "#6b7280" },
};

export function NewSupportRequestModal({ pathway, onClose }: { pathway?: typeof SUPPORT_PATHWAYS[number] | null; onClose: (refresh?: boolean) => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const Icon = pathway?.icon || LifeBuoy;
  // When opened without a fixed pathway (e.g. "Create a request"), let the
  // member choose what kind of request they're making.
  const [requestType, setRequestType] = useState(SUPPORT_PATHWAYS[0].title);
  const [contextText, setContextText] = useState("");
  const [urgency, setUrgency] = useState("Within a month");
  const [loading, setLoading] = useState(false);

  const effectiveType = pathway ? pathway.title : requestType;
  const effectiveDesc = pathway?.desc || "";

  const submitRequest = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from("support_requests").insert({
      user_id: user.id,
      request_type: effectiveType,
      description: contextText || effectiveDesc || effectiveType,
      urgency: urgency,
      status: "Submitted"
    });
    setLoading(false);

    // Trigger email notification to hello@christiansinpolitics.com
    const subject = encodeURIComponent(`CiP Request: ${effectiveType}`);
    const body = encodeURIComponent(`A new request has been submitted by ${user.email}:\n\nType: ${effectiveType}\nUrgency: ${urgency}\n\nContext:\n${contextText || effectiveDesc}\n\nPlease reply to this email to contact the member.`);
    window.location.href = `mailto:hello@christiansinpolitics.com?subject=${subject}&body=${body}`;

    onClose(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={() => onClose()}
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
            <h3 style={{ color: theme.text, fontWeight: 600 }}>{pathway?.title || "Create a request"}</h3>
            <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>
              CiP staff will receive this request and reply within a few days.
            </div>
          </div>
          <button onClick={() => onClose()} className="p-1 rounded-md hover:bg-gray-100">
            <X size={16} style={{ color: theme.textMuted }} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {pathway ? (
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{pathway.desc}</p>
          ) : (
            <FormField label="What do you need help with?">
              <SelectInput
                value={requestType}
                onChange={setRequestType}
                options={[...SUPPORT_PATHWAYS.map((p) => p.title), "Something else"]}
              />
            </FormField>
          )}
          <FormField label="What would help most?" hint="Optional — share a bit of context so we can route this well.">
            <textarea
              rows={4}
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="A few sentences about where you're at and what you're hoping for…"
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            />
          </FormField>
          <FormField label="How urgent is this?">
            <div className="flex gap-2">
              {["No rush", "Within a month", "This week"].map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs"
                  style={{
                    border: `1px solid ${urgency === u ? NAVY : theme.cardBorder}`,
                    background: urgency === u ? "#f0f7ff" : theme.cardBg,
                    color: theme.text,
                    fontWeight: urgency === u ? 600 : 400,
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
            onClick={() => onClose()}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}
          >
            Cancel
          </button>
          <button
            onClick={submitRequest}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            {loading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SupportScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selected, setSelected] = useState<typeof SUPPORT_PATHWAYS[number] | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from("support_requests").select("*").eq("user_id", user.id).order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: GOLD }}
          >
            <ArrowUpRight size={18} style={{ color: NAVY }} />
          </div>
          <div>
            <h1 style={{ color: theme.text }}>Ways to get involved</h1>
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
          {requests.length === 0 ? (
            <div className="py-6 text-sm text-center" style={{ color: theme.textMuted }}>
              You don't have any open support requests.
            </div>
          ) : (
            requests.map((r, i) => {
              const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.Submitted;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 py-3"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${theme.divider}` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm" style={{ color: theme.text, fontWeight: 500 }}>{r.request_type}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>Updated {new Date(r.created_at).toLocaleDateString()}</div>
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
            })
          )}
        </div>
      </Card>

      {selected && (
        <NewSupportRequestModal 
          pathway={selected} 
          onClose={(refresh) => {
            setSelected(null);
            if (refresh) loadRequests();
          }} 
        />
      )}
    </div>
  );
}


// ============================================================================
// ORGANISATIONS
// ============================================================================

function OrganisationFormModal({ onClose, onSave, initialData }: { onClose: () => void; onSave: (name: string) => void; initialData?: any; }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState(initialData?.name || "");
  const [desc, setDesc] = useState(initialData?.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [religion, setReligion] = useState(initialData?.religion || "");
  const [partyAffiliation, setPartyAffiliation] = useState(initialData?.party_affiliation || "");
  const [profession, setProfession] = useState(initialData?.profession || "");
  const [christianOrgIdentifiers, setChristianOrgIdentifiers] = useState(initialData?.christian_org_identifiers || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      setUploadingImage(true);
      const { error: uploadError } = await supabase.storage.from('group_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('group_images').getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const canNext = name.trim().length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.divider}` }}>
          <h3 style={{ color: theme.text, fontWeight: 600 }}>{initialData ? "Edit organisation" : "Create an organisation"}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={16} style={{ color: theme.textMuted }} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold block" style={{ color: theme.text }}>Organisation Logo</label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img src={imageUrl} alt="Org Preview" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: NAVY }}>
                  {name ? name.split(" ").map(w => w[0] || "").slice(0, 2).join("") : "Logo"}
                </div>
              )}
              <div>
                <input type="file" accept="image/*" id="orgImageUpload" className="hidden" onChange={uploadImage} disabled={uploadingImage} />
                <label htmlFor="orgImageUpload" className="cursor-pointer px-4 py-2 text-sm rounded-lg border inline-block" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                  {uploadingImage ? "Uploading..." : "Upload logo"}
                </label>
              </div>
            </div>
          </div>
          <FormField label="Organisation name">
            <TextInput value={name} onChange={setName} placeholder="e.g. Christians in Politics Australia" />
          </FormField>
          <FormField label="Website URL">
            <TextInput value={websiteUrl} onChange={setWebsiteUrl} placeholder="https://example.com" />
          </FormField>
          <FormField label="Short description" hint="What does this organisation do?">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="We equip Christians to participate faithfully..."
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            />
          </FormField>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <h4 className="text-sm font-semibold mb-3" style={{ color: theme.text }}>Search Identifiers</h4>
            <p className="text-xs mb-4" style={{ color: theme.textMuted }}>Adding these identifiers helps members find your organisation when searching by specific criteria.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Location">
                <TextInput value={location} onChange={setLocation} placeholder="e.g. NSW, VIC, National" />
              </FormField>
              <FormField label="Religion / Denomination">
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none appearance-none bg-white"
                  style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
                >
                  <option value="">Any / Unspecified</option>
                  {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Party Affiliation">
                <select
                  value={partyAffiliation}
                  onChange={(e) => setPartyAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none appearance-none bg-white"
                  style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
                >
                  <option value="">Any / Unspecified</option>
                  {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>
              <FormField label="Profession">
                <TextInput value={profession} onChange={setProfession} placeholder="e.g. Law, Medicine, Ministry" />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Other Christian Identifiers">
                <TextInput value={christianOrgIdentifiers} onChange={setChristianOrgIdentifiers} placeholder="e.g. Youth, Discipleship, Public Theology" />
              </FormField>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-2" style={{ borderTop: `1px solid ${theme.divider}` }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
            Cancel
          </button>
          <button
            disabled={!canNext}
            onClick={async () => {
              if (user) {
                const payload = {
                  name,
                  description: desc,
                  visibility: 'public', // Orgs are public
                  group_type: 'organisation',
                  website_url: websiteUrl,
                  image_url: imageUrl,
                  location,
                  religion,
                  party_affiliation: partyAffiliation,
                  profession,
                  christian_org_identifiers: christianOrgIdentifiers,
                };
                let res;
                if (initialData) {
                  res = await supabase.from("groups").update(payload).eq("id", initialData.id).select().single();
                } else {
                  res = await supabase.from("groups").insert({ ...payload, created_by: user.id }).select().single();
                }
                const { data, error } = res;
                if (error) {
                  alert(`Error ${initialData ? "updating" : "creating"} organisation: ` + error.message);
                  return;
                }
                if (data) {
                  if (!initialData) {
                    await supabase.from("group_members").insert({
                      group_id: data.id,
                      user_id: user.id,
                      role: "admin"
                    });
                  }
                  onSave(name);
                }
              }
            }}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: !canNext ? theme.cardBorder : GOLD, color: !canNext ? theme.textMuted : "#fff", fontWeight: 600 }}
          >
            {initialData ? "Save changes" : "Create organisation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrganisationsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"joined" | "discover" | "yours" | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [allOrgs, setAllOrgs] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterLocation, setFilterLocation] = useState("");
  const [filterReligion, setFilterReligion] = useState("");
  const [filterParty, setFilterParty] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [filterIdentifier, setFilterIdentifier] = useState("");

  const fetchOrgs = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: orgs } = await supabase.from("groups").select("*").is("deleted_at", null).is("suspended_at", null).eq("group_type", "organisation");
      const { data: members } = await supabase.from("group_members").select("group_id").eq("user_id", user.id);
      if (orgs) setAllOrgs(orgs);
      if (members) setMyMemberships(new Set(members.map(m => m.group_id)));
    } catch (err) {
      console.error("Error fetching orgs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrgs(); }, [user]);

  const handleJoin = async (orgId: string) => {
    if (!user) return;
    const { error } = await supabase.from("group_members").insert({ group_id: orgId, user_id: user.id });
    if (!error) fetchOrgs(); else alert("Error joining organisation: " + error.message);
  };

  // Check if any manual filters are active
  const hasActiveFilters = !!(filterLocation || filterReligion || filterParty || filterProfession || filterIdentifier);

  // User profile preferences for relevance scoring
  const userState = profile?.state || "";
  const userTradition = profile?.tradition || "";
  const userParty = profile?.party || "";

  // Compute relevance score: how well an org matches the user's profile
  const computeRelevance = (o: any) => {
    let score = 0;
    if (userState && o.location?.toLowerCase().includes(userState.toLowerCase())) score += 3;
    if (userTradition && o.religion?.toLowerCase().includes(userTradition.toLowerCase())) score += 2;
    if (userParty && userParty !== "No affiliation" && o.party_affiliation?.toLowerCase().includes(userParty.toLowerCase())) score += 2;
    // Boost orgs with descriptions mentioning "christian" as a baseline relevance
    if (o.description?.toLowerCase().includes("christian") || o.name?.toLowerCase().includes("christian")) score += 1;
    return score;
  };

  const mapped = allOrgs.map(o => ({
    id: o.id, name: o.name, desc: o.description, joined: myMemberships.has(o.id),
    created_by: o.created_by, image_url: o.image_url, website_url: o.website_url,
    location: o.location, religion: o.religion, party: o.party_affiliation, profession: o.profession, identifiers: o.christian_org_identifiers,
    allowed: true, // Orgs are public
    relevance: computeRelevance(o),
  }));

  const list = (() => {
    if (tab === "joined") return mapped.filter(o => o.joined);
    if (tab === "yours") return mapped.filter(o => o.created_by === user?.id);

    // Discover tab
    if (hasActiveFilters) {
      // When user has set explicit filters, apply them strictly
      const filtered = mapped.filter(o => {
        if (filterLocation && !o.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
        if (filterReligion && !o.religion?.toLowerCase().includes(filterReligion.toLowerCase())) return false;
        if (filterParty && !o.party?.toLowerCase().includes(filterParty.toLowerCase())) return false;
        if (filterProfession && !o.profession?.toLowerCase().includes(filterProfession.toLowerCase())) return false;
        if (filterIdentifier && !o.identifiers?.toLowerCase().includes(filterIdentifier.toLowerCase())) return false;
        return true;
      });

      // RULE: Always show at least one org — if filters produce nothing, show all orgs
      if (filtered.length > 0) return filtered.sort((a, b) => b.relevance - a.relevance);
      return mapped.sort((a, b) => b.relevance - a.relevance);
    }

    // No filters active — show all orgs sorted by relevance to user's profile
    return mapped.sort((a, b) => b.relevance - a.relevance);
  })();

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: theme.text }}>Organisations</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Discover and follow organisations, ministries, and political bodies active within the CiP network.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5 shrink-0"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            <Plus size={14} /> Create organisation
          </button>
        </div>
        <div className="mt-4 flex gap-1 p-1 rounded-lg w-fit" style={{ background: theme.bg }}>
          {( [["discover", "Discover"], ["joined", "Following"], ["yours", "Created by you"]] as const ).map(([t, l]) => (
            <button
              key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-md text-xs"
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
        {tab === "discover" && (
          <div className="mt-4 pt-4 flex flex-wrap items-center gap-2" style={{ borderTop: `1px solid ${theme.divider}` }}>
            <span className="text-xs font-semibold mr-1" style={{ color: theme.text }}>Filters:</span>
            <input type="text" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} placeholder="Location" className="px-3 py-1.5 rounded-lg text-xs outline-none w-28 sm:w-auto" style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }} />
            <select
              value={filterReligion}
              onChange={(e) => setFilterReligion(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none w-28 sm:w-auto appearance-none"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            >
              <option value="">Religion...</option>
              {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none w-32 sm:w-auto appearance-none"
              style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }}
            >
              <option value="">Party Affiliation...</option>
              {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={filterProfession} onChange={e => setFilterProfession(e.target.value)} placeholder="Profession" className="px-3 py-1.5 rounded-lg text-xs outline-none w-28 sm:w-auto" style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }} />
            <input type="text" value={filterIdentifier} onChange={e => setFilterIdentifier(e.target.value)} placeholder="Other Tags" className="px-3 py-1.5 rounded-lg text-xs outline-none w-28 sm:w-auto" style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text }} />
            {(filterLocation || filterReligion || filterParty || filterProfession || filterIdentifier) && (
              <button onClick={() => { setFilterLocation(""); setFilterReligion(""); setFilterParty(""); setFilterProfession(""); setFilterIdentifier(""); }} className="text-xs hover:underline text-red-500 ml-1">Clear filters</button>
            )}
          </div>
        )}
      </Card>

      {loading ? (
        <Card className="p-10 text-center text-sm text-gray-500">Loading organisations...</Card>
      ) : list.length > 0 ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {list.map(o => (
            <Card key={o.id} className="p-5 flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={() => { localStorage.setItem("activeGroupId", o.id); localStorage.setItem("isOrgDetail", "true"); navigate("group-detail"); }}>
              <div className="flex items-start gap-3">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.name} className="w-12 h-12 rounded-lg object-cover shrink-0" style={{ border: `1px solid ${theme.cardBorder}` }} />
                ) : (
                  <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-sm" style={{ background: GOLD, color: "#fff", fontWeight: 600 }}>
                    {o.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-base truncate" style={{ color: theme.text, fontWeight: 600 }}>{o.name}</div>
                </div>
              </div>
              <p className="text-sm mt-3 line-clamp-2" style={{ color: theme.textMuted, flex: 1 }}>{o.desc}</p>
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <span className="text-xs" style={{ color: theme.textSubtle }}>Organisation</span>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); localStorage.setItem("activeGroupId", o.id); localStorage.setItem("isOrgDetail", "true"); navigate("group-detail"); }} className="px-3 py-1.5 rounded-lg text-xs hover:underline" style={{ color: NAVY, fontWeight: 600 }}>
                    View Profile
                  </button>
                  {!o.joined && o.allowed && (
                    <button onClick={(e) => { e.stopPropagation(); handleJoin(o.id); }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>
                      Follow
                    </button>
                  )}
                  {o.joined && (
                    <Pill color="#d1fae5" fg="#065f46">Following</Pill>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-sm" style={{ color: theme.textMuted }}>
          {tab === "joined" ? "You aren't following any organisations yet." 
           : tab === "yours" ? "You haven't created any organisations yet." 
           : "No organisations available at this time."}
        </Card>
      )}

      {createOpen && <OrganisationFormModal onClose={() => setCreateOpen(false)} onSave={(name) => { setCreateOpen(false); alert(`Organisation "${name}" created!`); fetchOrgs(); }} />}
    </div>
  );
}
