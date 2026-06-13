import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAttempts } from '../services/api';
import { AnimatedCounter } from '../components/shared/AnimatedCounter';

const INTERVIEWS = [
  { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', emoji:'💻', color:'#3b82f6', glow:'rgba(59,130,246,0.15)',  difficulty:'Medium', duration:'20 min' },
  { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', emoji:'⚛️', color:'#8b5cf6', glow:'rgba(139,92,246,0.15)',  difficulty:'Medium', duration:'20 min' },
  { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    emoji:'🔧', color:'#10b981', glow:'rgba(16,185,129,0.15)',  difficulty:'Easy',   duration:'15 min' },
  { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   emoji:'🎨', color:'#f59e0b', glow:'rgba(245,158,11,0.15)',  difficulty:'Easy',   duration:'15 min' },
  { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', emoji:'☕', color:'#ef4444', glow:'rgba(239,68,68,0.15)',   difficulty:'Hard',   duration:'25 min' },
  { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    emoji:'🐍', color:'#06b6d4', glow:'rgba(6,182,212,0.15)',   difficulty:'Medium', duration:'20 min' },
  { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         emoji:'🤝', color:'#ec4899', glow:'rgba(236,72,153,0.15)',  difficulty:'Easy',   duration:'15 min' },
  { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      emoji:'📈', color:'#f97316', glow:'rgba(249,115,22,0.15)',  difficulty:'Medium', duration:'20 min' },
];

const CATEGORIES = ['All','Full Stack','Frontend','Backend','HR','Sales'];
const NAV_ITEMS  = [
  { icon:'🏠', label:'Dashboard'   },
  { icon:'📋', label:'My Attempts' },
  { icon:'📊', label:'Analytics'   },
  { icon:'⚙️', label:'Settings'    },
];

const fadeUp = {
  hidden: { opacity:0, y:16 },
  show:   { opacity:1, y:0, transition:{ duration:0.4, ease:'easeOut' } },
};
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };

function getScoreStyle(score) {
  if (score >= 70) return { color:'#22c55e', bg:'rgba(34,197,94,0.1)', border:'rgba(34,197,94,0.2)' };
  if (score >= 50) return { color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)' };
  return { color:'#ef4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.2)' };
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [attempts,     setAttempts]     = useState([]);
  const [filter,       setFilter]       = useState('All');
  const [loading,      setLoading]      = useState(true);
  const [activeNav,    setActiveNav]    = useState('Dashboard');
  const [sideOpen,     setSideOpen]     = useState(false);
  const [sideExpanded, setSideExpanded] = useState(false);
  const [hoveredCard,  setHoveredCard]  = useState(null);
  const [search,       setSearch]       = useState('');
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (isMobile && sideOpen && sidebarRef.current && !sidebarRef.current.contains(e.target))
        setSideOpen(false);
    };
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn);
    return () => { document.removeEventListener('mousedown', fn); document.removeEventListener('touchstart', fn); };
  }, [isMobile, sideOpen]);

  useEffect(() => {
    if (isMobile) document.body.style.overflow = sideOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sideOpen, isMobile]);

  useEffect(() => {
    getAttempts()
      .then(({ data }) => setAttempts(data))
      .catch(() => toast.error('Could not load attempts'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = INTERVIEWS.filter(iv => {
    const mc = filter === 'All' || iv.category === filter;
    const ms = !search || iv.company.toLowerCase().includes(search.toLowerCase()) || iv.role.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const avgScore  = attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.totalScore,0)/attempts.length) : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map(a=>a.totalScore)) : 0;
  const passRate  = attempts.length ? Math.round(attempts.filter(a=>a.totalScore>=60).length/attempts.length*100) : 0;
  const readiness = Math.min(100, Math.round((avgScore*0.6)+(Math.min(attempts.length,10)*4)));

  const strongestCat = (() => {
    if (!attempts.length) return null;
    let best = null, bestAvg = 0;
    ['Full Stack','Frontend','Backend','HR','Sales'].forEach(cat => {
      const ca = attempts.filter(a=>a.category===cat);
      if (!ca.length) return;
      const avg = ca.reduce((s,a)=>s+a.totalScore,0)/ca.length;
      if (avg > bestAvg) { bestAvg = avg; best = cat; }
    });
    return best;
  })();

  const weakestCat = (() => {
    if (!attempts.length) return null;
    let worst = null, worstAvg = 101;
    ['Full Stack','Frontend','Backend','HR','Sales'].forEach(cat => {
      const ca = attempts.filter(a=>a.category===cat);
      if (!ca.length) return;
      const avg = ca.reduce((s,a)=>s+a.totalScore,0)/ca.length;
      if (avg < worstAvg) { worstAvg = avg; worst = cat; }
    });
    return worst;
  })();

  const sideW  = isMobile ? 240 : sideExpanded ? 220 : 64;
  const mainML = isMobile ? 0   : sideW;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0f1e', color:'#fff', fontFamily:'Inter,system-ui,sans-serif', overflowX:'hidden' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .row-hover { transition: background 0.15s, border-left-color 0.15s; }
        .row-hover:hover { background: rgba(99,102,241,0.05) !important; border-left-color: #6366f1 !important; }
      `}</style>

      {/* Overlay */}
      <AnimatePresence>
        {isMobile && sideOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setSideOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:40 }}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <motion.aside
        ref={sidebarRef}
        animate={{ width:sideW, x: isMobile && !sideOpen ? -sideW : 0 }}
        transition={{ duration:0.28, ease:[0.4,0,0.2,1] }}
        style={{
          position:'fixed', top:0, left:0, height:'100vh', zIndex:50,
          background:'rgba(6,9,20,0.98)', backdropFilter:'blur(24px)',
          borderRight:'1px solid rgba(255,255,255,0.06)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding:'16px 14px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10, minHeight:60 }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 0 16px rgba(99,102,241,0.35)' }}>
            🧠
          </div>
          <AnimatePresence>
            {(sideExpanded || isMobile) && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ fontWeight:800, fontSize:15, whiteSpace:'nowrap', background:'linear-gradient(135deg,#a5b4fc,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                MockPrep
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px', overflowY:'auto' }}>
          {NAV_ITEMS.map(({ icon, label }) => {
            const isActive = activeNav === label;
            return (
              <motion.div key={label} whileHover={{ x:2 }}
                onClick={() => { setActiveNav(label); if (isMobile) setSideOpen(false); }}
                title={label}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                  borderRadius:12, cursor:'pointer', marginBottom:2, transition:'all 0.15s',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border:`1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                  color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.38)',
                }}
              >
                <span style={{ fontSize:18, minWidth:22, textAlign:'center', flexShrink:0 }}>{icon}</span>
                <AnimatePresence>
                  {(sideExpanded || isMobile) && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ fontSize:13, fontWeight: isActive ? 600 : 500, whiteSpace:'nowrap' }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {(sideExpanded || isMobile) && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ overflow:'hidden', flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                  <button onClick={() => { logout(); navigate('/'); }}
                    style={{ background:'none', border:'none', color:'rgba(239,68,68,0.55)', fontSize:11, cursor:'pointer', padding:0, marginTop:1 }}
                    onMouseEnter={e=>e.target.style.color='#ef4444'} onMouseLeave={e=>e.target.style.color='rgba(239,68,68,0.55)'}>
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <motion.div animate={{ marginLeft: mainML }} transition={{ duration:0.28, ease:[0.4,0,0.2,1] }}
        style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <div style={{ position:'sticky', top:0, zIndex:30, display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(6,9,20,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => isMobile ? setSideOpen(o=>!o) : setSideExpanded(o=>!o)}
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:9, padding:'7px 8px', cursor:'pointer', display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
            <div style={{ width:18, height:2, background:'rgba(255,255,255,0.5)', borderRadius:2 }} />
            <div style={{ width:13, height:2, background:'rgba(255,255,255,0.5)', borderRadius:2 }} />
            <div style={{ width:18, height:2, background:'rgba(255,255,255,0.5)', borderRadius:2 }} />
          </button>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.2 }}>
              {activeNav === 'Dashboard'   && `${getGreeting()}, ${user?.name?.split(' ')[0]} 👋`}
              {activeNav === 'My Attempts' && '📋 My Attempts'}
              {activeNav === 'Analytics'   && '📊 Analytics'}
              {activeNav === 'Settings'    && '⚙️ Settings'}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginTop:1 }}>
              {activeNav === 'Dashboard'   && 'Choose a role and start practicing'}
              {activeNav === 'My Attempts' && `${attempts.length} sessions completed`}
              {activeNav === 'Analytics'   && 'Track your interview performance'}
              {activeNav === 'Settings'    && 'Manage your account'}
            </div>
          </div>

          {activeNav === 'Dashboard' && (
            <div style={{ display:'flex', alignItems:'center', gap:7, flex:1, maxWidth:240, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'7px 12px' }}>
              <span style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>🔍</span>
              <input style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:12, color:'#fff' }}
                placeholder="Search roles..." value={search} onChange={e=>setSearch(e.target.value)} />
              {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>×</button>}
            </div>
          )}

          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:'18px 20px', maxWidth:1600, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {activeNav === 'Dashboard' && (
              <motion.div key="dash" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>

                {/* Hero banner */}
<motion.div
variants={fadeUp}
initial="hidden"
animate="show"
style={{
background:
'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.06))',
border: '1px solid rgba(99,102,241,0.18)',
borderRadius: 18,
padding: '28px 32px',
marginBottom: 16,
position: 'relative',
overflow: 'hidden',
}}

>

  <div
    style={{
      position: 'absolute',
      top: -30,
      right: -30,
      width: 150,
      height: 150,
      background:
        'radial-gradient(circle,rgba(99,102,241,0.18),transparent)',
      borderRadius: '50%',
      pointerEvents: 'none',
    }}
  />

  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      position: 'relative',
    }}
  >
    {/* Left Content */}
    <div style={{ flex: 1, minWidth: 280 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          background: 'rgba(99,102,241,0.18)',
          color: '#a5b4fc',
          border: '1px solid rgba(99,102,241,0.28)',
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        ✨ AI-Powered Platform
      </div>

```
  <h2
    style={{
      fontSize: 24,
      fontWeight: 900,
      color: '#fff',
      margin: '0 0 8px',
      letterSpacing: '-0.02em',
    }}
  >
    {attempts.length === 0
      ? 'Ready to ace your next interview?'
      : avgScore >= 70
      ? 'Great progress! Keep it up 🔥'
      : "Keep practicing — you're getting better!"}
  </h2>

  <p
    style={{
      fontSize: 13,
      color: 'rgba(255,255,255,0.45)',
      marginBottom: 16,
      lineHeight: 1.6,
    }}
  >
    {attempts.length === 0
      ? 'AI-generated questions · Voice answers · Real-time evaluation'
      : `${attempts.length} interview${
          attempts.length > 1 ? 's' : ''
        } completed · ${avgScore}% avg score · ${passRate}% pass rate`}
  </p>

  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={() =>
      window.scrollTo({
        top: 500,
        behavior: 'smooth',
      })
    }
    style={{
      padding: '12px 24px',
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
      background:
        'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: '#fff',
      boxShadow:
        '0 8px 24px rgba(99,102,241,0.30)',
    }}
  >
    🚀 Start Interview
  </motion.button>
</div>

{/* AI Readiness Card */}
<div
  style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '16px 20px',
    textAlign: 'center',
    minWidth: 150,
  }}
>
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.28)',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      marginBottom: 5,
    }}
  >
    AI Readiness
  </div>

  <div
    style={{
      fontSize: 28,
      fontWeight: 900,
      background:
        'linear-gradient(135deg,#6366f1,#8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: 1,
      marginBottom: 8,
    }}
  >
    <AnimatedCounter to={readiness} suffix="%" />
  </div>

  <div
    style={{
      height: 4,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 99,
      overflow: 'hidden',
    }}
  >
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${readiness}%` }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        delay: 0.5,
      }}
      style={{
        height: '100%',
        background:
          'linear-gradient(90deg,#6366f1,#8b5cf6)',
        borderRadius: 99,
      }}
    />
  </div>
