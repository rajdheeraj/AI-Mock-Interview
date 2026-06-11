// import { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';
// import { getAttempts } from '../services/api';

// const globalCSS = `
//   * { box-sizing: border-box; }
//   body { overflow-x: hidden; margin: 0; }
//   .db-root { display: flex; min-height: 100vh; background: #f0f2f5;
//     font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; }
//   .db-sidebar {
//     position: fixed; top: 0; left: 0; height: 100vh; z-index: 300;
//     background: #0f172a; display: flex; flex-direction: column;
//     transition: transform 0.32s cubic-bezier(.4,0,.2,1), width 0.32s cubic-bezier(.4,0,.2,1);
//     overflow: hidden; flex-shrink: 0;
//   }
//   @media (min-width: 769px) {
//     .db-sidebar { position: fixed; transform: translateX(0) !important; }
//     .db-sidebar.icon-only { width: 64px; }
//     .db-sidebar.expanded  { width: 220px; }
//     .db-main { transition: margin-left 0.32s cubic-bezier(.4,0,.2,1); }
//     .db-main.sidebar-icon { margin-left: 64px; }
//     .db-main.sidebar-full { margin-left: 220px; }
//   }
//   @media (max-width: 768px) {
//     .db-sidebar { width: 240px !important; transform: translateX(-100%); }
//     .db-sidebar.mobile-open { transform: translateX(0) !important; }
//     .db-main { margin-left: 0 !important; }
//     .db-overlay { display: block !important; }
//   }
//   .db-overlay {
//     display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45);
//     z-index: 299; backdrop-filter: blur(2px); animation: fadeIn 0.2s ease;
//   }
//   @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
//   .db-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
//   @media (max-width: 1024px) { .db-stats { grid-template-columns: repeat(2,1fr); } }
//   @media (max-width: 480px)  { .db-stats { grid-template-columns: repeat(2,1fr); gap: 10px; } }
//   .db-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
//   @media (max-width: 1200px) { .db-cards { grid-template-columns: repeat(3,1fr); } }
//   @media (max-width: 900px)  { .db-cards { grid-template-columns: repeat(2,1fr); } }
//   @media (max-width: 500px)  { .db-cards { grid-template-columns: 1fr; } }
//   .db-attempt-row { display: flex; align-items: center; padding: 12px 16px;
//     border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; }
//   .db-attempt-row:hover { background: #f0f9ff; }
//   .db-attempt-row:last-child { border-bottom: none; }
//   .db-col-main  { flex: 2; display: flex; align-items: center; gap: 10px; min-width: 0; }
//   .db-col-cat   { flex: 1; text-align: center; }
//   .db-col-score { flex: 1; text-align: center; }
//   .db-col-date  { flex: 1; text-align: right; font-size: 12px; color: #94a3b8; }
//   @media (max-width: 600px) {
//     .db-col-cat  { display: none; }
//     .db-col-date { display: none; }
//     .db-col-score { flex: 0 0 60px; }
//   }
//   .db-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
//   .db-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important; }
//   .db-nav-item { display: flex; align-items: center; gap: 12px;
//     padding: 11px 16px; color: #94a3b8; cursor: pointer;
//     transition: background 0.15s, color 0.15s; border-left: 3px solid transparent; white-space: nowrap; }
//   .db-nav-item:hover { background: #1e293b; color: #e2e8f0; }
//   .db-nav-item.active { background: #1e3a5f; color: #fff; border-left-color: #3b82f6; }
//   .db-main { flex: 1; min-width: 0; padding: 0; overflow-x: hidden; }
//   .db-topbar { display: flex; align-items: center; justify-content: space-between;
//     padding: 14px 24px; background: #fff; border-bottom: 1px solid #e8eaed;
//     position: sticky; top: 0; z-index: 100; gap: 12px; }
//   @media (max-width: 600px) { .db-topbar { padding: 12px 14px; } }
//   .db-search { display: flex; align-items: center; gap: 8px;
//     background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
//     padding: 8px 14px; flex: 1; max-width: 280px; transition: border-color 0.2s; }
//   .db-search:focus-within { border-color: #3b82f6; }
//   .db-search input { border: none; background: transparent; outline: none;
//     font-size: 13px; color: #334155; width: 100%; }
//   @media (max-width: 500px) { .db-search { max-width: 160px; } }
//   .db-content { padding: 22px 24px; }
//   @media (max-width: 600px) { .db-content { padding: 14px; } }
//   .db-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
//   .db-section-header { display: flex; justify-content: space-between; align-items: center;
//     margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
//   .db-main::-webkit-scrollbar { width: 4px; }
//   .db-main::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
// `;

// const INTERVIEWS = [
//   { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', icon:'💻', color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
//   { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', icon:'⚛️', color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe' },
//   { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    icon:'🔧', color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0' },
//   { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   icon:'🎨', color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
//   { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', icon:'☕', color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
//   { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    icon:'🐍', color:'#06b6d4', bg:'#ecfeff', border:'#a5f3fc' },
//   { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         icon:'🤝', color:'#ec4899', bg:'#fdf2f8', border:'#fbcfe8' },
//   { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      icon:'📈', color:'#f97316', bg:'#fff7ed', border:'#fed7aa' },
// ];

// const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'HR', 'Sales'];

// const NAV_ITEMS = [
//   { icon:'🏠', label:'Dashboard'   },
//   { icon:'📋', label:'My Attempts' },
//   { icon:'📊', label:'Analytics'   },
//   { icon:'⚙️', label:'Settings'    },
// ];

