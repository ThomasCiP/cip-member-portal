import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { CiPLogo, NAVY, GOLD, WARM, MUTED_BLUE } from "./brand";
import { Screen } from "./types";
import { ShieldCheck, Lock, Users, BookOpenCheck, ArrowRight, CheckCircle2 } from "lucide-react";

function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ background: WARM }}>
      <header
        className="px-8 py-5 flex items-center justify-between border-b"
        style={{ borderColor: "#e7e2d6", background: "#fff" }}
      >
        <CiPLogo />
        <div className="text-sm text-gray-600">Already a member? <span style={{ color: NAVY, cursor: "pointer" }} className="hover:underline">Sign in</span></div>
      </header>
      <main className="px-8 py-12 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

export function SignupScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <PublicFrame>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div
            className="inline-block px-3 py-1 rounded-full text-xs mb-5"
            style={{ background: MUTED_BLUE, color: NAVY }}
          >
            Non-partisan · Christian first · Politics second
          </div>
          <h1 style={{ color: NAVY, fontSize: 40, lineHeight: 1.15, fontWeight: 600 }}>
            Join a movement of Christians participating faithfully in politics
          </h1>
          <p className="mt-4 text-gray-700 text-base leading-relaxed">
            CiP helps Christians explore political involvement, connect with trusted support,
            access resources, and take their next faithful step in public life.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("account")}
              className="px-6 py-3 rounded-md inline-flex items-center gap-2"
              style={{ background: NAVY, color: "#fff", fontWeight: 500 }}
            >
              Become a member <ArrowRight size={16} />
            </button>
            <button
              className="px-6 py-3 rounded-md border"
              style={{ borderColor: NAVY, color: NAVY, fontWeight: 500 }}
            >
              Learn how CiP works
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-500 max-w-md">
            CiP does not endorse political parties, candidates or policies.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, title: "Trusted support", body: "1:1 introductions facilitated by CiP admins, not strangers." },
            { icon: Lock, title: "Private by default", body: "Members are not searchable by other members." },
            { icon: BookOpenCheck, title: "Wise resources", body: "Books, training and Bible studies on faithful public life." },
            { icon: Users, title: "Cross-tradition", body: "Catholics, Protestants, Orthodox — united in confession." },
          ].map((c, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border bg-white"
              style={{ borderColor: "#e7e2d6" }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
                style={{ background: MUTED_BLUE, color: NAVY }}
              >
                <c.icon size={18} />
              </div>
              <div style={{ color: NAVY, fontWeight: 600 }}>{c.title}</div>
              <p className="text-sm text-gray-600 mt-1">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-16 p-6 rounded-xl text-center"
        style={{ background: "#fff", border: "1px solid #e7e2d6" }}
      >
        <div className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>
          Christian first. Politics second. Kingdom before tribe.
        </div>
      </div>
    </PublicFrame>
  );
}

export function AccountScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("signup_first_name", firstName);
    sessionStorage.setItem("signup_last_name", lastName);
    sessionStorage.setItem("signup_email", email);
    sessionStorage.setItem("signup_password", password);
    navigate("creed");
  };

  return (
    <PublicFrame>
      <div className="max-w-xl mx-auto">
        <div className="text-xs text-gray-500 mb-2">Step 1 of 3</div>
        <h1 style={{ color: NAVY, fontWeight: 600 }}>Create your account</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Your religious background and political information are private. Members are not searchable by other members.
        </p>

        <form
          className="mt-6 p-6 rounded-xl bg-white border space-y-4"
          style={{ borderColor: "#e7e2d6" }}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Field label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Field label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Mobile number (optional)" />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Field label="Confirm password" type="password" required />
          <label className="flex gap-2 items-start text-sm text-gray-700 pt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span>I agree to CiP's terms, privacy policy and member conduct expectations.</span>
          </label>
          <button
            type="submit"
            disabled={!agreed}
            className="w-full px-6 py-3 rounded-md mt-2"
            style={{
              background: agreed ? NAVY : "#cbcbcb",
              color: "#fff",
              fontWeight: 500,
              cursor: agreed ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </form>
        <button onClick={() => navigate("signup")} className="mt-4 text-sm text-gray-500 hover:underline">
          ← Back
        </button>
      </div>
    </PublicFrame>
  );
}

function Field({ label, type = "text", value, onChange, required }: { label: string; type?: string; value?: string; onChange?: (e: any) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: NAVY }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2.5 rounded-md outline-none border"
        style={{ borderColor: "#e2dccf", background: "#faf9f5" }}
      />
    </div>
  );
}

