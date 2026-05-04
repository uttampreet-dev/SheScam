'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_URL = "https://shescam.onrender.com";

// ── Demo data ──────────────────────────────────────────────
const DEMO_STATS = {
  total:100, scams:45, suspicious:30, safe:25,
  byType:[
    {type:'Lottery',count:20},{type:'Job',count:18},{type:'Matrimonial',count:15},
    {type:'Loan',count:12},{type:'Phishing',count:8},{type:'Government',count:7},
  ],
  byCity:[],
};
const DEMO_REPORTS = [
  {id:1,verdict:'SCAM',      scam_type:'lottery',     city:'Delhi',     message:'You won PM Yojana lottery send Aadhaar and fee to claim prize now',   created_at:new Date().toISOString()},
  {id:2,verdict:'SCAM',      scam_type:'job',         city:'Mumbai',    message:'Work from home earn 50000 per month no experience needed apply now',   created_at:new Date().toISOString()},
  {id:3,verdict:'SUSPICIOUS',scam_type:'loan',        city:'Bangalore', message:'Instant loan approved no documents needed apply now limited offer',    created_at:new Date().toISOString()},
  {id:4,verdict:'SCAM',      scam_type:'matrimonial', city:'Punjab',    message:'NRI doctor wants to marry send horoscope and photos urgently',         created_at:new Date().toISOString()},
  {id:5,verdict:'SAFE',      scam_type:'none',        city:'Chennai',   message:'Your OTP for SBI net banking is 234512 valid for 10 minutes only',    created_at:new Date().toISOString()},
];
const DEMO_VERDICT = [
  {name:'Scams',value:45,fill:'#ef4444'},
  {name:'Suspicious',value:30,fill:'#f59e0b'},
  {name:'Safe',value:25,fill:'#10b981'},
];
const STATE_DATA = [
  {name:'Maharashtra',reports:35},{name:'Delhi',reports:28},
  {name:'Uttar Pradesh',reports:22},{name:'Karnataka',reports:18},
  {name:'Tamil Nadu',reports:15},{name:'Punjab',reports:12},
  {name:'Gujarat',reports:10},{name:'Rajasthan',reports:8},
  {name:'West Bengal',reports:8},{name:'Bihar',reports:6},
  {name:'Telangana',reports:14},{name:'Kerala',reports:9},
  {name:'MP',reports:7},{name:'Haryana',reports:9},{name:'Andhra',reports:11},
];

// ── Styles ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:#07050f;color:#e5e7eb;font-family:'DM Sans',sans-serif;overflow-x:hidden;}
h1,h2,h3,h4,h5,h6{font-family:'Syne',sans-serif;font-weight:700;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#07050f;}
::-webkit-scrollbar-thumb{background:#7c3aed88;border-radius:4px;}

/* Aurora background */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%,rgba(124,58,237,.18) 0%,transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 10%,rgba(219,39,119,.12) 0%,transparent 55%),
    radial-gradient(ellipse 50% 60% at 50% 100%,rgba(109,40,217,.15) 0%,transparent 60%),
    radial-gradient(ellipse 40% 30% at 80% 50%,rgba(167,139,250,.08) 0%,transparent 50%);
  animation:auroraShift 15s ease-in-out infinite alternate;
}
@keyframes auroraShift{
  0%{opacity:1;transform:scale(1) translateY(0);}
  50%{opacity:.85;transform:scale(1.05) translateY(-8px);}
  100%{opacity:1;transform:scale(1) translateY(0);}
}

/* Gradient text */
.gradient-text{
  background:linear-gradient(135deg,#e879f9 0%,#db2777 50%,#7c3aed 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.shimmer-logo{
  background:linear-gradient(90deg,#e879f9,#db2777,#7c3aed,#e879f9);
  background-size:300% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:shimmerFlow 4s linear infinite;
}
@keyframes shimmerFlow{0%{background-position:0% center;}100%{background-position:300% center;}}

/* Hero shimmer on "We Fight Back" */
.hero-shimmer{
  background:linear-gradient(90deg,#e879f9 0%,#db2777 40%,#a78bfa 70%,#e879f9 100%);
  background-size:250% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:shimmerFlow 5s linear infinite;
}

/* Live badge */
.live-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:#10b981;padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;}
.live-dot{width:7px;height:7px;background:#10b981;border-radius:50%;animation:livePulse 1.8s infinite;}
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.4);}}

/* Animations */
@keyframes heroAmbient {
  0% { transform: scale(1) translateY(0px); opacity: 0.9; }
  50% { transform: scale(1.05) translateY(-10px); opacity: 1; }
  100% { transform: scale(1) translateY(0px); opacity: 0.9; }
}
@keyframes fadeInUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
@keyframes floatingHero{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes slideIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
@keyframes borderGlow{0%,100%{box-shadow:0 0 0 1px rgba(124,58,237,.2);}50%{box-shadow:0 0 0 1px rgba(124,58,237,.6),0 0 24px rgba(124,58,237,.2);}}

.card-hover {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 25px rgba(124,58,237,0.18),
    0 0 0 1px rgba(124,58,237,0.35),
    inset 0 0 12px rgba(124,58,237,0.08);
  border-color: rgba(124,58,237,0.45);
}

/* Glass card */
.glass-card{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
  border-radius:16px;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg,#7c3aed,#db2777);
  color:#fff;
  border:none;
  padding:16px 40px;
  border-radius:30px;
  font-weight:600;
  font-size:16px;
  font-family:'DM Sans',sans-serif;
  cursor:pointer;
  transition:all .3s ease;
  box-shadow:0 0 30px rgba(124,58,237,.4);
  position:relative;
  overflow:hidden;
}
.btn-primary::after {
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.3),transparent);
  opacity:0;
  transition:opacity .3s;
}
.btn-primary:hover { transform:scale(1.05); box-shadow:0 0 50px rgba(124,58,237,.6); }
.btn-primary:hover::after { opacity:1; }

.btn-ghost{
  background:transparent;color:#e879f9;
  border:2px solid #7c3aed;padding:14px 40px;border-radius:30px;
  font-weight:600;font-size:16px;font-family:'DM Sans',sans-serif;
  cursor:pointer;transition:transform .3s ease, background .3s ease;
}
.btn-ghost:hover{background:rgba(124,58,237,.1);transform:scale(1.05);}

