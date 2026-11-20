import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Activity, ArrowRight, Bell, BriefcaseBusiness, ChartNoAxesCombined, CheckCircle2, ChevronDown,
  CircleHelp, GraduationCap, LayoutDashboard, LockKeyhole, LogOut, Menu, MessageCircle,
  Search, Settings, ShieldCheck, Sparkles, Users, X, BookOpen, Target, CalendarDays,
  FileText, UserRound, Eye, EyeOff, Plus, Pencil, UserX
} from "lucide-react";
import { api, getToken } from "./api";

type User = { id: string; fullName: string; email: string; role: string; status?: string; avatarUrl?: string };
const roleLabel: Record<string,string> = { ADMIN:"Administrator", STUDENT:"Student", JOB_SEEKER:"Job Seeker", EMPLOYER:"Employer", MENTOR:"Mentor" };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    api("/auth/me").then((d) => setUser(d.user)).catch(() => localStorage.removeItem("skillnex_token")).finally(() => setChecking(false));
  }, []);

  function signedIn(u: User, token: string, remember: boolean) {
    if (remember) localStorage.setItem("skillnex_token", token);
    else sessionStorage.setItem("skillnex_token", token);
    setUser(u); nav("/");
  }
  function logout() {
    localStorage.removeItem("skillnex_token"); sessionStorage.removeItem("skillnex_token");
    setUser(null); nav("/login");
  }

  if (checking) return <div className="loading-screen"><div className="brand-mark">S</div><span>Preparing your future...</span></div>;
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" onSignedIn={signedIn} />} />
    <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage mode="register" onSignedIn={signedIn} />} />
    <Route path="/forgot-password" element={<AuthPage mode="forgot" onSignedIn={signedIn} />} />
    <Route path="/reset-password" element={<AuthPage mode="reset" onSignedIn={signedIn} />} />
    <Route path="/verify-email" element={<VerifyPage />} />
    <Route path="/*" element={user ? <Shell user={user} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /> : <Navigate to="/login" state={{ from: location }} />} />
  </Routes>;
}

