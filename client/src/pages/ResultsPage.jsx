import { useLocation, useNavigate } from 'react-router-dom';

const mobileCSS = `
  .rp-page { max-width: 820px; margin: 0 auto; }
  .rp-hero { display: flex; flex-direction: column; gap: 16px; margin: 0 12px 16px; padding: 18px; }
  .rp-hero-right { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .rp-swgrid { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 0 12px 16px; }
  .rp-improve-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
  .rp-section { margin: 0 12px 16px; }
  .rp-answer-card { margin: 0 12px 10px; padding: 14px; }
  .rp-feedback-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 10px; }
  .rp-actions { margin: 20px 12px 12px; flex-wrap: wrap; }
  .rp-score-big { font-size: 40px; padding: 10px 20px; }
  @media (min-width: 600px) {
    .rp-hero { flex-direction: row; justify-content: space-between; align-items: flex-start; margin: 0 24px 20px; padding: 28px 32px; }
    .rp-hero-right { flex-direction: column; text-align: center; align-items: center; }
    .rp-swgrid { grid-template-columns: 1fr 1fr; margin: 0 24px 20px; }
    .rp-improve-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
    .rp-section { margin: 0 24px 20px; }
    .rp-answer-card { margin: 0 0 12px 0; padding: 20px 24px; }
    .rp-feedback-grid { grid-template-columns: 1fr 1fr; }
    .rp-actions { margin: 32px 24px 16px; flex-wrap: nowrap; }
    .rp-score-big { font-size: 52px; padding: 14px 32px; }
  }
`;

