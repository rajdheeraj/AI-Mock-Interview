import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveAttempt, generateQuestions, evaluateAnswers } from '../services/api';

const TIMER_SECONDS = 180;

const CATEGORY_COLORS = {
  'Full Stack': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', light: 'rgba(59,130,246,0.25)' },
  Frontend:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', light: 'rgba(245,158,11,0.25)' },
  Backend:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)', light: 'rgba(16,185,129,0.25)' },
  HR:           { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', light: 'rgba(236,72,153,0.25)' },
  Sales:        { color: '#f97316', bg: 'rgba(249,115,22,0.12)', light: 'rgba(249,115,22,0.25)' },
  General:      { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', light: 'rgba(139,92,246,0.25)' },
};

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function InterviewRoom() {
  const { state: interview } = useLocation();
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 768;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(t => (t.enabled = false));
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionStatus('granted');
    } catch {
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
        `Welcome to your ${interview?.role} interview at ${interview?.company}. Here is your first question. ${questions[0]}. Now click Start Voice to answer, or type your answer in the box below.`
      );
    }, 800);
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // ── TIMER ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) { handleNext(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, started]);

  // ── STEP CHANGE ──────────────────────────────────────────────────
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
    setCurrent('');
    stopListening();
  if (started && step > 0 && questions.length > 0) {
      setTimeout(() => {
        speak(`Question ${step + 1}. ${questions[step]}. Now click Start Voice to answer, or type your answer in the box below.`);
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── VOICE INPUT ──────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported. Please type.'); return; }
    window.speechSynthesis.cancel();
    const r = new SR();
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'en-US';
    let finalTranscript = '';
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interim += t;
        }
      }
      setCurrent(finalTranscript + interim);
    };
    r.onerror = (err) => {
      console.error('Speech error:', err.error);
      setListening(false);
      toast.error('Voice error. Try typing.');
    };
    r.onend = () => { setListening(false); };
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
    if (text.trim() === 'I need to skip this question.') return 0;
    const w = text.trim().split(/\s+/).length;
    if (w >= 60) return Math.floor(Math.random() * 20) + 80;
    if (w >= 30) return Math.floor(Math.random() * 20) + 60;
    if (w >= 10) return Math.floor(Math.random() * 20) + 40;
    return Math.floor(Math.random() * 20) + 20;
  };

  // ── NEXT ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!current.trim()) {
      toast.error('Please give an answer or click Skip to move on.');
      return;
    }
    const saved = [
      ...answers,
      { question: questions[step], answer: current, score: scoreAnswer(current) },
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
      const { data: evaluation } = await evaluateAnswers({
        role:     interview?.role     || 'Software Engineer',
        company:  interview?.company  || 'General',
        category: interview?.category || 'General',
        answers:  finalAnswers,
      });
      const scoredAnswers = finalAnswers.map((a, i) => ({
        ...a,
        score:       evaluation.answers[i]?.score       ?? 50,
        feedback:    evaluation.answers[i]?.feedback    ?? '',
        strength:    evaluation.answers[i]?.strength    ?? '',
        improvement: evaluation.answers[i]?.improvement ?? '',
        idealAnswer: evaluation.answers[i]?.idealAnswer ?? '',
      }));
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
      navigate(`/results/${data._id}`, { state: { attempt: data, evaluation } });
    } catch {
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
  if (!interview) {
    return (
      <div style={gs.fullCenter}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No interview selected.</p>
        <button style={gs.backBtn} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── SCREEN 1 — PERMISSION ────────────────────────────────────────
  if (permissionStatus !== 'granted') {
    return (
      <div style={gs.page}>
        <PreNav navigate={navigate} />
        <div style={gs.centerWrap}>
          <div style={gs.card}>
            <div style={{ ...gs.accentBar, background: theme.color }} />
            <div style={gs.cardBody}>
              <span style={{ ...gs.badge, color: theme.color, background: theme.bg, border: `1px solid ${theme.light}` }}>
                {interview?.category}
              </span>
              <h1 style={gs.cardTitle}>{interview?.role}</h1>
              <p style={gs.cardSub}>@ {interview?.company}</p>
              <div style={gs.permGrid}>
                {[
                  { icon: '📹', label: 'Camera',     desc: 'Required for live monitoring' },
                  { icon: '🎤', label: 'Microphone', desc: 'Required for voice answers'   },
                ].map(({ icon, label, desc }) => (
                  <div
                    key={label}
                    style={{
                      ...gs.permCard,
                      borderColor:
                        permissionStatus === 'granted' ? '#16a34a'
                        : permissionStatus === 'denied' ? '#dc2626'
                        : theme.light,
                    }}
                  >
                    <div style={{ ...gs.permIcon, background: theme.bg }}>{icon}</div>
                    <div style={gs.permLabel}>{label}</div>
                    <div style={gs.permDesc}>{desc}</div>
                    <div style={{
                      ...gs.permStatus,
                      color:
                        permissionStatus === 'granted' ? '#16a34a'
                        : permissionStatus === 'denied' ? '#dc2626'
                        : 'rgba(255,255,255,0.3)',
                    }}>
                      {permissionStatus === 'idle'    && '⚪ Not requested'}
                      {permissionStatus === 'asking'  && '🟡 Requesting…'}
                      {permissionStatus === 'granted' && '🟢 Access granted'}
                      {permissionStatus === 'denied'  && '🔴 Access denied'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...gs.infoBox, background: theme.bg, border: `1px solid ${theme.light}` }}>
                <p style={{ ...gs.infoTitle, color: theme.color }}>Why we need access</p>
                {[
                  '📹  Camera shows your live feed during the interview',
                  '🎤  Microphone enables voice-based answers',
                  '🔒  Nothing is recorded or stored on our servers',
                  '💡  You can still type answers if you prefer',
                ].map(tip => <div key={tip} style={gs.infoRow}>{tip}</div>)}
              </div>
              {permissionStatus === 'denied' ? (
                <div style={gs.deniedBox}>
                  <p style={gs.deniedTitle}>⚠️ Permission denied</p>
                  <p style={gs.deniedDesc}>
                    Please allow camera and microphone in your browser settings, then refresh.
                  </p>
                  <button
                    style={{ ...gs.primaryBtn, background: '#dc2626' }}
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                </div>
              ) : (
                <button
                  style={{
                    ...gs.primaryBtn,
                    background: permissionStatus === 'asking' ? 'rgba(255,255,255,0.1)' : theme.color,
                    cursor: permissionStatus === 'asking' ? 'not-allowed' : 'pointer',
                  }}
                  disabled={permissionStatus === 'asking'}
                  onClick={requestPermissions}
                >
                  {permissionStatus === 'idle' ? '🔐 Allow Camera & Microphone' : '⏳ Waiting for permission…'}
                </button>
              )}
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ── SCREEN 2 — LOADING QUESTIONS ─────────────────────────────────
  if (loadingQ) {
    return (
      <div style={gs.fullCenter}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🤖</div>
        <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>
          Generating your questions…
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', maxWidth: '360px', lineHeight: '1.6', margin: 0 }}>
          Groq AI is preparing personalised questions for{' '}
          <strong style={{ color: theme.color }}>{interview?.role}</strong> at{' '}
          <strong style={{ color: theme.color }}>{interview?.company}</strong>
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: theme.color,
                opacity: 0.5 + i * 0.25,
                animation: `pulse 0.8s ease-in-out ${i * 0.2}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── SCREEN 3 — PRE-START INFO ────────────────────────────────────
  if (!started) {
    return (
      <div style={gs.page}>
        <PreNav navigate={navigate} />
        <div style={gs.centerWrap}>
          <div style={gs.card}>
            <div style={{ ...gs.accentBar, background: theme.color }} />
            <div style={gs.cardBody}>
              <span style={{ ...gs.badge, color: theme.color, background: theme.bg, border: `1px solid ${theme.light}` }}>
                {interview.category}
              </span>
              <h1 style={gs.cardTitle}>{interview.role}</h1>
              <p style={gs.cardSub}>@ {interview.company}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', width: '100%' }}>
                {[
                  { icon: '❓', label: 'Questions',    val: questions.length    },
                  { icon: '⏱️', label: 'Per question', val: `${TIMER_SECONDS}s` },
                  { icon: '🎤', label: 'Input',        val: 'Voice / Type'      },
                  { icon: '🤖', label: 'Scored by',    val: 'Groq AI'           },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ ...gs.statCard, borderColor: theme.light }}>
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{val}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...gs.infoBox, background: theme.bg, border: `1px solid ${theme.light}` }}>
                <p style={{ ...gs.infoTitle, color: theme.color }}>Before you begin</p>
                {[
                  '✅  Camera & microphone access already granted',
                  '🤖  Groq AI generated your questions',
                  '🔊  AI will read each question aloud',
                  '🎤  Use voice input or type your answers',
                  '⏰  Timer auto-submits when it hits zero',
                  '💾  Results are saved to your profile',
                ].map(tip => <div key={tip} style={gs.infoRow}>{tip}</div>)}
              </div>
              <button
                style={{ ...gs.primaryBtn, background: theme.color }}
                onClick={() => setStarted(true)}
              >
                Start Interview →
              </button>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ── SCREEN 4 — INTERVIEW ROOM ────────────────────────────────────
  const progress   = (step / questions.length) * 100;
  const timerMins  = Math.floor(timeLeft / 60);
  const timerSecs  = String(timeLeft % 60).padStart(2, '0');
  const timerColor = timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#22c55e';
  const wordCount  = current.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={rs.page}>
      {/* ── STICKY NAV ── */}
      <div style={{ ...rs.nav, borderBottom: `2px solid ${theme.color}33` }}>
        <div style={rs.navInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={rs.brand}>🎯 MockPrep</span>
            <span style={{ ...rs.navBadge, color: theme.color, background: theme.bg }}>
              {interview.company} · {interview.role}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              style={{
                ...rs.muteBtn,
                background: muted ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                color:      muted ? '#ef4444'               : '#22c55e',
                border:     muted ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(34,197,94,0.25)',
              }}
              onClick={() => { if (!muted) window.speechSynthesis.cancel(); setMuted(m => !m); }}
            >
              {muted ? '🔇 Muted' : '🔊 AI Voice'}
            </button>
            <div style={{ ...rs.timerChip, color: timerColor, border: `1px solid ${timerColor}33`, background: `${timerColor}12` }}>
              ⏱ {timerMins}:{timerSecs}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={rs.progressBar}>
        <div style={rs.progressBarInner}>
          <div style={rs.progressTrack}>
            <div style={{ ...rs.progressFill, width: `${progress}%`, background: theme.color }} />
          </div>
          <span style={rs.progressLabel}>Q{step + 1} / {questions.length}</span>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ ...rs.grid, gridTemplateColumns: isDesktop ? '1fr 340px' : '1fr' }}>

        {/* ── LEFT PANEL ── */}
        <div style={rs.leftPanel}>
          {/* Question card */}
          <div style={{ ...rs.qCard, borderLeft: `3px solid ${theme.color}` }}>
            <span style={{ ...rs.qBadge, color: theme.color, background: theme.bg }}>
              Question {step + 1}
            </span>
            <p style={{ ...rs.qText, fontSize: isDesktop ? '19px' : '15px' }}>
              {questions[step]}
            </p>
          </div>

          {/* Answer textarea */}
          <div style={rs.answerWrap}>
            <div style={rs.answerHeader}>
              <span style={rs.answerLabel}>Your Answer</span>
              <span style={rs.wordCount}>{wordCount} words · {current.length} chars</span>
            </div>
            <textarea
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="Type your answer here, or click Start Voice below…"
              style={{ ...rs.textarea, minHeight: isDesktop ? '280px' : '200px' }}
            />
          </div>

          {/* Voice controls */}
          <div style={rs.voiceRow}>
            {!listening ? (
              <button style={{ ...rs.voiceBtn, background: theme.color }} onClick={startListening}>
                🎤 Start Voice
              </button>
            ) : (
              <button style={{ ...rs.voiceBtn, background: '#dc2626' }} onClick={stopListening}>
                ⏹ Stop Voice
              </button>
            )}
            {listening && (
              <span style={rs.recPill}>
                <span style={rs.recDot} /> Recording…
              </span>
            )}
          </div>

          {/* Skip / Next */}
          <div style={rs.actionRow}>
            <button
              style={rs.skipBtn}
              onClick={() => { stopListening(); setCurrent('I need to skip this question.'); }}
            >
              Skip
            </button>
            <button
              style={{ ...rs.nextBtn, background: submitting ? 'rgba(255,255,255,0.1)' : theme.color, cursor: submitting ? 'not-allowed' : 'pointer' }}
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? '⏳ AI Evaluating…'
                : step + 1 === questions.length
                ? '✓ Submit Interview'
                : 'Next →'}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={rs.rightPanel}>
          {/* Camera */}
          <div style={{ ...rs.camWrap, aspectRatio: isDesktop ? '4/3' : '16/9' }}>
            <video ref={videoRef} autoPlay muted playsInline style={rs.video} />
            <div style={rs.camTopOverlay}>
              <span style={rs.livePill}>
                <span style={rs.liveDot} /> LIVE
              </span>
            </div>
            <div style={{ ...rs.camBottomOverlay, background: `linear-gradient(transparent, ${theme.color}99)` }}>
              {interview.company} Interview
            </div>
          </div>

          {/* Status card */}
          <div style={rs.sideCard}>
            <p style={rs.sideCardTitle}>Interview Status</p>
            <div style={rs.statusRow}>
              <span style={{ ...rs.statusDot, background: listening ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
              <span style={rs.statusText}>{listening ? 'Recording answer' : 'Voice input ready'}</span>
            </div>
            <div style={rs.statusRow}>
              <span style={{ ...rs.statusDot, background: '#6366f1' }} />
              <span style={rs.statusText}>AI Evaluator active</span>
            </div>
            <div style={rs.statusRow}>
              <span style={{ ...rs.statusDot, background: timerColor }} />
              <span style={{ ...rs.statusText, color: timerColor, fontWeight: '600' }}>
                {timerMins}:{timerSecs} remaining
              </span>
            </div>
          </div>

          {/* Progress pills */}
          <div style={rs.sideCard}>
            <p style={rs.sideCardTitle}>Progress</p>
            <div style={rs.pillsRow}>
              {questions.map((_, i) => (
                <div
                  key={i}
                  title={`Q${i + 1}`}
                  style={{
                    ...rs.pill,
                    background:
                      i < step ? '#22c55e'
                      : i === step ? theme.color
                      : 'rgba(255,255,255,0.1)',
                    transform: i === step ? 'scaleY(1.4)' : 'scaleY(1)',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {[['#22c55e', 'Done'], [theme.color, 'Current'], ['rgba(255,255,255,0.1)', 'Upcoming']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)' }} />
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ ...rs.sideCard, borderColor: theme.light }}>
            <p style={{ ...rs.sideCardTitle, color: theme.color }}>💡 Quick Tips</p>
            {[
              'Longer, structured answers score higher.',
              'Use Situation → Action → Result format.',
              'Speak clearly when using voice input.',
              'Draw on real projects and internships.',
            ].map(tip => (
              <p key={tip} style={rs.tipText}>{tip}</p>
            ))}
          </div>
        </div>
      </div>

      <div style={rs.footer}>
        © {new Date().getFullYear()} MockPrep · All rights reserved to <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Dheeraj Kumar</strong>
      </div>
    </div>
  );
}

// ── SHARED SUB-COMPONENTS ────────────────────────────────────────────
function PreNav({ navigate }) {
  return (
    <nav style={gs.nav}>
      <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>🎯 MockPrep</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { label: 'Home',      action: () => { window.speechSynthesis.cancel(); navigate('/'); } },
          { label: 'Dashboard', action: () => navigate('/dashboard') },
          { label: '← Back',   action: () => { window.speechSynthesis.cancel(); navigate(-1); } },
        ].map(({ label, action }) => (
          <button key={label} style={gs.navBtn} onClick={action}>{label}</button>
        ))}
      </div>
    </nav>
  );
}

function PageFooter() {
  return (
    <footer style={{ textAlign: 'center', padding: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,9,20,0.8)' }}>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
        © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
      </p>
    </footer>
  );
}

// ── GLOBAL STYLES (pre-interview screens) ────────────────────────────
const gs = {
  page:       { minHeight: '100vh', background: '#060914', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, sans-serif' },
  fullCenter: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#060914', color: '#fff', fontFamily: 'Inter, -apple-system, sans-serif' },
  nav:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  navBtn:     { background: 'none', border: 'none', padding: '7px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', borderRadius: '8px', fontWeight: '500' },
  centerWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' },
  card:       { background: 'rgba(17,24,39,0.95)', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' },
  accentBar:  { height: '3px', width: '100%' },
  cardBody:   { padding: '32px 32px 36px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' },
  badge:      { padding: '4px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' },
  cardTitle:  { fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 },
  cardSub:    { fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: 0 },
  permGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' },
  permCard:   { borderRadius: '14px', padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', transition: 'border 0.3s' },
  permIcon:   { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  permLabel:  { fontSize: '13px', fontWeight: '700', color: '#fff' },
  permDesc:   { fontSize: '11px', color: 'rgba(255,255,255,0.32)', textAlign: 'center' },
  permStatus: { fontSize: '11px', fontWeight: '600', marginTop: '4px' },
  infoBox:    { width: '100%', borderRadius: '12px', padding: '14px 18px', textAlign: 'left' },
  infoTitle:  { fontSize: '10px', fontWeight: '700', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  infoRow:    { fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: '2.1' },
  statCard:   { border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.03)' },
  primaryBtn: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.3px' },
  deniedBox:  { width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' },
  deniedTitle:{ fontSize: '14px', fontWeight: '700', color: '#ef4444', margin: '0 0 6px' },
  deniedDesc: { fontSize: '12px', color: 'rgba(239,68,68,0.7)', margin: '0 0 14px', lineHeight: '1.6' },
  backBtn:    { padding: '11px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

// ── ROOM STYLES ───────────────────────────────────────────────────────
const rs = {
  page:          { minHeight: '100vh', background: '#060914', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, sans-serif', color: '#fff' },
  nav:           { display: 'flex', background: 'rgba(6,9,20,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 40 },
  navInner:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: '8px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  brand:         { fontSize: '15px', fontWeight: '700', color: '#fff' },
  navBadge:      { fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: '500', border: '1px solid rgba(255,255,255,0.08)' },
  muteBtn:       { padding: '7px 14px', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  timerChip:     { fontSize: '16px', fontWeight: '700', padding: '6px 14px', borderRadius: '10px', fontVariantNumeric: 'tabular-nums' },
  progressBar:   { background: 'rgba(6,9,20,0.8)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  progressBarInner: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  progressTrack: { flex: 1, height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' },
  progressFill:  { height: '3px', borderRadius: '99px', transition: 'width 0.5s ease' },
  progressLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', minWidth: '52px', textAlign: 'right' },
  grid:          { display: 'grid', gap: '16px', padding: '16px 20px', flex: 1, alignItems: 'start', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  leftPanel:     { display: 'flex', flexDirection: 'column', gap: '12px' },
  rightPanel:    { display: 'flex', flexDirection: 'column', gap: '12px' },
  qCard:         { background: 'rgba(17,24,39,0.9)', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.07)' },
  qBadge:        { fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px', display: 'inline-block', marginBottom: '10px', letterSpacing: '0.5px' },
  qText:         { fontWeight: '600', color: '#fff', margin: 0, lineHeight: '1.75' },
  answerWrap:    { background: 'rgba(17,24,39,0.9)', borderRadius: '14px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)' },
  answerHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  answerLabel:   { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px' },
  wordCount:     { fontSize: '11px', color: 'rgba(255,255,255,0.22)' },
  textarea:      { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', lineHeight: '1.7', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', background: 'rgba(255,255,255,0.04)', outline: 'none', color: '#fff' },
  voiceRow:      { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  voiceBtn:      { padding: '9px 18px', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  recPill:       { display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: '600', background: 'rgba(239,68,68,0.1)', padding: '5px 12px', borderRadius: '99px', border: '1px solid rgba(239,68,68,0.2)' },
  recDot:        { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' },
  actionRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  skipBtn:       { padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  nextBtn:       { padding: '11px 28px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700' },
  camWrap:       { borderRadius: '14px', overflow: 'hidden', position: 'relative', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.07)' },
  video:         { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' },
  camTopOverlay: { position: 'absolute', top: '10px', left: '10px' },
  livePill:      { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px', letterSpacing: '1px' },
  liveDot:       { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.2s infinite' },
  camBottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, color: '#fff', fontSize: '11px', fontWeight: '500', padding: '20px 14px 10px', textAlign: 'center' },
  sideCard:      { background: 'rgba(17,24,39,0.85)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' },
  sideCardTitle: { fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', letterSpacing: '0.8px' },
  statusRow:     { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  statusDot:     { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  statusText:    { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  pillsRow:      { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  pill:          { width: '22px', height: '5px', borderRadius: '99px', transition: 'all 0.3s' },
  tipText:       { fontSize: '11px', color: 'rgba(255,255,255,0.33)', margin: '0 0 6px', lineHeight: '1.6' },
  footer:        { textAlign: 'center', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(6,9,20,0.8)', fontSize: '11px', color: 'rgba(255,255,255,0.18)' },
};