// function scoreColor(score) {
//   return score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
// }
// function scoreBg(score) {
//   return score >= 70 ? '#dcfce7' : score >= 50 ? '#fef9c3' : '#fee2e2';
// }

// function AttemptRow({ a, i, navigate }) {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <div
//       className="db-attempt-row"
//       style={{
//         background: hovered ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
//         borderLeft: hovered ? '3px solid #3b82f6' : '3px solid transparent',
//       }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       onClick={() => navigate(`/results/${a._id}`, { state: { attempt: a } })}
//     >
//       <div className="db-col-main">
//         <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', flexShrink:0 }}>
//           {a.company?.charAt(0)}
//         </div>
//         <div style={{ minWidth:0 }}>
//           <div style={{ fontSize:'13px', fontWeight:'600', color:'#0f172a' }}>{a.role}</div>
//           <div style={{ fontSize:'11px', color:'#64748b' }}>{a.company}</div>
//         </div>
//       </div>
//       <div className="db-col-cat" style={{ flex:1, textAlign:'center' }}>
//         <span style={{ fontSize:'10px', padding:'2px 8px', background:'#f1f5f9', borderRadius:'99px' }}>
//           {a.category}
//         </span>
//       </div>
//       <div style={{ flex:1, textAlign:'center' }}>
//         <span style={{ fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'99px', color: scoreColor(a.totalScore), background: scoreBg(a.totalScore) }}>
//           {a.totalScore}%
//         </span>
//       </div>
//       <div className="db-col-date" style={{ flex:1, textAlign:'right', fontSize:'11px', color:'#94a3b8' }}>
//         {new Date(a.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
//       </div>
//     </div>
//   );
// }

// function AttemptRowFull({ a, i, navigate }) {
//   const [hovered, setHovered] = useState(false);
//   const sc = scoreColor(a.totalScore);
//   const sb = scoreBg(a.totalScore);
//   const gc = a.grade === 'A' ? '#16a34a' : a.grade === 'B' ? '#2563eb' : a.grade === 'C' ? '#d97706' : '#dc2626';
//   return (
//     <div
//       className="db-attempt-row"
//       style={{
//         background: hovered ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
//         borderLeft: hovered ? '3px solid #3b82f6' : '3px solid transparent',
//       }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       onClick={() => navigate(`/results/${a._id}`, { state: { attempt: a } })}
//     >
//       <div className="db-col-main">
//         <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', flexShrink:0 }}>
//           {a.company?.charAt(0)}
//         </div>
//         <div style={{ minWidth:0 }}>
//           <div style={{ fontSize:'13px', fontWeight:'600', color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.role}</div>
//           <div style={{ fontSize:'11px', color:'#64748b' }}>{a.company}</div>
//         </div>
//       </div>
//       <div className="db-col-cat" style={{ flex:1, textAlign:'center' }}>
//         <span style={{ fontSize:'10px', padding:'2px 8px', background:'#f1f5f9', borderRadius:'99px' }}>{a.category}</span>
//       </div>
//       <div style={{ flex:1, textAlign:'center' }}>
//         <span style={{ fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'99px', color: sc, background: sb }}>
//           {a.totalScore}%
//         </span>
//       </div>
//       <div style={{ flex:1, textAlign:'center' }}>
//         <span style={{ fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'99px', color: gc, background: sb }}>
//           {a.grade || 'N/A'}
//         </span>
//       </div>
//       <div className="db-col-date" style={{ flex:1, textAlign:'right', fontSize:'11px', color:'#94a3b8' }}>
//         {new Date(a.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
//       </div>
//     </div>
//   );
// }

// function EmptyState({ icon, title, sub, btn, onBtn }) {
//   return (
//     <div style={{ textAlign:'center', padding:'44px 20px', background:'#fff', borderRadius:'14px', border:'1px solid #f1f5f9', marginBottom:'20px' }}>
//       <div style={{ fontSize:'38px', marginBottom:'12px' }}>{icon}</div>
//       <div style={{ fontSize:'15px', fontWeight:'700', color:'#334155', marginBottom:'6px' }}>{title}</div>
//       {sub && <div style={{ fontSize:'12px', color:'#94a3b8', marginBottom:'16px' }}>{sub}</div>}
//       {btn && (
//         <button onClick={onBtn} style={{ padding:'10px 22px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
//           {btn}
//         </button>
//       )}
//     </div>
//   );
// }

// export default function DashboardPage() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [attempts,     setAttempts]     = useState([]);
//   const [filter,       setFilter]       = useState('All');
//   const [loading,      setLoading]      = useState(true);
//   const [activeNav,    setActiveNav]    = useState('Dashboard');
//   const [sideOpen,     setSideOpen]     = useState(false);
//   const [sideExpanded, setSideExpanded] = useState(false);
//   const [hoveredCard,  setHoveredCard]  = useState(null);
//   const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768);
//   const [searchQuery,  setSearchQuery]  = useState('');

//   const sidebarRef = useRef(null);

//   useEffect(() => {
//     const onResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       if (isMobile && sideOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
//         setSideOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     document.addEventListener('touchstart', handler);
//     return () => {
//       document.removeEventListener('mousedown', handler);
//       document.removeEventListener('touchstart', handler);
//     };
//   }, [isMobile, sideOpen]);

//   useEffect(() => {
//     if (isMobile) document.body.style.overflow = sideOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; };
//   }, [sideOpen, isMobile]);

//   useEffect(() => {
//     getAttempts()
//       .then(({ data }) => setAttempts(data))
//       .catch(() => toast.error('Could not load attempts'))
//       .finally(() => setLoading(false));
//   }, []);

