import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Mic, Camera, Brain, BarChart3, Shield,
  ArrowRight, Star, CheckCircle, Zap, Globe,
} from 'lucide-react';

/* ─── Animation tokens ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

/* ─── Data ──────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Brain,     color: 'blue',    title: 'AI Question Generation',  desc: 'Groq AI generates role-specific fresher questions every session — never the same set twice.' },
  { icon: Mic,       color: 'emerald', title: 'Voice Recognition',        desc: 'Answer by speaking naturally. AI reads each question aloud for a fully hands-free experience.' },
  { icon: Camera,    color: 'purple',  title: 'Live Camera Monitoring',   desc: 'Real interview feel with live camera feedback. Nothing is recorded or stored.' },
  { icon: BarChart3, color: 'amber',   title: 'AI Evaluation & Scoring',  desc: 'Scores, grades, stronger/weaker sections, and improvement areas — per answer.' },
  { icon: Shield,    color: 'cyan',    title: 'Secure & Private',         desc: 'JWT auth, hashed passwords, zero data selling. Your practice stays yours.' },
  { icon: Globe,     color: 'rose',    title: 'Mobile & Desktop',         desc: 'Fully responsive. Practice on your phone before a morning interview.' },
];

const STEPS = [
  { title: 'Pick your company',         desc: 'Choose from TCS, Wipro, Deloitte, Infosys, HCL, Accenture, HR, or Sales roles.' },
  { title: 'AI builds your question set', desc: 'Eight personalised fresher-level questions generated in under 3 seconds.' },
  { title: 'Answer by voice or text',   desc: 'Speak or type. Live camera keeps you focused. 3-minute timer per question.' },
  { title: 'Review AI feedback',        desc: 'Detailed score, grade, section breakdown, and model answers for every question.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',  role: 'Got placed at TCS',   stars: 5, text: 'MockPrep showed me exactly where I was weak. Walked into TCS feeling genuinely ready.' },
  { name: 'Rahul M.',  role: 'Wipro — Full Stack',  stars: 5, text: 'The voice feature is unlike anything else. Practiced 10+ sessions — my pacing improved massively.' },
  { name: 'Anjali K.', role: 'Infosys — Frontend',  stars: 5, text: 'The live camera adds real pressure. First time I was nervous in a mock, which prepared me perfectly.' },
];

const COMPANIES = ['TCS', 'Wipro', 'Deloitte', 'Infosys', 'HCL', 'Accenture'];

const COLOR_MAP = {
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: 'text-purple-400'  },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'text-amber-400'   },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: 'text-cyan-400'    },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    icon: 'text-rose-400'    },
};

/* ─── Sub-components ────────────────────────────────────────────── */
function MockInterviewCard() {
  return (
    <div className="glass rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-white/8">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-surface-900/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 bg-white/5 rounded-md h-6 mx-4 flex items-center px-3">
          <span className="text-xs text-white/20">mockprep.app/interview</span>
        </div>
      </div>

      {/* Main panel */}
      <div className="p-5 bg-surface-900/80">
        {/* Top meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">Recording</span>
          </div>
          <div className="text-xs text-white/30 font-mono">2:15 left</div>
          <span className="text-xs text-blue-400 font-medium">Q 3 / 8</span>
        </div>

        {/* Question */}
        <div className="glass rounded-xl p-4 mb-3 border border-white/5">
          <p className="text-sm text-white/80 leading-relaxed">
            Explain the difference between{' '}
            <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">let</code>,{' '}
            <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">var</code>, and{' '}
            <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">const</code>{' '}
            in JavaScript.
          </p>
        </div>

        {/* Two-column: answer + camera */}
        <div className="grid grid-cols-5 gap-3">
          {/* Answer box */}
          <div className="col-span-3 space-y-3">
            <div className="bg-white/4 border border-white/6 rounded-xl p-3 h-20 flex items-start">
              <span className="text-xs text-white/20 mt-0.5">Speak or type your answer…</span>
            </div>
            {/* Waveform */}
            <div className="flex items-end gap-0.5 h-8 px-1">
              {[3,5,8,5,10,7,4,9,6,3,8,5,3,7,9,4].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-blue-500/40"
                  style={{ height: `${h * 3}px`, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Camera + score */}
          <div className="col-span-2 space-y-2">
            <div className="glass rounded-xl overflow-hidden aspect-video bg-surface-800/80 flex items-center justify-center border border-white/5">
              <div className="text-center">
                <Camera className="w-5 h-5 text-white/15 mx-auto mb-1" />
                <span className="text-[10px] text-white/20">Live Camera</span>
              </div>
            </div>
            <div className="glass rounded-xl p-2.5 border border-white/5 space-y-1.5">
              <div className="text-[10px] text-white/30 font-medium mb-1">Session score</div>
              {[['Clarity', 82, 'blue'], ['Depth', 67, 'emerald'], ['Pace', 90, 'purple']].map(([label, pct, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[9px] text-white/30 w-9">{label}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c === 'blue' ? 'bg-blue-500' : c === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-white/40 w-5 text-right">{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/5 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-600/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-hero-pattern opacity-40" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-12 lg:px-16 py-4 border-b border-white/5 backdrop-blur-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">MockPrep</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
          {['Features', 'How it works', 'Companies'].map(item => (
            <button key={item} className="hover:text-white/80 transition-colors duration-200">
              {item}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 rounded-lg"
          >
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="btn-primary text-sm px-4 py-2"
          >
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════════
          HERO  — true two-column on desktop
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-20 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Left: copy ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="text-center lg:text-left"
            >
              {/* AI badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-blue-300 mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by Groq AI
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-5">
                Ace your next
                <br />
                <span className="gradient-text">tech interview</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-white/45 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                AI mock interviews with real-time voice recognition, live camera pressure,
                and personalised per-answer feedback. Built for freshers. Free forever.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register')}
                  className="btn-primary text-base px-7 py-3.5 animate-pulse-glow"
                >
                  Start practicing free <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="btn-ghost text-base px-7 py-3.5"
                >
                  Sign in
                </motion.button>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-white/30">
                {[
                  { icon: CheckCircle, text: 'Free forever', color: 'text-emerald-400' },
                  { icon: CheckCircle, text: 'No credit card', color: 'text-emerald-400' },
                  { icon: CheckCircle, text: '8+ companies', color: 'text-emerald-400' },
                ].map(({ icon: Icon, text, color }) => (
                  <span key={text} className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: mock UI ── */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
              className="w-full"
            >
              <MockInterviewCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPANIES  — slim logo strip
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-white/25 mb-6 uppercase tracking-widest font-medium">
            Practice for placements at
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMPANIES.map((co, i) => (
              <motion.div
                key={co}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.06, borderColor: 'rgba(255,255,255,0.18)' }}
                className="glass border border-white/8 px-5 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white/70 transition-colors cursor-default"
              >
                {co}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 glass border border-white/8 rounded-full px-4 py-1.5 text-xs text-blue-300 font-medium mb-5">
              <Zap className="w-3.5 h-3.5" /> Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
              Interview prep,{' '}
              <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto">
              Stop reading theory. Start practicing like it's real.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => {
              const c = COLOR_MAP[color];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass border border-white/6 hover:border-white/12 rounded-2xl p-6 flex flex-col gap-4 group transition-colors cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1.5 text-sm">{title}</h3>
                    <p className="text-xs text-white/38 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-white/38 text-base max-w-sm mx-auto">
              From zero to interview-ready in four steps.
            </p>
          </motion.div>

          {/* Desktop: 4-column grid. Mobile: vertical stack */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass border border-white/6 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Large number watermark */}
                <div className="text-6xl font-black text-white/4 leading-none font-mono absolute top-3 right-4 select-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Step dot */}
                <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                </div>
                <div className="z-10">
                  <h3 className="font-semibold text-white mb-1.5 text-sm leading-snug">{title}</h3>
                  <p className="text-xs text-white/38 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Loved by <span className="gradient-text">freshers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, stars, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass border border-white/6 rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">"{text}"</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-300">{name[0]}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{name}</div>
                    <div className="text-[10px] text-white/30">{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass border border-white/8 rounded-3xl p-12 md:p-16 relative overflow-hidden text-center"
          >
            {/* Gradient blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/12 via-transparent to-cyan-500/8 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 glass border border-blue-500/20 rounded-full px-4 py-1.5 text-xs text-blue-300 font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" /> No credit card required
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                Ready to <span className="gradient-text">ace it?</span>
              </h2>
              <p className="text-white/38 mb-8 text-base max-w-sm mx-auto">
                Free forever. Start your first AI mock interview in under 30 seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="btn-primary text-base px-9 py-4 mx-auto animate-pulse-glow"
              >
                Start free now <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">MockPrep</span>
          </div>
          <p className="text-xs text-white/20 text-center">
            © {new Date().getFullYear()} MockPrep · All rights reserved to{' '}
            <strong className="text-white/38">Dheeraj Kumar</strong>
          </p>
          <div className="flex gap-5 text-xs text-white/20">
            <button className="hover:text-white/50 transition-colors">Privacy</button>
            <button className="hover:text-white/50 transition-colors">Terms</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
