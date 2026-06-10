import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mic, Camera, Brain, BarChart3, Shield,
         ArrowRight, Star, CheckCircle, Zap, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">

      {/* ── Background effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-hero-pattern opacity-40" />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">MockPrep</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {['Features','How it works','Companies'].map(item => (
            <button key={item} className="hover:text-white transition-colors">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="btn-primary text-sm"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-300 mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Groq AI · LLaMA 3.1
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            Ace your next
            <br />
            <span className="gradient-text">tech interview</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered mock interviews with real-time evaluation, voice recognition,
            and personalized feedback. Built for freshers. Free forever.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="btn-primary text-base px-8 py-4 animate-pulse-glow"
            >
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="btn-ghost text-base px-8 py-4"
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-12 text-sm text-white/30">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> 8+ companies
            </span>
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-1 shadow-2xl shadow-blue-500/10 animate-pulse-glow">
            <div className="bg-surface-900 rounded-xl overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md h-6 mx-4 flex items-center px-3">
                  <span className="text-xs text-white/20">mockprep.app/interview</span>
                </div>
              </div>
              {/* Mock interview screen */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs text-blue-400 font-medium mb-2">Question 3 / 8</div>
                    <div className="text-sm text-white/80 leading-relaxed">
                      What is the difference between <code className="text-blue-300 bg-blue-500/10 px-1 rounded">let</code>, <code className="text-blue-300 bg-blue-500/10 px-1 rounded">var</code> and <code className="text-blue-300 bg-blue-500/10 px-1 rounded">const</code> in JavaScript?
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 h-20 flex items-start">
                    <span className="text-xs text-white/20 mt-1">Type your answer or use voice input...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      Recording...
                    </div>
                    <div className="text-xs text-white/30 font-mono">2:15 remaining</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="glass rounded-xl overflow-hidden aspect-video bg-surface-800 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-6 h-6 text-white/20 mx-auto mb-1" />
                      <span className="text-xs text-white/20">Live Camera</span>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-3 space-y-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 rounded-full ${i <= 2 ? 'bg-emerald-500' : i === 3 ? 'bg-blue-500' : 'bg-white/10'}`} style={{ width: i <= 2 ? '100%' : i === 3 ? '60%' : '100%' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Companies ── */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm text-white/30 mb-8 uppercase tracking-widest">
            Practice for top companies
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {['TCS','Wipro','Deloitte','Infosys','HCL','Accenture'].map(co => (
              <motion.div
                key={co}
                whileHover={{ scale: 1.05 }}
                className="glass px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors cursor-default"
              >
                {co}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-300 mb-6">
              <Zap className="w-4 h-4" /> Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Interview prep,{' '}
              <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Stop reading theory. Start practicing like it's real.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain,    color: 'blue',    title: 'AI Question Generation',  desc: 'Groq AI generates role-specific fresher questions every time — never the same set.' },
              { icon: Mic,      color: 'emerald', title: 'Voice Recognition',        desc: 'Answer by speaking naturally. AI reads questions aloud for a hands-free experience.' },
              { icon: Camera,   color: 'purple',  title: 'Live Camera Monitoring',   desc: 'Real interview feel with live camera. Nothing is recorded or stored.' },
              { icon: BarChart3,color: 'amber',   title: 'AI Evaluation & Scoring',  desc: 'Get scores, grades, stronger/weaker sections, and improvement areas per answer.' },
              { icon: Shield,   color: 'cyan',    title: 'Secure & Private',         desc: 'JWT authentication, hashed passwords. Your data stays yours.' },
              { icon: Globe,    color: 'rose',    title: 'Mobile & Desktop',         desc: 'Fully responsive. Practice anywhere — phone, tablet, or laptop.' },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}
                className="glass rounded-2xl p-6 group cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { step:'01', title:'Choose your role',         desc:'Pick from 8 companies — TCS, Wipro, Deloitte, Infosys, HCL, Accenture, HR or Sales.' },
              { step:'02', title:'AI generates questions',   desc:'Groq AI creates 8 personalized fresher-level questions specific to your role and company.' },
              { step:'03', title:'Answer by voice or text',  desc:'Speak or type your answers. Live camera keeps you focused. 3-minute timer per question.' },
              { step:'04', title:'Get AI feedback',          desc:'Detailed score, grade, stronger/weaker sections, and ideal answers for every question.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 flex items-start gap-5"
              >
                <span className="text-3xl font-black text-white/10 font-mono leading-none mt-1">{step}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-white/40">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-center mb-12"
          >
            Loved by <span className="gradient-text">freshers</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name:'Priya S.',    role:'Got placed at TCS',    text:'MockPrep helped me answer confidently. The AI feedback showed exactly where I was weak.' },
              { name:'Rahul M.',    role:'Wipro — Full Stack',   text:'The voice feature is amazing. It feels like a real interview. Practiced 10+ times before my actual interview.' },
              { name:'Anjali K.',   role:'Infosys — Frontend',   text:'The camera feature adds real pressure. First time I felt nervous in a mock, which prepared me perfectly.' },
            ].map(({ name, role, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-white/30">{role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">
                Ready to <span className="gradient-text">ace it?</span>
              </h2>
              <p className="text-white/40 mb-8">
                Free forever. No credit card. Start practicing in 30 seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="btn-primary text-base px-10 py-4 mx-auto"
              >
                Start Free Now <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">MockPrep</span>
          </div>
          <p className="text-xs text-white/20 text-center">
            © {new Date().getFullYear()} MockPrep · All rights reserved to <strong className="text-white/40">Dheeraj Kumar</strong>
          </p>
          <div className="flex gap-4 text-xs text-white/20">
            <button className="hover:text-white/50 transition-colors">Privacy</button>
            <button className="hover:text-white/50 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}