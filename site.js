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
    setTimeout(() => root.classList.remove("pt-arrive", "pt-out"), 900);

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

    // 버튼 묶음: 모든 내비의 Contact 버튼 앞에 [KO/EN] [테마]
    const i18n = !!document.querySelector("[data-i18n-page]");
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
      const paint = () => { th.innerHTML = root.dataset.theme === "dark" ? SUN : MOON; th.setAttribute("aria-label", root.dataset.theme === "dark" ? "밝은 화면으로" : "어두운 화면으로"); };
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
