import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --saffron: #f5a623; --saffron-deep: #d4891a; --saffron-glow: #fbbf50;
    --saffron-soft: #fff8ec; --saffron-pale: #fffcf5; --saffron-100: #fde8a0;
    --cream: #fafaf7; --surface: #ffffff; --surface-alt: #f8f7f3; --surface-2: #f2f0e9;
    --border: #e8e4d8; --border-soft: #f0ede4;
    --ink: #1a1108; --ink-mid: #4a3a20; --ink-muted: #8a7a60;
    --jade: #0d9e6e; --rouge: #e84a4a; --cobalt: #2563eb; --violet: #7c3aed;
    --shadow-xs: 0 1px 3px rgba(26,17,8,.06);
    --shadow-sm: 0 2px 10px rgba(26,17,8,.08), 0 1px 3px rgba(26,17,8,.04);
    --shadow-md: 0 8px 28px rgba(245,166,35,.16), 0 3px 10px rgba(26,17,8,.07);
    --shadow-lg: 0 20px 56px rgba(26,17,8,.12), 0 6px 20px rgba(26,17,8,.06);
    --r-xs: 6px; --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 26px; --r-2xl: 32px; --r-pill: 999px;
    --sans: 'Plus Jakarta Sans', system-ui, sans-serif;
    --display: 'Space Grotesk', system-ui, sans-serif;
    --heading: 'Space Grotesk', system-ui, sans-serif;
    --serif: 'Instrument Serif', Georgia, serif;
    font: 15px/1.5 var(--sans);
    color: var(--ink-mid);
    background: var(--cream);
    -webkit-font-smoothing: antialiased;
  }
  body { background: var(--cream); overflow-x: hidden; }
  h1,h2,h3,h4 { font-family: var(--heading); color: var(--ink); line-height: 1.15; }
  button { font-family: var(--sans); cursor: pointer; }
  input, textarea, select { font-family: var(--sans); }

  /* ── Scrollbar ── */
  .hs::-webkit-scrollbar { display: none; }
  .hs { -ms-overflow-style: none; scrollbar-width: none; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--surface-alt); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--saffron-100); }

  /* ── Keyframes ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
  @keyframes loadBar { from { transform:scaleX(0); transform-origin:left; } to { transform:scaleX(1); } }
  @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-9px); } }
  @keyframes floatX { 0%,100% { transform:translateX(0); } 50% { transform:translateX(6px); } }
  @keyframes pulseRing { 0% { transform:scale(1); opacity:.6; } 100% { transform:scale(1.8); opacity:0; } }
  @keyframes heartPop { 0% { transform:scale(1); } 35% { transform:scale(1.5); } 70% { transform:scale(.88); } 100% { transform:scale(1); } }
  @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes slideDown { from { opacity:0; transform:translate(-50%,-14px) scale(.96); } to { opacity:1; transform:translate(-50%,0) scale(1); } }
  @keyframes bounceIn { 0% { transform:scale(.15); opacity:0; } 55% { transform:scale(1.12); } 78% { transform:scale(.94); } 100% { transform:scale(1); opacity:1; } }
  @keyframes gradShift { 0%,100% { background-position:0 50%; } 50% { background-position:100% 50%; } }
  @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(18px,-14px) rotate(4deg);} 66%{transform:translate(-9px,9px) rotate(-3deg);} }
  @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(-14px,18px) rotate(-4deg);} 66%{transform:translate(13px,-9px) rotate(5deg);} }
  @keyframes typeIn { from { opacity:0; transform:scaleX(0); transform-origin:left; } to { opacity:1; transform:scaleX(1); } }
  @keyframes ripple { 0% { transform:scale(0); opacity:.4; } 100% { transform:scale(4); opacity:0; } }
  @keyframes countUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes wave { 0%,100%{transform:scaleY(1);} 50%{transform:scaleY(1.6);} }
  @keyframes tilt { 0%,100%{transform:rotate(-1deg);} 50%{transform:rotate(1deg);} }
  @keyframes drawIn { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }

  button:active:not(:disabled) { transform: scale(.965); transition: transform .06s ease; }

  /* ── App Shell ── */
  #th-app {
    display: grid;
    grid-template-columns: 256px minmax(0, 1fr);
    grid-template-rows: 64px 1fr;
    min-height: 100vh;
    background: var(--cream);
  }
  @media (max-width: 900px) {
    #th-app { grid-template-columns: 1fr; grid-template-rows: 58px 1fr auto; }
  }

  /* ── Topbar ── */
  .th-topbar {
    grid-column: 1/3; display: flex; align-items: center; justify-content: space-between;
    padding: 0 26px; background: rgba(255,255,255,.94);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border-soft);
    box-shadow: 0 1px 8px rgba(26,17,8,.05);
    position: sticky; top: 0; z-index: 100;
  }
  @media (max-width: 900px) { .th-topbar { grid-column:1/2; padding:0 14px; } }

  /* ── Sidebar ── */
  .th-sidebar {
    grid-row: 2/3; background: var(--surface);
    border-right: 1px solid var(--border-soft);
    padding: 20px 10px; display: flex; flex-direction: column; gap: 2px;
    position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto;
  }
  @media (max-width: 900px) { .th-sidebar { display: none; } }

  .th-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 14px; border: none; background: none;
    color: var(--ink-muted); cursor: pointer;
    font-family: var(--sans); font-size: 13px; font-weight: 600;
    transition: all .18s cubic-bezier(.34,1.56,.64,1); border-radius: var(--r-md);
    text-align: left; position: relative; white-space: nowrap;
  }
  .th-nav-item:hover { background: var(--saffron-pale); color: var(--ink); transform: translateX(4px); }
  .th-nav-item.active { color: var(--saffron-deep); background: var(--saffron-soft); font-weight: 700; transform: translateX(4px); }
  .th-nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 7px; bottom: 7px;
    width: 3px; background: linear-gradient(to bottom, var(--saffron-glow), var(--saffron-deep));
    border-radius: 0 3px 3px 0;
  }
  .th-nav-icon {
    width: 30px; height: 30px; border-radius: var(--r-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; letter-spacing: -.02em;
    background: var(--surface-alt); color: var(--ink-muted);
    transition: all .2s; flex-shrink: 0; font-family: var(--display);
  }
  .th-nav-item.active .th-nav-icon { background: rgba(245,166,35,.18); color: var(--saffron-deep); }
  .th-nav-item:hover .th-nav-icon { background: rgba(245,166,35,.12); color: var(--saffron-deep); }
  .nav-badge {
    margin-left: auto; min-width: 19px; height: 19px; padding: 0 5px;
    background: var(--saffron); color: white; border-radius: 99px;
    font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center;
  }
  .nav-divider { height: 1px; background: var(--border-soft); margin: 8px 4px; }
  .nav-label {
    font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em;
    color: var(--ink-muted); padding: 8px 14px 3px;
  }

  /* ── Main ── */
  .th-main { grid-row: 2/3; overflow-y: auto; min-height: 0; }
  @media (max-width: 900px) { .th-main { grid-row: auto; } }

  /* ── Bottom Nav (Mobile) ── */
  .th-bottom-nav {
    display: none; position: sticky; bottom: 0;
    background: rgba(255,255,255,.97); backdrop-filter: blur(24px);
    border-top: 1px solid var(--border-soft); z-index: 90;
    padding: 4px 0 env(safe-area-inset-bottom, 4px);
  }
  @media (max-width: 900px) { .th-bottom-nav { display: flex; } .th-main { padding-bottom: 80px; } }
  .th-bnav-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 7px 4px 9px; border: none; background: none;
    cursor: pointer; color: var(--ink-muted); gap: 3px; position: relative; transition: color .2s;
  }
  .th-bnav-btn.active { color: var(--saffron-deep); }
  .th-bnav-btn .nb-icon {
    width: 34px; height: 26px; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; letter-spacing: -.02em; font-family: var(--display);
    position: relative;
  }
  .th-bnav-btn.active .nb-icon::after {
    content: ''; position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%);
    width: 18px; height: 2px; background: var(--saffron-deep); border-radius: 2px;
    animation: typeIn .2s ease;
  }
  .th-bnav-btn .nb-label { font-size: 9px; font-weight: 700; font-family: var(--display); }
  .th-bnav-dot {
    position: absolute; top: 5px; right: 8px;
    width: 7px; height: 7px; background: var(--saffron); border-radius: 50%;
    border: 2px solid white;
  }

  /* ── Splash ── */
  .th-splash {
    position: fixed; inset: 0; background: var(--ink);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .th-splash.out { animation: fadeIn .5s reverse forwards; pointer-events: none; }
  .splash-wordmark {
    font-family: var(--serif); font-size: 64px; font-style: italic;
    color: var(--saffron-glow); letter-spacing: -.02em;
    animation: bounceIn .7s cubic-bezier(.34,1.56,.64,1) forwards;
    position: relative;
  }
  .splash-wordmark::after {
    content: '™'; font-size: 14px; font-style: normal; font-family: var(--sans);
    vertical-align: super; color: rgba(251,191,80,.5); margin-left: 4px;
  }
  .splash-tagline {
    font-family: var(--display); font-size: 12px; font-weight: 500;
    letter-spacing: .22em; text-transform: uppercase; color: rgba(251,191,80,.6);
    margin-top: 14px; animation: fadeUp .5s .4s both;
  }
  .splash-bar-wrap { margin-top: 60px; width: 56px; height: 2px; background: rgba(245,166,35,.25); border-radius: 4px; overflow: hidden; animation: fadeIn .3s .7s both; }
  .splash-bar { height: 100%; background: var(--saffron); animation: loadBar 2s ease forwards; }
  .splash-dot {
    position: absolute; width: 6px; height: 6px; border-radius: 50%;
    background: rgba(245,166,35,.3); animation: float1 6s ease-in-out infinite;
  }

  /* ── Toast ── */
  .th-toast {
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    padding: 12px 22px; border-radius: var(--r-lg); font-size: 13px; font-weight: 600;
    font-family: var(--display); z-index: 9999; white-space: nowrap;
    animation: slideDown .3s cubic-bezier(.34,1.56,.64,1) forwards;
    display: flex; align-items: center; gap: 8px; backdrop-filter: blur(16px);
    letter-spacing: .01em;
  }
  .th-toast-success { background: rgba(5,60,45,.96); color: #6ee7b7; border: 1px solid rgba(110,231,183,.15); }
  .th-toast-error { background: rgba(100,20,20,.96); color: #fca5a5; border: 1px solid rgba(252,165,165,.15); }
  .toast-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; }
  .th-toast-success .toast-icon { background: rgba(110,231,183,.2); color: #6ee7b7; }
  .th-toast-error .toast-icon { background: rgba(252,165,165,.2); color: #fca5a5; }

  /* ── Buttons ── */
  .btn-primary {
    height: 50px; border-radius: var(--r-lg);
    background: var(--ink); color: #fff;
    font-family: var(--display); font-size: 14px;
    font-weight: 600; border: none; cursor: pointer;
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    position: relative; overflow: hidden; letter-spacing: .02em;
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--saffron-glow), var(--saffron));
    opacity: 0; transition: opacity .2s;
  }
  .btn-primary:hover::before { opacity: 1; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,166,35,.35); color: var(--ink); }
  .btn-primary span { position: relative; }
  .btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-primary:disabled::before { opacity: 0; }

  .btn-gold {
    height: 50px; border-radius: var(--r-lg);
    background: linear-gradient(135deg, var(--saffron-glow), var(--saffron), var(--saffron-deep));
    background-size: 200% 200%; color: var(--ink); font-family: var(--display); font-size: 14px;
    font-weight: 700; border: none; cursor: pointer;
    box-shadow: 0 3px 16px rgba(245,166,35,.3);
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    position: relative; overflow: hidden; letter-spacing: .01em;
  }
  .btn-gold::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transform:translateX(-100%); transition:transform .5s ease; }
  .btn-gold:hover::after { transform: translateX(100%); }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(245,166,35,.4); background-position: right center; }
  .btn-gold:disabled { opacity: .5; cursor: not-allowed; }

  .btn-outline {
    height: 50px; border-radius: var(--r-lg); background: var(--surface);
    color: var(--ink); font-family: var(--display); font-size: 14px; font-weight: 600;
    border: 1.5px solid var(--border); cursor: pointer;
    transition: all .2s;
  }
  .btn-outline:hover { border-color: var(--saffron); background: var(--saffron-soft); transform: translateY(-1px); }

  .btn-ghost {
    height: 38px; padding: 0 14px; border-radius: var(--r-md); background: none;
    color: var(--ink-muted); font-family: var(--sans); font-size: 13px; font-weight: 600;
    border: none; cursor: pointer; transition: all .18s;
  }
  .btn-ghost:hover { background: var(--surface-alt); color: var(--ink); }

  /* ── Inputs ── */
  .th-input {
    width: 100%; height: 48px; padding: 0 14px 0 42px;
    border-radius: var(--r-md); border: 1.5px solid var(--border);
    background: var(--surface); font-size: 13.5px; font-family: var(--sans);
    font-weight: 500; color: var(--ink); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .th-input:focus { border-color: var(--saffron); box-shadow: 0 0 0 4px rgba(245,166,35,.12); }
  .th-input::placeholder { color: var(--ink-muted); }

  /* ── Cards ── */
  .th-card {
    background: var(--surface); border-radius: var(--r-lg);
    border: 1px solid var(--border-soft);
    transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s, border-color .2s;
    animation: fadeUp .4s both;
  }
  .th-card:hover { transform: translateY(-5px) scale(1.008); box-shadow: var(--shadow-md); border-color: var(--saffron-100); }
  .th-card.hoverable { cursor: pointer; }

  /* ── Product Card ── */
  .prod-img-wrap { position: relative; padding-top: 100%; background: var(--surface-alt); overflow: hidden; border-radius: var(--r-lg) var(--r-lg) 0 0; }
  .prod-img-wrap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .th-card:hover .prod-img-wrap img { transform: scale(1.07); }
  .fav-btn {
    position: absolute; top: 10px; right: 10px; width: 32px; height: 32px;
    background: rgba(255,255,255,.95); backdrop-filter: blur(8px);
    border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
    font-weight: 800; font-family: var(--display); color: var(--ink-muted);
    transition: transform .2s, color .2s; box-shadow: 0 2px 8px rgba(0,0,0,.1);
    letter-spacing: -.02em;
  }
  .fav-btn:hover { transform: scale(1.25); color: var(--rouge); }
  .fav-btn.active { color: var(--rouge); }
  .fav-btn.popped { animation: heartPop .4s cubic-bezier(.34,1.56,.64,1); }

  /* ── Category Chips ── */
  .cat-chip {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 12px 14px; border-radius: var(--r-xl); border: 1.5px solid transparent;
    background: var(--surface); cursor: pointer; transition: all .22s cubic-bezier(.34,1.56,.64,1);
    white-space: nowrap; flex-shrink: 0; box-shadow: var(--shadow-xs);
  }
  .cat-chip:hover { border-color: var(--saffron); transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .cat-chip.active { border-color: var(--saffron); background: var(--saffron-soft); transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .cat-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
    font-family: var(--display); color: var(--ink-mid);
    overflow: hidden;
    transition: transform .22s;
  }
  .cat-icon img {
    width: 100%; height: 100%; object-fit: cover;
    border-radius: inherit;
  }
  .cat-chip:hover .cat-icon { transform: scale(1.1) translateY(-2px) rotate(-2deg); }
  .cat-chip.active .cat-icon { color: var(--saffron-deep); }
  .cat-label { font-size: 10px; font-weight: 700; font-family: var(--display); color: var(--ink-muted); }
  .cat-chip.active .cat-label { color: var(--saffron-deep); }

  /* ── Search Bar ── */
  .th-searchbar {
    display: flex; align-items: center; gap: 10px; padding: 11px 16px;
    background: var(--surface-alt); border-radius: var(--r-xl);
    border: 1.5px solid var(--border-soft); color: var(--ink-muted);
    font-size: 13.5px; cursor: pointer; transition: all .2s; width: 100%;
    font-family: var(--sans); font-weight: 500;
  }
  .th-searchbar:hover { border-color: var(--saffron); background: var(--saffron-soft); }

  /* ── Section Header ── */
  .sec-head { display: flex; align-items: center; justify-content: space-between; margin: 0 0 14px; }
  .sec-title { font-family: var(--heading); font-size: 16px; font-weight: 700; color: var(--ink); margin: 0; }
  .see-all { color: var(--saffron-deep); font-size: 12px; font-weight: 700; background: none; border: none; cursor: pointer; font-family: var(--display); padding: 5px 10px; border-radius: var(--r-md); transition: background .18s; letter-spacing: .02em; }
  .see-all:hover { background: var(--saffron-soft); }

  /* ── Skeleton ── */
  .skeleton { background: linear-gradient(90deg,var(--surface-alt) 25%,var(--border-soft) 50%,var(--surface-alt) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: var(--r-md); }

  /* ── Spinner ── */
  .spinner { width: 28px; height: 28px; border: 2.5px solid rgba(245,166,35,.2); border-top-color: var(--saffron); border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── Status Badge ── */
  .status-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; padding: 4px 9px; border-radius: var(--r-pill); letter-spacing: .03em; font-family: var(--display); }

  /* ── Cart Item ── */
  .cart-item { display: flex; gap: 12px; padding: 14px; background: var(--surface); border-radius: var(--r-xl); border: 1px solid var(--border-soft); transition: box-shadow .2s; animation: fadeUp .3s both; }
  .cart-item:hover { box-shadow: var(--shadow-sm); }

  /* ── Qty Control ── */
  .qty-ctrl { display: flex; align-items: center; background: var(--surface-alt); border-radius: var(--r-md); overflow: hidden; border: 1.5px solid var(--border); }
  .qty-btn { width: 36px; height: 36px; border: none; background: transparent; cursor: pointer; font-size: 18px; font-weight: 600; color: var(--saffron-deep); display: flex; align-items: center; justify-content: center; transition: background .15s; }
  .qty-btn:hover { background: var(--saffron-soft); }
  .qty-val { width: 30px; text-align: center; font-family: var(--heading); font-weight: 700; font-size: 13px; color: var(--ink); }

  /* ── Page ── */
  .page-enter { animation: fadeUp .3s ease both; }
  .page-hdr { padding: 22px 26px 0; border-bottom: 1px solid var(--border-soft); background: var(--surface); margin-bottom: 22px; }
  @media (max-width: 900px) { .page-hdr { padding: 14px 14px 0; } }
  .page-hdr h1 { font-size: 22px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 16px; }

  /* ── Dashboard Stat ── */
  .stat-card { background: var(--surface); border-radius: var(--r-xl); border: 1px solid var(--border-soft); padding: 18px 20px; transition: all .22s cubic-bezier(.34,1.56,.64,1); }
  .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-4px); }
  .stat-val { font-family: var(--heading); font-size: 24px; font-weight: 700; color: var(--ink); margin: 6px 0 2px; animation: countUp .4s both; }
  .stat-label { font-size: 10.5px; font-weight: 700; color: var(--ink-muted); text-transform: uppercase; letter-spacing: .08em; }

  /* ── Tab Strip ── */
  .tab-strip { display: flex; gap: 0; border-bottom: 1.5px solid var(--border-soft); }
  .tab-btn { padding: 10px 18px; border: none; background: none; font-family: var(--display); font-size: 13px; font-weight: 600; color: var(--ink-muted); cursor: pointer; position: relative; transition: color .2s; }
  .tab-btn.active { color: var(--saffron-deep); }
  .tab-btn.active::after { content:''; position:absolute; bottom:-1.5px; left:0; right:0; height:2px; background: var(--saffron); border-radius:2px 2px 0 0; animation: typeIn .2s ease; }

  /* ── Product Grid ── */
  .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 16px; }
  @media (max-width: 900px) { .prod-grid { grid-template-columns: repeat(auto-fill, minmax(156px, 1fr)); gap: 12px; } }
  @media (max-width: 600px) { .prod-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

  /* ── Wallet Card ── */
  .wallet-card { border-radius: var(--r-2xl); padding: 26px 24px; color: #fff; background: var(--ink); position: relative; overflow: hidden; }
  .wallet-card::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; background:rgba(245,166,35,.1); border-radius:50%; }
  .wallet-card::after { content:''; position:absolute; bottom:-50px; left:-30px; width:160px; height:160px; background:rgba(245,166,35,.06); border-radius:50%; }

  /* ── Role Card ── */
  .role-card { display:flex; align-items:flex-start; gap:16px; padding:18px 16px; border-radius:var(--r-xl); border:1.5px solid var(--border); background:var(--surface); cursor:pointer; text-align:left; transition:all .22s cubic-bezier(.34,1.56,.64,1); animation:fadeUp .4s both; }
  .role-card:hover { border-color:var(--saffron); transform:translateY(-3px); box-shadow:0 8px 24px rgba(245,166,35,.14); }
  .role-card.active { border-color:var(--saffron); background:var(--saffron-soft); transform:translateY(-3px); box-shadow:0 8px 24px rgba(245,166,35,.16); }

  /* ── Payment Option ── */
  .pay-opt { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:var(--r-xl); border:1.5px solid var(--border); background:var(--surface); cursor:pointer; transition:all .2s; text-align:left; }
  .pay-opt.active { border-color:var(--saffron); background:var(--saffron-soft); }
  .pay-opt:hover:not(.active) { border-color:var(--saffron-100); }

  /* ── Float Panel ── */
  .float-panel { position:sticky; bottom:0; background:rgba(255,255,255,.97); backdrop-filter:blur(24px); border-top:1px solid var(--border-soft); padding:14px 22px; box-shadow:0 -6px 28px rgba(26,17,8,.07); z-index:40; }
  @media (max-width: 900px) { .float-panel { position:fixed; bottom:68px; left:0; right:0; } }

  /* ── Auth ── */
  .auth-wordmark { font-family: var(--serif); font-size: 40px; font-style: italic; color: var(--saffron-deep); letter-spacing: -.02em; animation: bounceIn .5s cubic-bezier(.34,1.56,.64,1) both; display: block; margin-bottom: 28px; }
  .auth-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
  .auth-divider::before, .auth-divider::after { content:''; flex:1; height:1px; background:var(--border); }
  .auth-divider span { font-size:10px; font-weight:800; color:var(--ink-muted); text-transform:uppercase; letter-spacing:.12em; }

  /* ── Misc ── */
  .brand-wordmark {
    font-family: var(--serif); font-size: 22px; font-style: italic;
    color: var(--ink); letter-spacing: -.02em; flex-shrink: 0;
    transition: color .2s;
  }
  .brand-wordmark span { color: var(--saffron-deep); }
  .th-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px; text-align:center; gap:12px; }
  .th-empty .icon { font-family: var(--display); font-size: 48px; font-weight: 800; color: var(--saffron-100); animation:floatY 3s ease-in-out infinite; }
  .th-empty h3 { font-family:var(--heading); font-size:18px; font-weight:700; color:var(--ink); }
  .th-empty p { color:var(--ink-muted); font-size:13px; max-width:240px; line-height:1.65; }

  /* ── Banner ── */
  .th-banner { border-radius:var(--r-2xl); padding:26px 24px; background:var(--ink); color:#fff; position:relative; overflow:hidden; }
  .th-banner-accent { position:absolute; top:-30px; right:-20px; font-family:var(--serif); font-style:italic; font-size:180px; color:rgba(245,166,35,.06); line-height:1; pointer-events:none; user-select:none; }
  .th-banner h3 { font-family:var(--heading); font-size:20px; font-weight:700; margin:8px 0 5px; color:#fff; }
  .th-banner p { font-size:13px; color:rgba(255,255,255,.65); margin:0; }
  .th-banner-btn { margin-top:16px; padding:10px 20px; background:rgba(245,166,35,.15); color:var(--saffron-glow); border:1px solid rgba(245,166,35,.3); border-radius:var(--r-pill); font-family:var(--display); font-weight:600; font-size:12.5px; cursor:pointer; transition:all .2s; letter-spacing:.02em; }
  .th-banner-btn:hover { background:rgba(245,166,35,.25); transform:translateX(3px); }

  /* ── Step dots ── */
  .step-dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-family:var(--heading); font-size:13px; transition:all .3s; }
  .step-dot.done { background:var(--ink); color:var(--saffron-glow); box-shadow:0 3px 14px rgba(26,17,8,.25); }
  .step-dot.pending { background:var(--border); color:var(--ink-muted); }
  .step-line { flex:1; height:2px; border-radius:2px; background:var(--border); transition:background .4s; }
  .step-line.done { background:var(--ink); }

  /* ── Desktop layout helpers ── */
  .desktop-two-col { display:grid; grid-template-columns:1fr 330px; gap:22px; }
  @media (max-width:900px) { .desktop-two-col { grid-template-columns:1fr; } }

  /* ── Text Icon ── */
  .tx-icon {
    display: inline-flex; align-items: center; justify-content: center;
    font-family: var(--display); font-weight: 800; font-size: 11px;
    letter-spacing: .02em; border-radius: var(--r-xs);
    width: 28px; height: 28px;
  }

  /* ── Quick Action Card ── */
  .qa-card {
    padding: 18px 16px; border-radius: var(--r-xl); background: var(--surface);
    border: 1.5px solid var(--border-soft); cursor: pointer;
    display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
    transition: all .22s cubic-bezier(.34,1.56,.64,1); position: relative; overflow: hidden;
    animation: fadeUp .4s both;
  }
  .qa-card::after {
    content: ''; position: absolute; inset: 0; opacity: 0;
    transition: opacity .2s;
  }
  .qa-card:hover { border-color: var(--saffron); transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .qa-card:hover::after { opacity: 1; }
  .qa-card-icon {
    width: 42px; height: 42px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--display); font-weight: 900; font-size: 13px;
    letter-spacing: -.01em; transition: transform .22s cubic-bezier(.34,1.56,.64,1);
  }
  .qa-card:hover .qa-card-icon { transform: scale(1.12) rotate(-3deg); }
  .qa-card-label { font-family: var(--display); font-size: 12.5px; font-weight: 700; color: var(--ink); }
  .qa-card-sub { font-size: 11px; color: var(--ink-muted); margin-top: -4px; }
  .qa-card-arrow { position: absolute; top: 14px; right: 14px; font-size: 14px; font-weight: 700; color: var(--ink-muted); opacity: 0; transform: translateX(-6px); transition: all .2s; }
  .qa-card:hover .qa-card-arrow { opacity: 1; transform: translateX(0); }

  /* ── Product Stats Pill ── */
  .stat-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:var(--r-pill); font-size:11px; font-weight:700; font-family:var(--display); }

  /* ── Floating label input ── */
  .field-group { position: relative; margin-bottom: 14px; }
  .field-group label { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--ink-muted); pointer-events: none; transition: all .18s; }
  .field-group input:focus + label, .field-group input:not(:placeholder-shown) + label { top: 8px; font-size: 10px; color: var(--saffron-deep); font-weight: 700; letter-spacing: .04em; transform: none; }
  .field-group input { padding-top: 14px; }

  /* ── Desktop layout helpers ── */
  .desktop-three-col { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media (max-width:900px) { .desktop-three-col { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:600px) { .desktop-three-col { grid-template-columns:1fr 1fr; } }

  /* ── Seller product row ── */
  .product-row { display:flex; align-items:center; gap:14px; padding:13px 16px; background:var(--surface); border-radius:var(--r-xl); border:1px solid var(--border-soft); margin-bottom:10px; transition:box-shadow .2s, transform .2s; animation:fadeUp .35s both; }
  .product-row:hover { box-shadow:var(--shadow-sm); transform:translateX(3px); }

  /* ── Analytics bar ── */
  .anal-bar-wrap { background: var(--surface-alt); border-radius: var(--r-pill); overflow: hidden; height: 6px; }
  .anal-bar { height: 100%; background: var(--ink); border-radius: var(--r-pill); transition: width .8s cubic-bezier(.34,1.56,.64,1); }

  /* ── Notification dot ── */
  .notif-dot { width: 8px; height: 8px; background: var(--rouge); border-radius: 50%; border: 2px solid white; flex-shrink: 0; }
`;

// ─── STATUS CONFIG ──────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending: { label: "Pending", color: "#78350f", bg: "#fef3c7" },
  confirmed: { label: "Confirmed", color: "#064e3b", bg: "#d1fae5" },
  preparing: { label: "Preparing", color: "#1e3a8a", bg: "#dbeafe" },
  out_for_delivery: { label: "Out for Delivery", color: "#4c1d95", bg: "#ede9fe" },
  delivered: { label: "Delivered", color: "#064e3b", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", color: "#7f1d1d", bg: "#fee2e2" },
};
const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n) => `₱${Number(n || 0).toLocaleString()}`;
const disc = (p, op) => op ? Math.round((1 - p / op) * 100) : 0;

function Img({ src, alt, style, className }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", ...style }} className={className}>
      <span style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 800, color: "#d1d5db", letterSpacing: ".04em" }}>IMG</span>
    </div>
  );
  return <img src={src} alt={alt} style={style} className={className} onError={() => setErr(true)} loading="lazy" />;
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`th-toast th-toast-${type}`}>
      <span className="toast-icon">{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}><div className="spinner" /></div>;
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="th-empty">
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action}
    </div>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    setTimeout(() => { setOut(true); setTimeout(onDone, 500); }, 2600);
  }, []);
  const dots = [[{ top: "12%", left: "8%" }, { top: "20%", right: "12%" }, { bottom: "18%", left: "14%" }, { bottom: "25%", right: "18%" }]];
  return (
    <div className={`th-splash${out ? " out" : ""}`}>
      {[{ top: "12%", left: "8%" }, { top: "20%", right: "12%" }, { bottom: "18%", left: "14%" }, { bottom: "25%", right: "18%" }].map((pos, i) => (
        <div key={i} className="splash-dot" style={{ ...pos, animationDelay: `${i * .5}s` }} />
      ))}
      <div style={{ textAlign: "center" }}>
        <div className="splash-wordmark">Tindahub</div>
        <div className="splash-tagline">Local Filipino Marketplace</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
          {["N", "O", "R", "T", "H", "E", "R", "N", " ", "M", "I", "N", "D", "A", "N", "A", "O"].map((c, i) => (
            <span key={i} style={{ fontFamily: "var(--display)", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(245,166,35,.35)", animation: `fadeIn .2s ${.8 + i * .04}s both` }}>{c}</span>
          ))}
        </div>
      </div>
      <div className="splash-bar-wrap" style={{ marginTop: 56 }}><div className="splash-bar" /></div>
    </div>
  );
}

function TopBar({ screen, navigate, cartCount, user }) {
  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  if (isAuth) return null;
  return (
    <header className="th-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ cursor: "pointer" }} onClick={() => navigate("home")}>
          <span className="brand-wordmark">Tinda<span>hub</span></span>
        </div>
        <span style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 600, fontFamily: "var(--display)", letterSpacing: ".04em", background: "var(--surface-alt)", padding: "3px 8px", borderRadius: var_r_pill }}>📍 N. Mindanao</span>
      </div>
      <div style={{ flex: 1, maxWidth: 360, margin: "0 24px", display: "none" }} className="desktop-search">
        <button className="th-searchbar" onClick={() => navigate("search")}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 12, color: "var(--ink-muted)", letterSpacing: ".04em" }}></span>
          <span>Search products, stores...</span>
          <span style={{ marginLeft: "auto", fontSize: 10, background: "var(--border)", padding: "2px 7px", borderRadius: 99, fontFamily: "var(--display)", fontWeight: 700, color: "var(--ink-muted)" }}>⌘K</span>
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate("cart")} style={{ position: "relative", padding: "8px 11px", background: "var(--surface-alt)", borderRadius: 12, border: "1.5px solid var(--border-soft)", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--saffron-soft)"} onMouseLeave={e => e.currentTarget.style.background = "var(--surface-alt)"}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 12, letterSpacing: ".02em", color: "var(--ink)" }}>BAG</span>
          {cartCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, background: "var(--saffron)", borderRadius: "50%", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "2px solid white" }}>{cartCount}</span>}
        </button>
        <button onClick={() => navigate("profile")} style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--saffron-100)", cursor: "pointer", background: "var(--saffron-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {(user?.avatar_url || user?.user_metadata?.avatar_url)
            ? <img src={user.avatar_url || user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
            : <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 11, color: "var(--saffron-deep)" }}>{user?.email?.slice(0, 2).toUpperCase() || "ME"}</span>}
        </button>
      </div>
    </header>
  );
}

const var_r_pill = "999px";

function Sidebar({ screen, navigate, cartCount, user }) {
  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  if (isAuth) return null;
  const groups = [
    {
      label: "Discover", items: [
        { id: "home", label: "Home" },
        { id: "search", label: "Browse" },
      ]
    },
    {
      label: "Shopping", items: [
        { id: "cart", label: "Bag", badge: cartCount > 0 ? cartCount : null },
        { id: "orders", label: "Orders" },
        { id: "wallet", label: "Wallet" },
      ]
    },
    {
      label: "Manage", items: [
        { id: "profile", label: "Profile" },
        ...(user?.role === "seller" ? [{ id: "seller-dashboard", label: "My Store" }] : []),
      ]
    },
  ];
  return (
    <nav className="th-sidebar">
      {groups.map(group => (
        <div key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => (
            <button key={item.id} className={`th-nav-item${screen === item.id ? " active" : ""}`} onClick={() => navigate(item.id)}>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="nav-divider" />
        </div>
      ))}
      <div style={{ marginTop: "auto", padding: "8px 4px" }}>
        <div style={{ background: "var(--surface-alt)", borderRadius: "var(--r-xl)", padding: "14px 14px", border: "1px solid var(--border-soft)" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--saffron-deep)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "var(--display)" }}>Community</p>
          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)", margin: "0 0 1px" }}>1,200+</p>
          <p style={{ fontSize: 10, color: "var(--ink-muted)", margin: 0 }}>Local sellers supported</p>
        </div>
      </div>
    </nav>
  );
}

function BottomNavBar({ screen, navigate, cartCount }) {
  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  if (isAuth) return null;
  const tabs = [
    { id: "home", label: "Home" },
    { id: "search",label: "Browse" },
    { id: "cart", label: "Bag" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
  ];
  return (
    <nav className="th-bottom-nav">
      {tabs.map(t => (
        <button key={t.id} className={`th-bnav-btn${screen === t.id ? " active" : ""}`} onClick={() => navigate(t.id)}>
          <span className="nb-icon">{t.tx}</span>
          {t.id === "cart" && cartCount > 0 && <span className="th-bnav-dot" />}
          <span className="nb-label" style={{ fontSize: 14, fontWeight: 800 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({ navigate, showToast }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [favs, setFavs] = useState([]);

  const categoryImageMap = {
    FOO: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=260&q=80",
    FRE: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=260&q=80",
    ART: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=260&q=80",
    HOM: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=260&q=80",
    FAS: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=260&q=80",
    HEA: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=260&q=80",
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("*, store:stores(id,name,slug,is_verified,city), images:product_images(url,is_primary)").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = selectedCat ? products.filter(p => p.category_id === selectedCat) : products;
  const featured = products.filter(p => p.is_featured).slice(0, 6);
  const getImg = (p) => p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || p.image_url;

  const toggleFav = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login to save favorites", "error"); return; }
    if (favs.includes(productId)) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setFavs(f => f.filter(x => x !== productId));
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      setFavs(f => [...f, productId]);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("wishlists").select("product_id").eq("user_id", user.id)
          .then(({ data }) => setFavs(data?.map(w => w.product_id) || []));
      }
    });
  }, []);

  return (
    <div style={{ padding: "0 0 24px" }} className="page-enter">
      <div style={{ padding: "14px 14px 10px", background: "var(--surface)", borderBottom: "1px solid var(--border-soft)", display: "none" }} className="mobile-search-wrap">
        <button className="th-searchbar" onClick={() => navigate("search")} style={{ width: "100%" }}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 12 }}></span> Search products, stores...
        </button>
      </div>

      <div style={{ padding: "22px 26px 0" }}>
        {/* Hero Banner */}
        <div className="th-banner" style={{ marginBottom: 26 }}>
          <span className="th-banner-accent">T</span>
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(245,166,35,.7)" }}>COMMUNITY MARKET</span>
            <h3>Support Local Artisans</h3>
            <p>Handcrafted goods from your Filipino community</p>
            <button className="th-banner-btn" onClick={() => navigate("search")}>Explore Now →</button>
          </div>
        </div>

        {/* Categories */}
        {!loading && categories.length > 0 && (
          <>
            <div className="sec-head">
              <h2 className="sec-title">Categories</h2>
              <button className="see-all">View All →</button>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 6 }} className="hs">
              {categories.map((cat, i) => {
                const code = (cat.code || cat.name || "").slice(0, 3).toUpperCase();
                const image = cat.image_url || categoryImageMap[code];
                return (
                  <button key={cat.id} className={`cat-chip${selectedCat === cat.id ? " active" : ""}`} onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)} style={{ animationDelay: `${i * .05}s` }}>
                    <div className="cat-icon" style={{ background: selectedCat === cat.id ? "rgba(245,166,35,.12)" : cat.color || "#fef3c7" }}>
                      {image ? <img src={image} alt={cat.name} /> : (cat.name || "").slice(0, 3).toUpperCase()}
                    </div>
                    <span className="cat-label">{cat.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(196px,1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="th-card" style={{ overflow: "hidden", animationDelay: `${i * .06}s` }}>
                <div className="skeleton" style={{ height: 196 }} />
                <div style={{ padding: 12 }}>
                  <div className="skeleton" style={{ height: 13, marginBottom: 7 }} />
                  <div className="skeleton" style={{ height: 10, width: "55%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && !selectedCat && (
              <>
                <div className="sec-head"><h2 className="sec-title">Featured</h2><button className="see-all" onClick={() => navigate("search")}>See All →</button></div>
                <div className="prod-grid" style={{ marginBottom: 26 }}>
                  {featured.map((p, i) => (
                    <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={toggleFav} onClick={() => navigate("product", { id: p.id })} delay={i * 0.05} />
                  ))}
                </div>
              </>
            )}

            <div className="sec-head">
              <h2 className="sec-title">{selectedCat ? categories.find(c => c.id === selectedCat)?.name : "Recently Added"}</h2>
              <button className="see-all" onClick={() => navigate("search")}>See All →</button>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon="BGS" title="No products found" desc="Try a different category" />
            ) : (
              <div className="prod-grid">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={toggleFav} onClick={() => navigate("product", { id: p.id })} delay={i * 0.04} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Community stats */}
        <div style={{ margin: "28px 0 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[["1,200+", "Local Sellers", "STR"], ["48k+", "Happy Buyers", "USR"], ["₱12M+", "Sales", "TXN"]].map(([v, l, tx]) => (
            <div key={l} className="stat-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 10, color: "var(--ink-muted)", letterSpacing: ".08em", marginBottom: 6 }}>{tx}</div>
              <div style={{ fontFamily: "var(--heading)", fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 2px" }}>{v}</div>
              <div style={{ fontSize: 9.5, color: "var(--ink-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product: p, favs, onFav, onClick, delay = 0 }) {
  const [popped, setPopped] = useState(false);
  const isFav = favs.includes(p.id);
  const d = disc(p.price, p.original_price);
  const handleFav = (e) => {
    e.stopPropagation();
    setPopped(true);
    onFav(p.id);
    setTimeout(() => setPopped(false), 400);
  };
  return (
    <div onClick={onClick} className="th-card hoverable" style={{ animationDelay: `${delay}s`, overflow: "hidden" }}>
      <div className="prod-img-wrap">
        <Img src={p.image_url} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          {p.is_organic && <span style={{ background: "rgba(5,60,35,.85)", color: "#6ee7b7", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 20, fontFamily: "var(--display)", letterSpacing: ".04em", backdropFilter: "blur(4px)" }}>ORG</span>}
          {d > 0 && <span style={{ background: "rgba(90,15,15,.85)", color: "#fca5a5", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 20, fontFamily: "var(--display)", letterSpacing: ".04em", backdropFilter: "blur(4px)" }}>{d}% OFF</span>}
        </div>
        <button onClick={handleFav} className={`fav-btn${popped ? " popped" : ""}${isFav ? " active" : ""}`}>{isFav ? "♥" : "♡"}</button>
      </div>
      <div style={{ padding: "12px 13px 14px" }}>
        <h3 style={{ fontFamily: "var(--heading)", fontSize: "12.5px", fontWeight: 600, color: "var(--ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 5 }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 7, fontSize: 10, color: "var(--ink-muted)", fontFamily: "var(--display)", fontWeight: 600 }}>
          <span style={{ color: "var(--saffron-deep)", fontWeight: 800 }}>{p.rating}</span>
          <span style={{ opacity: .5 }}>/ 5</span>
          <span style={{ opacity: .4, marginLeft: 2 }}>({p.review_count})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{fmt(p.price)}</span>
          {p.original_price && <span style={{ fontSize: 10, color: "var(--ink-muted)", textDecoration: "line-through" }}>{fmt(p.original_price)}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────
function SearchScreen({ navigate }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback(async (query, f) => {
    setLoading(true);
    let req = supabase.from("products").select("*, store:stores(id,name,slug,is_verified,city), images:product_images(url,is_primary)").eq("is_active", true);
    if (query) req = req.ilike("name", `%${query}%`);
    if (f === "Organic") req = req.eq("is_organic", true);
    if (f === "Price ↓") req = req.order("price", { ascending: false });
    else if (f === "Price ↑") req = req.order("price", { ascending: true });
    else if (f === "Popular") req = req.order("sold_count", { ascending: false });
    else req = req.order("created_at", { ascending: false });
    const { data } = await req.limit(40);
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q, filter), 300);
  }, [q, filter, search]);

  const getImg = (p) => p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || p.image_url;
  const filters = ["All", "Popular", "Organic", "Price ↓", "Price ↑"];

  return (
    <div className="page-enter">
      <div className="page-hdr" style={{ paddingBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--display)", fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".02em" }}>SRH</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, stores..." autoFocus
              style={{ width: "100%", paddingLeft: 46, paddingRight: q ? 40 : 16, height: 46, borderRadius: "var(--r-xl)", border: "1.5px solid var(--border)", fontSize: 13.5, outline: "none", background: "var(--surface)", fontFamily: "var(--sans)", transition: "all .2s" }}
              onFocus={e => { e.target.style.borderColor = "var(--saffron)"; e.target.style.boxShadow = "0 0 0 4px rgba(245,166,35,.1)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            {q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>CLR</button>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12 }} className="hs">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", border: "1.5px solid", cursor: "pointer", background: filter === f ? "var(--ink)" : "transparent", color: filter === f ? "white" : "var(--ink-muted)", borderColor: filter === f ? "var(--ink)" : "var(--border)", transition: "all .2s", flexShrink: 0, fontFamily: "var(--display)", letterSpacing: ".02em" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 26px 24px" }}>
        {loading ? <Spinner /> : products.length === 0 ? (
          <EmptyState icon="SRH" title="No results" desc={q ? `No products matching "${q}"` : "Start typing to search"} />
        ) : (
          <>
            <p style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 14, fontWeight: 700, fontFamily: "var(--display)", letterSpacing: ".04em" }}>{products.length} PRODUCT{products.length !== 1 ? "S" : ""}</p>
            <div className="prod-grid">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])} onClick={() => navigate("product", { id: p.id })} delay={i * .04} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL ──────────────────────────────────────────────────────────
function ProductScreen({ params, navigate, showToast }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("products")
      .select("*, store:stores(id,name,slug,is_verified,city,logo_url), images:product_images(url,is_primary,sort_order), category:categories(name,icon)")
      .eq("id", params.id).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [params?.id]);

  const addToCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please login first", "error"); return; }
      // re-check latest stock from DB to avoid stale UI allowing additions
      const { data: latest } = await supabase.from("products").select("stock").eq("id", product.id).maybeSingle();
      const latestStock = latest?.stock || 0;
      if (latestStock <= 0) { showToast("Out of stock", "error"); return; }
      if (qty > latestStock) { setQty(latestStock); showToast(`Only ${latestStock} left. Adjusted quantity.`, "error"); return; }
      setAddingCart(true);
      const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
      if (existing) {
        const newQty = (existing.quantity || 0) + qty;
        if (newQty > latestStock) { showToast("Not enough stock to add this quantity", "error"); setAddingCart(false); return; }
        await supabase.from("cart_items").update({ quantity: newQty }).eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty });
      }
      setAddingCart(false);
      showToast("Added to bag!", "success");
      navigate("cart");
    } catch (err) {
      setAddingCart(false);
      showToast("Failed to add to bag", "error");
    }
  };

  if (loading) return <Spinner />;
  if (!product) return <EmptyState icon="404" title="Product not found" desc="This product may have been removed" />;

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const mainImg = images.find(i => i.is_primary)?.url || images[0]?.url || product.image_url;
  const d = disc(product.price, product.original_price);

  return (
    <div style={{ paddingBottom: 100 }} className="page-enter">
      <div style={{ position: "sticky", top: 64, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 22px", background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-soft)" }}>
        <button onClick={() => navigate("home")} style={{ height: 40, padding: "0 14px", background: "var(--surface)", borderRadius: 11, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontFamily: "var(--display)", fontWeight: 700, fontSize: 11, color: "var(--ink-muted)", letterSpacing: ".04em", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--saffron-soft)"} onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}>← BCK</button>
        <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13, color: "var(--ink)", letterSpacing: ".03em" }}>PRODUCT</span>
        <button onClick={() => setFav(!fav)} style={{ height: 40, padding: "0 14px", background: "var(--surface)", borderRadius: 11, border: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 14, color: fav ? "var(--rouge)" : "var(--ink-muted)", transition: "all .2s" }}>{fav ? "♥" : "♡"}</button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 26px" }}>
        <div className="desktop-two-col" style={{ marginTop: 20 }}>
          <div>
            <div style={{ borderRadius: "var(--r-2xl)", overflow: "hidden", position: "relative", paddingTop: "65%", background: "var(--surface-alt)" }}>
              <Img src={mainImg} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 5 }}>
                {product.is_organic && <span style={{ background: "rgba(5,60,35,.88)", color: "#6ee7b7", fontSize: 9, fontWeight: 800, padding: "4px 9px", borderRadius: 20, fontFamily: "var(--display)", letterSpacing: ".06em", backdropFilter: "blur(4px)" }}>ORG</span>}
                {d > 0 && <span style={{ background: "rgba(90,15,15,.88)", color: "#fca5a5", fontSize: 9, fontWeight: 800, padding: "4px 9px", borderRadius: 20, fontFamily: "var(--display)", letterSpacing: ".06em", backdropFilter: "blur(4px)" }}>{d}% OFF</span>}
              </div>
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 9, marginTop: 10 }} className="hs">
                {images.map((img, i) => (
                  <div key={i} style={{ width: 68, height: 68, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0, border: "1.5px solid var(--border)" }}>
                    <Img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
              <div style={{ width: 28, height: 28, background: "var(--saffron-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 9, fontWeight: 800, color: "var(--saffron-deep)" }}>STR</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-mid)" }}>{product.store?.name}</span>
              {product.store?.is_verified && <span style={{ fontFamily: "var(--display)", fontSize: 9, fontWeight: 800, background: "#d1fae5", color: "#064e3b", padding: "2px 7px", borderRadius: 99, letterSpacing: ".04em" }}>VFD</span>}
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>· {product.store?.city}</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)" }}>{fmt(product.price)}</span>
              {product.original_price && <span style={{ fontSize: 15, color: "var(--ink-muted)", textDecoration: "line-through" }}>{fmt(product.original_price)}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 18, fontSize: 12, color: "var(--ink-muted)", fontFamily: "var(--display)", fontWeight: 600 }}>
              <span><span style={{ color: "var(--saffron-deep)", fontWeight: 800 }}>{product.rating}</span>/5 · {product.review_count} reviews</span>
              <span>· {product.sold_count} sold</span>
              <span style={{ padding: "6px 10px", borderRadius: 99, background: product.stock > 0 ? "#ecfdf5" : "#fee2e2", color: product.stock > 0 ? "#166534" : "#991b1b", fontWeight: 700, border: `1px solid ${product.stock > 0 ? "#bbf7d0" : "#fecaca"}`, fontSize: 11 }}>
                {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
              </span>
            </div>

            {(product.weight || product.shelf_life || product.unit) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8, marginBottom: 18 }}>
                {[["WGT", product.weight], ["LIFE", product.shelf_life], ["UNIT", product.unit]].filter(x => x[1]).map(([tx, val]) => (
                  <div key={tx} style={{ background: "var(--surface-alt)", borderRadius: "var(--r-md)", padding: "10px 12px", textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 9, color: "var(--ink-muted)", margin: "0 0 3px", letterSpacing: ".08em" }}>{tx}</p>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: 0 }}>{val}</p>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: 18 }}>{product.description}</p>

            {[
              { tx: "QTY", title: "Quality Guaranteed", desc: "100% authentic from verified sellers" },
              { tx: "DEL", title: "Fast Delivery", desc: "Same day delivery available" },
            ].map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 13, background: "var(--surface-alt)", marginBottom: 9, border: "1px solid var(--border-soft)" }}>
                <div style={{ width: 32, height: 32, background: "var(--surface)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 9, fontWeight: 800, color: "var(--saffron-deep)", border: "1px solid var(--saffron-100)", flexShrink: 0 }}>{f.tx}</div>
                <div><p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{f.title}</p><p style={{ fontSize: 11.5, color: "var(--ink-muted)", margin: "2px 0 0" }}>{f.desc}</p></div>
              </div>
            ))}

            {product.stock > 0 ? (
              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
                <button onClick={addToCart} disabled={addingCart} style={{ flex: 1, height: 46, background: "var(--saffron-soft)", color: "var(--saffron-deep)", borderRadius: "var(--r-lg)", border: "1.5px solid rgba(245,166,35,.3)", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--display)", letterSpacing: ".04em" }}>
                  {addingCart ? "ADDING..." : "+ BAG"}
                </button>
                <button onClick={() => navigate("cart")} style={{ flex: 1, height: 46, background: "var(--ink)", color: "white", borderRadius: "var(--r-lg)", border: "none", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--display)", letterSpacing: ".04em", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--saffron-deep)"} onMouseLeave={e => e.currentTarget.style.background = "var(--ink)"}>
                  BUY NOW →
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#7f1d1d" }}>OUT OF STOCK</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>This item is currently unavailable.</div>
                </div>
                <button disabled style={{ flex: 1, height: 46, background: "#f3f4f6", color: "#9ca3af", borderRadius: "var(--r-lg)", border: "1px solid #e5e7eb", fontWeight: 800, fontSize: 12.5 }}>Out of stock</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CART ────────────────────────────────────────────────────────────────────
function CartScreen({ navigate, showToast, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [userId, setUserId] = useState(null);
  const isSeller = user?.role === "seller";

  useEffect(() => {
    let mounted = true;
    let realtimeSub = null;

    const fetchCart = async (uid) => {
      try {
        const { data: cartData } = await supabase.from("cart_items").select("*").eq("user_id", uid);
        const items = cartData || [];
        const productIds = [...new Set(items.map(i => i.product_id).filter(Boolean))];
        let productMap = {};
        if (productIds.length > 0) {
          const { data: products } = await supabase.from("products").select("id,name,price,original_price,stock,unit,images:product_images(url,is_primary)").in("id", productIds);
          productMap = (products || []).reduce((acc, prod) => ({ ...acc, [prod.id]: prod }), {});
        }
        const mapped = items.map(item => ({ ...item, product: productMap[item.product_id] || null }));
        if (!mounted) return;
        setItems(mapped);
        setSelected(mapped.map(i => i.id));
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setItems([]); setSelected([]); setLoading(false);
      }
    };

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      await fetchCart(user.id);
      realtimeSub = supabase.channel(`cart-list-${user.id}-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, () => fetchCart(user.id)).subscribe();
    })();

    return () => {
      mounted = false;
      try { if (realtimeSub) supabase.removeChannel(realtimeSub); } catch { }
    };
  }, []);

  const getImg = (item) => item.product?.images?.find(i => i.is_primary)?.url || item.product?.images?.[0]?.url;
  const selItems = items.filter(i => selected.includes(i.id));
  const subtotal = selItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const delivery = subtotal > 0 ? 45 : 0;

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    setItems(p => p.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
  };

  const removeItem = async (itemId) => {
    setItems(p => p.filter(i => i.id !== itemId));
    setSelected(p => p.filter(i => i !== itemId));
    await supabase.from("cart_items").delete().eq("id", itemId);
    showToast("Removed from bag", "success");
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-enter" style={{ paddingBottom: 140 }}>
      <div className="page-hdr">
        <h1>Shopping Bag {items.length > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: "var(--ink-muted)" }}>({items.length})</span>}</h1>
      </div>
      {items.length === 0 ? (
        <EmptyState icon="BAG" title="Your bag is empty" desc="Discover local artisan products and add them here" action={<button className="btn-primary" onClick={() => navigate("home")} style={{ width: 200, marginTop: 8 }}><span>Browse Products</span></button>} />
      ) : (
        <div style={{ padding: "0 26px", maxWidth: 860 }}>
          <div className="desktop-two-col" style={{ alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <button onClick={() => setSelected(selected.length === items.length ? [] : items.map(i => i.id))} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--ink-mid)", fontFamily: "var(--display)", letterSpacing: ".03em", padding: "6px 10px", borderRadius: "var(--r-md)", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected.length === items.length ? "var(--saffron)" : "var(--border)"}`, background: selected.length === items.length ? "var(--saffron)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {selected.length === items.length && <span style={{ fontSize: 9, color: "white", fontWeight: 900 }}>✓</span>}
                  </div>
                  Select All
                </button>
                <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 700, fontFamily: "var(--display)" }}>{selected.length}/{items.length} selected</span>
              </div>
              {items.map((item, i) => (
                <div key={item.id} className="cart-item" style={{ marginBottom: 12, animationDelay: `${i * .05}s` }}>
                  <button onClick={() => setSelected(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected.includes(item.id) ? "var(--saffron)" : "var(--border)"}`, background: selected.includes(item.id) ? "var(--saffron)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                      {selected.includes(item.id) && <span style={{ fontSize: 9, color: "white", fontWeight: 900 }}>✓</span>}
                    </div>
                  </button>
                  <div style={{ width: 76, height: 76, borderRadius: "var(--r-lg)", overflow: "hidden", flexShrink: 0 }}>
                    <Img src={getImg(item)} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.product?.name}</h4>
                      <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, color: "var(--rouge)", flexShrink: 0, letterSpacing: ".04em" }}>DEL</button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(item.product?.price)}</span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
                      <div className="qty-ctrl" style={{ height: 32 }}>
                        <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                        <span className="qty-val" style={{ fontSize: 12 }}>{item.quantity}</span>
                        <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-mid)", fontFamily: "var(--heading)" }}>{fmt((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border-soft)", padding: 22, position: "sticky", top: 86 }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 800, marginBottom: 16, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Order Summary</h3>
              {[["Subtotal", fmt(subtotal)], ["Delivery", fmt(delivery)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}><span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{l}</span><span style={{ fontWeight: 700, fontSize: 13 }}>{v}</span></div>
              ))}
              <div style={{ height: 1, background: "var(--border-soft)", margin: "14px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(subtotal + delivery)}</span>
              </div>
              {isSeller && (
                <div style={{ marginBottom: 14, padding: 14, borderRadius: "var(--r-xl)", background: "rgba(254, 226, 226, 0.8)", color: "#991b1b", border: "1px solid #fecaca", fontSize: 13, fontWeight: 600 }}>
                  Seller accounts cannot place orders. Switch to a buyer account to checkout.
                </div>
              )}
              <button onClick={() => navigate("checkout")} disabled={selected.length === 0 || isSeller} className="btn-gold" style={{ width: "100%" }}>{selected.length === 0 ? "Select items" : isSeller ? "Sellers cannot order" : "Checkout →"}</button>
              <button onClick={() => navigate("home")} className="btn-ghost" style={{ width: "100%", marginTop: 9 }}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
      {items.length > 0 && (
        <div className="float-panel" style={{ display: "none" }} id="cart-float">
          <style>{`@media(max-width:900px){#cart-float{display:block!important}}`}</style>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}><span style={{ fontSize: 12, color: "var(--ink-muted)" }}>Total</span><span style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(subtotal + delivery)}</span></div>
          <button onClick={() => navigate("checkout")} disabled={selected.length === 0 || isSeller} className="btn-gold" style={{ width: "100%" }}>{isSeller ? "Sellers cannot order" : `Checkout (${selItems.reduce((s, i) => s + i.quantity, 0)} items)`}</button>
        </div>
      )}
    </div>
  );
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────────
function CheckoutScreen({ navigate, showToast, user }) {
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("gcash");
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSeller = user?.role === "seller";
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [deliveryFullName, setDeliveryFullName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddressLine, setDeliveryAddressLine] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryZipCode, setDeliveryZipCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const subtotal = cartItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const delivery = 45; const total = subtotal + delivery;

  useEffect(() => {
    if (isSeller) {
      showToast("Seller accounts cannot place orders", "error");
      navigate("cart");
      return;
    }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data: addrs }, { data: cartData }, { data: profile }] = await Promise.all([
        supabase.from("delivery_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
        supabase.from("cart_items").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("full_name, phone, email, address, city, province, zip_code").eq("id", user.id).maybeSingle(),
      ]);
      let products = [];
      const items = cartData || [];
      const productIds = [...new Set(items.map(i => i.product_id).filter(Boolean))];
      if (productIds.length > 0) {
        const { data: prods } = await supabase.from("products").select("id,name,price,store_id,images:product_images(url,is_primary)").in("id", productIds);
        products = prods || [];
      }
      const productMap = products.reduce((acc, prod) => ({ ...acc, [prod.id]: prod }), {});
      const mappedItems = items.map(item => ({ ...item, product: productMap[item.product_id] || null }));
      const list = addrs || [];
      const storeId = mappedItems[0]?.product?.store_id;
      if (storeId) {
        const { data: storeData } = await supabase.from("stores").select("id,name,address,phone,city,province,owner:profiles(full_name,address,city,province,zip_code,phone,email)").eq("id", storeId).maybeSingle();
        setSellerInfo(storeData || null);
      }
      setAddresses(list);
      const def = list.find(a => a.is_default) || list[0] || null;
      setSelectedAddr(def?.id || null);
      setAddressFormVisible(list.length === 0);
      setCartItems(mappedItems);
      if (!def && profile?.address) {
        setDeliveryFullName(profile.full_name || "");
        setDeliveryPhone(profile.phone || "");
        setDeliveryAddressLine(profile.address || "");
        setDeliveryCity(profile.city || "");
        setDeliveryProvince(profile.province || "");
        setDeliveryZipCode(profile.zip_code || "");
        setAddressFormVisible(true);
      }
    });
  }, [isSeller, navigate, showToast]);

  // reset payment flow when method changes
  useEffect(() => { setPaymentStarted(false); }, [payment]);

  const handleContinue = () => {
    const hasManual = deliveryFullName.trim() && deliveryPhone.trim() && deliveryAddressLine.trim() && deliveryCity.trim() && deliveryProvince.trim();
    if ((addressFormVisible || addresses.length === 0) && !hasManual) { showToast("Please fill in delivery address", "error"); return; }
    if (!selectedAddr && !addressFormVisible && addresses.length > 0) { showToast("Please select a delivery address", "error"); return; }
    setStep(2);
  };

  const placeOrder = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login", "error"); setLoading(false); return; }
    if (user.role === "seller") { showToast("Seller accounts cannot place orders", "error"); setLoading(false); return; }
    if (cartItems.length === 0) { showToast("Cart is empty", "error"); setLoading(false); return; }
    const hasManual = deliveryFullName.trim() && deliveryPhone.trim() && deliveryAddressLine.trim() && deliveryCity.trim() && deliveryProvince.trim();
    if (!selectedAddr && !hasManual) { showToast("Please add a delivery address", "error"); setLoading(false); return; }
    const invalidItem = cartItems.find(i => !i.product || !i.product.store_id);
    if (invalidItem) { showToast("One or more items unavailable", "error"); setLoading(false); return; }
    const storeId = cartItems[0]?.product?.store_id;
    if (cartItems.some(i => i.product.store_id !== storeId)) { showToast("Checkout one store at a time", "error"); setLoading(false); return; }
    // validate stock availability before creating order
    try {
      const productIds = cartItems.map(i => i.product.id).filter(Boolean);
      if (productIds.length > 0) {
        const { data: prods } = await supabase.from("products").select("id,stock").in("id", productIds);
        const short = cartItems.find(i => {
          const p = prods.find(x => x.id === i.product.id);
          return !p || (p.stock || 0) < i.quantity;
        });
        if (short) { showToast(`Product "${short.product.name}" is out of stock or has insufficient quantity`, "error"); setLoading(false); return; }
      }
    } catch (e) {
      console.error("Stock check failed", e);
    }
    const { data: order, error } = await supabase.from("orders").insert([{
      buyer_id: user.id, store_id: storeId, delivery_address_id: selectedAddr || null,
      payment_method: payment || "cod", subtotal, delivery_fee: delivery, total, estimated_delivery: "30-45 mins",
    }]).select().single();
    if (error || !order) { showToast("Failed to place order: " + (error?.message || "Unknown error"), "error"); setLoading(false); return; }
    await supabase.from("order_items").insert(cartItems.map(i => ({
      order_id: order.id, product_id: i.product.id, product_name: i.product.name,
      product_image: i.product.images?.find(img => img.is_primary)?.url || null,
      unit_price: i.product.price, quantity: i.quantity,
    })));
    // decrement stock to reserve inventory until delivery
    try {
      const productIds = cartItems.map(i => i.product.id);
      const { data: prods } = await supabase.from("products").select("id,stock").in("id", productIds);
      for (const item of cartItems) {
        const p = prods.find(x => x.id === item.product.id) || { stock: 0 };
        const newStock = Math.max(0, (p.stock || 0) - item.quantity);
        await supabase.from("products").update({ stock: newStock }).eq("id", item.product.id);
      }
    } catch (e) {
      console.error("Inventory reserve update failed", e);
    }
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await supabase.from("order_status_history").insert({ order_id: order.id, status: "pending" });
    setLoading(false);
    navigate("order-confirmation", { orderId: order.id, orderNumber: order.order_number });
  };

  const payments = [
    { id: "gcash", name: "GCash", tx: "GC", desc: "Pay instantly with GCash" },
    { id: "maya", name: "Maya", tx: "MY", desc: "Pay with Maya wallet" },
    { id: "cod", name: "Cash on Delivery", tx: "COD", desc: "Pay when you receive" },
    { id: "wallet", name: "Tindahub Wallet", tx: "W₱", desc: "Use your wallet balance" },
  ];
  const stepLabels = ["Address", "Payment", "Review"];

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      <div className="page-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button onClick={() => navigate("cart")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 12, color: "var(--ink-muted)", letterSpacing: ".04em" }}>← CART</button>
          <h1 style={{ margin: 0 }}>Checkout</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 16 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div className={`step-dot${step >= s ? " done" : " pending"}`} style={{ fontSize: 11 }}>{step > s ? "✓" : s}</div>
              {s < 3 && <div className={`step-line${step > s ? " done" : ""}`} style={{ width: 44 }} />}
            </div>
          ))}
          <span style={{ fontSize: 11.5, color: "var(--ink-muted)", marginLeft: 10, fontWeight: 700, fontFamily: "var(--display)", letterSpacing: ".04em" }}>{stepLabels[step - 1].toUpperCase()}</span>
        </div>
      </div>

      <div style={{ padding: "0 26px", maxWidth: 720 }}>
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, fontFamily: "var(--display)", letterSpacing: ".03em" }}>DELIVERY ADDRESS</h2>
            {addresses.length === 0 ? (
              <div style={{ padding: "20px", background: "var(--surface-alt)", borderRadius: "var(--r-xl)", textAlign: "center", marginBottom: 14 }}>
                <p style={{ color: "var(--ink-muted)", margin: 0, fontFamily: "var(--display)", fontSize: 12, fontWeight: 600, letterSpacing: ".04em" }}>NO SAVED ADDRESSES</p>
              </div>
            ) : addresses.map(addr => (
              <div key={addr.id} onClick={() => { setSelectedAddr(addr.id); setAddressFormVisible(false); }} style={{ padding: "14px 16px", borderRadius: "var(--r-xl)", border: `1.5px solid ${selectedAddr === addr.id ? "var(--saffron)" : "var(--border)"}`, cursor: "pointer", background: selectedAddr === addr.id ? "var(--saffron-soft)" : "var(--surface)", marginBottom: 10, transition: "all .2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontWeight: 800, fontSize: 11, fontFamily: "var(--display)", letterSpacing: ".04em", color: "var(--ink)" }}>{addr.label || "HOME"}</span>
                  {addr.is_default && <span style={{ fontSize: 9, fontWeight: 800, background: "var(--saffron-soft)", color: "var(--saffron-deep)", padding: "2px 7px", borderRadius: 20, fontFamily: "var(--display)", letterSpacing: ".06em" }}>DEFAULT</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 1px" }}>{addr.full_name}</p>
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>{addr.phone}</p>
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "2px 0 0" }}>{addr.address_line}, {addr.city}, {addr.province}</p>
              </div>
            ))}
            <button className="btn-outline" onClick={() => setAddressFormVisible(v => !v)} style={{ width: "100%", marginBottom: 12, height: 44, fontSize: 13 }}>{addressFormVisible ? "Cancel" : "+ Add Address"}</button>
            {(addressFormVisible || addresses.length === 0) && (
              <div style={{ padding: "16px", background: "var(--surface-alt)", borderRadius: "var(--r-xl)", marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input className="th-input" placeholder="Full name" value={deliveryFullName} onChange={e => setDeliveryFullName(e.target.value)} style={{ paddingLeft: 14 }} />
                  <input className="th-input" placeholder="Phone" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)} style={{ paddingLeft: 14 }} />
                </div>
                <input className="th-input" placeholder="Street address" value={deliveryAddressLine} onChange={e => setDeliveryAddressLine(e.target.value)} style={{ marginBottom: 10, paddingLeft: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input className="th-input" placeholder="City" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} style={{ paddingLeft: 14 }} />
                  <input className="th-input" placeholder="Province" value={deliveryProvince} onChange={e => setDeliveryProvince(e.target.value)} style={{ paddingLeft: 14 }} />
                </div>
                <input className="th-input" placeholder="Zip code" value={deliveryZipCode} onChange={e => setDeliveryZipCode(e.target.value)} style={{ marginTop: 10, paddingLeft: 14 }} />
              </div>
            )}
            <button className="btn-primary" onClick={handleContinue} style={{ width: "100%" }}><span>Continue to Payment →</span></button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, fontFamily: "var(--display)", letterSpacing: ".03em" }}>PAYMENT METHOD</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payments.map(m => (
                <button key={m.id} className={`pay-opt${payment === m.id ? " active" : ""}`} onClick={() => setPayment(m.id)} style={{ width: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: payment === m.id ? "var(--ink)" : "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 11, fontWeight: 800, color: payment === m.id ? "var(--saffron-glow)" : "var(--ink-muted)", transition: "all .2s", letterSpacing: ".02em", flexShrink: 0 }}>{m.tx}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)", margin: 0 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "2px 0 0" }}>{m.desc}</p>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${payment === m.id ? "var(--saffron)" : "var(--border)"}`, background: payment === m.id ? "var(--saffron)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {payment === m.id && <div style={{ width: 7, height: 7, background: "white", borderRadius: "50%" }} />}
                  </div>
                </button>
              ))}
            </div>
            {payment !== "cod" && sellerInfo && (
              <div style={{ marginTop: 14 }}>
                {(payment === "gcash" || payment === "maya") ? (
                  !paymentStarted ? (
                    <div style={{ padding: 14, borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>PAY WITH</p>
                        <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700 }}>{payment === "gcash" ? "GCash" : "Maya"}</p>
                      </div>
                      <div>
                        <button className="btn-primary" onClick={() => setPaymentStarted(true)} style={{ padding: "10px 14px" }}>Pay Now</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 14, borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--border-soft)" }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>PAY WITH</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
                        <div style={{ width: 140, height: 140, borderRadius: 12, overflow: "hidden", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <img alt="QR" src="/qr.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{sellerInfo.name || sellerInfo.owner?.full_name || "Seller"}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>{sellerInfo.phone || (sellerInfo.owner && sellerInfo.owner.phone) || "No number"}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 10, fontWeight: 700 }}>Exact amount</div>
                          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                            <button className="btn-outline" onClick={() => { setPaymentStarted(false); }} style={{ padding: "10px 14px" }}>← Edit</button>
                            <button className="btn-primary" onClick={() => setStep(3)} style={{ padding: "10px 14px" }}>Review Order</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ padding: 14, borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--border-soft)" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>PAY TO</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{sellerInfo.name || sellerInfo.owner?.full_name || "Seller"}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{sellerInfo.phone || (sellerInfo.owner && sellerInfo.owner.phone) || "No number"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 700 }}>Exact amount</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ flex: 1, height: 44, fontSize: 13 }}>← Back</button>
              {!(paymentStarted && (payment === "gcash" || payment === "maya")) && (
                <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}><span>Review Order →</span></button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, fontFamily: "var(--display)", letterSpacing: ".03em" }}>REVIEW ORDER</h2>
            {(() => {
              const sel = addresses.find(a => a.id === selectedAddr) || (deliveryFullName ? { full_name: deliveryFullName, phone: deliveryPhone, address_line: deliveryAddressLine, city: deliveryCity, province: deliveryProvince, zip_code: deliveryZipCode } : null);
              return (
                <div style={{ padding: "13px 15px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", marginBottom: 10 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: ".08em", color: "var(--ink-muted)" }}>DELIVERY TO</h3>
                  {sel ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{sel.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{sel.phone}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{sel.address_line}, {sel.city}, {sel.province} {sel.zip_code || ''}</div>
                    </>
                  ) : <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>No address selected.</div>}
                </div>
              );
            })()}
            {cartItems.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", marginBottom: 8 }}>
                <div style={{ width: 60, height: 60, borderRadius: "var(--r-md)", overflow: "hidden" }}>
                  <Img src={item.product?.images?.find(img => img.is_primary)?.url || ""} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 3px" }}>{item.product?.name}</h4>
                  <p style={{ fontSize: 11.5, color: "var(--ink-muted)", margin: 0 }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontWeight: 800, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", padding: 18, marginTop: 6 }}>
              {[["Subtotal", fmt(subtotal)], ["Delivery", fmt(delivery)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}><span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{l}</span><span style={{ fontWeight: 600, fontSize: 12.5 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(total)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-outline" onClick={() => setStep(2)} style={{ flex: 1, height: 44, fontSize: 13 }}>← Back</button>
              <button className="btn-gold" onClick={placeOrder} disabled={loading} style={{ flex: 2 }}>{loading ? "Placing Order..." : "Place Order ✓"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER CONFIRMATION ───────────────────────────────────────────────────────
function OrderConfirmScreen({ navigate, params }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column" }} className="page-enter">
      <div style={{ background: "var(--ink)", padding: "52px 26px 88px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--serif)", fontSize: 360, color: "rgba(245,166,35,.04)", fontStyle: "italic", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>✓</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 72, fontWeight: 900, color: "var(--saffron-glow)", letterSpacing: "-.05em", lineHeight: 1, animation: "bounceIn .7s .1s both" }}>✓</div>
          <h1 style={{ color: "white", fontSize: 28, fontWeight: 700, margin: "12px 0 0", fontFamily: "var(--heading)" }}>Order Placed</h1>
          <p style={{ color: "rgba(255,255,255,.6)", marginTop: 8, fontSize: 13.5 }}>Your order has been placed successfully</p>
          {params?.orderNumber && <p style={{ color: "rgba(245,166,35,.7)", marginTop: 5, fontSize: 12, fontFamily: "var(--display)", letterSpacing: ".08em", fontWeight: 700 }}>#{params.orderNumber}</p>}
        </div>
      </div>
      <div style={{ flex: 1, padding: "0 26px", marginTop: -52, maxWidth: 580, margin: "-52px auto 0", width: "100%", paddingBottom: 32 }}>
        <div style={{ background: "white", borderRadius: "var(--r-2xl)", boxShadow: "-0 10px 36px rgba(0,0,0,.09)", padding: 24, animation: "fadeUp .5s .2s both" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
            {[["ETA", "30–45 mins"], ["STATUS", "Preparing"]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--surface-alt)", borderRadius: "var(--r-lg)", padding: 14 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 4px", fontFamily: "var(--display)" }}>{l}</p>
                <p style={{ fontWeight: 800, color: "var(--ink)", margin: 0, fontSize: 16, fontFamily: "var(--heading)" }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-gold" style={{ width: "100%" }} onClick={() => navigate("order-tracking", params)}>Track Order →</button>
            <button className="btn-outline" style={{ width: "100%", height: 44, fontSize: 13 }} onClick={() => navigate("home")}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────
function OrdersScreen({ navigate }) {
  const [tab, setTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase.from("orders").select("*, items:order_items(id,product_name,product_image,quantity,unit_price)").eq("buyer_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => { setOrders(data || []); setLoading(false); });
    });
  }, []);

  const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter(o => ["delivered", "cancelled"].includes(o.status));
  const list = tab === "active" ? active : past;

  return (
    <div className="page-enter">
      <div className="page-hdr">
        <h1>Orders</h1>
        <div className="tab-strip">
          {[["active", "Active"], ["past", "Past"]].map(([id, label]) => (
            <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label} ({id === "active" ? active.length : past.length})</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 26px", maxWidth: 820 }}>
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState icon="PKG" title="No orders yet" desc={`Your ${tab} orders will appear here`} action={<button className="btn-primary" onClick={() => navigate("home")} style={{ width: 180, marginTop: 8 }}><span>Start Shopping</span></button>} />
        ) : list.map(order => {
          const s = STATUS_LABELS[order.status] || { label: order.status, color: "#374151", bg: "#f3f4f6" };
          return (
            <div key={order.id} className="th-card" style={{ marginBottom: 14, padding: "16px 18px", cursor: "pointer" }} onClick={() => navigate("order-tracking", { orderId: order.id })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 13.5, color: "var(--ink)", margin: "0 0 2px", letterSpacing: ".02em" }}>#{order.order_number}</p>
                  <p style={{ fontSize: 11.5, color: "var(--ink-muted)", margin: 0, fontFamily: "var(--display)" }}>{new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {(order.items || []).slice(0, 4).map((item, i) => (
                  <div key={i} style={{ width: 52, height: 52, borderRadius: 11, overflow: "hidden", background: "var(--surface-alt)", flexShrink: 0 }}>
                    {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, color: "var(--ink-muted)" }}>PKG</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "var(--ink-muted)", fontWeight: 600 }}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} · <strong style={{ color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(order.total)}</strong></span>
                {order.status === "out_for_delivery" && (
                  <button className="btn-gold" style={{ height: 34, padding: "0 14px", fontSize: 11, borderRadius: 9 }} onClick={e => { e.stopPropagation(); navigate("order-tracking", { orderId: order.id }) }}>Track Live</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ORDER TRACKING ───────────────────────────────────────────────────────────
function OrderTrackingScreen({ navigate, params, showToast }) {
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileRole, setProfileRole] = useState(null);
  const [sellerStoreId, setSellerStoreId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [orderReviews, setOrderReviews] = useState([]);
  const [reviewInputs, setReviewInputs] = useState({});
  const [submittingReview, setSubmittingReview] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setProfileRole(profile?.role || "buyer");
      if (profile?.role === "seller") {
        const { data: storeData } = await supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle();
        setSellerStoreId(storeData?.id || null);
      }
    });
    if (!params?.orderId) { setLoading(false); return; }
    Promise.all([
      supabase.from("orders").select("*, items:order_items(*)").eq("id", params.orderId).single(),
      supabase.from("order_status_history").select("*").eq("order_id", params.orderId).order("created_at"),
    ]).then(([{ data: o }, { data: h }]) => { setOrder(o); setHistory(h || []); setLoading(false); });
    const sub = supabase.channel(`order-${params.orderId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${params.orderId}` }, payload => setOrder(o => ({ ...o, ...payload.new })))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_status_history", filter: `order_id=eq.${params.orderId}` }, payload => setHistory(h => [...h, payload.new]))
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [params?.orderId]);

  const timeline = [
    { key: "pending", label: "Order Placed", tx: "PLK", desc: "Order received" },
    { key: "confirmed", label: "Confirmed", tx: "CNF", desc: "Store confirmed" },
    { key: "preparing", label: "Preparing", tx: "PRP", desc: "Packing your items" },
    { key: "out_for_delivery", label: "Out for Delivery", tx: "OTW", desc: "Rider on the way" },
    { key: "delivered", label: "Delivered", tx: "DLV", desc: "Enjoy your purchase!" },
  ];

  const currentIdx = order ? STATUS_FLOW.indexOf(order.status) : -1;
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const canManage = profileRole === "seller" && sellerStoreId && order?.store_id === sellerStoreId;

  const updateStatus = async (newStatus) => {
    if (!order?.id) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login", "error"); return; }
    const updateData = { status: newStatus };
    if (newStatus === "delivered") updateData.delivered_at = new Date().toISOString();
    const { data: updated, error } = await supabase.from("orders").update(updateData).eq("id", order.id).select().single();
    if (error) { showToast("Failed to update status", "error"); return; }
    if (newStatus === "delivered" && order.status !== "delivered") {
      try {
        for (const item of order.items || []) {
          const { data: product } = await supabase.from("products").select("sold_count").eq("id", item.product_id).single();
          const currentSold = product?.sold_count || 0;
          await supabase.from("products").update({ sold_count: currentSold + (item.quantity || 0) }).eq("id", item.product_id);
        }
      } catch (e) {
        console.error("Failed to update sold_count on delivery", e);
      }
    }
    await supabase.from("order_status_history").insert({ order_id: order.id, status: newStatus, created_by: user.id });
    setOrder(updated);
    setHistory(h => [...h, { order_id: order.id, status: newStatus, created_by: user.id, created_at: new Date().toISOString() }]);
    showToast(`Status: ${STATUS_LABELS[newStatus]?.label}`, "success");
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-enter">
      <div className="page-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("orders")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 11, color: "var(--ink-muted)", letterSpacing: ".04em" }}>← ORD</button>
          <h1 style={{ margin: 0 }}>Tracking</h1>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".08em", margin: "0 0 2px" }}>ORDER NUMBER</p>
            <p style={{ fontFamily: "var(--display)", fontWeight: 800, color: "var(--ink)", margin: 0, fontSize: 14, letterSpacing: ".04em" }}>#{order?.order_number || params?.orderNumber || "—"}</p>
          </div>
          {canManage && nextStatus && (
            <button className="btn-gold" style={{ height: 40, padding: "0 16px", fontSize: 12 }} onClick={() => updateStatus(nextStatus)}>Mark {STATUS_LABELS[nextStatus]?.label} →</button>
          )}
        </div>
      </div>

      <div style={{ padding: "0 26px", maxWidth: 820 }}>
        <div className="desktop-two-col" style={{ alignItems: "start" }}>
          <div>
            {order?.status === "out_for_delivery" && (
              <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border-soft)", padding: 18, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: "var(--r-lg)", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 13, color: "var(--saffron-glow)", letterSpacing: ".04em" }}>RDR</div>
                  <div>
                    <p style={{ fontWeight: 800, color: "var(--ink)", margin: "0 0 2px", fontSize: 14 }}>Your Rider</p>
                    <p style={{ fontSize: 11.5, color: "var(--ink-muted)", margin: 0 }}>4.9 ★ · On the way!</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["CALL", "var(--surface-alt)", "var(--ink)"], ["MSG", "var(--saffron-soft)", "var(--saffron-deep)"]].map(([tx, bg, color]) => (
                    <button key={tx} style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: bg, border: "1.5px solid var(--border)", cursor: "pointer", fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, color, letterSpacing: ".04em" }}>{tx}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: 260, borderRadius: "var(--r-2xl)", overflow: "hidden", position: "relative", marginBottom: 22, background: "var(--surface-alt)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "stretch", justifyContent: "center", flexDirection: "column" }}>
              {order?.delivery_lat && order?.delivery_lng ? (
                <iframe
                  title="live-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.delivery_lng - 0.02}%2C${order.delivery_lat - 0.01}%2C${order.delivery_lng + 0.02}%2C${order.delivery_lat + 0.01}&layer=mapnik&marker=${order.delivery_lat}%2C${order.delivery_lng}`}
                  style={{ border: 0, width: "100%", height: "100%" }}
                />
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 28, color: "var(--border)", letterSpacing: ".08em" }}>MAP</div>
                  <span style={{ fontSize: 11.5, color: "var(--ink-muted)", fontWeight: 700, fontFamily: "var(--display)", letterSpacing: ".06em" }}>LIVE TRACKING (no coords)</span>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-muted)", marginBottom: 16, fontFamily: "var(--display)", letterSpacing: ".08em", textTransform: "uppercase" }}>Timeline</h3>
            {timeline.map((t, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={t.key} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 10, letterSpacing: ".04em", background: done ? "var(--ink)" : "var(--surface-alt)", color: done ? "var(--saffron-glow)" : "var(--ink-muted)", flexShrink: 0, position: "relative", transition: "all .4s" }}>
                      {t.tx}
                      {active && <div style={{ position: "absolute", inset: -5, borderRadius: 14, border: "2px solid var(--saffron)", animation: "pulseRing 1.5s ease-out infinite" }} />}
                    </div>
                    {i < timeline.length - 1 && <div style={{ width: 2, height: 32, background: done ? "var(--ink)" : "var(--border)", margin: "4px 0", borderRadius: 2, transition: "background .4s" }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < timeline.length - 1 ? 0 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 7, paddingBottom: 22 }}>
                      <div>
                        <p style={{ fontWeight: done ? 700 : 500, color: done ? "var(--ink)" : "var(--ink-muted)", margin: "0 0 2px", fontSize: 13 }}>{t.label}</p>
                        {done && <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>{t.desc}</p>}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: "7px 0 0", flexShrink: 0, fontFamily: "var(--display)", fontWeight: 600 }}>{history.find(h => h.status === t.key) ? new Date(history.find(h => h.status === t.key).created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border-soft)", padding: 20, position: "sticky", top: 86 }}>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 11, fontWeight: 800, marginBottom: 14, letterSpacing: ".08em", color: "var(--ink-muted)", textTransform: "uppercase" }}>Order Items</h3>
            {(order?.items || []).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 11, paddingBottom: 11, borderBottom: i < (order?.items?.length || 0) - 1 ? "1px solid var(--border-soft)" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface-alt)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: "var(--display)", fontSize: 9, fontWeight: 800, color: "var(--ink-muted)" }}>PKG</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.product_name}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>× {item.quantity} · {fmt(item.unit_price)}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1.5px solid var(--border-soft)", paddingTop: 12, marginTop: 6 }}>
              {[["Subtotal", fmt(order?.subtotal)], ["Delivery", fmt(order?.delivery_fee)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{l}</span><span style={{ fontWeight: 600, fontSize: 12 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span style={{ fontWeight: 800 }}>Total</span><span style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(order?.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileScreen({ navigate, showToast, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({ full_name: "", username: "", email: "", phone: "", bio: "", address: "", city: "", province: "", zip_code: "", avatar_url: "" });

  const calcCompletion = () => {
    const fields = ["full_name", "username", "phone", "address", "city", "province", "zip_code", "bio", "avatar_url"];
    return Math.round(fields.filter(f => formData[f]?.toString().trim()).length / fields.length * 100);
  };

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    let profileData = data;
    if (!profileData) {
      const { data: created } = await supabase.from("profiles").insert({ id: user.id, email: user.email, full_name: user.user_metadata?.full_name || user.email }).select().maybeSingle();
      profileData = created;
    }
    setProfile(profileData || null);
    setFormData({ full_name: profileData?.full_name || "", username: profileData?.username || "", email: profileData?.email || user.email || "", phone: profileData?.phone || "", bio: profileData?.bio || "", address: profileData?.address || "", city: profileData?.city || "", province: profileData?.province || "", zip_code: profileData?.zip_code || "", avatar_url: profileData?.avatar_url || "" });
    setAvatarPreview(profileData?.avatar_url || null);
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingAvatar(false); return; }
    const reader = new FileReader();
    reader.onload = (evt) => setAvatarPreview(evt.target?.result);
    reader.readAsDataURL(file);
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (uploadErr) { showToast?.("Failed to upload avatar", "error"); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    if (urlData?.publicUrl) {
      setFormData(p => ({ ...p, avatar_url: urlData.publicUrl }));
      showToast?.("Avatar uploaded");
    }
    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...formData, updated_at: new Date().toISOString() });
    if (error) { showToast?.("Failed to save profile", "error"); setSaving(false); return; }
    showToast?.("Profile saved");
    if (setUser) setUser(prev => prev ? { ...prev, avatar_url: formData.avatar_url } : prev);
    setEditing(false);
    // ensure profile address is saved as a delivery address
    try {
      if (formData.address || formData.city || formData.province) {
        const { data: existing } = await supabase.from("delivery_addresses").select("*").eq("user_id", user.id).maybeSingle();
        // only insert if no existing addresses or no matching address_line
        const { data: match } = await supabase.from("delivery_addresses").select("*").eq("user_id", user.id).eq("address_line", formData.address || "").maybeSingle();
        if (!match) {
          const addrObj = { user_id: user.id, label: "HOME", full_name: formData.full_name || user.user_metadata?.full_name || "", phone: formData.phone || "", address_line: formData.address || "", city: formData.city || "", province: formData.province || "", zip_code: formData.zip_code || "", is_default: !existing };
          await supabase.from("delivery_addresses").insert(addrObj).maybeSingle();
        }
      }
    } catch (e) {
      /* ignore address save errors */
    }
    await fetchProfile();
    setSaving(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate("login"); };
  const completion = calcCompletion();

  const _menuItems = [
    { label: "My Orders", sub: "Track & manage orders", screen: "orders" },
    { label: "Wallet", sub: "Balance & transactions", screen: "wallet" },
    { label: "Saved Addresses", sub: "Delivery locations", screen: "addresses" },
    { label: "Payment Methods", sub: "Cards & e-wallets", screen: "payment" },
    { label: "My Store", sub: "Manage your products", screen: "seller-dashboard" },
    { label: "Help Center", sub: "FAQs & support", screen: "help" },
  ];
  const menuItems = _menuItems.filter(mi => !(mi.screen === "seller-dashboard" && profile?.role !== "seller"));

  return (
    <div className="page-enter">
      <div className="page-hdr"><h1>Profile</h1></div>
      <div style={{ padding: "0 26px", maxWidth: 820 }}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border-soft)", marginBottom: 22, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 22, padding: "24px", borderBottom: "1px solid var(--border-soft)" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 88, height: 88, borderRadius: "var(--r-xl)", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--border-soft)" }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 22, color: "var(--ink-muted)" }}>{(formData.full_name || "?").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  {editing && (
                    <label style={{ position: "absolute", bottom: -7, right: -7, width: 32, height: 32, background: "var(--ink)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2.5px solid white" }}>
                      <span style={{ fontSize: 14, color: "var(--saffron-glow)", lineHeight: 1 }}>📷</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} disabled={uploadingAvatar} />
                    </label>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>{formData.full_name || "Tindahub User"}</h2>
                  <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "0 0 10px" }}>{formData.email}</p>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                    {profile?.is_verified && <span style={{ fontSize: 10, fontWeight: 800, background: "#d1fae5", color: "#064e3b", padding: "3px 9px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em" }}>VFD</span>}
                    <span style={{ fontSize: 10, fontWeight: 800, background: profile?.role === "seller" ? "var(--saffron-soft)" : "#dbeafe", color: profile?.role === "seller" ? "var(--saffron-deep)" : "#1e40af", padding: "3px 9px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em" }}>{profile?.role === "seller" ? "SELLER" : "BUYER"}</span>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>PROFILE COMPLETE</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--saffron-deep)", fontFamily: "var(--display)" }}>{completion}%</span>
                    </div>
                    <div style={{ height: 4, background: "var(--surface-alt)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--ink)", width: `${completion}%`, transition: "width .6s cubic-bezier(.34,1.56,.64,1)", borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setEditing(!editing)} style={{ padding: "9px 16px", borderRadius: "var(--r-md)", background: editing ? "#fee2e2" : "var(--surface-alt)", border: editing ? "1.5px solid #fecaca" : "1.5px solid var(--border)", color: editing ? "#dc2626" : "var(--ink)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--display)", letterSpacing: ".04em", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {editing ? "CANCEL" : "EDIT"}
                </button>
              </div>

              {editing && (
                <div style={{ padding: 24 }}>
                  {[
                    { section: "PERSONAL", fields: [["Full Name", "full_name", "text"], ["Username", "username", "text"], ["Phone", "phone", "tel"]] },
                    { section: "ADDRESS", fields: [["Street", "address", "text"], ["City", "city", "text"], ["Province", "province", "text"], ["ZIP", "zip_code", "text"]] },
                  ].map(({ section, fields }) => (
                    <div key={section} style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14, fontFamily: "var(--display)" }}>{section}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                        {fields.map(([label, field, type]) => (
                          <div key={field}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, marginBottom: 6, color: "var(--ink)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>{label.toUpperCase()}</label>
                            <input type={type} value={formData[field]} onChange={e => handleChange(field, e.target.value)} style={{ width: "100%", height: 42, borderRadius: "var(--r-md)", border: "1.5px solid var(--border-soft)", padding: "0 12px", background: "var(--surface)", outline: "none", fontSize: 13.5, fontFamily: "var(--sans)", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = "var(--saffron)"} onBlur={e => e.target.style.borderColor = "var(--border-soft)"} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginBottom: 22 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12, fontFamily: "var(--display)" }}>BIO</h3>
                    <textarea value={formData.bio} onChange={e => handleChange("bio", e.target.value)} placeholder="Share a brief bio..." rows={3} style={{ width: "100%", borderRadius: "var(--r-md)", border: "1.5px solid var(--border-soft)", padding: 12, background: "var(--surface)", outline: "none", resize: "vertical", fontSize: 13.5, fontFamily: "var(--sans)", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = "var(--saffron)"} onBlur={e => e.target.style.borderColor = "var(--border-soft)"} />
                  </div>
                  <button onClick={saveProfile} disabled={saving || uploadingAvatar} style={{ width: "100%", height: 48, borderRadius: "var(--r-lg)", border: "none", background: saving || uploadingAvatar ? "var(--border)" : "var(--ink)", color: "white", fontWeight: 700, fontSize: 14, cursor: saving || uploadingAvatar ? "not-allowed" : "pointer", fontFamily: "var(--display)", letterSpacing: ".04em", transition: "all .2s" }}>
                    {saving ? "SAVING..." : uploadingAvatar ? "UPLOADING..." : "SAVE PROFILE"}
                  </button>
                </div>
              )}

              {!editing && (
                <div style={{ padding: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
                    {[["USERNAME", formData.username || "Not set"], ["PHONE", formData.phone || "Not set"], ["CITY", formData.city || "Not set"], ["PROVINCE", formData.province || "Not set"]].map(([l, v]) => (
                      <div key={l} style={{ background: "var(--surface-alt)", borderRadius: "var(--r-md)", padding: "12px 13px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "var(--display)" }}>{l}</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {formData.bio && (
                    <div style={{ background: "var(--surface-alt)", borderRadius: "var(--r-md)", padding: "13px 14px" }}>
                      <p style={{ fontSize: 9.5, fontWeight: 800, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 7, fontFamily: "var(--display)" }}>BIO</p>
                      <p style={{ margin: 0, color: "var(--ink)", lineHeight: 1.65, fontSize: 13.5 }}>{formData.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: "var(--surface-alt)", borderRadius: "var(--r-xl)", padding: 18, marginBottom: 20, border: "1px solid var(--border-soft)" }}>
              <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 11, color: "var(--ink-muted)", margin: "0 0 12px", letterSpacing: ".08em", textTransform: "uppercase" }}>COMMUNITY IMPACT</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[["12.4kg", "CO₂ Saved"], ["15", "Sellers Supported"], ["TOP 5%", "Sustainability"]].map(([v, l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)", margin: "0 0 1px" }}>{v}</p>
                    <p style={{ fontSize: 10.5, color: "var(--ink-muted)", margin: 0, fontWeight: 600 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {profile?.role !== "seller" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "var(--surface)", borderRadius: "var(--r-md)", padding: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", margin: 0 }}>Payment Methods</p>
                  <p style={{ marginTop: 8, color: "var(--ink)", fontWeight: 700 }}>Manage your cards & e-wallets</p>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: "var(--r-md)", padding: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", margin: 0 }}>Help Center</p>
                  <p style={{ marginTop: 8, color: "var(--ink)", fontWeight: 700 }}>FAQs and support options</p>
                </div>
              </div>
            )}

            {menuItems.map(item => (
              <button key={item.label} onClick={() => navigate(item.screen)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", cursor: "pointer", marginBottom: 9, transition: "all .18s", fontFamily: "var(--sans)", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                  <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{item.label}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-muted)", marginTop: 1 }}>{item.sub}</span>
                </div>
                <span style={{ color: "var(--ink-muted)", fontSize: 16, fontWeight: 300 }}>›</span>
              </button>
            ))}

            <button onClick={signOut} style={{ width: "100%", height: 50, borderRadius: "var(--r-xl)", border: "1.5px solid #fee2e2", background: "#fff5f5", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "var(--display)", marginTop: 6, fontSize: 12, letterSpacing: ".06em" }}>SIGN OUT</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SELLER DASHBOARD ─────────────────────────────────────────────────────────
function SellerDashboard({ navigate, showToast }) {
  const [stats, setStats] = useState({ sales: 0, orders: 0, products: 0, rating: 0, pendingOrders: 0, monthSales: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingStore, setEditingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [analyticsData] = useState([42, 58, 36, 72, 55, 89, 64, 96, 78, 100, 82, 94]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login", "error"); setStatusUpdating(null); return; }
    const updateData = { status: newStatus };
    if (newStatus === "delivered") updateData.delivered_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) { showToast("Failed to update", "error"); setStatusUpdating(null); return; }
    await supabase.from("order_status_history").insert({ order_id: orderId, status: newStatus, created_by: user.id });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order → ${STATUS_LABELS[newStatus]?.label}`, "success");
    setStatusUpdating(null);
  };

  const toggleProductActive = async (productId, isActive) => {
    await supabase.from("products").update({ is_active: !isActive }).eq("id", productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: !isActive } : p));
    showToast(isActive ? "Product hidden" : "Product visible", "success");
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast("Product deleted", "success");
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
      setStore(storeData);
      setNewStoreName(storeData?.name || "");
      if (storeData) {
        const [{ data: prods }, { data: orderData }] = await Promise.all([
          supabase.from("products").select("id,name,price,stock,is_active,is_featured,sold_count,rating,images:product_images(url,is_primary)").eq("store_id", storeData.id).order("created_at", { ascending: false }),
          supabase.from("orders").select("*, items:order_items(id,product_name,quantity,unit_price)").eq("store_id", storeData.id).order("created_at", { ascending: false }).limit(20),
        ]);
        const avgRating = prods?.length ? (prods.reduce((s, p) => s + (p.rating || 0), 0) / prods.length).toFixed(1) : "—";
        const totalSales = orderData?.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0) || 0;
        const pending = orderData?.filter(o => o.status === "pending").length || 0;
        const now = new Date(); const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthSales = orderData?.filter(o => new Date(o.created_at) >= startOfMonth && o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0) || 0;
        setStats({ products: prods?.length || 0, orders: orderData?.length || 0, rating: avgRating, sales: totalSales, pendingOrders: pending, monthSales });
        setOrders(orderData || []);
        setProducts(prods || []);
      }
      setLoading(false);
    });
  }, []);

  const statCards = [
    { tx: "REV", label: "Total Revenue", value: fmt(stats.sales), bg: "#fafaf7" },
    { tx: "MON", label: "This Month", value: fmt(stats.monthSales), bg: "#f0fdf4" },
    { tx: "ORD", label: "Total Orders", value: stats.orders, bg: "#eff6ff" },
    { tx: "PND", label: "Pending", value: stats.pendingOrders, bg: "#fffbeb", alert: stats.pendingOrders > 0 },
    { tx: "PRD", label: "Products", value: stats.products, bg: "#faf5ff" },
    { tx: "STR", label: "Avg Rating", value: stats.rating, bg: "#fff1f2" },
  ];

  const quickActions = [
    { tx: "NEW", label: "Add Product", sub: "List a new item", action: () => navigate("add-product"), color: "var(--ink)" },
    { tx: "ANA", label: "Analytics", sub: "Sales & performance", action: () => setActiveTab("analytics"), color: "#2563eb" },
    { tx: "INV", label: "Inventory", sub: "Manage stock levels", action: () => setActiveTab("products"), color: "#7c3aed" },
    { tx: "PRM", label: "Promotions", sub: "Set discounts & deals", action: () => showToast("Coming soon", "success"), color: "#059669" },
    { tx: "MSG", label: "Messages", sub: "Customer inquiries", action: () => showToast("Coming soon", "success"), color: "#dc2626" },
    { tx: "SET", label: "Store Settings", sub: "Edit info & policies", action: () => setEditingStore(true), color: "var(--saffron-deep)" },
  ];

  return (
    <div className="page-enter">
      <div className="page-hdr">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            {!editingStore ? (
              <>
                <h1 style={{ margin: 0 }}>{store?.name || "My Store"}</h1>
                <button onClick={() => setEditingStore(true)} style={{ marginTop: 4, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".06em", padding: "4px 0" }}>EDIT NAME</button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)} style={{ height: 38, borderRadius: "var(--r-md)", border: "1.5px solid var(--saffron)", padding: "0 12px", fontSize: 14, fontWeight: 700, outline: "none", fontFamily: "var(--display)" }} />
                <button onClick={async () => { if (!newStoreName || !store?.id) { setEditingStore(false); return; } setSavingName(true); const { data, error } = await supabase.from("stores").update({ name: newStoreName }).eq("id", store.id).select().single(); if (!error) { setStore(data); showToast?.("Name updated", "success"); } setSavingName(false); setEditingStore(false); }} className="btn-gold" style={{ height: 38, padding: "0 14px", fontSize: 12 }} disabled={savingName}>{savingName ? "SAV..." : "SAVE"}</button>
                <button onClick={() => { setEditingStore(false); setNewStoreName(store?.name || ""); }} className="btn-outline" style={{ height: 38, padding: "0 10px", fontSize: 12 }}>×</button>
              </div>
            )}
          </div>
          <button onClick={() => navigate("add-product")} className="btn-gold" style={{ height: 40, padding: "0 18px", fontSize: 12, letterSpacing: ".04em" }}>+ ADD PRODUCT</button>
        </div>
        <div className="tab-strip">
          {[["overview", "Overview"], ["orders", "Orders"], ["products", "Products"], ["analytics", "Analytics"]].map(([id, label]) => (
            <button key={id} className={`tab-btn${activeTab === id ? " active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 26px", maxWidth: 960 }}>
        {loading ? <Spinner /> : (
          <>
            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === "overview" && (
              <div>
                {/* Balance */}
                <div className="wallet-card" style={{ marginBottom: 22 }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(245,166,35,.7)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 4px", fontFamily: "var(--display)" }}>AVAILABLE BALANCE</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: "white", margin: "0 0 4px", fontFamily: "var(--heading)", letterSpacing: "-.02em" }}>₱{(stats.sales * .9).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", margin: "0 0 20px", fontFamily: "var(--display)" }}>90% of {fmt(stats.sales)} total</p>
                    <div style={{ display: "flex", gap: 9 }}>
                      {[["WITHDRAW", "rgba(245,166,35,.18)", "var(--saffron-glow)", "rgba(245,166,35,.3)"], ["WALLET", "rgba(255,255,255,.06)", "rgba(255,255,255,.7)", "rgba(255,255,255,.15)"]].map(([label, bg, color, border]) => (
                        <button key={label} onClick={() => navigate("wallet")} style={{ padding: "9px 20px", background: bg, color, border: `1px solid ${border}`, borderRadius: "var(--r-pill)", fontFamily: "var(--display)", fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: ".08em", transition: "all .2s" }}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 13, marginBottom: 26 }}>
                  {statCards.map((s, i) => (
                    <div key={s.label} className="stat-card" style={{ background: s.bg, animationDelay: `${i * .05}s` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 10, color: "var(--ink-muted)", letterSpacing: ".08em" }}>{s.tx}</div>
                        {s.alert && <div className="notif-dot" />}
                      </div>
                      <p className="stat-val">{s.value}</p>
                      <p className="stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", marginBottom: 14, fontFamily: "var(--display)", letterSpacing: ".08em", textTransform: "uppercase" }}>Quick Actions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginBottom: 26 }}>
                  {quickActions.map((qa, i) => (
                    <button key={qa.label} className="qa-card" onClick={qa.action} style={{ animationDelay: `${i * .06}s` }}>
                      <div className="qa-card-icon tx-icon" style={{ background: qa.color === "var(--ink)" ? "var(--ink)" : qa.color + "15", color: qa.color === "var(--ink)" ? "var(--saffron-glow)" : qa.color }}>
                        {qa.tx}
                      </div>
                      <div>
                        <div className="qa-card-label">{qa.label}</div>
                        <div className="qa-card-sub">{qa.sub}</div>
                      </div>
                      <span className="qa-card-arrow">→</span>
                    </button>
                  ))}
                </div>

                {/* Recent Orders */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", margin: 0, fontFamily: "var(--display)", letterSpacing: ".08em", textTransform: "uppercase" }}>Recent Orders</h3>
                  <button className="see-all" onClick={() => setActiveTab("orders")}>View All →</button>
                </div>
                {orders.slice(0, 5).length === 0 ? (
                  <EmptyState icon="PKG" title="No orders yet" desc="Orders appear here when customers buy" />
                ) : orders.slice(0, 5).map(o => {
                  const s = STATUS_LABELS[o.status] || { label: o.status, color: "#374151", bg: "#f3f4f6" };
                  const idx = STATUS_FLOW.indexOf(o.status);
                  const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", marginBottom: 9, transition: "all .2s", cursor: "pointer" }} onClick={() => navigate("order-tracking", { orderId: o.id })} onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 800, fontSize: 10, color: "var(--ink-muted)", flexShrink: 0, letterSpacing: ".04em" }}>PKG</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 12.5, color: "var(--ink)", margin: "0 0 2px", letterSpacing: ".02em" }}>#{o.order_number}</p>
                        <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>{o.items?.length || 0} items · {new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</p>
                      </div>
                      <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: 13, fontFamily: "var(--heading)" }}>{fmt(o.total)}</span>
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      {next && (
                        <button onClick={e => { e.stopPropagation(); updateOrderStatus(o.id, next); }} className="btn-gold" style={{ height: 32, padding: "0 11px", fontSize: 10, letterSpacing: ".04em", marginLeft: 6 }} disabled={statusUpdating === o.id}>
                          {statusUpdating === o.id ? "..." : STATUS_LABELS[next]?.label?.toUpperCase().slice(0, 4)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── ORDERS TAB ─── */}
            {activeTab === "orders" && (
              <div>
                <div style={{ display: "flex", gap: 9, marginBottom: 16, overflowX: "auto" }} className="hs">
                  {["all", ...STATUS_FLOW, "cancelled"].map(status => {
                    const count = status === "all" ? orders.length : orders.filter(o => o.status === status).length;
                    const isActive = status === "all" ? true : count > 0;
                    return (
                      <button key={status} style={{ padding: "7px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: "1.5px solid var(--border)", cursor: "pointer", background: "var(--surface)", color: "var(--ink-muted)", transition: "all .18s", flexShrink: 0, fontFamily: "var(--display)", letterSpacing: ".04em" }}>
                        {status === "all" ? "ALL" : STATUS_LABELS[status]?.label?.toUpperCase() || status.toUpperCase()} {count > 0 && <span style={{ marginLeft: 4, background: "var(--surface-alt)", padding: "1px 5px", borderRadius: 99, fontSize: 9 }}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
                {orders.length === 0 ? (
                  <EmptyState icon="PKG" title="No orders yet" desc="Orders will appear here" />
                ) : orders.map(o => {
                  const s = STATUS_LABELS[o.status] || { label: o.status, color: "#374151", bg: "#f3f4f6" };
                  const idx = STATUS_FLOW.indexOf(o.status);
                  const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
                  return (
                    <div key={o.id} style={{ padding: "15px 17px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", marginBottom: 10, animation: "fadeUp .3s both", transition: "all .2s", cursor: "pointer" }} onClick={() => navigate("order-tracking", { orderId: o.id })} onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 13, color: "var(--ink)", margin: "0 0 2px", letterSpacing: ".02em" }}>#{o.order_number}</p>
                          <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0, fontFamily: "var(--display)" }}>{new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                          <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                          <span style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)", fontFamily: "var(--heading)" }}>{fmt(o.total)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                        {(o.items || []).slice(0, 5).map((item, i) => (
                          <div key={i} style={{ padding: "4px 9px", background: "var(--surface-alt)", borderRadius: 99, fontSize: 10.5, fontWeight: 600, color: "var(--ink-mid)", fontFamily: "var(--display)", whiteSpace: "nowrap" }}>{item.product_name?.slice(0, 14)}{(item.product_name?.length || 0) > 14 ? "..." : ""} ×{item.quantity}</div>
                        ))}
                      </div>
                      {next && (
                        <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => updateOrderStatus(o.id, next)} className="btn-gold" style={{ height: 34, padding: "0 14px", fontSize: 11, letterSpacing: ".04em" }} disabled={statusUpdating === o.id}>
                            {statusUpdating === o.id ? "UPDATING..." : `→ ${STATUS_LABELS[next]?.label?.toUpperCase()}`}
                          </button>
                          {o.status === "pending" && (
                            <button onClick={() => updateOrderStatus(o.id, "cancelled")} style={{ height: 34, padding: "0 12px", fontSize: 11, borderRadius: "var(--r-md)", border: "1.5px solid #fee2e2", background: "transparent", color: "#dc2626", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 700, letterSpacing: ".04em" }} disabled={statusUpdating === o.id}>CANCEL</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── PRODUCTS TAB ─── */}
            {activeTab === "products" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>{products.length} PRODUCTS</p>
                  <button onClick={() => navigate("add-product")} className="btn-gold" style={{ height: 36, padding: "0 16px", fontSize: 11, letterSpacing: ".04em" }}>+ ADD</button>
                </div>
                {products.length === 0 ? (
                  <EmptyState icon="PRD" title="No products yet" desc="Add your first product to start selling" />
                ) : products.map((p, i) => {
                  const img = p.images?.find(im => im.is_primary)?.url || p.images?.[0]?.url;
                  return (
                    <div key={p.id} className="product-row" style={{ animationDelay: `${i * .04}s`, opacity: p.is_active ? 1 : .55 }}>
                      <div style={{ width: 56, height: 56, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 9, color: "var(--ink-muted)" }}>IMG</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                          {p.is_featured && <span style={{ fontSize: 9, fontWeight: 800, background: "var(--saffron-soft)", color: "var(--saffron-deep)", padding: "2px 6px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em", flexShrink: 0 }}>FTR</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--ink-muted)", fontFamily: "var(--display)" }}>
                          <span style={{ fontWeight: 700, color: "var(--ink)" }}>{fmt(p.price)}</span>
                          {p.stock > 0 ? <span>STK: {p.stock}</span> : <span style={{ color: "#7f1d1d", fontWeight: 800 }}>OUT OF STOCK</span>}
                          <span>SOLD: {p.sold_count || 0}</span>
                          <span>★ {p.rating || 0}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                        <button onClick={() => navigate("add-product", { product: p })} style={{ height: 32, padding: "0 10px", borderRadius: "var(--r-md)", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 9, letterSpacing: ".06em", transition: "all .18s" }}>EDIT</button>
                        <button onClick={() => toggleProductActive(p.id, p.is_active)} style={{ height: 32, padding: "0 10px", borderRadius: "var(--r-md)", border: `1.5px solid ${p.is_active ? "var(--border)" : "rgba(245,166,35,.4)"}`, background: p.is_active ? "var(--surface-alt)" : "var(--saffron-soft)", color: p.is_active ? "var(--ink-muted)" : "var(--saffron-deep)", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 9, letterSpacing: ".06em", transition: "all .18s" }}>
                          {p.is_active ? "HIDE" : "SHOW"}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} style={{ height: 32, width: 32, borderRadius: "var(--r-md)", border: "1.5px solid #fee2e2", background: "transparent", color: "#dc2626", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 10 }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── ANALYTICS TAB ─── */}
            {activeTab === "analytics" && (
              <div>
                <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border-soft)", padding: 22, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 10, color: "var(--ink-muted)", letterSpacing: ".08em", margin: "0 0 4px", textTransform: "uppercase" }}>Sales Trend</p>
                      <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)", margin: 0 }}>{fmt(stats.sales)}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#064e3b", background: "#d1fae5", padding: "4px 10px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em" }}>+12.4% this week</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 72 }}>
                    {analyticsData.map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: "var(--r-xs)", background: i === analyticsData.length - 1 ? "var(--ink)" : "var(--saffron-100)", height: `${h}%`, transition: "all .4s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--saffron)"} onMouseLeave={e => e.currentTarget.style.background = i === analyticsData.length - 1 ? "var(--ink)" : "var(--saffron-100)"} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--ink-muted)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>12 DAYS AGO</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: "var(--saffron-deep)", fontFamily: "var(--display)", letterSpacing: ".06em" }}>TODAY</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  {[{ tx: "CNV", label: "Conversion Rate", value: "3.2%", trend: "+0.4%" }, { tx: "AOV", label: "Avg Order Value", value: fmt(stats.sales / Math.max(stats.orders, 1)), trend: "+₱120" }, { tx: "RET", label: "Return Buyers", value: "28%", trend: "+5%" }, { tx: "SKU", label: "Top SKUs", value: stats.products, trend: "active" }].map(card => (
                    <div key={card.label} style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", padding: "16px 18px", transition: "all .2s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 9, color: "var(--ink-muted)", letterSpacing: ".08em", marginBottom: 6 }}>{card.tx}</div>
                      <div style={{ fontFamily: "var(--heading)", fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: "0 0 2px" }}>{card.value}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--jade)", fontFamily: "var(--display)" }}>{card.trend}</div>
                      <p style={{ fontSize: 10, color: "var(--ink-muted)", margin: "4px 0 0", fontWeight: 600 }}>{card.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", padding: "18px 20px" }}>
                  <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 10, color: "var(--ink-muted)", letterSpacing: ".08em", margin: "0 0 14px", textTransform: "uppercase" }}>Top Products by Sales</p>
                  {products.slice(0, 5).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 11, color: "var(--ink-muted)", width: 16, textAlign: "right" }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{p.name?.slice(0, 28)}{(p.name?.length || 0) > 28 ? "..." : ""}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--display)" }}>{fmt((p.sold_count || 0) * p.price)}</span>
                        </div>
                        <div className="anal-bar-wrap"><div className="anal-bar" style={{ width: `${Math.min(100, (p.sold_count || 0) / Math.max(...products.map(x => x.sold_count || 0), 1) * 100)}%` }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADD PRODUCT SCREEN ──────────────────────────────────────────────────────
function AddProductScreen({ navigate, showToast, params }) {
  const editingProduct = params?.product || null;
  const [form, setForm] = useState({ name: "", slug: "", price: "", original_price: "", stock: 1, unit: "", weight: "", shelf_life: "", category_id: "", is_organic: false, is_featured: false, description: "" });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: sessionUser }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.auth.getUser(),
      ]);
      setCategories(cats || []);
      if (sessionUser?.user) {
        const { data: stores } = await supabase.from("stores").select("*").eq("owner_id", sessionUser.user.id).limit(1);
        setStore(stores?.[0] || null);
      }
      // if editing, prefill form
      if (editingProduct) {
        setForm({
          name: editingProduct.name || "",
          slug: editingProduct.slug || "",
          price: editingProduct.price || "",
          original_price: editingProduct.original_price || "",
          stock: editingProduct.stock || 0,
          unit: editingProduct.unit || "",
          weight: editingProduct.weight || "",
          shelf_life: editingProduct.shelf_life || "",
          category_id: editingProduct.category_id || "",
          is_organic: !!editingProduct.is_organic,
          is_featured: !!editingProduct.is_featured,
          description: editingProduct.description || "",
        });
        const imgs = editingProduct.images || [];
        setPreviews((imgs || []).map((u, i) => ({ name: `img${i}`, url: u.url })));
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleFiles = e => {
    const raw = Array.from(e.target.files || []);
    const valid = []; const pr = [];
    raw.forEach(f => {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)) { showToast?.(`Unsupported: ${f.name}`, "error"); return; }
      if (f.size > 10 * 1024 * 1024) { showToast?.(`Too large: ${f.name}`, "error"); return; }
      valid.push(f); pr.push({ name: f.name, url: URL.createObjectURL(f) });
    });
    setFiles(p => [...p, ...valid]); setPreviews(p => [...p, ...pr]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return showToast?.("Name and price required", "error");
    if (!store?.id) return showToast?.("Please create a store first", "error");
    setSaving(true);
    let productData = null;
    let prodErr = null;
    if (editingProduct && editingProduct.id) {
      const { data, error } = await supabase.from("products").update({
        category_id: form.category_id || categories?.[0]?.id || null,
        name: form.name, slug: form.slug || slugify(form.name), description: form.description,
        price: parseFloat(form.price) || 0, original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0, unit: form.unit || null, weight: form.weight || null,
        shelf_life: form.shelf_life || null, is_organic: !!form.is_organic, is_featured: !!form.is_featured,
      }).eq("id", editingProduct.id).select().single();
      productData = data; prodErr = error;
    } else {
      const res = await supabase.from("products").insert({
        store_id: store.id, category_id: form.category_id || categories?.[0]?.id || null,
        name: form.name, slug: form.slug || slugify(form.name), description: form.description,
        price: parseFloat(form.price) || 0, original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0, unit: form.unit || null, weight: form.weight || null,
        shelf_life: form.shelf_life || null, is_organic: !!form.is_organic, is_featured: !!form.is_featured, is_active: true,
      }).select().single();
      productData = res.data; prodErr = res.error;
    }
    if (prodErr) { showToast?.(editingProduct ? "Failed to update product" : "Failed to add product", "error"); setSaving(false); return; }
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const path = `${productData.id}/${Date.now()}_${f.name}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, f, { cacheControl: "3600", upsert: false });
      if (upErr) continue;
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      if (urlData?.publicUrl) await supabase.from("product_images").insert({ product_id: productData.id, url: urlData.publicUrl, sort_order: i, is_primary: i === 0 });
    }
    showToast?.(editingProduct ? "Product updated!" : "Product added!", "success");
    navigate("seller-dashboard");
    setSaving(false);
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-enter">
      <div className="page-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("seller-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontWeight: 800, fontSize: 11, color: "var(--ink-muted)", letterSpacing: ".04em" }}>← STORE</button>
          <h1 style={{ margin: 0 }}>Add Product</h1>
        </div>
      </div>
      <div style={{ padding: "0 26px", maxWidth: 860 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>PRODUCT NAME *</label>
              <input required placeholder="e.g. Organic Honey 500g" value={form.name} onChange={e => handleChange("name", e.target.value)} className="th-input" style={{ paddingLeft: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>PRICE (₱) *</label>
              <input type="number" placeholder="0.00" value={form.price} onChange={e => handleChange("price", e.target.value)} className="th-input" style={{ paddingLeft: 14 }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>ORIGINAL PRICE</label>
              <input type="number" placeholder="Optional" value={form.original_price} onChange={e => handleChange("original_price", e.target.value)} className="th-input" style={{ paddingLeft: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>STOCK</label>
              <input type="number" value={form.stock} onChange={e => handleChange("stock", e.target.value)} className="th-input" style={{ paddingLeft: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>CATEGORY</label>
              <select value={form.category_id} onChange={e => handleChange("category_id", e.target.value)} className="th-input" style={{ paddingLeft: 14, height: 48 }}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>DESCRIPTION</label>
            <textarea placeholder="Describe your product..." value={form.description} onChange={e => handleChange("description", e.target.value)} rows={5} style={{ width: "100%", borderRadius: "var(--r-md)", padding: 12, border: "1.5px solid var(--border)", resize: "vertical", fontSize: 13.5, fontFamily: "var(--sans)", outline: "none", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = "var(--saffron)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[["UNIT", "unit", "e.g. 500g"], ["WEIGHT", "weight", "e.g. 500g"], ["SHELF LIFE", "shelf_life", "e.g. 6 months"]].map(([l, k, ph]) => (
              <div key={k}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 6, fontFamily: "var(--display)" }}>{l}</label>
                <input placeholder={ph} value={form[k]} onChange={e => handleChange(k, e.target.value)} className="th-input" style={{ paddingLeft: 14 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", padding: "12px 14px", background: "var(--surface-alt)", borderRadius: "var(--r-lg)" }}>
            {[["is_organic", "ORGANIC"], ["is_featured", "FEATURED"]].map(([key, label]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div onClick={() => handleChange(key, !form[key])} style={{ width: 40, height: 22, borderRadius: 99, background: form[key] ? "var(--ink)" : "var(--border)", position: "relative", transition: "background .2s", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 3, left: form[key] ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: ".06em", color: form[key] ? "var(--ink)" : "var(--ink-muted)" }}>{label}</span>
              </label>
            ))}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-muted)", marginBottom: 8, fontFamily: "var(--display)" }}>PRODUCT IMAGES</label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: "var(--r-lg)", border: "1.5px dashed var(--border)", cursor: "pointer", background: "var(--surface-alt)", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--saffron)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: "var(--surface)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 9, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".04em" }}>IMG</div>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Upload Images</p>
                <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: "2px 0 0" }}>{files.length > 0 ? `${files.length} file${files.length !== 1 ? "s" : ""} selected` : "JPG, PNG, WebP · Max 10MB each"}</p>
              </div>
              <input accept="image/*" type="file" multiple onChange={handleFiles} style={{ display: "none" }} />
            </label>
            {previews.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ width: 80, height: 80, borderRadius: "var(--r-md)", overflow: "hidden", position: "relative", border: "1.5px solid var(--border)" }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 8, fontWeight: 800, background: "var(--ink)", color: "var(--saffron-glow)", padding: "2px 5px", borderRadius: 4, fontFamily: "var(--display)", letterSpacing: ".06em" }}>MAIN</span>}
                    <button type="button" onClick={() => { setFiles(f => f.filter((_, idx) => idx !== i)); setPreviews(s => { const c = [...s]; c.splice(i, 1); return c; }); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", color: "white", border: "none", borderRadius: 5, width: 20, height: 20, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="submit" className="btn-gold" disabled={saving} style={{ flex: 1 }}>{saving ? (editingProduct ? "SAVING..." : "ADDING...") : (editingProduct ? "SAVE CHANGES" : "ADD PRODUCT")}</button>
            <button type="button" className="btn-outline" onClick={() => navigate("seller-dashboard")} style={{ flex: "none", padding: "0 20px" }}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── WALLET ───────────────────────────────────────────────────────────────────
function WalletScreen({ navigate }) {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const [{ data: w }, { data: t }] = await Promise.all([
        supabase.from("wallets").select("*").eq("user_id", user.id).single(),
        supabase.from("wallet_transactions").select("*").eq("wallet_id", (await supabase.from("wallets").select("id").eq("user_id", user.id).single()).data?.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setWallet(w); setTxns(t || []); setLoading(false);
    });
  }, []);

  return (
    <div className="page-enter">
      <div className="page-hdr"><h1>Wallet</h1></div>
      <div style={{ padding: "0 26px", maxWidth: 720 }}>
        {loading ? <Spinner /> : (
          <>
            <div className="wallet-card" style={{ marginBottom: 22 }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(245,166,35,.7)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 4px", fontFamily: "var(--display)" }}>AVAILABLE BALANCE</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: "white", margin: "0 0 3px", fontFamily: "var(--heading)" }}>{fmt(wallet?.balance || 0)}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", margin: "0 0 20px", fontFamily: "var(--display)", letterSpacing: ".06em" }}>{wallet?.currency || "PHP"}</p>
                <div style={{ display: "flex", gap: 9 }}>
                  {[["CASH IN", "rgba(245,166,35,.18)", "var(--saffron-glow)", "rgba(245,166,35,.3)"], ["WITHDRAW", "rgba(255,255,255,.06)", "rgba(255,255,255,.7)", "rgba(255,255,255,.15)"]].map(([label, bg, color, border]) => (
                    <button key={label} style={{ padding: "9px 18px", background: bg, color, border: `1px solid ${border}`, borderRadius: "var(--r-pill)", fontFamily: "var(--display)", fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: ".08em" }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 11, margin: 0, color: "var(--ink-muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Revenue Trend</p>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#064e3b", background: "#d1fae5", padding: "3px 9px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em" }}>+12.4% WEEK</span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                {[28, 45, 36, 68, 42, 78, 62, 88, 72, 94, 68, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: "var(--r-xs)", background: i === 11 ? "var(--ink)" : "var(--saffron-100)", height: `${h}%`, transition: "all .3s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--saffron)"} onMouseLeave={e => e.currentTarget.style.background = i === 11 ? "var(--ink)" : "var(--saffron-100)"} />
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", marginBottom: 14, fontFamily: "var(--display)", letterSpacing: ".08em", textTransform: "uppercase" }}>Transactions</h3>
            {txns.length === 0 ? (
              <EmptyState icon="TXN" title="No transactions yet" desc="Your wallet activity will show here" />
            ) : txns.map(t => (
              <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border-soft)", marginBottom: 9, transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                <div style={{ width: 42, height: 42, borderRadius: "var(--r-md)", background: t.type === "credit" ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 10, fontWeight: 800, color: t.type === "credit" ? "#064e3b" : "#991b1b", flexShrink: 0, letterSpacing: ".04em" }}>{t.type === "credit" ? "IN" : "OUT"}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: "0 0 2px" }}>{t.description || t.reference || "Transaction"}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0, fontFamily: "var(--display)", fontWeight: 600 }}>{new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: t.type === "credit" ? "#064e3b" : "var(--ink)", margin: "0 0 2px", fontFamily: "var(--heading)" }}>{t.type === "credit" ? "+" : "-"}{fmt(t.amount)}</p>
                  <span style={{ fontSize: 9, fontWeight: 800, color: t.type === "credit" ? "#064e3b" : "#991b1b", background: t.type === "credit" ? "#d1fae5" : "#fee2e2", padding: "2px 7px", borderRadius: 99, fontFamily: "var(--display)", letterSpacing: ".06em" }}>{t.status}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ navigate, showToast }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) showToast(error.message, "error");
    else { showToast("Welcome back!", "success"); navigate("home"); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--cream)" }}>
      <div style={{ flex: 1, background: "var(--ink)", display: "none", position: "relative", overflow: "hidden", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48 }} className="desktop-auth-panel">
        <style>{`@media(min-width:900px){.desktop-auth-panel{display:flex!important}}`}</style>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--serif)", fontSize: 480, color: "rgba(245,166,35,.04)", fontStyle: "italic", lineHeight: 1, whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>T</div>
        <div style={{ position: "relative", textAlign: "center", color: "white" }}>
          <span className="brand-wordmark" style={{ fontSize: 56, display: "block", marginBottom: 14, color: "white" }}>Tinda<span>hub</span></span>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 260, lineHeight: 1.7, margin: "0 auto" }}>Your local Filipino marketplace — supporting communities, one purchase at a time.</p>
          <div style={{ marginTop: 48, display: "flex", gap: 28, justifyContent: "center" }}>
            {[["1,200+", "SELLERS"], ["48k+", "BUYERS"], ["₱12M+", "SALES"]].map(([v, l]) => (
              <div key={l}>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--heading)", margin: "0 0 2px", color: "var(--saffron-glow)" }}>{v}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,.4)", margin: 0, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", fontFamily: "var(--display)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 40px", maxWidth: 460, margin: "0 auto", width: "100%" }}>
        <span className="auth-wordmark">Tindahub</span>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)", margin: "0 0 5px" }}>Welcome Back</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 13.5, margin: "0 0 32px" }}>Log in to your Tindahub account</p>
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {[{ placeholder: "Email address", value: email, onChange: e => setEmail(e.target.value), type: "email"}, { placeholder: "Password", value: pw, onChange: e => setPw(e.target.value), type: showPw ? "text" : "password",}].map((f, i) => (
            <div key={i} style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--display)", fontSize: 9.5, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".04em" }}>{f.tx}</span>
              <input className="th-input" type={f.type} placeholder={f.placeholder} value={f.value} onChange={f.onChange} required style={{ paddingRight: f.type?.includes("password") || f.value?.includes("@") ? 46 : 14 }} />
              {i === 1 && <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 9.5, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".04em" }}>{showPw ? "HDE" : "SHW"}</button>}
            </div>
          ))}
          <button type="button" style={{ alignSelf: "flex-end", color: "var(--saffron-deep)", fontSize: 12.5, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", letterSpacing: ".04em" }}>FORGOT PASSWORD</button>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}><span>{loading ? "SIGNING IN..." : "LOG IN"}</span></button>
        </form>
        <div className="auth-divider"><span>or continue with</span></div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["GGL", "Google"], ["FB", "Facebook"]].map(([tx, label]) => {
            const GoogleIcon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.2 12.2c0-.8-.1-1.6-.3-2.4H12v4.6h6.2c-.3 1.8-1.6 3.3-3.4 4.1v3h5.4c3.1-2.8 4.9-7 4.9-11.3z" fill="#4285F4" />
                <path d="M12 24c3.2 0 5.9-1 7.9-2.8l-5.4-3c-1 0.7-2.3 1.1-3.6 1.1-2.8 0-5.2-1.9-6.1-4.5H0.5v2.8C2.6 21.8 7 24 12 24z" fill="#34A853" />
                <path d="M5.9 14.8c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2V7.6H0.5A11.9 11.9 0 000 12c0 1.9.4 3.8 1.3 5.6l4.6-2.8z" fill="#FBBC05" />
                <path d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.3 15.2 0 12 0 7 0 2.6 2.2.5 5.6l5.4 3.1C6.8 6.7 9.2 4.8 12 4.8z" fill="#EA4335" />
              </svg>
            );

            const FacebookIcon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="24" height="24" rx="4" fill="#1877F2" />
                <path d="M15.5 8.5h-1.3c-.6 0-.8.3-.8.8v1.1h2.1l-.3 2.2h-1.8V20h-2.3v-6.4H9.8v-2.2h1.5V9.9c0-1.5.9-2.3 2.2-2.3.6 0 1.2.1 1.6.2v1.2z" fill="white" />
              </svg>
            );

            return (
              <button key={label} style={{ flex: 1, height: 48, border: "1.5px solid var(--border)", borderRadius: "var(--r-xl)", background: "var(--surface)", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s", fontFamily: "var(--display)", color: "var(--ink)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--saffron)"; e.currentTarget.style.background = "var(--saffron-soft)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <span style={{ width: 26, height: 26, borderRadius: "var(--r-xs)", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "var(--ink-muted)", letterSpacing: ".04em" }}>
                  {tx === "GGL" ? GoogleIcon : FacebookIcon}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        <p style={{ textAlign: "center", marginTop: 26, fontSize: 13.5, color: "var(--ink-muted)" }}>
          No account? <button onClick={() => navigate("signup")} style={{ color: "var(--saffron-deep)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 12.5, letterSpacing: ".03em" }}>SIGN UP</button>
        </p>
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
function SignupScreen({ navigate, showToast }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) { showToast(error.message, "error"); setLoading(false); return; }
    if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, email: form.email, full_name: form.name, phone: form.phone });
    setLoading(false);
    navigate("onboarding");
  };

  const fields = [
    { key: "name", placeholder: "Full Name", type: "text" },
    { key: "phone", placeholder: "+63 (000) 000-0000", type: "tel" },
    { key: "email", placeholder: "Email Address", type: "email" },
    { key: "password", placeholder: "Password (min. 8 chars)", type: "password" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)", padding: "0 28px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420, margin: "0 auto", width: "100%", paddingTop: 48, paddingBottom: 48 }}>
        <span className="auth-wordmark">Tindahub</span>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--heading)", color: "var(--ink)", margin: "0 0 5px" }}>Create Account</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 13.5, margin: "0 0 28px" }}>Join your local marketplace today</p>
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map(f => (
            <div key={f.key} style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--display)", fontSize: 9.5, fontWeight: 800, color: "var(--ink-muted)", letterSpacing: ".04em" }}>{f.tx}</span>
              <input className="th-input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
            </div>
          ))}
          <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "2px 0" }}>By signing up, you agree to our <span style={{ color: "var(--saffron-deep)", fontWeight: 700, cursor: "pointer" }}>Terms</span> and <span style={{ color: "var(--saffron-deep)", fontWeight: 700, cursor: "pointer" }}>Privacy Policy</span></p>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}><span>{loading ? "CREATING ACCOUNT..." : "SIGN UP"}</span></button>
        </form>
        <p style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: "var(--ink-muted)" }}>
          Have an account? <button onClick={() => navigate("login")} style={{ color: "var(--saffron-deep)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: 12.5, letterSpacing: ".03em" }}>LOG IN</button>
        </p>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingScreen({ navigate, showToast }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!role) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ role }).eq("id", user.id);
      if (role === "seller") await supabase.from("stores").insert({ owner_id: user.id, name: "My Store", slug: `store-${user.id.slice(0, 8)}` });
    }
    setLoading(false);
    navigate(role === "seller" ? "seller-dashboard" : "home");
  };

  const roles = [
    { r: "buyer",  title: "I want to Shop", desc: "Browse and discover local artisan products from verified Filipino sellers.", bg: "var(--saffron-soft)" },
    { r: "seller", title: "I want to Sell", desc: "Set up your online store, list products, and reach thousands of buyers.", bg: "#f0fdf4" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)", padding: "0 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18 }}>
        <span className="brand-wordmark" style={{ fontSize: 20 }}>Tinda<span>hub</span></span>
        <button onClick={() => navigate("home")} style={{ color: "var(--ink-muted)", fontSize: 11.5, background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "var(--display)", letterSpacing: ".06em" }}>SKIP</button>
      </div>
      <div style={{ paddingTop: 52, flex: 1 }}>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, color: "var(--ink)", margin: "0 0 7px", animation: "fadeUp .4s .1s both" }}>How will you use Tindahub?</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 13.5, margin: "0 0 30px", animation: "fadeUp .4s .2s both" }}>Choose your role in the marketplace</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {roles.map((opt, i) => (
            <button key={opt.r} className={`role-card${role === opt.r ? " active" : ""}`} onClick={() => setRole(opt.r)} style={{ animationDelay: `${.25 + i * .1}s` }}>
              <div style={{ width: 56, height: 56, background: opt.bg, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 13, color: "var(--ink-muted)", letterSpacing: ".06em", flexShrink: 0 }}>{opt.tx}</div>
              <div>
                <p style={{ fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)", margin: "0 0 4px", fontSize: 15 }}>{opt.title}</p>
                <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: 0, lineHeight: 1.55 }}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ paddingBottom: 46 }}>
        <button className="btn-gold" style={{ width: "100%" }} onClick={handle} disabled={!role || loading}>{loading ? "SETTING UP..." : "CONTINUE →"}</button>
      </div>
    </div>
  );
}

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────────
function PlaceholderScreen({ title, tx, navigate }) {
  return (
    <div className="page-enter">
      <div className="page-hdr"><h1>{title}</h1></div>
      <EmptyState icon={tx || title.slice(0, 3).toUpperCase()} title={title} desc="This section is ready to be connected to Supabase." action={<button className="btn-primary" style={{ width: 180, marginTop: 8 }} onClick={() => navigate("home")}><span>← Back Home</span></button>} />
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState("login");
  const [params, setParams] = useState({});
  const [toast, setToast] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const navigate = useCallback((s, p = {}) => { setScreen(s); setParams(p); window.scrollTo(0, 0); }, []);
  const showToast = useCallback((m, t = "success") => { setToast({ message: m, type: t }); }, []);

  const hydrateUser = useCallback(async authUser => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("avatar_url, role").eq("id", authUser.id).maybeSingle();
    setUser({ ...authUser, ...profile });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { hydrateUser(session.user); navigate("home"); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session?.user || null);
      if (!session) navigate("login");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    const fetchCart = () => supabase.from("cart_items").select("quantity").eq("user_id", user.id).then(({ data }) => setCartCount(data?.reduce((s, i) => s + i.quantity, 0) || 0));
    fetchCart();
    const sub = supabase.channel("cart-count").on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` }, fetchCart).subscribe();
    return () => supabase.removeChannel(sub);
  }, [user]);

  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  const sp = { navigate, showToast, params, user, setUser };

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen {...sp} />;
      case "search": return <SearchScreen {...sp} />;
      case "product": return <ProductScreen {...sp} />;
      case "cart": return <CartScreen {...sp} />;
      case "checkout": return <CheckoutScreen {...sp} />;
      case "order-confirmation": return <OrderConfirmScreen {...sp} />;
      case "order-tracking": return <OrderTrackingScreen {...sp} />;
      case "orders": return <OrdersScreen {...sp} />;
      case "profile": return <ProfileScreen {...sp} />;
      case "add-product": return <AddProductScreen {...sp} />;
      case "seller-dashboard": return <SellerDashboard {...sp} />;
      case "wallet": return <WalletScreen {...sp} />;
      case "login": return <LoginScreen {...sp} />;
      case "signup": return <SignupScreen {...sp} />;
      case "onboarding": return <OnboardingScreen {...sp} />;
      default: return <PlaceholderScreen title={screen.charAt(0).toUpperCase() + screen.slice(1)} tx={screen.slice(0, 3).toUpperCase()} navigate={navigate} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <style>{`
        @media(min-width:901px){ .desktop-search{display:flex !important} .mobile-search-wrap{display:none !important} }
        @media(max-width:900px){ .mobile-search-wrap{display:flex !important} }
        input:focus, textarea:focus { outline: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {!isAuth ? (
        <div id="th-app">
          <TopBar screen={screen} navigate={navigate} cartCount={cartCount} user={user} />
          <Sidebar screen={screen} navigate={navigate} cartCount={cartCount} user={user} />
          <main className="th-main">{renderScreen()}</main>
          <BottomNavBar screen={screen} navigate={navigate} cartCount={cartCount} />
        </div>
      ) : (
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
          {renderScreen()}
        </div>
      )}
    </>
  );
}