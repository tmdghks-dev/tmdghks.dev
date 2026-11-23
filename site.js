// tmdghks.dev 공통 스크립트: 페이지 전환 · 다크/라이트 · KO/EN 버튼
// <head>에서 바로 실행해 테마가 깜빡이지 않게 한다.
(() => {
  const root = document.documentElement;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;


  // ── 공통 CSS (전환 막 · 버튼 · 어두운 화면) ──
  const css = `
  .pt { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; background: #ff4a1c; color: #fff; pointer-events: none;
    transform: translateY(101%); transition: transform .45s cubic-bezier(.7,0,.2,1); }
  .pt span { font: 400 clamp(40px, 8vw, 90px) "Fragment Mono", ui-monospace, monospace; letter-spacing: -.04em; }
  .pt-leave .pt { transform: translateY(0); }
  .pt-arrive .pt { transform: translateY(0); transition: none; }
  .pt-arrive.pt-out .pt { transform: translateY(-101%); transition: transform .6s cubic-bezier(.7,0,.2,1); }
  .sbar { position: fixed; left: 0; top: 0; z-index: 120; width: 100%; height: 2px; background: #ff4a1c; transform-origin: 0 50%; transform: scaleX(0); pointer-events: none; }
  .rv { opacity: 0; transform: translateY(26px); }
  .rv.in { opacity: 1; transform: none; transition: opacity .8s cubic-bezier(.2,.8,.2,1) var(--d, 0ms), transform .8s cubic-bezier(.2,.8,.2,1) var(--d, 0ms); }
  .nav-right { display: flex; align-items: center; gap: 8px; }
  .toggles { display: flex; gap: 6px; }
  .tg { height: 33px; min-width: 33px; padding: 0 9px; border: 0; border-radius: 7px; display: inline-grid; place-items: center; grid-auto-flow: column; gap: 6px;
    color: inherit; background: color-mix(in srgb, currentColor 12%, transparent); cursor: pointer; font: 400 11.5px "Fragment Mono", ui-monospace, monospace; letter-spacing: .04em; transition: background .15s; }
  .tg:hover { background: color-mix(in srgb, currentColor 22%, transparent); }
  .tg svg { width: 15px; height: 15px; }
  .tg.lang b { font-weight: 400; opacity: .45; } .tg.lang b.on { opacity: 1; }
  @media (max-width: 760px) { .tg.lang { padding: 0 7px; } .minibar .toggles { display: none; } }

  :root[data-theme="dark"] { --cream: #121010; --cream2: #1f1b18; --ink: #efe8df; --muted: #a1988d; --line: rgba(255,255,255,.12); color-scheme: dark; }
  :root[data-theme="dark"] :is(.hero, .about, .top, .end, .card, .app, .os, .skip-hint, .pt) { --cream: #f4efe8; --ink: #0c0b0a; --muted: #716a61; --line: rgba(12,11,10,.12); }
  :root[data-theme="dark"] .about { background: #0c0b0a; }
  :root[data-theme="dark"] .about .curtain path { fill: #0c0b0a; }
  :root[data-theme="dark"] .track span { color: var(--ink); }
  :root[data-theme="dark"] .track img { filter: invert(1); }
  :root[data-theme="dark"] .pill.light { color: #0c0b0a; }
  :root[data-theme="dark"] .minibar, :root[data-theme="dark"] .minibar.dark { background: rgba(24,21,19,.78); border-color: rgba(255,255,255,.08); color: #efe8df; }
  :root[data-theme="dark"] .minibar .nav-cta { background: #efe8df; color: #0c0b0a; }
  :root[data-theme="dark"] :is(.feat, .steps li) { background: #1a1714; }
  :root[data-theme="dark"] :is(.steps li, .doc p, .detail p) { color: #cfc6bb; }
  :root[data-theme="dark"] .web { border-color: rgba(255,255,255,.2); }
  :root[data-theme="dark"] .deck-stage::before { opacity: .55; }
  `;
  document.head.append(Object.assign(document.createElement("style"), { textContent: css }));

  // ── 테마: 저장한 값이 있으면 그걸, 없으면 밝은 화면 ──
  if (store.get("theme") === "dark") root.dataset.theme = "dark";

  // ── 언어: 메인 페이지만 영어를 지원 (?lang=en 으로도 열 수 있음) ──
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "en" || q === "ko") store.set("lang", q);
  root.dataset.lang = store.get("lang") === "en" ? "en" : "ko";
  // 하위 페이지 영어: 사전을 본문보다 먼저 받아 둔다 (메인 페이지는 자체 사전이 있다)
  const isMain = location.pathname === "/" || location.pathname === "/index.html";
  if (root.dataset.lang === "en" && !isMain) { root.lang = "en"; document.write('<script src="/i18n-sub.js"><\/script>'); }

  // ── 페이지 전환: 들어올 때 주황 막이 위로 걷힌다 ──
  let came = false; try { came = sessionStorage.getItem("pt") === "1"; sessionStorage.removeItem("pt"); } catch {}
  if (came && !still) root.classList.add("pt-arrive");

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  addEventListener("DOMContentLoaded", () => {
    // 전환 막
    const pt = Object.assign(document.createElement("div"), { className: "pt", innerHTML: "<span>&gt;_</span>" });
    pt.setAttribute("aria-hidden", "true");
    document.body.append(pt);
    if (root.classList.contains("pt-arrive")) requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("pt-out")));
    setTimeout(() => { pt.style.transition = "none"; root.classList.remove("pt-arrive", "pt-out"); void pt.offsetWidth; pt.style.transition = ""; }, 900);

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /\.(dmg|exe|apk|zip|pdf)$/i.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;          // 같은 페이지 안 이동은 그대로
      if (still) return;
      e.preventDefault();
      try { sessionStorage.setItem("pt", "1"); } catch {}
      root.classList.add("pt-leave");
      setTimeout(() => (location.href = url.href), 480);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("pt-leave"); });   // 뒤로 가기로 돌아왔을 때

    // 하위 페이지 번역
    const SUB = window.SUB_EN;
    if (SUB && root.dataset.lang === "en") {
      const norm = (t) => t.replace(/\s+/g, " ").trim();
      const tr = (rootEl) => {
        rootEl.querySelectorAll?.("p, li").forEach((el) => {
          const t = norm(el.textContent);
          const hit = SUB.EL.find(([k, v]) => v && t.startsWith(k));
          if (hit) el.innerHTML = hit[1];
        });
        const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const n = w.currentNode, t = n.nodeValue.trim(); if (t && /[가-힣]/.test(t) && SUB.TX[t] != null) n.nodeValue = n.nodeValue.replace(t, SUB.TX[t]); }
        rootEl.querySelectorAll?.("[alt], [title], [aria-label]").forEach((el) => ["alt", "title", "aria-label"].forEach((a) => { const v = el.getAttribute(a); if (v && SUB.TX[v]) el.setAttribute(a, SUB.TX[v]); }));
      };
      tr(document.body);
      if (SUB.TITLE[document.title]) document.title = SUB.TITLE[document.title];
      new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && tr(n)))).observe(document.body, { childList: true, subtree: true });
    }

    // 스크롤 진행 바: 맨 위 얇은 주황 선
    const bar = Object.assign(document.createElement("div"), { className: "sbar" });
    document.body.append(bar);
    const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    addEventListener("scroll", prog, { passive: true }); addEventListener("resize", prog); prog();

    // 하위 페이지: 제목·문단·카드가 아래에서 차례로 올라온다 (메인은 커서 인트로가 대신한다)
    if (!document.querySelector("[data-i18n-page]") && !still && "IntersectionObserver" in window) {
      const els = document.querySelectorAll(".top .lbl, .top h1, .top .lead, .top .cta, .top .modes, .sec h2, .sec .sub, .sec .lbl, .feat, .steps li, .faq details, .os, .app, .stage, .end > *, .doc h2, .doc p");
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; const el = e.target; el.classList.add("in"); io.unobserve(el); setTimeout(() => el.classList.remove("rv", "in"), 1300); }), { rootMargin: "0px 0px -6% 0px" });   // 끝나면 원래 hover 효과로
      els.forEach((el) => {
        const sib = [...el.parentElement.children].filter((c) => c.classList.contains("rv")).length;
        el.classList.add("rv"); el.style.setProperty("--d", `${Math.min(sib, 6) * 70}ms`); io.observe(el);
      });
      // 앱 카드처럼 나중에 그려지는 것도
      new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1 && n.matches(".app, .os")) { n.classList.add("rv"); io.observe(n); } }))).observe(document.body, { childList: true, subtree: true });
    }

    // 버튼 묶음: 모든 내비의 Contact 버튼 앞에 [KO/EN] [테마]
    const i18n = true;   // 모든 페이지에 KO/EN
    document.querySelectorAll(".nav-cta").forEach((cta) => {
      const box = Object.assign(document.createElement("div"), { className: "toggles" });
      if (i18n) {
        const lang = Object.assign(document.createElement("button"), { className: "tg lang", type: "button" });
        lang.innerHTML = `<b class="${root.dataset.lang === "ko" ? "on" : ""}">KO</b><b class="${root.dataset.lang === "en" ? "on" : ""}">EN</b>`;
        lang.setAttribute("aria-label", "언어 바꾸기 / Change language");
        lang.onclick = () => {
          store.set("lang", root.dataset.lang === "en" ? "ko" : "en");
          // 주소의 ?lang= 은 지우고(남아 있으면 다시 그 언어로 돌아간다), #work 같은 해시도 지운다(해시만 바뀌면 새로 불러오지 않는다)
          const u = new URL(location.href); u.searchParams.delete("lang"); u.hash = "";
          try { sessionStorage.setItem("langswitch", "1"); sessionStorage.setItem("pt", "1"); } catch {}   // 다시 열 때 인트로 없이 바로, 주황 막으로 덮어서
          if (still) { location.href = u.href; return; }
          root.classList.add("pt-leave"); setTimeout(() => (location.href = u.href), 450);
        };
        box.append(lang);
      }
      const th = Object.assign(document.createElement("button"), { className: "tg theme", type: "button" });
      const en = root.dataset.lang === "en";
      const paint = () => { th.innerHTML = root.dataset.theme === "dark" ? SUN : MOON; th.setAttribute("aria-label", root.dataset.theme === "dark" ? (en ? "Light mode" : "밝은 화면으로") : (en ? "Dark mode" : "어두운 화면으로")); };
      paint();
      th.onclick = () => {
        const dark = root.dataset.theme !== "dark";
        if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
        store.set("theme", dark ? "dark" : "light");
        document.querySelectorAll(".tg.theme").forEach((b) => (b.innerHTML = dark ? SUN : MOON));
        dispatchEvent(new Event("themechange"));
      };
      box.append(th);
      const right = Object.assign(document.createElement("div"), { className: "nav-right" });
      cta.replaceWith(right); right.append(box, cta);
    });
  });
})();