//   // Filter interviews by search query and category
//   const filtered = INTERVIEWS.filter(iv => {
//     const matchCat    = filter === 'All' || iv.category === filter;
//     const matchSearch = searchQuery === '' ||
//       iv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       iv.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       iv.category.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchCat && matchSearch;
//   });

//   const avgScore  = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.totalScore, 0) / attempts.length) : 0;
//   const bestScore = attempts.length ? Math.max(...attempts.map(a => a.totalScore)) : 0;

//   const toggleSide = () => {
//     if (isMobile) setSideOpen(o => !o);
//     else setSideExpanded(o => !o);
//   };

//   const sideClass = isMobile
//     ? `db-sidebar ${sideOpen ? 'mobile-open' : ''}`
//     : `db-sidebar ${sideExpanded ? 'expanded' : 'icon-only'}`;

//   const mainClass = isMobile
//     ? 'db-main'
//     : `db-main ${sideExpanded ? 'sidebar-full' : 'sidebar-icon'}`;

//   return (
//     <>
//       <style>{globalCSS}</style>
//       <div className="db-root">

//         {/* Mobile overlay */}
//         {isMobile && sideOpen && (
//           <div className="db-overlay" onClick={() => setSideOpen(false)} />
//         )}

//         {/* ── SIDEBAR ── */}
//         <aside ref={sidebarRef} className={sideClass}>
//           <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
//             <span style={{ fontSize:'20px' }}>🎯</span>
//             {(sideExpanded || isMobile) && (
//               <span style={{ color:'#fff', fontWeight:'800', fontSize:'15px', whiteSpace:'nowrap' }}>MockPrep</span>
//             )}
//           </div>

//           <nav style={{ flex:1, paddingTop:'8px' }}>
//             {NAV_ITEMS.map(({ icon, label }) => (
//               <div
//                 key={label}
//                 className={`db-nav-item ${activeNav === label ? 'active' : ''}`}
//                 onClick={() => { setActiveNav(label); if (isMobile) setSideOpen(false); }}
//                 title={label}
//               >
//                 <span style={{ fontSize:'19px', minWidth:'22px', textAlign:'center', flexShrink:0 }}>{icon}</span>
//                 {(sideExpanded || isMobile) && (
//                   <span style={{ fontSize:'14px', fontWeight:'500' }}>{label}</span>
//                 )}
//               </div>
//             ))}
//           </nav>

//           <div style={{ borderTop:'1px solid #1e293b', padding:'14px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
//             <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>
//               {user?.name?.charAt(0).toUpperCase()}
//             </div>
//             {(sideExpanded || isMobile) && (
//               <div style={{ overflow:'hidden', flex:1 }}>
//                 <div style={{ color:'#e2e8f0', fontSize:'12px', fontWeight:'600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                   {user?.name}
//                 </div>
//                 <button
//                   style={{ background:'none', border:'none', color:'#f87171', fontSize:'11px', cursor:'pointer', padding:0, marginTop:'2px' }}
//                   onClick={() => { logout(); navigate('/'); }}
//                 >
//                   Sign out
//                 </button>
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* ── MAIN ── */}
//         <div className={mainClass} style={{ minHeight:'100vh', overflowX:'hidden' }}>

//           {/* ── TOPBAR ── */}
//           <div className="db-topbar">
//             {/* Hamburger */}
//             <button
//               onClick={toggleSide}
//               style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex', flexDirection:'column', gap:'5px', flexShrink:0 }}
//               aria-label="Toggle menu"
//             >
//               <span style={{ display:'block', width:'20px', height:'2px', background:'#475569', borderRadius:'2px' }} />
//               <span style={{ display:'block', width:'16px', height:'2px', background:'#475569', borderRadius:'2px' }} />
//               <span style={{ display:'block', width:'20px', height:'2px', background:'#475569', borderRadius:'2px' }} />
//             </button>

//             {/* Page title */}
//             <div style={{ flex:1, marginLeft:'12px' }}>
//               <div style={{ fontSize:'15px', fontWeight:'700', color:'#0f172a', lineHeight:'1.2' }}>
//                 {activeNav === 'Dashboard'   && `Hey, ${user?.name?.split(' ')[0]} 👋`}
//                 {activeNav === 'My Attempts' && '📋 My Attempts'}
//                 {activeNav === 'Analytics'   && '📊 Analytics'}
//                 {activeNav === 'Settings'    && '⚙️ Settings'}
//               </div>
//               <div style={{ fontSize:'12px', color:'#64748b', marginTop:'1px' }}>
//                 {activeNav === 'Dashboard'   && 'Choose a role and start practicing'}
//                 {activeNav === 'My Attempts' && `${attempts.length} sessions completed`}
//                 {activeNav === 'Analytics'   && 'Your performance overview'}
//                 {activeNav === 'Settings'    && 'Manage your account'}
//               </div>
//             </div>

//             {/* Search — only show on Dashboard */}
//             {activeNav === 'Dashboard' && (
//               <div className="db-search">
//                 <span style={{ fontSize:'14px' }}>🔍</span>
//                 <input
//                   placeholder="Search roles..."
//                   value={searchQuery}
//                   onChange={e => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             )}

//             {/* Avatar */}
//             <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>
//               {user?.name?.charAt(0).toUpperCase()}
//             </div>
//           </div>

//           {/* ── PAGE CONTENT ── */}
//           <div className="db-content">

