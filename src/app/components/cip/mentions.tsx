// ── @-mention tagging ─────────────────────────────────────────────────────
// Mentions are stored inline in a post/comment `content` string as canonical
// tokens:  @[Display Name](user:UUID) / (group:UUID) / (org:UUID).
// This module owns: parsing/serialising those tokens, the read-side renderer
// (MentionText), the write-side input (MentionTextarea) with its picker, and
// the notification fan-out (notifyMentions).
import {
  useState, useRef, useEffect, useCallback, useLayoutEffect, Fragment, CSSProperties,
} from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "./AuthContext";
import { useTheme, NAVY } from "./brand";
import { Screen } from "./types";
import { Users, Building2 } from "lucide-react";

export type MentionType = "user" | "group" | "org";
export type Mention = { mtype: MentionType; id: string; display: string };

const MENTION_COLOR = "#7c3aed"; // violet accent, matches the app's purple

// Token grammar. Display text may not contain "]" (stripped when building).
const TOKEN_RE = /@\[([^\]]+)\]\((user|group|org):([0-9a-fA-F-]{36})\)/g;

const sanitizeDisplay = (s: string) => s.replace(/[\[\]\r\n]/g, " ").replace(/\s+/g, " ").trim();
const buildToken = (m: Mention) => `@[${sanitizeDisplay(m.display)}](${m.mtype}:${m.id})`;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Split canonical content into text/mention segments (for rendering).
type Segment = { kind: "text"; text: string } | ({ kind: "mention" } & Mention);
export function parseContent(content: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  content.replace(TOKEN_RE, (full, display: string, mtype: string, id: string, offset: number) => {
    if (offset > last) out.push({ kind: "text", text: content.slice(last, offset) });
    out.push({ kind: "mention", mtype: mtype as MentionType, id, display });
    last = offset + full.length;
    return full;
  });
  if (last < content.length) out.push({ kind: "text", text: content.slice(last) });
  return out;
}

// All mentions in a piece of content (for notifications).
export function extractMentions(content: string): Mention[] {
  return parseContent(content).filter((s): s is Segment & { kind: "mention" } => s.kind === "mention")
    .map(({ mtype, id, display }) => ({ mtype, id, display }));
}

// Canonical token content -> friendly editable text ("@Display") + mention map.
function hydrate(content: string): { text: string; mentions: Mention[] } {
  const mentions: Mention[] = [];
  const text = content.replace(TOKEN_RE, (_full, display: string, mtype: string, id: string) => {
    mentions.push({ mtype: mtype as MentionType, id, display });
    return `@${display}`;
  });
  return { text, mentions };
}