/* Section layout */
.section{padding:64px 40px;max-width:1400px;margin:0 auto;position:relative;z-index:1;}
.section-full{padding:80px 40px;position:relative;z-index:1;}
.heading-wrapper{text-align:center;margin-bottom:60px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:30px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}

/* Nav links */
.nav-link{color:#9ca3af;text-decoration:none;font-size:14px;font-weight:500;cursor:pointer;transition:color .2s;padding-bottom:4px;position:relative;}
.nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:linear-gradient(90deg,#7c3aed,#db2777);transition:width .3s;border-radius:2px;}
.nav-link:hover{color:#e5e7eb;}
.nav-link.active{color:#a78bfa;}
.nav-link.active::after{width:100%;}

/* Inputs */
.inp{
  width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);
  border-radius:12px;padding:13px 16px;color:#e5e7eb;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;
  transition:border-color .2s,box-shadow .2s;resize:vertical;
}
.inp:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.2);}
.inp::placeholder{color:#6b7280;}

/* Reveal animation */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease;}
.reveal.visible{opacity:1;transform:translateY(0);}

/* Progress bar */
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#7c3aed,#db2777,#e879f9);z-index:9999;transition:width .1s linear;}

/* ── NAVBAR MOBILE ── */
.nav-desktop-links { display: flex; gap: 28px; align-items: center; }
.nav-desktop-btn   { display: block; }

/* ── HERO STAT GRID ── */
.hero-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

/* ── HERO BUTTON ROW ── */
.hero-btn-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 64px;
  flex-wrap: wrap;
}

/* ── HEATMAP GRID ── */
.heatmap-outer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}
.heatmap-state-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

@media(max-width:1024px){
  .grid-3{grid-template-columns:repeat(2,1fr);}
  .grid-4{grid-template-columns:repeat(2,1fr);}
}

