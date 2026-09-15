// ESP JBL - wspolny widok karty (Home Assistant i panel WWW na ESP)
// Adapter dostarcza: icon(nazwa, px, kolor) oraz handlers { stop, setVolume, ... }.

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

const PALETTE = {
  light: {
    bg: "#f3f5f8", card: "#ffffff", ink: "#1c1f24", dim: "#6b7280", divider: "#e6e9ee", chip: "#f2f4f7",
    field: "#fafbfc", accent: "#e8620a", "accent-soft": "rgba(232,98,10,.13)", "on-accent": "#ffffff",
    ok: "#1f7a3c", "ok-soft": "rgba(31,122,60,.12)", danger: "#c0392b", "danger-soft": "rgba(192,57,43,.10)",
    "danger-line": "rgba(192,57,43,.32)", thumb: "#ffffff", shadow: "0 1px 3px rgba(16,24,40,.09)",
  },
  dark: {
    bg: "#0f1216", card: "#1a1e24", ink: "#e8eaee", dim: "#9aa1ab", divider: "#2b3038", chip: "#22272e",
    field: "#1f242b", accent: "#ff8a3d", "accent-soft": "rgba(255,138,61,.16)", "on-accent": "#221202",
    ok: "#5dd67f", "ok-soft": "rgba(93,214,127,.14)", danger: "#ff6b5e", "danger-soft": "rgba(255,107,94,.13)",
    "danger-line": "rgba(255,107,94,.34)", thumb: "#e8eaee", shadow: "0 2px 6px rgba(0,0,0,.45)",
  },
};

const CSS = `
:host, .ej-root { display:block }
.ej { font-family:Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,sans-serif; color:var(--ink);
  line-height:1.35; column-gap:14px; -webkit-tap-highlight-color:transparent }
.ej * { box-sizing:border-box }
.ej.cols2 { column-count:2 }
.mono { font-family:"JetBrains Mono",ui-monospace,Consolas,monospace }
.panel { break-inside:avoid; background:var(--card); border-radius:24px; box-shadow:var(--shadow); padding:16px;
  margin-bottom:14px; display:grid; gap:12px }
.row { display:flex; align-items:center; justify-content:space-between; gap:8px }
.title { font-size:15px; font-weight:700; display:inline-flex; align-items:center; gap:8px; min-width:0 }
.eyebrow { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); font-weight:700 }
.label { display:block; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--dim); font-weight:700 }
.chipbox { font-size:12px; font-weight:700; color:var(--dim); background:var(--chip); padding:4px 10px; border-radius:99px }
.ell { overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
button { font:inherit; color:inherit; background:none; border:0; padding:0; margin:0; cursor:pointer }
button:focus-visible, input:focus-visible, select:focus-visible { outline:2px solid var(--accent); outline-offset:2px }
.disabled { opacity:.42; pointer-events:none }
.banner { break-inside:avoid; display:flex; gap:10px; align-items:center; padding:12px 14px; margin-bottom:14px;
  border-radius:18px; background:var(--danger-soft); border:1px solid var(--danger-line); color:var(--danger) }
.pill { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:99px; font-size:12px; font-weight:600 }
.art { flex:0 0 auto; width:58px; height:58px; border-radius:20px; display:flex; align-items:center; justify-content:center }
.now { font-size:19px; font-weight:700; letter-spacing:-.01em }
.eqbars { display:inline-flex; align-items:flex-end; gap:2px; height:17px }
.eqbars i { display:block; width:3px; border-radius:2px; background:var(--accent); animation:ej-eq .9s ease-in-out infinite alternate }
.eqbars i:nth-child(2) { animation-duration:.7s; animation-delay:.15s }
.eqbars i:nth-child(3) { animation-duration:1.1s; animation-delay:.3s }
.eqbars i:nth-child(4) { animation-duration:.8s; animation-delay:.45s }
@keyframes ej-eq { 0%{height:5px} 50%{height:17px} 100%{height:7px} }
@keyframes ej-shimmer { 0%{background-position:0 0} 100%{background-position:220px 0} }
.stop { display:flex; align-items:center; justify-content:center; gap:10px; height:58px; border-radius:20px;
  font-size:16px; font-weight:700; width:100% }
.stop:hover { filter:brightness(1.06) }
.slider { position:relative; height:24px; display:flex; align-items:center }
.slider input { -webkit-appearance:none; appearance:none; width:100%; height:24px; margin:0; background:transparent; cursor:pointer }
.slider input::-webkit-slider-runnable-track { height:10px; border-radius:99px; background:var(--track) }
.slider input::-moz-range-track { height:10px; border-radius:99px; background:var(--track) }
.slider input::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; margin-top:-6px; border-radius:50%;
  background:var(--thumb); border:1px solid var(--divider); box-shadow:0 1px 4px rgba(0,0,0,.3) }
.slider input::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:var(--thumb);
  border:1px solid var(--divider); box-shadow:0 1px 4px rgba(0,0,0,.3) }
.slider.center::before { content:""; position:absolute; left:50%; top:0; width:2px; height:24px; background:var(--divider); pointer-events:none }
.toggle { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:16px; background:var(--chip); width:100% }
.switch { position:relative; display:block; width:46px; height:26px; border-radius:99px; transition:background .2s }
.switch i { position:absolute; top:3px; width:20px; height:20px; border-radius:50%; background:var(--thumb);
  box-shadow:0 1px 3px rgba(0,0,0,.35); transition:left .2s }
.hint { display:flex; gap:8px; align-items:flex-start; font-size:12.5px; color:var(--dim); padding:10px 12px; border-radius:14px; background:var(--chip) }
.tabs { display:flex; gap:4px; padding:4px; border-radius:14px; background:var(--chip) }
.tabs button { flex:1; text-align:center; padding:8px 6px; border-radius:11px; font-size:13px; font-weight:600; color:var(--dim) }
.tabs button.on { font-weight:700; background:var(--card); box-shadow:var(--shadow); color:var(--ink) }
.grid-s { display:grid; grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:8px }
.tile { display:flex; align-items:center; gap:9px; min-height:52px; padding:9px 11px; border-radius:16px; text-align:left;
  border:1px solid var(--divider); background:var(--field); width:100%; user-select:none; -webkit-user-select:none }
.tile:hover { border-color:var(--accent) }
.tile.on { background:var(--accent-soft); border-color:var(--accent) }
.tile .t1 { display:block; font-size:13.5px; font-weight:600 }
.tile .t2 { display:block; font-size:10.5px; color:var(--dim) }
.empty { display:grid; gap:8px; justify-items:center; text-align:center; padding:26px 16px; border-radius:18px; border:1.5px dashed var(--divider) }
.field { display:flex; align-items:center; gap:10px; padding:10px 13px; border-radius:16px; border:1px solid var(--divider); background:var(--field); min-width:0 }
.field:focus-within { border-color:var(--accent) }
.field input, .field select { display:block; width:100%; border:0; outline:0; background:transparent; color:var(--ink);
  font:inherit; font-size:13.5px; padding:2px 0 0; min-width:0 }
.field select { font-weight:600; -webkit-appearance:none; appearance:none; cursor:pointer }
.field option { background:var(--card); color:var(--ink) }
.field input.mono { font-size:12.5px }
.field input::placeholder { color:var(--dim); opacity:1 }
.iconbtn { flex:0 0 auto; display:flex; align-items:center; justify-content:center }
.trash { flex:0 0 auto; display:flex; align-items:center; justify-content:center; width:48px; border-radius:16px;
  border:1px solid var(--danger-line); background:var(--danger-soft); color:var(--danger) }
.confirm { display:grid; gap:10px; padding:13px; border-radius:16px; background:var(--danger-soft); border:1px solid var(--danger-line) }
.btn2 { flex:1; text-align:center; padding:10px; border-radius:13px; font-size:13.5px; font-weight:700 }
.primary { display:flex; align-items:center; justify-content:center; gap:9px; height:48px; border-radius:16px;
  background:var(--accent); color:var(--on-accent); font-size:15px; font-weight:700; width:100% }
.primary[disabled] { opacity:.5; cursor:default }
.toast { display:grid; gap:8px; padding:11px 13px; border-radius:16px }
.bar { display:block; height:6px; border-radius:99px; background:var(--chip); overflow:hidden }
.bar i { display:block; height:100%; border-radius:99px; background:var(--accent) }
.bar i.indet { width:100%; opacity:.9; background:repeating-linear-gradient(90deg,var(--accent) 0 60px,var(--accent-soft) 60px 110px);
  background-size:220px 100%; animation:ej-shimmer 1.2s linear infinite }
.reset { font-size:18px; color:var(--dim); padding:3px; border-radius:9px; background:var(--chip); display:inline-flex }
.scale { display:flex; justify-content:space-between; font-size:10.5px; color:var(--dim) }
.outline { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; height:44px; border-radius:15px;
  border:1px solid var(--accent); color:var(--accent); font-size:14px; font-weight:700 }
.dev { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:15px; border:1px solid var(--divider); background:var(--field); width:100%; text-align:left }
.dev.on { background:var(--accent-soft); border-color:var(--accent) }
.tag { flex:0 0 auto; font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--accent);
  background:var(--accent-soft); padding:3px 8px; border-radius:99px }
.head { width:100%; text-align:left }
.box { display:grid; gap:9px; padding:12px; border-radius:16px; background:var(--chip) }
.ghostbtn { display:flex; align-items:center; justify-content:center; gap:8px; height:44px; border-radius:15px; background:var(--card);
  border:1px solid var(--divider); font-size:13.5px; font-weight:700; width:100% }
.danger-zone { display:grid; gap:9px; padding:12px; border-radius:16px; border:1.5px dashed var(--danger-line); background:var(--danger-soft) }
.fmt { display:flex; align-items:center; justify-content:center; gap:9px; height:46px; border-radius:15px; font-size:14px; font-weight:700;
  border:1px solid var(--danger); width:100% }
.diag { display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(112px,1fr)) }
.diag > div { display:grid; gap:3px; padding:11px 12px; border-radius:16px; background:var(--chip) }
.diag .k { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--dim); font-weight:700; letter-spacing:.06em; text-transform:uppercase }
.diag .v { font-size:15px; font-weight:600 }
`;

