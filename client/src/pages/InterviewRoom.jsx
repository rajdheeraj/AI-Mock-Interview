import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveAttempt, generateQuestions, evaluateAnswers } from '../services/api';

const TIMER_SECONDS = 180;

const CATEGORY_COLORS = {
  'Full Stack': { color:'#3b82f6', bg:'#eff6ff', light:'#dbeafe' },
  Frontend:     { color:'#f59e0b', bg:'#fffbeb', light:'#fde68a' },
  Backend:      { color:'#10b981', bg:'#ecfdf5', light:'#a7f3d0' },
  HR:           { color:'#ec4899', bg:'#fdf2f8', light:'#fbcfe8' },
  Sales:        { color:'#f97316', bg:'#fff7ed', light:'#fed7aa' },
  General:      { color:'#8b5cf6', bg:'#f5f3ff', light:'#ddd6fe' },
};

export default function InterviewRoom() {
  const { state: interview } = useLocation();
  const navigate = useNavigate();

  const theme = CATEGORY_COLORS[interview?.category] || CATEGORY_COLORS['General'];

  const [questions,        setQuestions]        = useState([]);
  const [loadingQ,         setLoadingQ]         = useState(false);
  const [step,             setStep]             = useState(0);
  const [answers,          setAnswers]          = useState([]);
  const [current,          setCurrent]          = useState('');
  const [listening,        setListening]        = useState(false);
  const [timeLeft,         setTimeLeft]         = useState(TIMER_SECONDS);
  const [submitting,       setSubmitting]       = useState(false);
  const [started,          setStarted]          = useState(false);
  const [muted,            setMuted]            = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('idle');

  const recognitionRef = useRef(null);
  const timerRef       = useRef(null);
  const videoRef       = useRef(null);
  const streamRef      = useRef(null);
  const mutedRef       = useRef(false);

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // ── FETCH QUESTIONS ──────────────────────────────────────────────
  useEffect(() => {
    if (permissionStatus !== 'granted') return;
    setLoadingQ(true);
    generateQuestions({
      role:     interview?.role     || 'Software Engineer',
      company:  interview?.company  || 'General',
      category: interview?.category || 'General',
    })
      .then(({ data }) => {
        setQuestions(data.questions);
        toast.success('Questions ready!');
      })
      .catch(() => {
        toast.error('Using default questions.');
        setQuestions([
          'Tell me about yourself and your experience.',
          'What are your key technical strengths?',
          'Describe a challenging project you worked on.',
          'How do you handle tight deadlines?',
          'Where do you see yourself in 3 years?',
          'What is your biggest professional achievement?',
          'How do you keep your technical skills up to date?',
        ]);
      })
      .finally(() => setLoadingQ(false));
  }, [permissionStatus]);

  // ── SPEECH ──────────────────────────────────────────────────────
  const speak = (text, onDone) => {
    if (mutedRef.current) { if (onDone) onDone(); return; }
    window.speechSynthesis.cancel();
    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = 'en-US';
    utterance.rate   = 0.92;
    utterance.pitch  = 1;
    utterance.volume = 1;
    const voices     = window.speechSynthesis.getVoices();
    const preferred  = voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      (v.lang === 'en-US' && v.localService)
    );
    if (preferred) utterance.voice = preferred;
    if (onDone) utterance.onend = onDone;
    window.speechSynthesis.speak(utterance);
  };

  // ── PERMISSIONS ─────────────────────────────────────────────────
  const requestPermissions = async () => {
    setPermissionStatus('asking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(t => t.enabled = false);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionStatus('granted');
    } catch (err) {
      setPermissionStatus('denied');
      toast.error('Camera/mic access denied.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  // ── START INTERVIEW ──────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    setTimeout(() => {
      speak(
        `Welcome to your ${interview?.role} interview at ${interview?.company}. Here is your first question. ${questions[0]}`
      );
    }, 800);
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
    };
  }, [started]);

  // ── TIMER ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) { handleNext(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, started]);

  // ── STEP CHANGE ──────────────────────────────────────────────────
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
    setCurrent('');
    stopListening();
    if (started && step > 0 && questions.length > 0) {
      setTimeout(() => {
        speak(`Question ${step + 1}. ${questions[step]}`);
      }, 400);
    }
  }, [step]);

  // ── VOICE INPUT ──────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported. Please type.'); return; }
    window.speechSynthesis.cancel();
    const r          = new SR();
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'en-US';
    r.onresult = (e) => {
      setCurrent(Array.from(e.results).map(x => x[0].transcript).join(''));
    };
    r.onerror = () => { setListening(false); toast.error('Voice error. Try typing.'); };
    r.onend   = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── SCORING (fallback only) ──────────────────────────────────────
  const scoreAnswer = (text) => {
    const w = text.trim().split(/\s+/).length;
    if (w >= 60) return Math.floor(Math.random() * 20) + 80;
    if (w >= 30) return Math.floor(Math.random() * 20) + 60;
    if (w >= 10) return Math.floor(Math.random() * 20) + 40;
    return Math.floor(Math.random() * 20) + 20;
  };

  // ── NEXT ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!current.trim()) {
      toast.error('Please give an answer before moving on.');
      return;
    }
    const saved = [
      ...answers,
      { question: questions[step], answer: current, score: scoreAnswer(current) }
    ];
    setAnswers(saved);
    if (step + 1 < questions.length) {
      setStep(s => s + 1);
    } else {
      submitInterview(saved);
    }
  };

  // ── SUBMIT ───────────────────────────────────────────────────────
  const submitInterview = async (finalAnswers) => {
    speak('Thank you for completing the interview. Our AI is now analyzing your answers. Please wait.');
    stopCamera();
    stopListening();
    clearTimeout(timerRef.current);
    setSubmitting(true);

    try {
      // Step 1 — AI evaluates all answers
      const { data: evaluation } = await evaluateAnswers({
        role:     interview?.role     || 'Software Engineer',
        company:  interview?.company  || 'General',
        category: interview?.category || 'General',
        answers:  finalAnswers,
      });

      // Step 2 — Merge AI scores into answers
      const scoredAnswers = finalAnswers.map((a, i) => ({
        ...a,
        score:       evaluation.answers[i]?.score       ?? 50,
        feedback:    evaluation.answers[i]?.feedback    ?? '',
        strength:    evaluation.answers[i]?.strength    ?? '',
        improvement: evaluation.answers[i]?.improvement ?? '',
        idealAnswer: evaluation.answers[i]?.idealAnswer ?? '',
      }));

      // Step 3 — Save to MongoDB with all new fields
      const { data } = await saveAttempt({
        company:          interview?.company  || 'General',
        role:             interview?.role     || 'Software Engineer',
        category:         interview?.category || 'General',
        answers:          scoredAnswers,
        totalScore:       evaluation.overallScore,
        feedback:         evaluation.overallFeedback,
        grade:            evaluation.grade,
        strongerSections: evaluation.strongerSections || [],
        weakerSections:   evaluation.weakerSections   || [],
        improvementAreas: evaluation.improvementAreas || [],
      });

      toast.success('AI evaluation complete!');
      navigate(`/results/${data._id}`, {
        state: { attempt: data, evaluation }
      });

    } catch (err) {
      toast.error('AI evaluation failed. Saving with basic scoring.');
      const totalScore = Math.round(
        finalAnswers.reduce((s, a) => s + (a.score || 50), 0) / finalAnswers.length
      );
      try {
        const { data } = await saveAttempt({
          company:          interview?.company  || 'General',
          role:             interview?.role     || 'Software Engineer',
          category:         interview?.category || 'General',
          answers:          finalAnswers,
          totalScore,
          feedback:         'AI evaluation unavailable. Basic scoring applied.',
          grade:            totalScore >= 90 ? 'A' : totalScore >= 75 ? 'B' : totalScore >= 60 ? 'C' : 'D',
          strongerSections: [],
          weakerSections:   [],
          improvementAreas: [],
        });
        navigate(`/results/${data._id}`, { state: { attempt: data } });
      } catch {
        toast.error('Failed to save attempt.');
        setSubmitting(false);
      }
    }
  };

  // ── GUARD ────────────────────────────────────────────────────────
  if (!interview) return (
    <div style={s.fullCenter}>
      <p style={{ color:'#64748b' }}>No interview selected.</p>
      <button
        style={{ padding:'11px 24px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  );

  // ── SCREEN 1 — PERMISSION ────────────────────────────────────────
  if (permissionStatus !== 'granted') return (
    <div style={s.prePage}>
      <nav style={s.nav}>
        <div style={s.navBrand}>🎯 MockPrep</div>
        <div style={s.navLinks}>
          <button style={s.navLink} onClick={() => { window.speechSynthesis.cancel(); navigate('/'); }}>Home</button>
          <button style={s.navLink} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={s.navLink} onClick={() => { window.speechSynthesis.cancel(); navigate(-1); }}>← Back</button>
          <button style={s.navLinkAbout}>About</button>
        </div>
      </nav>
      <div style={s.preCenter}>
        <div style={s.preCard}>
          <div style={{ ...s.accentBar, background: theme.color }} />
          <div style={s.preCardInner}>
            <span style={{ ...s.categoryBadge, color: theme.color, background: theme.bg, border:`1px solid ${theme.light}` }}>
              {interview?.category}
            </span>
            <h1 style={s.preTitle}>{interview?.role}</h1>
            <p style={s.preCompany}>@ {interview?.company}</p>
            <div style={ps.permGrid}>
              {[
                { icon:'📹', label:'Camera',     desc:'Required for live monitoring' },
                { icon:'🎤', label:'Microphone', desc:'Required for voice answers'   },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{
                  ...ps.permCard,
                  border: permissionStatus === 'granted' ? '2px solid #16a34a'
                        : permissionStatus === 'denied'  ? '2px solid #dc2626'
                        : `2px solid ${theme.light}`,
                }}>
                  <div style={{ ...ps.permIcon, background: theme.bg }}>{icon}</div>
                  <div style={ps.permLabel}>{label}</div>
                  <div style={ps.permDesc}>{desc}</div>
                  <div style={{
                    ...ps.permStatus,
                    color: permissionStatus === 'granted' ? '#16a34a'
                         : permissionStatus === 'denied'  ? '#dc2626'
                         : '#64748b',
                  }}>
                    {permissionStatus === 'idle'    && '⚪ Not requested'}
                    {permissionStatus === 'asking'  && '🟡 Requesting...'}
                    {permissionStatus === 'granted' && '🟢 Access granted'}
                    {permissionStatus === 'denied'  && '🔴 Access denied'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...s.instructBox, background: theme.bg, border:`1px solid ${theme.light}` }}>
              <p style={{ ...s.instructTitle, color: theme.color }}>Why we need access</p>
              {[
                '📹  Camera shows your live feed during the interview',
                '🎤  Microphone enables voice-based answers',
                '🔒  Nothing is recorded or stored on our servers',
                '💡  You can still type answers if you prefer',
              ].map(tip => (
                <div key={tip} style={s.instructRow}>{tip}</div>
              ))}
            </div>
            {permissionStatus === 'denied' ? (
              <div style={ps.deniedBox}>
                <p style={ps.deniedTitle}>⚠️ Permission denied</p>
                <p style={ps.deniedText}>
                  Please allow camera and microphone in your browser settings, then refresh the page.
                </p>
                <button
                  style={{ ...s.startBtnBig, background:'#dc2626' }}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <button
                style={{
                  ...s.startBtnBig,
                  background: permissionStatus === 'asking' ? '#94a3b8' : theme.color,
                  cursor: permissionStatus === 'asking' ? 'not-allowed' : 'pointer',
                }}
                disabled={permissionStatus === 'asking'}
                onClick={requestPermissions}
              >
                {permissionStatus === 'idle' ? '🔐 Allow Camera & Microphone' : '⏳ Waiting for permission...'}
              </button>
            )}
          </div>
        </div>
      </div>
      <footer style={s.footer}>
        <p style={s.footerText}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
        </p>
      </footer>
    </div>
  );

  // ── SCREEN 2 — LOADING QUESTIONS ─────────────────────────────────
  if (loadingQ) return (
    <div style={s.fullCenter}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>🤖</div>
      <h2 style={{ color:'#0f172a', margin:'0 0 8px', fontFamily:'sans-serif', textAlign:'center' }}>
        Generating your questions...
      </h2>
      <p style={{ color:'#64748b', fontSize:'14px', fontFamily:'sans-serif', textAlign:'center', maxWidth:'360px', lineHeight:'1.6' }}>
        Groq AI is preparing personalized questions for{' '}
        <strong>{interview?.role}</strong> at <strong>{interview?.company}</strong>
      </p>
      <div style={{ marginTop:'24px', display:'flex', gap:'8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width:'12px', height:'12px', borderRadius:'50%',
            background: theme.color,
            animation: `pulse ${0.6 + i * 0.2}s infinite alternate`,
          }} />
        ))}
      </div>
    </div>
  );

  // ── SCREEN 3 — PRE-START INFO ────────────────────────────────────
  if (!started) return (
    <div style={s.prePage}>
      <nav style={s.nav}>
        <div style={s.navBrand}>🎯 MockPrep</div>
        <div style={s.navLinks}>
          <button style={s.navLink} onClick={() => navigate('/')}>Home</button>
          <button style={s.navLink} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={s.navLink} onClick={() => navigate(-1)}>← Back</button>
          <button style={s.navLinkAbout}>About</button>
        </div>
      </nav>
      <div style={s.preCenter}>
        <div style={s.preCard}>
          <div style={{ ...s.accentBar, background: theme.color }} />
          <div style={s.preCardInner}>
            <span style={{ ...s.categoryBadge, color: theme.color, background: theme.bg, border:`1px solid ${theme.light}` }}>
              {interview.category}
            </span>
            <h1 style={s.preTitle}>{interview.role}</h1>
            <p style={s.preCompany}>@ {interview.company}</p>
            <div style={s.statsRow}>
              {[
                { icon:'❓', label:'Questions',    val: questions.length    },
                { icon:'⏱️', label:'Per question', val: `${TIMER_SECONDS}s` },
                { icon:'🎤', label:'Input',        val: 'Voice / Type'      },
                { icon:'🤖', label:'Scored',       val: 'Groq AI'           },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ ...s.statBox, borderColor: theme.light }}>
                  <span style={s.statBoxIcon}>{icon}</span>
                  <span style={s.statBoxVal}>{val}</span>
                  <span style={s.statBoxLabel}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ ...s.instructBox, background: theme.bg, border:`1px solid ${theme.light}` }}>
              <p style={{ ...s.instructTitle, color: theme.color }}>Before you begin</p>
              {[
                '✅  Camera & microphone access already granted',
                '🤖  Groq AI generated your questions',
                '🔊  AI will read each question aloud',
                '🎤  Use voice input or type your answers',
                '⏰  Timer auto-submits when it hits zero',
                '💾  Results are saved to your profile',
              ].map(tip => (
                <div key={tip} style={s.instructRow}>{tip}</div>
              ))}
            </div>
            <button
              style={{ ...s.startBtnBig, background: theme.color }}
              onClick={() => setStarted(true)}
            >
              Start Interview →
            </button>
          </div>
        </div>
      </div>
      <footer style={s.footer}>
        <p style={s.footerText}>
          © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
        </p>
      </footer>
    </div>
  );

  // ── SCREEN 4 — INTERVIEW ROOM ────────────────────────────────────
  const progress   = (step / questions.length) * 100;
  const timerColor = timeLeft <= 30 ? '#dc2626' : timeLeft <= 60 ? '#d97706' : '#16a34a';
  const timerBg    = timeLeft <= 30 ? '#fef2f2' : timeLeft <= 60 ? '#fffbeb' : '#f0fdf4';

  return (
    <div style={s.roomPage}>
      <div style={{ ...s.roomNav, borderBottom:`3px solid ${theme.color}` }}>
        <div style={s.roomNavLeft}>
          <span style={s.roomBrand}>🎯 MockPrep</span>
          <span style={{ ...s.roomBadge, color: theme.color, background: theme.bg }}>
            {interview.company} · {interview.role}
          </span>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button
            style={{
              padding:'7px 16px',
              background: muted ? '#fee2e2' : '#f0fdf4',
              color:      muted ? '#dc2626' : '#16a34a',
              border:'none', borderRadius:'8px',
              fontSize:'13px', cursor:'pointer', fontWeight:'600',
            }}
            onClick={() => {
              if (!muted) window.speechSynthesis.cancel();
              setMuted(m => !m);
            }}
          >
            {muted ? '🔇 Muted' : '🔊 AI Voice'}
          </button>
          <div style={{ ...s.timerBox, background: timerBg, color: timerColor }}>
            ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div style={s.progressWrap}>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width:`${progress}%`, background: theme.color }} />
        </div>
        <span style={s.progressLabel}>Q{step + 1} / {questions.length}</span>
      </div>

      <div style={s.roomGrid}>
        <div style={s.roomLeft}>
          <div style={{ ...s.qCard, borderLeft:`4px solid ${theme.color}` }}>
            <span style={{ ...s.qBadge, color: theme.color, background: theme.bg }}>
              Question {step + 1}
            </span>
            <p style={s.qText}>{questions[step]}</p>
          </div>

          <textarea
            style={s.textarea}
            placeholder="Type your answer here, or click Start Voice below..."
            value={current}
            onChange={e => setCurrent(e.target.value)}
            rows={7}
          />

          <div style={s.voiceRow}>
            {!listening ? (
              <button style={{ ...s.voiceBtn, background: theme.color }} onClick={startListening}>
                🎤 Start Voice
              </button>
            ) : (
              <button style={{ ...s.voiceBtn, background:'#dc2626' }} onClick={stopListening}>
                ⏹ Stop Voice
              </button>
            )}
            {listening && <span style={s.listeningPill}>● Recording...</span>}
            <div style={s.charCount}>
              {current.length} chars · ~{current.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          <div style={s.actionRow}>
            <button style={s.skipBtn} onClick={() => setCurrent('I need to skip this question.')}>
              Skip
            </button>
            <button
              style={{ ...s.nextBtn, background: theme.color }}
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? 'AI Evaluating...'
                : step + 1 === questions.length
                ? '✓ Submit Interview'
                : 'Next →'}
            </button>
          </div>
        </div>

        <div style={s.roomRight}>
          <div style={s.camWrap}>
            <video ref={videoRef} autoPlay muted playsInline style={s.video} />
            <div style={s.camOverlayTop}>
              <span style={s.recPill}>
                <span style={s.recDot} /> LIVE
              </span>
            </div>
            <div style={{ ...s.camOverlayBottom, background: theme.color }}>
              {interview.company} Interview
            </div>
          </div>

          <div style={s.pillsWrap}>
            <p style={s.pillsLabel}>Progress</p>
            <div style={s.pillsRow}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  ...s.pill,
                  background: i < step ? '#16a34a' : i === step ? theme.color : '#e2e8f0',
                  transform:  i === step ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
            <div style={s.pillLegend}>
              {[['#16a34a','Done'],[theme.color,'Current'],['#e2e8f0','Upcoming']].map(([c,l]) => (
                <span key={l} style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: c }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ ...s.tipsBox, borderColor: theme.light }}>
            <p style={{ ...s.tipsTitle, color: theme.color }}>💡 Quick tips</p>
            <p style={s.tipText}>Give detailed answers — longer responses score higher.</p>
            <p style={s.tipText}>Structure: situation → action → result.</p>
            <p style={s.tipText}>AI reads each question — listen carefully.</p>
          </div>
        </div>
      </div>

      <footer style={s.roomFooter}>
        © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
      </footer>
    </div>
  );
}

