import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAttempts } from '../services/api';

// ── CSS ────────────────────────────────────────────────────────────
const globalCSS = `
  * { box-sizing: border-box; }
  body { overflow-x: hidden; margin: 0; }

  .db-root { display: flex; min-height: 100vh; background: #f0f2f5;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; }

  .db-sidebar {
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 300;
    background: #0f172a; display: flex; flex-direction: column;
    transition: transform 0.32s cubic-bezier(.4,0,.2,1), width 0.32s cubic-bezier(.4,0,.2,1);
    overflow: hidden; flex-shrink: 0;
  }

  @media (min-width: 769px) {
    .db-sidebar { position: fixed; transform: translateX(0) !important; }
    .db-sidebar.icon-only { width: 64px; }
    .db-sidebar.expanded  { width: 220px; }
    .db-main { transition: margin-left 0.32s cubic-bezier(.4,0,.2,1); }
    .db-main.sidebar-icon { margin-left: 64px; }
    .db-main.sidebar-full { margin-left: 220px; }
  }

  @media (max-width: 768px) {
    .db-sidebar { width: 240px !important; transform: translateX(-100%); }
    .db-sidebar.mobile-open { transform: translateX(0) !important; }
    .db-main { margin-left: 0 !important; }
    .db-overlay { display: block !important; }
  }

  .db-overlay {
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    z-index: 299; backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

  .db-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
  @media (max-width: 1024px) { .db-stats { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 480px)  { .db-stats { grid-template-columns: repeat(2,1fr); gap: 10px; } }

  .db-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  @media (max-width: 1200px) { .db-cards { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 900px)  { .db-cards { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 500px)  { .db-cards { grid-template-columns: 1fr; } }

  .db-attempt-row { display: flex; align-items: center; padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; }
  .db-attempt-row:hover { background: #f0f9ff; }
  .db-attempt-row:last-child { border-bottom: none; }
  .db-col-main  { flex: 2; display: flex; align-items: center; gap: 10px; min-width: 0; }
  .db-col-cat   { flex: 1; text-align: center; }
  .db-col-score { flex: 1; text-align: center; }
  .db-col-date  { flex: 1; text-align: right; font-size: 12px; color: #94a3b8; }
  @media (max-width: 600px) {
    .db-col-cat  { display: none; }
    .db-col-date { display: none; }
    .db-col-score { flex: 0 0 60px; }
  }

  .db-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .db-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important; }

  .db-nav-item { display: flex; align-items: center; gap: 12px;
    padding: 11px 16px; color: #94a3b8; cursor: pointer;
    transition: background 0.15s, color 0.15s; border-left: 3px solid transparent;
    white-space: nowrap; }
  .db-nav-item:hover { background: #1e293b; color: #e2e8f0; }
  .db-nav-item.active { background: #1e3a5f; color: #fff; border-left-color: #3b82f6; }

  .db-main { flex: 1; min-width: 0; padding: 0; overflow-x: hidden; }

  .db-topbar { display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; background: #fff; border-bottom: 1px solid #e8eaed;
    position: sticky; top: 0; z-index: 100; gap: 12px; }
  @media (max-width: 600px) { .db-topbar { padding: 12px 14px; } }

  .db-search { display: flex; align-items: center; gap: 8px;
    background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 8px 14px; flex: 1; max-width: 280px; transition: border-color 0.2s; }
  .db-search:focus-within { border-color: #3b82f6; }
  .db-search input { border: none; background: transparent; outline: none;
    font-size: 13px; color: #334155; width: 100%; }
  @media (max-width: 500px) { .db-search { max-width: 160px; } }

  .db-content { padding: 22px 24px; }
  @media (max-width: 600px) { .db-content { padding: 14px; } }

  .db-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }

  .db-section-header { display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }

  .db-main::-webkit-scrollbar { width: 4px; }
  .db-main::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
`;