const DASH = "—";
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const isRadio = (n) => /^radio_/i.test(n) || /fm/i.test(n);
const pretty = (n) => {
  const s = String(n || "").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};
const dB = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " dB";
const kb = (b) => (b >= 1048576 ? (b / 1048576).toFixed(2).replace(".", ",") + " MB" : Math.round(b / 1024) + " kB");
const isError = (m) => /błąd|blad|error|nie można|nie ma /i.test(m || "");
const isLoading = (m) => /pobieram|formatowanie/i.test(m || "");

// Wysylanie pliku z postepem; Content-Type text/plain = zwykle zadanie CORS bez zapytania wstepnego
export function xhrUpload(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", url);
    x.setRequestHeader("Content-Type", "text/plain");
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => {
      let body = {};
      try {
        body = JSON.parse(x.responseText);
      } catch (e) {
        /* odpowiedz bez JSON */
      }
      if (x.status >= 200 && x.status < 300 && body.ok !== false) resolve(body);
      else reject(new Error(body.error || "HTTP " + x.status));
    };
    x.onerror = () =>
      reject(new Error(location.protocol === "https:" && url.startsWith("http:")
        ? "przeglądarka blokuje wysyłanie z HTTPS do ESP (HTTP) - użyj panelu ESP"
        : "brak połączenia z ESP"));
    x.send(file);
  });
}

// 83000 -> "1:23", 3723000 -> "1:02:03"
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(mm).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

export function ensureFonts(doc = document) {
  if (doc.querySelector("link[data-esp-jbl-font]")) return;
  const l = doc.createElement("link");
  l.rel = "stylesheet";
  l.href = FONT_HREF;
  l.dataset.espJblFont = "1";
  doc.head.appendChild(l);
}

export function paletteVars(dark) {
  return Object.entries(PALETTE[dark ? "dark" : "light"])
    .map(([k, v]) => `--${k}:${v}`)
    .join(";");
}

