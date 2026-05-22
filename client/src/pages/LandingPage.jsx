import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.brand}>MockPrep</span>
        <div style={{display:'flex', gap:'12px'}}>
          <Link to="/login" style={styles.navLink}>Login</Link>
          <Link to="/register" style={styles.navBtn}>Get Started</Link>
        </div>
      </nav>
      <div style={styles.hero}>
        <h1 style={styles.h1}>Ace your next tech interview</h1>
        <p style={styles.p}>AI-powered mock interviews for TCS, Wipro, Deloitte, Infosys and more. Practice. Improve. Get hired.</p>
        <Link to="/register" style={styles.cta}>Start Practicing Free</Link>
      </div>
      <div style={styles.companies}>
        {['TCS','Wipro','Deloitte','Infosys','HCL','Accenture'].map(c => (
          <span key={c} style={styles.chip}>{c}</span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight:'100vh', background:'#fff', fontFamily:'sans-serif' },
  nav:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 40px', borderBottom:'1px solid #eee' },
  brand:     { fontSize:'20px', fontWeight:'700', color:'#2563eb' },
  navLink:   { padding:'8px 16px', color:'#444', textDecoration:'none', fontSize:'14px' },
  navBtn:    { padding:'8px 18px', background:'#2563eb', color:'#fff', borderRadius:'8px', textDecoration:'none', fontSize:'14px' },
  hero:      { textAlign:'center', padding:'100px 20px 60px' },
  h1:        { fontSize:'48px', fontWeight:'700', margin:'0 0 16px', color:'#111' },
  p:         { fontSize:'18px', color:'#555', maxWidth:'560px', margin:'0 auto 32px' },
  cta:       { padding:'14px 32px', background:'#2563eb', color:'#fff', borderRadius:'10px', textDecoration:'none', fontSize:'16px', fontWeight:'600' },
  companies: { display:'flex', justifyContent:'center', gap:'12px', flexWrap:'wrap', padding:'0 20px 60px' },
  chip:      { padding:'8px 20px', background:'#f0f4ff', color:'#2563eb', borderRadius:'99px', fontSize:'14px', fontWeight:'500' },
};