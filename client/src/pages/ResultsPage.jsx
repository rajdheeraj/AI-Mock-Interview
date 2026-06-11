// 
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, ChevronDown, CheckCircle,
         AlertTriangle, Lightbulb, RotateCcw, TrendingUp } from 'lucide-react';
import { ScoreRing } from '../components/ui/ScoreRing';

const fadeUp = {
  hidden: { opacity:0, y:16 },
  show:   { opacity:1, y:0, transition:{ duration:0.5, ease:'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren:0.08 } } };

export default function ResultsPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const attempt    = state?.attempt;
  const [expanded, setExpanded] = useState(null);

  if (!attempt) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="glass-card rounded-2xl p-10 text-center max-w-sm">
        <div className="text-4xl mb-4">📋</div>
        <div className="font-semibold text-white mb-4">No results found</div>
        <button className="btn-primary mx-auto" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );

  const gradeColor = {
    A:'text-emerald-400', B:'text-indigo-400', C:'text-amber-400',
    D:'text-orange-400',  F:'text-red-400'
  }[attempt.grade] || 'text-white';

  const gradeLabel = {
    A:'Excellent',B:'Good',C:'Average',D:'Below Average',F:'Needs Work'
  }[attempt.grade] || '';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      </div>

      {/* Nav */}
      <div className="relative z-10 sticky top-0" style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">MockPrep</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-xs px-3 py-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-5">

        {/* ── Hero Score ── */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="glass-card rounded-2xl p-6 md:p-8 border-gradient relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/6 to-purple-600/4 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="shrink-0">
              <ScoreRing score={attempt.totalScore} size={160} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="badge bg-white/5 text-white/50 border border-white/8 text-xs">
                  {attempt.category}
                </span>
                <span className="text-xs text-white/25">
                  {new Date(attempt.createdAt).toLocaleDateString('en-IN',{
                    day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'
                  })}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{attempt.role}</h1>
              <p className="text-white/40 mb-4">@ {attempt.company}</p>

              {attempt.grade && (
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className={`text-4xl font-black ${gradeColor}`}>{attempt.grade}</span>
                  <span className={`text-sm font-semibold ${gradeColor} opacity-70`}>{gradeLabel}</span>
                </div>
              )}

              <p className="text-sm text-white/50 leading-relaxed max-w-lg">
                {attempt.feedback}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Stronger / Weaker ── */}
        {(attempt.strongerSections?.length > 0 || attempt.weakerSections?.length > 0) && (
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="grid md:grid-cols-2 gap-4"
          >
            {attempt.strongerSections?.length > 0 && (
              <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-emerald-500/15">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">Stronger Areas</span>
                </div>
                <div className="space-y-2.5">
                  {attempt.strongerSections.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-xs text-white/60 leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {attempt.weakerSections?.length > 0 && (
              <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-red-500/15">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-sm font-semibold text-red-400">Areas to Improve</span>
                </div>
                <div className="space-y-2.5">
                  {attempt.weakerSections.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      </div>
                      <span className="text-xs text-white/60 leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Improvement Areas ── */}
        {attempt.improvementAreas?.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-semibold">Action Plan</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {attempt.improvementAreas.map((item, i) => {
                const pColor =
                  item.priority==='High'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  item.priority==='Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                             'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                return (
                  <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-white">{item.topic}</span>
                      <span className={`badge border text-xs shrink-0 ${pColor}`}>{item.priority}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">→ {item.suggestion}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Answer Breakdown ── */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold">Answer Breakdown</h2>
            <span className="badge bg-white/4 text-white/30 text-xs">{attempt.answers.length} questions</span>
          </div>

          <div className="space-y-3">
            {attempt.answers.map((a, i) => {
              const sc    = a.score >= 70 ? '#22c55e' : a.score >= 50 ? '#6366f1' : '#ef4444';
              const sbg   = a.score >= 70 ? 'rgba(34,197,94,0.08)' : a.score >= 50 ? 'rgba(99,102,241,0.08)' : 'rgba(239,68,68,0.08)';
              const open  = expanded === i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden border border-white/5"
                >
                  {/* Question header */}
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left"
                    onClick={() => setExpanded(open ? null : i)}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: sbg, color: sc }}
                    >
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/80 truncate">{a.question}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-sm font-bold"
                        style={{ color: sc }}
                      >
                        {a.score}%
                      </span>
                      <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.2 }}>
                        <ChevronDown className="w-4 h-4 text-white/25" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height:0, opacity:0 }}
                        animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }}
                        transition={{ duration:0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                          {/* Your answer */}
                          <div className="bg-white/3 rounded-xl p-4">
                            <div className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-2">Your Answer</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                              {a.answer || <span className="italic text-white/25">No answer given</span>}
                            </p>
                          </div>

                          {/* Feedback grid */}
                          {a.feedback && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="bg-emerald-500/6 rounded-xl p-4 border border-emerald-500/15">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-semibold text-emerald-400">What was good</span>
                                </div>
                                <p className="text-xs text-white/55 leading-relaxed">{a.strength}</p>
                              </div>
                              <div className="bg-amber-500/6 rounded-xl p-4 border border-amber-500/15">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="text-xs font-semibold text-amber-400">What to improve</span>
                                </div>
                                <div className="space-y-1.5">
                                  {a.improvement?.split('.').filter(p=>p.trim().length>5).slice(0,3).map((pt,j)=>(
                                    <div key={j} className="flex items-start gap-2">
                                      <span className="w-4 h-4 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0 mt-0.5">{j+1}</span>
                                      <span className="text-xs text-white/50">{pt.trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ideal answer */}
                          {a.idealAnswer && (
                            <div className="bg-indigo-500/6 rounded-xl p-4 border border-indigo-500/15">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-xs font-semibold text-indigo-400">Strong answer looks like</span>
                              </div>
                              <p className="text-xs text-white/55 leading-relaxed">{a.idealAnswer}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pb-8">
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
        </div>

        <div className="text-center text-xs text-white/15 pb-4">
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong className="text-white/25">Dheeraj Kumar</strong>
        </div>
      </div>
    </div>
  );
}