//             {/* ══════════════════════════════════════
//                 DASHBOARD — search + filters + cards
//                 ══════════════════════════════════════ */}
//             {activeNav === 'Dashboard' && (
//               <>
//                 {/* Category filters */}
//                 <div className="db-filters">
//                   {CATEGORIES.map(c => (
//                     <button
//                       key={c}
//                       onClick={() => setFilter(c)}
//                       style={{
//                         padding:'6px 16px', borderRadius:'99px', fontSize:'13px', fontWeight:'500',
//                         cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
//                         background:  filter === c ? '#3b82f6' : '#fff',
//                         color:       filter === c ? '#fff'    : '#475569',
//                         borderColor: filter === c ? '#3b82f6' : '#e2e8f0',
//                       }}
//                     >
//                       {c}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Interview cards */}
//                 {filtered.length === 0 ? (
//                   <EmptyState
//                     icon="🔍"
//                     title="No results found"
//                     sub={`No interviews match "${searchQuery}"`}
//                     btn="Clear search"
//                     onBtn={() => { setSearchQuery(''); setFilter('All'); }}
//                   />
//                 ) : (
//                   <div className="db-cards">
//                     {filtered.map(iv => (
//                       <div
//                         key={iv.id}
//                         className="db-card"
//                         style={{ background:'#fff', borderRadius:'14px', overflow:'hidden', border:`1px solid ${iv.border}`, display:'flex', flexDirection:'column' }}
//                         onMouseEnter={() => setHoveredCard(iv.id)}
//                         onMouseLeave={() => setHoveredCard(null)}
//                       >
//                         <div style={{ height:'4px', background: iv.color }} />
//                         <div style={{ padding:'16px 16px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//                           <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: iv.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>
//                             {iv.icon}
//                           </div>
//                           <span style={{ fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'99px', color: iv.color, background: iv.bg, border:`1px solid ${iv.border}` }}>
//                             {iv.category}
//                           </span>
//                         </div>
//                         <div style={{ padding:'0 16px 14px', flex:1 }}>
//                           <div style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', marginBottom:'2px' }}>{iv.company}</div>
//                           <div style={{ fontSize:'12px', color:'#64748b' }}>{iv.role}</div>
//                         </div>
//                         <div style={{ padding:'0 12px 12px' }}>
//                           <button
//                             style={{
//                               width:'100%', padding:'9px', border:`2px solid ${iv.color}`,
//                               borderRadius:'10px', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.18s',
//                               background: hoveredCard === iv.id ? iv.color : '#fff',
//                               color:      hoveredCard === iv.id ? '#fff'   : iv.color,
//                             }}
//                             onClick={() => navigate(`/interview/${iv.id}`, { state: iv })}
//                           >
//                             {hoveredCard === iv.id ? 'Start Interview →' : 'Start Interview'}
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </>
//             )}

//             {/* ══════════════════════════════════════
//                 MY ATTEMPTS — full history table
//                 ══════════════════════════════════════ */}
//             {activeNav === 'My Attempts' && (
//               <>
//                 <div className="db-section-header">
//                   <div>
//                     <div style={{ fontSize:'16px', fontWeight:'700', color:'#0f172a' }}>All Interview History</div>
//                     <div style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>Click any row to view full AI feedback and analysis</div>
//                   </div>
//                   {attempts.length > 0 && (
//                     <span style={{ padding:'3px 12px', background:'#eff6ff', color:'#3b82f6', borderRadius:'99px', fontSize:'12px', fontWeight:'600' }}>
//                       {attempts.length} total
//                     </span>
//                   )}
//                 </div>

//                 {loading ? (
//                   <EmptyState icon="⏳" title="Loading..." sub="" />
//                 ) : attempts.length === 0 ? (
//                   <EmptyState
//                     icon="🎯"
//                     title="No attempts yet"
//                     sub="Complete your first interview to see your history here"
//                     btn="Start Practicing →"
//                     onBtn={() => setActiveNav('Dashboard')}
//                   />
//                 ) : (
//                   <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #f1f5f9', overflow:'hidden', marginBottom:'20px' }}>
//                     <div style={{ display:'flex', padding:'10px 16px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>
//                       <span style={{ flex:2 }}>Role &amp; Company</span>
//                       <span className="db-col-cat" style={{ flex:1, textAlign:'center' }}>Category</span>
//                       <span style={{ flex:1, textAlign:'center' }}>Score</span>
//                       <span style={{ flex:1, textAlign:'center' }}>Grade</span>
//                       <span className="db-col-date" style={{ flex:1, textAlign:'right' }}>Date</span>
//                     </div>
//                     {attempts.map((a, i) => (
//                       <AttemptRowFull key={a._id} a={a} i={i} navigate={navigate} />
//                     ))}
//                   </div>
//                 )}
//               </>
//             )}