@media(max-width:768px){
  .grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}
  .section{padding:60px 20px;}
  .section-full{padding:60px 20px;}

  /* Navbar — hide desktop links & button on mobile */
  .nav-desktop-links { display: none; }
  .nav-desktop-btn   { display: none; }

  /* Hero stat grid — 2×2 on mobile */
  .hero-stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 100%;
  }

  /* Hero button row — stack vertically, full width */
  .hero-btn-row {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-bottom: 48px;
  }
  .hero-btn-row .btn-primary,
  .hero-btn-row .btn-ghost {
    width: 100%;
    max-width: 320px;
    padding: 14px 20px;
    font-size: 15px;
    text-align: center;
  }

  /* Heatmap — stack vertically */
  .heatmap-outer {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  /* Heatmap state card grid — 3 cols on mobile (fits nicely) */
  .heatmap-state-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

@media(max-width:480px){
  .heatmap-state-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

/* ── HAMBURGER MENU ── */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  z-index: 1100;
}
.hamburger-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: #e5e7eb;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-btn.open span:nth-child(2) { opacity: 0; }
.hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-menu {
  display: none;
}

/* ── DASHBOARD HEADER MOBILE ── */
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.dashboard-header-meta {
  margin-left: auto;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* ── SELECT RESET for Android ── */
.inp[data-type="select"], select.inp {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer;
}

/* ── REPORT CARD TIMESTAMP ── */
.report-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
  gap: 8px;
}
.report-timestamp {
  color: #6b7280;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── HEATMAP TOUCH TOOLTIP (inline, mobile only) ── */
.heatmap-inline-tip {
  display: none;
}

@media(max-width: 768px) {
  /* Show hamburger, hide desktop nav */
  .hamburger-btn { display: flex; }
  .nav-desktop-links { display: none !important; }
  .nav-desktop-btn   { display: none !important; }

  /* Mobile slide-down menu */
  .mobile-menu {
    display: block;
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    background: rgba(7,5,15,0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,.08);
    z-index: 999;
    padding: 16px 0 20px;
    transform: translateY(-110%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
  }
  .mobile-menu.open {
    transform: translateY(0);
    pointer-events: all;
  }
  .mobile-menu a {
    display: block;
    padding: 13px 28px;
    color: #9ca3af;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    border-left: 3px solid transparent;
  }
  .mobile-menu a:hover, .mobile-menu a.active {
    color: #e5e7eb;
    background: rgba(124,58,237,0.08);
    border-left-color: #7c3aed;
  }
  .mobile-menu-cta {
    margin: 12px 28px 0;
  }

  /* Dashboard header — stack title + meta vertically */
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .dashboard-header-meta {
    margin-left: 0;
    width: 100%;
  }

  /* Report card timestamp — relative time is short, wrap is fine */
  .report-timestamp {
    font-size: 10px;
  }

  /* Heatmap: show inline tap tip instead of fixed hover tooltip */
  .heatmap-inline-tip {
    display: block;
    text-align: center;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.3);
    border-radius: 10px;
    padding: 8px 14px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #a78bfa;
    min-height: 36px;
  }
}
`;

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── Hooks ────────────────────────────────────────────────────
function useReveal(ref) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } }, { threshold:.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
}
function useCountUp(target, trigger) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cur = 0; const step = Math.max(1, Math.ceil(target / 30));
    const t = setInterval(() => { cur = Math.min(cur + step, target); setN(cur); if (cur >= target) clearInterval(t); }, 28);
    return () => clearInterval(t);
  }, [target, trigger]);
  return n;
}
function useIntersect(ref, cb) {
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); obs.unobserve(ref.current); } }, { threshold:.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [cb, ref]);
}

// ── Relative time helper ─────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ── NAVBAR ────────────────────────────────────────────────────
const LINKS = [
  {id:'hero',label:'Home'},{id:'how-it-works',label:'How It Works'},
  {id:'checker',label:'Live Checker'},{id:'dashboard',label:'Dashboard'},
  {id:'heatmap',label:'Heatmap'},{id:'awareness',label:'Awareness'},
  {id:'community',label:'Community'},{id:'faq',label:'FAQ'},
];
function Navbar() {
  const [scrolled,setScrolled] = useState(false);
  const [active,setActive]     = useState('hero');
  const [menuOpen,setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const prog = document.getElementById('scroll-progress');
      if (prog) {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        prog.style.width = pct + '%';
      }
      let cur = 'hero';
      LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) cur = id;
      });
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <div id="scroll-progress" style={{ width:'0%' }} />
      <nav style={{
        position:'fixed', top:0, width:'100%', zIndex:1000,
        backgroundColor: scrolled || menuOpen ? 'rgba(7,5,15,0.95)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || menuOpen ? '1px solid rgba(255,255,255,.08)' : 'none',
        transition:'all .3s ease',
        padding:'0 40px',
      }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', height:68 }}>
          {/* Logo */}
          <div style={{ fontSize:22, fontWeight:800, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => go('hero')}>
            <span style={{ fontSize:26 }}>🛡️</span>
            <span className="shimmer-logo">SheScam</span>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div className="nav-desktop-links">
            {LINKS.slice(1,7).map(({ id, label }) => (
              <a key={id} className={`nav-link ${active===id?'active':''}`} onClick={() => go(id)}>{label}</a>
            ))}
          </div>

          {/* Desktop CTA — hidden on mobile */}
          <button className="btn-primary nav-desktop-btn" style={{ padding:'10px 22px', fontSize:13 }} onClick={() => go('checker')}>
            🔍 Check a Message
          </button>

          {/* Hamburger — mobile only */}
          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {LINKS.slice(1).map(({ id, label }) => (
          <a key={id} className={active===id?'active':''} onClick={() => go(id)}>{label}</a>
        ))}
        <div className="mobile-menu-cta">
          <button className="btn-primary" style={{ width:'100%', padding:'13px 20px', fontSize:14 }} onClick={() => go('checker')}>
            🔍 Check a Message Now
          </button>
        </div>
      </div>
    </>
  );
}

// ── HERO ──────────────────────────────────────────────────────
function Hero() {
  const stats = [
    { v:'1 in 3', l:'Indian women targeted yearly', icon:'👩' },
    { v:'₹1.25L', l:'Average loss per fraud',       icon:'💰' },
    { v:'10 sec', l:'AI response time',             icon:'⚡' },
    { v:'100%',   l:'Free forever',                 icon:'🎁' },
  ];
  return (
    <section id="hero" style={{
      minHeight:'92vh', display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative', paddingTop:80,
      background:'linear-gradient(135deg,#07050f 0%,#1a0f2e 100%)', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', width:'100%', height:'100%', top:0, left:0, zIndex:0,
        background:`radial-gradient(circle at 20% 50%,rgba(124,58,237,.12) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(219,39,119,.1) 0%,transparent 50%)`,
        pointerEvents:'none', animation:'heroAmbient 12s ease-in-out infinite alternate'
      }} />

      <div style={{
        position:'relative', zIndex:1, maxWidth:860, textAlign:'center',
        /* Use horizontal padding instead of fixed padding so it breathes on mobile */
        padding:'40px 24px',
        filter:'drop-shadow(0 0 40px rgba(124,58,237,0.15))',
        width:'100%',
      }}>
        <div style={{ marginBottom:16 }}>
          <div className="live-badge"><div className="live-dot"/>AI-POWERED PROTECTION</div>
        </div>

        {/* 
          Hero heading: clamp handles desktop→mobile scaling automatically.
          Removed whiteSpace:'nowrap' on "Scams Target" so it wraps on small screens.
        */}
        <h1 style={{
          fontSize:'clamp(36px, 6vw, 60px)',
          fontWeight:800,
          marginBottom:24,
          lineHeight:1.06,
        }}>
          Scams Target<br />
          Women.<br />
          <span className="hero-shimmer">We Fight<br />Back.</span>
        </h1>

        <p style={{
          fontSize:'clamp(15px, 2vw, 18px)',
          color:'#9ca3af',
          marginBottom:44,
          lineHeight:1.7,
          maxWidth:580,
          margin:'0 auto 44px',
        }}>
          Forward any suspicious WhatsApp message to our AI-powered bot and get instant scam detection in under{' '}
          <strong style={{color:'#e5e7eb'}}>10 seconds</strong>. Free. Always.
        </p>

        {/* Button row — uses CSS class for mobile stacking */}
        <div className="hero-btn-row">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('checker')?.scrollIntoView({behavior:'smooth'})}
          >
            🔍 Check a Message Now
          </button>
          <button
            className="btn-ghost"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({behavior:'smooth'})}
          >
            📊 View Dashboard
          </button>
        </div>

        {/* Stat cards — uses CSS class for 4-col→2-col switch */}
        <div className="hero-stat-grid">
          {stats.map((s,i) => (
            <div
              key={i}
              className="glass-card card-hover"
              style={{
                background:'rgba(124,58,237,.08)',
                padding:'20px 16px',
                borderRadius:16,
                border:'1px solid rgba(255,255,255,0.08)',
                textAlign:'center',
                animation:`fadeInUp .5s ease ${i*.08}s both`,
              }}
            >
              <div style={{
                fontFamily:"'Inter',sans-serif",
                fontWeight:800,
                /* clamp so values don't overflow on tiny screens */
                fontSize:'clamp(22px, 4vw, 34px)',
                color: i===0 ? '#fb7185' : i===1 ? '#f59e0b' : i===2 ? '#34d399' : '#a78bfa',
                marginBottom:8,
                letterSpacing:'-0.5px',
              }}>
                {/* No whiteSpace:nowrap — let it wrap if truly needed */}
                {s.v}
              </div>
              <div style={{ fontSize:'clamp(10px, 1.5vw, 12px)', color:'#94a3b8', lineHeight:1.3 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:36, display:'flex', justifyContent:'center' }}>
          <div className="live-badge"><div className="live-dot"/>Live Platform</div>
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────
function HowItWorks() {
  const ref = useRef(); useReveal(ref);
  const steps = [
    {num:'01',emoji:'📱',title:'Receive a Scam',     desc:'A suspicious job offer, matrimonial message, lottery claim, or loan deal arrives on your WhatsApp.'},
    {num:'02',emoji:'↗️',title:'Forward to Bot',     desc:'Simply forward the message to SheScam Bot. No app download, no signup — just WhatsApp.'},
    {num:'03',emoji:'🤖',title:'AI Analyses',        desc:'Groq AI scans for red flags — urgency language, fake authority, too-good offers — in Hindi or English.'},
    {num:'04',emoji:'🚨',title:'Get Your Verdict',   desc:'Receive SAFE / SUSPICIOUS / SCAM with exact red flags, explanation, and what to do next.'},
    {num:'05',emoji:'💾',title:'Report Logged',      desc:'The anonymised report is saved — your city and scam type help warn other women.'},
    {num:'06',emoji:'🗺️',title:'Dashboard Updates', desc:'Our public heatmap and alerts feed update in real time — community awareness grows with every report.'},
  ];
  return (
    <section id="how-it-works">
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <h2 style={{ fontSize:48, marginBottom:16 }}>From Scam to Safety in <span className="gradient-text">Seconds</span></h2>
          <p style={{ fontSize:18, color:'#9ca3af' }}>Six simple steps to protect yourself and help others</p>
        </div>
        <div className="grid-3">
          {steps.map((s,i) => (
            <div key={i} className="glass-card card-hover" style={{ background:'rgba(124,58,237,.06)', border:'2px solid rgba(124,58,237,.25)', borderRadius:20, padding:'44px 32px', position:'relative', overflow:'hidden', animation:`fadeInUp .6s cubic-bezier(.34,1.56,.64,1) ${i*.1}s both` }}>
              <div style={{ position:'absolute', top:20, right:16, fontSize:100, opacity:0.05, fontWeight:800, color:'#7c3aed', pointerEvents:'none', userSelect:'none' }}>{s.num}</div>
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:48, marginBottom:20 }}>{s.emoji}</div>
                <h3 style={{ fontSize:20, marginBottom:10 }}>{s.title}</h3>
                <p style={{ color:'#9ca3af', fontSize:14, lineHeight:1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── LIVE SCAM CHECKER ─────────────────────────────────────────
function LiveChecker() {
  const ref = useRef(); useReveal(ref);
  const [msg,setMsg]     = useState('');
  const [city,setCity]   = useState('');
  const [load,setLoad]   = useState(false);
  const [result,setRes]  = useState(null);
  const [err,setErr]     = useState('');
  const VC = {SCAM:'#ef4444',SUSPICIOUS:'#f59e0b',SAFE:'#10b981'};

  const check = async () => {
    if (!msg.trim()) { setErr('Please paste a message to check.'); return; }
    setErr(''); setLoad(true); setRes(null);
    try {
      const r = await axios.post(`${API_URL}/api/analyze`, { message:msg, city });
      setRes(r.data);
    } catch { setErr('Could not connect. Make sure backend is running.'); }
    finally { setLoad(false); }
  };

  const vc = result ? (VC[result.verdict] || '#7c3aed') : '#7c3aed';

  return (
    <section id="checker" style={{ background:'linear-gradient(180deg,transparent,rgba(124,58,237,.05),transparent)' }}>
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'#a78bfa', marginBottom:14 }}>Live AI Detection</p>
          <h2 style={{ fontSize:48, marginBottom:16 }}>Check Any Message <span className="gradient-text">Right Now</span></h2>
          <p style={{ fontSize:16, color:'#9ca3af' }}>No WhatsApp needed — paste any suspicious message and get instant AI analysis</p>
        </div>
        <div style={{ maxWidth:800, margin:'0 auto', background:'rgba(124,58,237,.1)', border:'2px solid rgba(124,58,237,.3)', borderRadius:24, padding:'clamp(20px,5vw,44px)' }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', marginBottom:10, fontSize:14, color:'#d1d5db' }}>Suspicious Message</label>
            <textarea className="inp" value={msg} onChange={e=>setMsg(e.target.value)} rows={5} placeholder="Paste any suspicious message here… e.g. 'Congratulations! You won ₹5,00,000 in PM Yojana lottery…'" />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', marginBottom:10, fontSize:14, color:'#d1d5db' }}>City (Optional)</label>
            <input className="inp" value={city} onChange={e=>setCity(e.target.value)} placeholder="Your city — helps community reporting" style={{ resize:'none' }} />
          </div>
          {err && <p style={{ color:'#ef4444', fontSize:13, marginBottom:14 }}>{err}</p>}
          <button className="btn-primary" onClick={check} disabled={load} style={{ width:'100%', padding:16, fontSize:16, opacity:load?.65:1, background:load?'#9ca3af':'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow:load?'none':'0 0 30px rgba(124,58,237,.4)', cursor:load?'not-allowed':'pointer' }}>
            {load ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <span style={{ width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block' }}/>
                Analysing with Groq AI…
              </span>
            ) : '🔍 Check Now'}
          </button>
          <p style={{ fontSize:12, color:'#6b7280', marginTop:14, textAlign:'center' }}>Powered by Groq AI — Results in under 10 seconds</p>

          {result && (
            <div style={{ marginTop:30, background:'rgba(0,0,0,.5)', border:`2px solid ${vc}`, borderRadius:20, padding:30, animation:'slideIn .4s ease' }}>
              <div style={{ marginBottom:20, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div style={{ fontSize:36, fontWeight:'bold', color:vc }}>{result.verdict==='SCAM'?'🚨':result.verdict==='SUSPICIOUS'?'⚠️':'✅'} {result.verdict}</div>
                {result.scam_type && result.scam_type!=='none' && (
                  <span style={{ background:vc, color:'#fff', padding:'6px 14px', borderRadius:12, fontSize:12, fontWeight:600 }}>{result.scam_type.toUpperCase()}</span>
                )}
              </div>
              {result.explanation && (
                <div style={{ marginBottom:18 }}>
                  <h4 style={{ marginBottom:10, fontSize:14, color:'#e5e7eb' }}>💬 AI Analysis</h4>
                  <p style={{ fontSize:14, color:'#d1d5db', lineHeight:1.7 }}>{result.explanation}</p>
                </div>
              )}
              {result.red_flags?.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <h4 style={{ marginBottom:10, fontSize:14, color:'#e5e7eb' }}>🚩 Red Flags</h4>
                  {result.red_flags.map((f,i) => (
                    <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:7 }}>
                      <span style={{ color:'#ef4444', fontSize:11, marginTop:4, flexShrink:0 }}>●</span>
                      <span style={{ fontSize:14, color:'#f87171' }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.next_steps && (
                <div style={{ background:`${vc}15`, border:`1px solid ${vc}44`, borderRadius:12, padding:'14px 18px' }}>
                  <h4 style={{ marginBottom:8, fontSize:14, color:vc }}>👉 Next Steps</h4>
                  <p style={{ fontSize:14, color:'#d1d5db' }}>{result.next_steps}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function CountCard({ label, value, color, emoji, trigger }) {
  const n = value;
  return (
    <div className="glass-card card-hover" style={{ background:'rgba(255,255,255,.07)', border:`2px solid ${color}`, borderRadius:16, padding:28, boxShadow:`0 0 20px ${color}33`, textAlign:'center' }}>
      <div style={{ fontSize:30, marginBottom:10 }}>{emoji}</div>
      <div style={{ fontSize:38, fontWeight:800, color, marginBottom:8 }}>{n}</div>
      <div style={{ fontSize:14, color:'#9ca3af' }}>{label}</div>
    </div>
  );
}
function Dashboard() {
  const ref = useRef(); useReveal(ref);
  const [vis,setVis]     = useState(false);
  const [stats,setStats] = useState(null);
  const [reps,setReps]   = useState([]);
  const [load,setLoad]   = useState(true);
  const [demo,setDemo]   = useState(false);
  const trigRef = useRef();

  useIntersect(trigRef, useCallback(() => setVis(true), []));

  const fetchData = useCallback(async () => {
    try {
      const [s,r] = await Promise.all([axios.get(`${API_URL}/api/stats`), axios.get(`${API_URL}/api/reports`)]);
      if (s.data) { setStats(s.data); setReps(r.data); setDemo(false); }
      else { setStats(DEMO_STATS); setReps(DEMO_REPORTS); setDemo(true); }
    } catch { setStats(DEMO_STATS); setReps(DEMO_REPORTS); setDemo(true); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { fetchData(); const t = setInterval(fetchData,30000); return ()=>clearInterval(t); }, [fetchData]);

  const tData = stats?.byType ? (Array.isArray(stats.byType) ? stats.byType : Object.entries(stats.byType).map(([type,count])=>({type,count}))) : [];
  const VC = {SCAM:'#ef4444',SUSPICIOUS:'#f59e0b',SAFE:'#10b981'};
  const BAR_C = ['#7c3aed','#db2777','#a78bfa','#fbbf24','#10b981','#22d3ee'];

  return (
    <section id="dashboard" style={{ background:'#07050f' }}>
      <div ref={ref} className="section reveal">
        <div className="dashboard-header">
          <div>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'#a78bfa', marginBottom:10 }}>Live Data</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:700}}>Community Intelligence, <span className="gradient-text">Visualised</span></h2>
          </div>
          <div className="dashboard-header-meta">
            <div className="live-badge"><div className="live-dot"/>LIVE</div>
            <span style={{ fontSize:13, color:'#6b7280' }}>Auto-refreshes every 30s</span>
            {demo && <span style={{ background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.4)', color:'#f59e0b', fontSize:11, padding:'4px 12px', borderRadius:20 }}>Demo data</span>}
          </div>
        </div>

        {load ? (
          <div style={{ textAlign:'center', padding:80 }}>
            <div style={{ width:40,height:40,border:'3px solid rgba(255,255,255,.1)',borderTop:'3px solid #7c3aed',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }}/>
            <p style={{ color:'#6b7280' }}>Loading live data…</p>
          </div>
        ) : (
          <div ref={trigRef}>
            <div className="grid-4" style={{ marginBottom:32 }}>
              <CountCard label="Total Reports"  value={stats?.total ?? 0}      color="#7c3aed" emoji="📊" trigger={vis && stats}/>
              <CountCard label="Scams Detected" value={stats?.scams ?? 0}      color="#ef4444" emoji="🚨" trigger={vis && stats}/>
              <CountCard label="Suspicious"     value={stats?.suspicious ?? 0} color="#f59e0b" emoji="⚠️" trigger={vis && stats}/>
              <CountCard label="Safe Messages"  value={stats?.safe ?? 0}       color="#10b981" emoji="✅" trigger={vis && stats}/>
            </div>
            <div className="grid-2" style={{ marginBottom:24 }}>
              <div className="glass-card card-hover" style={{ padding:30 }}>
                <h3 style={{ marginBottom:20, fontSize:18 }}>Verdict Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={DEMO_VERDICT} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {DEMO_VERDICT.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'rgba(7,5,15,.95)', border:'1px solid rgba(124,58,237,.3)', borderRadius:8 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card card-hover" style={{ padding:30 }}>
                <h3 style={{ marginBottom:20, fontSize:18 }}>Scam Types Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={tData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
                    <XAxis dataKey="type" stroke="#6b7280" style={{ fontSize:11 }}/>
                    <YAxis stroke="#6b7280"/>
                    <Tooltip contentStyle={{ background:'rgba(7,5,15,.95)', border:'1px solid rgba(124,58,237,.3)', borderRadius:8 }}/>
                    <Bar dataKey="count" radius={[8,8,0,0]}>
                      {tData.map((_,i) => <Cell key={i} fill={BAR_C[i%BAR_C.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card card-hover" style={{ padding:'28px 32px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <h3 style={{ fontSize:20 }}>📰 Recent Community Reports</h3>
                <div className="live-badge"><div className="live-dot"/>LIVE</div>
              </div>
              {reps.length===0
                ? <p style={{ color:'#6b7280', textAlign:'center', padding:'32px 0' }}>No reports yet. Be the first to report a scam!</p>
                : reps.slice(0,8).map(r => (
                  <div key={r.id} style={{ background:'rgba(255,255,255,.03)', borderLeft:`4px solid ${VC[r.verdict]||'#7c3aed'}`, borderRadius:10, padding:'14px 18px', marginBottom:12, transition:'all .2s', cursor:'default' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,.08)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.03)';e.currentTarget.style.transform='translateY(0)';}}>
                    <div className="report-card-top">
                      <span style={{ color:VC[r.verdict], fontWeight:700, fontSize:13 }}>{r.verdict==='SCAM'?'🚨':r.verdict==='SUSPICIOUS'?'⚠️':'✅'} {r.verdict}</span>
                      <span className="report-timestamp">{timeAgo(r.created_at)}</span>
                    </div>
                    <div style={{ color:'#9ca3af', fontSize:12, marginBottom:3 }}>📌 {r.scam_type?.toUpperCase()}{r.city&&r.city!=='Unknown'?` · 📍 ${r.city}`:''}</div>
                    <div style={{ color:'#6b7280', fontSize:12 }}>{r.message?.substring(0,90)}…</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── INDIA HEATMAP ─────────────────────────────────────────────
function Heatmap() {
  const ref = useRef(); useReveal(ref);
  const [tip,setTip]       = useState(null);   // hover tooltip (desktop)
  const [tapTip,setTapTip] = useState(null);   // tap tooltip (mobile)
  const getColor = r => r===0?'rgba(255,255,255,.05)':r<=5?'#4c1d95':r<=15?'#7c3aed':r<=25?'#db2777':'#ef4444';
  const top5 = [...STATE_DATA].sort((a,b)=>b.reports-a.reports).slice(0,5);
  const max  = Math.max(...STATE_DATA.map(s=>s.reports));

  return (
    <section id="heatmap" style={{ background:'#07050f' }}>
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'#a78bfa', marginBottom:14 }}>Geographic Intelligence</p>
          <h2 style={{ fontSize:48, marginBottom:16 }}>Scam Hotspots <span className="gradient-text">Across India</span></h2>
          <div className="live-badge" style={{ display:'inline-flex' }}><div className="live-dot"/>UPDATING LIVE</div>
        </div>

        <div className="heatmap-outer">
          <div>
            {/* Mobile inline tap tooltip */}
            <div className="heatmap-inline-tip">
              {tapTip
                ? <><strong style={{color:'#e5e7eb'}}>{tapTip.name}</strong> — <span style={{color:'#a78bfa'}}>{tapTip.reports} reports</span></>
                : <span style={{color:'#6b7280',fontSize:12}}>Tap a state to see details</span>
              }
            </div>

            <div className="heatmap-state-grid">
              {STATE_DATA.map((st,i) => (
                <div
                  key={i}
                  className="glass-card card-hover"
                  onMouseEnter={e=>{
                    setTip({name:st.name,reports:st.reports,x:e.clientX,y:e.clientY});
                    e.currentTarget.style.transform='scale(1.08)';
                  }}
                  onMouseLeave={e=>{
                    setTip(null);
                    e.currentTarget.style.transform='scale(1)';
                  }}
                  onTouchStart={()=>{
                    setTapTip(t => t?.name===st.name ? null : {name:st.name,reports:st.reports});
                  }}
                  style={{
                    background:getColor(st.reports),
                    border:`1px solid ${getColor(st.reports)}88`,
                    borderRadius:10,
                    padding:'14px 6px',
                    textAlign:'center',
                    cursor:'pointer',
                    minHeight:60,
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    justifyContent:'center',
                    boxShadow:st.reports>0?`0 0 12px ${getColor(st.reports)}44`:'none',
                    transition:'all .25s',
                  }}
                >
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.8)', fontWeight:600, lineHeight:1.3 }}>
                    {st.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginTop:3 }}>
                    {st.reports}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
              {[['0','rgba(255,255,255,.06)'],['1–5','#4c1d95'],['6–15','#7c3aed'],['16–25','#db2777'],['26+','#ef4444']].map(([l,c])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:12,height:12,borderRadius:3,background:c }}/>
                  <span style={{ color:'#6b7280', fontSize:11 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: top 5 ranking */}
          <div>
            <h3 style={{ fontSize:20, marginBottom:24 }}>🏆 Top 5 Most Affected States</h3>
            {top5.map((s,i) => (
              <div key={i} style={{ marginBottom:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ color:'#d1d5db', fontSize:14, fontWeight:500 }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]} {s.name}</span>
                  <span style={{ color:'#a78bfa', fontWeight:700, fontSize:14 }}>{s.reports} reports</span>
                </div>
                <div style={{ background:'rgba(255,255,255,.07)', borderRadius:50, height:7, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(s.reports/max)*100}%`, background:'linear-gradient(90deg,#7c3aed,#db2777)', borderRadius:50, transition:'width 1.2s ease' }}/>
                </div>
              </div>
            ))}
            <p style={{ color:'#6b7280', fontSize:12, marginTop:20, fontStyle:'italic' }}>Based on anonymous community reports — updated in real time</p>
          </div>
        </div>

        {/* Desktop hover tooltip — position:fixed, fine on desktop */}
        {tip && (
          <div style={{ position:'fixed', top:tip.y-60, left:tip.x+12, background:'rgba(10,8,24,.95)', border:'1px solid rgba(124,58,237,.4)', borderRadius:10, padding:'8px 14px', zIndex:999, pointerEvents:'none', boxShadow:'0 4px 20px rgba(0,0,0,.6)' }}>
            <div style={{ fontWeight:700, color:'#e5e7eb', fontSize:13 }}>{tip.name}</div>
            <div style={{ color:'#a78bfa', fontSize:12 }}>{tip.reports} reports</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── WHATSAPP DEMO ─────────────────────────────────────────────
function WADemo() {
  const ref = useRef(); useReveal(ref);
  return (
    <section style={{ background:'linear-gradient(135deg,#07050f,#1a0f2e,#07050f)' }}>
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'#a78bfa', marginBottom:14 }}>WhatsApp Bot</p>
          <h2 style={{ fontSize:48, marginBottom:16 }}>WhatsApp Integration <span className="gradient-text">Demo</span></h2>
          <p style={{ fontSize:16, color:'#9ca3af' }}>Users can report suspicious messages via WhatsApp and receive instant AI-powered scam analysis.</p>
        </div>
        <div className="grid-2" style={{ alignItems:'center', maxWidth:1000, margin:'0 auto' }}>
          <div style={{ background:'rgba(0,0,0,.5)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,.08)' }}>
            <div style={{ background:'#075e54', padding:'14px 20px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#db2777)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🛡️</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:'#fff' }}>SheScam Bot</div>
                <div style={{ color:'#25d366', fontSize:12 }}>● demo</div>
              </div>
            </div>
            <div style={{ padding:'20px 18px' }}>
              <div style={{ background:'rgba(255,255,255,.07)', borderRadius:'14px 14px 14px 3px', padding:'11px 14px', fontSize:13, color:'#d1d5db', maxWidth:'88%', marginBottom:14, lineHeight:1.5 }}>
                Congratulations! You won ₹5,00,000 PM Yojana Lottery. Send Aadhaar + ₹500 processing fee to claim your prize.
              </div>
              <div style={{ background:'rgba(124,58,237,.15)', border:'1px solid rgba(124,58,237,.3)', borderRadius:'14px 14px 3px 14px', padding:'14px 16px', fontSize:13, marginLeft:'auto', maxWidth:'95%' }}>
                <div style={{ color:'#ef4444', fontWeight:700, marginBottom:6 }}>🚨 SCAM DETECTED</div>
                <div style={{ color:'#f87171', marginBottom:3 }}>📌 Type: LOTTERY / GOVT FRAUD</div>
                <div style={{ color:'#d1d5db', marginBottom:3 }}>🚩 Govt never charges processing fees</div>
                <div style={{ color:'#d1d5db', marginBottom:3 }}>🚩 No PM Yojana lottery exists</div>
                <div style={{ color:'#d1d5db', marginBottom:3 }}>🚩 Aadhaar sharing is dangerous</div>
                <div style={{ color:'#10b981', fontWeight:600 }}>✅ Block & report — call 1930</div>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize:26, marginBottom:24, fontWeight:800 }}>Forward. Analyze. Stay safe.</h3>
            {[
              {e:'📲',t:'WhatsApp-based reporting', d:'Users can forward suspicious messages directly'},
              {e:'⚡',t:'Instant AI analysis', d:'Get SAFE / SUSPICIOUS / SCAM in seconds'},
              {e:'🌐',t:'Hindi + English', d:'Supports multilingual scam detection'},
              {e:'🔒',t:'Privacy-first design', d:'Messages processed securely and anonymously'},
            ].map((item,i) => (
              <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:20 }}>
                <div style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{item.e}</div>
                <div>
                  <div style={{ fontWeight:600, color:'#e5e7eb', fontSize:15, marginBottom:3 }}>{item.t}</div>
                  <div style={{ color:'#6b7280', fontSize:13 }}>{item.d}</div>
                </div>
              </div>
            ))}
            <div style={{ background:'rgba(16,185,129,.15)', border:'1px solid rgba(16,185,129,.4)', color:'#10b981', padding:'14px 24px', borderRadius:12, fontSize:14, textAlign:'center', marginTop:24 }}>
              📱 <strong>WhatsApp Integration Available</strong> — Bot runs in a controlled demo environment.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SCAM AWARENESS ────────────────────────────────────────────
