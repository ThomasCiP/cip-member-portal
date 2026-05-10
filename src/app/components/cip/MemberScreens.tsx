import { useState } from "react";
import { Screen } from "./types";
import { NAVY, GOLD, MUTED_BLUE, WARM } from "./brand";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Compass,
  HeartHandshake,
  Megaphone,
  BookOpen,
  Lock,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Users,
  Star,
  Filter,
  Search,
  Download,
  Trash2,
  Mail,
} from "lucide-react";

function H1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ color: NAVY, fontWeight: 600 }}>{children}</h1>;
}

function Card({ children, className = "" }: any) {
  return (
    <div
      className={`rounded-xl bg-white p-6 border ${className}`}
      style={{ borderColor: "#e7e2d6" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <H1>{title}</H1>
      {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}

function Pill({ children, color = NAVY }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs"
      style={{ background: MUTED_BLUE, color }}
    >
      {children}
    </span>
  );
}

/* ----------------------- Dashboard ----------------------- */
export function Dashboard({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-1">
        <div>
          <H1>Welcome back, Sarah</H1>
          <p className="text-gray-600 text-sm mt-1">
            Christian first. Politics second. Here's what's happening in your network.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-7">
        <Card>
          <div className="flex items-center justify-between">
            <h3 style={{ color: NAVY }}>Complete your profile</h3>
            <span className="text-sm text-gray-500">60%</span>
          </div>
          <div className="h-2 w-full rounded-full mt-3" style={{ background: "#eee5d3" }}>
            <div className="h-full rounded-full" style={{ width: "60%", background: GOLD }} />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Add your faith background and political engagement so CiP can support you better.
          </p>
          <button
            onClick={() => navigate("profile")}
            className="mt-4 text-sm inline-flex items-center gap-1"
            style={{ color: NAVY, fontWeight: 500 }}
          >
            Continue <ArrowRight size={14} />
          </button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Request support from CiP</h3>
          </div>
          <p className="text-sm text-gray-600">
            Ask a CiP admin for an introduction, mentoring or a pathway recommendation.
          </p>
          <button
            onClick={() => navigate("support")}
            className="mt-4 px-3 py-2 rounded-md text-sm"
            style={{ background: NAVY, color: "#fff" }}
          >
            New support request
          </button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Compass size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Explore political pathways</h3>
          </div>
          <p className="text-sm text-gray-600">
            Branch involvement, public service, candidate selection, mentoring and more.
          </p>
          <button
            onClick={() => navigate("pathways")}
            className="mt-4 text-sm inline-flex items-center gap-1"
            style={{ color: NAVY, fontWeight: 500 }}
          >
            Browse pathways <ArrowRight size={14} />
          </button>
        </Card>

        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} style={{ color: NAVY }} />
              <h3 style={{ color: NAVY }}>Upcoming CiP events</h3>
            </div>
            <button onClick={() => navigate("events")} className="text-sm" style={{ color: NAVY }}>
              View all
            </button>
          </div>
          <div className="space-y-3">
            {[
              { title: "Faithful Politics: An evening with Tim Costello", date: "Wed 27 May · 7:00 PM AEST", loc: "Online" },
              { title: "Sydney CiP Members Prayer Gathering", date: "Sat 31 May · 8:00 AM", loc: "Sydney CBD" },
            ].map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "#faf7f0" }}
              >
                <div>
                  <div style={{ color: NAVY, fontWeight: 500 }} className="text-sm">
                    {e.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2">
                    <Clock size={12} /> {e.date} · <MapPin size={12} /> {e.loc}
                  </div>
                </div>
                <button
                  onClick={() => navigate("event-detail")}
                  className="px-3 py-1.5 rounded-md text-sm"
                  style={{ background: NAVY, color: "#fff" }}
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Latest announcements</h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li>
              <Pill>Opportunity</Pill>
              <div className="mt-1" style={{ color: NAVY }}>Liberal pre-selection nominations open in QLD</div>
            </li>
            <li>
              <Pill>Training</Pill>
              <div className="mt-1" style={{ color: NAVY }}>Public Service pathway briefing — June</div>
            </li>
          </ul>
          <button onClick={() => navigate("announcements")} className="mt-3 text-sm" style={{ color: NAVY }}>
            See all
          </button>
        </Card>

        <Card className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Recommended resources</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { t: "Politics — A Case for Christian Engagement", a: "John Anderson", time: "240 pages" },
              { t: "How to Join a Political Party in Australia", a: "CiP Guide", time: "12 min read" },
              { t: "Faithfulness in Public Life (Bible study)", a: "CiP", time: "6 sessions" },
              { t: "Candidate Selection 101", a: "CiP Course", time: "45 min" },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "#faf7f0" }}>
                <div style={{ color: NAVY, fontWeight: 500 }} className="text-sm">{r.t}</div>
                <div className="text-xs text-gray-600 mt-0.5">{r.a} · {r.time}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("resources")} className="mt-3 text-sm" style={{ color: NAVY }}>
            Browse library
          </button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Privacy & data</h3>
          </div>
          <p className="text-sm text-gray-600">
            Your political and religious information is private. Members are not searchable by other members.
          </p>
          <button onClick={() => navigate("privacy")} className="mt-3 text-sm" style={{ color: NAVY, fontWeight: 500 }}>
            Manage privacy →
          </button>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: MUTED_BLUE, color: NAVY }}>
              <Compass size={18} />
            </div>
            <div>
              <div style={{ color: NAVY, fontWeight: 500 }}>Not sure which party to join?</div>
              <div className="text-sm text-gray-600">
                Answer a short set of questions to reflect on where your views may align. This is not voting advice.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("guidance")}
            className="px-4 py-2 rounded-md"
            style={{ background: GOLD, color: NAVY, fontWeight: 500 }}
          >
            Start party guidance
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------- Profile ----------------------- */
export function ProfileScreen() {
  const sections = [
    { name: "Personal details", done: true },
    { name: "Faith background", done: true },
    { name: "Political engagement", done: false },
    { name: "Support and contribution", done: false },
  ];
  const denominations = [
    "Catholic", "Anglican", "Uniting Church", "Baptist", "Presbyterian / Reformed",
    "Lutheran", "Pentecostal / Charismatic", "Orthodox / Eastern Orthodox",
    "Oriental Orthodox (incl. Coptic)", "Churches of Christ", "Salvation Army",
    "Seventh-day Adventist", "Independent / Non-denominational",
    "Assyrian / Chaldean", "Maronite Catholic", "Other Protestant",
    "Other Christian tradition", "Prefer not to say",
  ];
  const parties = [
    "Liberal Party", "Australian Labor Party", "National Party",
    "Australian Greens", "One Nation", "Other minor party",
    "Independent", "Not sure yet", "Prefer not to say",
  ];
  const interests = [
    "Join a political party", "Choose a political party", "Find a local branch",
    "Understand party structures", "Candidate selection", "Volunteering on campaigns",
    "Public service pathway", "Advocacy organisation pathway", "Local council",
    "Staffer roles", "Policy training", "Prayer and spiritual support",
    "Mentoring", "Events and fellowship",
  ];

  return (
    <div className="max-w-5xl">
      <SectionHeader title="My profile" subtitle="This information is private. Members are not searchable by other members." />

      <div className="grid grid-cols-3 gap-6">
        <div>
          <Card>
            <div className="text-sm" style={{ color: NAVY, fontWeight: 600 }}>Profile completion</div>
            <div className="h-2 rounded-full mt-2" style={{ background: "#eee5d3" }}>
              <div className="h-full rounded-full" style={{ width: "60%", background: GOLD }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">60% complete</div>
            <div className="mt-4 space-y-2">
              {sections.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {s.done ? (
                    <CheckCircle2 size={16} style={{ color: GOLD }} />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                  <span style={{ color: NAVY }}>{s.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-2 space-y-6">
          <Card>
            <h3 style={{ color: NAVY }}>Personal details</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Inp label="First name" value="Sarah" />
              <Inp label="Last name" value="Reed" />
              <Inp label="Email" value="sarah@example.com" />
              <Inp label="Mobile (optional)" value="" />
              <Sel label="State / territory" options={["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]} />
              <Inp label="City / region" value="Sydney" />
              <Sel label="Age range (optional)" options={["18-24", "25-34", "35-44", "45-54", "55+"]} />
              <Inp label="University or workplace (optional)" value="" />
            </div>
          </Card>

          <Card>
            <h3 style={{ color: NAVY }}>Faith background</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Sel label="Christian tradition most identified with" options={denominations} />
              <Inp label="Local church / Christian community (optional)" value="" />
              <Inp label="University Christian group? (optional)" value="" />
              <Sel label="Should CiP consider this when matching support?" options={["Yes", "No"]} />
            </div>
          </Card>

          <Card>
            <h3 style={{ color: NAVY }}>Political engagement</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Sel
                label="How engaged are you in politics?"
                options={[
                  "Just curious", "Learning the basics", "Interested in joining a party",
                  "Already a party member", "Active in a branch", "Campaign volunteer",
                  "Staffer / adviser", "Candidate / elected official",
                  "Public servant", "Advocacy / policy professional",
                ]}
              />
              <Sel label="Currently a member of a political party?" options={["Yes", "No", "Prefer not to say"]} />
              <Sel label="Political party affiliation (optional)" options={parties} />
              <Inp label="Branch or electorate (optional)" value="" />
              <Sel
                label="Are you currently in elected/staffer office?"
                options={["Yes", "No"]}
              />
              <Inp label="Role details (optional, private)" value="" />
            </div>
          </Card>

          <Card>
            <h3 style={{ color: NAVY }}>Support and contribution</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Sel label="Seeking support to become more involved?" options={["Yes", "No"]} />
              <Sel label="Want to help others get involved?" options={["Yes", "No"]} />
              <Sel label="Preferred contact method" options={["Email", "Phone", "Either"]} />
            </div>
            <div className="mt-4">
              <label className="text-sm" style={{ color: NAVY }}>Areas of interest</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs border" style={{ borderColor: "#e2dccf", color: NAVY }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <label className="mt-4 flex gap-2 items-start text-sm text-gray-700">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>I consent to CiP using this information to provide relevant support, introductions and opportunities.</span>
            </label>
          </Card>

          <div className="flex justify-end">
            <button className="px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff", fontWeight: 500 }}>
              Save profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm block mb-1.5" style={{ color: NAVY }}>{label}</label>
      <input defaultValue={value} className="w-full px-3 py-2 rounded-md border outline-none" style={{ borderColor: "#e2dccf", background: "#faf9f5" }} />
    </div>
  );
}
function Sel({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm block mb-1.5" style={{ color: NAVY }}>{label}</label>
      <select className="w-full px-3 py-2 rounded-md border outline-none" style={{ borderColor: "#e2dccf", background: "#faf9f5" }}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ----------------------- Pathways ----------------------- */
export function PathwaysScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const cards = [
    { t: "Join a major political party", desc: "Choose a party aligned with your convictions and become a member.", time: "Lifelong", diff: "Easy", next: "Talk to CiP about which party fits" },
    { t: "Explore local branch involvement", desc: "Attend a branch meeting and meet local members.", time: "Monthly", diff: "Easy", next: "Find your nearest branch" },
    { t: "Volunteer on a campaign", desc: "Doorknock, phone-bank, or staff a polling booth at the next election.", time: "Seasonal", diff: "Easy", next: "Express interest with CiP" },
    { t: "Consider local council", desc: "Stand for council to serve your community at the local level.", time: "Years", diff: "Moderate", next: "Read 'Local council 101'" },
    { t: "Explore public service", desc: "APS or state government — serving the public from inside.", time: "Career", diff: "Moderate", next: "Public service pathway briefing" },
    { t: "Explore staffer roles", desc: "Work in an MP or Senator's office on policy and advocacy.", time: "Years", diff: "Hard", next: "Request introduction" },
    { t: "Join an advocacy or policy organisation", desc: "Work with affiliated groups on specific issues.", time: "Career", diff: "Moderate", next: "Browse affiliated groups" },
    { t: "Consider candidate selection", desc: "Discern whether to put yourself forward for pre-selection.", time: "Years", diff: "Hard", next: "Read 'Candidate selection 101'" },
    { t: "Support through prayer, mentoring, or hospitality", desc: "Many of the most faithful contributions are quiet ones.", time: "Ongoing", diff: "Easy", next: "Sign up to mentor" },
  ];
  return (
    <div className="max-w-6xl">
      <SectionHeader title="Political pathways" />
      <Card className="mb-6" >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 style={{ color: NAVY }}>Explore your next faithful step</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              CiP does not tell you which party to join. We help you think wisely about vocation,
              conviction, temperament, local opportunities and practical next steps.
            </p>
          </div>
          <Compass size={42} style={{ color: GOLD }} />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-5">
        {cards.map((c) => (
          <Card key={c.t}>
            <h3 style={{ color: NAVY }}>{c.t}</h3>
            <p className="text-sm text-gray-600 mt-2">{c.desc}</p>
            <div className="flex gap-2 mt-3">
              <Pill>{c.time}</Pill>
              <Pill>{c.diff}</Pill>
            </div>
            <div className="text-xs text-gray-500 mt-3">Next: {c.next}</div>
            <button
              onClick={() => navigate("support")}
              className="mt-4 w-full px-3 py-2 rounded-md text-sm border"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              Request support
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Party guidance ----------------------- */
export function GuidanceScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [step, setStep] = useState(0);
  const total = 5;

  if (step === 0) {
    return (
      <div className="max-w-3xl">
        <SectionHeader title="Party guidance — a CiP reflection tool" />
        <Card>
          <h3 style={{ color: NAVY }}>Before you begin</h3>
          <p className="text-gray-700 text-sm mt-3 leading-relaxed">
            This tool is designed to help you reflect. It does not tell you how to vote, does not
            tell you which party to join, and does not represent a CiP endorsement. Your results are
            private unless you choose to share them with CiP when requesting support.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {["~10 minutes", "14 issue areas", "Optional importance weighting", "Private by default"].map((l) => (
              <li key={l} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={14} style={{ color: GOLD }} /> {l}
              </li>
            ))}
          </ul>
          <button onClick={() => setStep(1)} className="mt-6 px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff", fontWeight: 500 }}>
            Begin reflection
          </button>
        </Card>
      </div>
    );
  }

  if (step >= 1 && step <= 3) {
    const titles = ["Issue alignment", "Importance weighting", "Personal vocation"];
    const issues = [
      "Economic policy", "Social policy", "Religious freedom", "Family and community",
      "Cost of living", "Education", "Health", "Environment and stewardship",
      "Immigration and multicultural Australia", "National security and defence",
      "Indigenous affairs", "Housing", "Public service and integrity", "Local community priorities",
    ];
    const likert = ["Strongly disagree", "Disagree", "Neutral / unsure", "Agree", "Strongly agree"];
    const weights = ["Not important", "Somewhat important", "Very important", "Essential"];
    return (
      <div className="max-w-3xl">
        <SectionHeader title={`${titles[step - 1]}`} subtitle={`Step ${step} of ${total}`} />
        <div className="h-2 rounded-full mb-6" style={{ background: "#eee5d3" }}>
          <div className="h-full rounded-full" style={{ width: `${(step / total) * 100}%`, background: GOLD }} />
        </div>
        <div className="space-y-4">
          {(step === 2 ? issues.slice(0, 5) : issues.slice(0, 4)).map((q, i) => (
            <Card key={i}>
              <div style={{ color: NAVY, fontWeight: 500 }}>{q}</div>
              {step !== 2 && (
                <p className="text-sm text-gray-600 mt-1">
                  "Australia should {step === 1 ? "expand" : "prioritise"} action on {q.toLowerCase()}."
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {(step === 2 ? weights : likert).map((opt) => (
                  <button
                    key={opt}
                    className="px-3 py-1.5 rounded-md text-sm border"
                    style={{ borderColor: "#e2dccf", color: NAVY }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(step - 1)} className="px-5 py-2 rounded-md border" style={{ borderColor: "#cfc8b8", color: NAVY }}>Back</button>
          <button onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-md" style={{ background: NAVY, color: "#fff" }}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-3xl">
        <SectionHeader title="Personal vocation" subtitle={`Step 4 of ${total}`} />
        <Card>
          <p className="text-sm text-gray-700">A few questions about your sense of calling, time, and capacity.</p>
          <div className="space-y-4 mt-4">
            {[
              "I feel a sense of calling to public service.",
              "I have time available to volunteer or campaign.",
              "I'm willing to be publicly identified as a Christian in politics.",
              "I have local relationships I could draw on.",
            ].map((q, i) => (
              <div key={i}>
                <div className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>{q}</div>
                <div className="flex gap-2 mt-2">
                  {["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"].map((o) => (
                    <button key={o} className="px-3 py-1.5 rounded-md text-sm border" style={{ borderColor: "#e2dccf", color: NAVY }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(step - 1)} className="px-5 py-2 rounded-md border" style={{ borderColor: "#cfc8b8", color: NAVY }}>Back</button>
          <button onClick={() => setStep(5)} className="px-5 py-2 rounded-md" style={{ background: NAVY, color: "#fff" }}>See my reflection</button>
        </div>
      </div>
    );
  }

  // results
  return (
    <div className="max-w-4xl">
      <SectionHeader title="Your issue alignment" subtitle="A reflection — not voting advice." />
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 style={{ color: NAVY }}>Economic axis</h3>
          <Axis label="More market" value={62} other="More state" color={GOLD} />
          <h3 style={{ color: NAVY }} className="mt-6">Social axis</h3>
          <Axis label="More progressive" value={35} other="More conservative" color={NAVY} />
        </Card>
        <Card>
          <h3 style={{ color: NAVY }}>Parties you may want to research further</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { p: "Liberal Party", n: "Strong overlap on economic and family policy" },
              { p: "National Party", n: "Overlap on rural and family policy" },
              { p: "Australian Labor Party", n: "Overlap on cost of living and health" },
            ].map((r) => (
              <li key={r.p} className="flex items-start gap-2">
                <Star size={14} style={{ color: GOLD }} className="mt-0.5" />
                <div>
                  <div style={{ color: NAVY, fontWeight: 500 }}>{r.p}</div>
                  <div className="text-xs text-gray-600">{r.n}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5">
        <p className="text-sm text-gray-700">
          <strong style={{ color: NAVY }}>Important:</strong> This is a reflection tool, not voting advice.
          CiP does not endorse any party, candidate or policy. We encourage members to pray, seek wise counsel,
          research party platforms, and consider where they can serve faithfully.
        </p>
      </Card>

      <div className="flex flex-wrap gap-3 mt-5">
        <button className="px-4 py-2 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>Save privately</button>
        <button onClick={() => navigate("support")} className="px-4 py-2 rounded-md" style={{ background: NAVY, color: "#fff" }}>Request CiP support</button>
        <button onClick={() => navigate("pathways")} className="px-4 py-2 rounded-md border" style={{ borderColor: "#cfc8b8", color: NAVY }}>Explore political pathways</button>
        <button onClick={() => setStep(0)} className="px-4 py-2 rounded-md text-gray-600 hover:underline text-sm">Retake questions</button>
      </div>
    </div>
  );
}

function Axis({ label, value, other, color }: any) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{other}</span>
        <span>{label}</span>
      </div>
      <div className="h-2 rounded-full mt-1.5" style={{ background: "#eee5d3" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/* ----------------------- Support ----------------------- */
export function SupportScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-3xl">
      <SectionHeader title="Request support from CiP" subtitle="A CiP admin will review and respond. Your request is private." />
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Sel label="Request type" options={[
            "Help me join a political party", "Help me choose a political party",
            "Connect me to a local branch", "Connect me to a Christian in my preferred party",
            "Connect me to an advocacy group", "Connect me to public service pathways",
            "Help me understand candidate selection", "Help me explore local council",
            "Help me explore staffer roles", "I want to mentor or support others",
            "I have a job / internship / opportunity to share", "Other",
          ]} />
          <Sel label="State / territory" options={["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]} />
          <Sel label="Preferred party or pathway (optional)" options={["Not sure", "Liberal", "Labor", "National", "Greens", "Independent", "Other"]} />
          <Sel label="Urgency" options={["Low", "Medium", "High"]} />
        </div>
        <div className="mt-4">
          <label className="text-sm block mb-1.5" style={{ color: NAVY }}>Brief description</label>
          <textarea rows={4} className="w-full px-3 py-2 rounded-md border outline-none" style={{ borderColor: "#e2dccf", background: "#faf9f5" }} />
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex gap-2 items-start text-sm text-gray-700">
            <input type="checkbox" defaultChecked className="mt-1" /> I consent to be contacted by a CiP Admin.
          </label>
          <label className="flex gap-2 items-start text-sm text-gray-700">
            <input type="checkbox" className="mt-1" /> I consent to share relevant details with a trusted third party if required.
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={() => navigate("support-confirm")} className="px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff", fontWeight: 500 }}>
            Submit request
          </button>
        </div>
      </Card>

      <div className="mt-8">
        <h3 style={{ color: NAVY }}>Your previous requests</h3>
        <div className="space-y-2 mt-3">
          {[
            { t: "Connect me to a local branch (Sydney)", s: "In review", d: "2 days ago" },
            { t: "Help me explore staffer roles", s: "Matched / introduced", d: "3 weeks ago" },
          ].map((r, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ color: NAVY, fontWeight: 500 }} className="text-sm">{r.t}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Updated {r.d}</div>
                </div>
                <Pill>{r.s}</Pill>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupportConfirm({ navigate }: { navigate: (s: Screen) => void }) {
  const stages = ["Submitted", "In review", "Awaiting member response", "Matched / introduced", "Closed"];
  return (
    <div className="max-w-2xl">
      <Card>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: GOLD, color: NAVY }}>
          <CheckCircle2 size={22} />
        </div>
        <H1>Your request has been received</H1>
        <p className="text-gray-700 mt-2 text-sm">
          A CiP Admin will review your request and respond. You'll be notified by email when there's an update.
        </p>
        <div className="mt-6">
          <div className="text-sm" style={{ color: NAVY, fontWeight: 600 }}>Status</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {stages.map((s, i) => (
              <span key={s} className="px-2.5 py-1 rounded-full text-xs"
                style={{ background: i === 0 ? GOLD : MUTED_BLUE, color: NAVY }}>{s}</span>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate("dashboard")} className="px-4 py-2 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>Back to dashboard</button>
          <button onClick={() => navigate("support")} className="px-4 py-2 rounded-md" style={{ background: NAVY, color: "#fff" }}>View requests</button>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------- Events ----------------------- */
const EVENTS = [
  { t: "Faithful Politics: An evening with Tim Costello", date: "Wed 27 May · 7:00 PM", loc: "Online", tag: "Public lecture" },
  { t: "Sydney CiP Members Prayer Gathering", date: "Sat 31 May · 8:00 AM", loc: "Sydney CBD", tag: "Prayer" },
  { t: "Public Service Pathway Briefing", date: "Tue 10 June · 6:30 PM", loc: "Online", tag: "Training" },
  { t: "Brisbane CiP Members Dinner", date: "Fri 13 June · 7:00 PM", loc: "Brisbane", tag: "Fellowship" },
  { t: "Candidate Selection 101", date: "Wed 18 June · 7:00 PM", loc: "Online", tag: "Training" },
  { t: "Melbourne Members Networking Night", date: "Thu 26 June · 6:00 PM", loc: "Melbourne", tag: "Networking" },
];

export function EventsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-6xl">
      <SectionHeader title="CiP Events" subtitle="All events are hosted by CiP. Registration happens here, not on external platforms." />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <Pill>Featured</Pill>
            <h2 style={{ color: NAVY }} className="mt-2">Faithful Politics: An evening with Tim Costello</h2>
            <p className="text-sm text-gray-600 mt-2">A wide-ranging conversation about discipleship in public life. Q&A included.</p>
            <div className="text-sm text-gray-700 mt-3 flex gap-4">
              <span className="flex items-center gap-1"><Clock size={14} /> Wed 27 May · 7:00 PM AEST</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> Online</span>
            </div>
          </div>
          <button onClick={() => navigate("event-detail")} className="px-5 py-2.5 rounded-md" style={{ background: NAVY, color: "#fff" }}>
            Register
          </button>
        </div>
      </Card>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <Filter size={14} style={{ color: NAVY }} />
        {["Online", "In-person", "NSW", "VIC", "QLD", "Training", "Prayer", "Networking", "Public lecture", "Fellowship"].map((f) => (
          <button key={f} className="px-3 py-1 rounded-full text-xs border" style={{ borderColor: "#e2dccf", color: NAVY }}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {EVENTS.map((e, i) => (
          <Card key={i}>
            <Pill>{e.tag}</Pill>
            <h3 style={{ color: NAVY }} className="mt-2">{e.t}</h3>
            <div className="text-xs text-gray-600 mt-2 flex items-center gap-1"><Clock size={12} /> {e.date}</div>
            <div className="text-xs text-gray-600 mt-1 flex items-center gap-1"><MapPin size={12} /> {e.loc}</div>
            <div className="text-xs text-gray-500 mt-2">Hosted by CiP</div>
            <button onClick={() => navigate("event-detail")} className="mt-4 w-full px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>
              Register
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EventDetail({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate("events")} className="text-sm mb-3" style={{ color: NAVY }}>← Back to events</button>
      <Card>
        <Pill>Public lecture</Pill>
        <H1>Faithful Politics: An evening with Tim Costello</H1>
        <div className="text-sm text-gray-700 mt-3 flex gap-4">
          <span className="flex items-center gap-1"><Clock size={14} /> Wed 27 May · 7:00 PM AEST</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> Online (link sent on registration)</span>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2">
            <h3 style={{ color: NAVY }}>About this event</h3>
            <p className="text-sm text-gray-700 mt-2">A wide-ranging conversation about discipleship in public life. Q&A included.</p>
            <h3 style={{ color: NAVY }} className="mt-5">Speakers</h3>
            <p className="text-sm text-gray-700 mt-2">Tim Costello AO, with CiP National Director.</p>
            <h3 style={{ color: NAVY }} className="mt-5">Who should attend</h3>
            <p className="text-sm text-gray-700 mt-2">Anyone interested in faithful Christian engagement in Australian public life.</p>
          </div>
          <div>
            <Card className="!p-4">
              <h3 style={{ color: NAVY }} className="mb-3">Register</h3>
              <Inp label="Name" value="Sarah Reed" />
              <div className="mt-3"><Inp label="Email" value="sarah@example.com" /></div>
              <div className="mt-3"><Inp label="Dietary / accessibility (optional)" value="" /></div>
              <label className="flex gap-2 items-start text-xs text-gray-700 mt-3">
                <input type="checkbox" defaultChecked className="mt-0.5" /> Consent to event communications
              </label>
              <button onClick={() => navigate("event-confirm")} className="w-full mt-4 px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>
                Register
              </button>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function EventConfirm({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="max-w-2xl">
      <Card>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: GOLD, color: NAVY }}>
          <CheckCircle2 size={22} />
        </div>
        <H1>You're registered</H1>
        <p className="text-gray-700 mt-2 text-sm">
          A confirmation email is on its way with the event link. We look forward to seeing you.
        </p>
        <div className="mt-5 flex gap-3">
          <button className="px-4 py-2 rounded-md" style={{ background: NAVY, color: "#fff" }}>Add to calendar</button>
          <button onClick={() => navigate("events")} className="px-4 py-2 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>Back to events</button>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------- Resources ----------------------- */
export function ResourcesScreen() {
  const cats = ["Books", "Courses", "Bible studies", "Videos", "Articles", "Political literacy", "Public service", "Campaigning", "Candidate selection", "Christian formation", "Religious freedom"];
  const items = [
    { t: "Politics — A Case for Christian Engagement", a: "John Anderson", type: "Book", time: "240 pages", s: "A thoughtful introduction to faithful political engagement." },
    { t: "How to Join a Political Party in Australia", a: "CiP Guide", type: "Article", time: "12 min", s: "Step-by-step guide for new members." },
    { t: "Faithfulness in Public Life", a: "CiP", type: "Bible study", time: "6 sessions", s: "Six weeks in Daniel, Esther, Joseph and Nehemiah." },
    { t: "Candidate Selection 101", a: "CiP Course", type: "Course", time: "45 min", s: "What pre-selection actually involves and how to prepare." },
    { t: "Religious Freedom in Australia", a: "Freedom for Faith", type: "Article", time: "20 min", s: "A primer on current debates and law." },
    { t: "Branch meetings: an inside look", a: "CiP", type: "Video", time: "8 min", s: "What to expect, what to wear, what to do." },
  ];
  return (
    <div className="max-w-6xl">
      <SectionHeader title="Resources" subtitle="Books, courses, Bible studies, videos and articles for faithful public life." />
      <Card className="mb-5">
        <div className="flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input placeholder="Search resources…" className="flex-1 outline-none bg-transparent" />
        </div>
      </Card>
      <div className="flex flex-wrap gap-2 mb-5">
        {cats.map((c) => (
          <button key={c} className="px-3 py-1 rounded-full text-xs border" style={{ borderColor: "#e2dccf", color: NAVY }}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {items.map((r, i) => (
          <Card key={i}>
            <Pill>{r.type}</Pill>
            <h3 style={{ color: NAVY }} className="mt-2">{r.t}</h3>
            <div className="text-xs text-gray-500 mt-1">{r.a} · {r.time}</div>
            <p className="text-sm text-gray-700 mt-3">{r.s}</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 rounded-md text-sm border" style={{ borderColor: "#e2dccf", color: NAVY }}>Save</button>
              <button className="flex-1 px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>Open</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Affiliated ----------------------- */
export function AffiliatedScreen() {
  const groups = [
    { name: "Freedom for Faith", desc: "A Christian legal think tank advocating for religious freedom in Australia.", cat: "Advocacy group", poc: "Mike Southon", role: "Executive Director", cipMember: true },
    { name: "Rebuild Australia", desc: "A movement equipping Christians for public service and civic leadership.", cat: "Training / mobilisation group", poc: "Jane Watson", role: "Programmes Lead", cipMember: false },
    { name: "Christians for Labor", desc: "A network of Christians within the Australian Labor Party.", cat: "Political network", poc: "David Anderson", role: "Convenor", cipMember: true },
  ];
  return (
    <div className="max-w-5xl">
      <SectionHeader title="Affiliated Christian groups" subtitle="A curated directory of trusted partner organisations. Introductions are facilitated by CiP." />
      <Card className="mb-5">
        <div className="text-sm text-gray-700 flex items-start gap-3">
          <ShieldCheck size={18} style={{ color: NAVY }} className="mt-0.5" />
          <span>
            Members can't directly browse or contact other members. Introductions to partner organisations and individuals are
            requested through CiP Admin.
          </span>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-5">
        {groups.map((g) => (
          <Card key={g.name}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ background: MUTED_BLUE, color: NAVY }}>
                <Users size={22} />
              </div>
              <div className="flex-1">
                <h3 style={{ color: NAVY }}>{g.name}</h3>
                <Pill>{g.cat}</Pill>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-3">{g.desc}</p>
            <div className="text-sm mt-3" style={{ color: NAVY }}>{g.poc} <span className="text-gray-500">· {g.role}</span></div>
            <div className="text-xs text-gray-500 mt-1">
              {g.cipMember ? "POC is also a CiP network member" : "External contact"}
            </div>
            <button className="mt-4 w-full px-3 py-2 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>
              Request introduction
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Announcements ----------------------- */
export function AnnouncementsScreen() {
  const items = [
    { tag: "Opportunity", t: "Liberal pre-selection nominations open in QLD", body: "Nominations close 14 June. CiP can connect interested members with current branch members for a chat.", cta: "Express interest", date: "2 days ago" },
    { tag: "Internship", t: "Summer policy internship — Federal Senator's office", body: "Six-week policy internship for current students. Christian applicants encouraged to apply.", cta: "Read more", date: "5 days ago" },
    { tag: "Training", t: "Public Service pathway briefing — June", body: "Online briefing for members curious about APS and state roles.", cta: "Register", date: "1 week ago" },
    { tag: "Prayer", t: "National prayer gathering — June 6", body: "Online prayer for Australia's parliaments and public servants.", cta: "Register", date: "1 week ago" },
    { tag: "News", t: "CiP welcomes new National Coordinator", body: "We're delighted to introduce our new coordinator for Victoria.", cta: "Read more", date: "2 weeks ago" },
  ];
  return (
    <div className="max-w-3xl">
      <SectionHeader title="Announcements" subtitle="Opportunities, training and news from CiP. This is not a discussion forum." />
      <div className="space-y-4">
        {items.map((a, i) => (
          <Card key={i}>
            <div className="flex items-center gap-2">
              <Pill>{a.tag}</Pill>
              <span className="text-xs text-gray-500">Posted by CiP Admin · {a.date}</span>
            </div>
            <h3 style={{ color: NAVY }} className="mt-2">{a.t}</h3>
            <p className="text-sm text-gray-700 mt-2">{a.body}</p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 rounded-md text-sm" style={{ background: NAVY, color: "#fff" }}>{a.cta}</button>
              <button className="px-3 py-1.5 rounded-md text-sm border" style={{ borderColor: "#e2dccf", color: NAVY }}>Ask CiP about this</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Donate ----------------------- */
export function DonateScreen() {
  const [amount, setAmount] = useState(50);
  const [freq, setFreq] = useState("Monthly");
  return (
    <div className="max-w-2xl">
      <Card>
        <H1>Help grow the movement</H1>
        <p className="text-gray-700 mt-2 text-sm">
          Your support helps CiP equip Christians to participate faithfully in politics and public life.
        </p>

        <div className="mt-5">
          <label className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>Frequency</label>
          <div className="flex gap-2 mt-2">
            {["One-off", "Monthly", "Annual"].map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className="px-4 py-2 rounded-md text-sm border"
                style={{
                  borderColor: freq === f ? NAVY : "#e2dccf",
                  background: freq === f ? NAVY : "#fff",
                  color: freq === f ? "#fff" : NAVY,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm" style={{ color: NAVY, fontWeight: 500 }}>Amount (AUD)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[25, 50, 100, 250].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className="px-4 py-2 rounded-md text-sm border"
                style={{
                  borderColor: amount === a ? GOLD : "#e2dccf",
                  background: amount === a ? GOLD : "#fff",
                  color: NAVY,
                  fontWeight: amount === a ? 600 : 400,
                }}
              >
                ${a}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              onChange={(e) => setAmount(Number(e.target.value))}
              className="px-4 py-2 rounded-md text-sm border w-28"
              style={{ borderColor: "#e2dccf", background: "#faf9f5" }}
            />
          </div>
        </div>

        <div className="mt-5 p-4 rounded-md" style={{ background: "#faf7f0", border: "1px dashed #d8cfb5" }}>
          <div className="text-xs text-gray-500">Payment area</div>
          <div className="text-sm mt-1" style={{ color: NAVY }}>FairPay payment integration will be connected here.</div>
        </div>

        <button className="mt-5 w-full px-5 py-3 rounded-md" style={{ background: GOLD, color: NAVY, fontWeight: 600 }}>
          Donate ${amount} {freq.toLowerCase()} securely
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">Donation processing will be connected later.</p>
      </Card>
    </div>
  );
}

/* ----------------------- Privacy ----------------------- */
export function PrivacyScreen() {
  const items = [
    "Account details", "Password and security", "Email preferences",
    "Privacy and consent", "Political information controls", "Religious information controls",
    "Party guidance results", "Support request history",
  ];
  return (
    <div className="max-w-4xl">
      <SectionHeader title="Privacy & Settings" />
      <Card className="mb-5">
        <div className="flex items-start gap-3">
          <Lock size={20} style={{ color: NAVY }} className="mt-1" />
          <p className="text-sm text-gray-700">
            Your political affiliation, religious background and support requests are private. Members are not
            searchable by other members. CiP only uses your information to provide support, events, resources and
            relevant introductions where you have given consent.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        {items.map((s) => (
          <Card key={s}>
            <h3 style={{ color: NAVY }}>{s}</h3>
            <p className="text-sm text-gray-600 mt-1">Manage settings related to {s.toLowerCase()}.</p>
            <button className="mt-3 text-sm" style={{ color: NAVY, fontWeight: 500 }}>Manage →</button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        <Card>
          <div className="flex items-center gap-2">
            <Download size={18} style={{ color: NAVY }} />
            <h3 style={{ color: NAVY }}>Download my data</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">Export a copy of your profile, support requests and party guidance results.</p>
          <button className="mt-3 px-4 py-2 rounded-md border text-sm" style={{ borderColor: NAVY, color: NAVY }}>Request export</button>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Trash2 size={18} style={{ color: "#a93030" }} />
            <h3 style={{ color: "#a93030" }}>Delete account</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">Request permanent deletion of your CiP account and associated data.</p>
          <button className="mt-3 px-4 py-2 rounded-md border text-sm" style={{ borderColor: "#a93030", color: "#a93030" }}>Request deletion</button>
        </Card>
      </div>
    </div>
  );
}