//             {/* ══════════════════════════════════════
//                 ANALYTICS — stats + charts
//                 ══════════════════════════════════════ */}
//             {activeNav === 'Analytics' && (
//               <>
//                 {/* Stats cards */}
//                 <div className="db-stats" style={{ marginBottom:'20px' }}>
//                   {[
//                     { label:'Total attempts', value: attempts.length,  icon:'📝', color:'#3b82f6', bg:'#eff6ff' },
//                     { label:'Avg. score',     value: `${avgScore}%`,   icon:'📊', color:'#10b981', bg:'#ecfdf5' },
//                     { label:'Best score',     value: `${bestScore}%`,  icon:'🏆', color:'#f59e0b', bg:'#fffbeb' },
//                     {
//                       label:'Pass rate',
//                       value: attempts.length
//                         ? `${Math.round((attempts.filter(a => a.totalScore >= 60).length / attempts.length) * 100)}%`
//                         : '0%',
//                       icon:'✅', color:'#8b5cf6', bg:'#f5f3ff',
//                     },
//                   ].map(({ label, value, icon, color, bg }) => (
//                     <div key={label} style={{ background:'#fff', borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderTop:`3px solid ${color}` }}>
//                       <div style={{ width:'42px', height:'42px', borderRadius:'12px', background: bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
//                         {icon}
//                       </div>
//                       <div>
//                         <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'3px' }}>{label}</div>
//                         <div style={{ fontSize:'22px', fontWeight:'800', color, lineHeight:1 }}>{value}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {attempts.length === 0 ? (
//                   <EmptyState
//                     icon="📊"
//                     title="No data yet"
//                     sub="Complete interviews to see your analytics here"
//                     btn="Start Practicing →"
//                     onBtn={() => setActiveNav('Dashboard')}
//                   />
//                 ) : (
//                   <>
//                     {/* Score by category */}
//                     <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9', marginBottom:'16px' }}>
//                       <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f172a', marginBottom:'16px' }}>📈 Score by Category</div>
//                       {['Full Stack','Frontend','Backend','HR','Sales','General'].map(cat => {
//                         const catAttempts = attempts.filter(a => a.category === cat);
//                         if (catAttempts.length === 0) return null;
//                         const avg = Math.round(catAttempts.reduce((s, a) => s + a.totalScore, 0) / catAttempts.length);
//                         const col = scoreColor(avg);
//                         const bg  = scoreBg(avg);
//                         return (
//                           <div key={cat} style={{ marginBottom:'14px' }}>
//                             <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
//                               <span style={{ fontSize:'13px', fontWeight:'500', color:'#334155' }}>{cat}</span>
//                               <span style={{ fontSize:'12px', fontWeight:'700', color: col, background: bg, padding:'1px 8px', borderRadius:'99px' }}>
//                                 {avg}% · {catAttempts.length} attempt{catAttempts.length > 1 ? 's' : ''}
//                               </span>
//                             </div>
//                             <div style={{ height:'8px', background:'#f1f5f9', borderRadius:'99px', overflow:'hidden' }}>
//                               <div style={{ height:'8px', width:`${avg}%`, background: col, borderRadius:'99px', transition:'width 0.6s ease' }} />
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* Grade distribution */}
//                     <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9', marginBottom:'16px' }}>
//                       <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f172a', marginBottom:'16px' }}>🎓 Grade Distribution</div>
//                       <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
//                         {['A','B','C','D','F'].map(grade => {
//                           const count = attempts.filter(a => a.grade === grade).length;
//                           const gc = grade === 'A' ? '#16a34a' : grade === 'B' ? '#2563eb' : grade === 'C' ? '#d97706' : '#dc2626';
//                           const gb = grade === 'A' ? '#dcfce7' : grade === 'B' ? '#eff6ff'  : grade === 'C' ? '#fef9c3' : '#fee2e2';
//                           return (
//                             <div key={grade} style={{ flex:'1', minWidth:'60px', textAlign:'center', background: gb, borderRadius:'12px', padding:'14px 8px', border:`1px solid ${gc}33` }}>
//                               <div style={{ fontSize:'22px', fontWeight:'800', color: gc }}>{grade}</div>
//                               <div style={{ fontSize:'20px', fontWeight:'700', color:'#0f172a' }}>{count}</div>
//                               <div style={{ fontSize:'10px', color:'#64748b' }}>attempt{count !== 1 ? 's' : ''}</div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                     {/* Recent attempts mini list */}
//                     <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9', marginBottom:'16px' }}>
//                       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
//                         <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f172a' }}>🕐 Recent Sessions</div>
//                         <button
//                           style={{ fontSize:'12px', color:'#3b82f6', background:'none', border:'none', cursor:'pointer', fontWeight:'600' }}
//                           onClick={() => setActiveNav('My Attempts')}
//                         >
//                           View all →
//                         </button>
//                       </div>
//                       {attempts.slice(0, 3).map((a, i) => (
//                         <AttemptRow key={a._id} a={a} i={i} navigate={navigate} />
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </>
//             )}

//             {/* ══════════════════════════════════════
//                 SETTINGS — profile + account
//                 ══════════════════════════════════════ */}
//             {activeNav === 'Settings' && (
//               <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

//                 {/* Profile */}
//                 <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9' }}>
//                   <div style={{ fontSize:'13px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Profile</div>
//                   <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
//                     <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'20px' }}>
//                       {user?.name?.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <div style={{ fontSize:'16px', fontWeight:'700', color:'#0f172a' }}>{user?.name}</div>
//                       <div style={{ fontSize:'13px', color:'#64748b' }}>{user?.email}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Progress */}
//                 <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9' }}>
//                   <div style={{ fontSize:'13px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Your Progress</div>
//                   <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
//                     {[
//                       { label:'Interviews done', value: attempts.length },
//                       { label:'Avg score',       value: `${avgScore}%` },
//                       { label:'Best score',      value: `${bestScore}%` },
//                       { label:'Pass rate',       value: attempts.length ? `${Math.round((attempts.filter(a => a.totalScore >= 60).length / attempts.length) * 100)}%` : '0%' },
//                     ].map(({ label, value }) => (
//                       <div key={label} style={{ background:'#f8fafc', borderRadius:'10px', padding:'12px 14px' }}>
//                         <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'4px' }}>{label}</div>
//                         <div style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a' }}>{value}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Account */}
//                 <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:'1px solid #f1f5f9' }}>
//                   <div style={{ fontSize:'13px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>Account</div>
//                   <button
//                     style={{ padding:'11px 24px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer', width:'100%' }}
//                     onClick={() => { logout(); navigate('/'); }}
//                   >
//                     Sign out of MockPrep
//                   </button>
//                 </div>