// Friendly text + mention map -> canonical token content. Only mentions whose
// "@Display" still appears in the text survive (deleted ones drop to plain text).
function serialize(text: string, mentions: Mention[]): string {
  let out = text;
  // Longest display first so "@John Smith" is replaced before "@John".
  const sorted = [...mentions].sort((a, b) => b.display.length - a.display.length);
  const seen = new Set<string>();
  for (const m of sorted) {
    const key = `${m.mtype}:${m.id}:${m.display}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const re = new RegExp(`@${escapeRe(m.display)}(?![\\w])`, "g");
    out = out.replace(re, buildToken(m));
  }
  return out;
}

// ── Renderer ──────────────────────────────────────────────────────────────
function navigateToMention(m: Mention, navigate?: (s: Screen) => void) {
  if (!navigate) return;
  if (m.mtype === "user") {
    localStorage.setItem("activeProfileUserId", m.id);
    navigate("member-profile");
  } else {
    localStorage.setItem("activeGroupId", m.id);
    if (m.mtype === "org") localStorage.setItem("isOrgDetail", "true");
    else localStorage.removeItem("isOrgDetail");
    navigate("group-detail");
  }
}

export function MentionText({ text, navigate }: { text: string; navigate?: (s: Screen) => void }) {
  const segments = parseContent(text || "");
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <Fragment key={i}>{seg.text}</Fragment>;
        return (
          <span
            key={i}
            role={navigate ? "link" : undefined}
            tabIndex={navigate ? 0 : undefined}
            onClick={(e) => { e.stopPropagation(); navigateToMention(seg, navigate); }}
            onKeyDown={(e) => { if (navigate && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); navigateToMention(seg, navigate); } }}
            style={{ color: MENTION_COLOR, fontWeight: 600, cursor: navigate ? "pointer" : "default" }}
          >
            @{seg.display}
          </span>
        );
      })}
    </>
  );
}

// ── Picker search (people + groups + orgs) ─────────────────────────────────
type Suggestion = Mention & { subtitle?: string; avatar?: string | null };

async function searchEntities(term: string, selfId?: string): Promise<Suggestion[]> {
  const q = term.trim();
  // People (discoverable only) via the safe directory view.
  let people = supabase
    .from("member_directory")
    .select("id, first_name, last_name, avatar_url, job_title")
    .eq("discoverable", true)
    .limit(6);
  if (selfId) people = people.neq("id", selfId);
  if (q) people = people.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,job_title.ilike.%${q}%`);

  // Groups + organisations.
  let groups = supabase
    .from("groups")
    .select("id, name, group_type")
    .is("deleted_at", null)
    .is("suspended_at", null)
    .limit(6);
  if (q) groups = groups.ilike("name", `%${q}%`);

  const [{ data: pRows }, { data: gRows }] = await Promise.all([people, groups]);
  const peopleSug: Suggestion[] = (pRows || []).map((p: any) => ({
    mtype: "user", id: p.id,
    display: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Member",
    subtitle: p.job_title || "Member", avatar: p.avatar_url,
  }));
  const groupSug: Suggestion[] = (gRows || []).map((g: any) => ({
    mtype: g.group_type === "organisation" ? "org" : "group", id: g.id,
    display: g.name, subtitle: g.group_type === "organisation" ? "Organisation" : "Group",
  }));
  return [...peopleSug, ...groupSug];
}

