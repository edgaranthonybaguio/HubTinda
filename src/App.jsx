import { useState, useEffect, useCallback, useRef } from "react";
import supabase from "./supabaseClient";

// ── DESIGN SYSTEM ──────────────────────────────────────────────────────────
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --orange:#F97316;--orange-dark:#EA580C;--orange-light:#FED7AA;--orange-pale:#FFF7ED;
  --green:#22C55E;--green-light:#DCFCE7;--blue:#3B82F6;--blue-light:#DBEAFE;
  --red:#EF4444;--red-light:#FEE2E2;--yellow:#F59E0B;
  --ink:#111827;--ink2:#374151;--ink3:#6B7280;--ink4:#9CA3AF;
  --bg:#FAFAF9;--surface:#FFFFFF;--surface2:#F9FAFB;--surface3:#F3F4F6;
  --border:#E5E7EB;--border2:#D1D5DB;
  --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;--r-2xl:24px;--r-pill:999px;
  --shadow-sm:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.04);
  --shadow-lg:0 20px 48px rgba(0,0,0,.1),0 8px 20px rgba(0,0,0,.06);
  font:15px/1.5 'Segoe UI',system-ui,sans-serif;
  color:var(--ink2);background:var(--bg);
  -webkit-font-smoothing:antialiased;
}



body{background:var(--bg);overflow-x:hidden;}
h1,h2,h3,h4{color:var(--ink);}
button{cursor:pointer;}

::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px;}
.hs{-ms-overflow-style:none;scrollbar-width:none;}
.hs::-webkit-scrollbar{display:none;}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes heartPop{0%{transform:scale(1);}40%{transform:scale(1.4);}70%{transform:scale(.88);}100%{transform:scale(1);}}
@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
@keyframes pulseRing{0%{transform:scale(1);opacity:.5;}100%{transform:scale(1.7);opacity:0;}}

button:active:not(:disabled){transform:scale(.97);transition:transform .08s;}

#app{display:grid;grid-template-rows:1fr auto;min-height:100dvh;background:var(--bg);}
.main-content{overflow-y:auto;padding-bottom:80px;}

.bottom-nav{
  display:flex;position:fixed;bottom:0;left:0;right:0;z-index:100;
  background:rgba(255,255,255,.96);backdrop-filter:blur(20px);
  border-top:1px solid var(--border);
  padding:8px 0 max(12px, env(safe-area-inset-bottom));
}
.bnav-btn{
  flex:1;display:flex;flex-direction:column;align-items:center;
  gap:3px;border:none;background:none;cursor:pointer;
  color:var(--ink4);transition:color .2s;position:relative;
  padding:4px 0;
}
.bnav-btn.active{color:var(--orange);}
.bnav-btn svg{transition:transform .2s;}
.bnav-btn.active svg{transform:scale(1.1);}
.bnav-label{font-size:10px;font-weight:600;letter-spacing:.01em;}
.bnav-count{
  position:absolute;top:0px;right:calc(50% - 18px);
  min-width:16px;height:16px;background:var(--orange);border-radius:50%;
  border:2px solid white;display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:800;color:white;padding:0 3px;
}

.page-header{
  padding:16px 20px 0;background:var(--surface);
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:50;
}
.top-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;background:var(--surface);
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:50;
}
.logo{font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.03em;}
.logo span{color:var(--orange);}

.nav-avatar{
  width:36px;height:36px;border-radius:50%;
  overflow:hidden;background:var(--orange-pale);
  display:flex;align-items:center;justify-content:center;
  border:2px solid var(--orange-light);cursor:pointer;
  flex-shrink:0;transition:border-color .2s;
}
.nav-avatar:hover{border-color:var(--orange);}
.nav-avatar img{width:100%;height:100%;object-fit:cover;}
.nav-avatar-initials{font-size:13px;font-weight:800;color:var(--orange);}

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  height:48px;padding:0 22px;border-radius:var(--r-lg);
  font-size:14px;font-weight:700;
  border:none;cursor:pointer;transition:all .2s;letter-spacing:.01em;
}
.btn-primary{background:var(--orange);color:white;}
.btn-primary:hover:not(:disabled){background:var(--orange-dark);transform:translateY(-1px);box-shadow:0 6px 20px rgba(249,115,22,.35);}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;}
.btn-outline{background:transparent;color:var(--ink);border:1.5px solid var(--border2);}
.btn-outline:hover{border-color:var(--orange);background:var(--orange-pale);}
.btn-ghost{background:transparent;color:var(--ink3);border:none;height:38px;padding:0 12px;font-size:13px;}
.btn-ghost:hover{background:var(--surface3);color:var(--ink);}
.btn-danger{background:var(--red-light);color:var(--red);border:none;}
.btn-sm{height:36px;padding:0 14px;font-size:12px;border-radius:var(--r-md);}

.input{
  width:100%;height:50px;padding:0 16px;
  border:1.5px solid var(--border);border-radius:var(--r-lg);
  background:var(--surface);font-size:14px;color:var(--ink);
  outline:none;transition:all .2s;
}
.input:focus{border-color:var(--orange);box-shadow:0 0 0 4px rgba(249,115,22,.1);}
.input::placeholder{color:var(--ink4);}

.card{
  background:var(--surface);border-radius:var(--r-xl);
  border:1px solid var(--border);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,border-color .2s;
  animation:fadeUp .35s both;
}
.card.clickable{cursor:pointer;}
.card.clickable:hover{transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--orange-light);}

.prod-img{position:relative;padding-top:100%;overflow:hidden;border-radius:var(--r-xl) var(--r-xl) 0 0;background:var(--surface3);}
.prod-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s;}
.card.clickable:hover .prod-img img{transform:scale(1.06);}
.fav-btn{
  position:absolute;top:10px;right:10px;width:32px;height:32px;
  background:rgba(255,255,255,.9);backdrop-filter:blur(8px);
  border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,.1);transition:transform .2s;
}
.fav-btn:hover{transform:scale(1.2);}
.fav-btn.popped{animation:heartPop .4s cubic-bezier(.34,1.56,.64,1);}
.badge{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:3px 8px;border-radius:var(--r-pill);letter-spacing:.04em;}
.badge-orange{background:var(--orange);color:white;}
.badge-green{background:var(--green-light);color:#166534;}
.badge-blue{background:var(--blue-light);color:#1e40af;}
.badge-red{background:var(--red-light);color:#991b1b;}
.badge-gray{background:var(--surface3);color:var(--ink3);}

.search-bar{
  display:flex;align-items:center;gap:10px;padding:13px 16px;
  background:var(--surface2);border:1.5px solid var(--border);
  border-radius:var(--r-2xl);cursor:pointer;width:100%;
  font-size:14px;color:var(--ink4);transition:all .2s;
}
.search-bar:hover{border-color:var(--orange);background:var(--orange-pale);}

.skeleton{
  background:linear-gradient(90deg,var(--surface3) 25%,var(--border) 50%,var(--surface3) 75%);
  background-size:200% 100%;animation:shimmer 1.6s ease-in-out infinite;
  border-radius:var(--r-md);
}

.spinner{width:28px;height:28px;border:2.5px solid var(--border);border-top-color:var(--orange);border-radius:50%;animation:spin .7s linear infinite;}
.spinner-wrap{display:flex;align-items:center;justify-content:center;padding:48px;}

.toast{
  position:fixed;top:20px;left:50%;transform:translateX(-50%);
  padding:12px 20px;border-radius:var(--r-lg);font-size:13px;font-weight:600;
  z-index:9999;white-space:nowrap;
  animation:slideDown .3s cubic-bezier(.34,1.56,.64,1) forwards;
  display:flex;align-items:center;gap:8px;backdrop-filter:blur(16px);
  box-shadow:var(--shadow-lg);
}
.toast-success{background:rgba(20,83,45,.95);color:#86efac;border:1px solid rgba(134,239,172,.2);}
.toast-error{background:rgba(127,29,29,.95);color:#fca5a5;border:1px solid rgba(252,165,165,.2);}

.splash{
  position:fixed;inset:0;background:var(--orange);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  z-index:9999;gap:0;
}
.splash.out{animation:fadeIn .4s reverse forwards;pointer-events:none;}
.splash-logo{
  width:80px;height:80px;border-radius:22px;background:white;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 20px 48px rgba(0,0,0,.15);margin-bottom:24px;
  animation:scaleIn .6s cubic-bezier(.34,1.56,.64,1) forwards;
}
.splash-title{font-size:36px;font-weight:800;color:white;letter-spacing:-.03em;animation:fadeUp .5s .2s both;}
.splash-sub{font-size:13px;color:rgba(255,255,255,.75);font-weight:500;animation:fadeUp .5s .35s both;margin-top:4px;}
.splash-bar{width:60px;height:3px;background:rgba(255,255,255,.25);border-radius:3px;margin-top:52px;overflow:hidden;animation:fadeIn .3s .5s both;}
.splash-progress{height:100%;background:white;border-radius:3px;animation:shimmer 1.5s ease-out forwards;background-size:200% 100%;}

.auth-page{min-height:100dvh;background:var(--bg);display:flex;flex-direction:column;}
.auth-hero{background:var(--orange);padding:52px 28px 44px;position:relative;overflow:hidden;}
.auth-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,.08);border-radius:50%;}
.auth-hero::after{content:'';position:absolute;bottom:-60px;left:-30px;width:160px;height:160px;background:rgba(255,255,255,.06);border-radius:50%;}
.auth-body{flex:1;background:var(--surface);border-radius:28px 28px 0 0;margin-top:-20px;padding:32px 24px 48px;}
.auth-logo-circle{width:72px;height:72px;border-radius:18px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.12);margin-bottom:16px;}
.auth-title{font-size:28px;font-weight:800;color:white;letter-spacing:-.03em;}
.auth-sub{font-size:14px;color:rgba(255,255,255,.75);margin-top:4px;}
.divider-or{display:flex;align-items:center;gap:12px;margin:20px 0;}
.divider-or::before,.divider-or::after{content:'';flex:1;height:1px;background:var(--border);}
.divider-or span{font-size:12px;color:var(--ink4);font-weight:600;}

.role-card{
  display:flex;align-items:center;gap:16px;padding:20px;
  border-radius:var(--r-xl);border:2px solid var(--border);
  background:var(--surface);cursor:pointer;text-align:left;
  transition:all .2s;animation:fadeUp .4s both;
}
.role-card:hover{border-color:var(--orange-light);}
.role-card.selected{border-color:var(--orange);background:var(--orange-pale);}
.role-icon{width:60px;height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

.home-banner{
  margin:16px 20px;border-radius:var(--r-2xl);padding:24px 22px;
  background:var(--orange);color:white;position:relative;overflow:hidden;
}
.home-banner::before{content:'Tindahub';position:absolute;right:-10px;bottom:-20px;font-size:72px;font-weight:800;color:rgba(255,255,255,.08);line-height:1;pointer-events:none;}
.category-chip{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:12px 14px;border-radius:var(--r-xl);border:1.5px solid var(--border);
  background:var(--surface);cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1);
  white-space:nowrap;flex-shrink:0;min-width:74px;
}
.category-chip:hover,.category-chip.active{border-color:var(--orange);background:var(--orange-pale);transform:translateY(-2px);}
.cat-img{width:48px;height:48px;border-radius:12px;overflow:hidden;background:var(--surface3);display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.cat-img img{width:100%;height:100%;object-fit:cover;}
.category-chip:hover .cat-img,.category-chip.active .cat-img{transform:scale(1.08) rotate(-3deg);}
.cat-label{font-size:10px;font-weight:700;color:var(--ink3);}
.category-chip.active .cat-label{color:var(--orange-dark);}
.prod-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.section-title{font-size:16px;font-weight:800;color:var(--ink);}
.see-all{color:var(--orange);font-size:13px;font-weight:700;background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:var(--r-md);}
.see-all:hover{background:var(--orange-pale);}
.impact-banner{
  display:flex;align-items:center;gap:12px;padding:14px 16px;
  background:var(--green-light);border-radius:var(--r-xl);margin:4px 0 16px;
  border:1px solid rgba(34,197,94,.2);
}
.proximity-toggle{display:flex;align-items:center;gap:10px;padding:14px 20px;background:var(--surface);border-bottom:1px solid var(--border);}
.toggle-switch{width:44px;height:24px;border-radius:12px;background:var(--border2);cursor:pointer;position:relative;transition:background .2s;border:none;flex-shrink:0;}
.toggle-switch.on{background:var(--orange);}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
.toggle-switch.on .toggle-thumb{left:23px;}

.prod-detail-header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;}
.qty-ctrl{display:flex;align-items:center;background:var(--surface3);border-radius:var(--r-lg);overflow:hidden;border:1.5px solid var(--border);}
.qty-btn{width:40px;height:40px;border:none;background:transparent;cursor:pointer;font-size:20px;color:var(--orange);display:flex;align-items:center;justify-content:center;transition:background .15s;}
.qty-btn:hover{background:var(--orange-pale);}
.qty-val{width:32px;text-align:center;font-weight:800;font-size:14px;}
.spec-chip{background:var(--surface3);border-radius:var(--r-md);padding:10px 14px;text-align:center;}
.local-impact{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:var(--r-xl);padding:18px;border:1px solid rgba(34,197,94,.2);margin:16px 0;}

.cart-item{display:flex;gap:12px;padding:14px;background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);transition:box-shadow .2s;animation:fadeUp .3s both;}
.cart-item:hover{box-shadow:var(--shadow-sm);}

/* ── CHECKOUT STEPS (Image 1 style) ── */
.checkout-steps{display:flex;align-items:center;padding:14px 20px;background:var(--surface);border-bottom:1px solid var(--border);}
.cstep{display:flex;align-items:center;gap:6px;flex:1;}
.cstep-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .3s;}
.cstep-circle.done{background:var(--green);color:white;}
.cstep-circle.active{background:var(--orange);color:white;}
.cstep-circle.pending{background:var(--surface3);color:var(--ink4);}
.cstep-label{font-size:11px;font-weight:600;color:var(--ink3);}
.cstep.active .cstep-label{color:var(--orange);font-weight:700;}
.cstep.done .cstep-label{color:var(--green);}
.cstep-line{flex:1;height:2px;background:var(--border);border-radius:2px;transition:background .3s;}
.cstep-line.done{background:var(--green);}

