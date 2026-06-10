import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
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

  return (
    <div className="min-h-screen bg-surface-950 text-white flex">

      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-surface-900 to-surface-950 border-r border-white/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">MockPrep</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black leading-tight mb-4">
            Welcome back.<br />
            <span className="gradient-text">Keep practicing.</span>
          </h2>
          <p className="text-white/40 text-lg mb-8">
            Your next opportunity is closer than you think.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val:'8+',   label:'Companies'     },
              { val:'AI',   label:'Evaluation'    },
              { val:'Free', label:'Forever'       },
              { val:'📱',   label:'Mobile Ready'  },
            ].map(({ val, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{val}</div>
                <div className="text-xs text-white/30 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/20">
          © {new Date().getFullYear()} MockPrep by Dheeraj Kumar
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">MockPrep</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1">Sign in</h1>
            <p className="text-sm text-white/40">Continue your interview preparation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  className="input-field pl-10"
                  type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  className="input-field pl-10 pr-10"
                  type={showPwd ? 'text' : 'password'} placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            No account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-xs text-white/20 mb-3">Trusted for</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['TCS','Wipro','Infosys','Deloitte'].map(co => (
                <span key={co} className="glass px-3 py-1 rounded-md text-xs text-white/30">{co}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}