const s = {
  prePage:          { minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  nav:              { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 32px', background:'#fff', borderBottom:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  navBrand:         { fontSize:'18px', fontWeight:'700', color:'#0f172a' },
  navLinks:         { display:'flex', gap:'4px', alignItems:'center' },
  navLink:          { background:'none', border:'none', padding:'7px 14px', fontSize:'13px', color:'#475569', cursor:'pointer', borderRadius:'8px', fontWeight:'500' },
  navLinkAbout:     { background:'#f1f5f9', border:'none', padding:'7px 14px', fontSize:'13px', color:'#334155', cursor:'pointer', borderRadius:'8px', fontWeight:'500' },
  preCenter:        { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 16px' },
  preCard:          { background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'560px', boxShadow:'0 4px 32px rgba(0,0,0,0.08)', overflow:'hidden' },
  accentBar:        { height:'5px', width:'100%' },
  preCardInner:     { padding:'36px 40px', display:'flex', flexDirection:'column', gap:'20px', alignItems:'center', textAlign:'center' },
  categoryBadge:    { padding:'4px 16px', borderRadius:'99px', fontSize:'12px', fontWeight:'600', letterSpacing:'0.5px' },
  preTitle:         { fontSize:'30px', fontWeight:'800', color:'#0f172a', margin:0 },
  preCompany:       { fontSize:'15px', color:'#64748b', margin:0 },
  statsRow:         { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', width:'100%' },
  statBox:          { border:'1.5px solid', borderRadius:'10px', padding:'12px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  statBoxIcon:      { fontSize:'18px' },
  statBoxVal:       { fontSize:'13px', fontWeight:'700', color:'#0f172a' },
  statBoxLabel:     { fontSize:'10px', color:'#94a3b8' },
  instructBox:      { width:'100%', borderRadius:'12px', padding:'16px 20px', textAlign:'left' },
  instructTitle:    { fontSize:'13px', fontWeight:'700', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.5px' },
  instructRow:      { fontSize:'13px', color:'#475569', lineHeight:'2' },
  startBtnBig:      { width:'100%', padding:'15px', color:'#fff', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.3px' },
  footer:           { textAlign:'center', padding:'16px', borderTop:'1px solid #e2e8f0', background:'#fff' },
  footerText:       { fontSize:'12px', color:'#94a3b8', margin:0 },
  fullCenter:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px', fontFamily:'sans-serif' },
  roomPage:         { minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  roomNav:          { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#fff' },
  roomNavLeft:      { display:'flex', alignItems:'center', gap:'12px' },
  roomBrand:        { fontSize:'16px', fontWeight:'700', color:'#0f172a' },
  roomBadge:        { fontSize:'12px', padding:'4px 12px', borderRadius:'99px', fontWeight:'500' },
  timerBox:         { fontSize:'22px', fontWeight:'700', padding:'8px 20px', borderRadius:'10px', fontVariantNumeric:'tabular-nums' },
  progressWrap:     { display:'flex', alignItems:'center', gap:'12px', padding:'10px 24px', background:'#fff', borderBottom:'1px solid #f1f5f9' },
  progressTrack:    { flex:1, height:'6px', background:'#e2e8f0', borderRadius:'99px', overflow:'hidden' },
  progressFill:     { height:'6px', borderRadius:'99px', transition:'width 0.4s' },
  progressLabel:    { fontSize:'12px', color:'#64748b', fontWeight:'500', minWidth:'60px', textAlign:'right' },
  roomGrid:         { display:'grid', gridTemplateColumns:'1fr 290px', gap:'20px', padding:'20px 24px', flex:1 },
  roomLeft:         { display:'flex', flexDirection:'column', gap:'14px' },
  roomRight:        { display:'flex', flexDirection:'column', gap:'12px' },
  qCard:            { background:'#fff', borderRadius:'12px', padding:'20px 24px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' },
  qBadge:           { fontSize:'11px', fontWeight:'700', padding:'3px 12px', borderRadius:'99px', display:'inline-block', marginBottom:'10px', letterSpacing:'0.5px' },
  qText:            { fontSize:'18px', fontWeight:'600', color:'#0f172a', margin:0, lineHeight:'1.6' },
  textarea:         { width:'100%', padding:'16px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'15px', lineHeight:'1.7', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', background:'#fff', outline:'none' },
  voiceRow:         { display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' },
  voiceBtn:         { padding:'10px 20px', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontWeight:'600' },
  listeningPill:    { color:'#dc2626', fontSize:'13px', fontWeight:'600', background:'#fef2f2', padding:'6px 14px', borderRadius:'99px' },
  charCount:        { marginLeft:'auto', fontSize:'11px', color:'#94a3b8' },
  actionRow:        { display:'flex', justifyContent:'space-between', alignItems:'center' },
  skipBtn:          { padding:'10px 20px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontWeight:'500' },
  nextBtn:          { padding:'12px 28px', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer' },
  camWrap:          { borderRadius:'14px', overflow:'hidden', position:'relative', background:'#0f172a', aspectRatio:'4/3' },
  video:            { width:'100%', height:'100%', objectFit:'cover', display:'block', transform:'scaleX(-1)' },
  camOverlayTop:    { position:'absolute', top:'10px', left:'10px', right:'10px', display:'flex', justifyContent:'space-between' },
  recPill:          { display:'flex', alignItems:'center', gap:'6px', background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'99px', letterSpacing:'1px' },
  recDot:           { width:'7px', height:'7px', borderRadius:'50%', background:'#ef4444', display:'inline-block', animation:'pulse 1.2s infinite' },
  camOverlayBottom: { position:'absolute', bottom:0, left:0, right:0, color:'#fff', fontSize:'12px', fontWeight:'500', padding:'8px 14px', textAlign:'center' },
  pillsWrap:        { background:'#fff', borderRadius:'12px', padding:'14px 16px' },
  pillsLabel:       { fontSize:'11px', fontWeight:'600', color:'#94a3b8', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.5px' },
  pillsRow:         { display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' },
  pill:             { width:'26px', height:'8px', borderRadius:'99px', transition:'all 0.3s' },
  pillLegend:       { display:'flex', gap:'10px' },
  legendItem:       { display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'#64748b' },
  legendDot:        { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  tipsBox:          { background:'#fff', borderRadius:'12px', padding:'14px 16px', border:'1.5px solid' },
  tipsTitle:        { fontSize:'12px', fontWeight:'700', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.5px' },
  tipText:          { fontSize:'12px', color:'#64748b', margin:'0 0 6px', lineHeight:'1.5' },
  roomFooter:       { textAlign:'center', padding:'14px', borderTop:'1px solid #e2e8f0', background:'#fff', fontSize:'12px', color:'#94a3b8' },
};

const ps = {
  permGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%' },
  permCard:    { borderRadius:'14px', padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', background:'#fff', transition:'border 0.3s' },
  permIcon:    { width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' },
  permLabel:   { fontSize:'15px', fontWeight:'700', color:'#0f172a' },
  permDesc:    { fontSize:'12px', color:'#64748b', textAlign:'center' },
  permStatus:  { fontSize:'12px', fontWeight:'600', marginTop:'4px' },
  deniedBox:   { width:'100%', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'16px 20px', textAlign:'center' },
  deniedTitle: { fontSize:'15px', fontWeight:'700', color:'#dc2626', margin:'0 0 6px' },
  deniedText:  { fontSize:'13px', color:'#ef4444', margin:'0 0 14px', lineHeight:'1.6' },
};