.step-indicator{display:flex;align-items:center;padding:16px 20px 0;}
.step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;transition:all .3s;}
.step-dot.done{background:var(--orange);color:white;box-shadow:0 4px 12px rgba(249,115,22,.3);}
.step-dot.active{background:var(--orange);color:white;box-shadow:0 4px 12px rgba(249,115,22,.3);}
.step-dot.pending{background:var(--surface3);color:var(--ink4);}
.step-line{flex:1;height:2px;border-radius:2px;background:var(--border);margin:0 4px;transition:background .4s;}
.step-line.done{background:var(--orange);}
.pay-opt{display:flex;align-items:center;gap:14px;padding:16px;border-radius:var(--r-xl);border:2px solid var(--border);background:var(--surface);cursor:pointer;transition:all .2s;}
.pay-opt.selected{border-color:var(--orange);background:var(--orange-pale);}
.pay-opt:hover:not(.selected){border-color:var(--orange-light);}
.pay-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color .2s;}
.pay-opt.selected .pay-radio{border-color:var(--orange);}
.pay-radio-inner{width:8px;height:8px;border-radius:50%;background:var(--orange);opacity:0;transition:opacity .2s;}
.pay-opt.selected .pay-radio-inner{opacity:1;}
.addr-opt{padding:16px;border-radius:var(--r-xl);border:2px solid var(--border);cursor:pointer;transition:all .2s;margin-bottom:10px;}
.addr-opt.selected{border-color:var(--orange);background:var(--orange-pale);}

.order-success-hero{background:var(--orange);padding:52px 24px 68px;text-align:center;position:relative;overflow:hidden;}
.success-check{width:72px;height:72px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 24px rgba(0,0,0,.12);animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1) .1s both;}

.tracking-step{display:flex;gap:14px;align-items:flex-start;}
.tracking-dot{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .4s;}
.tracking-dot.done{background:var(--orange);color:white;}
.tracking-dot.active{background:var(--orange);color:white;position:relative;}
.tracking-dot.active::after{content:'';position:absolute;inset:-5px;border-radius:16px;border:2px solid var(--orange);animation:pulseRing 1.5s ease-out infinite;}
.tracking-dot.pending{background:var(--surface3);color:var(--ink4);}
.tracking-line{width:2px;height:28px;border-radius:2px;background:var(--border);margin:4px 0 0 18px;transition:background .4s;}
.tracking-line.done{background:var(--orange);}

.wallet-card{border-radius:var(--r-2xl);padding:28px 24px;background:var(--orange);color:white;position:relative;overflow:hidden;}
.wallet-card::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,.08);border-radius:50%;}
.wallet-card::after{content:'';position:absolute;bottom:-50px;left:-30px;width:160px;height:160px;background:rgba(255,255,255,.06);border-radius:50%;}

.profile-avatar{width:80px;height:80px;border-radius:20px;overflow:hidden;background:var(--orange-pale);display:flex;align-items:center;justify-content:center;border:3px solid var(--orange-light);}
.menu-row{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);cursor:pointer;transition:all .18s;margin-bottom:8px;}
.menu-row:hover{transform:translateX(3px);border-color:var(--orange-light);}

.stat-card{background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);padding:16px 18px;transition:all .22s;}
.stat-card:hover{box-shadow:var(--shadow-md);transform:translateY(-3px);}
.stat-val{font-size:22px;font-weight:800;color:var(--ink);margin:6px 0 2px;}
.stat-lbl{font-size:11px;font-weight:600;color:var(--ink4);text-transform:uppercase;letter-spacing:.06em;}
.tab-strip{display:flex;gap:0;border-bottom:1.5px solid var(--border);margin-top:14px;}
.tab-btn{padding:10px 16px;border:none;background:none;font-size:13px;font-weight:700;color:var(--ink3);cursor:pointer;position:relative;transition:color .2s;}
.tab-btn.active{color:var(--orange);}
.tab-btn.active::after{content:'';position:absolute;bottom:-1.5px;left:0;right:0;height:2.5px;background:var(--orange);border-radius:2px 2px 0 0;}
.prod-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);transition:all .2s;animation:fadeUp .3s both;}
.prod-row:hover{box-shadow:var(--shadow-sm);transform:translateX(3px);}

.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;text-align:center;gap:12px;}
.empty-icon{font-size:56px;animation:bounce 3s ease-in-out infinite;}
.map-placeholder{background:var(--surface3);border-radius:var(--r-xl);height:200px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);overflow:hidden;}
.float-bar{position:fixed;bottom:72px;left:0;right:0;background:rgba(255,255,255,.97);backdrop-filter:blur(16px);border-top:1px solid var(--border);padding:14px 20px;z-index:40;}
.switch-wrap{width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;border:none;outline:none;}
.switch-thumb{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:white;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}

/* ── Profile Page ── */
.profile-page-wrap{max-width:480px;margin:0 auto;padding:20px 20px;}
.profile-menu-section{width:100%;}

/* ── Avatar Upload ── */
.avatar-upload-wrap{position:relative;width:90px;height:90px;flex-shrink:0;}
.avatar-upload-btn{
  position:absolute;bottom:-4px;right:-4px;width:28px;height:28px;
  border-radius:50%;background:var(--orange);border:2px solid white;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 2px 8px rgba(249,115,22,.4);transition:transform .2s;
}
.avatar-upload-btn:hover{transform:scale(1.1);}
.avatar-upload-btn input{display:none;}

/* ── Settings Page (Image 3 style) ── */
.settings-section{margin-bottom:24px;}
.settings-section-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;padding:0 4px;}
.settings-group{background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);overflow:hidden;}
.settings-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:15px 16px;border-bottom:1px solid var(--border);
  cursor:pointer;transition:background .15s;
}
.settings-row:last-child{border-bottom:none;}
.settings-row:hover{background:var(--surface2);}
.settings-row-left{display:flex;align-items:center;gap:12px;}
.settings-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.settings-row-info p{font-size:14px;font-weight:500;color:var(--ink);}
.settings-row-info span{font-size:12px;color:var(--ink3);}
.settings-chevron{color:var(--ink4);}
.settings-value{font-size:13px;color:var(--ink3);font-weight:500;}

/* ── Star Rating ── */
.star-btn{background:none;border:none;cursor:pointer;font-size:28px;padding:2px;transition:transform .15s;}
.star-btn:hover{transform:scale(1.2);}

/* ── Review Card ── */
.review-card{background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);padding:14px;margin-bottom:10px;animation:fadeUp .3s both;}

/* ── Cart: Image 2 style ── */
.cart-summary-box{background:var(--surface);border-radius:var(--r-xl);border:1px solid var(--border);padding:18px;}
.support-local-banner{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:var(--r-xl);padding:16px;border:1px solid rgba(34,197,94,.2);margin-top:14px;}

/* ── Secure badge ── */
.secure-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--ink3);background:var(--surface3);padding:5px 10px;border-radius:var(--r-pill);}

