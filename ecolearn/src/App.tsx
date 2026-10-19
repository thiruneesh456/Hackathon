import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Award, BarChart3, BookOpen, Check,
  CheckCircle2, ChevronRight, CircleHelp, Clock3, Droplets, Flame, Globe2,
  GraduationCap, Leaf, Lightbulb, ListChecks, Menu, Recycle, Search, ShieldCheck,
  Sprout, Sun, Target, Trophy, Users, Wallet, Wind, X, Zap, TreePine, Heart,
  Sparkles, CalendarDays, RotateCcw, Play, Medal, Compass, TrendingUp
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type Page = "Overview" | "Learn" | "Quizzes" | "Eco challenges" | "My impact" | "SDG explorer" | "College analytics";
type Challenge = { id: string; title: string; detail: string; points: number; category: string; icon: string; impact?: { label: string; amount: number; unit: string } };
type ActivityRecord = { id: string; title: string; date: string; points: number; category: string; impact?: { label: string; amount: number; unit: string } };
type StoredState = { points: number; completed: Record<string, string[]>; activities: ActivityRecord[]; quizScores: Record<string, number>; streak: number; lastActive: string; displayName: string };

const STORAGE_KEY = "ecolearn-demo-v1";
const todayKey = () => new Date().toISOString().slice(0, 10);
const initialState: StoredState = { points: 240, completed: {}, activities: [], quizScores: {}, streak: 3, lastActive: todayKey(), displayName: "Alex" };

const lessons = [
  { id:"waste", title:"Waste less, live more", category:"Waste management", duration:"6 min", level:"Beginner", icon:Recycle, color:"#e5f4e8", description:"Learn the basics of waste hierarchy, sorting, and everyday waste reduction.", topics:["Refuse and reduce before recycling","Keep recyclable materials clean","Check local waste rules"], sdg:12 },
  { id:"energy", title:"Powering a cleaner future", category:"Renewable energy", duration:"8 min", level:"Beginner", icon:Sun, color:"#fff3d8", description:"Explore solar, wind, and smarter ways to use electricity.", topics:["How solar and wind work","Energy efficiency at home","Why energy storage matters"], sdg:7 },
  { id:"climate", title:"Climate change, clearly explained", category:"Climate action", duration:"7 min", level:"Intermediate", icon:Wind, color:"#e4f2fb", description:"Understand greenhouse gases, climate impacts, and practical action.", topics:["The greenhouse effect","Mitigation and adaptation","Actions with measurable outcomes"], sdg:13 },
  { id:"water", title:"Every drop counts", category:"Water conservation", duration:"5 min", level:"Beginner", icon:Droplets, color:"#e3f4fb", description:"Discover water footprints and ways to prevent avoidable water waste.", topics:["Direct and indirect water use","Find and report leaks","Use water efficiently"], sdg:6 },
  { id:"biodiversity", title:"Protecting life on land", category:"Biodiversity", duration:"9 min", level:"Intermediate", icon:TreePine, color:"#e8f4df", description:"Learn why healthy ecosystems and native species matter.", topics:["Ecosystem services","Habitat fragmentation","Support native biodiversity"], sdg:15 },
  { id:"consumption", title:"Buy better, waste less", category:"Responsible consumption", duration:"6 min", level:"Beginner", icon:Wallet, color:"#f5e8f7", description:"Make thoughtful choices around products, reuse, repair, and sharing.", topics:["Life-cycle thinking","Repair and reuse","Avoid unnecessary purchases"], sdg:12 },
];

const quizQuestions = [
  { id:"q1", topic:"waste", question:"Which action is usually best in the waste hierarchy?", options:["Recycle everything","Reduce waste at the source","Burn mixed waste","Send all waste to landfill"], answer:1, explanation:"Preventing waste in the first place generally avoids more resource use than managing it after disposal." },
  { id:"q2", topic:"energy", question:"Which source generates electricity without burning fuel during operation?", options:["Coal power","Diesel generator","Solar photovoltaic panels","Petrol engine"], answer:2, explanation:"Solar PV panels convert sunlight directly into electricity and do not burn fuel during operation." },
  { id:"q3", topic:"climate", question:"What is a major driver of recent global warming?", options:["Human-caused greenhouse gas emissions","The Moon's phases","Daily changes in weather","Ocean tides alone"], answer:0, explanation:"Human activities, especially fossil fuel use and land-use change, have increased heat-trapping greenhouse gases." },
  { id:"q4", topic:"water", question:"What is a useful first step when a tap is leaking?", options:["Ignore it","Report or repair it promptly","Use more water elsewhere","Cover it with paper"], answer:1, explanation:"Promptly reporting or repairing leaks helps prevent avoidable water loss." },
  { id:"q5", topic:"biodiversity", question:"Why are native plants often useful in local habitat projects?", options:["They always need more water","They can support local wildlife adapted to them","They eliminate all pests","They never need care"], answer:1, explanation:"Native plants can provide suitable food and habitat for local species, depending on the ecosystem." },
  { id:"q6", topic:"consumption", question:"Which is an example of responsible consumption?", options:["Replacing a working item for a trend","Buying items you will not use","Repairing a usable item before replacing it","Throwing reusable items away"], answer:2, explanation:"Repairing and extending product life can reduce demand for new resources and avoid waste." },
];

const challenges: Challenge[] = [
  { id:"bottle", title:"Carry a reusable bottle", detail:"Choose a refillable bottle instead of a single-use one today.", points:20, category:"Responsible consumption", icon:"droplet", impact:{label:"Single-use bottle avoided",amount:1,unit:"bottle"} },
  { id:"segregate", title:"Sort one waste item correctly", detail:"Check the local guidance and put one item in the right stream.", points:15, category:"Waste management", icon:"recycle", impact:{label:"Waste item sorted",amount:1,unit:"item"} },
  { id:"lights", title:"Switch off unused lights", detail:"Turn off lights in an empty room and remind a friend.", points:15, category:"Energy", icon:"sun", impact:{label:"Action completed",amount:1,unit:"action"} },
  { id:"water", title:"Save water mindfully", detail:"Keep water use purposeful and report a leak if you spot one.", points:20, category:"Water conservation", icon:"water", impact:{label:"Water-saving action",amount:1,unit:"action"} },
  { id:"cleanup", title:"Join a campus clean-up", detail:"Take part in a safe, organized campus or community clean-up.", points:35, category:"Biodiversity", icon:"leaf" },
];