function Awareness() {
  const ref = useRef(); useReveal(ref);
  const scams = [
    {emoji:'💍',title:'Matrimonial Fraud', warnings:['Fake profile pictures','Asks for money urgently','Never meets in person','Creates emotional connection']},
    {emoji:'💼',title:'Fake Job Offers',   warnings:['High salary for easy work','No interview process','Advance payment required','Unknown company name']},
    {emoji:'🎰',title:'Lottery Scams',     warnings:["You won a prize you didn't enter","Immediate action required","Deposit money to claim","Using WhatsApp only"]},
    {emoji:'💳',title:'Loan Fraud',        warnings:['Instant approval without verification','Processing fee upfront','No credit check mentioned','Unrealistic interest rates']},
    {emoji:'👮',title:'Impersonation',     warnings:['Claiming to be police/bank official','Account blocked threat','Immediate action needed','Asking for personal details']},
    {emoji:'🔗',title:'Phishing Links',    warnings:['Suspicious shortened URLs','Urgency in message tone','Asks for login credentials','Looks like official website']},
  ];
  return (
    <section id="awareness" style={{ background:'#07050f' }}>
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <h2 style={{ fontSize:48, marginBottom:16 }}>Know Your Enemy</h2>
          <p style={{ fontSize:18, color:'#9ca3af' }}>Understanding common scam tactics helps you stay protected</p>
        </div>
        <div className="grid-3" style={{ marginBottom:60 }}>
          {scams.map((sc,i) => (
            <div key={i} className="glass-card card-hover" style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:18, padding:24, borderTop:'3px solid #db2777', animation:`fadeInUp .6s ease ${i*.1}s both` }}>
              <div style={{ fontSize:40, marginBottom:12 }}>{sc.emoji}</div>
              <h3 style={{ fontSize:18, marginBottom:10 }}>{sc.title}</h3>
              <ul style={{ paddingLeft:0, listStyle:'none' }}>
                {sc.warnings.map((w,j) => (
                  <li key={j} style={{ fontSize:13, color:'#9ca3af', marginBottom:6, lineHeight:1.5, display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ color:'#ef4444', fontWeight:'bold', flexShrink:0 }}>•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ background:'linear-gradient(135deg,#7f1d1d,#991b1b)', border:'2px solid #dc2626', borderRadius:20, padding:40, textAlign:'center' }}>
          <h3 style={{ fontSize:24, marginBottom:14 }}>🆘 Got Scammed? Get Help Now</h3>
          <p style={{ fontSize:16, color:'#fee2e2', marginBottom:24 }}>Don't panic. Here's what to do immediately:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>
            {[{icon:'📞',title:'Cybercrime Helpline',value:'1930'},{icon:'👩',title:'Women Helpline',value:'1091'},{icon:'🚔',title:'Police',value:'100'},{icon:'🌐',title:'File Complaint',value:'cybercrime.gov.in'}].map((h,i) => (
              <div key={i} style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:18, transition:'all .25s', cursor:'default' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,.5)';e.currentTarget.style.transform='translateY(-3px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,.35)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{ fontSize:28, marginBottom:8 }}>{h.icon}</div>
                <div style={{ fontSize:12, color:'#fecaca', marginBottom:6 }}>{h.title}</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{h.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── COMMUNITY REPORT ──────────────────────────────────────────
function Community() {
  const ref = useRef(); useReveal(ref);
  const [desc,setDesc]   = useState('');
  const [type,setType]   = useState('');
  const [city,setCity]   = useState('');
  const [load,setLoad]   = useState(false);
  const [ok,setOk]       = useState(false);
  const submit = async () => {
    if (!desc.trim()) return;
    setLoad(true);
    try { await axios.post(`${API_URL}/api/analyze`,{message:desc,city}); setOk(true); setDesc(''); setType(''); setCity(''); setTimeout(()=>setOk(false),5000); }
    catch { setOk(true); }
    finally { setLoad(false); }
  };
  return (
    <section id="community" style={{ background:'#07050f' }}>
      <div ref={ref} className="section reveal" style={{ maxWidth:800 }}>
        <div className="heading-wrapper">
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'#a78bfa', marginBottom:14 }}>Community</p>
          <h2 style={{ fontSize:48, marginBottom:14 }}>Warn the <span className="gradient-text">Community</span></h2>
          <p style={{ fontSize:16, color:'#9ca3af' }}>Encountered a scam? Report it anonymously to help protect other women across India.</p>
        </div>
        <div style={{ background:'rgba(124,58,237,.1)', border:'2px solid rgba(124,58,237,.3)', borderRadius:24, padding:'clamp(20px,5vw,44px)' }}>
          {ok ? (
            <div style={{ textAlign:'center', padding:'32px 0', animation:'fadeInUp .4s ease' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>💜</div>
              <h3 style={{ fontSize:24, marginBottom:10 }}>Thank You!</h3>
              <p style={{ color:'#9ca3af', fontSize:15 }}>Your report helps protect other women across India.</p>
            </div>
          ) : (
            <>
              <textarea className="inp" value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Describe the scam you encountered…" style={{ marginBottom:16 }}/>
              <select className="inp" value={type} onChange={e=>setType(e.target.value)} data-type="select" style={{ marginBottom:16, cursor:'pointer', resize:'none' }}>
                <option value="">Select scam type…</option>
                {['Matrimonial Fraud','Fake Job Offer','Lottery Scam','Loan Fraud','Impersonation','Phishing Link','Government Scheme','Other'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input className="inp" value={city} onChange={e=>setCity(e.target.value)} placeholder="Your city (optional)" style={{ marginBottom:24, resize:'none' }}/>
              <button className="btn-primary" onClick={submit} disabled={load||!desc.trim()} style={{ width:'100%', padding:16, fontSize:15, opacity:load||!desc.trim()?.6:1, cursor:load||!desc.trim()?'not-allowed':'pointer' }}>
                {load?'Submitting…':'📢 Submit Anonymous Report'}
              </button>
              <p style={{ fontSize:12, color:'#6b7280', textAlign:'center', marginTop:12 }}>Your identity is never stored. Reports are fully anonymous.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FAQ() {
  const ref = useRef(); useReveal(ref);
  const [open,setOpen] = useState(null);
  const faqs = [
    {q:'Is this free to use?',         a:'Yes! SheScam is completely free. Our mission is to protect every woman without any cost.'},
    {q:'Are my messages stored?',      a:'Only anonymous metadata is stored — scam type, verdict, city if provided. Your identity and personal details are never saved.'},
    {q:'Does it work in Hindi?',       a:'Yes! SheScam detects and responds in both Hindi and English automatically based on your message language.'},
    {q:'What scam types can it detect?',a:'Matrimonial Fraud, Fake Job Offers, Lottery Scams, Loan Fraud, Impersonation, Phishing Links, Government Scheme frauds and more.'},
    {q:'What should I do if it says SCAM?',a:"Block and report the number immediately. Call India's cybercrime helpline 1930 or report at cybercrime.gov.in. Never share Aadhaar, OTP, or money."},
    {q:'Can I use it for someone else?',a:'Absolutely! Forward any suspicious message on behalf of your mother, grandmother, or friend. Protection for all is our goal.'},
  ];
  return (
    <section id="faq" style={{ background:'#07050f' }}>
      <div ref={ref} className="section reveal">
        <div className="heading-wrapper">
          <h2 style={{ fontSize:48, marginBottom:0 }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gap:16 }}>
          {faqs.map((f,i) => (
            <div key={i} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.3)', borderRadius:14, overflow:'hidden', transition:'border-color .2s' }}>
              <button onClick={()=>setOpen(open===i?null:i)} style={{ width:'100%', background:'transparent', border:'none', padding:'20px 24px', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:16, fontWeight:600, color:'#e5e7eb', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {f.q}
                <span style={{ fontSize:22, color:'#7c3aed', transition:'transform .25s', transform:open===i?'rotate(45deg)':'none', flexShrink:0, marginLeft:16 }}>+</span>
              </button>
              {open===i && (
                <div style={{ padding:'0 24px 20px', fontSize:14, color:'#9ca3af', borderTop:'1px solid rgba(124,58,237,.2)', lineHeight:1.75, animation:'fadeInUp .3s ease' }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background:'#0a070f', borderTop:'1px solid rgba(255,255,255,.08)', padding:'48px 20px', textAlign:'center', position:'relative', zIndex:1 }}>
      <div style={{ fontSize:26, fontWeight:800, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
        <span style={{ fontSize:26 }}>🛡️</span>
        <span className="shimmer-logo">SheScam</span>
      </div>
      <p style={{ fontSize:16, color:'#9ca3af', marginBottom:22 }}>Built for every woman. Free. Always. 💜</p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:20 }}>
        {[['📞 1930','Cybercrime'],['👩 1091','Women'],['🚔 100','Police'],['🌐 cybercrime.gov.in','Report']].map(([n])=>(
          <div key={n} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', color:'#fca5a5', padding:'8px 18px', borderRadius:50, fontSize:13, transition:'all .2s', cursor:'default' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.2)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,.1)';}}>
            {n}
          </div>
        ))}
      </div>
      <p style={{ fontSize:12, color:'rgba(107,114,128,.6)' }}>© 2026 SheScam</p>
    </footer>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background:'#07050f', color:'#e5e7eb', overflow:'hidden' }}>
      <Navbar scrolled={scrolled}/>
      <Hero/>
      <HowItWorks/>
      <LiveChecker/>
      <Dashboard/>
      <Heatmap/>
      <WADemo/>
      <Awareness/>
      <Community/>
      <FAQ/>
      <Footer/>
    </div>
  );
}