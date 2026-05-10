import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useTheme, NAVY, GOLD, CiPLogo } from "./brand";
import { ChevronRight, Briefcase, MapPin, Flag, Users, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";

export function OnboardingFlow({ user, onComplete }: { user: any; onComplete: () => void }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [electorate, setElectorate] = useState("");
  const [party, setParty] = useState("No affiliation");

  // Step 2 State
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [wantToCreateGroup, setWantToCreateGroup] = useState(false);

  useEffect(() => {
    async function load() {
      // Pre-fill profile if some data exists
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setJobTitle(data.job_title || "");
        setBio(data.bio || "");
        setElectorate(data.federal_electorate || "");
        setParty(data.party || "No affiliation");
      }

      // Load groups
      const { data: gData } = await supabase.from("groups").select("*").limit(10);
      if (gData) setGroups(gData);
      setLoadingGroups(false);
    }
    load();
  }, [user.id]);

  const saveProfile = async () => {
    setLoading(true);
    await supabase.from("profiles").update({
      job_title: jobTitle,
      bio: bio,
      federal_electorate: electorate,
      party: party,
    }).eq("id", user.id);
    setLoading(false);
    setStep(2);
  };

  const saveGroup = async () => {
    setLoading(true);
    if (selectedGroup) {
      // Join group
      await supabase.from("group_members").insert({
        group_id: selectedGroup,
        user_id: user.id,
      });
    } else if (wantToCreateGroup) {
      // Create support request to start a group
      await supabase.from("support_requests").insert({
        user_id: user.id,
        request_type: "Start a new Group",
        description: "I would like to start a new group in my area.",
      });
    }
    setLoading(false);
    setStep(3);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    // Connect with Admin (Thomas Mynott)
    // We try to find Thomas
    const { data: admin } = await supabase
      .from("profiles")
      .select("id")
      .ilike("first_name", "Thomas")
      .ilike("last_name", "Mynott")
      .limit(1)
      .single();

    if (admin) {
      await supabase.from("network_connections").insert({
        requester_id: user.id,
        receiver_id: admin.id,
        status: "pending",
      });
    } else {
      // Fallback: connect to any admin
      const { data: anyAdmin } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_admin", true)
        .limit(1)
        .single();
      if (anyAdmin) {
        await supabase.from("network_connections").insert({
          requester_id: user.id,
          receiver_id: anyAdmin.id,
          status: "pending",
        });
      }
    }

    // Mark as onboarded
    await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: theme.bg }}>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><CiPLogo size={40} /></div>
          <h1 className="text-2xl" style={{ color: theme.text, fontWeight: 700 }}>Welcome to the Network</h1>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Let's get your profile set up so you can connect.</p>
        </div>

        <div className="rounded-3xl p-8 shadow-xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ 
                    background: step >= i ? NAVY : theme.pillBg, 
                    color: step >= i ? "#fff" : NAVY,
                    opacity: step >= i ? 1 : 0.5 
                  }}
                >
                  {i}
                </div>
                {i < 3 && <div className="w-8 h-[2px]" style={{ background: step > i ? NAVY : theme.divider }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>1. Complete your profile</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>This helps other members know a bit about your journey.</p>
              
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: theme.text }}>Job Title or Calling</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Policy Advisor, Lay Leader, Teacher"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: theme.text }}>Federal Electorate</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={electorate} onChange={e => setElectorate(e.target.value)}
                    placeholder="e.g. Bennelong"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: theme.text }}>Political Affiliation (Optional)</label>
                <div className="relative">
                  <Flag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={party} onChange={e => setParty(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border appearance-none"
                    style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  >
                    {["No affiliation", "Independent", "Australian Labor Party", "Liberal Party of Australia", "The Nationals", "Australian Greens", "One Nation", "Family First"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: theme.text }}>Short Bio</label>
                <textarea 
                  value={bio} onChange={e => setBio(e.target.value)}
                  rows={3}
                  placeholder="A sentence or two about why you're here..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>

              <button 
                onClick={saveProfile}
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm mt-4 transition-transform active:scale-[0.98]"
                style={{ background: NAVY }}
              >
                {loading ? "Saving..." : "Continue"}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>2. Find a Community</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>CiP is built on local connection. Join a group or request to start one.</p>

              {loadingGroups ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading groups...</div>
              ) : groups.length === 0 ? (
                <div className="py-6 px-4 rounded-xl text-center" style={{ background: theme.tableHead, border: `1px dashed ${theme.divider}` }}>
                  <Users className="mx-auto text-gray-400 mb-2" size={24} />
                  <div className="text-sm font-bold" style={{ color: theme.text }}>No groups exist yet!</div>
                  <div className="text-xs mt-1" style={{ color: theme.textMuted }}>You're one of the first members. Let's start a group.</div>
                  <button 
                    onClick={() => setWantToCreateGroup(true)}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-bold w-full"
                    style={{ background: wantToCreateGroup ? "#d1fae5" : "transparent", color: wantToCreateGroup ? "#065f46" : theme.text, border: `1px solid ${wantToCreateGroup ? "#059669" : theme.cardBorder}` }}
                  >
                    {wantToCreateGroup ? "✓ Request to start a group" : "Request to start a group"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {groups.map(g => (
                    <button 
                      key={g.id}
                      onClick={() => { setSelectedGroup(g.id); setWantToCreateGroup(false); }}
                      className="w-full text-left p-4 rounded-xl border transition-all"
                      style={{ 
                        background: selectedGroup === g.id ? "#f0fdf4" : theme.cardBg, 
                        borderColor: selectedGroup === g.id ? "#22c55e" : theme.cardBorder 
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold" style={{ color: theme.text }}>{g.name}</div>
                          <div className="text-xs mt-1" style={{ color: theme.textMuted }}>{g.description}</div>
                        </div>
                        {selectedGroup === g.id && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                      </div>
                    </button>
                  ))}
                  <button 
                    onClick={() => { setSelectedGroup(null); setWantToCreateGroup(true); }}
                    className="w-full p-4 rounded-xl border text-center transition-all"
                    style={{ 
                      background: wantToCreateGroup ? "#eff6ff" : "transparent", 
                      borderColor: wantToCreateGroup ? "#3b82f6" : theme.cardBorder,
                      borderStyle: wantToCreateGroup ? "solid" : "dashed"
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: wantToCreateGroup ? "#1d4ed8" : theme.text }}>None of these fit?</div>
                    <div className="text-xs mt-1" style={{ color: theme.textMuted }}>Request to start a new group in your area</div>
                  </button>
                </div>
              )}

              <button 
                onClick={saveGroup}
                disabled={loading || (!selectedGroup && !wantToCreateGroup && groups.length > 0)}
                className="w-full py-3 rounded-xl text-white font-bold text-sm mt-4 transition-transform active:scale-[0.98]"
                style={{ background: NAVY, opacity: (!selectedGroup && !wantToCreateGroup && groups.length > 0) ? 0.5 : 1 }}
              >
                {loading ? "Saving..." : "Continue"}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                <UserPlus size={28} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>3. Connect with Leadership</h2>
              <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                CiP is a highly relational network. To get you started, we will automatically send a connection request to Thomas Mynott, the platform administrator.
              </p>
              
              <div className="p-4 rounded-xl mt-6 mb-2 text-left" style={{ background: theme.tableHead, border: `1px solid ${theme.divider}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: NAVY }}>TM</div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: theme.text }}>Thomas Mynott</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>CiP Administrator</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Connecting...</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={finishOnboarding}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm mt-4 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ background: GOLD, color: NAVY }}
              >
                {loading ? "Finalising..." : "Enter the Network"} <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