const sdgs = [
  { n:4, title:"Quality Education", color:"#c5192d", description:"Make sustainability learning inclusive, accessible, and lifelong.", link:"Learning access and environmental literacy" },
  { n:6, title:"Clean Water and Sanitation", color:"#26bde2", description:"Promote water conservation, water quality awareness, and sanitation.", link:"Water lesson and water-saving challenge" },
  { n:7, title:"Affordable and Clean Energy", color:"#fcc30b", description:"Explore renewable energy and efficient energy use.", link:"Renewable energy lesson and light-saving action" },
  { n:12, title:"Responsible Consumption", color:"#bf8b2e", description:"Reduce waste and encourage reuse, repair, and thoughtful purchasing.", link:"Waste lesson and reusable-bottle challenge" },
  { n:13, title:"Climate Action", color:"#3f7e44", description:"Build understanding of climate causes, impacts, and responses.", link:"Climate lesson and everyday actions" },
  { n:14, title:"Life Below Water", color:"#0a97d9", description:"Understand how pollution and resource use affect marine ecosystems.", link:"Waste prevention and water awareness" },
  { n:15, title:"Life on Land", color:"#56c02b", description:"Protect ecosystems, habitats, and terrestrial biodiversity.", link:"Biodiversity lesson and campus clean-up" },
];