//               </div>
//             )}

//           </div>

//           <footer style={{ textAlign:'center', padding:'16px', borderTop:'1px solid #e8eaed', background:'#fff', fontSize:'11px', color:'#94a3b8', marginTop:'8px' }}>
//             © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
//           </footer>
//         </div>
//       </div>
//     </>
//   );
// }


import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ClipboardList, BarChart3, Settings,
  LogOut, Brain, Search, ChevronRight, TrendingUp,
  Zap, Target, Award, Clock, Play, X, Menu,
  Sparkles, ArrowUpRight, BookOpen, Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAttempts } from '../services/api';
import AnimatedCounter from '../components/shared/AnimatedCounter';

const INTERVIEWS = [
  { id:'1', company:'TCS',         role:'Software Engineer',  category:'Full Stack', emoji:'💻', gradient:'from-blue-600/20 to-cyan-600/10',  border:'border-blue-500/20',  tag:'bg-blue-500/10 text-blue-300' },
  { id:'2', company:'Wipro',       role:'Full Stack (MERN)',   category:'Full Stack', emoji:'⚛️', gradient:'from-violet-600/20 to-purple-600/10', border:'border-violet-500/20', tag:'bg-violet-500/10 text-violet-300' },
  { id:'3', company:'Deloitte',    role:'Associate SWE',       category:'Backend',    emoji:'🔧', gradient:'from-emerald-600/20 to-teal-600/10', border:'border-emerald-500/20', tag:'bg-emerald-500/10 text-emerald-300' },
  { id:'4', company:'Infosys',     role:'Frontend Developer',  category:'Frontend',   emoji:'🎨', gradient:'from-amber-600/20 to-yellow-600/10', border:'border-amber-500/20',  tag:'bg-amber-500/10 text-amber-300' },
  { id:'5', company:'HCL',         role:'Full Stack (Java)',   category:'Full Stack', emoji:'☕', gradient:'from-red-600/20 to-rose-600/10',    border:'border-red-500/20',    tag:'bg-red-500/10 text-red-300' },
  { id:'6', company:'Accenture',   role:'Python Developer',    category:'Backend',    emoji:'🐍', gradient:'from-cyan-600/20 to-sky-600/10',    border:'border-cyan-500/20',   tag:'bg-cyan-500/10 text-cyan-300' },
  { id:'7', company:'Any Company', role:'HR Round',            category:'HR',         emoji:'🤝', gradient:'from-pink-600/20 to-rose-600/10',   border:'border-pink-500/20',   tag:'bg-pink-500/10 text-pink-300' },
  { id:'8', company:'Any Company', role:'Sales Interview',     category:'Sales',      emoji:'📈', gradient:'from-orange-600/20 to-amber-600/10',border:'border-orange-500/20', tag:'bg-orange-500/10 text-orange-300' },
];

const CATEGORIES = ['All','Full Stack','Frontend','Backend','HR','Sales'];

const NAV = [
  { icon: LayoutDashboard, label:'Dashboard'   },
  { icon: ClipboardList,   label:'My Attempts' },
  { icon: BarChart3,       label:'Analytics'   },
  { icon: Settings,        label:'Settings'    },
];

