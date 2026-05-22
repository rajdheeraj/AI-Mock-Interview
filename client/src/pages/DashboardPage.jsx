import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAttempts } from '../services/api';

const INTERVIEWS = [
  { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', icon:'💻', color:'#3b82f6', bg:'#eff6ff' },
  { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', icon:'⚛️', color:'#8b5cf6', bg:'#f5f3ff' },
  { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    icon:'🔧', color:'#10b981', bg:'#ecfdf5' },
  { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   icon:'🎨', color:'#f59e0b', bg:'#fffbeb' },
  { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', icon:'☕', color:'#ef4444', bg:'#fef2f2' },
  { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    icon:'🐍', color:'#06b6d4', bg:'#ecfeff' },
  { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         icon:'🤝', color:'#ec4899', bg:'#fdf2f8' },
  { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      icon:'📈', color:'#f97316', bg:'#fff7ed' },
];

const CATEGORIES = ['All','Full Stack','Frontend','Backend','HR','Sales'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [attempts,     setAttempts]     = useState([]);
  const [filter,       setFilter]       = useState('All');
  const [loading,      setLoading]      = useState(true);
  const [sideOpen,     setSideOpen]     = useState(true);
  const [hoveredCard,  setHoveredCard]  = useState(null);
  const [hoveredNav,   setHoveredNav]   = useState(null);
  const [hoveredRow,   setHoveredRow]   = useState(null);
  const [activeNav,    setActiveNav]    = useState('Dashboard');

  useEffect(() => {
    getAttempts()
      .then(({ data }) => {
        console.log('Attempts loaded:', data.length);
        setAttempts(data);
      })
      .catch((err) => {
        console.error('Attempts fetch error:', err);
        toast.error('Could not load attempts');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? INTERVIEWS
    : INTERVIEWS.filter(i => i.category === filter);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.totalScore, 0) / attempts.length)
    : 0;

  const bestScore = attempts.length
    ? Math.max(...attempts.map(a => a.totalScore))
    : 0;

  const navItems = [
    { icon:'🏠', label:'Dashboard'   },
    { icon:'📋', label:'My Attempts' },
    { icon:'📊', label:'Analytics'   },
    { icon:'⚙️', label:'Settings'    },
  ];

  // Show attempts view when My Attempts is clicked
  const showAttempts = activeNav === 'My Attempts';

  return (
    <div style={s.root}>

      {/* ── SIDEBAR ── */}
      <aside style={{ ...s.sidebar, width: sideOpen ? '220px' : '64px' }}>
        <div style={s.sideTop}>
          <div style={s.brand}>{sideOpen ? '🎯 MockPrep' : '🎯'}</div>
          <button style={s.collapseBtn} onClick={() => setSideOpen(o => !o)}>
            {sideOpen ? '◀' : '▶'}
          </button>
        </div>

        {navItems.map(({ icon, label }) => (
          <div
            key={label}
            title={label}
            style={{
              ...s.navItem,
              background: activeNav === label ? '#1e3a5f'
                        : hoveredNav === label ? '#1e293b'
                        : 'transparent',
              borderLeft: activeNav === label ? '3px solid #3b82f6' : '3px solid transparent',
            }}
            onMouseEnter={() => setHoveredNav(label)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => setActiveNav(label)}
          >
            <span style={s.navIcon}>{icon}</span>
            {sideOpen && <span style={{
              ...s.navLabel,
              color: activeNav === label ? '#fff' : '#94a3b8',
            }}>{label}</span>}
          </div>
        ))}

        <div style={s.sideFooter}>
          <div style={s.userRow} title={user?.name}>
            <div style={s.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sideOpen && (
              <div style={s.userInfo}>
                <div style={s.userName}>{user?.name}</div>
                <button
                  style={s.logoutBtn}
                  onMouseEnter={e => e.target.style.color='#fca5a5'}
                  onMouseLeave={e => e.target.style.color='#ef4444'}
                  onClick={() => { logout(); navigate('/'); }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>

        {/* TOP BAR */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.greeting}>
              {showAttempts ? '📋 My Attempts' : `Good day, ${user?.name} 👋`}
            </h1>
            <p style={s.greetingSub}>
              {showAttempts
                ? `${attempts.length} interview sessions completed`
                : 'Ready for your next interview practice?'}
            </p>
          </div>
          {!showAttempts && (
            <div style={s.topRight}>
              <div style={s.searchBox}>
                <span>🔍</span>
                <input style={s.searchInput} placeholder="Search roles..." />
              </div>
            </div>
          )}
        </div>

        {/* STATS */}
        <div style={s.statsGrid}>
          {[
            { label:'Total attempts', value: attempts.length,  icon:'📝', color:'#3b82f6', bg:'#eff6ff' },
            { label:'Avg. score',     value: `${avgScore}%`,   icon:'📊', color:'#10b981', bg:'#ecfdf5' },
            { label:'Best score',     value: `${bestScore}%`,  icon:'🏆', color:'#f59e0b', bg:'#fffbeb' },
            { label:'Companies',      value: '8+',             icon:'🏢', color:'#8b5cf6', bg:'#f5f3ff' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ ...s.statCard, borderTop:`3px solid ${color}` }}>
              <div style={{ ...s.statIcon, background: bg, color }}>{icon}</div>
              <div>
                <div style={s.statLabel}>{label}</div>
                <div style={{ ...s.statVal, color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MY ATTEMPTS VIEW ── */}
        {showAttempts ? (
          <div>
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>All Interview History</h2>
                <p style={s.sectionSub}>Click any row to view full feedback and AI analysis</p>
              </div>
              {attempts.length > 0 && (
                <span style={s.countBadge}>{attempts.length} total</span>
              )}
            </div>

            {loading ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>⏳</div>
                <p style={s.emptyText}>Loading your attempts...</p>
              </div>
            ) : attempts.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>🎯</div>
                <p style={s.emptyText}>No attempts yet</p>
                <p style={s.emptySub}>Start your first interview to see results here</p>
                <button
                  style={s.emptyBtn}
                  onClick={() => setActiveNav('Dashboard')}
                >
                  Go to Dashboard →
                </button>
              </div>
            ) : (
              <div style={s.attemptList}>
                <div style={s.tableHeader}>
                  <span style={{ flex:2 }}>Role & Company</span>
                  <span style={{ flex:1, textAlign:'center' }}>Category</span>
                  <span style={{ flex:1, textAlign:'center' }}>Score</span>
                  <span style={{ flex:1, textAlign:'center' }}>Grade</span>
                  <span style={{ flex:1, textAlign:'right'  }}>Date</span>
                </div>
                {attempts.map((a, i) => {
                  const scoreColor = a.totalScore >= 70 ? '#16a34a' : a.totalScore >= 50 ? '#d97706' : '#dc2626';
                  const scoreBg    = a.totalScore >= 70 ? '#dcfce7' : a.totalScore >= 50 ? '#fef9c3' : '#fee2e2';
                  const gradeColor = a.grade === 'A' ? '#16a34a' : a.grade === 'B' ? '#2563eb' : a.grade === 'C' ? '#d97706' : '#dc2626';
                  return (
                    <div
                      key={a._id}
                      style={{
                        ...s.tableRow,
                        background:    hoveredRow === a._id ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                        cursor:        'pointer',
                        borderLeft:    hoveredRow === a._id ? '3px solid #3b82f6' : '3px solid transparent',
                      }}
                      onMouseEnter={() => setHoveredRow(a._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => navigate(`/results/${a._id}`, { state: { attempt: a } })}
                    >
                      <div style={{ flex:2, display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={s.attemptAvatar}>{a.company?.charAt(0)}</div>
                        <div>
                          <div style={s.attemptRole}>{a.role}</div>
                          <div style={s.attemptCompany}>{a.company}</div>
                        </div>
                      </div>
                      <div style={{ flex:1, textAlign:'center' }}>
                        <span style={s.categoryPill}>{a.category}</span>
                      </div>
                      <div style={{ flex:1, textAlign:'center' }}>
                        <span style={{ ...s.scorePill, color: scoreColor, background: scoreBg }}>
                          {a.totalScore}%
                        </span>
                      </div>
                      <div style={{ flex:1, textAlign:'center' }}>
                        <span style={{ ...s.scorePill, color: gradeColor, background: scoreBg }}>
                          {a.grade || 'N/A'}
                        </span>
                      </div>
                      <div style={{ flex:1, textAlign:'right', fontSize:'12px', color:'#94a3b8' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', year:'numeric'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        ) : (
          /* ── DASHBOARD VIEW ── */
          <>
            {/* SECTION HEADER */}
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Interview Prep</h2>
                <p style={s.sectionSub}>Choose a company and role to begin</p>
              </div>
            </div>

            {/* FILTER PILLS */}
            <div style={s.filters}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  style={filter === c ? s.pillActive : s.pill}
                  onMouseEnter={e => { if (filter !== c) e.target.style.background='#f1f5f9'; }}
                  onMouseLeave={e => { if (filter !== c) e.target.style.background='#fff'; }}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* INTERVIEW CARDS */}
            <div style={s.cardsGrid}>
              {filtered.map(iv => (
                <div
                  key={iv.id}
                  style={{
                    ...s.card,
                    transform:  hoveredCard === iv.id ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow:  hoveredCard === iv.id
                      ? `0 12px 32px rgba(0,0,0,0.12), 0 0 0 2px ${iv.color}22`
                      : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={() => setHoveredCard(iv.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ ...s.cardIconBox, background: iv.bg }}>
                    <span style={s.cardIcon}>{iv.icon}</span>
                    <span style={{ ...s.cardCategoryBadge, color: iv.color, background: iv.bg, border:`1px solid ${iv.color}33` }}>
                      {iv.category}
                    </span>
                  </div>
                  <div style={s.cardBody}>
                    <h3 style={s.cardCompany}>{iv.company}</h3>
                    <p style={s.cardRole}>{iv.role}</p>
                  </div>
                  <div style={s.cardFooter}>
                    <button
                      style={{
                        ...s.startBtn,
                        background: hoveredCard === iv.id ? iv.color : '#fff',
                        color:      hoveredCard === iv.id ? '#fff'    : iv.color,
                        border:     `2px solid ${iv.color}`,
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
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Recent Attempts</h2>
                <p style={s.sectionSub}>Click any row to view full AI feedback</p>
              </div>
              {attempts.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={s.countBadge}>{attempts.length} total</span>
                  <button
                    style={s.viewAllBtn}
                    onClick={() => setActiveNav('My Attempts')}
                  >
                    View all →
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>⏳</div>
                <p style={s.emptyText}>Loading your attempts...</p>
              </div>
            ) : attempts.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>🎯</div>
                <p style={s.emptyText}>No attempts yet</p>
                <p style={s.emptySub}>Start your first interview above to see results here</p>
                <button
                  style={s.emptyBtn}
                  onMouseEnter={e => e.target.style.background='#1d4ed8'}
                  onMouseLeave={e => e.target.style.background='#3b82f6'}
                  onClick={() => window.scrollTo({ top: 0, behavior:'smooth' })}
                >
                  Start Practicing →
                </button>
              </div>
            ) : (
              <div style={s.attemptList}>
                <div style={s.tableHeader}>
                  <span style={{ flex:2 }}>Role & Company</span>
                  <span style={{ flex:1, textAlign:'center' }}>Category</span>
                  <span style={{ flex:1, textAlign:'center' }}>Score</span>
                  <span style={{ flex:1, textAlign:'right'  }}>Date</span>
                </div>
                {attempts.slice(0, 5).map((a, i) => {
                  const scoreColor = a.totalScore >= 70 ? '#16a34a' : a.totalScore >= 50 ? '#d97706' : '#dc2626';
                  const scoreBg    = a.totalScore >= 70 ? '#dcfce7' : a.totalScore >= 50 ? '#fef9c3' : '#fee2e2';
                  return (
                    <div
                      key={a._id}
                      style={{
                        ...s.tableRow,
                        background:  hoveredRow === a._id ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                        cursor:      'pointer',
                        borderLeft:  hoveredRow === a._id ? '3px solid #3b82f6' : '3px solid transparent',
                      }}
                      onMouseEnter={() => setHoveredRow(a._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => navigate(`/results/${a._id}`, { state: { attempt: a } })}
                    >
                      <div style={{ flex:2, display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={s.attemptAvatar}>{a.company?.charAt(0)}</div>
                        <div>
                          <div style={s.attemptRole}>{a.role}</div>
                          <div style={s.attemptCompany}>{a.company}</div>
                        </div>
                      </div>
                      <div style={{ flex:1, textAlign:'center' }}>
                        <span style={s.categoryPill}>{a.category}</span>
                      </div>
                      <div style={{ flex:1, textAlign:'center' }}>
                        <span style={{ ...s.scorePill, color: scoreColor, background: scoreBg }}>
                          {a.totalScore}%
                        </span>
                      </div>
                      <div style={{ flex:1, textAlign:'right', fontSize:'12px', color:'#94a3b8' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', year:'numeric'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <footer style={s.footer}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
        </footer>

      </main>
    </div>
  );
}

         const s = {
  root:              { display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  sidebar:           { background:'#0f172a', display:'flex', flexDirection:'column', transition:'width 0.25s ease', overflow:'hidden', flexShrink:0 },
  sideTop:           { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 14px', borderBottom:'1px solid #1e293b' },
  brand:             { color:'#fff', fontWeight:'800', fontSize:'15px', whiteSpace:'nowrap' },
  collapseBtn:       { background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'12px', padding:'4px', borderRadius:'4px' },
  navItem:           { display:'flex', alignItems:'center', gap:'12px', padding:'11px 16px', color:'#94a3b8', cursor:'pointer', transition:'all 0.15s' },
  navIcon:           { fontSize:'18px', minWidth:'20px', textAlign:'center' },
  navLabel:          { fontSize:'14px', whiteSpace:'nowrap', fontWeight:'500' },
  sideFooter:        { marginTop:'auto', borderTop:'1px solid #1e293b', padding:'14px' },
  userRow:           { display:'flex', alignItems:'center', gap:'10px' },
  avatar:            { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', flexShrink:0 },
  userInfo:          { overflow:'hidden' },
  userName:          { color:'#e2e8f0', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  logoutBtn:         { background:'none', border:'none', color:'#ef4444', fontSize:'11px', cursor:'pointer', padding:0, marginTop:'2px' },
  main:              { flex:1, padding:'16px', overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column', minWidth:0 },
  topbar:            { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'10px' },
  greeting:          { fontSize:'20px', fontWeight:'800', color:'#0f172a', margin:'0 0 4px' },
  greetingSub:       { fontSize:'13px', color:'#64748b', margin:0 },
  topRight:          { display:'flex', alignItems:'center', gap:'10px' },
  searchBox:         { display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'8px 12px' },
  searchInput:       { border:'none', outline:'none', fontSize:'13px', color:'#334155', width:'140px', background:'transparent' },
  statsGrid:         { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px', marginBottom:'20px' },
  statCard:          { background:'#fff', borderRadius:'12px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' },
  statIcon:          { width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 },
  statLabel:         { fontSize:'11px', color:'#64748b', marginBottom:'3px' },
  statVal:           { fontSize:'20px', fontWeight:'800' },
  sectionHeader:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' },
  sectionTitle:      { fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:'0 0 2px' },
  sectionSub:        { fontSize:'12px', color:'#64748b', margin:0 },
  countBadge:        { padding:'3px 10px', background:'#eff6ff', color:'#3b82f6', borderRadius:'99px', fontSize:'11px', fontWeight:'600' },
  viewAllBtn:        { padding:'5px 12px', background:'#fff', border:'1.5px solid #3b82f6', color:'#3b82f6', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  filters:           { display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' },
  pill:              { padding:'6px 14px', borderRadius:'99px', border:'1.5px solid #e2e8f0', background:'#fff', fontSize:'12px', color:'#475569', cursor:'pointer', fontWeight:'500' },
  pillActive:        { padding:'6px 14px', borderRadius:'99px', border:'1.5px solid #3b82f6', background:'#3b82f6', fontSize:'12px', color:'#fff', cursor:'pointer', fontWeight:'600' },
  cardsGrid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:'12px', marginBottom:'28px' },
  card:              { background:'#fff', borderRadius:'14px', overflow:'hidden', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', transition:'transform 0.2s ease, box-shadow 0.2s ease', cursor:'pointer' },
  cardIconBox:       { padding:'14px 14px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardIcon:          { fontSize:'24px' },
  cardCategoryBadge: { fontSize:'9px', fontWeight:'700', padding:'2px 8px', borderRadius:'99px', letterSpacing:'0.3px' },
  cardBody:          { padding:'0 14px 10px', flex:1 },
  cardCompany:       { fontSize:'14px', fontWeight:'800', color:'#0f172a', margin:'0 0 2px' },
  cardRole:          { fontSize:'11px', color:'#64748b', margin:0 },
  cardFooter:        { padding:'0 12px 12px' },
  startBtn:          { width:'100%', padding:'8px', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s ease' },
  attemptList:       { background:'#fff', borderRadius:'12px', border:'1px solid #f1f5f9', overflow:'hidden', marginBottom:'20px' },
  tableHeader:       { display:'flex', padding:'10px 12px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:          { display:'flex', alignItems:'center', padding:'11px 12px', borderBottom:'1px solid #f8fafc', transition:'all 0.15s' },
  attemptAvatar:     { width:'28px', height:'28px', borderRadius:'6px', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', flexShrink:0 },
  attemptRole:       { fontSize:'13px', fontWeight:'600', color:'#0f172a' },
  attemptCompany:    { fontSize:'11px', color:'#64748b', marginTop:'1px' },
  categoryPill:      { fontSize:'10px', padding:'2px 8px', background:'#f1f5f9', color:'#475569', borderRadius:'99px', fontWeight:'500' },
  scorePill:         { fontSize:'12px', fontWeight:'700', padding:'2px 10px', borderRadius:'99px' },
  emptyState:        { textAlign:'center', padding:'40px 16px', background:'#fff', borderRadius:'12px', border:'1px solid #f1f5f9', marginBottom:'20px' },
  emptyIcon:         { fontSize:'36px', marginBottom:'10px' },
  emptyText:         { fontSize:'15px', fontWeight:'700', color:'#334155', margin:'0 0 6px' },
  emptySub:          { fontSize:'12px', color:'#94a3b8', margin:'0 0 16px' },
  emptyBtn:          { padding:'10px 20px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  footer:            { textAlign:'center', padding:'16px', borderTop:'1px solid #e2e8f0', marginTop:'auto', fontSize:'11px', color:'#94a3b8' },
};