const demoTrend = [
  { week:"W1", participation:42, score:61 }, { week:"W2", participation:48, score:64 },
  { week:"W3", participation:54, score:68 }, { week:"W4", participation:59, score:72 },
  { week:"W5", participation:66, score:76 }, { week:"W6", participation:73, score:81 },
];
const demoCategories = [
  { name:"Waste", value:31, color:"#34784e" }, { name:"Energy", value:24, color:"#80bd8e" },
  { name:"Water", value:19, color:"#a7d8ca" }, { name:"Climate", value:16, color:"#e4c36c" },
  { name:"Nature", value:10, color:"#c9d9a7" },
];

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) } as StoredState;
  } catch (error) {
    console.warn("EcoLearn demo data could not be loaded.", error);
  }
  return initialState;
}
function IconForChallenge({ icon }: { icon: string }) {
  if (icon === "droplet" || icon === "water") return <Droplets size={19}/>;
  if (icon === "recycle") return <Recycle size={19}/>;
  if (icon === "sun") return <Sun size={19}/>;
  return <Leaf size={19}/>;
}
function initials(name: string) { return name.trim().split(/\s+/).map(s => s[0]).join("").slice(0,2).toUpperCase() || "A"; }

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [state, setState] = useState<StoredState>(loadState);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [lessonFilter, setLessonFilter] = useState("All");
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.displayName);
  const [toast, setToast] = useState("");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) { console.error("Could not save EcoLearn demo progress.", error); setToast("Progress could not be saved in this browser."); }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const completedToday = state.completed[todayKey()] || [];
  const lessonsCompleted = Object.keys(state.quizScores).length;
  const totalAnswered = Object.values(state.quizScores).length;
  const quizAverage = totalAnswered ? Math.round(Object.values(state.quizScores).reduce((a,b)=>a+b,0)/totalAnswered) : 0;
  const activeChallenges = challenges.filter(c => !completedToday.includes(c.id));
  const recommended = useMemo(() => {
    const scores = state.quizScores;
    const weakTopics = quizQuestions.filter(q => scores[q.topic] !== undefined && scores[q.topic] < 70).map(q => q.topic);
    if (weakTopics.length) return lessons.filter(l => weakTopics.includes(l.id)).slice(0,3);
    return lessons.filter(l => ["waste","energy","water"].includes(l.id)).slice(0,3);
  }, [state.quizScores]);
  const navItems: { label: Page; icon: typeof Leaf }[] = [
    { label:"Overview", icon:Activity }, { label:"Learn", icon:BookOpen }, { label:"Quizzes", icon:CircleHelp },
    { label:"Eco challenges", icon:Target }, { label:"My impact", icon:TrendingUp },
    { label:"SDG explorer", icon:Globe2 }, { label:"College analytics", icon:BarChart3 },
  ];
  const go = (p: Page) => { setPage(p); setMobileMenu(false); window.scrollTo({top:0,behavior:"smooth"}); };

  function completeChallenge(challenge: Challenge) {
    const today = todayKey();
    if ((state.completed[today] || []).includes(challenge.id)) { setToast("You've already earned points for this challenge today."); return; }
    const activity: ActivityRecord = { id:`${challenge.id}-${Date.now()}`, title:challenge.title, date:today, points:challenge.points, category:challenge.category, impact:challenge.impact };
    setState(prev => ({
      ...prev,
      points: prev.points + challenge.points,
      completed: { ...prev.completed, [today]: [...(prev.completed[today] || []), challenge.id] },
      activities: [activity, ...prev.activities].slice(0,100),
      lastActive: today,
      streak: prev.lastActive === today ? prev.streak : prev.streak + 1,
    }));
    setToast(`Challenge complete! +${challenge.points} eco-points`);
  }
  function submitQuiz() {
    const correct = quizQuestions.filter(q => answers[q.id] === q.answer).length;
    const score = Math.round((correct / quizQuestions.length) * 100);
    const topicScores: Record<string, number> = {};
    quizQuestions.forEach(q => {
      topicScores[q.topic] = answers[q.id] === q.answer ? 100 : 0;
    });
    setState(prev => ({ ...prev, points: prev.points + correct * 10, quizScores: { ...prev.quizScores, ...topicScores } }));
    setQuizSubmitted(true);
    setToast(`Quiz complete: ${score}% • ${correct * 10} points earned`);
  }
  function resetQuiz() { setAnswers({}); setQuizSubmitted(false); setQuizStarted(false); }
  function saveProfile() {
    const name = nameDraft.trim().slice(0,30) || "Alex";
    setState(prev => ({ ...prev, displayName:name }));
    setShowProfile(false);
    setToast("Profile updated.");
  }
  function resetDemo() {
    if (!window.confirm("Reset all locally saved EcoLearn demo progress? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...initialState, completed:{}, activities:[], quizScores:{}, points:240, streak:3, lastActive:todayKey() });
    resetQuiz();
    setToast("Demo progress reset.");
  }

  const Header = () => (
    <header className="topbar flex items-center justify-between gap-4 border-b border-[#e7ede5] bg-white/80 px-8 py-5">
      <div className="flex items-center gap-3 min-w-0">
        <button className="hidden max-[900px]:inline-flex rounded-xl bg-[#f0f6ef] p-2 text-[#286842]" onClick={()=>setMobileMenu(v=>!v)} aria-label="Toggle navigation"><Menu size={19}/></button>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[.15em] text-[#83a08b]">Student workspace</div>
          <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-[#203b2b]">{page}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hide-mobile relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91a097]" size={16}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lessons..." className="w-48 rounded-xl border border-[#e4ebe1] bg-[#fafcf9] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#83b994]" />
        </div>
        <button onClick={()=>{setNameDraft(state.displayName);setShowProfile(true)}} className="flex items-center gap-2 rounded-full border border-[#e7eee5] bg-white p-1.5 pr-3 hover:bg-[#f8fbf7]" aria-label="Open profile">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff0e2] text-xs font-extrabold text-[#286842]">{initials(state.displayName)}</span>
          <span className="hide-mobile text-xs font-bold text-[#42594a]">{state.displayName}</span>
        </button>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside className="sidebar sticky top-0 flex h-screen flex-col border-r border-[#e5ece3] bg-white px-4 py-6">
      <div className="mb-9 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#286842] text-white soft-shadow"><Leaf size={24}/></div>
        <div><div className="text-[19px] font-extrabold tracking-tight text-[#234631]">EcoLearn<span className="text-[#5aaf78]">.</span></div><div className="text-[10px] font-semibold tracking-wide text-[#91a196]">SUSTAINABILITY, MADE PERSONAL</div></div>
      </div>
      <div className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#a0afa3]">Workspace</div>
      <nav className="flex flex-col gap-1">
        {navItems.map(item => { const I = item.icon; return <button key={item.label} className={`nav-item ${page===item.label?"active":""}`} onClick={()=>go(item.label)}><I size={17}/><span>{item.label}</span>{item.label==="Eco challenges" && <span className="ml-auto rounded-full bg-[#d4eddb] px-2 py-0.5 text-[10px]">{activeChallenges.length}</span>}</button>; })}
      </nav>
      <div className="mt-auto">
        <div className="rounded-2xl bg-gradient-to-br from-[#245c3b] to-[#398356] p-4 text-white">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Sparkles size={18}/></div>
          <div className="text-sm font-bold">Small steps, real change.</div>
          <p className="mt-1 text-[11px] leading-5 text-white/75">Build a greener habit, one day at a time.</p>
          <button onClick={()=>go("Eco challenges")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#286842]">Take a challenge <ArrowRight size={14}/></button>
        </div>
        <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-[#9aa79d]"><span>EcoLearn demo · v1.0</span><button onClick={resetDemo} title="Reset demo data" className="hover:text-[#286842]"><RotateCcw size={13}/></button></div>
      </div>
    </aside>
  );

  const StatCard = ({label,value,sub,icon:Icon,accent}:{label:string;value:string;sub:string;icon:typeof Leaf;accent:string}) => (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2"><div className="text-xs font-semibold text-[#7c8d80]">{label}</div><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{background:accent,color:"#286842"}}><Icon size={18}/></span></div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-[#203b2b]">{value}</div>
      <div className="mt-1 text-[11px] text-[#94a197]">{sub}</div>
    </div>
  );

  const ChallengeCard = ({challenge}:{challenge:Challenge}) => {
    const done = completedToday.includes(challenge.id);
    return <div className="panel flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f4e9] text-[#2c7547]"><IconForChallenge icon={challenge.icon}/></span>
        <span className="pill bg-[#fff5d9] text-[#97751c]"><Zap size={12} fill="currentColor"/>{challenge.points} pts</span>
      </div>
      <h3 className="mt-4 text-sm font-extrabold text-[#2b4434]">{challenge.title}</h3>
      <p className="mt-2 flex-1 text-xs leading-5 text-[#819085]">{challenge.detail}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-[#93a095]">{challenge.category}</span>
        <button disabled={done} onClick={()=>completeChallenge(challenge)} className={done?"rounded-xl bg-[#e7f4e9] px-3 py-2 text-[11px] font-bold text-[#438357]":"btn-primary"}>{done?<><Check size={13} className="mr-1 inline"/>Done today</>:"Complete"}</button>
      </div>
    </div>;
  };

  const LessonCard = ({lesson}:{lesson:typeof lessons[number]}) => {
    const I = lesson.icon;
    const expanded = expandedLesson === lesson.id;
    return <article className="panel overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-28 items-center justify-center" style={{background:lesson.color}}>
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/80 text-[#286842]"><I size={31}/></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2"><span className="pill bg-[#f0f6ef] text-[#4b815b]">{lesson.category}</span><span className="flex items-center gap-1 text-[10px] text-[#8d9b90]"><Clock3 size={12}/>{lesson.duration}</span></div>
        <h3 className="mt-3 text-sm font-extrabold text-[#294433]">{lesson.title}</h3>
        <p className="mt-2 text-xs leading-5 text-[#819085]">{lesson.description}</p>
        {expanded && <div className="mt-3 rounded-xl bg-[#f7faf5] p-3"><div className="mb-2 text-[11px] font-extrabold text-[#47634e]">In this lesson</div><ul className="space-y-2">{lesson.topics.map(t=><li key={t} className="flex gap-2 text-[11px] leading-4 text-[#687b6d]"><CheckCircle2 size={13} className="shrink-0 text-[#4b9a63]"/>{t}</li>)}</ul><div className="mt-3 text-[10px] font-bold text-[#5d8b68]">Aligned with SDG {lesson.sdg}</div></div>}
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e3ece1] py-2.5 text-xs font-extrabold text-[#286842] hover:bg-[#f2f8f1]" onClick={()=>setExpandedLesson(expanded?null:lesson.id)}>{expanded?"Close lesson":"Explore lesson"}<ChevronRight size={14} className={expanded?"rotate-90":""}/></button>
      </div>
    </article>;
  };

  const renderOverview = () => (
    <>
      <section className="welcome-grid grid grid-cols-[1.55fr_1fr] gap-5">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#21583a] via-[#2c7048] to-[#4c9a68] p-6 text-white sm:p-7">
          <div className="relative z-10 max-w-[430px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white/90"><Sparkles size={13}/> YOUR SUSTAINABILITY JOURNEY</div>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">Hey {state.displayName},<br/>let's grow a greener future.</h2>
            <p className="mt-3 max-w-sm text-xs leading-6 text-white/75">Every small action adds up. Learn something new, take a challenge, and see your progress grow.</p>
            <button onClick={()=>go("Learn")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#286842] hover:bg-[#eff8ef]">Continue learning <ArrowRight size={15}/></button>
          </div>
          <div className="pointer-events-none absolute -right-10 -bottom-16 opacity-20"><Sprout size={250} strokeWidth={0.8}/></div>
          <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-white/20"/><div className="pointer-events-none absolute right-14 top-14 h-12 w-12 rounded-full border border-white/20"/>
        </div>
        <div className="panel flex flex-col justify-between p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><div className="text-xs font-bold text-[#7e9082]">Daily challenge</div><div className="mt-1 text-[10px] text-[#a1afa4]">A little action goes a long way</div></div><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff2d5] text-[#a17d22]"><Target size={20}/></span></div>
          <div className="my-4"><h3 className="text-lg font-extrabold text-[#2c4936]">{activeChallenges[0]?.title || "You've done today's challenges!"}</h3><p className="mt-2 text-xs leading-5 text-[#819085]">{activeChallenges[0]?.detail || "Come back tomorrow for another opportunity to build a greener habit."}</p></div>
          <div className="flex items-center justify-between border-t border-[#edf1eb] pt-4"><span className="pill bg-[#fff5dc] text-[#96751f]"><Zap size={12}/>{activeChallenges[0]?.points || 0} eco-points</span><button onClick={()=>go("Eco challenges")} className="text-xs font-extrabold text-[#2f794b]">View challenge <ArrowRight size={14} className="ml-1 inline"/></button></div>
        </div>
      </section>
      <section className="stat-grid mt-5 grid grid-cols-4 gap-4">
        <StatCard label="Total eco-points" value={state.points.toLocaleString()} sub="Keep your momentum going" icon={Zap} accent="#fff3d7"/>
        <StatCard label="Learning progress" value={`${Math.min(100,Math.round((lessonsCompleted/6)*100))}%`} sub={`${lessonsCompleted} topic areas assessed`} icon={BookOpen} accent="#e2f1e5"/>
        <StatCard label="Day streak" value={`${state.streak} days`} sub="Consistency beats perfection" icon={Flame} accent="#ffebdf"/>
        <StatCard label="Actions today" value={`${completedToday.length}`} sub="Challenges completed today" icon={CheckCircle2} accent="#e1f2f4"/>
      </section>
      <section className="two-col mt-5 grid grid-cols-[1.45fr_1fr] gap-5">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-extrabold text-[#294433]">Your learning journey</h3><p className="mt-1 text-xs text-[#89978d]">Quiz performance by topic · based on your saved attempts</p></div><span className="pill bg-[#f0f6ef] text-[#568264]">Personal</span></div>
          <div className="mt-4 h-[220px]">
            {Object.keys(state.quizScores).length===0 ? <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#f8faf7] text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f2e6] text-[#4d9564]"><BarChart3 size={22}/></div><p className="mt-3 text-sm font-bold text-[#4a624f]">Your learning chart starts here</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#91a095]">Take the sustainability quiz to discover strengths and topics to revisit.</p><button onClick={()=>go("Quizzes")} className="btn-secondary mt-3">Take a quiz</button></div>
            : <ResponsiveContainer width="100%" height="100%"><BarChart data={lessons.map(l=>({topic:l.category.split(" ")[0],score:state.quizScores[l.id] ?? 0}))} margin={{top:10,right:5,left:-25,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1eb"/><XAxis dataKey="topic" tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="score" name="Score" fill="#4d9a65" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer>}
          </div>
        </div>
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h3 className="text-base font-extrabold text-[#294433]">Recommended for you</h3><p className="mt-1 text-xs text-[#89978d]">Rule-based suggestions</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1e9fa] text-[#8b65b4]"><Sparkles size={17}/></span></div>
          <div className="mt-4 space-y-3">{recommended.map((l,i)=>{const I=l.icon;return <button key={l.id} onClick={()=>{setExpandedLesson(l.id);go("Learn")}} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#f7faf5]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{background:l.color}}><I size={19} className="text-[#36784d]"/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-[#405a47]">{l.title}</span><span className="mt-1 block text-[10px] text-[#94a197]">{l.duration} · {l.level}</span></span><ChevronRight size={15} className="text-[#9bad9e]"/></button>})}</div>
          <div className="mt-4 rounded-xl bg-[#f2f8f1] p-3 text-[11px] leading-5 text-[#6b8571]"><Lightbulb size={14} className="mr-1 inline"/> Suggestions use your quiz results when available, otherwise starter recommendations are shown.</div>
        </div>
      </section>
      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between"><div><h3 className="text-base font-extrabold text-[#294433]">Make today count</h3><p className="mt-1 text-xs text-[#89978d]">Quick actions that fit into everyday life</p></div><button onClick={()=>go("Eco challenges")} className="text-xs font-extrabold text-[#36784d]">All challenges <ArrowRight size={13} className="ml-1 inline"/></button></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{challenges.slice(0,3).map(c=><ChallengeCard key={c.id} challenge={c}/>)}</div>
      </section>
      <section className="two-col mt-5 grid grid-cols-[1.15fr_1fr] gap-5">
        <div className="panel p-5">
          <div className="flex items-start justify-between"><div><h3 className="text-base font-extrabold text-[#294433]">Campus green champions</h3><p className="mt-1 text-xs text-[#89978d]">Fictional demo profiles · weekly points</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff2d5] text-[#a17d22]"><Trophy size={18}/></span></div>
          <div className="mt-4 space-y-3">
            {[{name:"Maya Green",points:520,tag:"Biodiversity buddy",rank:1},{name:"Arjun Rivers",points:430,tag:"Water-wise thinker",rank:2},{name:"Sam Taylor",points:360,tag:"Reuse champion",rank:3}].map((person)=><div key={person.name} className="flex items-center gap-3 rounded-xl bg-[#f8faf7] p-3"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${person.rank===1?"bg-[#fff0c7] text-[#98731a]":"bg-[#e5f0e5] text-[#4d7f59]"}`}>{person.rank}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcefe0] text-xs font-extrabold text-[#286842]">{initials(person.name)}</span><span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-[#405a47]">{person.name}</span><span className="block text-[10px] text-[#94a197]">{person.tag}</span></span><span className="text-xs font-extrabold text-[#398253]">{person.points} pts</span></div>)}
            <div className="rounded-xl border border-dashed border-[#dbe7d9] p-3 text-[10px] leading-4 text-[#8b998e]">Demo leaderboard only. These are fictional profiles and are not real students or institutional records.</div>
          </div>
        </div>
        <div className="panel p-5"><div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-[#294433]">Your next milestone</h3><p className="mt-1 text-xs text-[#89978d]">A little progress, every day</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f3e8] text-[#4b8d5c]"><Medal size={18}/></span></div><div className="mt-5 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e4f2e6] text-[#35784b]"><Award size={30}/></div><div><div className="text-lg font-extrabold text-[#294433]">Green Starter</div><div className="mt-1 text-xs text-[#89978d]">Earn 300 eco-points to reach your next badge.</div></div></div><div className="mt-5 flex items-center justify-between text-xs"><span className="font-bold text-[#6f8373]">Progress to 300 points</span><span className="font-extrabold text-[#347b4d]">{Math.min(100,Math.round(state.points/300*100))}%</span></div><div className="progress-track mt-2"><div className="progress-fill" style={{width:`${Math.min(100,state.points/300*100)}%`}}/></div><button onClick={()=>go("Eco challenges")} className="btn-secondary mt-4 w-full">Earn more eco-points <ArrowRight size={14} className="ml-1 inline"/></button></div>
      </section>
    </>
  );

  const renderLearn = () => {
    const categories = ["All",...Array.from(new Set(lessons.map(l=>l.category)))];
    const visible = lessons.filter(l => (lessonFilter==="All" || l.category===lessonFilter) && `${l.title} ${l.category} ${l.description}`.toLowerCase().includes(search.toLowerCase()));
    return <div>
      <div className="mb-6 rounded-[22px] bg-[#e4f2e6] p-6 sm:p-7"><div className="flex items-center gap-2 text-xs font-bold text-[#4d8a5d]"><BookOpen size={15}/> LEARNING LIBRARY</div><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#244631]">Knowledge grows into action.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#66806c]">Short, practical lessons to help you understand sustainability and turn what you learn into everyday habits.</p><div className="mt-4 flex flex-wrap gap-2">{categories.map(c=><button key={c} onClick={()=>setLessonFilter(c)} className={`rounded-full px-3 py-2 text-[11px] font-bold ${lessonFilter===c?"bg-[#286842] text-white":"bg-white/80 text-[#587561] hover:bg-white"}`}>{c}</button>)}</div></div>
      {visible.length===0 ? <div className="panel flex flex-col items-center p-12 text-center"><Search size={28} className="text-[#9aab9d]"/><h3 className="mt-3 font-bold">No lessons found</h3><p className="mt-1 text-xs text-[#89978d]">Try another search or category.</p><button className="btn-secondary mt-3" onClick={()=>{setSearch("");setLessonFilter("All")}}>Clear filters</button></div>
      : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{visible.map(l=><LessonCard key={l.id} lesson={l}/>)}</div>}
      <div className="mt-5 rounded-2xl border border-[#e3ece0] bg-white p-4 text-xs leading-5 text-[#819085]"><ShieldCheck size={16} className="mr-2 inline text-[#4c9661]"/>Learning content is educational and intended as a starting point. Follow local guidance for waste disposal, energy, and water decisions.</div>
    </div>;
  };

  const renderQuiz = () => {
    const correct = quizQuestions.filter(q=>answers[q.id]===q.answer).length;
    const score = Math.round((correct/quizQuestions.length)*100);
    if (!quizStarted && !quizSubmitted) return <div className="mx-auto max-w-3xl"><div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#255e3c] to-[#43875a] p-7 text-white sm:p-10"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><CircleHelp size={27}/></div><div className="mt-6 text-xs font-bold tracking-widest text-white/70">KNOWLEDGE CHECK</div><h2 className="mt-2 text-3xl font-extrabold">Sustainability basics</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/75">A quick six-question check across waste, energy, climate, water, biodiversity, and responsible consumption. Your results help suggest what to explore next.</p><div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-white/80"><span><ListChecks size={15} className="mr-1 inline"/>6 questions</span><span><Clock3 size={15} className="mr-1 inline"/>~3 minutes</span><span><Award size={15} className="mr-1 inline"/>10 points per correct answer</span></div><button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#286842]" onClick={()=>setQuizStarted(true)}>Start assessment <ArrowRight size={16}/></button></div><div className="panel mt-5 p-5"><h3 className="font-extrabold">How it works</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{[{n:"01",t:"Answer honestly",d:"Choose the best answer for each question."},{n:"02",t:"Review feedback",d:"See explanations and your score."},{n:"03",t:"Keep learning",d:"Use recommendations to revisit topics."}].map(x=><div key={x.n} className="rounded-xl bg-[#f8faf7] p-3"><div className="text-xs font-extrabold text-[#4b9360]">{x.n}</div><div className="mt-2 text-xs font-bold">{x.t}</div><div className="mt-1 text-[11px] leading-5 text-[#87958b]">{x.d}</div></div>)}</div></div></div>;
    if (quizSubmitted) return <div className="mx-auto max-w-3xl"><div className="panel p-6 sm:p-9"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e2f3e5] text-[#2f824c]"><Trophy size={30}/></div><div className="mt-4 text-center"><div className="text-xs font-bold uppercase tracking-widest text-[#7c9b83]">Assessment complete</div><h2 className="mt-2 text-3xl font-extrabold text-[#294433]">{score}% <span className="text-lg font-semibold text-[#829187]">score</span></h2><p className="mt-2 text-sm text-[#829187]">You answered {correct} out of {quizQuestions.length} questions correctly.</p></div><div className="mt-6 space-y-4">{quizQuestions.map(q=><div key={q.id} className="rounded-2xl border border-[#e8eee6] p-4"><div className="flex items-start gap-2"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${answers[q.id]===q.answer?"bg-[#e1f3e5] text-[#2d834b]":"bg-[#fff0df] text-[#b77831]"}`}>{answers[q.id]===q.answer?<Check size={14}/>:<X size={14}/>}</span><div><div className="text-sm font-bold text-[#3c5543]">{q.question}</div><div className="mt-1 text-xs text-[#829187]">Correct answer: {q.options[q.answer]}</div><p className="mt-2 text-xs leading-5 text-[#7c8d80]">{q.explanation}</p></div></div></div>)}</div><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn-secondary" onClick={resetQuiz}>Try again</button><button className="btn-primary" onClick={()=>go("Learn")}>Explore recommended lessons <ArrowRight size={14} className="ml-1 inline"/></button></div></div></div>;
    return <div className="mx-auto max-w-3xl"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-bold text-[#4e8e61]">QUESTION SET · 6 QUESTIONS</div><h2 className="mt-1 text-xl font-extrabold">Sustainability basics</h2></div><button onClick={resetQuiz} className="btn-secondary"><X size={14} className="mr-1 inline"/> Exit</button></div><div className="progress-track mb-5"><div className="progress-fill" style={{width:`${Object.keys(answers).length/quizQuestions.length*100}%`}}/></div><div className="space-y-4">{quizQuestions.map((q,i)=><div key={q.id} className="panel p-5"><div className="flex items-center justify-between"><span className="pill bg-[#eef6ed] text-[#4c865b]">Question {i+1}</span><span className="text-[10px] font-semibold text-[#9aa79d]">{lessons.find(l=>l.id===q.topic)?.category}</span></div><h3 className="mt-4 text-sm font-extrabold text-[#304a38]">{q.question}</h3><div className="mt-4 grid gap-2">{q.options.map((o,j)=><button key={o} onClick={()=>setAnswers(a=>({...a,[q.id]:j}))} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs font-semibold transition ${answers[q.id]===j?"border-[#76b989] bg-[#edf7ef] text-[#286842]":"border-[#e8eee6] text-[#65786a] hover:bg-[#f8faf7]"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] ${answers[q.id]===j?"bg-[#286842] text-white":"bg-[#f0f4ee] text-[#89988d]"}`}>{String.fromCharCode(65+j)}</span>{o}</button>)}</div></div>)}</div><div className="mt-5 flex items-center justify-between"><span className="text-xs text-[#89978d]">{Object.keys(answers).length} of {quizQuestions.length} answered</span><button className="btn-primary" disabled={Object.keys(answers).length!==quizQuestions.length} onClick={submitQuiz}>Submit answers <ArrowRight size={14} className="ml-1 inline"/></button></div></div>;
  };

  const renderChallenges = () => <div><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-widest text-[#6b9c76]">Take action</div><h2 className="mt-2 text-2xl font-extrabold">Small actions. Lasting habits.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#819085]">Complete real-world actions, earn demo eco-points, and build consistency. Points are for engagement—not a verified measure of environmental savings.</p></div><div className="rounded-2xl bg-[#e3f2e5] px-4 py-3"><div className="text-[10px] font-bold text-[#66836d]">COMPLETED TODAY</div><div className="mt-1 text-2xl font-extrabold text-[#286842]">{completedToday.length}<span className="ml-1 text-sm text-[#76a281]">/ {challenges.length}</span></div></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{challenges.map(c=><ChallengeCard key={c.id} challenge={c}/>)}</div><div className="two-col mt-5 grid grid-cols-[1.3fr_1fr] gap-5"><div className="panel p-5"><h3 className="text-sm font-extrabold">Your recent activity</h3><p className="mt-1 text-xs text-[#8c9a90]">Saved in this browser</p>{state.activities.length===0?<div className="mt-4 rounded-xl bg-[#f8faf7] p-5 text-center text-xs text-[#8b9a8e]">No completed challenges yet. Pick one above to get started.</div>:<div className="mt-4 space-y-3">{state.activities.slice(0,5).map(a=><div key={a.id} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f3e7] text-[#4b8d5c]"><CheckCircle2 size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#4a614f]">{a.title}</span><span className="text-[10px] text-[#9aa69c]">{a.date}</span></span><span className="text-xs font-extrabold text-[#398253]">+{a.points}</span></div>)}</div>}</div><div className="rounded-[20px] bg-[#fff7e5] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#a17a20]"><Award size={20}/></div><h3 className="mt-4 text-sm font-extrabold text-[#6f5a25]">Earn your green streak</h3><p className="mt-2 text-xs leading-5 text-[#8c7b4e]">Try one small action a day. Streaks in this demo track challenge activity and are stored locally on this device.</p><div className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#997522]"><Flame size={17}/>{state.streak} day streak</div></div></div></div>;

  const renderImpact = () => {
    const bottles = state.activities.filter(a=>a.impact?.unit==="bottle").reduce((n,a)=>n+a.impact!.amount,0);
    const sorted = [...state.activities].sort((a,b)=>b.date.localeCompare(a.date));
    const weekly = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=d.toISOString().slice(0,10);return {day:d.toLocaleDateString("en",{weekday:"short"}),actions:state.activities.filter(a=>a.date===key).length};});
    return <div><div className="mb-6"><div className="text-xs font-bold uppercase tracking-widest text-[#6b9c76]">Your contribution</div><h2 className="mt-2 text-2xl font-extrabold">Every action tells a story.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#819085]">Review your activity history and understand the difference between actions recorded and environmental outcomes measured.</p></div><div className="stat-grid grid grid-cols-3 gap-4"><StatCard label="Challenges completed" value={`${state.activities.length}`} sub="Recorded on this device" icon={CheckCircle2} accent="#e2f1e5"/><StatCard label="Reusable swaps logged" value={`${bottles}`} sub="Self-reported bottle actions" icon={Droplets} accent="#e1f2f4"/><StatCard label="Eco-points earned" value={`${state.points.toLocaleString()}`} sub="Engagement metric only" icon={Zap} accent="#fff3d7"/></div><div className="two-col mt-5 grid grid-cols-[1.3fr_1fr] gap-5"><div className="panel p-5"><h3 className="text-sm font-extrabold">Activity over the last 7 days</h3><p className="mt-1 text-xs text-[#8c9a90]">Based on saved challenge completions</p><div className="mt-4 h-[240px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekly} margin={{top:10,right:8,left:-22,bottom:0}}><defs><linearGradient id="actionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#62a976" stopOpacity={.25}/><stop offset="95%" stopColor="#62a976" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1eb"/><XAxis dataKey="day" tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="actions" stroke="#4b9a64" fill="url(#actionFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div></div><div className="panel p-5"><h3 className="text-sm font-extrabold">Impact accounting</h3><p className="mt-1 text-xs text-[#8c9a90]">Transparent reporting</p><div className="mt-4 space-y-3">{[{t:"Actions completed",d:"Directly counted from your activity history.",icon:CheckCircle2},{t:"Reusable swaps logged",d:"Self-reported actions; not independently verified.",icon:Recycle},{t:"Water or carbon saved",d:"Not calculated because no verified measurement or agreed conversion assumptions are configured.",icon:ShieldCheck}].map(x=>{const I=x.icon;return <div key={x.t} className="flex gap-3 rounded-xl bg-[#f8faf7] p-3"><I size={17} className="mt-0.5 shrink-0 text-[#4c9661]"/><div><div className="text-xs font-bold text-[#4b614f]">{x.t}</div><div className="mt-1 text-[11px] leading-5 text-[#8a998e]">{x.d}</div></div></div>})}</div></div></div><div className="panel mt-5 p-5"><h3 className="text-sm font-extrabold">Activity history</h3>{sorted.length===0?<p className="mt-4 rounded-xl bg-[#f8faf7] p-5 text-center text-xs text-[#8c9a90]">No activity yet. Complete a challenge to start your history.</p>:<div className="mt-3 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="border-b border-[#edf1eb] text-[10px] uppercase tracking-wide text-[#9aa69c]"><th className="py-3">Activity</th><th className="py-3">Category</th><th className="py-3">Date</th><th className="py-3 text-right">Points</th></tr></thead><tbody>{sorted.map(a=><tr key={a.id} className="border-b border-[#f0f3ee] last:border-0"><td className="py-3 font-bold text-[#4b614f]">{a.title}</td><td className="py-3 text-[#839186]">{a.category}</td><td className="py-3 text-[#839186]">{a.date}</td><td className="py-3 text-right font-extrabold text-[#3d8a56]">+{a.points}</td></tr>)}</tbody></table></div>}</div></div>;
  };

  const renderSdg = () => <div><div className="mb-6 rounded-[22px] bg-[#e8f2e6] p-6 sm:p-7"><div className="flex items-center gap-2 text-xs font-bold text-[#4c8a5c]"><Globe2 size={15}/> GLOBAL GOALS</div><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#244631]">Learning connected to a bigger picture.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#66806c]">Explore how everyday sustainability learning can support the United Nations Sustainable Development Goals. These are educational connections, not claims of official SDG certification.</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{sdgs.map(s=><article key={s.n} className="panel overflow-hidden"><div className="h-2" style={{background:s.color}}/><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold text-white" style={{background:s.color}}>{s.n}</div><span className="pill bg-[#f1f6ef] text-[#64806a]">SDG {s.n}</span></div><h3 className="mt-4 text-base font-extrabold text-[#294433]">{s.title}</h3><p className="mt-2 min-h-[48px] text-xs leading-5 text-[#819085]">{s.description}</p><div className="mt-4 rounded-xl bg-[#f7faf5] p-3"><div className="text-[10px] font-extrabold uppercase tracking-wide text-[#9aa89d]">EcoLearn connection</div><div className="mt-1 text-xs font-semibold leading-5 text-[#55715d]">{s.link}</div></div><button className="mt-4 flex items-center gap-2 text-xs font-extrabold text-[#32794b]" onClick={()=>go("Learn")}>Explore related learning <ArrowRight size={14}/></button></div></article>)}</div><div className="mt-5 rounded-2xl border border-[#e4ebe1] bg-white p-4 text-xs leading-5 text-[#819085]">SDG descriptions are simplified educational summaries. For formal reporting, consult official UN SDG materials and define the evidence required for each indicator.</div></div>;

  const renderAnalytics = () => <div><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-widest text-[#6b9c76]">Educator view</div><h2 className="mt-2 text-2xl font-extrabold">A clearer view of campus engagement.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#819085]">Example metrics to demonstrate how a college could track participation and learning over time.</p></div><span className="pill bg-[#fff2d6] text-[#9a7623]"><CircleHelp size={13}/> DEMO DATA — NOT VERIFIED</span></div><div className="stat-grid grid grid-cols-2 gap-4 xl:grid-cols-4"><StatCard label="Participation rate" value="73%" sub="Illustrative sample cohort" icon={Users} accent="#e2f1e5"/><StatCard label="Average quiz score" value="81%" sub="Illustrative sample cohort" icon={GraduationCap} accent="#e1f2f4"/><StatCard label="Challenge completion" value="64%" sub="Illustrative sample cohort" icon={Target} accent="#fff3d7"/><StatCard label="SDGs engaged" value="7 / 17" sub="Goals mapped in this demo" icon={Globe2} accent="#f0e8f8"/></div><div className="two-col mt-5 grid grid-cols-[1.5fr_1fr] gap-5"><div className="panel p-5"><div className="flex items-start justify-between"><div><h3 className="text-sm font-extrabold">Participation & learning trend</h3><p className="mt-1 text-xs text-[#8c9a90]">Illustrative weekly data</p></div><span className="pill bg-[#f0f6ef] text-[#548463]">6 weeks</span></div><div className="mt-4 h-[260px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={demoTrend} margin={{top:10,right:5,left:-20,bottom:0}}><defs><linearGradient id="partFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4b9862" stopOpacity={.2}/><stop offset="100%" stopColor="#4b9862" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1eb"/><XAxis dataKey="week" tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:"#89978d"}} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="participation" name="Participation %" stroke="#398653" fill="url(#partFill)" strokeWidth={2.5}/><Area type="monotone" dataKey="score" name="Average quiz score %" stroke="#d3ac4b" fill="transparent" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div><div className="mt-3 flex gap-4 text-[10px] text-[#829187]"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#398653]"/>Participation</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d3ac4b]"/>Quiz score</span></div></div><div className="panel p-5"><h3 className="text-sm font-extrabold">Learning engagement by topic</h3><p className="mt-1 text-xs text-[#8c9a90]">Illustrative distribution</p><div className="mt-3 h-[210px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={demoCategories} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>{demoCategories.map(d=><Cell key={d.name} fill={d.color}/>)}</Pie><Tooltip formatter={(v)=>`${v}%`}/></PieChart></ResponsiveContainer></div><div className="space-y-2">{demoCategories.map(d=><div key={d.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-[#738276]"><span className="h-2.5 w-2.5 rounded-full" style={{background:d.color}}/>{d.name}</span><span className="font-extrabold text-[#455c4a]">{d.value}%</span></div>)}</div></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="panel p-5"><h3 className="text-sm font-extrabold">Suggested educator actions</h3><div className="mt-3 space-y-3">{[{t:"Revisit lower-scoring topics",d:"Use quiz results to plan a short follow-up activity."},{t:"Make participation accessible",d:"Offer offline, group, and low-bandwidth ways to take part."},{t:"Validate outcome measures",d:"Collect consistent evidence before reporting environmental savings."}].map(x=><div key={x.t} className="flex gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e7f3e8] text-[#43885a]"><Check size={14}/></span><div><div className="text-xs font-bold text-[#4b614f]">{x.t}</div><div className="mt-1 text-[11px] leading-5 text-[#89978d]">{x.d}</div></div></div>)}</div></div><div className="rounded-[20px] border border-[#e8e2cb] bg-[#fff9e9] p-5"><div className="flex items-center gap-2 text-xs font-extrabold text-[#967722]"><ShieldCheck size={16}/> DATA TRANSPARENCY</div><p className="mt-3 text-xs leading-6 text-[#887b54]">All values on this analytics page are synthetic demo data for product demonstration. They do not represent actual students, a real institution, or verified environmental outcomes. Connect an approved data source before using this page for institutional reporting.</p></div></div></div>;

  const pageContent: Record<Page, () => React.ReactNode> = {
    "Overview":renderOverview, "Learn":renderLearn, "Quizzes":renderQuiz,
    "Eco challenges":renderChallenges, "My impact":renderImpact, "SDG explorer":renderSdg,
    "College analytics":renderAnalytics
  };

  return <div className="app-shell flex">
    <Sidebar/>
    <div className="main-area">
      <Header/>
      {mobileMenu && <div className="fixed inset-0 z-40 bg-[#193c29]/30 lg:hidden" onClick={()=>setMobileMenu(false)}><div className="absolute left-0 top-0 h-full w-[280px] bg-white p-5 shadow-xl" onClick={e=>e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 font-extrabold text-[#234631]"><Leaf size={22}/> EcoLearn</div><button onClick={()=>setMobileMenu(false)} aria-label="Close menu"><X size={20}/></button></div><nav className="flex flex-col gap-1">{navItems.map(item=>{const I=item.icon;return <button key={item.label} className={`nav-item ${page===item.label?"active":""}`} onClick={()=>go(item.label)}><I size={17}/>{item.label}</button>})}</nav><button onClick={resetDemo} className="btn-secondary mt-6 w-full"><RotateCcw size={13} className="mr-1 inline"/> Reset demo data</button></div></div>}
      <main className="main-content px-8 py-7 sm:px-8">
        <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold text-[#9aa79c]"><span>EcoLearn</span><ChevronRight size={12}/><span className="text-[#5b8065]">{page}</span><span className="ml-auto pill bg-[#e8f3e7] text-[#4b8559]"><span className="h-1.5 w-1.5 rounded-full bg-[#59a66d]"/> Demo workspace</span></div>
        {pageContent[page]()}
        <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-[#e5ece3] py-5 text-[10px] text-[#9aa69c]"><span>© 2026 EcoLearn · Smart Sustainability Learning Platform</span><span className="flex items-center gap-2"><Leaf size={12}/> Learn consciously. Live sustainably.</span></footer>
      </main>
      <nav className="mobile-nav">{navItems.slice(0,5).map(item=>{const I=item.icon;return <button key={item.label} className={page===item.label?"active":""} onClick={()=>go(item.label)}><I/><span>{item.label==="Eco challenges"?"Challenges":item.label==="Overview"?"Home":item.label==="My impact"?"Impact":item.label}</span></button>})}<button onClick={()=>go("SDG explorer")} className={page==="SDG explorer"?"active":""}><Globe2/><span>SDGs</span></button></nav>
    </div>
    {showProfile && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173b28]/35 p-4" onClick={()=>setShowProfile(false)}><div className="w-full max-w-md rounded-3xl bg-white p-6 soft-shadow" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#294433]">Your profile</h2><button onClick={()=>setShowProfile(false)} aria-label="Close profile"><X size={19}/></button></div><p className="mt-2 text-xs leading-5 text-[#819085]">Change the name used in your local demo workspace.</p><label className="mt-5 block text-xs font-bold text-[#536d59]">Display name</label><input value={nameDraft} onChange={e=>setNameDraft(e.target.value)} maxLength={30} className="mt-2 w-full rounded-xl border border-[#e1e9df] px-3 py-3 text-sm outline-none focus:border-[#6eae7f]" placeholder="Enter your name"/><div className="mt-5 flex justify-end gap-2"><button className="btn-secondary" onClick={()=>setShowProfile(false)}>Cancel</button><button className="btn-primary" onClick={saveProfile}>Save profile</button></div></div></div>}
    {toast && <div role="status" className="fixed bottom-20 right-5 z-[60] flex max-w-[calc(100%-40px)] items-center gap-2 rounded-xl bg-[#234b32] px-4 py-3 text-xs font-bold text-white shadow-xl sm:bottom-6"><CheckCircle2 size={16}/>{toast}</div>}
  </div>;
}