const NICENE = `We believe in one God, the Father, the Almighty, maker of heaven and earth, of all that is, seen and unseen.

We believe in one Lord, Jesus Christ, the only Son of God, eternally begotten of the Father, God from God, Light from Light, true God from true God, begotten, not made, of one Being with the Father; through him all things were made.

For us and for our salvation he came down from heaven, was incarnate of the Holy Spirit and the Virgin Mary and became truly human. For our sake he was crucified under Pontius Pilate; he suffered death and was buried. On the third day he rose again in accordance with the Scriptures; he ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead, and his kingdom will have no end.

We believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father, who with the Father and the Son is worshiped and glorified, who has spoken through the prophets.

We believe in one holy catholic and apostolic Church. We acknowledge one baptism for the forgiveness of sins. We look for the resurrection of the dead, and the life of the world to come. Amen.`;

export function CreedScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [affirm, setAffirm] = useState(false);
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

    if (!email || !password) {
      setError("Missing account details. Please go back.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        creed_affirmed: true,
      });
      navigate("welcome");
    } else {
      setLoading(false);
    }
  };

  return (
    <PublicFrame>
      <div className="max-w-2xl mx-auto">
        <div className="text-xs text-gray-500 mb-2">Step 2 of 3</div>
        <h1 style={{ color: NAVY, fontWeight: 600 }}>Shared Christian foundation</h1>
        <p className="text-gray-700 mt-3 text-sm leading-relaxed">
          CiP welcomes Christians across denominations and political traditions. To preserve the
          Christian identity of the network, members are asked to affirm the Nicene Creed before
          joining.
        </p>

        <div
          className="mt-6 rounded-xl border bg-white"
          style={{ borderColor: "#e7e2d6" }}
        >
          <div
            className="px-5 py-3 border-b text-sm"
            style={{ color: NAVY, fontWeight: 600, borderColor: "#e7e2d6", background: "#faf7f0" }}
          >
            The Nicene Creed
          </div>
          <div
            className="px-6 py-5 max-h-72 overflow-y-auto text-sm leading-relaxed text-gray-800 whitespace-pre-line"
          >
            {NICENE}
          </div>
        </div>

        <label className="flex gap-2 items-start mt-6">
          <input type="checkbox" checked={affirm} onChange={(e) => setAffirm(e.target.checked)} className="mt-1" />
          <span className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>
            I affirm the Nicene Creed
          </span>
        </label>

        <div className="mt-5">
          <label className="block text-sm mb-1.5" style={{ color: NAVY }}>
            Church / denomination / Christian community (optional)
          </label>
          <input
            className="w-full px-3 py-2.5 rounded-md border"
            style={{ borderColor: "#e2dccf", background: "#faf9f5" }}
            placeholder="e.g. St Andrew's Anglican, Sydney"
          />
        </div>

        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

        <div className="mt-8 flex justify-between">
          <button onClick={() => navigate("account")} disabled={loading} className="px-5 py-2.5 rounded-md border" style={{ borderColor: "#cfc8b8", color: NAVY }}>
            Back
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate("blocked")} disabled={loading} className="px-5 py-2.5 rounded-md text-sm text-gray-600 hover:underline">
              I cannot affirm this
            </button>
            <button
              onClick={handleContinue}
              disabled={!affirm || loading}
              className="px-6 py-2.5 rounded-md"
              style={{ background: affirm ? NAVY : "#cbcbcb", color: "#fff", fontWeight: 500, cursor: affirm ? "pointer" : "not-allowed" }}
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </PublicFrame>
  );
}

export function BlockedScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <PublicFrame>
      <div className="max-w-xl mx-auto text-center">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: MUTED_BLUE, color: NAVY }}
        >
          <Users size={22} />
        </div>
        <h1 style={{ color: NAVY, fontWeight: 600 }}>Thanks for your interest in CiP</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          CiP is a Christian network built around a shared confession of faith. Because affirmation
          of the Nicene Creed is required for membership, we're unable to progress your membership
          application at this time. You're still welcome to learn more about CiP through our public
          website and events where appropriate.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={() => navigate("signup")} className="px-5 py-2.5 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>
            Return to website
          </button>
          <button className="px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff" }}>
            Contact CiP
          </button>
        </div>
      </div>
    </PublicFrame>
  );
}

export function WelcomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <PublicFrame>
      <div className="max-w-xl mx-auto text-center">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: GOLD, color: NAVY }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h1 style={{ color: NAVY, fontWeight: 600 }}>Welcome to CiP</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Your account has been created. You can now complete your profile so CiP can better
          understand how to support your next step.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={() => navigate("profile")} className="px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff", fontWeight: 500 }}>
            Complete my profile
          </button>
          <button onClick={() => navigate("dashboard")} className="px-5 py-2.5 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>
            Go to dashboard
          </button>
        </div>
      </div>
    </PublicFrame>
  );
}