// ── CONSTANTS ─────────────────────────────────────────────────────
const INTERVIEWS = [
  { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', icon:'💻', color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
  { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', icon:'⚛️', color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe' },
  { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    icon:'🔧', color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0' },
  { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   icon:'🎨', color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
  { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', icon:'☕', color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
  { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    icon:'🐍', color:'#06b6d4', bg:'#ecfeff', border:'#a5f3fc' },
  { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         icon:'🤝', color:'#ec4899', bg:'#fdf2f8', border:'#fbcfe8' },
  { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      icon:'📈', color:'#f97316', bg:'#fff7ed', border:'#fed7aa' },
];

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'HR', 'Sales'];

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard'   },
  { icon: '📋', label: 'My Attempts' },
  { icon: '📊', label: 'Analytics'   },
  { icon: '⚙️', label: 'Settings'    },
];

// ── HELPER: score colors ──────────────────────────────────────────
function scoreColor(score) {
  return score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
}
function scoreBg(score) {
  return score >= 70 ? '#dcfce7' : score >= 50 ? '#fef9c3' : '#fee2e2';
}

// ── ATTEMPT ROW FULL (My Attempts view) ──────────────────────────
function AttemptRowFull({ a, i, navigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="db-attempt-row"
      style={{
        background: hovered ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
        borderLeft: hovered ? '3px solid #3b82f6' : '3px solid transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/results/${a._id}`, { state: { attempt: a } })}
    >
      <div className="db-col-main">
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: '700', flexShrink: 0,
        }}>
          {a.company?.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '600' }}>{a.role}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{a.company}</div>
        </div>
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>{a.category}</div>
      <div style={{ flex: 1, textAlign: 'center' }}>{a.totalScore}%</div>
      <div style={{ flex: 1, textAlign: 'center' }}>{a.grade || 'N/A'}</div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────
function EmptyState({ icon, title, sub, btn, onBtn }) {
  return (
    <div style={{
      textAlign: 'center', padding: '44px 20px', background: '#fff',
      borderRadius: '14px', border: '1px solid #f1f5f9', marginBottom: '20px',
    }}>
      <div style={{ fontSize: '38px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>{title}</div>
      {sub && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{sub}</div>}
      {btn && (
        <button
          onClick={onBtn}
          style={{ padding: '10px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
        >
          {btn}
        </button>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────
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
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (isMobile && sideOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSideOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isMobile, sideOpen]);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = sideOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sideOpen, isMobile]);

  useEffect(() => {
    getAttempts()
      .then(({ data }) => setAttempts(data))
      .catch(() => toast.error('Could not load attempts'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? INTERVIEWS : INTERVIEWS.filter(iv => iv.category === filter);

  const avgScore  = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.totalScore, 0) / attempts.length) : 0;
  const bestScore = attempts.length
    ? Math.max(...attempts.map(a => a.totalScore)) : 0;

  const showAttempts = activeNav === 'My Attempts';

  const toggleSide = () => {
    if (isMobile) setSideOpen(o => !o);
    else setSideExpanded(o => !o);
  };

  const sideClass = isMobile
    ? `db-sidebar ${sideOpen ? 'mobile-open' : ''}`
    : `db-sidebar ${sideExpanded ? 'expanded' : 'icon-only'}`;

  const mainClass = isMobile
    ? 'db-main'
    : `db-main ${sideExpanded ? 'sidebar-full' : 'sidebar-icon'}`;

  return (
    <>
      <style>{globalCSS}</style>

      <div className="db-root">

        {/* MOBILE OVERLAY */}
        {isMobile && sideOpen && (
          <div className="db-overlay" onClick={() => setSideOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside ref={sidebarRef} className={sideClass}>
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            {(sideExpanded || isMobile) && (
              <span style={{ color: '#fff', fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap' }}>
                MockPrep
              </span>
            )}
          </div>

          <nav style={{ flex: 1, paddingTop: '8px' }}>
            {NAV_ITEMS.map(({ icon, label }) => (
              <div
                key={label}
                className={`db-nav-item ${activeNav === label ? 'active' : ''}`}
                onClick={() => { setActiveNav(label); if (isMobile) setSideOpen(false); }}
                title={label}
              >
                <span style={{ fontSize: '19px', minWidth: '22px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                {(sideExpanded || isMobile) && (
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
                )}
              </div>
            ))}
          </nav>

          <div style={{ borderTop: '1px solid #1e293b', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {(sideExpanded || isMobile) && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                  onClick={() => { logout(); navigate('/'); }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className={mainClass} style={{ minHeight: '100vh', overflowX: 'hidden' }}>

          {/* TOPBAR */}
          <div className="db-topbar">
            <button
              onClick={toggleSide}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}
              aria-label="Toggle menu"
            >
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#475569', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '16px', height: '2px', background: '#475569', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#475569', borderRadius: '2px' }} />
            </button>

            <div style={{ flex: 1, marginLeft: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>
                {showAttempts ? '📋 My Attempts' : `Hey, ${user?.name?.split(' ')[0]} 👋`}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                {showAttempts ? `${attempts.length} sessions` : 'Ready to practice?'}
              </div>
            </div>

            <div className="db-search">
              <span style={{ fontSize: '14px' }}>🔍</span>
              <input placeholder="Search roles..." />
            </div>

            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="db-content">

            {/* ── DASHBOARD VIEW ── */}
            {activeNav === 'Dashboard' && (
              <>
                {/* STATS */}
                <div className="db-stats">
                  {[
                    { label: 'Total attempts', value: attempts.length, icon: '📝', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                    { label: 'Avg. score',     value: `${avgScore}%`,  icon: '📊', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                    { label: 'Best score',     value: `${bestScore}%`, icon: '🏆', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                    { label: 'Companies',      value: '8+',            icon: '🏢', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                  ].map(({ label, value, icon, color, bg, border }) => (
                    <div key={label} style={{ background: '#fff', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}` }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, border: `1px solid ${border}` }}>
                        {icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>{label}</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECTION HEADER */}
                <div className="db-section-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Interview Prep</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Choose a company and role to begin</div>
                  </div>
                </div>

                {/* FILTER PILLS */}
                <div className="db-filters">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      style={{
                        padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                        background:  filter === c ? '#3b82f6' : '#fff',
                        color:       filter === c ? '#fff'    : '#475569',
                        borderColor: filter === c ? '#3b82f6' : '#e2e8f0',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* INTERVIEW CARDS */}
                <div className="db-cards">
                  {filtered.map(iv => (
                    <div
                      key={iv.id}
                      className="db-card"
                      style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${iv.border}`, display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={() => setHoveredCard(iv.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div style={{ height: '4px', background: iv.color }} />
                      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iv.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                          {iv.icon}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px', color: iv.color, background: iv.bg, border: `1px solid ${iv.border}` }}>
                          {iv.category}
                        </span>
                      </div>
                      <div style={{ padding: '0 16px 14px', flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{iv.company}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{iv.role}</div>
                      </div>
                      <div style={{ padding: '0 12px 12px' }}>
                        <button
                          style={{
                            width: '100%', padding: '9px', border: `2px solid ${iv.color}`,
                            borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.18s',
                            background: hoveredCard === iv.id ? iv.color : '#fff',
                            color:      hoveredCard === iv.id ? '#fff'   : iv.color,
                          }}
                          onClick={() => navigate(`/interview/${iv.id}`, { state: iv })}
                        >
                          {hoveredCard === iv.id ? 'Start Interview →' : 'Start Interview'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RECENT ATTEMPTS */}
                <div className="db-section-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Recent Attempts</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Your latest sessions</div>
                  </div>
                  {attempts.length > 0 && (
                    <button
                      style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      onClick={() => setActiveNav('My Attempts')}
                    >
                      View all →
                    </button>
                  )}
                </div>

                {loading ? (
                  <EmptyState icon="⏳" title="Loading..." sub="" />
                ) : attempts.length === 0 ? (
                  <EmptyState icon="🎯" title="No attempts yet" sub="Complete your first interview to see results here" />
                ) : (
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span style={{ flex: 2 }}>Role &amp; Company</span>
                      <span className="db-col-cat" style={{ flex: 1, textAlign: 'center' }}>Category</span>
                      <span style={{ flex: 1, textAlign: 'center' }}>Score</span>
                      <span className="db-col-date" style={{ flex: 1, textAlign: 'right' }}>Date</span>
                    </div>
                    {attempts.slice(0,3).map((a,i)=>(
  <div
    key={a._id}
    className="db-attempt-row"
    onClick={() =>
      navigate(`/results/${a._id}`, {
        state:{attempt:a}
      })
    }
  >
    <div className="db-col-main">
      <div>
        <div style={{fontWeight:'600'}}>
          {a.role}
        </div>
        <div style={{fontSize:'12px',color:'#64748b'}}>
          {a.company}
        </div>
      </div>
    </div>

    <div style={{flex:1,textAlign:'center'}}>
      <span
        style={{
          color: scoreColor(a.totalScore),
          background: scoreBg(a.totalScore),
          padding:'4px 10px',
          borderRadius:'99px',
          fontWeight:'700'
        }}
      >
        {a.totalScore}%
      </span>
    </div>
  </div>
))}
                  </div>
                )}
              </>
            )}

            {/* ── MY ATTEMPTS VIEW ── */}
            {activeNav === 'My Attempts' && (
              <>
                <div className="db-section-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>📋 All Interview History</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Click any row to view full AI feedback and analysis</div>
                  </div>
                  {attempts.length > 0 && (
                    <span style={{ padding: '3px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '99px', fontSize: '12px', fontWeight: '600' }}>
                      {attempts.length} total
                    </span>
                  )}
                </div>

                {loading ? (
                  <EmptyState icon="⏳" title="Loading..." sub="" />
                ) : attempts.length === 0 ? (
                  <EmptyState icon="🎯" title="No attempts yet" sub="Complete your first interview to see your history here"
                    btn="Start Practicing →" onBtn={() => setActiveNav('Dashboard')} />
                ) : (
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span style={{ flex: 2 }}>Role &amp; Company</span>
                      <span className="db-col-cat" style={{ flex: 1, textAlign: 'center' }}>Category</span>
                      <span style={{ flex: 1, textAlign: 'center' }}>Score</span>
                      <span style={{ flex: 1, textAlign: 'center' }}>Grade</span>
                      <span className="db-col-date" style={{ flex: 1, textAlign: 'right' }}>Date</span>
                    </div>
                    {attempts.map((a, i) => (
                      <AttemptRowFull key={a._id} a={a} i={i} navigate={navigate} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── ANALYTICS VIEW ── */}
            {activeNav === 'Analytics' && (
              <>
                <div className="db-section-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>📊 Analytics</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Your interview performance overview</div>
                  </div>
                </div>

                <div className="db-stats" style={{ marginBottom: '20px' }}>
                  {[
                    { label: 'Total attempts', value: attempts.length, icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Avg. score',     value: `${avgScore}%`,  icon: '📊', color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Best score',     value: `${bestScore}%`, icon: '🏆', color: '#f59e0b', bg: '#fffbeb' },
                    {
                      label: 'Pass rate',
                      value: attempts.length
                        ? `${Math.round((attempts.filter(a => a.totalScore >= 60).length / attempts.length) * 100)}%`
                        : '0%',
                      icon: '✅', color: '#8b5cf6', bg: '#f5f3ff',
                    },
                  ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} style={{ background: '#fff', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}` }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>{label}</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {attempts.length > 0 && (
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Score by Category</div>
                    {['Full Stack', 'Frontend', 'Backend', 'HR', 'Sales', 'General'].map(cat => {
                      const catAttempts = attempts.filter(a => a.category === cat);
                      if (catAttempts.length === 0) return null;
                      const avg = Math.round(catAttempts.reduce((s, a) => s + a.totalScore, 0) / catAttempts.length);
                      const col = scoreColor(avg);
                      const bg  = scoreBg(avg);
                      return (
                        <div key={cat} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{cat}</span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: col, background: bg, padding: '1px 8px', borderRadius: '99px' }}>
                              {avg}% · {catAttempts.length} attempt{catAttempts.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '8px', width: `${avg}%`, background: col, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {attempts.length > 0 && (
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Grade Distribution</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {['A', 'B', 'C', 'D', 'F'].map(grade => {
                        const count = attempts.filter(a => a.grade === grade).length;
                        const gc = grade === 'A' ? '#16a34a' : grade === 'B' ? '#2563eb' : grade === 'C' ? '#d97706' : '#dc2626';
                        const gb = grade === 'A' ? '#dcfce7' : grade === 'B' ? '#eff6ff'  : grade === 'C' ? '#fef9c3' : '#fee2e2';
                        return (
                          <div key={grade} style={{ flex: '1', minWidth: '60px', textAlign: 'center', background: gb, borderRadius: '12px', padding: '14px 8px', border: `1px solid ${gc}33` }}>
                            <div style={{ fontSize: '22px', fontWeight: '800', color: gc }}>{grade}</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{count}</div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>attempt{count !== 1 ? 's' : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {attempts.length === 0 && (
                  <EmptyState icon="📊" title="No data yet" sub="Complete interviews to see your analytics here"
                    btn="Start Practicing →" onBtn={() => setActiveNav('Dashboard')} />
                )}
              </>
            )}

            {/* ── SETTINGS VIEW ── */}
            {activeNav === 'Settings' && (
              <>
                <div className="db-section-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>⚙️ Settings</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Manage your account</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Profile</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Your Progress</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'Interviews done', value: attempts.length },
                        { label: 'Avg score',        value: `${avgScore}%` },
                        { label: 'Best score',       value: `${bestScore}%` },
                        { label: 'Pass rate',        value: attempts.length ? `${Math.round((attempts.filter(a => a.totalScore >= 60).length / attempts.length) * 100)}%` : '0%' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{label}</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Account</div>
                    <button
                      style={{ padding: '11px 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
                      onClick={() => { logout(); navigate('/'); }}
                    >
                      Sign out of MockPrep
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

          <footer style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #e8eaed', background: '#fff', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
          </footer>
        </div>
      </div>
    </>
  );
}