export class EspJblView {
  constructor(root, { icon, handlers, extraCss = "" }) {
    this.root = root; // ShadowRoot lub element
    this.icon = icon;
    this.h = handlers;
    this.m = null;
    this.ui = { tab: "all", btOpen: false, sdOpen: false, confirmDelete: false, armedUntil: 0, cols: 1, dark: false,
      plOpen: "", plConfirm: false, sheet: "", sheetPl: "", addMode: "url" };
    this.draft = { url: "", name: "", newUrl: "", mac: null, type: "auto", plName: "", plAdd: "", sheetNew: "", upName: "", file: null };
    this.upload = null;   // { pct } w trakcie wysylania
    this.localMsg = "";   // blad wysylania pokazywany zamiast komunikatu z ESP
    this.lastHtml = "";
    this.pending = false;
    this.busy = new Set();

    const style = document.createElement("style");
    style.textContent = CSS + extraCss;
    this.host = document.createElement("div");
    this.host.className = "ej-root";
    root.appendChild(style);
    root.appendChild(this.host);

    // wybor pliku poza przerysowywanym widokiem - przerysowanie nie gubi wybranego pliku
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = "audio/mpeg,.mp3";
    this.fileInput.style.display = "none";
    root.appendChild(this.fileInput);
    this.fileInput.addEventListener("change", () => {
      const f = this.fileInput.files && this.fileInput.files[0];
      if (!f) return;
      this.draft.file = f;
      if (!this.draft.upName.trim()) {
        this.draft.upName = f.name.replace(/\.[^.]+$/, "").replace(/\|/g, "").trim().replace(/\s+/g, "_").slice(0, 31);
      }
      this.fileInput.value = "";
      this.render(true);
    });

    this.host.addEventListener("click", (e) => this.onClick(e));
    this.host.addEventListener("change", (e) => this.onChange(e));
    this.host.addEventListener("input", (e) => this.onInput(e));
    this.host.addEventListener("keydown", (e) => this.onKey(e));
    this.host.addEventListener("focusout", () => setTimeout(() => this.pending && this.render(), 0));
    this.host.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.host.addEventListener("contextmenu", (e) => {
      if (e.target.closest("[data-sound]")) e.preventDefault();
    });

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        const cols = w >= 720 ? 2 : 1;
        if (cols !== this.ui.cols) {
          this.ui.cols = cols;
          this.render(true);
        }
      }).observe(this.host);
    }
    this.timer = setInterval(() => {
      if (this.ui.armedUntil && Date.now() > this.ui.armedUntil) this.ui.armedUntil = 0;
      if (this.ui.armedUntil) this.render(true);
      else if (this.m && this.m.playing && !this.m.offline) this.render(); // biegnacy czas utworu
    }, 500);
  }

  setDark(dark) {
    if (dark === this.ui.dark && this.host.getAttribute("style")) return;
    this.ui.dark = dark;
    this.host.setAttribute("style", paletteVars(dark));
  }

  setModel(m) {
    this.m = m;
    if (this.draft.mac === null && m && m.mac) this.draft.mac = m.mac;
    this.render();
  }

  // edytowana playlista (obiekt z modelu)
  plEdited() {
    return (this.m.playlists || []).find((p) => p.name === this.ui.plOpen);
  }

  // cel "Dodaj do playlisty" w menu dzwieku: ostatnio wybrana, pierwsza albo nowa
  sheetPl() {
    const lists = this.m.playlists || [];
    if (this.ui.sheetPl === "__new__" || lists.some((p) => p.name === this.ui.sheetPl)) return this.ui.sheetPl;
    return lists[0] ? lists[0].name : "__new__";
  }

  activeEl() {
    return this.root.activeElement || (this.root.ownerDocument || document).activeElement;
  }

  // nie przerysowujemy w trakcie pisania / przeciagania suwaka
  interacting() {
    const a = this.activeEl();
    return this.dragging || (a && this.host.contains(a) && /^(INPUT|SELECT)$/.test(a.tagName) && a.type !== "range");
  }

  render(force) {
    if (!this.m) return;
    if (this.interacting() && !force) {
      this.pending = true;
      return;
    }
    const html = this.html();
    if (html === this.lastHtml) return;
    this.pending = false;
    const a = this.activeEl();
    const key = a && this.host.contains(a) ? a.dataset.key : null;
    const sel = key && a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null;
    this.host.innerHTML = html;
    this.lastHtml = html;
    if (key) {
      const el = this.host.querySelector(`[data-key="${key}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        if (sel && el.setSelectionRange) el.setSelectionRange(sel[0], sel[1]);
      }
    }
  }

  async run(name, fn) {
    if (this.busy.has(name)) return;
    this.busy.add(name);
    try {
      await fn();
    } catch (err) {
      console.error("esp-jbl:", name, err);
    } finally {
      this.busy.delete(name);
    }
  }

  // ---------- zdarzenia ----------
  onPointerDown(e) {
    const range = e.target.closest('input[type="range"]');
    if (range) {
      this.dragging = true;
      const up = () => {
        this.dragging = false;
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        setTimeout(() => this.render(true), 400);
      };
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      return;
    }
    const tile = e.target.closest("[data-sound]");
    if (!tile) return;
    clearTimeout(this.holdTimer);
    this.held = false;
    const cancel = () => clearTimeout(this.holdTimer);
    tile.addEventListener("pointerup", cancel, { once: true });
    tile.addEventListener("pointerleave", cancel, { once: true });
    this.holdTimer = setTimeout(() => {
      this.held = true;
      this.ui.sheet = tile.dataset.sound; // menu: dodaj do playlisty / usun
      this.ui.confirmDelete = false;
      const name = tile.dataset.sound;
      this.m.selected = name;
      this.run("select", () => this.h.selectSound(name));
      this.render(true);
    }, 550);
  }

  onClick(e) {
    const t = e.target.closest("[data-act]");
    if (!t || t.disabled) return;
    const act = t.dataset.act;
    const m = this.m;
    switch (act) {
      case "stop":
        this.run("stop", () => this.h.stop());
        break;
      case "loop":
        m.loop = !m.loop;
        this.render(true);
        this.run("loop", () => this.h.setLoop(m.loop));
        break;
      case "tab":
        this.ui.tab = t.dataset.tab;
        this.render(true);
        break;
      case "sound":
        if (this.held) {
          this.held = false;
          return;
        }
        this.run("play", () => this.h.play(t.dataset.sound));
        break;
      case "playurl":
        if (this.draft.url.trim()) this.run("playurl", () => this.h.playUrl(this.draft.url.trim()));
        break;
      case "trash":
        if (m.selected) {
          this.ui.confirmDelete = true;
          this.render(true);
        }
        break;
      case "del-yes":
        this.ui.confirmDelete = false;
        this.render(true);
        this.run("delete", () => this.h.deleteSelected(m.selected));
        break;
      case "del-no":
        this.ui.confirmDelete = false;
        this.render(true);
        break;
      case "save": {
        const name = this.draft.name.trim(), url = this.draft.newUrl.trim(), type = this.draft.type;
        if (!name || !url) return;
        this.run("save", async () => {
          await this.h.addSound(name, url, type);
          this.draft.name = "";
          this.draft.newUrl = "";
          this.draft.type = "auto";
          this.render(true);
        });
        break;
      }
      case "type":
        this.draft.type = t.dataset.type;
        this.render(true);
        break;
      case "add-mode":
        this.ui.addMode = t.dataset.mode;
        this.render(true);
        break;
      case "pick-file":
        this.fileInput.click();
        break;
      case "upload": {
        const file = this.draft.file, name = this.draft.upName.trim();
        if (!file || !name || this.upload) return;
        this.upload = { pct: 0 };
        this.localMsg = "";
        this.render(true);
        Promise.resolve()
          .then(() => this.h.uploadFile(file, name, (pct) => {
            this.upload = { pct };
            this.render(true);
          }))
          .then(() => {
            this.draft.file = null;
            this.draft.upName = "";
          })
          .catch((err) => {
            this.localMsg = "Błąd wysyłania: " + (err && err.message ? err.message : err);
            setTimeout(() => {
              this.localMsg = "";
              this.render(true);
            }, 10000);
          })
          .finally(() => {
            this.upload = null;
            this.render(true);
          });
        break;
      }
      case "prev":
        this.run("prev", () => this.h.prev());
        break;
      case "resume":
        this.run("resume", () => this.h.resume());
        break;
      case "next":
        this.run("next", () => this.h.next());
        break;
      case "spk-buttons":
        m.spkButtons = m.spkButtons === false;
        this.render(true);
        this.run("spk-buttons", () => this.h.setSpeakerButtons(m.spkButtons));
        break;
      case "shuffle":
        m.shuffle = !m.shuffle;
        this.render(true);
        this.run("shuffle", () => this.h.setShuffle(m.shuffle));
        break;
      case "pl-open":
        this.ui.plOpen = this.ui.plOpen === t.dataset.pl ? "" : t.dataset.pl;
        this.ui.plConfirm = false;
        this.render(true);
        break;
      case "pl-close":
        this.ui.plOpen = "";
        this.ui.plConfirm = false;
        this.render(true);
        break;
      case "pl-play":
        this.run("pl-play", () => this.h.playPlaylist(t.dataset.pl));
        break;
      case "pl-create": {
        const name = this.draft.plName.trim();
        if (!name) return;
        if (!(m.playlists || []).some((p) => p.name === name)) m.playlists = [...(m.playlists || []), { name, items: [] }];
        this.ui.plOpen = name;
        this.draft.plName = "";
        this.render(true);
        this.run("pl-create", () => this.h.createPlaylist(name));
        break;
      }
      case "pl-add": {
        const pl = this.plEdited();
        const sound = this.draft.plAdd || (m.sounds || [])[0];
        if (!pl || !sound) return;
        pl.items = [...pl.items, sound];
        this.render(true);
        this.run("pl-add", () => this.h.addToPlaylist(pl.name, sound));
        break;
      }
      case "pl-rm": {
        const pl = this.plEdited(), i = Number(t.dataset.i);
        if (!pl) return;
        pl.items = pl.items.filter((_, k) => k !== i);
        this.render(true);
        this.run("pl-rm", () => this.h.removeFromPlaylist(pl.name, i));
        break;
      }
      case "pl-up":
      case "pl-down": {
        const pl = this.plEdited(), i = Number(t.dataset.i), to = act === "pl-up" ? i - 1 : i + 1;
        if (!pl || to < 0 || to >= pl.items.length) return;
        const items = [...pl.items];
        [items[i], items[to]] = [items[to], items[i]];
        pl.items = items;
        this.render(true);
        this.run("pl-move", () => this.h.movePlaylistItem(pl.name, i, to));
        break;
      }
      case "pl-del":
        this.ui.plConfirm = true;
        this.render(true);
        break;
      case "pl-del-no":
        this.ui.plConfirm = false;
        this.render(true);
        break;
      case "pl-del-yes": {
        const name = this.ui.plOpen;
        m.playlists = (m.playlists || []).filter((p) => p.name !== name);
        this.ui.plOpen = "";
        this.ui.plConfirm = false;
        this.render(true);
        this.run("pl-del", () => this.h.deletePlaylist(name));
        break;
      }
      case "sheet-close":
        this.ui.sheet = "";
        this.render(true);
        break;
      case "sheet-add": {
        const target = this.sheetPl();
        const pl = target === "__new__" ? this.draft.sheetNew.trim() : target;
        const sound = this.ui.sheet;
        if (!pl || !sound) return;
        const lists = m.playlists || [];
        const found = lists.find((p) => p.name === pl);
        m.playlists = found ? lists.map((p) => (p === found ? { ...p, items: [...p.items, sound] } : p))
          : [...lists, { name: pl, items: [sound] }];
        this.ui.sheet = "";
        this.ui.sheetPl = pl;
        this.draft.sheetNew = "";
        this.render(true);
        this.run("sheet-add", () => this.h.addToPlaylist(pl, sound));
        break;
      }
      case "sheet-del":
        m.selected = this.ui.sheet;
        this.ui.sheet = "";
        this.ui.confirmDelete = true;
        this.render(true);
        this.run("select", () => this.h.selectSound(m.selected));
        break;
      case "reset-bass":
        m.bass = 0;
        this.render(true);
        this.run("bass", () => this.h.setBass(0));
        break;
      case "reset-treble":
        m.treble = 0;
        this.render(true);
        this.run("treble", () => this.h.setTreble(0));
        break;
      case "bt-toggle":
        this.ui.btOpen = !this.ui.btOpen;
        this.render(true);
        break;
      case "sd-toggle":
        this.ui.sdOpen = !this.ui.sdOpen;
        this.render(true);
        break;
      case "scan":
        this.ui.btOpen = true;
        m.scanning = true;
        this.render(true);
        this.run("scan", () => this.h.scan());
        break;
      case "device":
        this.draft.mac = t.dataset.mac;
        this.run("speaker", () => this.h.selectSpeaker(t.dataset.name, t.dataset.mac));
        break;
      case "sd-sync":
        this.run("sync", () => this.h.sdSync());
        break;
      case "format":
        // urzadzenie wymaga dwoch nacisniec w ciagu 10 s - pierwsze uzbraja
        this.ui.armedUntil = this.ui.armedUntil ? 0 : Date.now() + 10000;
        this.render(true);
        this.run("format", () => this.h.sdFormatPress());
        break;
      case "open-bt":
        this.ui.btOpen = true;
        this.render(true);
        break;
    }
  }

  onInput(e) {
    const t = e.target;
    const k = t.dataset.key;
    if (k === "url") this.draft.url = t.value;
    else if (k === "name") this.draft.name = t.value;
    else if (k === "newurl") this.draft.newUrl = t.value;
    else if (k === "mac") this.draft.mac = t.value;
    else if (k === "plname") this.draft.plName = t.value;
    else if (k === "upname") {
      this.draft.upName = t.value;
      const b = this.host.querySelector('[data-act="upload"]');
      if (b) b.disabled = !(this.draft.file && t.value.trim() && !this.upload);
    }
    else if (k === "sheet-new") this.draft.sheetNew = t.value;
    else if (t.type === "range") this.paintRange(t);
    if (k === "name" || k === "newurl") {
      const btn = this.host.querySelector('[data-act="save"]');
      if (btn) btn.disabled = !(this.draft.name.trim() && this.draft.newUrl.trim());
    }
  }

  onKey(e) {
    if (e.key !== "Enter") return;
    const k = e.target.dataset.key;
    if (k === "url") this.onClick({ target: this.host.querySelector('[data-act="playurl"]') });
    else if (k === "newurl" || k === "name") this.onClick({ target: this.host.querySelector('[data-act="save"]') });
    else if (k === "mac") e.target.blur();
    else if (k === "plname") this.onClick({ target: this.host.querySelector('[data-act="pl-create"]') });
    else if (k === "upname") this.onClick({ target: this.host.querySelector('[data-act="upload"]') });
    else if (k === "sheet-new") this.onClick({ target: this.host.querySelector('[data-act="sheet-add"]') });
  }

  onChange(e) {
    const t = e.target;
    const k = t.dataset.key;
    const m = this.m;
    const v = Number(t.value);
    if (k === "volume") {
      m.volume = v;
      this.run("volume", () => this.h.setVolume(v));
    } else if (k === "bass") {
      m.bass = v;
      this.run("bass", () => this.h.setBass(v));
    } else if (k === "treble") {
      m.treble = v;
      this.run("treble", () => this.h.setTreble(v));
    } else if (k === "selected") {
      m.selected = t.value;
      this.ui.confirmDelete = false;
      this.run("select", () => this.h.selectSound(t.value));
      t.blur();
    } else if (k === "speaker") {
      const d = (m.devices || []).find((x) => x.mac === t.value);
      if (d) {
        this.draft.mac = d.mac;
        this.run("speaker", () => this.h.selectSpeaker(d.name, d.mac));
      }
      t.blur();
    } else if (k === "pl-add") {
      this.draft.plAdd = t.value;
      t.blur();
    } else if (k === "sheet-pl") {
      this.ui.sheetPl = t.value;
      t.blur();
      this.render(true);
    } else if (k === "mac") {
      const mac = t.value.trim().toUpperCase();
      if (/^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/.test(mac) && mac !== m.mac) this.run("mac", () => this.h.setMac(mac));
    }
  }

  // aktualizacja wypelnienia i etykiety bez przerysowania
  paintRange(t) {
    const v = Number(t.value);
    const wrap = t.closest(".slider");
    if (t.dataset.key === "volume") {
      wrap.style.setProperty("--track", fillTrack(v));
      const lab = this.host.querySelector('[data-label="volume"]');
      if (lab) lab.textContent = v + "%";
    } else {
      wrap.style.setProperty("--track", centerTrack(v));
      const lab = this.host.querySelector(`[data-label="${t.dataset.key}"]`);
      if (lab) lab.textContent = dB(v);
    }
  }

  // ---------- widok ----------
  html() {
    const m = this.m, ui = this.ui, I = this.icon;
    // kategoria z urzadzenia; starsze firmware bez kategorii - zgadywanie po nazwie
    const radioOf = (n) => (m.types && m.types[n] ? m.types[n] === "radio" : isRadio(n));
    const off = !!m.offline;
    const bt = !off && m.btStreaming;
    const playing = !off && !!m.playing;
    const radioNow = playing && radioOf(m.playing);
    const ctl = bt ? "" : " disabled";
    const sounds = off ? [] : m.sounds || [];
    const playlists = off ? [] : m.playlists || [];
    const radios = sounds.filter(radioOf).length;
    const sheetPl = this.sheetPl();
    const plEd = playlists.find((p) => p.name === ui.plOpen);
    const plAdd = sounds.includes(this.draft.plAdd) ? this.draft.plAdd : sounds[0] || "";
    const accentBtn = `style="border-color:var(--accent);background:var(--accent-soft);color:var(--accent)"`;
    const editor = !plEd ? "" : `<div class="box">
    <div class="row">
      <span class="ell" style="font-size:13.5px;font-weight:700;display:inline-flex;align-items:center;gap:6px;min-width:0">${I("pencil-outline", 16, "var(--dim)")}${esc(plEd.name)}</span>
      <span style="display:inline-flex;gap:6px;flex:0 0 auto">
        <button class="reset${ctl}" data-act="pl-play" data-pl="${esc(plEd.name)}" aria-label="Odtwórz playlistę">${I("play", 18, "var(--accent)")}</button>
        <button class="reset" data-act="pl-del" aria-label="Usuń playlistę">${I("trash-can-outline", 18, "var(--danger)")}</button>
        <button class="reset" data-act="pl-close" aria-label="Zamknij">${I("close", 18)}</button>
      </span>
    </div>
    ${ui.plConfirm ? `<div class="confirm"><div style="font-size:13px"><b>Usunąć playlistę „${esc(plEd.name)}”?</b> Dźwięki zostają.</div>
      <div style="display:flex;gap:8px"><button class="btn2" data-act="pl-del-yes" style="background:var(--danger);color:#fff">Usuń</button>
      <button class="btn2" data-act="pl-del-no" style="background:var(--card)">Anuluj</button></div></div>` : ""}
    ${plEd.items.length ? plEd.items.map((it, i) => {
      const r = radioOf(it), now = m.playlist === plEd.name && m.playing === it;
      return `<div class="dev" style="padding:6px 8px;gap:8px${now ? ";border-color:var(--accent);background:var(--accent-soft)" : ""}">
        <span class="mono" style="width:18px;text-align:right;font-size:11px;color:var(--dim)">${i + 1}</span>
        ${I(r ? "radio-tower" : "ghost-outline", 17, r ? "var(--accent)" : "var(--ink)")}
        <span class="ell" style="flex:1;min-width:0;font-size:13px;font-weight:600">${esc(pretty(it))}${sounds.includes(it) ? "" : ` <span style="color:var(--danger);font-weight:500">(brak)</span>`}</span>
        <button class="reset${i === 0 ? " disabled" : ""}" data-act="pl-up" data-i="${i}" aria-label="W górę">${I("chevron-up", 18)}</button>
        <button class="reset${i === plEd.items.length - 1 ? " disabled" : ""}" data-act="pl-down" data-i="${i}" aria-label="W dół">${I("chevron-down", 18)}</button>
        <button class="reset" data-act="pl-rm" data-i="${i}" aria-label="Usuń z playlisty">${I("close", 18, "var(--danger)")}</button>
      </div>`;
    }).join("") : `<div style="font-size:12.5px;color:var(--dim)">Pusta playlista — dodaj dźwięki poniżej.</div>`}
    <div style="display:flex;gap:8px;align-items:stretch">
      <label class="field" style="flex:1;justify-content:space-between">
        <span style="min-width:0;flex:1"><span class="label">Dodaj dźwięk</span>
        <select data-key="pl-add">${sounds.map((n) => `<option value="${esc(n)}"${n === plAdd ? " selected" : ""}>${esc(n)}</option>`).join("") || "<option>brak dźwięków</option>"}</select></span>
        ${I("menu-down", 20, "var(--dim)")}
      </label>
      <button class="trash" ${accentBtn} data-act="pl-add" aria-label="Dodaj do playlisty">${I("plus", 22)}</button>
    </div>
  </div>`;
    const shown = sounds.filter((n) => (ui.tab === "radio" ? radioOf(n) : ui.tab === "fx" ? !radioOf(n) : true));
    const devices = off ? [] : m.devices || [];
    const speaker = devices.find((d) => d.mac === m.mac);
    const armedLeft = ui.armedUntil ? Math.max(0, Math.ceil((ui.armedUntil - Date.now()) / 1000)) : 0;
    const msg = off ? "Ostatni komunikat niedostępny (urządzenie offline)." : this.localMsg || m.message || "Gotowe.";
    const msgErr = !off && isError(msg), msgLoad = !off && (isLoading(msg) || m.sdBusy);

    let nowTitle = "Cisza", nowSub = "Nic nie jest odtwarzane", nowIcon = "volume-off";
    if (off) [nowTitle, nowSub, nowIcon] = [DASH, "Encja niedostępna", "help-circle-outline"];
    else if (playing) [nowTitle, nowSub, nowIcon] = radioNow
      ? [pretty(m.playing), "Radio internetowe", "radio-tower"]
      : [pretty(m.playing), "Efekt dźwiękowy", "flash"];
    else if (!bt) [nowSub, nowIcon] = ["Brak połączenia z głośnikiem", "bluetooth-off"];
    else if (m.sdBusy) nowSub = "Trwa pobieranie plików na kartę";
    if (playing && m.playlist) nowSub = `Playlista: ${m.playlist} · ${m.plPos}/${m.plLen}`;

    // czas: stan z urzadzenia + czas od ostatniej aktualizacji
    const since = m.posAt ? Math.max(0, Date.now() - m.posAt) : 0;
    const pos = playing ? (m.posMs || 0) + since : 0;
    const dur = m.durMs > 0 ? m.durMs : 0;
    const shownPos = dur ? Math.min(pos, dur) : pos;
    let timeBlock = "";
    if (playing && dur) {
      timeBlock = `<div style="display:grid;gap:6px">
      <span class="bar"><i style="width:${((shownPos / dur) * 100).toFixed(1)}%;transition:width .5s linear"></i></span>
      <div class="scale mono" style="font-size:11.5px"><span>${fmtTime(shownPos)}</span><span>−${fmtTime(dur - shownPos)}</span><span>${fmtTime(dur)}</span></div>
    </div>`;
    } else if (playing) {
      timeBlock = `<div class="scale mono" style="font-size:11.5px;justify-content:flex-start;gap:6px;align-items:center">
      ${I(radioNow ? "access-point" : "timer-outline", 14, "var(--accent)")}<span>${radioNow ? "na żywo" : "czas"} · ${fmtTime(pos)}</span></div>`;
    }
    if (playing && m.playlist && m.plTotalMs > 0) {
      const ap = m.plApprox ? "~" : "";
      timeBlock += `<div class="scale mono" style="font-size:11.5px;justify-content:flex-start;gap:8px;align-items:center">
      ${I("playlist-play", 14, "var(--dim)")}<span>Całość ${ap}${fmtTime(m.plTotalMs)}</span><span>· zostało ${ap}${fmtTime(Math.max(0, (m.plLeftMs || 0) - since))}</span></div>`;
    }

    const up = this.upload;
    const fileForm = `<button class="field${off || !m.sdReady ? " disabled" : ""}" data-act="pick-file" style="width:100%;text-align:left">
      ${I("file-music-outline", 20, "var(--accent)")}
      <span style="min-width:0;flex:1"><span class="label">Plik MP3 z urządzenia</span>
      <span class="ell" style="display:block;font-size:13.5px;${this.draft.file ? "font-weight:600" : "color:var(--dim)"}">${esc(this.draft.file ? `${this.draft.file.name} · ${kb(this.draft.file.size)}` : "Wybierz plik…")}</span></span>
      ${I("folder-open-outline", 20, "var(--dim)")}</button>
    <label class="field" style="display:block"><span class="label">Nazwa</span>
      <input data-key="upname" maxlength="31" placeholder="np. duch_wycie" value="${esc(this.draft.upName)}"></label>
    ${!off && !m.sdReady ? `<div style="font-size:12px;color:var(--danger)">Wgrywanie wymaga karty SD w ESP.</div>` : ""}
    <button class="primary" data-act="upload"${this.draft.file && this.draft.upName.trim() && !up && m.sdReady && !off ? "" : " disabled"}>
      ${I("upload", 20)}${up ? `Wysyłanie… ${up.pct}%` : "Wyślij na kartę SD"}</button>
    ${up ? progressBar(up.pct, "") : ""}`;

    const btText = off ? "brak danych" : bt ? (speaker ? speaker.name + " · połączony" : "połączony") : "rozłączony";
    const sdSummary = off ? DASH : !m.sdReady ? "brak karty" : m.sdBusy ? (m.sdPct >= 0 ? `pobieranie ${m.sdPct}%` : "pobieranie…") :
      `${m.sdFree} MB${m.rssi ? " · " + String(m.rssi).replace("-", "−") + " dBm" : ""}`;
    const sdState = off ? DASH : !m.sdReady ? "brak karty" : (m.sdBusy ? `pobieranie${m.sdJob ? " " + m.sdJob : ""}${m.sdPct >= 0 ? " " + m.sdPct + "%" : "…"} · ` : "") + m.sdFree + " MB wolne";

    return `<div class="ej${ui.cols === 2 ? " cols2" : ""}">
${off ? `<div class="banner">${I("lan-disconnect", 20)}<div><div style="font-weight:700;font-size:14px">Urządzenie offline</div>
<div style="font-size:12px;opacity:.85">Encje niedostępne (unavailable). Sprawdź zasilanie i Wi-Fi ESP32.</div></div></div>` : ""}

<div class="panel" style="gap:14px">
  <div class="row">
    <span class="eyebrow">Teraz gra</span>
    <button class="pill" data-act="open-bt" style="background:var(${bt ? "--ok-soft" : "--danger-soft"});color:var(${bt ? "--ok" : "--danger"})">
      ${I(bt ? "bluetooth-audio" : "bluetooth-off", 16)}${esc(btText)}</button>
  </div>
  <div style="display:flex;align-items:center;gap:14px">
    <div class="art" style="background:var(${playing ? "--accent-soft" : "--chip"})">${I(nowIcon, 28, playing ? "var(--accent)" : "var(--dim)")}</div>
    <div style="min-width:0;flex:1 1 auto">
      <div class="now ell">${esc(nowTitle)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;font-size:12.5px;color:var(--dim)">
        ${playing ? `<span class="eqbars"><i style="height:9px"></i><i style="height:15px"></i><i style="height:6px"></i><i style="height:12px"></i></span>` : ""}
        <span>${esc(nowSub)}</span>
      </div>
    </div>
  </div>
  ${timeBlock}
  <div style="display:flex;gap:8px">
    ${playing ? `<button class="stop${ctl}" data-act="prev" aria-label="Poprzedni" title="Poprzedni"
      style="flex:0 0 58px;width:58px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent)">${I("skip-previous", 28)}</button>` : ""}
    ${playing ? `<button class="stop${ctl}" data-act="stop" style="flex:1;background:var(--accent);color:var(--on-accent);border:1px solid var(--accent)">
      ${I("stop-circle-outline", 24)}Stop</button>`
    : `<button class="stop${ctl}" data-act="resume" style="flex:1;background:var(--chip);color:var(--ink);border:1px solid var(--divider)">
      ${I("play-circle-outline", 24)}Wznów</button>`}
    ${playing ? `<button class="stop${ctl}" data-act="next" aria-label="Następny" title="Następny"
      style="flex:0 0 58px;width:58px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent)">${I("skip-next", 28)}</button>` : ""}
  </div>
  <div class="${ctl}" style="display:grid;gap:8px">
    <div class="row">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--dim);font-weight:500">${I("volume-medium", 18)}Głośność</span>
      <span style="font-size:14px;font-weight:700" data-label="volume">${off ? DASH : m.volume + "%"}</span>
    </div>
    <div class="slider" style="--track:${fillTrack(off ? 0 : m.volume)}">
      <input type="range" min="0" max="100" step="1" value="${off ? 0 : m.volume}" data-key="volume" aria-label="Głośność">
    </div>
  </div>
  <button class="toggle${ctl}" data-act="loop" role="switch" aria-checked="${!!m.loop}">
    <span style="display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600">${I("repeat-variant", 20, m.loop ? "var(--accent)" : "var(--dim)")}Zapętlaj</span>
    <span class="switch" style="background:var(${m.loop ? "--accent" : "--divider"})"><i style="left:${m.loop ? 23 : 3}px"></i></span>
  </button>
  ${!off && !bt ? `<div class="hint">${I("information-outline", 17, "var(--accent)")}<span>Głośnik JBL jest rozłączony — sterowanie odtwarzaniem nieaktywne. Otwórz sekcję <b style="color:var(--ink)">Głośnik Bluetooth</b> i połącz urządzenie.</span></div>` : ""}
</div>

<div class="panel">
  <div class="row">
    <span class="title">${I("playlist-music", 20, "var(--accent)")}Dźwięki i radio</span>
    <span class="chipbox">${off ? DASH : `${sounds.length} pozycji${radios ? " · " + radios + " radio" : ""}`}</span>
  </div>
  <div class="tabs">
    ${[["all", "Wszystkie"], ["fx", "Efekty"], ["radio", "Radio"]]
      .map(([k, l]) => `<button data-act="tab" data-tab="${k}" class="${ui.tab === k ? "on" : ""}">${l}</button>`).join("")}
  </div>
  ${sounds.length ? `<div class="grid-s${ctl}">${shown.map((n) => {
      const r = radioOf(n), on = n === m.playing;
      return `<button class="tile${on ? " on" : ""}" data-act="sound" data-sound="${esc(n)}" title="Przytrzymaj: dodaj do playlisty / usuń">
        ${I(r ? "radio-tower" : "ghost-outline", 20, r ? "var(--accent)" : "var(--ink)")}
        <span style="min-width:0"><span class="t1 ell">${esc(pretty(n))}</span><span class="t2 mono ell">${esc(n)}</span></span></button>`;
    }).join("") || `<div style="font-size:12.5px;color:var(--dim);padding:6px 2px">Brak pozycji w tej kategorii.</div>`}</div>`
    : off ? "" : `<div class="empty">${I("ghost-outline", 34, "var(--dim)")}<div style="font-size:14px;font-weight:700">Brak zapisanych dźwięków</div>
      <div style="font-size:12.5px;color:var(--dim);max-width:260px">Dodaj pierwszy efekt lub stację w sekcji <b style="color:var(--ink)">Dodaj dźwięk / stację</b> albo odtwórz jednorazowo z adresu URL.</div></div>`}
  <div class="field${ctl}" style="padding:10px 12px">
    ${I("link-variant", 19, "var(--dim)")}
    <span style="min-width:0;flex:1"><span class="label">Odtwórz URL</span>
      <input class="mono" data-key="url" type="url" inputmode="url" placeholder="https://… (mp3 / stream)" value="${esc(this.draft.url)}"></span>
    <button class="iconbtn" data-act="playurl" aria-label="Odtwórz URL">${I("play-circle", 24, "var(--accent)")}</button>
  </div>
  <div class="${ctl}" style="display:flex;gap:8px;align-items:stretch">
    <label class="field" style="flex:1;padding:11px 13px;justify-content:space-between">
      <select data-key="selected" aria-label="Wybierz dźwięk">
        ${sounds.length ? sounds.map((n) => `<option value="${esc(n)}"${n === m.selected ? " selected" : ""}>${esc(n)}</option>`).join("")
          : `<option>${off ? DASH : "brak pozycji"}</option>`}
      </select>${I("menu-down", 20, "var(--dim)")}
    </label>
    <button class="trash" data-act="trash" aria-label="Usuń wybrany">${I("trash-can-outline", 21)}</button>
  </div>
  ${ui.sheet && !off ? `<div class="box" style="border:1px solid var(--divider)">
    <div class="row"><b class="ell" style="font-size:14px">${esc(pretty(ui.sheet))}</b>
      <button class="iconbtn" data-act="sheet-close" aria-label="Zamknij">${I("close", 20, "var(--dim)")}</button></div>
    <div style="display:flex;gap:8px;align-items:stretch">
      <label class="field" style="flex:1;justify-content:space-between">
        <span style="min-width:0;flex:1"><span class="label">Dodaj do playlisty</span>
        <select data-key="sheet-pl">${playlists.map((p) => `<option value="${esc(p.name)}"${p.name === sheetPl ? " selected" : ""}>${esc(p.name)} (${p.items.length})</option>`).join("")}
          <option value="__new__"${sheetPl === "__new__" ? " selected" : ""}>+ nowa playlista…</option></select></span>
        ${I("menu-down", 20, "var(--dim)")}
      </label>
      <button class="trash" ${accentBtn} data-act="sheet-add" aria-label="Dodaj do playlisty">${I("playlist-plus", 21)}</button>
    </div>
    ${sheetPl === "__new__" ? `<label class="field" style="display:block"><span class="label">Nazwa nowej playlisty</span>
      <input data-key="sheet-new" maxlength="31" placeholder="np. straszne" value="${esc(this.draft.sheetNew)}"></label>` : ""}
    <button class="btn2" data-act="sheet-del" style="background:var(--danger-soft);color:var(--danger);border:1px solid var(--danger-line)">Usuń dźwięk…</button>
  </div>` : ""}
  ${ui.confirmDelete && m.selected ? `<div class="confirm">
    <div style="font-size:13.5px"><b>Usunąć „${esc(m.selected)}”?</b> Plik zostanie skasowany z karty SD.</div>
    <div style="display:flex;gap:8px">
      <button class="btn2" data-act="del-yes" style="background:var(--danger);color:#fff">Usuń</button>
      <button class="btn2" data-act="del-no" style="background:var(--chip)">Anuluj</button>
    </div></div>` : ""}
</div>

<div class="panel">
  <div class="row">
    <span class="title">${I("playlist-play", 20, "var(--accent)")}Playlisty</span>
    <span class="chipbox">${off ? DASH : playlists.length + (playlists.length === 1 ? " playlista" : " playlist")}</span>
  </div>
  ${playlists.length ? `<div class="grid-s">${playlists.map((p) => {
    const on = p.name === m.playlist, open = p.name === ui.plOpen;
    return `<div class="tile${on || open ? " on" : ""}" style="padding:0;gap:0">
      <button data-act="pl-open" data-pl="${esc(p.name)}" style="flex:1;min-width:0;display:flex;align-items:center;gap:9px;padding:9px 0 9px 11px;text-align:left">
        ${I("playlist-music", 20, on ? "var(--accent)" : "var(--ink)")}
        <span style="min-width:0"><span class="t1 ell">${esc(p.name)}</span>
        <span class="t2 mono ell">${on ? `gra ${m.plPos}/${m.plLen}` : p.items.length + " poz."}</span></span></button>
      <button class="iconbtn${ctl}" data-act="pl-play" data-pl="${esc(p.name)}" aria-label="Odtwórz playlistę" style="align-self:stretch;padding:0 11px">
        ${I("play-circle", 26, "var(--accent)")}</button></div>`;
  }).join("")}</div>` : off ? "" : `<div style="font-size:12.5px;color:var(--dim)">Brak playlist. Utwórz pierwszą poniżej albo przytrzymaj kafelek dźwięku.</div>`}
  ${editor}
  <div style="display:flex;gap:8px;align-items:stretch">
    <label class="field" style="flex:1;display:block"><span class="label">Nowa playlista</span>
      <input data-key="plname" maxlength="31" placeholder="np. straszne" value="${esc(this.draft.plName)}"></label>
    <button class="trash${off ? " disabled" : ""}" ${accentBtn} data-act="pl-create" aria-label="Utwórz playlistę">${I("playlist-plus", 21)}</button>
  </div>
  <button class="toggle${off ? " disabled" : ""}" data-act="shuffle" role="switch" aria-checked="${!!m.shuffle}">
    <span style="display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600">${I("shuffle-variant", 20, m.shuffle ? "var(--accent)" : "var(--dim)")}Losowa kolejność</span>
    <span class="switch" style="background:var(${m.shuffle ? "--accent" : "--divider"})"><i style="left:${m.shuffle ? 23 : 3}px"></i></span>
  </button>
</div>

<div class="panel" style="gap:10px">
  <span class="title">${I("plus-box-multiple-outline", 20, "var(--accent)")}Dodaj dźwięk / stację</span>
  <div class="tabs">
    ${[["url", "Z linku", "link-variant"], ["file", "Z pliku", "file-upload-outline"]].map(([k, l, ic]) =>
      `<button data-act="add-mode" data-mode="${k}" class="${ui.addMode === k ? "on" : ""}" style="display:inline-flex;align-items:center;justify-content:center;gap:6px">${I(ic, 17)}${l}</button>`).join("")}
  </div>
  ${ui.addMode === "file" ? fileForm : `
  <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
    <label class="field" style="display:block"><span class="label">Nazwa</span>
      <input data-key="name" maxlength="31" placeholder="np. duch_wycie" value="${esc(this.draft.name)}"></label>
    <label class="field" style="display:block"><span class="label">URL</span>
      <input class="mono" data-key="newurl" type="url" inputmode="url" maxlength="255" placeholder="https://…/wycie.mp3" value="${esc(this.draft.newUrl)}"></label>
  </div>
  <div class="tabs" role="radiogroup" aria-label="Kategoria">
    ${[["auto", "Auto", "auto-fix"], ["efekt", "Efekt", "ghost-outline"], ["radio", "Radio", "radio-tower"]].map(([k, l, ic]) =>
      `<button data-act="type" data-type="${k}" class="${this.draft.type === k ? "on" : ""}" role="radio" aria-checked="${this.draft.type === k}"
        style="display:inline-flex;align-items:center;justify-content:center;gap:6px">${I(ic, 17)}${l}</button>`).join("")}
  </div>
  ${this.draft.type === "auto" ? `<div style="font-size:11.5px;color:var(--dim);margin-top:-4px">ESP sprawdzi link: transmisja na żywo → Radio, plik → Efekt.</div>` : ""}
  <button class="primary" data-act="save"${this.draft.name.trim() && this.draft.newUrl.trim() && !off ? "" : " disabled"}>${I("content-save-outline", 20)}Zapisz dźwięk</button>`}
  <div class="toast" style="background:var(${msgErr ? "--danger-soft" : "--chip"});border:1px solid var(${msgErr ? "--danger-line" : "--divider"})">
    <div style="display:flex;gap:9px;align-items:flex-start">
      ${I(msgErr ? "alert-circle-outline" : msgLoad ? "progress-download" : off ? "help-circle-outline" : "check-circle-outline", 18,
        msgErr ? "var(--danger)" : msgLoad ? "var(--accent)" : off ? "var(--dim)" : "var(--ok)")}
      <span style="font-size:12.5px">${esc(msg)}</span>
    </div>
    ${msgLoad ? progressBar(m.sdBusy ? m.sdPct : -1, "") : ""}
  </div>
</div>

<div class="panel${ctl}" style="gap:16px">
  <span class="title">${I("tune-vertical-variant", 20, "var(--accent)")}Brzmienie</span>
  ${eqRow("bass", "Bas", off ? 0 : m.bass, off, I)}
  ${eqRow("treble", "Soprany", off ? 0 : m.treble, off, I)}
</div>

<div class="panel">
  <button class="row head" data-act="bt-toggle" aria-expanded="${ui.btOpen}">
    <span class="title">${I("bluetooth-audio", 20, "var(--accent)")}Głośnik Bluetooth</span>
    <span style="display:inline-flex;align-items:center;gap:8px;flex:0 0 auto">
      <span style="font-size:12px;color:var(--dim);font-weight:600">${off ? DASH : bt ? "połączony" : m.scanning ? "skanowanie…" : devices.length + " znalezione"}</span>
      ${I(ui.btOpen ? "chevron-up" : "chevron-down", 22, "var(--dim)")}
    </span>
  </button>
  ${ui.btOpen ? `<div style="display:grid;gap:10px">
    <button class="toggle${off ? " disabled" : ""}" data-act="spk-buttons" role="switch" aria-checked="${m.spkButtons !== false}">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;text-align:left">${I("gesture-tap-button", 20, m.spkButtons !== false ? "var(--accent)" : "var(--dim)")}Przyciski głośnika sterują ESP</span>
      <span class="switch" style="flex:0 0 auto;background:var(${m.spkButtons !== false ? "--accent" : "--divider"})"><i style="left:${m.spkButtons !== false ? 23 : 3}px"></i></span>
    </button>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="outline${off || m.scanning ? " disabled" : ""}" data-act="scan">${I("bluetooth-settings", 19)}${m.scanning ? "Skanowanie…" : "Skanuj"}</button>
      <span class="mono" style="flex:0 0 auto;font-size:12.5px;color:var(--dim)">${off ? DASH : m.scanning ? "skanowanie…" : "znaleziono " + devices.length}</span>
    </div>
    ${devices.length ? `<div style="display:grid;gap:6px">${devices.map((d) => {
      const on = d.mac === m.mac;
      return `<button class="dev${on ? " on" : ""}" data-act="device" data-mac="${esc(d.mac)}" data-name="${esc(d.name)}">
        ${I(d.audio ? "speaker" : "bluetooth", 19, on ? "var(--accent)" : d.audio ? "var(--ink)" : "var(--dim)")}
        <span style="flex:1;min-width:0"><span class="ell" style="display:block;font-size:13.5px;font-weight:600">${esc(d.name || "(bez nazwy)")}</span>
        <span class="mono" style="display:block;font-size:10.5px;color:var(--dim)">${esc(d.mac)} · ${String(d.rssi).replace("-", "−")} dBm</span></span>
        ${d.audio ? `<span class="tag">audio</span>` : ""}</button>`;
    }).join("")}</div>` : ""}
    <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      <label class="field" style="justify-content:space-between">
        <span style="min-width:0;flex:1"><span class="label">Wybierz głośnik</span>
        <select data-key="speaker">
          <option value="">${esc(speaker ? speaker.name : off ? DASH : "— wybierz —")}</option>
          ${devices.filter((d) => d.mac !== m.mac).map((d) => `<option value="${esc(d.mac)}">${esc(d.name || d.mac)}</option>`).join("")}
        </select></span>${I("menu-down", 20, "var(--dim)")}
      </label>
      <label class="field" style="display:block"><span class="label">MAC głośnika</span>
        <input class="mono" data-key="mac" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF" value="${esc(off ? "" : this.draft.mac ?? m.mac ?? "")}"></label>
    </div>
  </div>` : ""}
</div>

<div class="panel">
  <button class="row head" data-act="sd-toggle" aria-expanded="${ui.sdOpen}">
    <span class="title">${I("sd", 20, "var(--accent)")}Karta SD i diagnostyka</span>
    <span style="display:inline-flex;align-items:center;gap:8px;flex:0 0 auto">
      <span class="mono" style="font-size:12px;color:var(--dim);font-weight:600">${esc(sdSummary)}</span>
      ${I(ui.sdOpen ? "chevron-up" : "chevron-down", 22, "var(--dim)")}
    </span>
  </button>
  ${ui.sdOpen ? `<div style="display:grid;gap:12px">
    <div class="box">
      <div class="row"><span style="font-size:13px;color:var(--dim);font-weight:600">Stan karty</span>
        <span class="mono" style="font-size:13px;font-weight:600;color:var(${msgErr ? "--danger" : "--ink"})">${esc(sdState)}</span></div>
      ${m.sdBusy ? progressBar(m.sdPct, "background:var(--divider)") : ""}
      <button class="ghostbtn${off || !m.sdReady ? " disabled" : ""}" data-act="sd-sync">${I("download-outline", 19, "var(--accent)")}Pobierz brakujące na kartę</button>
    </div>
    <div class="danger-zone">
      <div style="display:flex;gap:8px;align-items:center;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--danger)">
        ${I("alert-outline", 17)}Strefa niebezpieczna</div>
      <div style="font-size:12.5px">Formatowanie usuwa <b>wszystkie</b> dźwięki z karty SD. Wymaga dwóch naciśnięć w ciągu 10 s.</div>
      <button class="fmt${off ? " disabled" : ""}" data-act="format" style="background:${armedLeft ? "var(--danger)" : "transparent"};color:${armedLeft ? "#fff" : "var(--danger)"}">
        ${I(armedLeft ? "timer-sand" : "delete-forever-outline", 19)}${armedLeft ? `Naciśnij ponownie w ciągu ${armedLeft} s` : "Formatuj kartę SD"}</button>
      ${armedLeft ? `<span class="bar" style="height:5px;background:var(--divider)"><i style="width:${armedLeft * 10}%;background:var(--danger);transition:width .5s linear"></i></span>` : ""}
    </div>
    <div class="diag">
      ${[["wifi", "Wi-Fi", m.rssi ? String(m.rssi).replace("-", "−") + " dBm" : DASH],
         ["memory", "Wolny RAM", m.heap != null ? kb(m.heap) : DASH],
         ["chip", "PSRAM", m.psram != null ? kb(m.psram) : DASH],
         ["database-outline", "Cache MP3", m.cache != null ? kb(m.cache) : DASH]]
        .map(([ic, k, v]) => `<div><span class="k">${I(ic, 15)}${k}</span><span class="v mono">${off ? DASH : esc(v)}</span></div>`).join("")}
    </div>
  </div>` : ""}
</div>
</div>`;
  }
}

// pasek postepu: znany procent albo animacja, gdy rozmiar nieznany
function progressBar(pct, style) {
  const fill = pct >= 0 ? `<i style="width:${pct}%;transition:width .4s"></i>` : `<i class="indet"></i>`;
  return `<span class="bar" style="${style}">${fill}</span>`;
}

function fillTrack(v) {
  return `linear-gradient(90deg,var(--accent) 0 ${v}%,var(--chip) ${v}% 100%)`;
}

function centerTrack(v) {
  const p = ((v + 12) / 24) * 100;
  const a = Math.min(50, p), b = Math.max(50, p);
  return `linear-gradient(90deg,var(--chip) 0 ${a}%,var(--accent) ${a}% ${b}%,var(--chip) ${b}% 100%)`;
}

function eqRow(key, label, v, off, I) {
  return `<div style="display:grid;gap:7px">
  <div class="row">
    <span style="font-size:13px;font-weight:600;color:var(--dim)">${label}</span>
    <span style="display:inline-flex;align-items:center;gap:10px">
      <span class="mono" style="font-size:13.5px;font-weight:600" data-label="${key}">${off ? DASH : dB(v)}</span>
      <button class="reset" data-act="reset-${key}" aria-label="Reset ${label}">${I("restore", 18)}</button>
    </span>
  </div>
  <div class="slider center" style="--track:${centerTrack(v)}">
    <input type="range" min="-12" max="12" step="1" value="${v}" data-key="${key}" aria-label="${label}">
  </div>
  <div class="scale mono"><span>−12 dB</span><span>0</span><span>+12 dB</span></div>
</div>`;
}