// ── Mention-aware textarea ──────────────────────────────────────────────────
// Semi-controlled: hydrates from `initialValue` on mount and whenever
// `resetSignal` changes; emits canonical token content via `onContentChange`.
export function MentionTextarea({
  initialValue = "", resetSignal, onContentChange, onSubmit, placeholder,
  minHeight = 44, maxHeight = 220, className, style, disabled, autoFocus,
}: {
  initialValue?: string;
  resetSignal?: number;
  onContentChange: (canonical: string) => void;
  onSubmit?: () => void; // Enter-to-send (ignored while the picker is open)
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const ref = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<Mention[]>([]);
  const [text, setText] = useState(() => hydrate(initialValue).text);

  // (Re)hydrate on mount and whenever the parent bumps resetSignal.
  useEffect(() => {
    const h = hydrate(initialValue);
    mentionsRef.current = h.mentions;
    setText(h.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // Auto-grow.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [text, maxHeight]);

  const emit = (t: string) => onContentChange(serialize(t, mentionsRef.current));

  // Picker state.
  const [query, setQuery] = useState<string | null>(null); // null = closed
  const [tokenStart, setTokenStart] = useState(0);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(0);
  const open = query !== null;

  const detect = (value: string, caret: number) => {
    const upto = value.slice(0, caret);
    const m = upto.match(/(^|\s)@([^\s@]{0,40})$/);
    if (m) { setTokenStart(caret - m[2].length - 1); setQuery(m[2]); }
    else { setQuery(null); }
  };

  useEffect(() => {
    if (query === null) return;
    let alive = true;
    const id = setTimeout(async () => {
      const r = await searchEntities(query, user?.id);
      if (alive) { setResults(r); setActive(0); }
    }, 200);
    return () => { alive = false; clearTimeout(id); };
  }, [query, user?.id]);

  const choose = (s: Suggestion) => {
    const el = ref.current;
    const caret = el ? el.selectionStart : text.length;
    const before = text.slice(0, tokenStart);
    const after = text.slice(caret);
    const inserted = `@${s.display} `;
    const next = before + inserted + after;
    mentionsRef.current = [...mentionsRef.current, { mtype: s.mtype, id: s.id, display: s.display }];
    setText(next);
    emit(next);
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = (before + inserted).length;
      if (el) { el.focus(); el.setSelectionRange(pos, pos); }
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    emit(v);
    detect(v, e.target.selectionStart || v.length);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && results.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % results.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); choose(results[active]); return; }
      if (e.key === "Escape") { e.preventDefault(); setQuery(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey && onSubmit && !open) { e.preventDefault(); onSubmit(); }
  };

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={text}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => detect((e.target as HTMLTextAreaElement).value, (e.target as HTMLTextAreaElement).selectionStart || 0)}
        onClick={(e) => detect((e.target as HTMLTextAreaElement).value, (e.target as HTMLTextAreaElement).selectionStart || 0)}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
        className={className}
        style={{ minHeight, resize: "none", ...style }}
      />
      {open && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl shadow-xl py-1"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          {results.map((s, i) => (
            <li key={`${s.mtype}:${s.id}`}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); choose(s); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-sm"
                style={{ background: i === active ? theme.bg : "transparent", color: theme.text }}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                  style={{ background: s.mtype === "user" ? NAVY : MENTION_COLOR, color: "#fff", fontSize: 10, overflow: "hidden" }}>
                  {s.mtype === "user"
                    ? (s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : (s.display[0] || "?").toUpperCase())
                    : s.mtype === "org" ? <Building2 size={13} /> : <Users size={13} />}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span style={{ fontWeight: 600 }}>{s.display}</span>
                  <span className="ml-2 text-xs" style={{ color: theme.textSubtle }}>{s.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Notifications fan-out ───────────────────────────────────────────────────
// Individual tags -> type 'mention' (in-app + email). Group/org tags -> notify
// each member as type 'group_mention' (in-app only; the email edge function
// ignores this type). Skips the actor and de-dupes across all targets.
export async function notifyMentions(opts: {
  content: string;
  actor: { id: string; name: string };
  context: { postType: "global" | "group"; postId: string; commentId?: string | null; surface: "post" | "comment"; groupId?: string | null };
}): Promise<void> {
  try {
    const mentions = extractMentions(opts.content);
    if (mentions.length === 0) return;
    const { actor, context } = opts;
    const baseData = {
      post_type: context.postType, post_id: context.postId,
      comment_id: context.commentId ?? null, actor_id: actor.id,
      group_id: context.groupId ?? null,
    };
    const rows: any[] = [];
    const notified = new Set<string>([actor.id]);

    const userTargets = mentions.filter((m) => m.mtype === "user" && m.id !== actor.id);
    for (const m of userTargets) {
      if (notified.has(m.id)) continue;
      notified.add(m.id);
      rows.push({
        user_id: m.id, type: "mention", title: "You were mentioned",
        message: `${actor.name} mentioned you in a ${context.surface}.`, data: baseData,
      });
    }

    const groupTargets = mentions.filter((m) => m.mtype === "group" || m.mtype === "org");
    if (groupTargets.length) {
      const ids = Array.from(new Set(groupTargets.map((g) => g.id)));
      const { data: members } = await supabase
        .from("group_members").select("user_id, group_id").in("group_id", ids);
      const nameByGroup = new Map(groupTargets.map((g) => [g.id, g.display]));
      for (const mm of members || []) {
        if (!mm.user_id || notified.has(mm.user_id)) continue;
        notified.add(mm.user_id);
        rows.push({
          user_id: mm.user_id, type: "group_mention", title: "A group you're in was mentioned",
          message: `${actor.name} mentioned ${nameByGroup.get(mm.group_id) || "your group"} in a ${context.surface}.`,
          data: { ...baseData, mentioned_group_id: mm.group_id },
        });
      }
    }

    if (rows.length) await supabase.from("notifications").insert(rows);
  } catch {
    // Best-effort: never block posting on notification failure.
  }
}
