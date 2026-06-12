import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAttempts } from '../services/api';
import AnimatedCounter from '../components/shared/AnimatedCounter';

// ── Constants ────────────────────────────────────────────────────
const INTERVIEWS = [
  { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', emoji:'💻', color:'#3b82f6', glow:'rgba(59,130,246,0.15)',  tag:'#1d4ed8', difficulty:'Medium', duration:'20 min' },
  { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', emoji:'⚛️', color:'#8b5cf6', glow:'rgba(139,92,246,0.15)',   tag:'#6d28d9', difficulty:'Medium', duration:'20 min' },
  { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    emoji:'🔧', color:'#10b981', glow:'rgba(16,185,129,0.15)',   tag:'#047857', difficulty:'Easy',   duration:'15 min' },
  { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   emoji:'🎨', color:'#f59e0b', glow:'rgba(245,158,11,0.15)',   tag:'#b45309', difficulty:'Easy',   duration:'15 min' },
  { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', emoji:'☕', color:'#ef4444', glow:'rgba(239,68,68,0.15)',    tag:'#b91c1c', difficulty:'Hard',   duration:'25 min' },
  { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    emoji:'🐍', color:'#06b6d4', glow:'rgba(6,182,212,0.15)',    tag:'#0e7490', difficulty:'Medium', duration:'20 min' },
  { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         emoji:'🤝', color:'#ec4899', glow:'rgba(236,72,153,0.15)',   tag:'#be185d', difficulty:'Easy',   duration:'15 min' },
  { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      emoji:'📈', color:'#f97316', glow:'rgba(249,115,22,0.15)',   tag:'#c2410c', difficulty:'Medium', duration:'20 min' },
];

const CATEGORIES = ['All','Full Stack','Frontend','Backend','HR','Sales'];

const NAV_ITEMS = [
  { icon:'🏠', label:'Dashboard'   },
  { icon:'📋', label:'My Attempts' },
  { icon:'📊', label:'Analytics'   },
  { icon:'⚙️', label:'Settings'    },
];

// ── Animation variants ───────────────────────────────────────────
const fadeUp = {
  hidden: { opacity:0, y:20 },
  show:   { opacity:1, y:0, transition:{ duration:0.5, ease:[0.25,0.46,0.45,0.94] } },
};
const staggerContainer = {
  hidden: {},
  show:   { transition:{ staggerChildren:0.08, delayChildren:0.1 } },
};
const scaleIn = {
  hidden: { opacity:0, scale:0.95 },
  show:   { opacity:1, scale:1, transition:{ duration:0.4, ease:'easeOut' } },
};

// ── Helper ───────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 70) return { text:'#22c55e', bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.2)'  };
  if (score >= 50) return { text:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)' };
  return             { text:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.2)'   };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDifficultyColor(d) {
  if (d === 'Easy')   return { text:'#22c55e', bg:'rgba(34,197,94,0.1)'  };
  if (d === 'Hard')   return { text:'#ef4444', bg:'rgba(239,68,68,0.1)'  };
  return                     { text:'#f59e0b', bg:'rgba(245,158,11,0.1)' };
}

// ── Sub-components ───────────────────────────────────────────────
function StatCard({ label, value, suffix='', icon, color, delay=0 }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{ y:-3, transition:{ duration:0.2 } }}
      style={{
        background:'rgba(17,24,39,0.8)',
        border:'1px solid rgba(255,255,255,0.06)',
        borderRadius:16,
        padding:'20px',
        backdropFilter:'blur(16px)',
        position:'relative',
        overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at top right, ${color}15, transparent 60%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, position:'relative' }}>
        <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {label}
        </span>
        <div style={{ width:32, height:32, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize:28, fontWeight:900, color, position:'relative', lineHeight:1 }}>
        <AnimatedCounter to={value} suffix={suffix} />
      </div>
    </motion.div>
  );
}

