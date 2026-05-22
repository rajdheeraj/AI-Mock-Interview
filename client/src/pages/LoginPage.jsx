import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width:'100%', padding:'12px 16px', borderRadius:'10px',
    border: focused === name ? '2px solid #3b82f6' : '2px solid #e2e8f0',
    fontSize:'14px', boxSizing:'border-box', outline:'none',
    background: focused === name ? '#fff' : '#f8fafc',
    transition:'all 0.2s', color:'#0f172a',
  });

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>🎯 MockPrep</div>
          <h2 style={s.leftTitle}>Welcome back,<br/>keep practicing!</h2>
          <p style={s.leftSub}>
            Your next big interview is closer than you think. Login and continue your preparation.
          </p>
          <div style={s.statsGrid}>
            {[
              ['8+',   'Companies'],
              ['6',    'Role types'],
              ['100%', 'Free to use'],
              ['AI',   'Powered'],
            ].map(([val, label]) => (
              <div key={label} style={s.statBox}>
                <div style={s.statVal}>{val}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardTop}>
            <h1 style={s.title}>Sign in to MockPrep</h1>
            <p style={s.subtitle}>Continue your interview preparation</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                style={inputStyle('email')}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={inputStyle('password')}
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                required
              />
            </div>

            <button
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
              onMouseEnter={e => e.target.style.background='#1d4ed8'}
              onMouseLeave={e => e.target.style.background='#3b82f6'}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={s.switchText}>
            No account yet?{' '}
            <Link to="/register" style={s.link}>Create one free</Link>
          </p>

          <div style={s.divider}><span style={s.dividerText}>Mock interviews for top Indian IT companies</span></div>
          <div style={s.companies}>
            {['TCS','Wipro','Deloitte','Infosys','HCL','Accenture'].map(c => (
              <span key={c} style={s.companyChip}>{c}</span>
            ))}
          </div>
        </div>

        <footer style={s.footer}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
        </footer>
      </div>
    </div>
  );
}

const s = {
  page:      { display:'flex', flexDirection:'column', minHeight:'100vh', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  left:      { display:'none' },  // hide left panel on mobile
  leftInner: { maxWidth:'360px' },
  brand:     { fontSize:'22px', fontWeight:'800', color:'#fff', marginBottom:'40px' },
  leftTitle: { fontSize:'32px', fontWeight:'800', color:'#fff', lineHeight:'1.3', margin:'0 0 16px' },
  leftSub:   { fontSize:'15px', color:'#bfdbfe', lineHeight:'1.7', margin:'0 0 32px' },
  statsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  statBox:   { background:'rgba(255,255,255,0.12)', borderRadius:'12px', padding:'16px', textAlign:'center' },
  statVal:   { fontSize:'24px', fontWeight:'800', color:'#fff', marginBottom:'4px' },
  statLabel: { fontSize:'12px', color:'#bfdbfe' },
  right:     { flex:1, background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px' },
  card:      { background:'#fff', borderRadius:'16px', padding:'28px 20px', width:'100%', maxWidth:'420px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  cardTop:   { marginBottom:'28px' },
  title:     { fontSize:'24px', fontWeight:'800', color:'#0f172a', margin:'0 0 6px' },
  subtitle:  { fontSize:'14px', color:'#64748b', margin:0 },
  form:      { display:'flex', flexDirection:'column', gap:'16px' },
  field:     { display:'flex', flexDirection:'column', gap:'6px' },
  label:     { fontSize:'13px', fontWeight:'600', color:'#374151' },
  btn:       { padding:'13px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer', transition:'background 0.2s', marginTop:'4px' },
  switchText:{ textAlign:'center', fontSize:'13px', color:'#64748b', marginTop:'20px' },
  link:      { color:'#3b82f6', fontWeight:'600', textDecoration:'none' },
  divider:   { textAlign:'center', borderTop:'1px solid #f1f5f9', paddingTop:'16px', marginTop:'20px' },
  dividerText:{ fontSize:'11px', color:'#94a3b8' },
  companies: { display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center', marginTop:'10px' },
  companyChip:{ padding:'3px 10px', background:'#f1f5f9', color:'#475569', borderRadius:'99px', fontSize:'11px', fontWeight:'500' },
  footer:    { marginTop:'20px', fontSize:'12px', color:'#94a3b8', textAlign:'center' },
};