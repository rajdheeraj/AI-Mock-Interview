import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [loadingMessage, setLoadingMessage] = useState('Creating account...');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Creating account...');

    const slowTimer = setTimeout(() => {
      setLoadingMessage('Waking up server, almost there...');
    }, 3000);

    try {
      const { data } = await registerUser(form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#0a0f1e', color:'#fff', fontFamily:'Inter, sans-serif' }}>

      {/* Left panel — branding */}
      <div style={{
        display:'none', flex:1, flexDirection:'column', justifyContent:'space-between',
        padding:'48px', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
        borderRight:'1px solid rgba(255,255,255,0.06)',
      }} className="auth-left">
        <div style={{ position:'absolute', top:'20%', left:'10%', width:260, height:260, background:'radial-gradient(circle,rgba(99,102,241,0.15),transparent)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'15%', width:220, height:220, background:'radial-gradient(circle,rgba(6,182,212,0.1),transparent)', borderRadius:'50%' }} />

        <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>🧠</div>
          <span style={{ fontSize:20, fontWeight:800 }}>MockPrep</span>
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:36, fontWeight:900, lineHeight:1.2, margin:'0 0 16px' }}>
            Welcome back.<br />
            <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Keep practicing.
            </span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:28 }}>
            Your next opportunity is closer than you think.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { val:'8+',   label:'Companies'    },
              { val:'AI',   label:'Evaluation'   },
              { val:'Free', label:'Forever'      },
              { val:'📱',   label:'Mobile Ready' },
            ].map(({ val, label }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900, color:'#a5b4fc' }}>{val}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize:11, color:'rgba(255,255,255,0.15)', position:'relative', zIndex:1 }}>
          © {new Date().getFullYear()} MockPrep by Dheeraj Kumar
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ width:'100%', maxWidth:380 }}>

          <div className="auth-mobile-brand" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🧠</div>
            <span style={{ fontSize:18, fontWeight:800 }}>MockPrep</span>
          </div>

          <h1 style={{ fontSize:26, fontWeight:900, margin:'0 0 6px' }}>Sign in</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:28 }}>
            Continue your interview preparation
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.45)', display:'block', marginBottom:6 }}>Email</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.45)', display:'block', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  style={{ ...inputStyle, paddingRight:42 }}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:14, padding:0 }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

           <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', padding:'13px', borderRadius:12, fontSize:14, fontWeight:700,
                color:'#fff', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow:'0 0 24px rgba(99,102,241,0.3)', marginTop:4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? loadingMessage : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:24 }}>
            No account?{' '}
            <Link to="/register" style={{ color:'#a5b4fc', fontWeight:600, textDecoration:'none' }}>
              Create one free
            </Link>
          </p>

          <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', marginBottom:10 }}>Trusted for</p>
            <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
              {['TCS','Wipro','Infosys','Deloitte'].map(co => (
                <span key={co} style={{ fontSize:11, padding:'3px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)' }}>
                  {co}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-left { display: flex !important; }
          .auth-mobile-brand { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px', borderRadius:11, fontSize:13,
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
  color:'#fff', outline:'none', boxSizing:'border-box', fontFamily:'inherit',
};