export default function ResultsPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const attempt    = state?.attempt;

  if (!attempt) return (
    <div style={s.center}>
      <style>{mobileCSS}</style>
      <div style={s.emptyIcon}>📋</div>
      <p style={s.emptyText}>No results found.</p>
      <button style={s.btn} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  const scoreColor  = attempt.totalScore >= 70 ? '#16a34a' : attempt.totalScore >= 50 ? '#d97706' : '#dc2626';
  const scoreBg     = attempt.totalScore >= 70 ? '#dcfce7' : attempt.totalScore >= 50 ? '#fef9c3' : '#fee2e2';
  const gradeColor  = attempt.grade === 'A' ? '#16a34a' : attempt.grade === 'B' ? '#2563eb' : attempt.grade === 'C' ? '#d97706' : '#dc2626';

  const priorityColor = (p) =>
    p === 'High'   ? { color:'#dc2626', bg:'#fee2e2' } :
    p === 'Medium' ? { color:'#d97706', bg:'#fef9c3' } :
                     { color:'#16a34a', bg:'#dcfce7' };

  return (
    <div style={s.page} className="rp-page">
      <style>{mobileCSS}</style>

      {/* NAV */}
      <div style={s.topNav}>
        <div style={s.navBrand}>🎯 MockPrep</div>
        <button style={s.navBtn} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </div>

      {/* HERO SCORE CARD */}
      <div style={s.heroCard} className="rp-hero">
        <div style={s.heroLeft}>
          <div style={s.heroMeta}>
            <span style={s.heroBadge}>{attempt.category}</span>
            <span style={s.heroDate}>
              {new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                day:'numeric', month:'long', year:'numeric',
                hour:'2-digit', minute:'2-digit'
              })}
            </span>
          </div>
          <h1 style={s.heroTitle}>{attempt.role}</h1>
          <p style={s.heroCompany}>@ {attempt.company}</p>
          <p style={s.heroFeedback}>{attempt.feedback}</p>
        </div>
        <div style={s.heroRight} className="rp-hero-right">
          <div>
            <div
              className="rp-score-big"
              style={{ ...s.scoreBig, color: scoreColor, background: scoreBg }}
            >
              {attempt.totalScore}%
            </div>
            {attempt.grade && (
              <div style={{ ...s.gradeBig, color: gradeColor }}>
                Grade: {attempt.grade}
              </div>
            )}
            <div style={s.scoreLabel}>Overall Score</div>
          </div>
        </div>
      </div>

      {/* STRONGER + WEAKER SECTIONS */}
      {(attempt.strongerSections?.length > 0 || attempt.weakerSections?.length > 0) && (
        <div style={s.swGrid} className="rp-swgrid">

          <div style={{ ...s.swCard, borderTop:'3px solid #16a34a' }}>
            <div style={s.swTitle}>
              <span style={s.swIcon}>💪</span>
              <span style={{ color:'#16a34a' }}>Stronger Sections</span>
            </div>
            <div style={s.swList}>
              {(attempt.strongerSections || []).map((point, i) => (
                <div key={i} style={s.swItem}>
                  <span style={{ ...s.swDot, background:'#16a34a' }}>✓</span>
                  <span style={s.swText}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.swCard, borderTop:'3px solid #dc2626' }}>
            <div style={s.swTitle}>
              <span style={s.swIcon}>⚡</span>
              <span style={{ color:'#dc2626' }}>Weaker Sections</span>
            </div>
            <div style={s.swList}>
              {(attempt.weakerSections || []).map((point, i) => (
                <div key={i} style={s.swItem}>
                  <span style={{ ...s.swDot, background:'#dc2626' }}>✗</span>
                  <span style={s.swText}>{point}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* IMPROVEMENT AREAS */}
      {attempt.improvementAreas?.length > 0 && (
        <div style={s.section} className="rp-section">
          <h2 style={s.sectionTitle}>🎯 Areas to Improve</h2>
          <div style={s.improveGrid} className="rp-improve-grid">
            {attempt.improvementAreas.map((item, i) => {
              const pc = priorityColor(item.priority);
              return (
                <div key={i} style={s.improveCard}>
                  <div style={s.improveCardTop}>
                    <span style={s.improveTopic}>{item.topic}</span>
                    <span style={{ ...s.priorityBadge, color: pc.color, background: pc.bg }}>
                      {item.priority}
                    </span>
                  </div>
                  <p style={s.improveSuggestion}>→ {item.suggestion}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANSWER BREAKDOWN */}
      <div style={s.section} className="rp-section">
        <h2 style={s.sectionTitle}>📝 Answer Breakdown</h2>
        {attempt.answers.map((a, i) => {
          const qColor = a.score >= 70 ? '#16a34a' : a.score >= 50 ? '#d97706' : '#dc2626';
          const qBg    = a.score >= 70 ? '#dcfce7' : a.score >= 50 ? '#fef9c3' : '#fee2e2';
          return (
            <div key={i} style={s.answerCard} className="rp-answer-card">

              <div style={s.answerHeader}>
                <div style={s.answerHeaderLeft}>
                  <span style={s.qLabel}>Q{i + 1}</span>
                  <p style={s.question}>{a.question}</p>
                </div>
                <span style={{ ...s.qScore, color: qColor, background: qBg }}>
                  {a.score}%
                </span>
              </div>

              <div style={s.yourAnswer}>
                <p style={s.yourAnswerLabel}>Your Answer</p>
                {a.answer
                  ? <p style={s.answerText}>{a.answer}</p>
                  : <p style={s.noAnswer}>No answer given</p>
                }
              </div>

              {a.feedback && (
                <div style={s.aiFeedbackBox}>
                  <div style={s.feedbackGrid} className="rp-feedback-grid">
                    <div style={{ ...s.feedbackCard, borderColor:'#bbf7d0', background:'#f0fdf4' }}>
                      <div style={s.feedbackCardTitle}>
                        <span>✅</span> What was good
                      </div>
                      <p style={s.feedbackCardText}>{a.strength}</p>
                    </div>
                    <div style={{ ...s.feedbackCard, borderColor:'#fde68a', background:'#fffbeb' }}>
                      <div style={s.feedbackCardTitle}>
                        <span>⚠️</span> What to improve
                      </div>
                      <div style={s.improvementPoints}>
                        {a.improvement
                          ?.split('.')
                          .filter(p => p.trim().length > 5)
                          .slice(0, 3)
                          .map((point, j) => (
                            <div key={j} style={s.improvePoint}>
                              <span style={s.pointNum}>{j + 1}</span>
                              <span style={s.pointText}>{point.trim()}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  <div style={s.idealBox}>
                    <div style={s.idealTitle}>💡 What a strong answer looks like</div>
                    <p style={s.idealText}>{a.idealAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ACTIONS */}
      <div style={s.actions} className="rp-actions">
        <button style={s.btnOutline} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
        <button style={s.btn} onClick={() => navigate('/dashboard')}>
          Practice Again →
        </button>
      </div>

      <footer style={s.footer}>
        © {new Date().getFullYear()} MockPrep · All rights reserved to <strong>Dheeraj Kumar</strong>
      </footer>
    </div>
  );
}

const s = {
  page:              { maxWidth:'820px', margin:'0 auto', padding:'0 0 40px', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background:'#f8fafc', minHeight:'100vh', overflowX:'hidden' },
  center:            { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px', fontFamily:'sans-serif', padding:'16px' },
  emptyIcon:         { fontSize:'40px' },
  emptyText:         { color:'#64748b', fontSize:'15px' },
  topNav:            { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#fff', borderBottom:'1px solid #e2e8f0', marginBottom:'16px' },
  navBrand:          { fontSize:'16px', fontWeight:'800', color:'#0f172a' },
  navBtn:            { padding:'7px 14px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer', whiteSpace:'nowrap' },
  heroCard:          { background:'#fff', borderRadius:'14px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' },
  heroLeft:          { flex:1, minWidth:0 },
  heroMeta:          { display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' },
  heroBadge:         { padding:'3px 10px', background:'#eff6ff', color:'#2563eb', borderRadius:'99px', fontSize:'11px', fontWeight:'600' },
  heroDate:          { fontSize:'11px', color:'#94a3b8' },
  heroTitle:         { fontSize:'20px', fontWeight:'800', color:'#0f172a', margin:'0 0 4px', wordBreak:'break-word' },
  heroCompany:       { fontSize:'13px', color:'#64748b', margin:'0 0 10px' },
  heroFeedback:      { fontSize:'13px', color:'#475569', lineHeight:'1.7', margin:0 },
  heroRight:         { flexShrink:0 },
  scoreBig:          { fontWeight:'800', borderRadius:'14px', display:'inline-block', marginBottom:'6px' },
  gradeBig:          { fontSize:'17px', fontWeight:'800', marginBottom:'3px', textAlign:'center' },
  scoreLabel:        { fontSize:'11px', color:'#94a3b8', textAlign:'center' },
  swGrid:            { display:'grid', gap:'12px' },
  swCard:            { background:'#fff', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' },
  swTitle:           { display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:'700', color:'#0f172a', marginBottom:'12px' },
  swIcon:            { fontSize:'16px' },
  swList:            { display:'flex', flexDirection:'column', gap:'8px' },
  swItem:            { display:'flex', alignItems:'flex-start', gap:'8px' },
  swDot:             { width:'18px', height:'18px', borderRadius:'50%', color:'#fff', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' },
  swText:            { fontSize:'13px', color:'#334155', lineHeight:'1.6' },
  section:           { },
  sectionTitle:      { fontSize:'15px', fontWeight:'700', color:'#0f172a', margin:'0 0 12px' },
  improveGrid:       { display:'grid', gap:'10px' },
  improveCard:       { background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  improveCardTop:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px', gap:'8px', flexWrap:'wrap' },
  improveTopic:      { fontSize:'13px', fontWeight:'700', color:'#0f172a' },
  priorityBadge:     { fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'99px', whiteSpace:'nowrap' },
  improveSuggestion: { fontSize:'12px', color:'#475569', margin:0, lineHeight:'1.6' },
  answerCard:        { background:'#fff', borderRadius:'12px', border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  answerHeader:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px', gap:'10px' },
  answerHeaderLeft:  { flex:1, minWidth:0 },
  qLabel:            { fontSize:'10px', fontWeight:'700', color:'#2563eb', background:'#eff6ff', padding:'2px 8px', borderRadius:'99px', display:'inline-block', marginBottom:'6px' },
  question:          { fontSize:'14px', fontWeight:'600', color:'#0f172a', margin:0, lineHeight:'1.5', wordBreak:'break-word' },
  qScore:            { fontSize:'13px', fontWeight:'700', padding:'3px 12px', borderRadius:'99px', flexShrink:0 },
  yourAnswer:        { background:'#f8fafc', borderRadius:'8px', padding:'10px 14px', marginBottom:'12px' },
  yourAnswerLabel:   { fontSize:'10px', fontWeight:'600', color:'#94a3b8', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.5px' },
  answerText:        { fontSize:'13px', color:'#334155', margin:0, lineHeight:'1.7', wordBreak:'break-word' },
  noAnswer:          { fontSize:'13px', color:'#94a3b8', margin:0, fontStyle:'italic' },
  aiFeedbackBox:     { borderTop:'1px solid #f1f5f9', paddingTop:'12px' },
  feedbackGrid:      { display:'grid', gap:'10px', marginBottom:'10px' },
  feedbackCard:      { borderRadius:'10px', padding:'12px', border:'1.5px solid' },
  feedbackCardTitle: { fontSize:'12px', fontWeight:'700', color:'#0f172a', marginBottom:'6px', display:'flex', alignItems:'center', gap:'5px' },
  feedbackCardText:  { fontSize:'12px', color:'#475569', margin:0, lineHeight:'1.6' },
  improvementPoints: { display:'flex', flexDirection:'column', gap:'6px' },
  improvePoint:      { display:'flex', alignItems:'flex-start', gap:'6px' },
  pointNum:          { width:'16px', height:'16px', borderRadius:'50%', background:'#fef9c3', color:'#d97706', fontSize:'9px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' },
  pointText:         { fontSize:'12px', color:'#475569', lineHeight:'1.5' },
  idealBox:          { background:'#eff6ff', borderRadius:'8px', padding:'12px 14px', border:'1px solid #bfdbfe' },
  idealTitle:        { fontSize:'11px', fontWeight:'700', color:'#2563eb', marginBottom:'5px' },
  idealText:         { fontSize:'12px', color:'#1e3a5f', margin:0, lineHeight:'1.7' },
  actions:           { display:'flex', gap:'10px', justifyContent:'center' },
  btn:               { padding:'11px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', flex:'1', maxWidth:'200px', textAlign:'center' },
  btnOutline:        { padding:'11px 20px', background:'#fff', color:'#2563eb', border:'2px solid #2563eb', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', flex:'1', maxWidth:'200px', textAlign:'center' },
  footer:            { textAlign:'center', padding:'14px', borderTop:'1px solid #e2e8f0', background:'#fff', fontSize:'11px', color:'#94a3b8', marginTop:'8px' },
};