/* ── Local discount chip ── */
.local-discount-chip{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--green-light);border-radius:var(--r-md);border:1px solid rgba(34,197,94,.2);margin-bottom:6px;}
`;

const fmt = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
const disc = (p, op) => op && op > p ? Math.round((1 - p / op) * 100) : 0;

async function fetchOrderItems(orderIds, storeProductIds) {
  if (!orderIds || orderIds.length === 0) return {};
  const { data: direct, error: err1 } = await supabase
    .from("order_items")
    .select("id,order_id,product_id,product_name,product_image,unit_price,quantity,subtotal")
    .in("order_id", orderIds);
  if (!err1 && direct && direct.length > 0) {
    const map = {};
    direct.forEach(item => {
      if (!map[item.order_id]) map[item.order_id] = [];
      map[item.order_id].push(item);
    });
    return map;
  }
  if (storeProductIds && storeProductIds.length > 0) {
    const { data: byProduct } = await supabase
      .from("order_items")
      .select("id,order_id,product_id,product_name,product_image,unit_price,quantity,subtotal")
      .in("product_id", storeProductIds)
      .in("order_id", orderIds);
    if (byProduct && byProduct.length > 0) {
      const map = {};
      byProduct.forEach(item => {
        if (!map[item.order_id]) map[item.order_id] = [];
        map[item.order_id].push(item);
      });
      return map;
    }
  }
  const { data: ordersWithItems } = await supabase
    .from("orders")
    .select("id, order_items(id,order_id,product_id,product_name,product_image,unit_price,quantity,subtotal)")
    .in("id", orderIds);
  if (ordersWithItems) {
    const map = {};
    ordersWithItems.forEach(o => {
      if (o.order_items && o.order_items.length > 0) {
        map[o.id] = o.order_items.map(i => ({ ...i, order_id: o.id }));
      }
    });
    if (Object.keys(map).length > 0) return map;
  }
  return {};
}

// ── SHOP / PUBLIC STORE PAGE ─────────────────────────────────────────────────
function ShopScreen({ params, navigate, showToast }) {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storeId = params?.storeId || params?.id;
      if (!storeId) { setLoading(false); return; }
      const { data: s } = await supabase.from("stores").select("*, owner:profiles(id,full_name,avatar_url)").eq("id", storeId).maybeSingle();
      const { data: prods } = await supabase.from("products").select("*,images:product_images(url,is_primary)").eq("store_id", storeId).eq("is_active", true).order("created_at", { ascending: false });
      setStore(s);
      setProducts(prods || []);
      setLoading(false);
    })();
  }, [params?.storeId, params?.id]);

  if (loading) return <Spinner />;
  if (!store) return <EmptyState icon="🏪" title="Store not found" desc="This shop may no longer be available." action={<button className="btn btn-primary" onClick={() => navigate("home")}>Back to Home</button>} />;

  return (
    <div style={{ paddingBottom: 120 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, overflow: "hidden", background: "var(--surface3)" }}>
            {store.logo_url ? <img src={store.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 28 }}>{(store.name||"S")[0]}</div>}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{store.name}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink3)" }}>{store.city}{store.province ? ` · ${store.province}` : ""}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {products.length === 0 ? <EmptyState icon="📦" title="No products" desc="This shop hasn't listed any products yet." /> : (
          <div className="prod-grid">
            {products.map((p, i) => <ProductCard key={p.id} product={{ ...p, image_url: p.images?.find(x=>x.is_primary)?.url || p.images?.[0]?.url || p.image_url, store: { id: store.id, name: store.name, city: store.city } }} onClick={() => navigate("product", { id: p.id })} delay={i * .03} />)}
          </div>
        )}
      </div>
    </div>
  );
}


function Img({ src, alt, style, className }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface3)", ...style }} className={className}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    </div>
  );
  return <img src={src} alt={alt || ""} style={style} className={className} onError={() => setErr(true)} loading="lazy" />;
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{type === "success" ? "✓" : "✕"} {message}</div>;
}

function Spinner() { return <div className="spinner-wrap"><div className="spinner" /></div>; }

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
      <p style={{ color: "var(--ink3)", fontSize: 13, maxWidth: 240, lineHeight: 1.6 }}>{desc}</p>
      {action}
    </div>
  );
}

// ── NAV AVATAR ──────────────────────────────────────────────────────────────
function NavAvatar({ user, profile, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const avatarUrl = profile?.avatar_url;
  const initials = (profile?.full_name || user?.email || "U")[0].toUpperCase();
  return (
    <button className="nav-avatar" onClick={onClick} title="My Account">
      {avatarUrl && !imgErr
        ? <img src={avatarUrl} alt="Profile" onError={() => setImgErr(true)} />
        : <span className="nav-avatar-initials">{initials}</span>}
    </button>
  );
}

// ── AVATAR UPLOAD COMPONENT ─────────────────────────────────────────────────
function AvatarUpload({ profile, onUpload, uploading }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = (profile?.full_name || profile?.email || "U")[0].toUpperCase();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    onUpload(file);
  };

  return (
    <div className="avatar-upload-wrap">
      <div style={{ width: 90, height: 90, borderRadius: 20, overflow: "hidden", background: "var(--orange-pale)", border: "3px solid var(--orange-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {profile?.avatar_url && !imgErr
          ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} alt="Avatar" />
          : <span style={{ fontWeight: 800, fontSize: 30, color: "var(--orange)" }}>{initials}</span>}
      </div>
      <label className="avatar-upload-btn" title="Change photo">
        {uploading
          ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}

// ── SPLASH ──────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => { setTimeout(() => { setOut(true); setTimeout(onDone, 400); }, 2400); }, []);
  return (
    <div className={`splash${out ? " out" : ""}`}>
      <div className="splash-logo">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M8 14h28v20a4 4 0 01-4 4H12a4 4 0 01-4-4V14z" fill="#F97316"/>
          <path d="M6 10a2 2 0 012-2h28a2 2 0 012 2v4H6v-4z" fill="#EA580C"/>
          <path d="M16 10V7a2 2 0 014 0v3M24 10V7a2 2 0 014 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 26l3 3 7-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="splash-title">Tindahub</div>
      <div className="splash-sub">Buy & Sell Locally</div>
      <div className="splash-bar"><div className="splash-progress" /></div>
    </div>
  );
}

// ── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ navigate, showToast }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) showToast(error.message, "error");
    else { showToast("Welcome back!", "success"); navigate("home"); }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-logo-circle" style={{ position: "relative", zIndex: 1 }}>
          <svg width="38" height="38" viewBox="0 0 44 44" fill="none">
            <path d="M8 14h28v20a4 4 0 01-4 4H12a4 4 0 01-4-4V14z" fill="#F97316"/>
            <path d="M6 10a2 2 0 012-2h28a2 2 0 012 2v4H6v-4z" fill="#EA580C"/>
            <path d="M14 26l3 3 7-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="auth-title" style={{ position: "relative", zIndex: 1 }}>Welcome back</h1>
        <p className="auth-sub" style={{ position: "relative", zIndex: 1 }}>Log in to your local marketplace</p>
      </div>
      <div className="auth-body">
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input className="input" type={showPw ? "text" : "password"} placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} required style={{ paddingRight: 56 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--ink3)" }}>{showPw ? "HIDE" : "SHOW"}</button>
            </div>
          </div>
          <button type="button" style={{ alignSelf: "flex-end", color: "var(--orange)", fontSize: 13, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Forgot Password?</button>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>{loading ? "Signing in..." : "Log In"}</button>
        </form>
        <div className="divider-or"><span>or continue with</span></div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ label: "Google", icon: "G" }, { label: "Apple", icon: "A" }].map(p => (
            <button key={p.label} className="btn btn-outline" style={{ flex: 1 }}>
              <span style={{ fontWeight: 800 }}>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--ink3)" }}>
          Don't have an account?{" "}
          <button onClick={() => navigate("signup")} style={{ color: "var(--orange)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Sign Up</button>
        </p>
      </div>
    </div>
  );
}

// ── SIGNUP ──────────────────────────────────────────────────────────────────
function SignupScreen({ navigate, showToast }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) { showToast(error.message, "error"); setLoading(false); return; }
    if (data?.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email: form.email, full_name: form.name, phone: form.phone });
    }
    setLoading(false);
    navigate("onboarding");
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-logo-circle" style={{ position: "relative", zIndex: 1 }}>
          <svg width="38" height="38" viewBox="0 0 44 44" fill="none">
            <path d="M8 14h28v20a4 4 0 01-4 4H12a4 4 0 01-4-4V14z" fill="#F97316"/>
            <path d="M6 10a2 2 0 012-2h28a2 2 0 012 2v4H6v-4z" fill="#EA580C"/>
          </svg>
        </div>
        <h1 className="auth-title" style={{ position: "relative", zIndex: 1 }}>Create Account</h1>
        <p className="auth-sub" style={{ position: "relative", zIndex: 1 }}>Join your local marketplace today</p>
      </div>
      <div className="auth-body">
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { k: "name", label: "Full Name", type: "text", ph: "Juan dela Cruz" },
            { k: "phone", label: "Phone Number", type: "tel", ph: "+63 (000) 000-0000" },
            { k: "email", label: "Email Address", type: "email", ph: "juan@email.com" },
            { k: "password", label: "Password", type: "password", ph: "Min. 8 characters" },
          ].map(f => (
            <div key={f.k}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input className="input" type={f.type} placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} required />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>{loading ? "Creating account..." : "Sign Up"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--ink3)" }}>
          Already have an account?{" "}
          <button onClick={() => navigate("login")} style={{ color: "var(--orange)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Login</button>
        </p>
      </div>
    </div>
  );
}

// ── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingScreen({ navigate, showToast }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handle = async () => {
    if (!role) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ role }).eq("id", user.id);
      if (role === "seller") {
        await supabase.from("stores").insert({ owner_id: user.id, name: "My Store", slug: `store-${user.id.slice(0, 8)}` });
      }
    }
    setLoading(false);
    navigate(role === "seller" ? "seller-dashboard" : "home");
  };

  const roles = [
    { r: "buyer", title: "I want to Shop", desc: "Browse and buy handcrafted local products from verified Filipino sellers.", bg: "#FFF7ED", imgBg: "#FED7AA", emoji: "🛍️" },
    { r: "seller", title: "I want to Sell", desc: "Set up your store, list products, and reach thousands of local buyers.", bg: "#F0FDF4", imgBg: "#BBF7D0", emoji: "🏪" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="logo">Tinda<span>hub</span></span>
        <button onClick={() => navigate("home")} style={{ color: "var(--ink3)", fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>SKIP</button>
      </div>
      {step === 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ background: "var(--orange-pale)", borderRadius: 20, overflow: "hidden", marginBottom: 24, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 80 }}>🏪</div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Verified Local Sellers</h2>
          <p style={{ color: "var(--ink3)", lineHeight: 1.7, marginBottom: 28 }}>Everything you need, delivered. Support local businesses and get your favorite local products.</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep(1)}>Get Started →</button>
        </div>
      )}
      {step === 1 && (
        <div style={{ padding: "10px 20px 0", flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>How will you use Tindahub?</h2>
          <p style={{ color: "var(--ink3)", fontSize: 14, marginBottom: 24 }}>Choose your role in the marketplace</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
            {roles.map((opt, i) => (
              <button key={opt.r} className={`role-card${role === opt.r ? " selected" : ""}`} onClick={() => setRole(opt.r)} style={{ animationDelay: `${i * .1}s` }}>
                <div className="role-icon" style={{ background: opt.imgBg, fontSize: 28 }}>{opt.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{opt.title}</p>
                  <p style={{ color: "var(--ink3)", fontSize: 13, lineHeight: 1.5 }}>{opt.desc}</p>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${role === opt.r ? "var(--orange)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {role === opt.r && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--orange)" }} />}
                </div>
              </button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handle} disabled={!role || loading}>{loading ? "Setting up..." : "Continue →"}</button>
        </div>
      )}
    </div>
  );
}

// ── HOME ────────────────────────────────────────────────────────────────────
const CAT_IMAGES = {
  FOO: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&q=80",
  FRE: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80",
  ART: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=200&q=80",
  HOM: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&q=80",
  FAS: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80",
  HEA: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=200&q=80",
  BAK: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
  DAI: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80",
};

function HomeScreen({ navigate, showToast, user, profile }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selCat, setSelCat] = useState(null);
  const [favs, setFavs] = useState([]);
  const [proximity, setProximity] = useState(false);
  const [savings] = useState(Math.floor(Math.random() * 5) + 1);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("*,store:stores(id,name,slug,is_verified,city),images:product_images(url,is_primary)").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setLoading(false);
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const { data: ws } = await supabase.from("wishlists").select("product_id").eq("user_id", u.id);
        setFavs(ws?.map(w => w.product_id) || []);
      }
    })();
  }, []);

  const filtered = selCat ? products.filter(p => p.category_id === selCat) : products;
  const featured = products.filter(p => p.is_featured).slice(0, 6);
  const getImg = (p) => p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || p.image_url;

  const toggleFav = async (productId) => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { showToast("Please login first", "error"); return; }
    if (favs.includes(productId)) {
      await supabase.from("wishlists").delete().eq("user_id", u.id).eq("product_id", productId);
      setFavs(f => f.filter(x => x !== productId));
    } else {
      await supabase.from("wishlists").insert({ user_id: u.id, product_id: productId });
      setFavs(f => [...f, productId]);
    }
  };

  return (
    <div style={{ paddingBottom: 0 }}>
      <div className="top-bar">
        <div>
          <span className="logo">Tinda<span>hub</span></span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 500 }}>Northern Mindanao</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("search")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <button onClick={() => navigate("cart")} style={{ position: "relative", background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </button>
          <NavAvatar user={user} profile={profile} onClick={() => navigate("profile")} />
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        <button className="search-bar" onClick={() => navigate("search")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Search for local goods...
          <span style={{ marginLeft: "auto" }}><span className="badge badge-orange">Search</span></span>
        </button>
      </div>

      <div className="proximity-toggle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Within 5km of you</span>
        <button className="switch-wrap" onClick={() => setProximity(!proximity)} style={{ background: proximity ? "var(--orange)" : "var(--border2)" }}>
          <div className="switch-thumb" style={{ left: proximity ? 23 : 3 }} />
        </button>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div className="impact-banner" style={{ marginTop: 12 }}>
          <div style={{ width: 36, height: 36, background: "var(--green)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🌿</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 1 }}>Community Impact</p>
            <p style={{ fontSize: 12, color: "#15803d" }}>You've saved {savings}.{Math.floor(Math.random() * 9)}kg CO₂ this month by buying local.</p>
          </div>
        </div>

        {!loading && categories.length > 0 && (
          <>
            <div className="section-head">
              <span className="section-title">Categories</span>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, margin: "0 -20px", padding: "0 20px 12px" }} className="hs">
              {categories.map((cat, i) => {
                const code = (cat.code || cat.name || "").slice(0, 3).toUpperCase();
                const img = cat.image_url || CAT_IMAGES[code] || CAT_IMAGES.FOO;
                return (
                  <button key={cat.id} className={`category-chip${selCat === cat.id ? " active" : ""}`} onClick={() => setSelCat(selCat === cat.id ? null : cat.id)} style={{ animationDelay: `${i * .04}s` }}>
                    <div className="cat-img"><img src={img} alt={cat.name} /></div>
                    <span className="cat-label">{cat.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="home-banner">
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="badge" style={{ background: "rgba(255,255,255,.2)", color: "white", marginBottom: 8, display: "inline-flex" }}>COMMUNITY MARKET</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6, lineHeight: 1.2 }}>Fresh Local Finds Near You</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginBottom: 16 }}>Discover handcrafted goods from your Filipino community</p>
            <button onClick={() => navigate("search")} style={{ background: "white", color: "var(--orange)", border: "none", borderRadius: "var(--r-pill)", padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Explore Now →</button>
          </div>
        </div>

        {loading ? (
          <div className="prod-grid" style={{ marginTop: 16 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card" style={{ overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 12 }}>
                  <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && !selCat && (
              <>
                <div className="section-head" style={{ marginTop: 20 }}>
                  <span className="section-title">Fresh Discoveries</span>
                  <button className="see-all" onClick={() => navigate("search")}>See All →</button>
                </div>
                <div className="prod-grid">
                  {featured.map((p, i) => (
                    <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={toggleFav} onClick={() => navigate("product", { id: p.id })} delay={i * .05} />
                  ))}
                </div>
              </>
            )}
            <div className="section-head" style={{ marginTop: 20 }}>
              <span className="section-title">{selCat ? categories.find(c => c.id === selCat)?.name : "Available Nearby"}</span>
              <button className="see-all" onClick={() => navigate("search")}>See All →</button>
            </div>
            {filtered.length === 0
              ? <EmptyState icon="🔍" title="No products found" desc="Try a different category" />
              : (
                <div className="prod-grid">
                  {filtered.map((p, i) => (
                    <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={toggleFav} onClick={() => navigate("product", { id: p.id })} delay={i * .04} />
                  ))}
                </div>
              )}
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
          {[["1,200+", "Sellers", "#FFF7ED"], ["48k+", "Buyers", "#F0FDF4"], ["₱12M+", "Sales", "#EFF6FF"]].map(([v, l, bg]) => (
            <div key={l} style={{ background: bg, borderRadius: 16, padding: "14px 12px", textAlign: "center", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 2 }}>{v}</p>
              <p style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</p>
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
  const outOfStock = p.stock !== undefined && p.stock <= 0;

  const handleFav = (e) => {
    e.stopPropagation();
    setPopped(true);
    onFav(p.id);
    setTimeout(() => setPopped(false), 400);
  };

  return (
    <div onClick={outOfStock ? undefined : onClick} className={`card${outOfStock ? "" : " clickable"}`} style={{ animationDelay: `${delay}s`, overflow: "hidden", opacity: outOfStock ? 0.75 : 1, cursor: outOfStock ? "default" : "pointer" }}>
      <div className="prod-img">
        <Img src={p.image_url} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        {outOfStock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-xl) var(--r-xl) 0 0" }}>
            <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>OUT OF STOCK</span>
          </div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          {p.is_organic && !outOfStock && <span className="badge badge-green">Organic</span>}
          {d > 0 && !outOfStock && <span className="badge badge-red">{d}% OFF</span>}
        </div>
        {p.stock !== undefined && p.stock > 0 && (
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", borderRadius: "var(--r-pill)", padding: "3px 8px" }}>
            <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{p.stock} left</span>
          </div>
        )}
        {!outOfStock && (
          <button onClick={handleFav} className={`fav-btn${popped ? " popped" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "var(--red)" : "none"} stroke={isFav ? "var(--red)" : "var(--ink3)"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        )}
      </div>
      <div style={{ padding: "10px 12px 13px" }}>
        <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 3, fontWeight: 500 }}>{p.store?.name || "Local Seller"}</p>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 6 }}>{p.name}</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 7 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--yellow)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)" }}>{p.rating || "4.8"}</span>
          <span style={{ fontSize: 10, color: "var(--ink4)" }}>({p.review_count || 0})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "space-between" }}>
          {outOfStock
            ? <span style={{ fontWeight: 700, fontSize: 13, color: "var(--red)" }}>Out of Stock</span>
            : <span style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>{fmt(p.price)}</span>}
          {p.original_price && !outOfStock && <span style={{ fontSize: 11, color: "var(--ink4)", textDecoration: "line-through" }}>{fmt(p.original_price)}</span>}
        </div>
        {p.store?.city && <p style={{ fontSize: 10, color: "var(--ink4)", marginTop: 4 }}>📍 {p.store.city}</p>}
      </div>
    </div>
  );
}

// ── SEARCH ──────────────────────────────────────────────────────────────────
function SearchScreen({ navigate }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const debRef = useRef(null);

  const search = useCallback(async (query, f) => {
    setLoading(true);
    let req = supabase.from("products").select("*,store:stores(id,name,slug,is_verified,city),images:product_images(url,is_primary)").eq("is_active", true);
    if (query) req = req.ilike("name", `%${query}%`);
    if (f === "Organic") req = req.eq("is_organic", true);
    if (f === "Price ↑") req = req.order("price", { ascending: true });
    else if (f === "Price ↓") req = req.order("price", { ascending: false });
    else if (f === "Popular") req = req.order("sold_count", { ascending: false });
    else req = req.order("created_at", { ascending: false });
    const { data } = await req.limit(40);
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(q, filter), 280);
  }, [q, filter, search]);

  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);

  const getImg = (p) => p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || p.image_url;
  const filters = ["All", "Popular", "Organic", "Price ↑", "Price ↓"];

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: 0 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, stores..." autoFocus
              style={{ width: "100%", paddingLeft: 44, paddingRight: q ? 40 : 16, height: 48, borderRadius: "var(--r-2xl)", border: "1.5px solid var(--border)", fontSize: 14, outline: "none", background: "var(--surface)", transition: "border .2s" }}
              onFocus={e => e.target.style.borderColor = "var(--orange)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>✕</button>}
          </div>
        </div>
        {categories.length > 0 && !q && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }} className="hs">
            {categories.map(c => (
              <button key={c.id} onClick={() => setQ(c.name)} style={{ padding: "6px 14px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 600, border: "1.5px solid var(--border)", background: "var(--surface)", cursor: "pointer", whiteSpace: "nowrap", color: "var(--ink2)", transition: "all .2s" }}>
                {c.name}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12 }} className="hs">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", border: "1.5px solid", cursor: "pointer", background: filter === f ? "var(--orange)" : "transparent", color: filter === f ? "white" : "var(--ink3)", borderColor: filter === f ? "var(--orange)" : "var(--border)", transition: "all .2s", flexShrink: 0 }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px 24px" }}>
        {loading ? <Spinner /> : products.length === 0 ? (
          <EmptyState icon="🔍" title="No results" desc={q ? `No products matching "${q}"` : "Start typing to search"} />
        ) : (
          <>
            <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 14, fontWeight: 600 }}>{products.length} product{products.length !== 1 ? "s" : ""} found</p>
            <div className="prod-grid">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={{ ...p, image_url: getImg(p) }} favs={favs} onFav={id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])} onClick={() => {}} delay={i * .04} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PRODUCT DETAIL ──────────────────────────────────────────────────────────