</div>
```

  </div>
</motion.div>


                {/* Stats — only if attempts exist */}
                {attempts.length > 0 && (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                   style={{
  display:'grid',
  gridTemplateColumns: isMobile
    ? 'repeat(2,1fr)'
    : 'repeat(4,1fr)',
  gap:12,
  marginBottom:16
}}>
                    {[
                      { label:'Interviews', value:attempts.length, suffix:'',  icon:'📝', color:'#6366f1' },
                      { label:'Avg Score',  value:avgScore,        suffix:'%', icon:'📊', color:'#10b981' },
                      { label:'Best Score', value:bestScore,       suffix:'%', icon:'🏆', color:'#f59e0b' },
                      { label:'Pass Rate',  value:passRate,        suffix:'%', icon:'✅', color:'#06b6d4' },
                    ].map(({ label, value, suffix, icon, color }) => (
                      <motion.div key={label} variants={fadeUp}
                        className="card-hover"
                        style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at top right,${color}12,transparent 60%)`, pointerEvents:'none' }} />
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, position:'relative' }}>
                          <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                          <span style={{ fontSize:17 }}>{icon}</span>
                        </div>
                        <div style={{ fontSize:26, fontWeight:900, color, lineHeight:1, position:'relative' }}>
                          <AnimatedCounter to={value} suffix={suffix} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* AI Insights */}
                {attempts.length > 0 && (
                  <motion.div variants={fadeUp} initial="hidden" animate="show"
                    style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', flexWrap:'wrap', alignItems:'center', gap:14, backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:180 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0, boxShadow:'0 0 12px rgba(99,102,241,0.3)' }}>
                        🤖
                      </div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>AI Insight</div>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', fontWeight:500 }}>
                          {avgScore >= 70 ? 'Excellent! Focus on consistency across all categories.'
                            : avgScore >= 50 ? 'Good progress! Practice weak areas regularly.'
                            : 'Keep going — every practice session counts.'}
                        </div>
                      </div>
                    </div>
                    {strongestCat && (
                      <div style={{ display:'flex', gap:8 }}>
                        <div style={{ textAlign:'center', padding:'7px 13px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:10 }}>
                          <div style={{ fontSize:9, color:'rgba(34,197,94,0.5)', marginBottom:2 }}>Strongest</div>
                          <div style={{ fontSize:11, fontWeight:700, color:'#22c55e' }}>{strongestCat}</div>
                        </div>
                        {weakestCat && weakestCat !== strongestCat && (
                          <div style={{ textAlign:'center', padding:'7px 13px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10 }}>
                            <div style={{ fontSize:9, color:'rgba(239,68,68,0.5)', marginBottom:2 }}>Focus on</div>
                            <div style={{ fontSize:11, fontWeight:700, color:'#ef4444' }}>{weakestCat}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Interview Prep */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Interview Prep</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Choose a company and role to begin</div>
                  </div>
                  {attempts.length > 0 && (
                    <button onClick={() => setActiveNav('My Attempts')}
                      style={{ fontSize:11, fontWeight:600, color:'#a5b4fc', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'5px 12px', cursor:'pointer' }}>
                      View History →
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilter(c)}
                      style={{
                        padding:'5px 13px', borderRadius:9, fontSize:12, fontWeight:600,
                        cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                        background: filter===c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                        color:       filter===c ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
                        borderColor: filter===c ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'36px', background:'rgba(17,24,39,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
                    <div style={{ fontWeight:600, color:'#fff', marginBottom:5 }}>No results found</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:14 }}>Try a different search or filter</div>
                    <button onClick={() => { setSearch(''); setFilter('All'); }}
                      style={{ padding:'7px 18px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.09)' }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    style={{ display:'grid', gridTemplateColumns: isMobile
  ? '1fr'
  : 'repeat(auto-fill,minmax(260px,1fr))', gap:13, marginBottom:28 }}>
                    {filtered.map(iv => {
                      const isH = hoveredCard === iv.id;
                      const diff = iv.difficulty==='Easy' ? { color:'#22c55e', bg:'rgba(34,197,94,0.1)' } : iv.difficulty==='Hard' ? { color:'#ef4444', bg:'rgba(239,68,68,0.1)' } : { color:'#f59e0b', bg:'rgba(245,158,11,0.1)' };
                      return (
                        <motion.div key={iv.id} variants={fadeUp}
                          className="card-hover"
                          onMouseEnter={() => setHoveredCard(iv.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            background:'rgba(17,24,39,0.9)', borderRadius:16, overflow:'hidden',
                            border:`1px solid ${isH ? iv.color+'35' : 'rgba(255,255,255,0.07)'}`,
                            boxShadow: isH ? `0 16px 36px ${iv.glow}` : '0 2px 8px rgba(0,0,0,0.25)',
                            display:'flex', flexDirection:'column',
                          }}>
                          <div style={{ height:3, background:`linear-gradient(90deg,${iv.color},${iv.color}80)` }} />
                          <div style={{ padding:'14px', flex:1, position:'relative' }}>
                            <div style={{ position:'absolute', inset:0, background:isH ? `radial-gradient(circle at top left,${iv.glow},transparent 60%)` : 'transparent', transition:'opacity 0.3s', pointerEvents:'none' }} />
                            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, position:'relative' }}>
                              <div style={{ width:40, height:40, borderRadius:11, background:`${iv.color}15`, border:`1px solid ${iv.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                                {iv.emoji}
                              </div>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                                <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, background:diff.bg, color:diff.color }}>{iv.difficulty}</span>
                                <span style={{ fontSize:8, fontWeight:600, padding:'2px 6px', borderRadius:5, background:'rgba(99,102,241,0.1)', color:'#818cf8' }}>✨ AI</span>
                              </div>
                            </div>
                            <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:2, position:'relative' }}>{iv.company}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginBottom:10, position:'relative' }}>{iv.role}</div>
                            <div style={{ display:'flex', gap:8, marginBottom:12, position:'relative' }}>
                              <span style={{ fontSize:9, color:'rgba(255,255,255,0.22)' }}>⏱ {iv.duration}</span>
                              <span style={{ fontSize:9, color:'rgba(255,255,255,0.22)' }}>💬 8 Qs</span>
                            </div>
                            <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:5, background:`${iv.color}12`, color:iv.color, border:`1px solid ${iv.color}22`, position:'relative' }}>
                              {iv.category}
                            </span>
                          </div>
                          <div style={{ padding:'0 12px 12px' }}>
                            <motion.button whileTap={{ scale:0.97 }}
                              onClick={() => navigate(`/interview/${iv.id}`, { state:iv })}
                              style={{
                                width:'100%', padding:'9px', borderRadius:11, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                                background: isH ? `linear-gradient(135deg,${iv.color},${iv.color}cc)` : 'rgba(255,255,255,0.04)',
                                color: isH ? '#fff' : iv.color,
                                border:`1px solid ${isH ? 'transparent' : iv.color+'35'}`,
                                boxShadow: isH ? `0 4px 16px ${iv.glow}` : 'none',
                              }}>
                              {isH ? 'Start Interview →' : 'Start Interview'}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Recent Attempts */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Recent Attempts</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Click to view full AI feedback</div>
                  </div>
                  {attempts.length > 3 && (
                    <button onClick={() => setActiveNav('My Attempts')}
                      style={{ fontSize:11, fontWeight:600, color:'#a5b4fc', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'5px 12px', cursor:'pointer' }}>
                      View all →
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:'28px' }}>
                    <div style={{ width:28, height:28, border:'2px solid rgba(99,102,241,0.25)', borderTop:'2px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  </div>
                ) : attempts.length === 0 ? (
                  <motion.div variants={scaleIn} initial="hidden" animate="show"
                    style={{ background:'rgba(17,24,39,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'44px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:44, marginBottom:12, filter:'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' }}>🎯</div>
                    <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:6 }}>Start your first interview</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:20, maxWidth:300, margin:'0 auto 20px' }}>
                      Pick any company card above and get AI-powered feedback on your answers.
                    </div>
                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                      onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
                      style={{ padding:'11px 24px', borderRadius:11, fontSize:13, fontWeight:700, cursor:'pointer', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', boxShadow:'0 0 24px rgba(99,102,241,0.3)' }}>
                      ✨ Start Practicing
                    </motion.button>
                  </motion.div>
                ) : (
                  <div style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, overflow:'hidden', backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                      <span style={{ flex:2 }}>Role & Company</span>
                      <span style={{ flex:1, textAlign:'center' }}>Category</span>
                      <span style={{ flex:1, textAlign:'center' }}>Score</span>
                      <span style={{ flex:1, textAlign:'center' }}>Grade</span>
                      <span style={{ flex:1, textAlign:'right' }}>Date</span>
                    </div>
                    {attempts.slice(0,3).map((a,i) => {
                      const sc = getScoreStyle(a.totalScore);
                      const gc = a.grade==='A'?'#22c55e':a.grade==='B'?'#6366f1':a.grade==='C'?'#f59e0b':'#ef4444';
                      return (
                        <div key={a._id} className="row-hover"
                          onClick={() => navigate(`/results/${a._id}`,{ state:{ attempt:a } })}
                          style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)', cursor:'pointer', borderLeft:'2px solid transparent', transition:'all 0.15s' }}>
                          <div style={{ flex:2, display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>
                              {a.company?.charAt(0)}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.role}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{a.company}</div>
                            </div>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:9, padding:'2px 7px', background:'rgba(255,255,255,0.05)', borderRadius:5, color:'rgba(255,255,255,0.35)' }}>{a.category}</span>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:7, color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{a.totalScore}%</span>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:13, fontWeight:800, color:gc }}>{a.grade||'—'}</span>
                          </div>
                          <div style={{ flex:1, textAlign:'right', fontSize:10, color:'rgba(255,255,255,0.2)' }}>
                            {new Date(a.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MY ATTEMPTS ── */}
            {activeNav === 'My Attempts' && (
              <motion.div key="attempts" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>All Interview History</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Click any row to view full AI feedback</div>
                  </div>
                  {attempts.length > 0 && (
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 11px', background:'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20 }}>
                      {attempts.length} total
                    </span>
                  )}
                </div>
                {loading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:'44px' }}>
                    <div style={{ width:32, height:32, border:'2px solid rgba(99,102,241,0.25)', borderTop:'2px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  </div>
                ) : attempts.length === 0 ? (
                  <div style={{ background:'rgba(17,24,39,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'44px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>No attempts yet</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:18 }}>Complete your first interview to see history here</div>
                    <button onClick={() => setActiveNav('Dashboard')}
                      style={{ padding:'10px 22px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none' }}>
                      Start Practicing →
                    </button>
                  </div>
                ) : (
                  <div style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, overflow:'hidden', backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                      <span style={{ flex:2 }}>Role & Company</span>
                      <span style={{ flex:1, textAlign:'center' }}>Category</span>
                      <span style={{ flex:1, textAlign:'center' }}>Score</span>
                      <span style={{ flex:1, textAlign:'center' }}>Grade</span>
                      <span style={{ flex:1, textAlign:'right' }}>Date</span>
                    </div>
                    {attempts.map((a,i) => {
                      const sc = getScoreStyle(a.totalScore);
                      const gc = a.grade==='A'?'#22c55e':a.grade==='B'?'#6366f1':a.grade==='C'?'#f59e0b':'#ef4444';
                      return (
                        <motion.div key={a._id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                          className="row-hover"
                          onClick={() => navigate(`/results/${a._id}`,{ state:{ attempt:a } })}
                          style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)', cursor:'pointer', borderLeft:'2px solid transparent', transition:'all 0.15s' }}>
                          <div style={{ flex:2, display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>
                              {a.company?.charAt(0)}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.role}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{a.company}</div>
                            </div>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:9, padding:'2px 7px', background:'rgba(255,255,255,0.05)', borderRadius:5, color:'rgba(255,255,255,0.35)' }}>{a.category}</span>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:7, color:sc.color, background:sc.bg, border:`1px solid ${sc.border}` }}>{a.totalScore}%</span>
                          </div>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <span style={{ fontSize:13, fontWeight:800, color:gc }}>{a.grade||'—'}</span>
                          </div>
                          <div style={{ flex:1, textAlign:'right', fontSize:10, color:'rgba(255,255,255,0.2)' }}>
                            {new Date(a.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ANALYTICS ── */}
            {activeNav === 'Analytics' && (
              <motion.div key="analytics" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {attempts.length === 0 ? (
                  <div style={{ background:'rgba(17,24,39,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'44px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>No data yet</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:18 }}>Complete interviews to see analytics</div>
                    <button onClick={() => setActiveNav('Dashboard')}
                      style={{ padding:'10px 22px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none' }}>
                      Start Practicing →
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.div variants={stagger} initial="hidden" animate="show"
                      style={{
  display:'grid',
  gridTemplateColumns: isMobile
    ? 'repeat(2,1fr)'
    : 'repeat(4,1fr)',
  gap:12,
  marginBottom:16
}}>
                      {[
                        { label:'Total',     value:attempts.length, suffix:'',  icon:'📝', color:'#6366f1' },
                        { label:'Average',   value:avgScore,        suffix:'%', icon:'📊', color:'#10b981' },
                        { label:'Best',      value:bestScore,       suffix:'%', icon:'🏆', color:'#f59e0b' },
                        { label:'Pass Rate', value:passRate,        suffix:'%', icon:'✅', color:'#06b6d4' },
                      ].map(({ label, value, suffix, icon, color }) => (
                        <motion.div key={label} variants={fadeUp} className="card-hover"
                          style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
                          <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at top right,${color}12,transparent 60%)`, pointerEvents:'none' }} />
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, position:'relative' }}>
                            <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                            <span style={{ fontSize:17 }}>{icon}</span>
                          </div>
                          <div style={{ fontSize:26, fontWeight:900, color, lineHeight:1, position:'relative' }}>
                            <AnimatedCounter to={value} suffix={suffix} />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <div style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'18px', marginBottom:12, backdropFilter:'blur(12px)' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>📈 Score by Category</div>
                      {['Full Stack','Frontend','Backend','HR','Sales'].map(cat => {
                        const ca = attempts.filter(a=>a.category===cat);
                        if (!ca.length) return null;
                        const avg = Math.round(ca.reduce((s,a)=>s+a.totalScore,0)/ca.length);
                        const col = avg>=70?'#22c55e':avg>=50?'#6366f1':'#f59e0b';
                        return (
                          <div key={cat} style={{ marginBottom:13 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                              <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{cat}</span>
                              <span style={{ fontSize:11, fontWeight:700, color:col }}>{avg}% · {ca.length}</span>
                            </div>
                            <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden' }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${avg}%` }} transition={{ duration:1, ease:'easeOut', delay:0.2 }}
                                style={{ height:'100%', background:col, borderRadius:99, boxShadow:`0 0 8px ${col}50` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'18px', backdropFilter:'blur(12px)' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>🎓 Grade Distribution</div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {['A','B','C','D','F'].map(g => {
                          const n = attempts.filter(a=>a.grade===g).length;
                          const col = g==='A'?'#22c55e':g==='B'?'#6366f1':g==='C'?'#f59e0b':'#ef4444';
                          const bg  = g==='A'?'rgba(34,197,94,0.08)':g==='B'?'rgba(99,102,241,0.08)':g==='C'?'rgba(245,158,11,0.08)':'rgba(239,68,68,0.08)';
                          return (
                            <div key={g} style={{ flex:1, minWidth:52, textAlign:'center', background:bg, borderRadius:11, padding:'13px 6px', border:`1px solid ${col}20` }}>
                              <div style={{ fontSize:19, fontWeight:900, color:col }}>{g}</div>
                              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>{n}</div>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', marginTop:2 }}>attempt{n!==1?'s':''}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeNav === 'Settings' && (
              <motion.div key="settings" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ maxWidth:460, display:'flex', flexDirection:'column', gap:11 }}>
                {[
                  {
                    title:'Profile',
                    content: (
                      <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                        <div style={{ width:50, height:50, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20 }}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{user?.name}</div>
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{user?.email}</div>
                        </div>
                      </div>
                    )
                  },
                  {
                    title:'Your Progress',
                    content: (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                        {[
                          { l:'Interviews', v:attempts.length   },
                          { l:'Avg Score',  v:`${avgScore}%`   },
                          { l:'Best Score', v:`${bestScore}%`  },
                          { l:'Pass Rate',  v:`${passRate}%`   },
                        ].map(({ l, v }) => (
                          <div key={l} style={{ background:'rgba(255,255,255,0.03)', borderRadius:11, padding:'11px 13px', border:'1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginBottom:3 }}>{l}</div>
                            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    title:'Account',
                    content: (
                      <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                        onClick={() => { logout(); navigate('/'); }}
                        style={{ width:'100%', padding:'11px', background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.18)', borderRadius:11, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Sign out of MockPrep
                      </motion.button>
                    )
                  },
                ].map(({ title, content }) => (
                  <div key={title} style={{ background:'rgba(17,24,39,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'18px', backdropFilter:'blur(12px)' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:13 }}>{title}</div>
                    {content}
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.04)', textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.1)' }}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong style={{ color:'rgba(255,255,255,0.18)' }}>Dheeraj Kumar</strong>
        </div>
      </motion.div>
    </div>
  );
}

const scaleIn = {
  hidden: { opacity:0, scale:0.96 },
  show:   { opacity:1, scale:1, transition:{ duration:0.35, ease:'easeOut' } },
};