const fadeUp = {
  hidden: { opacity:0, y:16 },
  show:   { opacity:1, y:0, transition:{ duration:0.4, ease:'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function ScoreBadge({ score }) {
  const color =
    score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20';
  return (
    <span className={`badge border ${color}`}>{score}%</span>
  );
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

  const avgScore  = attempts.length ? Math.round(attempts.reduce((s,a) => s + a.totalScore, 0) / attempts.length) : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map(a => a.totalScore)) : 0;
  const passRate  = attempts.length ? Math.round(attempts.filter(a => a.totalScore >= 60).length / attempts.length * 100) : 0;

  const toggleSide = () => isMobile ? setSideOpen(o => !o) : setSideExpanded(o => !o);
  const sideW      = isMobile ? 240 : sideExpanded ? 220 : 64;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden">

      {/* ── Overlay ── */}
      <AnimatePresence>
        {isMobile && sideOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSideOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        animate={{
          width: sideW,
          x: isMobile && !sideOpen ? -sideW : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 glow-brand-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          {(sideExpanded || isMobile) && (
            <motion.span
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="font-bold text-base whitespace-nowrap"
            >
              MockPrep
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => { setActiveNav(label); if (isMobile) setSideOpen(false); }}
              title={label}
              className={`nav-item w-full text-left ${activeNav === label ? 'active' : ''}`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" style={{ width:18, height:18 }} />
              {(sideExpanded || isMobile) && (
                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  {label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {(sideExpanded || isMobile) && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.name}</div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-xs text-white/30 hover:text-red-400 transition-colors flex items-center gap-1 mt-0.5"
                >
                  <LogOut className="w-3 h-3" /> Sign out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <motion.div
        className="flex-1 flex flex-col min-w-0"
        animate={{ marginLeft: isMobile ? 0 : sideW }}
        transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
      >

        {/* ── Topbar ── */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3.5"
          style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={toggleSide}
            className="p-2 rounded-xl hover:bg-white/6 transition-colors text-white/50 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-none">
              {activeNav === 'Dashboard'   && `${getGreeting()}, ${user?.name?.split(' ')[0]} 👋`}
              {activeNav === 'My Attempts' && 'My Attempts'}
              {activeNav === 'Analytics'   && 'Analytics'}
              {activeNav === 'Settings'    && 'Settings'}
            </div>
            <div className="text-xs text-white/30 mt-0.5">
              {activeNav === 'Dashboard'   && 'Choose a role and start your mock interview'}
              {activeNav === 'My Attempts' && `${attempts.length} sessions completed`}
              {activeNav === 'Analytics'   && 'Track your performance'}
              {activeNav === 'Settings'    && 'Manage your account'}
            </div>
          </div>

          {activeNav === 'Dashboard' && (
            <div className="hidden sm:flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-white/25 shrink-0" />
              <input
                className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                placeholder="Search companies, roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/25 hover:text-white/50">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">

          {/* ══ DASHBOARD ══ */}
          <AnimatePresence mode="wait">
            {activeNav === 'Dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.3 }}
              >
                {/* Quick stats strip */}
                {attempts.length > 0 && (
                  <motion.div
                    variants={stagger} initial="hidden" animate="show"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
                  >
                    {[
                      { label:'Interviews',  value:attempts.length, suffix:'',  icon:BookOpen,   color:'text-indigo-400', bg:'bg-indigo-500/10' },
                      { label:'Avg Score',   value:avgScore,        suffix:'%', icon:Target,     color:'text-emerald-400', bg:'bg-emerald-500/10' },
                      { label:'Best Score',  value:bestScore,       suffix:'%', icon:Award,      color:'text-amber-400', bg:'bg-amber-500/10' },
                      { label:'Pass Rate',   value:passRate,        suffix:'%', icon:TrendingUp, color:'text-cyan-400', bg:'bg-cyan-500/10' },
                    ].map(({ label, value, suffix, icon:Icon, color, bg }) => (
                      <motion.div key={label} variants={fadeUp} className="stat-card">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-white/35 font-medium">{label}</span>
                          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${color}`} />
                          </div>
                        </div>
                        <div className={`text-2xl font-black ${color}`}>
                          <AnimatedCounter to={value} suffix={suffix} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* AI insight banner */}
                <motion.div
                  variants={fadeUp} initial="hidden" animate="show"
                  className="glass-card rounded-2xl p-4 mb-6 border-gradient relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/8 to-purple-600/4 pointer-events-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 glow-brand-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {attempts.length === 0
                          ? 'Start your first interview'
                          : avgScore >= 70 ? 'Great progress! Keep it up 🔥'
                          : 'Practice makes perfect — keep going!'}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {attempts.length === 0
                          ? 'Pick any company below to begin your AI mock interview'
                          : `You've completed ${attempts.length} interview${attempts.length > 1 ? 's' : ''}. Average score: ${avgScore}%`}
                      </div>
                    </div>
                    {attempts.length > 0 && (
                      <button
                        onClick={() => setActiveNav('Analytics')}
                        className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        View insights <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Category filters */}
                <div className="flex gap-2 flex-wrap mb-5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                        filter === c
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-white/4 text-white/40 border border-white/6 hover:text-white/70 hover:bg-white/8'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Interview cards */}
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                    className="glass-card rounded-2xl p-12 text-center"
                  >
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="font-semibold text-white mb-1">No results found</div>
                    <div className="text-sm text-white/30 mb-4">Try a different search or category</div>
                    <button onClick={() => { setSearch(''); setFilter('All'); }} className="btn-ghost text-xs px-4 py-2">
                      Clear filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={stagger} initial="hidden" animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {filtered.map(iv => (
                      <motion.div
                        key={iv.id}
                        variants={fadeUp}
                        whileHover={{ y:-4, transition:{ duration:0.2 } }}
                        className={`interview-card border ${iv.border}`}
                      >
                        {/* Card gradient top */}
                        <div className={`h-1 w-full bg-gradient-to-r ${iv.gradient.replace('/20','')} opacity-60`} />

                        <div className={`p-4 bg-gradient-to-b ${iv.gradient}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl">{iv.emoji}</div>
                            <span className={`badge ${iv.tag}`}>
                              {iv.category}
                            </span>
                          </div>
                          <div className="font-bold text-white mb-0.5">{iv.company}</div>
                          <div className="text-xs text-white/45 mb-4">{iv.role}</div>

                          <div className="flex items-center gap-2 text-xs text-white/25 mb-4">
                            <Zap className="w-3 h-3" />
                            <span>AI Generated · 8 Questions</span>
                          </div>

                          <motion.button
                            whileTap={{ scale:0.97 }}
                            onClick={() => navigate(`/interview/${iv.id}`, { state: iv })}
                            className="w-full btn-primary py-2 text-xs justify-center"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Interview
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══ MY ATTEMPTS ══ */}
            {activeNav === 'My Attempts' && (
              <motion.div key="attempts" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold">Interview History</h2>
                    <p className="text-xs text-white/30 mt-0.5">Click any row to view full AI feedback</p>
                  </div>
                  {attempts.length > 0 && (
                    <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {attempts.length} total
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : attempts.length === 0 ? (
                  <EmptyState
                    icon="📋" title="No interviews yet"
                    sub="Complete your first interview to see your history here"
                    btn="Start Practicing" onBtn={() => setActiveNav('Dashboard')}
                  />
                ) : (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-semibold text-white/25 uppercase tracking-wider">
                      <span className="col-span-5">Role & Company</span>
                      <span className="col-span-2 text-center hidden sm:block">Category</span>
                      <span className="col-span-2 text-center">Score</span>
                      <span className="col-span-2 text-center hidden md:block">Grade</span>
                      <span className="col-span-1 text-right hidden lg:block">Date</span>
                    </div>
                    {attempts.map((a, i) => (
                      <motion.div
                        key={a._id}
                        initial={{ opacity:0, x:-10 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => navigate(`/results/${a._id}`, { state:{ attempt:a } })}
                        className="grid grid-cols-12 px-5 py-3.5 border-b border-white/4 last:border-0 cursor-pointer hover:bg-white/3 transition-colors group items-center"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-sm font-bold shrink-0">
                            {a.company?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{a.role}</div>
                            <div className="text-xs text-white/30">{a.company}</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-center hidden sm:block">
                          <span className="badge bg-white/4 text-white/40 text-xs">{a.category}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <ScoreBadge score={a.totalScore} />
                        </div>
                        <div className="col-span-2 text-center hidden md:block">
                          <span className="text-sm font-bold" style={{
                            color: a.grade==='A'?'#22c55e':a.grade==='B'?'#6366f1':a.grade==='C'?'#f59e0b':'#ef4444'
                          }}>{a.grade||'—'}</span>
                        </div>
                        <div className="col-span-1 text-right text-xs text-white/25 hidden lg:block">
                          {new Date(a.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ ANALYTICS ══ */}
            {activeNav === 'Analytics' && (
              <motion.div key="analytics" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                {attempts.length === 0 ? (
                  <EmptyState icon="📊" title="No data yet"
                    sub="Complete interviews to see your analytics"
                    btn="Start Practicing" onBtn={() => setActiveNav('Dashboard')} />
                ) : (
                  <>
                    <motion.div variants={stagger} initial="hidden" animate="show"
                      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      {[
                        { label:'Total',    value:attempts.length, suffix:'',  icon:BookOpen,   color:'text-indigo-400', bg:'bg-indigo-500/10' },
                        { label:'Average',  value:avgScore,        suffix:'%', icon:Target,     color:'text-emerald-400', bg:'bg-emerald-500/10' },
                        { label:'Best',     value:bestScore,       suffix:'%', icon:Award,      color:'text-amber-400', bg:'bg-amber-500/10' },
                        { label:'Pass Rate',value:passRate,        suffix:'%', icon:TrendingUp, color:'text-cyan-400', bg:'bg-cyan-500/10' },
                      ].map(({ label, value, suffix, icon:Icon, color, bg }) => (
                        <motion.div key={label} variants={fadeUp} className="stat-card">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/35">{label}</span>
                            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                              <Icon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                          </div>
                          <div className={`text-2xl font-black ${color}`}>
                            <AnimatedCounter to={value} suffix={suffix} />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Score by category */}
                    <div className="glass-card rounded-2xl p-5 mb-4">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" /> Score by Category
                      </h3>
                      <div className="space-y-4">
                        {['Full Stack','Frontend','Backend','HR','Sales'].map(cat => {
                          const ca  = attempts.filter(a => a.category === cat);
                          if (!ca.length) return null;
                          const avg = Math.round(ca.reduce((s,a) => s+a.totalScore,0)/ca.length);
                          const col = avg>=70?'#22c55e':avg>=50?'#6366f1':'#f59e0b';
                          return (
                            <div key={cat}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-medium text-white/60">{cat}</span>
                                <span className="text-xs font-bold" style={{ color:col }}>
                                  {avg}% · {ca.length}
                                </span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width:0 }} animate={{ width:`${avg}%` }}
                                  transition={{ duration:1, ease:'easeOut', delay:0.2 }}
                                  className="h-full rounded-full"
                                  style={{ background:col, boxShadow:`0 0 8px ${col}60` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Grade distribution */}
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" /> Grade Distribution
                      </h3>
                      <div className="flex gap-3">
                        {['A','B','C','D','F'].map(g => {
                          const n   = attempts.filter(a => a.grade===g).length;
                          const col = g==='A'?'#22c55e':g==='B'?'#6366f1':g==='C'?'#f59e0b':'#ef4444';
                          const bg  = g==='A'?'rgba(34,197,94,0.1)':g==='B'?'rgba(99,102,241,0.1)':g==='C'?'rgba(245,158,11,0.1)':'rgba(239,68,68,0.1)';
                          return (
                            <div key={g} className="flex-1 rounded-xl p-3 text-center border border-white/6"
                              style={{ background:bg }}>
                              <div className="text-xl font-black" style={{ color:col }}>{g}</div>
                              <div className="text-base font-bold text-white mt-0.5">{n}</div>
                              <div className="text-xs text-white/25 mt-0.5">attempt{n!==1?'s':''}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══ SETTINGS ══ */}
            {activeNav === 'Settings' && (
              <motion.div key="settings" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="max-w-lg space-y-4">
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Profile</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-black">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user?.name}</div>
                      <div className="text-sm text-white/35">{user?.email}</div>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Progress</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:'Interviews', value:attempts.length   },
                      { label:'Avg Score',  value:`${avgScore}%`   },
                      { label:'Best Score', value:`${bestScore}%`  },
                      { label:'Pass Rate',  value:`${passRate}%`   },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-white/30 mb-1">{label}</div>
                        <div className="font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Account</div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="btn-danger w-full justify-center"
                  >
                    <LogOut className="w-4 h-4" /> Sign out of MockPrep
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="px-6 py-4 border-t border-white/4 text-center text-xs text-white/15">
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong className="text-white/25">Dheeraj Kumar</strong>
        </footer>
      </motion.div>
    </div>
  );
}

function EmptyState({ icon, title, sub, btn, onBtn }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
      className="glass-card rounded-2xl p-12 text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <div className="font-semibold text-white mb-1">{title}</div>
      {sub && <div className="text-sm text-white/30 mb-5">{sub}</div>}
      {btn && (
        <button onClick={onBtn} className="btn-primary mx-auto">
          {btn} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}