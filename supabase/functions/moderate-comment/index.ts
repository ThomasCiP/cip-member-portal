// Supabase Edge Function: moderate-comment
// Classifies a new comment against the CiP Member Conduct Agreement using
// Claude Haiku 4.5. If it detects a breach, it files a content_reports row
// (ai_flagged) with the service role and notifies the group/company owner.
// Invoked (fire-and-forget) by the client right after a comment is inserted.
//
// Requires secrets: ANTHROPIC_API_KEY (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// are injected automatically by the platform).

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const CONDUCT_RULES = `CiP Member Conduct Agreement — key rules:
- Speak with charity and respect in all communication.
- No harassment, abusive language, intimidation, bullying, threats, or hate/discrimination.
- No factional political campaigning, party recruitment, or promoting a candidate.
- No sharing others' private/personal information without consent.
Christians in Politics is a non-partisan, cross-denominational Christian network.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { commentId, postType, postId, authorId, groupId, content } = await req.json();
    if (!content || !commentId) return json({ ok: false, error: "missing content" }, 400);

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    // No key configured — skip AI moderation quietly so posting is unaffected.
    if (!apiKey) return json({ ok: true, skipped: "no_api_key" });

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system:
          `You are a content-moderation classifier for the Christians in Politics member platform. ` +
          `Decide whether a comment breaches the Member Conduct Agreement.\n\n${CONDUCT_RULES}\n\n` +
          `Respond ONLY with a compact JSON object: {"breach": boolean, "reason": string, "severity": "low"|"medium"|"high"}. ` +
          `"reason" is a short phrase naming the rule breached, or "" if no breach. ` +
          `Be precise: respectful disagreement, robust debate, or political opinion expressed civilly is NOT a breach.`,
        messages: [
          { role: "user", content: `Comment to review:\n"""${String(content).slice(0, 4000)}"""` },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      return json({ ok: false, error: "anthropic_error", status: anthropicRes.status });
    }

    const data = await anthropicRes.json();
    const text: string = (data?.content?.[0]?.text || "").trim();
    let verdict: { breach?: boolean; reason?: string; severity?: string } = {};
    try {
      verdict = JSON.parse(text.replace(/^```json/i, "").replace(/```$/, "").trim());
    } catch {
      verdict = {};
    }

    if (!verdict?.breach) return json({ ok: true, breach: false });

    // Breach detected → file a report and notify the owner using the service role.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await admin.from("content_reports").insert({
      reporter_id: null,
      target_type: "comment",
      target_id: commentId,
      post_type: postType ?? null,
      group_id: groupId ?? null,
      reason: `AI: ${verdict.reason || "conduct breach"} (${verdict.severity || "medium"})`,
      details: "Automatically flagged by AI conduct monitoring.",
      ai_flagged: true,
      status: "open",
    });

    if (groupId) {
      const { data: g } = await admin.from("groups").select("created_by, name").eq("id", groupId).maybeSingle();
      if (g?.created_by) {
        await admin.from("notifications").insert({
          user_id: g.created_by,
          type: "content_reported",
          title: "A comment was flagged",
          message: `A comment in ${g.name || "your group"} was flagged by AI monitoring and is awaiting review.`,
        });
      }
    }

    return json({ ok: true, breach: true });
  } catch (e) {
    // Never surface moderation failures to the user.
    return json({ ok: false, error: String(e) });
  }
});