function AuthPage({ mode, onSignedIn }: { mode: "login"|"register"|"forgot"|"reset"; onSignedIn: (u:User,t:string,r:boolean)=>void }) {
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirm:"", remember:true });
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const resetToken = new URLSearchParams(window.location.search).get("token") || "";
  const update = (key:string, value:string|boolean) => setForm(p => ({...p,[key]:value}));
  const title = mode==="login" ? "Welcome back" : mode==="register" ? "Create your account" : mode==="forgot" ? "Forgot password?" : "Create new password";
  const subtitle = mode==="login" ? "Your next opportunity starts here." : mode==="register" ? "Start building the career you deserve." : mode==="forgot" ? "We'll help you get back into your account." : "Choose a strong password for your account.";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (mode==="register" && form.password !== form.confirm) return setError("Passwords do not match.");
    if ((mode==="register" || mode==="reset") && form.password.length < 8) return setError("Password must contain at least 8 characters.");
    setBusy(true);
    try {
      if (mode==="login") {
        const d = await api("/auth/login",{method:"POST",body:JSON.stringify({email:form.email,password:form.password})});
        onSignedIn(d.user,d.token,form.remember);
      } else if (mode==="register") {
        const d = await api("/auth/register",{method:"POST",body:JSON.stringify({fullName:form.fullName,email:form.email,password:form.password})});
        setMessage(d.message);
      } else if (mode==="forgot") {
        const d = await api("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:form.email})});
        setMessage(d.message + (d.developmentResetLink ? ` Development link: ${d.developmentResetLink}` : ""));
      } else {
        const d = await api("/auth/reset-password",{method:"POST",body:JSON.stringify({token:resetToken,password:form.password})});
        setMessage(d.message);
      }
    } catch(err) { setError(err instanceof Error ? err.message : "Unable to continue."); }
    finally { setBusy(false); }
  }

  return <div className="auth-page">
    <section className="auth-visual">
      <div className="auth-brand"><div className="brand-mark">S</div><span>SKILLNEX</span></div>
      <div className="visual-copy">
        <span className="eyebrow"><Sparkles size={15}/> YOUR CAREER, OUR MISSION</span>
        <h1>Discover your potential.<br/><em>Shape your future.</em></h1>
        <p>One intelligent platform to build your skills, discover opportunities and grow with confidence.</p>
        <div className="visual-stats"><div><strong>01</strong><span>Discover</span></div><div><strong>02</strong><span>Develop</span></div><div><strong>03</strong><span>Achieve</span></div></div>
      </div>
      <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
      <div className="visual-foot">AI-POWERED CAREER DEVELOPMENT PLATFORM</div>
    </section>
    <section className="auth-form-side">
      <div className="auth-top"><span>Already have a plan?</span><button className="text-button" onClick={()=>nav(mode==="login"?"/register":"/login")}>{mode==="login"?"Create account":"Sign in"} <ArrowRight size={15}/></button></div>
      <div className="auth-card">
        <div className="mobile-brand"><div className="brand-mark">S</div><b>SKILLNEX</b></div>
        <div className="form-icon"><ShieldCheck size={22}/></div>
        <h2>{title}</h2><p className="muted">{subtitle}</p>
        <form onSubmit={submit}>
          {mode==="register" && <label>Full name<div className="field"><UserRound size={17}/><input required value={form.fullName} onChange={e=>update("fullName",e.target.value)} placeholder="Enter your full name"/></div></label>}
          {(mode==="login"||mode==="register"||mode==="forgot") && <label>Email address<div className="field"><MessageCircle size={17}/><input required type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="you@example.com"/></div></label>}
          {(mode==="login"||mode==="register"||mode==="reset") && <label>Password<div className="field"><LockKeyhole size={17}/><input required minLength={8} type={showPass?"text":"password"} value={form.password} onChange={e=>update("password",e.target.value)} placeholder="At least 8 characters"/><button type="button" className="field-action" onClick={()=>setShowPass(!showPass)}>{showPass?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>}
          {mode==="register" && <label>Confirm password<div className="field"><LockKeyhole size={17}/><input required type="password" value={form.confirm} onChange={e=>update("confirm",e.target.value)} placeholder="Re-enter your password"/></div></label>}
          {mode==="login" && <div className="form-options"><label className="check-label"><input type="checkbox" checked={form.remember} onChange={e=>update("remember",e.target.checked)}/> Remember me</label><button type="button" className="text-button" onClick={()=>nav("/forgot-password")}>Forgot password?</button></div>}
          {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
          <button className="primary-button full-button" disabled={busy}>{busy?"Please wait...":mode==="login"?"Sign in to SKILLNEX":mode==="register"?"Create account":mode==="forgot"?"Send reset instructions":"Update password"} <ArrowRight size={17}/></button>
        </form>
        <div className="auth-divider"><span>YOUR NEXT CHAPTER STARTS HERE</span></div>
        <p className="auth-switch">{mode==="login"?"New to SKILLNEX?":mode==="register"?"Already a member?": "Remembered your password?"} <button className="text-button" onClick={()=>nav(mode==="login"||mode==="register"? (mode==="login"?"/register":"/login"):"/login")}>{mode==="login"?"Create an account":mode==="register"?"Sign in":"Back to login"}</button></p>
        <div className="secure-note"><LockKeyhole size={13}/> Your information is protected and secure.</div>
      </div>
    </section>
  </div>;
}

function VerifyPage() {
  const [msg,setMsg]=useState("Verifying your email...");
  useEffect(()=>{ const token=new URLSearchParams(window.location.search).get("token"); if(token) api("/auth/verify-email",{method:"POST",body:JSON.stringify({token})}).then(d=>setMsg(d.message)).catch(e=>setMsg(e.message)); else setMsg("Verification token is missing."); },[]);
  return <div className="verify-page"><div className="auth-card"><div className="form-icon"><CheckCircle2/></div><h2>Email verification</h2><p>{msg}</p><a className="primary-button" href="/login">Go to sign in <ArrowRight size={16}/></a></div></div>;
}

const navItems = [
  {label:"Dashboard",icon:LayoutDashboard,path:"/"},
  {label:"Jobs & Internships",icon:BriefcaseBusiness,path:"/jobs"},
  {label:"Learning Center",icon:GraduationCap,path:"/learning"},
  {label:"AI Career Tools",icon:Sparkles,path:"/ai"},
  {label:"Portfolio",icon:FileText,path:"/portfolio"},
  {label:"Community",icon:Users,path:"/community"},
  {label:"Mentor Connect",icon:MessageCircle,path:"/mentors"},
  {label:"Analytics",icon:ChartNoAxesCombined,path:"/analytics"}
];

function Shell({user,onLogout,mobileOpen,setMobileOpen}:{user:User;onLogout:()=>void;mobileOpen:boolean;setMobileOpen:(v:boolean)=>void}) {
  const nav=useNavigate(); const loc=useLocation();
  const [search,setSearch]=useState(""); const [users,setUsers]=useState<User[]>([]);
  const [stats,setStats]=useState<any>({});
  const [showProfile,setShowProfile]=useState(false);
  const isAdmin=user.role==="ADMIN";
  useEffect(()=>{api("/dashboard/summary").then(d=>setStats(d.stats||{})).catch(()=>{}); if(isAdmin) api("/users").then(d=>setUsers(d.users)).catch(()=>{});},[isAdmin]);
  const active = navItems.find(n=>n.path===loc.pathname)?.label || (loc.pathname==="/users"?"User Management":"Dashboard");
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?"sidebar-open":""}`}>
      <div className="side-brand"><div className="brand-mark small">S</div><span>SKILLNEX</span><button className="close-nav" onClick={()=>setMobileOpen(false)}><X/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{navItems.map(item=><button key={item.path} className={`nav-link ${loc.pathname===item.path?"active":""}`} onClick={()=>{nav(item.path);setMobileOpen(false)}}><item.icon size={18}/><span>{item.label}</span>{item.label==="AI Career Tools"&&<i>NEW</i>}</button>)}</nav>
      {isAdmin&&<><div className="side-label admin-label">ADMINISTRATION</div><button className={`nav-link ${loc.pathname==="/users"?"active":""}`} onClick={()=>{nav("/users");setMobileOpen(false)}}><ShieldCheck size={18}/><span>User Management</span></button></>}
      <div className="side-spacer"/>
      <div className="premium-card"><div className="premium-icon"><Sparkles/></div><b>Grow without limits</b><p>Your next opportunity is closer than you think.</p><button onClick={()=>nav("/ai")}>Explore AI tools <ArrowRight size={14}/></button></div>
      <button className="nav-link side-settings" onClick={()=>nav("/settings")}><Settings size={18}/><span>Settings</span></button>
      <div className="side-user"><div className="avatar">{user.fullName.slice(0,1).toUpperCase()}</div><div className="user-mini"><b>{user.fullName}</b><span>{roleLabel[user.role]||user.role}</span></div><button title="Sign out" onClick={onLogout}><LogOut size={17}/></button></div>
    </aside>
    {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="menu-button" onClick={()=>setMobileOpen(true)}><Menu/></button><div className="crumb"><span>Workspace</span><b>/</b>{active}</div><div className="top-actions"><div className="top-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search anything..."/></div><button className="icon-button notification"><Bell size={19}/><i/></button><button className="profile-trigger" onClick={()=>setShowProfile(!showProfile)}><div className="avatar">{user.fullName.slice(0,1).toUpperCase()}</div><span><b>{user.fullName}</b><small>{roleLabel[user.role]||user.role}</small></span><ChevronDown size={15}/></button>{showProfile&&<div className="profile-menu"><button onClick={()=>nav("/settings")}>My profile & settings</button><button onClick={onLogout}>Sign out</button></div>}</div></header>
      <Routes>
        <Route path="/" element={<Dashboard user={user} stats={stats}/>} />
        <Route path="/users" element={isAdmin?<UserManagement users={users} setUsers={setUsers}/>:<Navigate to="/"/>}/>
        <Route path="/jobs" element={<Placeholder title="Jobs & Internships" desc="Discover opportunities that match your skills and ambitions." icon={<BriefcaseBusiness/>}/>} />
        <Route path="/learning" element={<Placeholder title="Learning Center" desc="Build in-demand skills through guided learning paths." icon={<BookOpen/>}/>} />
        <Route path="/ai" element={<Placeholder title="AI Career Assistant" desc="Get career guidance, skill insights and personalized next steps." icon={<Sparkles/>}/>} />
        <Route path="/portfolio" element={<Placeholder title="Professional Portfolio" desc="Showcase your projects, experience and achievements." icon={<FileText/>}/>} />
        <Route path="/community" element={<Placeholder title="Professional Community" desc="Connect, share knowledge and grow with your community." icon={<Users/>}/>} />
        <Route path="/mentors" element={<Placeholder title="Mentor Connect" desc="Find experienced professionals to guide your journey." icon={<MessageCircle/>}/>} />
        <Route path="/analytics" element={<Placeholder title="Career Analytics" desc="Track your progress and understand your career growth." icon={<Activity/>}/>} />
        <Route path="/settings" element={<Placeholder title="Settings & Profile" desc="Manage your account details and preferences." icon={<Settings/>}/>} />
      </Routes>
    </main>
  </div>;
}

function Dashboard({user,stats}:{user:User;stats:any}) {
  return <div className="page-content">
    <div className="welcome-banner"><div><span className="eyebrow light"><Sparkles size={14}/> YOUR CAREER JOURNEY</span><h1>Welcome back, {user.fullName.split(" ")[0]}!</h1><p>Keep moving forward. Every small step brings you closer to your dream career.</p><button className="banner-button">View your roadmap <ArrowRight size={16}/></button></div><div className="readiness"><div className="ring"><strong>78%</strong></div><span>Career readiness</span></div></div>
    <div className="stat-grid"><Stat icon={<BriefcaseBusiness/>} value="05" label="Applied jobs" tone="blue"/><Stat icon={<GraduationCap/>} value="12" label="Completed courses" tone="gold"/><Stat icon={<Target/>} value="85%" label="Skill match" tone="green"/><Stat icon={<CalendarDays/>} value="02" label="Upcoming interviews" tone="violet"/></div>
    <div className="content-grid">
      <section className="panel roadmap-panel"><div className="panel-head"><div><span className="eyebrow">YOUR DEVELOPMENT</span><h3>Your career roadmap</h3></div><button className="link-button">View full plan <ArrowRight size={14}/></button></div><div className="roadmap-list"><RoadmapItem done title="Learn JavaScript basics" month="MONTH 01"/><RoadmapItem done title="Master React framework" month="MONTH 02"/><RoadmapItem title="Build real-world projects" month="MONTH 03"/><RoadmapItem title="Enhance your portfolio" month="MONTH 04"/></div><div className="goal-card"><div className="goal-icon"><Target/></div><span>NEXT MILESTONE</span><b>Build your first React project</b><div className="progress"><i style={{width:"68%"}}/></div><small>68% completed</small></div></section>
      <section className="panel jobs-panel"><div className="panel-head"><div><span className="eyebrow">MADE FOR YOUR PROFILE</span><h3>Recommended opportunities</h3></div><button className="link-button">View all <ArrowRight size={14}/></button></div><JobRow title="Software Engineer" company="TechWave Solutions" tag="Remote"/><JobRow title="QA Engineer Intern" company="Dialog Axiata PLC" tag="Internship"/><JobRow title="Full Stack Developer" company="IFS R&D" tag="Hybrid"/></section>
    </div>
    <div className="lower-grid">
      <section className="panel assistant-panel"><div className="assistant-avatar"><Sparkles/></div><div><span className="eyebrow">YOUR PERSONAL AI GUIDE</span><h3>Meet your AI Career Assistant</h3><p>Get help with career choices, skill development and your next big move.</p><button className="primary-button">Start a conversation <ArrowRight size={15}/></button></div></section>
      <section className="panel learning-panel"><div className="panel-head"><div><span className="eyebrow">KEEP LEARNING</span><h3>Continue your learning</h3></div><BookOpen size={21}/></div><div className="course-row"><div className="course-art"><GraduationCap/></div><div><b>React for Beginners</b><span>Build modern web applications</span><div className="progress"><i style={{width:"62%"}}/></div><small>62% completed</small></div></div></section>
    </div>
    {stats.totalUsers!==undefined&&user.role==="ADMIN"&&<div className="admin-overview panel"><div className="panel-head"><div><span className="eyebrow">PLATFORM OVERVIEW</span><h3>Community at a glance</h3></div><span className="status-pill"><i/> Live data</span></div><div className="admin-stats"><div><b>{stats.totalUsers}</b><span>Total users</span></div><div><b>{stats.activeUsers}</b><span>Active accounts</span></div><div><b>{stats.students}</b><span>Students</span></div><div><b>{stats.employers}</b><span>Employers</span></div></div></div>}
  </div>;
}
function Stat({icon,value,label,tone}:{icon:any;value:string;label:string;tone:string}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><b>{value}</b><span>{label}</span></div></div>; }
function RoadmapItem({done=false,title,month}:{done?:boolean;title:string;month:string}) { return <div className={`roadmap-item ${done?"done":""}`}><div className="roadmap-check">{done?<CheckCircle2 size={17}/>:<span/>}</div><small>{month}</small><b>{title}</b></div>; }
function JobRow({title,company,tag}:{title:string;company:string;tag:string}) { return <div className="job-row"><div className="company-icon"><BriefcaseBusiness/></div><div className="job-info"><b>{title}</b><span>{company} · Colombo</span></div><span className="job-tag">{tag}</span><button className="apply-button">View</button></div>; }

function UserManagement({users,setUsers}:{users:User[];setUsers:(u:User[])=>void}) {
  const [query,setQuery]=useState(""); const [modal,setModal]=useState(false); const [editing,setEditing]=useState<User|null>(null);
  const [form,setForm]=useState({fullName:"",email:"",password:"",role:"STUDENT",status:"ACTIVE"}); const [error,setError]=useState("");
  const filtered=useMemo(()=>users.filter(u=>`${u.fullName} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())),[users,query]);
  function open(u?:User){setEditing(u||null);setForm({fullName:u?.fullName||"",email:u?.email||"",password:"",role:u?.role||"STUDENT",status:u?.status||"ACTIVE"});setError("");setModal(true);}
  async function save(e:React.FormEvent){e.preventDefault();setError("");try{if(editing){const d=await api(`/users/${editing.id}`,{method:"PATCH",body:JSON.stringify({fullName:form.fullName,role:form.role,status:form.status})});setUsers(users.map(u=>u.id===editing.id?d.user:u));}else{const d=await api("/users",{method:"POST",body:JSON.stringify(form)});setUsers([d.user,...users]);}setModal(false);}catch(e){setError(e instanceof Error?e.message:"Unable to save user.");}}
  async function deactivate(u:User){if(!confirm(`Deactivate ${u.fullName}'s account?`))return;try{await api(`/users/${u.id}`,{method:"DELETE"});setUsers(users.map(x=>x.id===u.id?{...x,status:"INACTIVE"}:x));}catch(e){alert(e instanceof Error?e.message:"Unable to deactivate user.");}}
  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>User Management</h1><p>Manage platform accounts, access roles and account status.</p></div><button className="primary-button" onClick={()=>open()}><Plus size={17}/> Add user</button></div>
    <div className="user-summary"><div><b>{users.length}</b><span>Total accounts</span></div><div><b>{users.filter(u=>u.status==="ACTIVE").length}</b><span>Active users</span></div><div><b>{users.filter(u=>u.role==="EMPLOYER").length}</b><span>Employers</span></div><div><b>{users.filter(u=>u.role==="MENTOR").length}</b><span>Mentors</span></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h3>All platform users</h3><span>{filtered.length} accounts found</span></div><div className="table-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..."/></div></div>
      <div className="table-scroll"><table><thead><tr><th>USER</th><th>ROLE</th><th>STATUS</th><th>EMAIL VERIFIED</th><th>JOINED</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map(u=><tr key={u.id}><td><div className="table-user"><div className="avatar">{u.fullName.slice(0,1)}</div><div><b>{u.fullName}</b><span>{u.email}</span></div></div></td><td><span className="role-pill">{roleLabel[u.role]||u.role}</span></td><td><span className={`account-status ${u.status==="ACTIVE"?"active-status":"inactive-status"}`}>{u.status||"ACTIVE"}</span></td><td>{u.emailVerified?"Verified":"Pending"}</td><td>{u.createdAt?new Date((u as any).createdAt).toLocaleDateString():"—"}</td><td><div className="row-actions"><button title="Edit user" onClick={()=>open(u)}><Pencil size={16}/></button><button title="Deactivate user" onClick={()=>deactivate(u)}><UserX size={16}/></button></div></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state">No users match your search.</div>}</div>
    </section>
    {modal&&<div className="modal-backdrop" onClick={()=>setModal(false)}><div className="user-modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">ACCOUNT DETAILS</span><h3>{editing?"Edit user":"Create new user"}</h3></div><button onClick={()=>setModal(false)}><X/></button></div><form onSubmit={save}><label>Full name<input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label><label>Email address<input required type="email" disabled={!!editing} value={editing?editing.email:form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{!editing&&<label>Temporary password<input required minLength={8} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>}<label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="STUDENT">Student</option><option value="JOB_SEEKER">Job Seeker</option><option value="EMPLOYER">Employer</option><option value="MENTOR">Mentor</option><option value="ADMIN">Administrator</option></select></label>{editing&&<label>Account status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></label>}{error&&<div className="alert error">{error}</div>}<button className="primary-button full-button">Save user <ArrowRight size={16}/></button></form></div></div>}
  </div>;
}
function Placeholder({title,desc,icon}:{title:string;desc:string;icon:any}) { return <div className="page-content"><div className="placeholder-panel panel"><div className="placeholder-icon">{icon}</div><span className="eyebrow">SKILLNEX WORKSPACE</span><h1>{title}</h1><p>{desc}</p><span className="coming-pill">MODULE FOUNDATION · COMING NEXT</span></div></div>; }

export default App;