function ProductScreen({ params, navigate, showToast }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selImg, setSelImg] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!params?.id) return;
    supabase.from("products").select("*,store:stores(id,name,slug,is_verified,city,logo_url),images:product_images(url,is_primary,sort_order),category:categories(name)").eq("id", params.id).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
    supabase.from("reviews").select("id,rating,comment,created_at,user:profiles(full_name,avatar_url)").eq("product_id", params.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setReviews(data || []));
  }, [params?.id]);

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login first", "error"); return; }
    setAdding(true);
    const { data: liveProduct } = await supabase.from("products").select("stock,is_active").eq("id", product.id).single();
    if (!liveProduct?.is_active || liveProduct?.stock < 1) {
      showToast("Sorry, this product is out of stock", "error");
      setProduct(p => ({ ...p, stock: 0 }));
      setAdding(false); return;
    }
    const { data: existing } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > liveProduct.stock) { showToast(`Only ${liveProduct.stock} left in stock`, "error"); setAdding(false); return; }
      await supabase.from("cart_items").update({ quantity: newQty }).eq("id", existing.id);
    } else {
      if (qty > liveProduct.stock) { showToast(`Only ${liveProduct.stock} left in stock`, "error"); setAdding(false); return; }
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty });
    }
    setAdding(false);
    showToast("Added to cart! 🛒", "success");
  };

  if (loading) return <Spinner />;
  if (!product) return <EmptyState icon="❌" title="Product not found" desc="This product may have been removed" />;

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const mainImg = images[selImg]?.url || images[0]?.url || product.image_url;
  const d = disc(product.price, product.original_price);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="prod-detail-header">
        <button onClick={() => navigate("home")} style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: "var(--surface3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Product Details</span>
        <button onClick={() => setFav(!fav)} style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: "var(--surface3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "var(--red)" : "none"} stroke={fav ? "var(--red)" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>

      <div style={{ position: "relative", paddingTop: "75%", background: "var(--surface3)", overflow: "hidden" }}>
        <Img src={mainImg} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        {d > 0 && <span className="badge badge-red" style={{ position: "absolute", top: 14, left: 14 }}>{d}% OFF</span>}
        {product.is_organic && <span className="badge badge-green" style={{ position: "absolute", top: d > 0 ? 40 : 14, left: 14 }}>Organic</span>}
        {product.store?.is_verified && (
          <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(255,255,255,.92)", borderRadius: "var(--r-pill)", padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--green)"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>Verified Local Seller</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 20px" }} className="hs">
          {images.map((img, i) => (
            <div key={i} onClick={() => setSelImg(i)} style={{ width: 64, height: 64, borderRadius: "var(--r-md)", overflow: "hidden", border: `2px solid ${i === selImg ? "var(--orange)" : "var(--border)"}`, cursor: "pointer", flexShrink: 0 }}>
              <Img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: "var(--orange-pale)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "var(--orange)" }}>
              {(product.store?.name || "S")[0]}
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{product.store?.name}</span>
              {product.store?.city && <span style={{ fontSize: 11, color: "var(--ink3)", marginLeft: 6 }}>· {product.store.city}</span>}
            </div>
            <button onClick={() => navigate("shop", { storeId: product.store?.id })} style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--orange)", background: "var(--orange-pale)", border: "1px solid var(--orange-light)", borderRadius: "var(--r-pill)", padding: "5px 12px", cursor: "pointer" }}>Visit Store</button>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{product.name}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "var(--orange)" }}>{fmt(product.price)}</span>
          {product.original_price && <span style={{ fontSize: 16, color: "var(--ink4)", textDecoration: "line-through" }}>{fmt(product.original_price)}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= Math.round(product.rating || 4) ? "var(--yellow)" : "var(--border)"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
            <span style={{ fontSize: 13, fontWeight: 700 }}>{product.rating || "4.0"}</span>
            <span style={{ fontSize: 12, color: "var(--ink3)" }}>({product.review_count || 0} reviews)</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--ink3)" }}>{product.sold_count || 0} sold</span>
          <span className={`badge ${product.stock > 0 ? "badge-green" : "badge-red"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {product.description && <p style={{ color: "var(--ink3)", lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>{product.description}</p>}

        <div className="local-impact">
          <p style={{ fontWeight: 700, fontSize: 14, color: "#166534", marginBottom: 6 }}>🌿 Local Impact</p>
          <p style={{ fontSize: 13, color: "#15803d", lineHeight: 1.6 }}>Every purchase supports local {product.store?.city || "Filipino"} families.</p>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Customer Reviews ({reviews.length})</h3>
            {reviews.slice(0, 3).map(r => (
              <div key={r.id} className="review-card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--orange-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>
                    {r.user?.avatar_url ? <img src={r.user.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} alt="" /> : (r.user?.full_name || "U")[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{r.user?.full_name || "Buyer"}</p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= r.rating ? "var(--yellow)" : "var(--border)"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--ink4)", marginLeft: "auto" }}>{new Date(r.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.5 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="float-bar" style={{ bottom: 72 }}>
        {product.stock > 0 ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button onClick={addToCart} disabled={adding} style={{ flex: 1, height: 48, background: "white", color: "var(--orange)", border: "2px solid var(--orange)", borderRadius: "var(--r-lg)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{adding ? "Adding..." : "Add to Cart"}</button>
            <button onClick={() => { addToCart().then(() => navigate("cart")); }} style={{ flex: 1, height: 48, background: "var(--orange)", color: "white", border: "none", borderRadius: "var(--r-lg)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Buy Now</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚫</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "var(--red)" }}>Out of Stock</p>
              <p style={{ fontSize: 12, color: "var(--ink3)" }}>This product is currently unavailable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CART (Image 2 style) ─────────────────────────────────────────────────────
function CartScreen({ navigate, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: cartData } = await supabase.from("cart_items").select("id,user_id,product_id,quantity,created_at").eq("user_id", user.id);
      const cartRows = cartData || [];
      const ids = [...new Set(cartRows.map(i => i.product_id).filter(Boolean))];
      let productMap = {};
      if (ids.length) {
        const { data: prods } = await supabase.from("products").select("id,name,price,original_price,stock,unit,images:product_images(url,is_primary)").in("id", ids);
        productMap = (prods || []).reduce((a, p) => ({ ...a, [p.id]: p }), {});
      }
      const mapped = cartRows.map(i => ({ ...i, product: productMap[i.product_id] || null }));
      setItems(mapped);
      setSelected(mapped.filter(i => (i.product?.stock ?? 1) > 0).map(i => i.id));
      setLoading(false);
    })();
  }, []);

  const getImg = (item) => item.product?.images?.find(i => i.is_primary)?.url || item.product?.images?.[0]?.url;
  const selItems = items.filter(i => selected.includes(i.id));
  const subtotal = selItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 0 ? 65 : 0;
  const localDiscount = subtotal > 500 ? 30 : 0;
  const total = subtotal + shipping - localDiscount;

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    const item = items.find(i => i.id === id);
    const maxStock = item?.product?.stock ?? Infinity;
    if (qty > maxStock) { showToast(`Only ${maxStock} left in stock`, "error"); return; }
    setItems(p => p.map(i => i.id === id ? { ...i, quantity: qty } : i));
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
  };

  const removeItem = async (id) => {
    setItems(p => p.filter(i => i.id !== id));
    setSelected(p => p.filter(i => i !== id));
    await supabase.from("cart_items").delete().eq("id", id);
    showToast("Item removed", "success");
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingBottom: 140 }}>
      <div className="top-bar">
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Your Cart {items.length > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: "var(--ink3)" }}>({items.length})</span>}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="secure-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🛒" title="Your cart is empty" desc="Add local products to get started" action={<button className="btn btn-primary" onClick={() => navigate("home")} style={{ marginTop: 8 }}>Browse Products</button>} />
      ) : (
        <div style={{ padding: "16px 20px" }}>
          {/* Local Sellers header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 12px", background: "var(--orange-pale)", borderRadius: "var(--r-lg)", border: "1px solid var(--orange-light)" }}>
            <span style={{ fontSize: 16 }}>🏪</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange-dark)" }}>LOCAL SELLERS</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <button onClick={() => setSelected(selected.length === items.length ? [] : items.map(i => i.id))} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink2)" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected.length === items.length ? "var(--orange)" : "var(--border2)"}`, background: selected.length === items.length ? "var(--orange)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected.length === items.length && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              Select All
            </button>
            <span style={{ fontSize: 12, color: "var(--ink3)" }}>{selected.length}/{items.length} selected</span>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="cart-item" style={{ marginBottom: 10, animationDelay: `${idx * .05}s`, opacity: item.product?.stock === 0 ? 0.6 : 1 }}>
              <button onClick={() => setSelected(p => p.includes(item.id) ? p.filter(x => x !== item.id) : [...p, item.id])} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, paddingTop: 2 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected.includes(item.id) ? "var(--orange)" : "var(--border2)"}`, background: selected.includes(item.id) ? "var(--orange)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected.includes(item.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
              <div style={{ width: 80, height: 80, borderRadius: "var(--r-lg)", overflow: "hidden", flexShrink: 0 }}>
                <Img src={getImg(item)} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.product?.name}</h4>
                  <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 13, flexShrink: 0 }}>✕</button>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--orange)", display: "block", marginTop: 2 }}>{fmt(item.product?.price)} <span style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 400 }}>· {item.product?.unit || "pc"}</span></span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                  <div className="qty-ctrl" style={{ height: 32 }}>
                    <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.product?.stock === 0}>−</button>
                    <span className="qty-val" style={{ fontSize: 12 }}>{item.quantity}</span>
                    <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.product?.stock === 0 || item.quantity >= (item.product?.stock ?? Infinity)}>+</button>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt((item.product?.price || 0) * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Order Summary - Image 2 style */}
          <div className="cart-summary-box" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--ink3)" }}>Subtotal ({selItems.length} items)</span>
              <span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--ink3)" }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? "var(--ink3)" : undefined }}>{subtotal > 0 ? fmt(shipping) : "—"}</span>
            </div>
            {localDiscount > 0 && (
              <div className="local-discount-chip">
                <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>🎉 Local Discount</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>-{fmt(localDiscount)}</span>
              </div>
            )}
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--orange)" }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Support Local Banner */}
          <div className="support-local-banner">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--green)" stroke="none" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 4 }}>Supporting Our Neighbors</p>
                <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>By completing this purchase, you're directly supporting local artisans in your community.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (() => {
        const outOfStockSelected = selItems.some(i => (i.product?.stock ?? 0) === 0);
        const overStockSelected = selItems.some(i => i.quantity > (i.product?.stock ?? Infinity));
        const hasIssue = outOfStockSelected || overStockSelected;
        return (
          <div className="float-bar" style={{ flexDirection: "column", gap: 8 }}>
            {hasIssue && (
              <div style={{ background: "var(--red-light)", borderRadius: "var(--r-md)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span>🚫</span>
                <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>Fix stock issues before checkout</p>
              </div>
            )}
            <button onClick={() => navigate("checkout")} disabled={selected.length === 0 || hasIssue} className="btn btn-primary" style={{ width: "100%" }}>
              {selected.length === 0 ? "Select items to checkout" : hasIssue ? "Fix issues first" : `Proceed to Checkout → ${fmt(total)}`}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

// ── CHECKOUT (Image 1 style) ─────────────────────────────────────────────────
function CheckoutScreen({ navigate, showToast, profile }) {
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("gcash");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selAddr, setSelAddr] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ full_name: "", phone: "", address_line: "", city: "", province: "", zip_code: "", label: "Home" });
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const subtotal = cartItems.reduce((s, i) => s + (i.product?.price || 0) * (Number(i.quantity) || 1), 0);
  const delivery = 65;
  const serviceFee = 15;
  const total = subtotal + delivery + serviceFee;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: addrs }, { data: cartData }, { data: profile }, { data: wallet }] = await Promise.all([
        supabase.from("delivery_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
        supabase.from("cart_items").select("id,product_id,quantity").eq("user_id", user.id),
        supabase.from("profiles").select("full_name,phone,address,city,province,zip_code").eq("id", user.id).maybeSingle(),
        supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
      ]);
      const rows = cartData || [];
      const ids = [...new Set(rows.map(i => i.product_id).filter(Boolean))];
      let productMap = {};
      if (ids.length) {
        const { data: prods } = await supabase.from("products").select("id,name,price,stock,store_id,images:product_images(url,is_primary)").in("id", ids);
        productMap = (prods || []).reduce((a, p) => ({ ...a, [p.id]: p }), {});
      }
      setCartItems(rows.map(i => ({ ...i, product: productMap[i.product_id] || null })));
      const list = addrs || [];
      setAddresses(list);
      const def = list.find(a => a.is_default) || list[0];
      setSelAddr(def?.id || null);
      if (wallet) setWalletBalance(Number(wallet.balance || 0));
      setProfileData(profile || null);
      if (!list.length && profile) {
        setAddrForm(prev => ({ ...prev, full_name: profile.full_name || "", phone: profile.phone || "", address_line: profile.address || "", city: profile.city || "", province: profile.province || "", zip_code: profile.zip_code || "" }));
        setShowAddrForm(true);
      }
    })();
  }, []);

  const placeOrder = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || cartItems.length === 0) { showToast("Something went wrong", "error"); setLoading(false); return; }
    const storeId = cartItems[0]?.product?.store_id;

    const orderItemsPayload = cartItems.map(i => ({
      product_id: i.product_id, product_name: i.product?.name || "",
      product_image: i.product?.images?.find(img => img.is_primary)?.url || i.product?.images?.[0]?.url || null,
      unit_price: Number(i.product?.price || 0), quantity: Math.max(1, Number(i.quantity) || 1),
    }));

    let deliveryAddressId = selAddr;
    if (!deliveryAddressId) {
      const addressPayload = {
        user_id: user.id,
        label: addrForm.label || "Home",
        full_name: addrForm.full_name,
        phone: addrForm.phone,
        address_line: addrForm.address_line,
        city: addrForm.city,
        province: addrForm.province,
        zip_code: addrForm.zip_code || "",
        is_default: true,
      };
      if (addressPayload.full_name && addressPayload.phone && addressPayload.address_line && addressPayload.city && addressPayload.province) {
        const { data: newAddr, error: addrError } = await supabase.from("delivery_addresses").insert(addressPayload).select().single();
        if (addrError || !newAddr) {
          showToast("Please save a shipping address first", "error");
          setLoading(false);
          return;
        }
        deliveryAddressId = newAddr.id;
        setSelAddr(newAddr.id);
        setAddresses(prev => [...prev, newAddr]);
      }
    }

    if (!deliveryAddressId) {
      showToast("Please select or enter a shipping address", "error");
      setLoading(false);
      return;
    }

    if (payment === "wallet") {
      const { data: walletOrderData, error: walletError } = await supabase.rpc("create_wallet_order", {
        store_id: storeId,
        delivery_address_id: deliveryAddressId,
        payment_method: payment,
        subtotal,
        delivery_fee: delivery,
        total,
        estimated_delivery: "30-45 mins",
        product_items: orderItemsPayload,
      });
      if (walletError || !walletOrderData?.length) {
        const msg = walletError?.message || "Failed to place wallet order";
        showToast(msg.includes("not found") ? "Wallet checkout is not deployed yet. Run the SQL function create_wallet_order in Supabase." : msg, "error");
        setLoading(false);
        return;
      }
      const walletOrder = walletOrderData[0];
      setLoading(false);
      navigate("order-confirmation", { orderId: walletOrder.order_id, orderNumber: walletOrder.order_number });
      return;
    }

    const { data: order, error } = await supabase.from("orders").insert({
      buyer_id: user.id, store_id: storeId, delivery_address_id: deliveryAddressId,
      payment_method: payment, payment_status: "unpaid", subtotal, delivery_fee: delivery, total, estimated_delivery: "30-45 mins",
    }).select().single();
    if (error || !order) { showToast("Failed to place order", "error"); setLoading(false); return; }
    const orderItemsPayloadWithOrder = orderItemsPayload.map(item => ({ ...item, order_id: order.id }));
    await supabase.from("order_items").insert(orderItemsPayloadWithOrder);
    await Promise.all(cartItems.map(i => supabase.from("products").update({ stock: Math.max(0, (i.product?.stock ?? 0) - Number(i.quantity || 0)) }).eq("id", i.product_id)));
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await supabase.from("order_status_history").insert({ order_id: order.id, status: "pending" });
    setLoading(false);
    navigate("order-confirmation", { orderId: order.id, orderNumber: order.order_number });
  };

  // Checkout steps header (Image 1)
  const steps = [
    { id: 1, label: "Shipping" },
    { id: 2, label: "Payment" },
    { id: 3, label: "Summary" },
  ];

  const payments = [
    { id: "gcash", name: "GCash", desc: "Pay instantly via GCash wallet", logo: "GC", rec: true },
    { id: "maya", name: "Maya", desc: "The all-in-one money app", logo: "MY" },
    { id: "wallet", name: "Tindahub Wallet", desc: walletBalance !== null ? `Pay using your balance (${fmt(walletBalance)} available)` : "Pay using your Tindahub balance", logo: "💳" },
    { id: "cod", name: "Cash on Delivery", desc: "Pay when your order arrives", logo: "💵" },
  ];

  const selAddrObj = addresses.find(a => a.id === selAddr);
  const mapAddress = selAddrObj
    ? `${selAddrObj.address_line}, ${selAddrObj.city}, ${selAddrObj.province} ${selAddrObj.zip_code}`.trim()
    : addrForm.address_line
      ? `${addrForm.address_line}, ${addrForm.city}, ${addrForm.province} ${addrForm.zip_code}`.trim()
      : profileData
        ? `${profileData.address}, ${profileData.city}, ${profileData.province} ${profileData.zip_code}`.trim()
        : null;
  const mapUrl = mapAddress ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed` : null;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="top-bar">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("cart")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Checkout</h2>
          <span className="secure-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure
          </span>
        </div>
        <span style={{ fontSize: 12, color: "var(--ink3)", fontWeight: 600 }}>Step {step} of 3</span>
      </div>

      {/* Step indicators (Image 1 style) */}
      <div className="checkout-steps">
        {steps.map((s, i) => (
          <div key={s.id} className={`cstep${step === s.id ? " active" : step > s.id ? " done" : ""}`} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div className={`cstep-circle${step > s.id ? " done" : step === s.id ? " active" : " pending"}`}>
              {step > s.id ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : s.id}
            </div>
            <span className="cstep-label" style={{ marginLeft: 6 }}>{s.label}</span>
            {i < steps.length - 1 && <div className={`cstep-line${step > s.id ? " done" : ""}`} style={{ marginLeft: 10, flex: 1 }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Step 1: Delivery Address */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Delivery Address</h3>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 16 }}>Where should we send your local finds?</p>

            <div style={{ background: "var(--surface3)", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: 16, minHeight: 160, position: "relative" }}>
              {mapUrl ? (
                <iframe
                  title="Delivery map"
                  src={mapUrl}
                  style={{ width: "100%", height: 220, border: 0 }}
                  loading="lazy"
                />
              ) : (
                <div style={{ padding: 20, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--ink3)" }}>
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 4 }}>📍</div>
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>Add your delivery address to preview the route</p>
                    <p style={{ fontSize: 13, color: "var(--ink3)" }}>Your selected address will appear here once you enter it.</p>
                  </div>
                </div>
              )}
            </div>
            {mapUrl && (
              <button className="btn btn-outline" style={{ width: "100%", marginBottom: 14 }} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`, "_blank")}>Open in Google Maps</button>
            )}

            {addresses.map(addr => (
              <div key={addr.id} className={`addr-opt${selAddr === addr.id ? " selected" : ""}`} onClick={() => { setSelAddr(addr.id); setShowAddrForm(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="badge badge-gray">{addr.label || "Home"}</span>
                  {addr.is_default && <span className="badge badge-orange">Default</span>}
                </div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{addr.full_name}</p>
                <p style={{ fontSize: 13, color: "var(--ink3)" }}>{addr.phone}</p>
                <p style={{ fontSize: 13, color: "var(--ink3)" }}>{addr.address_line}, {addr.city}, {addr.province}</p>
              </div>
            ))}

            <button className="btn btn-outline" onClick={() => setShowAddrForm(!showAddrForm)} style={{ width: "100%", marginBottom: 14 }}>+ Add New Address</button>

            {showAddrForm && (
              <div style={{ background: "var(--surface3)", borderRadius: "var(--r-xl)", padding: 16, marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["full_name", "Full Name"], ["phone", "Phone Number"], ["address_line", "Street Address"], ["city", "City"], ["province", "State / Province"], ["zip_code", "Zip Code"]].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 5 }}>{l}</label>
                    <input className="input" style={{ height: 44 }} value={addrForm[k]} onChange={e => setAddrForm(p => ({ ...p, [k]: e.target.value }))} placeholder={l} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 5 }}>Delivery Instructions (Optional)</label>
                  <textarea className="input" style={{ height: "auto", padding: "12px 14px" }} rows={2} placeholder="Gate code, drop at front door, etc." />
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep(2)}>Save & Continue →</button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Select Payment Method</h3>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 16 }}>Choose how you'd like to pay for your local treasures.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payments.map(m => (
                <div key={m.id} className={`pay-opt${payment === m.id ? " selected" : ""}`} onClick={() => setPayment(m.id)}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: payment === m.id ? "var(--orange)" : "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: payment === m.id ? "white" : "var(--ink3)", flexShrink: 0, transition: "all .2s" }}>{m.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</p>
                      {m.rec && <span className="badge badge-orange" style={{ fontSize: 9 }}>Recommended</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ink3)" }}>{m.desc}</p>
                  </div>
                  <div className="pay-radio"><div className="pay-radio-inner" /></div>
                </div>
              ))}
            </div>
            {payment === "wallet" && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: "var(--r-xl)", background: "var(--surface3)", border: "1px solid var(--border)" }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink3)" }}>Wallet balance: {walletBalance !== null ? fmt(walletBalance) : "Not available"}</p>
                <p style={{ margin: 6, fontSize: 12, color: walletBalance !== null && walletBalance < total ? "var(--red)" : "var(--ink3)" }}>
                  {walletBalance !== null && walletBalance < total ? "Top up your wallet to use it for this order." : "Your wallet will be debited automatically when the order is placed."}
                </p>
              </div>
            )}
            {/* Order summary sidebar (Image 1) */}
            <div className="cart-summary-box" style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Order Summary</p>
              {[["Subtotal (3 items)", fmt(subtotal)], ["Shipping Fee", fmt(delivery)], ["Tax (VAT inclusive)", fmt(serviceFee)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 13, color: "var(--ink3)" }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontWeight: 700 }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--orange)" }}>{fmt(total)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={() => setStep(3)}>Continue to Review →</button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Review Your Order</h3>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 14 }}>Check everything is correct before we notify the sellers.</p>

            {/* Items */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Local Sellers</span>
              </div>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface3)", flexShrink: 0 }}>
                    <Img src={item.product?.images?.find(i => i.is_primary)?.url || item.product?.images?.[0]?.url} alt={item.product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{item.product?.name}</p>
                    <p style={{ fontSize: 12, color: "var(--ink3)" }}>Qty: {item.quantity}</p>
                    <p style={{ fontWeight: 800, color: "var(--orange)", fontSize: 13 }}>{fmt((item.product?.price || 0) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            {selAddrObj && (
              <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>📍 Delivery Address</span>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                </div>
                <p style={{ fontWeight: 700 }}>{selAddrObj.full_name}</p>
                <p style={{ fontSize: 13, color: "var(--ink3)" }}>{selAddrObj.address_line}, {selAddrObj.city}, {selAddrObj.province}</p>
              </div>
            )}

            {/* Payment Summary (Image 1) */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Payment Summary</p>
              {[["Subtotal", fmt(subtotal)], ["Delivery Fee", fmt(delivery)], ["Service Fee", fmt(serviceFee)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "var(--ink3)" }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
              <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--orange)" }}>{fmt(total)}</span>
              </div>
              {/* Payment method shown */}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--surface3)", borderRadius: "var(--r-md)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{payments.find(p => p.id === payment)?.name}</span>
              </div>
            </div>

            {/* Support local */}
            <div className="support-local-banner" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--green)" stroke="none" style={{ flexShrink: 0 }}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 3 }}>Supporting Our Neighbors</p>
                  <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>By completing this purchase, you're directly supporting local artisans in your community.</p>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={placeOrder} disabled={loading}>{loading ? "Placing Order..." : `Place Order → ${fmt(total)}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ORDER CONFIRMATION ──────────────────────────────────────────────────────
function OrderConfirmScreen({ navigate, params }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="order-success-hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="success-check">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 8 }}>Thank You!</h2>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 14 }}>Your order has been placed successfully.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
            {[["ORDER ID", `#${params?.orderNumber || "TH-" + Math.floor(Math.random() * 90000 + 10000)}`], ["DELIVERY TIME", "30–45 mins"]].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,.12)", borderRadius: "var(--r-lg)", padding: "12px 14px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{l}</p>
                <p style={{ fontWeight: 800, color: "white", fontSize: 14 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 20px 0", marginTop: -20 }}>
        <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", boxShadow: "var(--shadow-lg)", padding: 22, marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Preparing your items</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--orange-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛍️</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Local Seller</p>
              <p style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>● Preparing your order</p>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginBottom: 10 }} onClick={() => navigate("order-tracking", params)}>Track Order →</button>
        <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => navigate("home")}>Return Home</button>
      </div>
    </div>
  );
}

// ── ORDERS ──────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E" },
  confirmed: { label: "Confirmed", bg: "#D1FAE5", color: "#064E3B" },
  preparing: { label: "Preparing", bg: "#DBEAFE", color: "#1E3A8A" },
  out_for_delivery: { label: "In Transit", bg: "#EDE9FE", color: "#4C1D95" },
  delivered: { label: "Delivered", bg: "#D1FAE5", color: "#064E3B" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#7F1D1D" },
};

function OrdersScreen({ navigate }) {
  const [tab, setTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: orderData } = await supabase.from("orders").select("id,order_number,status,total,created_at,buyer_id,store_id").eq("buyer_id", user.id).order("created_at", { ascending: false });
      const orderList = orderData || [];
      const orderIds = orderList.map(o => o.id);
      const itemsMap = await fetchOrderItems(orderIds);

      // fetch store details for the orders so buyer can see seller info
      const storeIds = [...new Set(orderList.map(o => o.store_id).filter(Boolean))];
      let storesMap = {};
      if (storeIds.length > 0) {
        const { data: stores } = await supabase.from("stores").select("id,name,slug,logo_url,city,province,address,owner:profiles(id,full_name,avatar_url)").in("id", storeIds);
        storesMap = (stores || []).reduce((m, s) => { m[s.id] = s; return m; }, {});
      }

      const merged = orderList.map(o => ({ ...o, items: itemsMap[o.id] || [], store: storesMap[o.store_id] || null }));
      setOrders(merged);
      setLoading(false);
    })();
  }, []);

  const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter(o => ["delivered", "cancelled"].includes(o.status));
  const list = tab === "active" ? active : past;

  return (
    <div>
      <div className="page-header">
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Order History</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 12 }}>Track your active shipments and review past local purchases.</p>
        <div className="tab-strip">
          {[["active", "Active"], ["past", "Past Orders"]].map(([id, label]) => (
            <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label} ({id === "active" ? active.length : past.length})</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState icon="📦" title={`No ${tab} orders`} desc="Your orders will appear here" action={<button className="btn btn-primary" onClick={() => navigate("home")} style={{ marginTop: 8 }}>Start Shopping</button>} />
        ) : list.map(order => {
          const s = STATUS_LABELS[order.status] || { label: order.status, bg: "#F3F4F6", color: "#374151" };
          const itemCount = order.items?.length || 0;
          return (
            <div key={order.id} className="card clickable" style={{ marginBottom: 14, padding: 16 }} onClick={() => navigate("order-tracking", { orderId: order.id })}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14 }}>#{order.order_number}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{itemCount} item{itemCount !== 1 ? "s" : ""} · {new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              {order.store && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }} onClick={e => e.stopPropagation()}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", background: "var(--surface3)", flexShrink: 0 }}>
                    {order.store.logo_url ? <img src={order.store.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{(order.store.name||"S")[0]}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{order.store.name}{order.store.owner?.full_name ? ` · ${order.store.owner.full_name}` : ""}</div>
                    <div style={{ fontSize: 12, color: "var(--ink3)" }}>{order.store.city}{order.store.address ? ` · ${order.store.address}` : ""}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); navigate("shop", { storeId: order.store.id }); }}>Visit Store</button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {(order.items || []).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ width: 56, height: 56, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface3)", flexShrink: 0 }}>
                    {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>}
                  </div>
                ))}
                {itemCount > 3 && <div style={{ width: 56, height: 56, borderRadius: "var(--r-md)", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--ink3)" }}>+{itemCount - 3}</div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--ink3)" }}>{itemCount} item{itemCount !== 1 ? "s" : ""} · <strong style={{ color: "var(--ink)" }}>{fmt(order.total)}</strong></span>
                {order.status === "delivered" && (
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate("write-review", { orderId: order.id, items: order.items }); }}>⭐ Rate Order</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WRITE REVIEW ─────────────────────────────────────────────────────────────
function WriteReviewScreen({ navigate, params, showToast }) {
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState({});

  useEffect(() => {
    (async () => {
      if (!params?.orderId) { setLoading(false); return; }
      const { data } = await supabase.from("order_items").select("id,product_id,product_name,product_image,unit_price,quantity").eq("order_id", params.orderId);
      setItems(data || []);
      setLoading(false);
    })();
  }, [params?.orderId]);

  const submitReviews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast("Please login first", "error"); return; }
    const unrated = items.filter(i => !ratings[i.product_id]);
    if (unrated.length > 0) { showToast("Please rate all products", "error"); return; }
    setSubmitting(true);
    for (const item of items) {
      await supabase.from("reviews").upsert({
        product_id: item.product_id,
        user_id: user.id,
        order_id: params.orderId,
        rating: ratings[item.product_id] || 5,
        comment: comments[item.product_id] || null,
        is_verified: true,
      }, { onConflict: "product_id,user_id,order_id" });
    }
    setSubmitting(false);
    showToast("Reviews submitted! Thank you 🙏", "success");
    navigate("orders");
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="top-bar">
        <button onClick={() => navigate("orders")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Rate Your Order</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={{ background: "var(--orange-pale)", borderRadius: "var(--r-xl)", padding: 14, marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--orange-dark)" }}>Share your experience!</p>
            <p style={{ fontSize: 12, color: "var(--ink3)" }}>Your reviews help other local buyers make better choices.</p>
          </div>
        </div>

        {items.map((item, idx) => (
          <div key={item.id} className="card" style={{ marginBottom: 16, padding: 16, animationDelay: `${idx * .07}s` }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface3)", flexShrink: 0 }}>
                {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛍️</div>}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.product_name}</p>
                <p style={{ fontSize: 12, color: "var(--ink3)" }}>Qty: {item.quantity} · {fmt(item.unit_price)}</p>
              </div>
            </div>

            {/* Star rating */}
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", marginBottom: 8 }}>Your Rating *</p>
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className="star-btn"
                  style={{ color: star <= (hovered[item.product_id] || ratings[item.product_id] || 0) ? "#F59E0B" : "#E5E7EB" }}
                  onMouseEnter={() => setHovered(h => ({ ...h, [item.product_id]: star }))}
                  onMouseLeave={() => setHovered(h => ({ ...h, [item.product_id]: 0 }))}
                  onClick={() => setRatings(r => ({ ...r, [item.product_id]: star }))}
                >★</button>
              ))}
              {ratings[item.product_id] && (
                <span style={{ fontSize: 12, color: "var(--ink3)", marginLeft: 8, alignSelf: "center" }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][ratings[item.product_id]]}
                </span>
              )}
            </div>

            {/* Comment */}
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", marginBottom: 6 }}>Comments (Optional)</p>
            <textarea
              className="input"
              style={{ height: "auto", padding: "10px 14px", resize: "vertical", minHeight: 80 }}
              placeholder={`How was the ${item.product_name}?`}
              value={comments[item.product_id] || ""}
              onChange={e => setComments(c => ({ ...c, [item.product_id]: e.target.value }))}
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className="float-bar" style={{ bottom: 72 }}>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={submitReviews} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Reviews 🙏"}
        </button>
      </div>
    </div>
  );
}

