import { useState, ReactNode } from "react";
import { supabase } from "../../../lib/supabase";
import { CiPLogo, NAVY, GOLD, MUTED_BLUE, useTheme } from "./brand";
import { Screen } from "./types";
import {
  ShieldCheck, Lock, Users, BookOpenCheck, ArrowRight,
  CheckCircle2, X, ChevronDown,
} from "lucide-react";

// ── Legal modal types ───────────────────────────────────────────────
type ModalType = "terms" | "privacy" | "conduct" | null;

// ── Legal document content ──────────────────────────────────────────
const LEGAL_CONTENT = {
  terms: {
    title: "Terms of Use",
    updated: "July 2026",
    sections: [
      {
        heading: "About Christians in Politics",
        body: "Christians in Politics (CiP) is an Australian network that equips Christians to participate faithfully in politics and public life. CiP is non-partisan, cross-denominational and privacy-first. We do not endorse any political party, candidate or policy.",
      },
      {
        heading: "Eligibility for membership",
        body: "Membership is open to individuals who affirm the Nicene Creed and agree to these Terms of Use, the Privacy Policy and the Member Conduct Agreement. CiP reserves the right to decline or suspend membership at its discretion.",
      },
      {
        heading: "Requirement to affirm the Nicene Creed",
        body: "Affirmation of the Nicene Creed is a condition of membership. This reflects CiP's identity as a Christian organisation that spans Catholic, Orthodox and Protestant traditions. Members must affirm this creed in good conscience.",
      },
      {
        heading: "Account responsibilities",
        body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and current information and notify CiP of any material changes. You must not share your account with others.",
      },
      {
        heading: "Member conduct",
        body: "Members are expected to engage respectfully with CiP staff, volunteers and any individuals introduced through CiP. The full Member Conduct Agreement applies to all interactions facilitated by or connected to the platform.",
      },
      {
        heading: "No endorsement of parties, candidates or policies",
        body: "CiP does not endorse, recommend or promote any political party, candidate or policy position. Any political content within the platform — including party guidance tools — is provided for educational and private reflection purposes only.",
      },
      {
        heading: "Platform use",
        body: "The platform may be used only for purposes consistent with CiP's mission and these Terms. You must not use the platform for commercial promotion, party recruitment, or any activity inconsistent with the Member Conduct Agreement.",
      },
      {
        heading: "Community feed, connections and messaging",
        body: "The platform includes a community feed, group pages and company pages where members may publish posts, comment and react, subject to the Member Conduct Agreement. Members may also send connection requests and message accepted connections. Member profiles remain privacy-controlled and you decide what information is visible to others.",
      },
      {
        heading: "AI monitoring and content moderation",
        body: "To keep the community safe, CiP uses automated systems, including artificial intelligence, to monitor posts and comments for behaviour that may breach the Member Conduct Agreement. Content may also be reported by members. Posts or comments that are flagged are reviewed by CiP moderators — and, where the content was posted in a group or on a company page, by that group or page owner — and may be removed. Serious or repeated breaches may result in suspension or removal of your account.",
      },
      {
        heading: "Events and registrations",
        body: "Event registrations are managed by CiP directly on this platform. All events listed are CiP-hosted events. CiP may collect registration data for event management and communication purposes.",
      },
      {
        heading: "Donations",
        body: "Donations may be processed via third-party providers. CiP does not store payment card information on this platform. Donation data is handled in accordance with the Privacy Policy and applicable Australian law.",
      },
      {
        heading: "Suspension or removal of access",
        body: "CiP may suspend or remove membership where a member breaches these Terms, the Privacy Policy or the Member Conduct Agreement. CiP will endeavour to notify affected members where appropriate and provide an opportunity to respond.",
      },
      {
        heading: "Changes to these terms",
        body: "CiP may update these Terms from time to time. Members will be notified of material changes. Continued use of the platform after notification constitutes acceptance of the updated terms.",
      },
      {
        heading: "Contact",
        body: "For questions about these Terms, contact CiP at hello@christiansinpolitics.org.au or write to: Christians in Politics, PO Box [address], Australia.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "May 2025 — prototype draft",
    sections: [
      {
        heading: "What personal information CiP collects",
        body: "CiP collects your name, email address, mobile number (if provided), state/territory, age range, and information about your faith background and political engagement. This information is collected when you create an account, complete your profile, submit support requests, or register for events.",
      },
      {
        heading: "Why CiP collects this information",
        body: "CiP collects personal information to provide you with relevant support, match you with introductions, notify you of events and resources, and to operate the membership platform. We do not collect information for advertising purposes.",
      },
      {
        heading: "Sensitive information",
        body: "CiP collects sensitive personal information including your religious background (Christian tradition/denomination) and your political engagement and affiliation. This information is treated with particular care. It is not shared without your explicit consent and is used only to provide tailored support.",
      },
      {
        heading: "How information is used",
        body: "Your information is used to: provide member support and pathway guidance; facilitate introductions with your consent; notify you of relevant events and resources; and improve the platform. CiP does not use your information for commercial purposes or sell it to third parties.",
      },
      {
        heading: "Who information may be shared with",
        body: "CiP may share limited information with trusted third parties only where you have given explicit consent (for example, as part of a facilitated introduction). CiP may also share information as required by law or to comply with lawful requests from authorities.",
      },
      {
        heading: "Support requests and introductions",
        body: "Support request details are accessible only to CiP Admin. If a facilitated introduction is arranged, only the information you have consented to share will be passed to the relevant party. You may withdraw consent for any introduction at any time.",
      },
      {
        heading: "Event registration data",
        body: "When you register for a CiP event, your registration data (name, email, any accessibility information provided) is used to manage the event and send you event communications. This data is retained for administrative purposes and is not shared beyond the event team.",
      },
      {
        heading: "Donation link and click data",
        body: "If you click the Donate button on this platform, you will be redirected to an external donation provider. CiP may log click events for internal reporting purposes. Payment processing and card data are handled entirely by the external provider.",
      },
      {
        heading: "Accessing, correcting, exporting or deleting your data",
        body: "You may request access to, correction of, or a copy of your personal data at any time through the Settings > Data section of your account, or by contacting CiP directly. Account deletion requests will be processed within 30 days.",
      },
      {
        heading: "Withdrawing consent",
        body: "You may withdraw consent for specific uses of your data at any time through your Privacy & Consent settings. Withdrawing consent may affect CiP's ability to provide certain support or facilitated introductions.",
      },
      {
        heading: "Contacting CiP about privacy",
        body: "If you have questions or concerns about how CiP handles your personal information, please contact our Privacy Officer at privacy@christiansinpolitics.org.au or write to: Privacy Officer, Christians in Politics, PO Box [address], Australia.",
      },
    ],
  },
  conduct: {
    title: "Member Conduct Agreement",
    updated: "July 2026",
    sections: [
      {
        heading: "Christian first, politics second",
        body: "Your identity as a follower of Jesus Christ takes precedence over any political affiliation or loyalty. CiP members are expected to hold their political convictions with humility, recognising that faithful Christians may hold different views.",
      },
      {
        heading: "Speak with charity and respect",
        body: "Members must engage with CiP staff, volunteers and any individuals introduced through CiP with genuine charity and respect. This includes in all written, verbal and digital communication connected to the platform.",
      },
      {
        heading: "No harassment, abuse, intimidation or factional campaigning",
        body: "Any form of harassment, abusive language, intimidation, bullying or factional campaigning is strictly prohibited. This applies to all interactions facilitated by or connected to CiP, whether online or in person.",
      },
      {
        heading: "No use of the platform for party recruitment",
        body: "The CiP platform must not be used to recruit members to any political party, campaign on behalf of a party, or promote a candidate — unless explicitly approved in writing by CiP leadership. CiP is non-partisan.",
      },
      {
        heading: "Community posts and comments",
        body: "The platform provides a community feed, group pages and company pages where members may post, comment and react. When you post or comment you must uphold this Agreement — engaging with charity and respect, and never using posts or comments for harassment, abuse, intimidation or factional campaigning. Post authors may choose to limit or turn off comments on their own posts.",
      },
      {
        heading: "AI monitoring of comments and behaviour",
        body: "You acknowledge and agree that CiP uses automated systems, including artificial intelligence, to monitor comment and posting behaviour on the platform. This monitoring is used solely to ensure members are keeping to this Member Conduct Agreement and the Terms of Use. Members can also report posts or comments they consider inappropriate. Reported or flagged content is sent to CiP Admin — and to the relevant group or company page owner where applicable — for review, and may be removed. Breaches identified through monitoring or reporting may lead to suspension or removal of access.",
      },
      {
        heading: "No member-to-member contact without consent",
        body: "Members may not initiate contact with other members outside of a CiP-facilitated introduction. Any introduction requires the explicit consent of both parties and is arranged by CiP Admin.",
      },
      {
        heading: "Respect confidentiality",
        body: "Information you receive about other individuals through CiP-facilitated introductions must be kept confidential. You must not share, disclose or publish personal information about other members or contacts without their consent.",
      },
      {
        heading: "Admin moderation and account removal",
        body: "CiP Admin may moderate, suspend or permanently remove access where a member breaches this Agreement. Serious or repeated breaches will result in immediate removal. CiP will endeavour to notify affected members and allow them to respond.",
      },
    ],
  },
};

// ── Legal modal component ───────────────────────────────────────────
function LegalModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  if (!type) return null;
  const content = LEGAL_CONTENT[type];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <div>
            <h2 style={{ color: NAVY }}>{content.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{content.updated}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {content.sections.map((s, i) => (
            <div key={i}>
              <h4 style={{ color: NAVY, marginBottom: 4 }}>{s.heading}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Modal footer */}
        <div
          className="px-6 py-4 shrink-0 flex justify-end"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 500 }}
          >
            Back to sign-up
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeletedAccountScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${NAVY} 0%, transparent 70%)`, filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <CiPLogo size={48} className="mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight mt-6" style={{ color: theme.text }}>
            Account Deleted
          </h1>
          <p className="text-[15px] mt-3" style={{ color: theme.textMuted }}>
            Your account and all associated data have been permanently removed from the Christians in Politics Network.
          </p>
        </div>

        <button
          onClick={() => navigate("signup")}
          className="w-full h-12 rounded-xl text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: NAVY, color: "#fff", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

// ── Set-new-password screen (password recovery) ─────────────────────
export function UpdatePasswordScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    // The recovery link established a session, so updateUser applies to this account.
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    // Strip ?reset=true (and any recovery hash) so a refresh can't re-trigger this.
    window.history.replaceState({}, "", window.location.origin + "/");
    setDone(true);
    setTimeout(() => navigate("dashboard"), 1200);
  };

  return (
    <PublicFrame onOpenModal={() => {}} navigate={navigate}>
      <div className="max-w-lg mx-auto py-12">
        <h1 style={{ color: NAVY, fontWeight: 700, fontSize: 32 }}>Set a new password</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Choose a new password for your CiP member account.
        </p>

        {done ? (
          <div className="mt-8 text-sm text-green-600">
            Password updated. Taking you to your dashboard…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Field label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-6 py-3 rounded-xl text-sm"
              style={{ background: NAVY, color: "#fff", fontWeight: 600, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Please wait..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </PublicFrame>
  );
}

// ── PublicFrame ─────────────────────────────────────────────────────
function PublicFrame({
  children,
  onOpenModal,
  navigate,
}: {
  children: ReactNode;
  onOpenModal?: (m: ModalType) => void;
  navigate?: (s: Screen) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <header
        className="px-8 py-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <CiPLogo />
        <div className="text-sm text-gray-500">
          Already a member?{" "}
          <span
            style={{ color: NAVY, cursor: "pointer" }}
            className="hover:underline"
            onClick={() => navigate && navigate("signin")}
          >
            Sign in
          </span>
        </div>
      </header>

      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">{children}</main>

      {/* Footer */}
      <footer
        className="px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ borderTop: "1px solid #e5e7eb", color: "#9ca3af" }}
      >
        <span>© 2025 Christians in Politics. Non-partisan · Privacy-first.</span>
        <div className="flex flex-wrap gap-4">
          {onOpenModal && (
            <>
              <button onClick={() => onOpenModal("terms")} className="hover:underline">Terms of Use</button>
              <button onClick={() => onOpenModal("privacy")} className="hover:underline">Privacy Policy</button>
              <button onClick={() => onOpenModal("conduct")} className="hover:underline">Member Conduct Agreement</button>
            </>
          )}
          <a href="mailto:hello@christiansinpolitics.com" className="hover:underline">Contact CiP</a>
        </div>
      </footer>
    </div>
  );
}

// ── Signup screen ───────────────────────────────────────────────────
export function SignupScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [modal, setModal] = useState<ModalType>(null);
  return (
    <PublicFrame onOpenModal={setModal} navigate={navigate}>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div
            className="inline-block px-3 py-1 rounded-full text-xs mb-5"
            style={{ background: "#f0f4f8", color: NAVY }}
          >
            Non-partisan · Christian first · Privacy-first
          </div>
          <h1 style={{ color: NAVY, fontSize: 38, lineHeight: 1.15, fontWeight: 700 }}>
            Join a movement of Christians participating faithfully in politics
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            CiP helps Christians explore political involvement, connect with trusted support,
            access resources, and take their next faithful step in public life.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("account")}
              className="px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm"
              style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
            >
              Become a member <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate("signin")}
              className="px-6 py-3 rounded-xl border text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#d1d5db", color: NAVY, fontWeight: 500 }}
            >
              Log in
            </button>
          </div>
          <p className="mt-5 text-xs text-gray-400">
            CiP does not endorse political parties, candidates or policies.
          </p>
        </div>
        {/* Hero image replacing the four feature tiles */}
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 420 }}>
          <img
            src="https://images.unsplash.com/photo-1764136093763-3f571bb2cf7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJsaWFtZW50JTIwYnVpbGRpbmclMjBjaXZpYyUyMHBvbGl0aWNzJTIwQXVzdHJhbGlhfGVufDF8fHx8MTc3ODM4MDE1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Parliament and civic engagement"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(11,37,69,0.75) 0%, rgba(11,37,69,0.1) 60%, transparent 100%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(201,162,39,0.9)" }}>
              Christians in Politics
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
              Christian first. Politics second. Kingdom before tribe.
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-14 py-5 px-6 rounded-2xl text-center"
        style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
      >
        <div className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>
          Christian first. Politics second. Kingdom before tribe.
        </div>
      </div>
      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}

export function SignInScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [modal, setModal] = useState<ModalType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // App.tsx useEffect will catch the user state change and redirect to dashboard
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");
    setResetMessage("");
    
    // Redirect back to members site to update password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/?reset=true",
    });
    
    if (error) {
      setError(error.message);
    } else {
      setResetMessage("Check your email for the password reset link.");
    }
    setLoading(false);
  };

  return (
    <PublicFrame onOpenModal={setModal} navigate={navigate}>
      <div className="max-w-lg mx-auto py-12">
        <h1 style={{ color: NAVY, fontWeight: 700, fontSize: 32 }}>Welcome back</h1>
        <p className="text-gray-500 mt-2 text-sm">Sign in to your member account.</p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          <Field label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div>
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="text-right mt-1">
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-xs hover:underline"
                style={{ color: NAVY }}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          {resetMessage && <div className="text-sm text-green-600 mt-2">{resetMessage}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-6 py-3 rounded-xl text-sm"
            style={{
              background: NAVY,
              color: "#fff",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("signup")}
            className="text-sm hover:underline"
            style={{ color: NAVY }}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}

// ── Account creation screen ─────────────────────────────────────────
export function AccountScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    sessionStorage.setItem("signup_first_name", firstName);
    sessionStorage.setItem("signup_last_name", lastName);
    sessionStorage.setItem("signup_email", email);
    sessionStorage.setItem("signup_mobile", mobile);
    sessionStorage.setItem("signup_password", password);
    navigate("creed");
  };

  return (
    <PublicFrame onOpenModal={setModal} navigate={navigate}>
      <div className="max-w-lg mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {["Account", "Creed", "Done"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: i === 0 ? NAVY : "#e5e7eb",
                  color: i === 0 ? "#fff" : "#9ca3af",
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: i === 0 ? NAVY : "#9ca3af", fontWeight: i === 0 ? 600 : 400 }}>
                {step}
              </span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h1 style={{ color: NAVY, fontWeight: 700 }}>Create your account</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Your faith and political information are private. Members are not searchable by other members.
        </p>

        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(11,37,69,0.04)", border: "1px solid rgba(11,37,69,0.1)" }}>
          <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#0B2545" }}>Your Privacy Comes First</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            By default, your account is set to be <strong>fully anonymous</strong>. Your personal details remain completely hidden from others until you explicitly decide to share them publicly across the platform or privately within specific groups.
          </p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Field label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Field label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Mobile number (optional)" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Field label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          {error && <div className="text-sm text-red-600">{error}</div>}

          {/* Linked legal checkbox */}
          <div
            className="p-4 rounded-xl"
            style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
          >
            <label className="flex gap-3 items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-navy"
                style={{ width: 16, height: 16, accentColor: NAVY }}
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I agree to CiP's{" "}
                <button
                  type="button"
                  onClick={() => setModal("terms")}
                  className="underline hover:opacity-70 transition-opacity"
                  style={{ color: NAVY, fontWeight: 500 }}
                >
                  Terms of Use
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setModal("privacy")}
                  className="underline hover:opacity-70 transition-opacity"
                  style={{ color: NAVY, fontWeight: 500 }}
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setModal("conduct")}
                  className="underline hover:opacity-70 transition-opacity"
                  style={{ color: NAVY, fontWeight: 500 }}
                >
                  Member Conduct Agreement
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!agreed}
            className="w-full px-6 py-3 rounded-xl text-sm"
            style={{
              background: agreed ? NAVY : "#e5e7eb",
              color: agreed ? "#fff" : "#9ca3af",
              fontWeight: 600,
              cursor: agreed ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            Continue
          </button>
        </form>

        <button onClick={() => navigate("signup")} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </button>
      </div>

      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}

function Field({ label, type = "text", value, onChange, required }: { label: string; type?: string; value?: string; onChange?: (e: any) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: NAVY, fontWeight: 500 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
        style={{ borderColor: "#d1d5db", background: "#fff", border: "1px solid #d1d5db" }}
      />
    </div>
  );
}

// ── Nicene Creed ────────────────────────────────────────────────────
const NICENE = `We believe in one God, the Father, the Almighty, maker of heaven and earth, of all that is, seen and unseen.

We believe in one Lord, Jesus Christ, the only Son of God, eternally begotten of the Father, God from God, Light from Light, true God from true God, begotten, not made, of one Being with the Father; through him all things were made.

For us and for our salvation he came down from heaven, was incarnate of the Holy Spirit and the Virgin Mary and became truly human. For our sake he was crucified under Pontius Pilate; he suffered death and was buried. On the third day he rose again in accordance with the Scriptures; he ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead, and his kingdom will have no end.

We believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father (and the Son), who with the Father and the Son is worshiped and glorified, who has spoken through the prophets.

We believe in one holy catholic and apostolic Church. We acknowledge one baptism for the forgiveness of sins. We look for the resurrection of the dead, and the life of the world to come. Amen.`;

const DENOMINATIONS = [
  "Anglican",
  "Baptist",
  "Catholic",
  "Churches of Christ",
  "Eastern Orthodox",
  "Oriental Orthodox (including Coptic Orthodox)",
  "Lutheran",
  "Pentecostal / Charismatic",
  "Presbyterian / Reformed",
  "Salvation Army",
  "Seventh-day Adventist",
  "Uniting Church",
  "Independent / Non-denominational",
  "Maronite Catholic",
  "Assyrian / Chaldean",
  "Other recognised Christian tradition",
];

export function CreedScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [affirm, setAffirm] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!affirm) return;
    setLoading(true);
    setError("");

    const email = sessionStorage.getItem("signup_email") || "";
    const password = sessionStorage.getItem("signup_password") || "";
    const firstName = sessionStorage.getItem("signup_first_name") || "";
    const lastName = sessionStorage.getItem("signup_last_name") || "";
    const mobile = sessionStorage.getItem("signup_mobile") || "";

    if (!email || !password) {
      setError("Missing account details. Please go back.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: firstName,
          last_name: lastName,
          mobile: mobile,
          creed_affirmed: true,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Clear the signup details (incl. the plaintext password) from sessionStorage.
    ["signup_email", "signup_password", "signup_first_name", "signup_last_name", "signup_mobile"]
      .forEach((k) => sessionStorage.removeItem(k));

    navigate("welcome");
  };

  return (
    <PublicFrame onOpenModal={setModal} navigate={navigate}>
      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {["Account", "Creed", "Done"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: i === 1 ? NAVY : i === 0 ? GOLD : "#e5e7eb",
                  color: i <= 1 ? "#fff" : "#9ca3af",
                  fontWeight: 600,
                }}
              >
                {i === 0 ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className="text-xs" style={{ color: i === 1 ? NAVY : "#9ca3af", fontWeight: i === 1 ? 600 : 400 }}>
                {step}
              </span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h1 style={{ color: NAVY, fontWeight: 700 }}>Shared Christian foundation</h1>
        <p className="text-gray-500 mt-2 leading-relaxed text-sm max-w-xl">
          CiP welcomes Christians across denominations and political traditions. To preserve the
          Christian identity of the network, all members are asked to affirm the Nicene Creed —
          the foundational statement of faith shared across Catholic, Orthodox and Protestant Christianity.
        </p>

        {/* Creed reading panel */}
        <div
          className="mt-6 rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div
            className="px-5 py-3 flex items-center gap-3"
            style={{ background: NAVY }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: "rgba(201,162,39,0.2)" }}
            >
              <span style={{ color: GOLD, fontSize: 12, fontWeight: 700 }}>✚</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 600 }}>The Nicene Creed</span>
            <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Council of Nicaea, AD 325 / 381
            </span>
          </div>
          <div
            className="px-6 py-6 max-h-64 overflow-y-auto text-sm leading-8 whitespace-pre-line"
            style={{
              background: "#fefdfb",
              color: "#374151",
              fontFamily: "Georgia, serif",
              borderTop: `2px solid ${GOLD}`,
            }}
          >
            {NICENE}
          </div>
        </div>

        {/* Affirmation checkbox */}
        <label
          className="flex gap-3 items-start mt-6 cursor-pointer p-4 rounded-xl"
          style={{ background: affirm ? "rgba(11,37,69,0.04)" : "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <input
            type="checkbox"
            checked={affirm}
            onChange={(e) => setAffirm(e.target.checked)}
            className="mt-0.5"
            style={{ width: 16, height: 16, accentColor: NAVY }}
          />
          <span style={{ color: NAVY, fontWeight: 600 }} className="text-sm">
            I affirm the Nicene Creed in good conscience as a statement of my Christian faith.
          </span>
        </label>

        {/* Denomination dropdown */}
        <div className="mt-5">
          <label className="text-xs block mb-1.5" style={{ color: NAVY, fontWeight: 500 }}>
            Christian tradition or church family <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2.5 rounded-lg outline-none text-sm appearance-none"
              style={{ border: "1px solid #d1d5db", background: "#fff", color: "#374151" }}
            >
              <option value="">Select your tradition…</option>
              {DENOMINATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            This is optional and is used only to provide better tailored support.
          </p>
        </div>

        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("account")}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "#d1d5db", color: NAVY }}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("blocked")}
              disabled={loading}
              className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
            >
              I cannot affirm this
            </button>
            <button
              onClick={handleContinue}
              disabled={!affirm || loading}
              className="px-6 py-2.5 rounded-xl text-sm"
              style={{
                background: affirm ? NAVY : "#e5e7eb",
                color: affirm ? "#fff" : "#9ca3af",
                fontWeight: 600,
                cursor: affirm ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </div>
        </div>
      </div>

      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}

// ── Blocked screen ──────────────────────────────────────────────────
export function BlockedScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [modal, setModal] = useState<ModalType>(null);
  return (
    <PublicFrame onOpenModal={setModal} navigate={navigate}>
      <div className="max-w-lg mx-auto text-center py-8">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-6"
          style={{ background: "#f0f4f8" }}
        >
          <Users size={22} style={{ color: NAVY }} />
        </div>
        <h1 style={{ color: NAVY, fontWeight: 700 }}>Thanks for your interest in CiP</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          CiP is a Christian network built around a shared confession of faith. Because affirmation
          of the Nicene Creed is required for membership, we're unable to progress your membership
          application at this time. You're still welcome to learn more about CiP through our public
          website and public events where appropriate.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate("signup")}
            className="px-5 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "#d1d5db", color: NAVY }}
          >
            Return to website
          </button>
          <a href="mailto:hello@christiansinpolitics.com" className="px-5 py-2.5 rounded-xl text-sm" style={{ background: NAVY, color: "#fff", fontWeight: 600 }}>
            Contact CiP
          </a>
        </div>
      </div>
      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}

// ── Welcome screen ──────────────────────────────────────────────────
export function WelcomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [modal, setModal] = useState<ModalType>(null);
  return (
    <PublicFrame onOpenModal={setModal}>
      <div className="max-w-lg mx-auto text-center py-8">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(11,37,69,0.05)" }}
        >
          <CheckCircle2 size={28} style={{ color: NAVY }} />
        </div>
        <h1 style={{ color: NAVY, fontWeight: 700 }}>Check your email</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          We've sent a confirmation link to your email address. Please click the link to verify your account and complete your profile.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate("signup")}
            className="px-5 py-2.5 rounded-xl text-sm"
            style={{ background: NAVY, color: "#fff", fontWeight: 600 }}
          >
            Return to home
          </button>
        </div>
      </div>
      <LegalModal type={modal} onClose={() => setModal(null)} />
    </PublicFrame>
  );
}