function InterviewCard({ iv, navigate, hoveredCard, setHoveredCard }) {
  const isHovered = hoveredCard === iv.id;
  const diff      = getDifficultyColor(iv.difficulty);

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y:-6, transition:{ duration:0.25, ease:'easeOut' } }}
      onMouseEnter={() => setHoveredCard(iv.id)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{
        background:'rgba(17,24,39,0.9)',
        border:`1px solid ${isHovered ? iv.color + '40' : 'rgba(255,255,255,0.06)'}`,
        borderRadius:20,
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        cursor:'pointer',
        transition:'border-color 0.25s ease',
        boxShadow: isHovered ? `0 20px 40px ${iv.glow}, 0 0 0 1px ${iv.color}30` : '0 2px 8px rgba(0,0,0,0.3)',
        backdropFilter:'blur(16px)',
        position:'relative',
      }}
    >
      {/* Top gradient bar */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${iv.color}, ${iv.color}80)` }} />

      {/* Glow on hover */}
      <div style={{
        position:'absolute', inset:0,
        background:`radial-gradient(circle at top left, ${iv.glow}, transparent 60%)`,
        opacity: isHovered ? 1 : 0,
        transition:'opacity 0.3s ease',
        pointerEvents:'none',
      }} />

      {/* Card content */}
      <div style={{ padding:'20px', flex:1, position:'relative' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{
            width:44, height:44, borderRadius:12,
            background:`${iv.color}15`, border:`1px solid ${iv.color}30`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>
            {iv.emoji}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6,
              background: diff.bg, color: diff.text,
            }}>
              {iv.difficulty}
            </span>
            <span style={{
              fontSize:9, fontWeight:600, padding:'2px 6px', borderRadius:5,
              background:'rgba(99,102,241,0.1)', color:'#818cf8',
              display:'flex', alignItems:'center', gap:3,
            }}>
              ✨ AI Powered
            </span>
          </div>
        </div>

        {/* Company & role */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:3 }}>{iv.company}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{iv.role}</div>
        </div>

        {/* Meta */}
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', gap:4 }}>
            ⏱ {iv.duration}
          </span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', gap:4 }}>
            💬 8 Questions
          </span>
        </div>

        {/* Category badge */}
        <span style={{
          fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:6,
          background:`${iv.color}12`, color: iv.color,
          border:`1px solid ${iv.color}25`,
        }}>
          {iv.category}
        </span>
      </div>

      {/* CTA */}
      <div style={{ padding:'0 16px 16px', position:'relative' }}>
        <motion.button
          whileTap={{ scale:0.97 }}
          onClick={() => navigate(`/interview/${iv.id}`, { state: iv })}
          style={{
            width:'100%', padding:'10px',
            background: isHovered ? `linear-gradient(135deg, ${iv.color}, ${iv.color}cc)` : 'rgba(255,255,255,0.04)',
            color: isHovered ? '#fff' : iv.color,
            border:`1px solid ${isHovered ? 'transparent' : iv.color + '40'}`,
            borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer',
            transition:'all 0.25s ease',
            boxShadow: isHovered ? `0 4px 20px ${iv.glow}` : 'none',
          }}
        >
          {isHovered ? 'Start Interview →' : 'Start Interview'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ onStart }) {
  return (
    <motion.div
      variants={scaleIn}
      style={{
        background:'rgba(17,24,39,0.6)',
        border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:20, padding:'60px 24px', textAlign:'center',
        backdropFilter:'blur(16px)',
      }}
    >
      <div style={{ fontSize:56, marginBottom:16, filter:'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' }}>🎯</div>
      <div style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:8 }}>
        Begin your journey
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.35)', marginBottom:24, maxWidth:320, margin:'0 auto 24px', lineHeight:1.6 }}>
        Start your first mock interview and get personalized AI feedback to help you land your dream job.
      </div>
      <motion.button
        whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
        onClick={onStart}
        style={{
          padding:'12px 28px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color:'#fff', border:'none',
          boxShadow:'0 0 30px rgba(99,102,241,0.3)',
        }}
      >
        ✨ Start First Interview
      </motion.button>
    </motion.div>
  );
}

function AttemptRow({ a, i, navigate }) {
  const [hovered, setHovered] = useState(false);
  const sc = getScoreColor(a.totalScore);

  return (
    <motion.div
      initial={{ opacity:0, x:-10 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay: i * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/results/${a._id}`, { state:{ attempt:a } })}
      style={{
        display:'flex', alignItems:'center', padding:'13px 16px',
        borderBottom:'1px solid rgba(255,255,255,0.04)',
        background: hovered ? 'rgba(99,102,241,0.05)' : 'transparent',
        cursor:'pointer', transition:'background 0.15s',
        borderLeft:`2px solid ${hovered ? '#6366f1' : 'transparent'}`,
      }}
    >
      <div style={{ flex:2, display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color:'#fff', display:'flex', alignItems:'center',
          justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0,
        }}>
          {a.company?.charAt(0)}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {a.role}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{a.company}</div>
        </div>
      </div>
      <div style={{ flex:1, textAlign:'center' }}>
        <span style={{
          fontSize:10, padding:'2px 8px', background:'rgba(255,255,255,0.05)',
          borderRadius:6, color:'rgba(255,255,255,0.35)',
        }}>
          {a.category}
        </span>
      </div>
      <div style={{ flex:1, textAlign:'center' }}>
        <span style={{
          fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:8,
          color: sc.text, background: sc.bg, border:`1px solid ${sc.border}`,
        }}>
          {a.totalScore}%
        </span>
      </div>
      <div style={{ flex:1, textAlign:'center' }}>
        <span style={{
          fontSize:13, fontWeight:800,
          color: a.grade==='A'?'#22c55e':a.grade==='B'?'#6366f1':a.grade==='C'?'#f59e0b':'#ef4444',
        }}>
          {a.grade || '—'}
        </span>
      </div>
      <div style={{ flex:1, textAlign:'right', fontSize:11, color:'rgba(255,255,255,0.2)' }}>
        {new Date(a.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────
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
  const [hoveredNav,   setHoveredNav]   = useState(null);
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
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('touchstart', fn);
    };
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
    const ms = !search ||
      iv.company.toLowerCase().includes(search.toLowerCase()) ||
      iv.role.toLowerCase().includes(search.toLowerCase()) ||
      iv.category.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const avgScore  = attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.totalScore,0)/attempts.length) : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map(a=>a.totalScore)) : 0;
  const passRate  = attempts.length ? Math.round(attempts.filter(a=>a.totalScore>=60).length/attempts.length*100) : 0;

  // AI readiness score — based on attempts and avg score
  const readinessScore = attempts.length === 0 ? 0
    : Math.min(100, Math.round((avgScore * 0.6) + (Math.min(attempts.length, 10) * 4)));

  // Strongest category
  const strongestCat = (() => {
    if (!attempts.length) return null;
    const cats = ['Full Stack','Frontend','Backend','HR','Sales'];
    let best = null, bestAvg = 0;
    cats.forEach(cat => {
      const ca = attempts.filter(a => a.category === cat);
      if (!ca.length) return;
      const avg = ca.reduce((s,a) => s+a.totalScore,0)/ca.length;
      if (avg > bestAvg) { bestAvg = avg; best = cat; }
    });
    return best;
  })();

  // Weakest category
  const weakestCat = (() => {
    if (!attempts.length) return null;
    const cats = ['Full Stack','Frontend','Backend','HR','Sales'];
    let worst = null, worstAvg = 101;
    cats.forEach(cat => {
      const ca = attempts.filter(a => a.category === cat);
      if (!ca.length) return;
      const avg = ca.reduce((s,a) => s+a.totalScore,0)/ca.length;
      if (avg < worstAvg) { worstAvg = avg; worst = cat; }
    });
    return worst;
  })();

  const sideW  = isMobile ? 240 : sideExpanded ? 220 : 64;
  const mainML = isMobile ? 0   : sideW;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f172a', color:'#fff', fontFamily:'Inter, Plus Jakarta Sans, system-ui, sans-serif', overflowX:'hidden' }}>

      {/* ── Overlay ── */}
      <AnimatePresence>
        {isMobile && sideOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setSideOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:40 }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        ref={sidebarRef}
        animate={{ width:sideW, x: isMobile && !sideOpen ? -sideW : 0 }}
        transition={{ duration:0.3, ease:[0.4,0,0.2,1] }}
        style={{
          position:'fixed', top:0, left:0, height:'100vh', zIndex:50,
          background:'rgba(9,14,26,0.95)', backdropFilter:'blur(24px)',
          borderRight:'1px solid rgba(255,255,255,0.05)',
          display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0,
        }}
      >
        {/* Brand */}
        <div style={{ padding:'18px 14px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            boxShadow:'0 0 16px rgba(99,102,241,0.4)',
          }}>
            🧠
          </div>
          <AnimatePresence>
            {(sideExpanded || isMobile) && (
              <motion.span
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}
                style={{ fontWeight:800, fontSize:15, whiteSpace:'nowrap', letterSpacing:'-0.02em' }}
              >
                MockPrep
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {NAV_ITEMS.map(({ icon, label }) => {
            const isActive = activeNav === label;
            const isHov    = hoveredNav === label;
            return (
              <motion.div
                key={label}
                whileHover={{ x:2 }}
                onClick={() => { setActiveNav(label); if (isMobile) setSideOpen(false); }}
                onMouseEnter={() => setHoveredNav(label)}
                onMouseLeave={() => setHoveredNav(null)}
                title={label}
                style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding:'10px 12px', borderRadius:12, cursor:'pointer',
                  marginBottom:2, transition:'all 0.15s',
                  background: isActive ? 'rgba(99,102,241,0.15)' : isHov ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border:`1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                  color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                }}
              >
                <span style={{ fontSize:17, minWidth:20, textAlign:'center', flexShrink:0 }}>{icon}</span>
                <AnimatePresence>
                  {(sideExpanded || isMobile) && (
                    <motion.span
                      initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                      style={{ fontSize:13, fontWeight:isActive?600:500, whiteSpace:'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12 }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:700, fontSize:13,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {(sideExpanded || isMobile) && (
                <motion.div
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                  style={{ overflow:'hidden', flex:1 }}
                >
                  <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.name}
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    style={{ background:'none', border:'none', color:'rgba(239,68,68,0.6)', fontSize:11, cursor:'pointer', padding:0, marginTop:2, transition:'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color='#ef4444'}
                    onMouseLeave={e => e.target.style.color='rgba(239,68,68,0.6)'}
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <motion.div
        animate={{ marginLeft: mainML }}
        transition={{ duration:0.3, ease:[0.4,0,0.2,1] }}
        style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflowX:'hidden' }}
      >

        {/* ── Topbar ── */}
        <div style={{
          position:'sticky', top:0, zIndex:30, display:'flex', alignItems:'center',
          gap:12, padding:'12px 16px md:24px',
          background:'rgba(9,14,26,0.85)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,0.04)',
        }}>
          {/* Hamburger */}
          <button
            onClick={() => isMobile ? setSideOpen(o=>!o) : setSideExpanded(o=>!o)}
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'8px', cursor:'pointer', display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}
          >
            {[0,1,2].map(i => (
              <div key={i} style={{ width: i===1?14:18, height:2, background:'rgba(255,255,255,0.5)', borderRadius:2 }} />
            ))}
          </button>

          {/* Title */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.2 }}>
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

          {/* Search — dashboard only */}
          {activeNav === 'Dashboard' && (
            <div style={{
              display:'flex', alignItems:'center', gap:8, flex:1, maxWidth:280,
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:12, padding:'8px 14px', transition:'border-color 0.2s',
            }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>🔍</span>
              <input
                style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:12, color:'#fff' }}
                placeholder="Search roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, padding:0 }}>×</button>
              )}
            </div>
          )}

          {/* Avatar */}
          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* ── Page Content ── */}
        <div style={{ flex:1, padding:'20px 16px', overflowX:'hidden' }}>
          <AnimatePresence mode="wait">

            {/* ══════════ DASHBOARD ══════════ */}
            {activeNav === 'Dashboard' && (
              <motion.div key="dashboard" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>

                {/* ── Hero Section ── */}
                <motion.div
                  variants={staggerContainer} initial="hidden" animate="show"
                  style={{ marginBottom:24 }}
                >
                  {/* Hero banner */}
                  <motion.div
                    variants={fadeUp}
                    style={{
                      background:'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                      border:'1px solid rgba(99,102,241,0.2)',
                      borderRadius:20, padding:'24px', marginBottom:16,
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, background:'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', borderRadius:'50%', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:-30, left:-10, width:100, height:100, background:'radial-gradient(circle, rgba(139,92,246,0.15), transparent)', borderRadius:'50%', pointerEvents:'none' }} />

                    <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' }}>
                            ✨ AI-Powered Platform
                          </span>
                        </div>
                        <h2 style={{ fontSize:22, fontWeight:900, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.02em' }}>
                          {attempts.length === 0 ? 'Ready to start your journey?' : 'Keep pushing, you\'re doing great!'}
                        </h2>
                        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', margin:0, maxWidth:400 }}>
                          {attempts.length === 0
                            ? 'Complete mock interviews with real AI evaluation. Practice with top companies.'
                            : `${attempts.length} interviews done · ${avgScore}% average · ${passRate}% pass rate`}
                        </p>
                      </div>

                      {/* Readiness score */}
                      <div style={{
                        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:16, padding:'16px 20px', textAlign:'center', minWidth:130,
                      }}>
                        <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
                          AI Readiness
                        </div>
                        <div style={{ fontSize:32, fontWeight:900, background:'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>
                          <AnimatedCounter to={readinessScore} suffix="%" />
                        </div>
                        <div style={{ marginTop:8, height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                          <motion.div
                            initial={{ width:0 }}
                            animate={{ width:`${readinessScore}%` }}
                            transition={{ duration:1.5, ease:'easeOut', delay:0.5 }}
                            style={{ height:'100%', background:'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius:4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Stats row */}
                  {attempts.length > 0 && (
                    <motion.div
                      variants={staggerContainer}
                      style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:16 }}
                    >
                      <StatCard label="Interviews"  value={attempts.length} suffix=""  icon="📝" color="#6366f1" />
                      <StatCard label="Avg Score"   value={avgScore}        suffix="%" icon="📊" color="#10b981" delay={0.05} />
                      <StatCard label="Best Score"  value={bestScore}       suffix="%" icon="🏆" color="#f59e0b" delay={0.1} />
                      <StatCard label="Pass Rate"   value={passRate}        suffix="%" icon="✅" color="#06b6d4" delay={0.15} />
                    </motion.div>
                  )}

                  {/* AI Insights panel */}
                  {attempts.length > 0 && (
                    <motion.div
                      variants={fadeUp}
                      style={{
                        background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)',
                        borderRadius:16, padding:'16px 20px', marginBottom:0,
                        display:'flex', flexWrap:'wrap', gap:16, alignItems:'center',
                        backdropFilter:'blur(16px)',
                      }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:200 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg, #6366f1, #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                          🤖
                        </div>
                        <div>
                          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>AI Insight</div>
                          <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
                            {avgScore >= 70
                              ? 'Great performance! Focus on maintaining consistency.'
                              : avgScore >= 50
                              ? 'Good progress! Practice more to improve weak areas.'
                              : 'Keep practicing — consistency is key for freshers.'}
                          </div>
                        </div>
                      </div>
                      {strongestCat && (
                        <div style={{ display:'flex', gap:8 }}>
                          <div style={{ textAlign:'center', padding:'8px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:10 }}>
                            <div style={{ fontSize:10, color:'rgba(34,197,94,0.6)', marginBottom:2 }}>Strongest</div>
                            <div style={{ fontSize:12, fontWeight:700, color:'#22c55e' }}>{strongestCat}</div>
                          </div>
                          {weakestCat && weakestCat !== strongestCat && (
                            <div style={{ textAlign:'center', padding:'8px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10 }}>
                              <div style={{ fontSize:10, color:'rgba(239,68,68,0.6)', marginBottom:2 }}>Focus on</div>
                              <div style={{ fontSize:12, fontWeight:700, color:'#ef4444' }}>{weakestCat}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* ── Interview Prep Section ── */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>Interview Prep</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Choose a company and role to begin</div>
                    </div>
                    {attempts.length > 0 && (
                      <button
                        onClick={() => setActiveNav('My Attempts')}
                        style={{ fontSize:11, fontWeight:600, color:'#a5b4fc', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'5px 12px', cursor:'pointer' }}
                      >
                        View History →
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                    {CATEGORIES.map(c => (
                      <motion.button
                        key={c}
                        whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                        onClick={() => setFilter(c)}
                        style={{
                          padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:600,
                          cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                          background: filter===c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                          color:       filter===c ? '#a5b4fc'              : 'rgba(255,255,255,0.35)',
                          borderColor: filter===c ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>

                  {/* Cards or empty */}
                  {filtered.length === 0 ? (
                    <motion.div variants={scaleIn} initial="hidden" animate="show"
                      style={{ textAlign:'center', padding:'40px 20px', background:'rgba(17,24,39,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16 }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                      <div style={{ fontWeight:600, color:'#fff', marginBottom:6 }}>No results found</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:16 }}>Try a different search or filter</div>
                      <button onClick={() => { setSearch(''); setFilter('All'); }}
                        style={{ padding:'8px 20px', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        Clear filters
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={staggerContainer} initial="hidden" animate="show"
                      style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:14 }}
                    >
                      {filtered.map(iv => (
                        <InterviewCard
                          key={iv.id} iv={iv} navigate={navigate}
                          hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* ── Recent Attempts ── */}
                <div style={{ marginTop:28 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Recent Attempts</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Your latest sessions</div>
                    </div>
                    {attempts.length > 3 && (
                      <button onClick={() => setActiveNav('My Attempts')}
                        style={{ fontSize:11, fontWeight:600, color:'#a5b4fc', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'5px 12px', cursor:'pointer' }}>
                        View all →
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div style={{ display:'flex', justifyContent:'center', padding:'32px' }}>
                      <div style={{ width:32, height:32, border:'2px solid rgba(99,102,241,0.3)', borderTop:'2px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                    </div>
                  ) : attempts.length === 0 ? (
                    <EmptyState onStart={() => document.getElementById('interview-cards')?.scrollIntoView({ behavior:'smooth' })} />
                  ) : (
                    <div style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, overflow:'hidden', backdropFilter:'blur(16px)' }}>
                      <div style={{ display:'flex', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                        <span style={{ flex:2 }}>Role & Company</span>
                        <span style={{ flex:1, textAlign:'center' }}>Category</span>
                        <span style={{ flex:1, textAlign:'center' }}>Score</span>
                        <span style={{ flex:1, textAlign:'center' }}>Grade</span>
                        <span style={{ flex:1, textAlign:'right' }}>Date</span>
                      </div>
                      {attempts.slice(0, 3).map((a, i) => (
                        <AttemptRow key={a._id} a={a} i={i} navigate={navigate} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════ MY ATTEMPTS ══════════ */}
            {activeNav === 'My Attempts' && (
              <motion.div key="attempts" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>All Interview History</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Click any row to view full AI feedback</div>
                  </div>
                  {attempts.length > 0 && (
                    <span style={{ fontSize:11, fontWeight:600, padding:'4px 12px', background:'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20 }}>
                      {attempts.length} total
                    </span>
                  )}
                </div>

                {loading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}>
                    <div style={{ width:36, height:36, border:'2px solid rgba(99,102,241,0.3)', borderTop:'2px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  </div>
                ) : attempts.length === 0 ? (
                  <EmptyState onStart={() => setActiveNav('Dashboard')} />
                ) : (
                  <div style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, overflow:'hidden', backdropFilter:'blur(16px)' }}>
                    <div style={{ display:'flex', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                      <span style={{ flex:2 }}>Role & Company</span>
                      <span style={{ flex:1, textAlign:'center' }}>Category</span>
                      <span style={{ flex:1, textAlign:'center' }}>Score</span>
                      <span style={{ flex:1, textAlign:'center' }}>Grade</span>
                      <span style={{ flex:1, textAlign:'right' }}>Date</span>
                    </div>
                    {attempts.map((a, i) => (
                      <AttemptRow key={a._id} a={a} i={i} navigate={navigate} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════ ANALYTICS ══════════ */}
            {activeNav === 'Analytics' && (
              <motion.div key="analytics" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                {attempts.length === 0 ? (
                  <EmptyState onStart={() => setActiveNav('Dashboard')} />
                ) : (
                  <>
                    <motion.div
                      variants={staggerContainer} initial="hidden" animate="show"
                      style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:20 }}
                    >
                      <StatCard label="Total"     value={attempts.length} suffix=""  icon="📝" color="#6366f1" />
                      <StatCard label="Average"   value={avgScore}        suffix="%" icon="📊" color="#10b981" delay={0.05} />
                      <StatCard label="Best"      value={bestScore}       suffix="%" icon="🏆" color="#f59e0b" delay={0.1} />
                      <StatCard label="Pass Rate" value={passRate}        suffix="%" icon="✅" color="#06b6d4" delay={0.15} />
                    </motion.div>

                    {/* Category bars */}
                    <motion.div
                      variants={fadeUp} initial="hidden" animate="show"
                      style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', marginBottom:14, backdropFilter:'blur(16px)' }}
                    >
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                        📊 Score by Category
                      </div>
                      {['Full Stack','Frontend','Backend','HR','Sales'].map(cat => {
                        const ca  = attempts.filter(a => a.category === cat);
                        if (!ca.length) return null;
                        const avg = Math.round(ca.reduce((s,a)=>s+a.totalScore,0)/ca.length);
                        const col = avg>=70?'#22c55e':avg>=50?'#6366f1':'#f59e0b';
                        return (
                          <div key={cat} style={{ marginBottom:14 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                              <span style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.55)' }}>{cat}</span>
                              <span style={{ fontSize:11, fontWeight:700, color:col }}>
                                {avg}% · {ca.length} attempt{ca.length>1?'s':''}
                              </span>
                            </div>
                            <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden' }}>
                              <motion.div
                                initial={{ width:0 }} animate={{ width:`${avg}%` }}
                                transition={{ duration:1, ease:'easeOut', delay:0.2 }}
                                style={{ height:'100%', background:col, borderRadius:99, boxShadow:`0 0 8px ${col}60` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>

                    {/* Grade distribution */}
                    <motion.div
                      variants={fadeUp} initial="hidden" animate="show" transition={{ delay:0.1 }}
                      style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', backdropFilter:'blur(16px)' }}
                    >
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:16 }}>🎓 Grade Distribution</div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {['A','B','C','D','F'].map(g => {
                          const n   = attempts.filter(a=>a.grade===g).length;
                          const col = g==='A'?'#22c55e':g==='B'?'#6366f1':g==='C'?'#f59e0b':'#ef4444';
                          const bg  = g==='A'?'rgba(34,197,94,0.08)':g==='B'?'rgba(99,102,241,0.08)':g==='C'?'rgba(245,158,11,0.08)':'rgba(239,68,68,0.08)';
                          return (
                            <div key={g} style={{ flex:1, minWidth:56, textAlign:'center', background:bg, borderRadius:12, padding:'14px 8px', border:`1px solid ${col}25` }}>
                              <div style={{ fontSize:20, fontWeight:900, color:col }}>{g}</div>
                              <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{n}</div>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:2 }}>attempt{n!==1?'s':''}</div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══════════ SETTINGS ══════════ */}
            {activeNav === 'Settings' && (
              <motion.div key="settings" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}
                style={{ maxWidth:480, display:'flex', flexDirection:'column', gap:12 }}>
                {/* Profile */}
                <motion.div variants={fadeUp} initial="hidden" animate="show"
                  style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', backdropFilter:'blur(16px)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Profile</div>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg, #6366f1, #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20 }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{user?.name}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{user?.email}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Progress */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay:0.05 }}
                  style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', backdropFilter:'blur(16px)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Your Progress</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:'Interviews', value:attempts.length   },
                      { label:'Avg Score',  value:`${avgScore}%`   },
                      { label:'Best Score', value:`${bestScore}%`  },
                      { label:'Pass Rate',  value:`${passRate}%`   },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Sign out */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay:0.1 }}
                  style={{ background:'rgba(17,24,39,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', backdropFilter:'blur(16px)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Account</div>
                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    onClick={() => { logout(); navigate('/'); }}
                    style={{ width:'100%', padding:'12px', background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer' }}
                  >
                    Sign out of MockPrep
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.04)', textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.12)' }}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong style={{ color:'rgba(255,255,255,0.2)' }}>Dheeraj Kumar</strong>
        </div>
      </motion.div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}