// ── ORDER TRACKING ──────────────────────────────────────────────────────────
const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

function OrderTrackingScreen({ navigate, params, showToast }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileRole, setProfileRole] = useState("buyer");
  const [sellerStoreId, setSellerStoreId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setProfileRole(prof?.role || "buyer");
        if (prof?.role === "seller") {
          const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle();
          setSellerStoreId(store?.id || null);
        }
      }
      if (!params?.orderId) { setLoading(false); return; }
      const [{ data: o }, { data: h }] = await Promise.all([
        supabase.from("orders").select("id,order_number,status,total,store_id,buyer_id,payment_method,created_at,delivery_addresses(*), store:stores(id,name,slug,logo_url,city,province,address,owner:profiles(id,full_name,avatar_url,phone,email))").eq("id", params.orderId).single(),
        supabase.from("order_status_history").select("*").eq("order_id", params.orderId).order("created_at"),
      ]);
      setOrder(o);
      setHistory(h || []);
      if (o) {
        const { data: orderItems } = await supabase.from("order_items").select("id,order_id,product_id,product_name,product_image,unit_price,quantity,subtotal").eq("order_id", o.id);
        setItems(orderItems || []);
      }
      setLoading(false);
    })();
  }, [params?.orderId]);

  const updateStatus = async (newStatus) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("orders").update({ status: newStatus, ...(newStatus === "delivered" ? { delivered_at: new Date().toISOString() } : {}) }).eq("id", order.id);
    await supabase.from("order_status_history").insert({ order_id: order.id, status: newStatus, created_by: user.id });
    setOrder(o => ({ ...o, status: newStatus }));
    setHistory(h => [...h, { status: newStatus, created_at: new Date().toISOString() }]);
    showToast(`Order → ${STATUS_LABELS[newStatus]?.label}`, "success");
  };

  const timeline = [
    { key: "pending", label: "Order Placed", desc: "We've received your order" },
    { key: "confirmed", label: "Confirmed", desc: "Merchant confirmed your order" },
    { key: "preparing", label: "Preparing", desc: "Merchant is packing your items" },
    { key: "out_for_delivery", label: "Out for Delivery", desc: "Rider is on the way" },
    { key: "delivered", label: "Arrived", desc: "Delivered successfully" },
  ];

  const currentIdx = order ? STATUS_FLOW.indexOf(order.status) : -1;
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const canManage = profileRole === "seller" && sellerStoreId && order?.store_id === sellerStoreId;

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="top-bar">
        <button onClick={() => navigate("orders")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--ink3)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Order Tracking</h2>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontWeight: 700, fontSize: 13 }}>Help</button>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 18, marginTop: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Order Status</p>
          {timeline.map((t, i) => {
            const done = i <= currentIdx;
            return (
              <div key={t.key}>
                <div className="tracking-step">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={`tracking-dot ${done ? "done" : i === currentIdx ? "active" : "pending"}`}>
                      {done ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <span style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    {i < timeline.length - 1 && <div className={`tracking-line${done && i < currentIdx ? " done" : ""}`} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < timeline.length - 1 ? 24 : 0, paddingTop: 7 }}>
                    <p style={{ fontWeight: done ? 700 : 500, color: done ? "var(--ink)" : "var(--ink3)", fontSize: 14 }}>{t.label}</p>
                    {done && <p style={{ fontSize: 12, color: "var(--ink3)" }}>{history.find(h => h.status === t.key) ? new Date(history.find(h => h.status === t.key).created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : t.desc}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 16, marginTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Order #{order?.order_number}</p>
          {items.map((item, i) => (
            <div key={item.id || i} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface3)", flexShrink: 0 }}>
                {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</p>
                <p style={{ fontSize: 12, color: "var(--ink3)" }}>× {item.quantity} · {fmt(item.unit_price)}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--orange)" }}>{fmt(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: "var(--orange)" }}>{fmt(order?.total)}</span>
            </div>
          </div>
        </div>

        {(order?.store || order?.delivery_addresses) && (
          <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 16, marginTop: 14 }}>
            {order?.store && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: "18px", overflow: "hidden", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {order.store.logo_url ? <img src={order.store.logo_url} alt={order.store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>🏪</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{order.store.name || "Seller Store"}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 4 }}>{order.store.address || "No store address saved"}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)" }}>{order.store.city}{order.store.province ? ", " + order.store.province : ""}</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate("shop", { storeId: order.store.id })}>Visit Store</button>
              </div>
            )}

            {order?.store?.owner && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, padding: 12, borderRadius: "var(--r-xl)", background: "var(--surface3)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "var(--surface)" }}>
                  {order.store.owner.avatar_url ? <img src={order.store.owner.avatar_url} alt={order.store.owner.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{order.store.owner.full_name || "Seller Contact"}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 2 }}>{order.store.owner.phone || order.store.owner.email || "No contact listed"}</p>
                  <p style={{ fontSize: 11, color: "var(--ink3)" }}>Seller profile</p>
                </div>
              </div>
            )}

            {order?.delivery_addresses && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Delivery Address</p>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{order.delivery_addresses.full_name}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 4 }}>{order.delivery_addresses.address_line}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)" }}>{order.delivery_addresses.city}, {order.delivery_addresses.province} {order.delivery_addresses.zip_code}</p>
                </div>
                <div style={{ borderRadius: "18px", overflow: "hidden", minHeight: 200, background: "var(--surface3)", marginBottom: 10 }}>
                  <iframe
                    title="Delivery location map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${order.delivery_addresses.address_line}, ${order.delivery_addresses.city}, ${order.delivery_addresses.province} ${order.delivery_addresses.zip_code}`)}&output=embed`}
                    style={{ width: "100%", height: 200, border: 0 }}
                    loading="lazy"
                  />
                </div>
                <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.delivery_addresses.address_line}, ${order.delivery_addresses.city}, ${order.delivery_addresses.province} ${order.delivery_addresses.zip_code}`)}`, "_blank")}>Open in Google Maps</button>
              </>
            )}
          </div>
        )}

        {canManage && nextStatus && (
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={() => updateStatus(nextStatus)}>
            Mark as {STATUS_LABELS[nextStatus]?.label} →
          </button>
        )}

        {order?.status === "delivered" && profileRole === "buyer" && (
          <button className="btn btn-outline" style={{ width: "100%", marginTop: 12 }} onClick={() => navigate("write-review", { orderId: order.id })}>
            ⭐ Rate this Order
          </button>
        )}
      </div>
    </div>
  );
}

// ── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileScreen({ navigate, showToast, setUser, profile: profileProp, setProfile }) {
  const [profile, setLocalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", phone: "", bio: "", address: "", city: "", province: "", zip_code: "" });

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setLocalProfile(data);
    if (data) setForm({
      full_name: data.full_name || "",
      username: data.username || "",
      phone: data.phone || "",
      bio: data.bio || "",
      address: data.address || "",
      city: data.city || "",
      province: data.province || "",
      zip_code: data.zip_code || "",
    });
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleAvatarUpload = async (file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = urlData?.publicUrl + `?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
      setLocalProfile(p => ({ ...p, avatar_url: avatarUrl }));
      if (setProfile) setProfile(p => ({ ...p, avatar_url: avatarUrl }));
      showToast("Profile picture updated! 📸", "success");
    } catch (err) {
      showToast("Upload failed. Check storage bucket.", "error");
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Unable to save profile. Please sign in again.", "error");
      setSaving(false);
      return;
    }
    const payload = {
      id: user.id,
      email: user.email,
      ...form,
    };
    const { error } = await supabase.from("profiles").upsert(payload).select().single();
    if (error) {
      showToast(error.message || "Failed to save profile.", "error");
      setSaving(false);
      return;
    }
    if (setUser) setUser(p => ({ ...p, ...form }));
    showToast("Profile saved!", "success");
    setSaving(false);
    setEditing(false);
    fetchProfile();
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate("login"); };

  const menuItems = [
    { label: "My Orders", desc: "Track & manage orders", screen: "orders", icon: "📦" },
    { label: "Wallet", desc: "Balance & transactions", screen: "wallet", icon: "💳" },
    { label: "Saved Addresses", desc: "Delivery locations", screen: null, icon: "📍" },
    { label: "Payment Methods", desc: "Cards & e-wallets", screen: null, icon: "💰" },
    ...(profile?.role === "seller" ? [{ label: "My Store", desc: "Manage your products", screen: "seller-dashboard", icon: "🏪" }] : []),
    { label: "Settings", desc: "Account preferences", screen: "settings", icon: "⚙️" },
    { label: "Help Center", desc: "FAQs & support", screen: null, icon: "❓" },
  ];

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Account</h2>
        <button onClick={() => setEditing(!editing)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontWeight: 700, fontSize: 13 }}>{editing ? "Cancel" : "Edit"}</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="profile-page-wrap">
          {/* Profile header with avatar upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <AvatarUpload profile={profile} onUpload={handleAvatarUpload} uploading={uploading} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.full_name || "Tindahub User"}</h2>
              <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.email}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {profile?.is_verified && <span className="badge badge-green">Verified</span>}
                <span className={`badge ${profile?.role === "seller" ? "badge-orange" : "badge-blue"}`}>{profile?.role === "seller" ? "Seller" : "Buyer"}</span>
              </div>
            </div>
          </div>

          {editing ? (
            <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 18, marginBottom: 18 }}>
              {[["full_name", "Full Name", "text"], ["username", "Username", "text"], ["phone", "Phone", "tel"], ["address", "Address", "text"], ["city", "City", "text"], ["province", "Province", "text"], ["zip_code", "ZIP Code", "text"]].map(([k, l, t]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 5 }}>{l}</label>
                  <input className="input" style={{ height: 44 }} type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 5 }}>Bio</label>
                <textarea className="input" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ height: "auto", padding: "12px 14px" }} />
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          ) : (
            <div style={{ background: "var(--surface3)", borderRadius: "var(--r-xl)", padding: 18, marginBottom: 18, border: "1px solid var(--border)" }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🌿 Community Impact</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["12.4kg", "CO₂ Saved"], ["15", "Sellers Supported"]].map(([v, l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{v}</p>
                    <p style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600 }}>{l}</p>
                  </div>
                ))}
              </div>
              {profile?.bio && <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 12, lineHeight: 1.6 }}>{profile.bio}</p>}
            </div>
          )}

          <div className="profile-menu-section">
            {menuItems.map(item => (
              <button key={item.label} onClick={() => item.screen ? navigate(item.screen) : showToast("Coming soon", "success")} className="menu-row" style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "var(--surface3)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: "var(--ink3)" }}>{item.desc}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>

          <button onClick={signOut} style={{ width: "100%", marginTop: 8, height: 50, borderRadius: "var(--r-xl)", border: "1.5px solid var(--red-light)", background: "transparent", color: "var(--red)", fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── SETTINGS (Image 3 style) ─────────────────────────────────────────────────
function SettingsScreen({ navigate, showToast }) {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [prefs, setPrefs] = useState({ notifications: true, email_updates: false });
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [twoFactor] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    });
  }, []);

  const handleAvatarUpload = async (file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = urlData?.publicUrl + `?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
      setProfile(p => ({ ...p, avatar_url: avatarUrl }));
      showToast("Profile picture updated! 📸", "success");
    } catch { showToast("Upload failed. Check storage bucket.", "error"); }
    setUploading(false);
  };

  const changePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { showToast("Passwords don't match", "error"); return; }
    if (pwForm.newPw.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setChangingPw(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Password changed successfully!", "success");
    setShowChangePw(false);
    setPwForm({ current: "", newPw: "", confirm: "" });
  };

  const sections = [
    {
      title: "Account Security",
      items: [
        {
          icon: "🔒", bg: "#FEF3C7", label: "Change Password", sub: null,
          action: () => setShowChangePw(!showChangePw), chevron: true
        },
        {
          icon: "🛡️", bg: "#DCFCE7", label: "Two-Factor Auth", sub: twoFactor ? "Enabled" : "Disabled",
          action: () => showToast("Coming soon", "success"), chevron: true, subColor: twoFactor ? "var(--green)" : "var(--red)"
        },
      ]
    },
    {
      title: "Notifications",
      items: [
        { icon: "🔔", bg: "#FFF7ED", label: "Push Notifications", toggle: "notifications" },
        { icon: "✉️", bg: "#EFF6FF", label: "Email Updates", toggle: "email_updates" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: "🌐", bg: "#F0FDF4", label: "Language", value: "English (US)", action: () => showToast("Coming soon", "success"), chevron: true },
        { icon: "💱", bg: "#FFF7ED", label: "Currency", value: "PHP (₱)", action: () => showToast("Coming soon", "success"), chevron: true },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: "❓", bg: "#F5F3FF", label: "FAQ", action: () => showToast("Coming soon", "success"), chevron: true },
        { icon: "📞", bg: "#EFF6FF", label: "Contact Us", action: () => showToast("Coming soon", "success"), chevron: true },
      ]
    },
  ];

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => navigate("profile")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Settings</h2>
        <button onClick={() => navigate("settings")} style={{ background: "none", border: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--orange-pale)", border: "2px solid var(--orange-light)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <span style={{ fontWeight: 800, fontSize: 22, color: "var(--orange)" }}>{(profile?.full_name || profile?.email || "U")[0].toUpperCase()}</span>}
            </div>
            <label style={{ position: "absolute", bottom: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: "var(--orange)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {uploading ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} disabled={uploading} />
            </label>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16 }}>{profile?.full_name || "Tindahub User"}</p>
            <p style={{ fontSize: 12, color: "var(--ink3)" }}>{profile?.email}</p>
          </div>
        </div>

        {/* Change Password Panel */}
        {showChangePw && (
          <div style={{ background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Change Password</p>
            {[["current", "Current Password"], ["newPw", "New Password"], ["confirm", "Confirm New Password"]].map(([k, l]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 5 }}>{l}</label>
                <input className="input" type="password" style={{ height: 44 }} value={pwForm[k]} onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))} placeholder="••••••••" />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={changePassword} disabled={changingPw}>{changingPw ? "Saving..." : "Save Password"}</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowChangePw(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Settings sections */}
        {sections.map(sec => (
          <div key={sec.title} className="settings-section">
            <p className="settings-section-title">{sec.title}</p>
            <div className="settings-group">
              {sec.items.map(item => (
                <div key={item.label} className="settings-row" onClick={item.action}>
                  <div className="settings-row-left">
                    <div className="settings-icon" style={{ background: item.bg }}>{item.icon}</div>
                    <div className="settings-row-info">
                      <p>{item.label}</p>
                      {item.sub && <span style={{ color: item.subColor || "var(--ink3)" }}>{item.sub}</span>}
                    </div>
                  </div>
                  {item.toggle ? (
                    <button className="switch-wrap" style={{ background: prefs[item.toggle] ? "var(--orange)" : "var(--border2)" }} onClick={e => { e.stopPropagation(); setPrefs(p => ({ ...p, [item.toggle]: !p[item.toggle] })); }}>
                      <div className="switch-thumb" style={{ left: prefs[item.toggle] ? 23 : 3 }} />
                    </button>
                  ) : item.value ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="settings-value">{item.value}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  ) : item.chevron ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2" className="settings-chevron"><polyline points="9 18 15 12 9 6"/></svg>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={async () => { await supabase.auth.signOut(); navigate("login"); }} style={{ width: "100%", height: 50, borderRadius: "var(--r-xl)", border: "none", background: "var(--red-light)", color: "var(--red)", fontWeight: 800, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Log Out
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink4)" }}>Version 2.4.1 (128)</p>
      </div>
    </div>
  );
}

// ── WALLET ──────────────────────────────────────────────────────────────────
function WalletScreen({ navigate, showToast }) {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: w } = await supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle();
      setWallet(w);
      if (w) {
        const { data: t } = await supabase.from("wallet_transactions").select("*").eq("wallet_id", w.id).order("created_at", { ascending: false }).limit(20);
        setTxns(t || []);
      }
      setLoading(false);
    })();
  }, []);

  const [cashInAmount, setCashInAmount] = useState("");

  const handleCashIn = async () => {
    const amt = parseFloat(cashInAmount);
    if (!amt || isNaN(amt) || amt <= 0) return showToast("Invalid amount", "error");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return showToast("Not signed in", "error");
    setLoading(true);
    try {
      let w = wallet;
      const oldBal = w?.balance || 0;
      if (!w) {
        const { data: newW } = await supabase.from("wallets").insert({ user_id: user.id, balance: amt, currency: "PHP" }).select().single();
        w = newW; setWallet(w);
      } else {
        const newBal = Number(oldBal) + amt;
        await supabase.from("wallets").update({ balance: newBal }).eq("id", w.id);
        w = { ...w, balance: newBal }; setWallet(w);
      }
      const { data: t } = await supabase.from("wallet_transactions").insert({ wallet_id: w.id, type: "credit", status: "completed", amount: amt, balance_before: oldBal, balance_after: w.balance, reference: "cash_in", description: "Cash In" }).select().single();
      if (t) setTxns(prev => [t, ...prev]);
      setCashInAmount("");
      showToast("Cash in successful", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to cash in", "error");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => navigate("profile")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Wallet</h2>
        <div style={{ width: 28 }} />
      </div>
      <div style={{ padding: "16px 20px" }}>
        {loading ? <Spinner /> : (
          <>
            <div className="wallet-card" style={{ marginBottom: 20 }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.7)", marginBottom: 4 }}>Tindahub Wallet</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: "white", marginBottom: 4 }}>{fmt(wallet?.balance || 0)}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 20 }}>{wallet?.currency || "PHP"}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input className="input" type="number" value={cashInAmount} onChange={e => setCashInAmount(e.target.value)} placeholder="Cash in amount" style={{ flex: 1, height: 44, background: "white" }} />
                    <button onClick={handleCashIn} className="btn btn-primary" style={{ width: 130 }}>Cash In</button>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={() => showToast("Withdraw feature coming soon", "success")} className="btn btn-outline" style={{ width: 130 }}>Withdraw</button>
                    {!wallet && <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>No wallet yet? Cash in to create one automatically.</span>}
                  </div>
                </div>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Recent Transactions</h3>
            {txns.length === 0 ? (
              <EmptyState icon="💳" title="No transactions yet" desc="Your wallet activity will appear here" />
            ) : txns.map(t => (
              <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: t.type === "credit" ? "var(--green-light)" : "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.type === "credit" ? "↑" : "↓"}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{t.description || "Transaction"}</p>
                  <p style={{ fontSize: 11, color: "var(--ink3)" }}>{new Date(t.created_at).toLocaleDateString("en-PH")}</p>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: t.type === "credit" ? "var(--green)" : "var(--red)" }}>{t.type === "credit" ? "+" : "-"}{fmt(t.amount)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── FINANCE / ADMIN DASHBOARD ───────────────────────────────────────────────
function FinanceScreen({ navigate, showToast }) {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [txns, setTxns] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState("credit");
  const [adjNote, setAdjNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from("wallets").select("*, user:profiles(id,full_name,avatar_url,email)").order("balance", { ascending: false }),
      supabase.from("wallet_transactions").select("*, wallet:wallets(id,user_id)").order("created_at", { ascending: false }).limit(50),
    ]);
    setWallets(w || []);
    setTxns(t || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);

  const markTxnCompleted = async (id) => {
    await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", id);
    setTxns(ts => ts.map(x => x.id === id ? { ...x, status: "completed" } : x));
    showToast("Transaction updated", "success");
  };

  const performAdjustment = async () => {
    const amt = Number(adjAmount);
    if (!selectedWallet) return showToast("Select a wallet", "error");
    if (!amt || amt <= 0) return showToast("Enter a valid amount", "error");

    setLoading(true);
    try {
      let wallet = wallets.find(w => w.id === selectedWallet);
      if (!wallet) {
        const { data } = await supabase.from("wallets").select("*").eq("id", selectedWallet).single();
        wallet = data;
      }
      const newBalance = Number(wallet.balance || 0) + (adjType === "credit" ? amt : -amt);
      const { error: upErr } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", selectedWallet);
      if (upErr) throw upErr;
      const { error: itErr } = await supabase.from("wallet_transactions").insert([{ wallet_id: selectedWallet, type: adjType, amount: amt, currency: wallet.currency || "PHP", description: adjNote || "Admin adjustment", status: "completed" }]);
      if (itErr) throw itErr;
      showToast("Wallet updated", "success");
      setAdjAmount(""); setAdjNote(""); setSelectedWallet(null);
      await fetchData();
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to update wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Finance</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div className="stat-card" style={{ flex: 1 }}>
            <p className="stat-lbl">Total User Wallets</p>
            <p className="stat-val">{fmt(totalBalance)}</p>
            <p style={{ fontSize: 12, color: "var(--ink3)" }}>{wallets.length} wallets</p>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <p className="stat-lbl">Recent Transactions</p>
            <p className="stat-val">{txns.length}</p>
            <p style={{ fontSize: 12, color: "var(--ink3)" }}>Last {txns.length} entries</p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800 }}>Adjust Wallet Balance</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <select value={selectedWallet || ""} onChange={e => setSelectedWallet(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
              <option value="">Select wallet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.user?.full_name || w.user?.email || w.user?.id} — {fmt(w.balance)}</option>
              ))}
            </select>
            <input placeholder="Amount" value={adjAmount} onChange={e => setAdjAmount(e.target.value)} style={{ padding: 8, borderRadius: 8, width: 120 }} />
            <select value={adjType} onChange={e => setAdjType(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input placeholder="Note (optional)" value={adjNote} onChange={e => setAdjNote(e.target.value)} style={{ padding: 8, borderRadius: 8, flex: 1 }} />
            <button className="btn" onClick={performAdjustment}>Apply Adjustment</button>
          </div>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Wallets</h3>
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {wallets.map(w => (
            <div key={w.id} className="menu-row">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{w.user?.avatar_url ? <img src={w.user.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (w.user?.full_name || w.user?.email || "U")[0]}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{w.user?.full_name || w.user?.email}</div>
                  <div style={{ fontSize: 12, color: "var(--ink3)" }}>{w.user?.email}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{fmt(w.balance)}</div>
                <div style={{ fontSize: 12, color: "var(--ink3)" }}>{w.currency || "PHP"}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Recent Transactions</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {txns.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: t.type === "credit" ? "var(--green-light)" : "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{t.type === "credit" ? "↑" : "↓"}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{t.description || t.type}</div>
                  <div style={{ fontSize: 12, color: "var(--ink3)" }}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{t.type === "credit" ? "+" : "-"}{fmt(t.amount)}</div>
                <div style={{ fontSize: 12, color: "var(--ink3)" }}>{t.status}</div>
                {t.status !== "completed" && <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => markTxnCompleted(t.id)}>Mark Completed</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ORDER CARD (Seller) ────────────────────────────────────────────────────────
function OrderCard({ o, store, updateOrderStatus }) {
  const [items, setItems] = useState(o.items || []);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !loadingItems) {
      setLoadingItems(true);
      (async () => {
        const { data: a } = await supabase.from("order_items").select("id,order_id,product_id,product_name,product_image,unit_price,quantity,subtotal").eq("order_id", o.id);
        if (a && a.length > 0) { setItems(a); setLoadingItems(false); return; }
        setLoadingItems(false);
      })();
    }
  }, [o.id]);

  const s = STATUS_LABELS[o.status] || { label: o.status, bg: "#F3F4F6", color: "#374151" };
  const idx = STATUS_FLOW.indexOf(o.status);
  const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const addr = o.deliveryAddress;

  return (
    <div style={{ padding: 16, background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", marginBottom: 12, animation: "fadeUp .3s both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 14 }}>#{o.order_number}</p>
          <p style={{ fontSize: 11, color: "var(--ink4)" }}>{new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>{fmt(o.total)}</span>
        </div>
      </div>
      <div style={{ background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "10px 12px", marginBottom: 8, border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>👤 Buyer</p>
        <p style={{ fontSize: 13, fontWeight: 700 }}>{o.buyer?.full_name || "Buyer"}</p>
        {o.buyer?.phone && <p style={{ fontSize: 12, color: "var(--ink3)" }}>📞 {o.buyer.phone}</p>}
        {(addr?.address_line || o.buyer?.address) && (
          <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>
            📍 {addr ? [addr.address_line, addr.city, addr.province].filter(Boolean).join(", ") : [o.buyer?.address, o.buyer?.city, o.buyer?.province].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, padding: "8px 10px", background: "var(--surface2)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0, background: "var(--surface3)" }}>
            {item.product_image ? <img src={item.product_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🖼️</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product_name}</p>
            <p style={{ fontSize: 11, color: "var(--ink3)" }}>Qty: <strong>{item.quantity}</strong> × {fmt(item.unit_price)}</p>
          </div>
          <span style={{ fontWeight: 800, fontSize: 12, color: "var(--ink)", flexShrink: 0 }}>{fmt(item.unit_price * item.quantity)}</span>
        </div>
      ))}
      {next && o.status !== "cancelled" && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(o.id, next)}>→ {STATUS_LABELS[next]?.label}</button>
          {o.status === "pending" && <button className="btn btn-danger btn-sm" onClick={() => updateOrderStatus(o.id, "cancelled")}>Cancel</button>}
        </div>
      )}
    </div>
  );
}

// ── SELLER DASHBOARD ────────────────────────────────────────────────────────
function SellerDashboard({ navigate, showToast }) {
  const [stats, setStats] = useState({ sales: 0, orders: 0, products: 0, rating: 0, pending: 0, monthSales: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
      setStore(storeData);
      if (storeData) {
        const { data: prods } = await supabase.from("products").select("id,name,price,stock,is_active,is_featured,sold_count,rating,images:product_images(url,is_primary)").eq("store_id", storeData.id).order("created_at", { ascending: false });
        const { data: orderData } = await supabase.from("orders").select("id,order_number,status,total,created_at,buyer_id,store_id,delivery_address_id,delivery_addresses(full_name,phone,address_line,city,province)").eq("store_id", storeData.id).order("created_at", { ascending: false }).limit(50);
        const orderList = orderData || [];
        const orderIds = orderList.map(o => o.id);
        const buyerIds = [...new Set(orderList.map(o => o.buyer_id).filter(Boolean))];
        let buyerMap = {};
        if (buyerIds.length) {
          const { data: buyers } = await supabase.from("profiles").select("id,full_name,phone,email,address,city,province").in("id", buyerIds);
          buyerMap = (buyers || []).reduce((a, b) => ({ ...a, [b.id]: b }), {});
        }
        const storeProductIds = (prods || []).map(p => p.id);
        const itemsMap = await fetchOrderItems(orderIds, storeProductIds);
        const merged = orderList.map(o => ({
          ...o, buyer: buyerMap[o.buyer_id] || null,
          items: itemsMap[o.id] || [], deliveryAddress: o.delivery_addresses || null,
        }));
        const totalSales = merged.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
        const pending = merged.filter(o => o.status === "pending").length;
        const prodList = prods || [];
        const avgRating = prodList.length ? (prodList.reduce((s, p) => s + (p.rating || 0), 0) / prodList.length).toFixed(1) : "—";
        setStats({ sales: totalSales, orders: merged.length, products: prodList.length, rating: avgRating, pending, monthSales: totalSales * 0.3 });
        setOrders(merged);
        setProducts(prodList);
      }
      setLoading(false);
    })();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    await supabase.from("order_status_history").insert({ order_id: orderId, status: newStatus, created_by: user.id });
    setOrders(p => p.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order → ${STATUS_LABELS[newStatus]?.label}`, "success");
  };

  const toggleActive = async (id, active) => {
    await supabase.from("products").update({ is_active: !active }).eq("id", id);
    setProducts(p => p.map(x => x.id === id ? { ...x, is_active: !active } : x));
  };

  return (
    <div>
      <div className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-pale)", border: "2px solid var(--orange-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏪</div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>{store?.name || "My Store"}</h2>
            <p style={{ fontSize: 11, color: "var(--ink3)" }}>Merchant Dashboard</p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("add-product")}>+ Add Product</button>
      </div>
      <div className="page-header" style={{ paddingBottom: 0, paddingTop: 0, top: 58 }}>
        <div className="tab-strip">
          {[["overview", "Overview"], ["orders", "Orders"], ["products", "Products"], ["analytics", "Analytics"]].map(([id, l]) => (
            <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {loading ? <Spinner /> : (
          <>
            {tab === "overview" && (
              <div>
                <div className="wallet-card" style={{ marginBottom: 18 }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginBottom: 4 }}>Available Balance</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 3 }}>{fmt(stats.sales * 0.9)}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 18 }}>90% of {fmt(stats.sales)} total revenue</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => navigate("wallet")} style={{ padding: "9px 16px", background: "rgba(255,255,255,.2)", color: "white", border: "1px solid rgba(255,255,255,.2)", borderRadius: "var(--r-pill)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Withdraw</button>
                      <button onClick={() => navigate("wallet")} style={{ padding: "9px 16px", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "var(--r-pill)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Wallet</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Total Revenue", val: fmt(stats.sales), bg: "#FFF7ED" },
                    { label: "This Month", val: fmt(stats.monthSales), bg: "#F0FDF4" },
                    { label: "Total Orders", val: stats.orders, bg: "#EFF6FF" },
                    { label: "Pending", val: stats.pending, bg: "#FFFBEB", alert: stats.pending > 0 },
                    { label: "Products", val: stats.products, bg: "#FAF5FF" },
                    { label: "Avg Rating", val: stats.rating, bg: "#FFF1F2" },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ background: s.bg, position: "relative" }}>
                      {s.alert && <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, background: "var(--orange)", borderRadius: "50%" }} />}
                      <p className="stat-val">{s.val}</p>
                      <p className="stat-lbl">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>New Orders</p>
                  <button className="see-all" onClick={() => setTab("orders")}>View All →</button>
                </div>
                {orders.slice(0, 5).map(o => (
                  <OrderCard key={o.id} o={o} store={store} updateOrderStatus={updateOrderStatus} />
                ))}
              </div>
            )}
            {tab === "orders" && (
              <div>
                {orders.length === 0 ? <EmptyState icon="📦" title="No orders yet" desc="Orders will appear here" /> : orders.map(o => (
                  <OrderCard key={o.id} o={o} store={store} updateOrderStatus={updateOrderStatus} />
                ))}
              </div>
            )}
            {tab === "products" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--ink3)", fontWeight: 600 }}>{products.length} products</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate("add-product")}>+ Add</button>
                </div>
                {products.length === 0 ? <EmptyState icon="📦" title="No products yet" desc="Add your first product" /> : products.map((p, i) => {
                  const img = p.images?.find(im => im.is_primary)?.url || p.images?.[0]?.url;
                  return (
                    <div key={p.id} className="prod-row" style={{ animationDelay: `${i * .04}s`, opacity: p.is_active ? 1 : .5, marginBottom: 8 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0, background: "var(--surface3)" }}>
                        {img ? <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🖼️</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: "var(--ink3)" }}>
                          {fmt(p.price)} · Stock: <strong style={{ color: p.stock < 5 ? "var(--red)" : "var(--green)" }}>{p.stock}</strong> · Sold: {p.sold_count || 0}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => navigate("add-product", { product: p })} style={{ height: 30, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Edit</button>
                        <button onClick={() => toggleActive(p.id, p.is_active)} style={{ height: 30, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: p.is_active ? "var(--surface3)" : "var(--orange-pale)", cursor: "pointer", fontSize: 11, fontWeight: 700, color: p.is_active ? "var(--ink3)" : "var(--orange)" }}>{p.is_active ? "Hide" : "Show"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === "analytics" && (
              <div>
                <div style={{ background: "var(--surface)", borderRadius: "var(--r-2xl)", border: "1px solid var(--border)", padding: 20, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 4 }}>Total Revenue</p>
                      <p style={{ fontSize: 26, fontWeight: 800, color: "var(--orange)" }}>{fmt(stats.sales)}</p>
                    </div>
                    <span className="badge badge-green">+12.4% this week</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 72 }}>
                    {[40, 65, 45, 80, 60, 95, 75, 100, 85, 70, 88, 92].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i === 11 ? "var(--orange)" : "var(--orange-light)", borderRadius: "var(--r-sm) var(--r-sm) 0 0", height: `${h}%` }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--ink4)", fontWeight: 600 }}>12 days ago</span>
                    <span style={{ fontSize: 10, color: "var(--orange)", fontWeight: 700 }}>Today</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── ADD PRODUCT ──────────────────────────────────────────────────────────────
function AddProductScreen({ navigate, showToast, params }) {
  const editProd = params?.product || null;
  const [form, setForm] = useState({ name: "", price: "", original_price: "", stock: 1, unit: "", weight: "", shelf_life: "", category_id: "", is_organic: false, is_featured: false, description: "" });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: { user } }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.auth.getUser(),
      ]);
      setCategories(cats || []);
      if (user) {
        const { data: stores } = await supabase.from("stores").select("*").eq("owner_id", user.id).limit(1);
        setStore(stores?.[0] || null);
      }
      if (editProd) {
        setForm({ name: editProd.name || "", price: editProd.price || "", original_price: editProd.original_price || "", stock: editProd.stock || 0, unit: editProd.unit || "", weight: editProd.weight || "", shelf_life: editProd.shelf_life || "", category_id: editProd.category_id || "", is_organic: !!editProd.is_organic, is_featured: !!editProd.is_featured, description: editProd.description || "" });
        setPreviews((editProd.images || []).map((u, i) => ({ name: `img${i}`, url: u.url })));
      }
      setLoading(false);
    })();
  }, []);

  const handleFiles = e => {
    const raw = Array.from(e.target.files || []);
    const valid = []; const pr = [];
    raw.forEach(f => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
      valid.push(f); pr.push({ name: f.name, url: URL.createObjectURL(f) });
    });
    setFiles(p => [...p, ...valid]); setPreviews(p => [...p, ...pr]);
  };

  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) { showToast("Name and price required", "error"); return; }
    if (!store?.id) { showToast("Please create a store first", "error"); return; }
    setSaving(true);
    const productPayload = {
      store_id: store.id, category_id: form.category_id || categories?.[0]?.id || null,
      name: form.name, slug: slugify(form.name), description: form.description,
      price: parseFloat(form.price) || 0, original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0, unit: form.unit || null, weight: form.weight || null,
      shelf_life: form.shelf_life || null, is_organic: !!form.is_organic, is_featured: !!form.is_featured, is_active: true,
    };
    let productData;
    if (editProd?.id) {
      const { data } = await supabase.from("products").update(productPayload).eq("id", editProd.id).select().single();
      productData = data;
    } else {
      const { data } = await supabase.from("products").insert(productPayload).select().single();
      productData = data;
    }
    if (productData && files.length) {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${productData.id}/${Date.now()}_${f.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, f, { upsert: false });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
          if (urlData?.publicUrl) await supabase.from("product_images").insert({ product_id: productData.id, url: urlData.publicUrl, sort_order: i, is_primary: i === 0 });
        }
      }
    }
    showToast(editProd ? "Product updated!" : "Product added!", "success");
    navigate("seller-dashboard");
    setSaving(false);
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="top-bar">
        <button onClick={() => navigate("seller-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editProd ? "Edit Product" : "Add Product"}</h2>
        <div style={{ width: 28 }} />
      </div>
      <div style={{ padding: "16px 20px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 8 }}>Product Images</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: "var(--r-xl)", border: "2px dashed var(--border2)", cursor: "pointer", background: "var(--surface3)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📷</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Upload Images</p>
                <p style={{ fontSize: 12, color: "var(--ink3)" }}>{files.length > 0 ? `${files.length} file(s) selected` : "JPG, PNG, WebP"}</p>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
            </label>
            {previews.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ width: 80, height: 80, borderRadius: "var(--r-md)", overflow: "hidden", border: `2px solid ${i === 0 ? "var(--orange)" : "var(--border)"}` }}>
                    <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Product Name *</label>
            <input className="input" required placeholder="e.g. Organic Honey 500g" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Price (₱) *</label>
              <input className="input" type="number" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Original Price</label>
              <input className="input" type="number" placeholder="Optional" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Stock *</label>
              <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Category</label>
              <select className="input" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", display: "block", marginBottom: 6 }}>Description</label>
            <textarea className="input" style={{ height: "auto", padding: "12px 14px" }} rows={4} placeholder="Describe your product..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 20, padding: 14, background: "var(--surface3)", borderRadius: "var(--r-lg)" }}>
            {[["is_organic", "Organic"], ["is_featured", "Featured"]].map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <button type="button" className="switch-wrap" style={{ background: form[k] ? "var(--orange)" : "var(--border2)" }} onClick={() => setForm(p => ({ ...p, [k]: !p[k] }))}>
                  <div className="switch-thumb" style={{ left: form[k] ? 23 : 3 }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: form[k] ? "var(--orange)" : "var(--ink3)" }}>{l}</span>
              </label>
            ))}
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", marginTop: 4 }}>{saving ? (editProd ? "Saving..." : "Adding...") : (editProd ? "Save Changes" : "Add Product")}</button>
          <button className="btn btn-outline" type="button" onClick={() => navigate("seller-dashboard")} style={{ width: "100%" }}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ──────────────────────────────────────────────────────────────
function BottomNav({ screen, navigate, cartCount, profile }) {
  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  if (isAuth) return null;

  const tabs = [
    { id: "home", label: "Home", icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--orange)" : "none"} stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: "search", label: "Search", icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> },
    {
      id: "cart", label: "Cart",
      icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
      countBadge: true,
    },
    { id: "orders", label: "Orders", icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    // Finance tab visible only to admin
    ...(profile?.role === "admin" ? [{ id: "finance", label: "Finance", icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--orange)" : "none"} stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="1"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="18" cy="12" r="2"/></svg> }] : []),
    { id: "profile", label: "Profile", icon: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--orange)" : "currentColor"} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(t => {
        const active = screen === t.id;
        return (
          <button key={t.id} className={`bnav-btn${active ? " active" : ""}`} onClick={() => navigate(t.id)}>
            {t.icon(active)}
            {t.countBadge && cartCount > 0 && (
              <span className="bnav-count">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
            <span className="bnav-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [screen, setScreen] = useState("login");
  const [params, setParams] = useState({});
  const [toast, setToast] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const navigate = useCallback((s, p = {}) => {
    setScreen(s);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((m, t = "success") => setToast({ message: m, type: t }), []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigate("home");
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
        setProfile(prof);
      }
    });
  }, []);

  useEffect(() => {
    if (!user?.id) { setCartCount(0); return; }
    const fetch = () => supabase.from("cart_items").select("quantity").eq("user_id", user.id).then(({ data }) => setCartCount(data?.reduce((s, i) => s + i.quantity, 0) || 0));
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isAuth = ["login", "signup", "onboarding"].includes(screen);
  const sp = { navigate, showToast, params, user, setUser, profile, setProfile };

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
      case "shop": return <ShopScreen {...sp} />;
      case "write-review": return <WriteReviewScreen {...sp} />;
      case "profile": return <ProfileScreen {...sp} />;
      case "settings": return <SettingsScreen {...sp} />;
      case "wallet": return <WalletScreen {...sp} />;
      case "finance": return <FinanceScreen {...sp} />;
      case "seller-dashboard": return <SellerDashboard {...sp} />;
      case "add-product": return <AddProductScreen {...sp} />;
      case "login": return <LoginScreen {...sp} />;
      case "signup": return <SignupScreen {...sp} />;
      case "onboarding": return <OnboardingScreen {...sp} />;
      default: return <EmptyState icon="🚧" title={screen} desc="Coming soon" action={<button className="btn btn-primary" onClick={() => navigate("home")} style={{ marginTop: 8 }}>← Back</button>} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      {splash && <Splash onDone={() => setSplash(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {isAuth ? (
        <div>{renderScreen()}</div>
      ) : (
        <div id="app">
          <div className="main-content">{renderScreen()}</div>
          <BottomNav screen={screen} navigate={navigate} cartCount={cartCount} profile={profile} />
        </div>
      )}
    </>
  );
}