import { EspJblView, ensureFonts, xhrUpload } from "./core.js";

// Panel WWW serwowany przez ESP: stan z /api/state, komendy przez /api/cmd/<temat MQTT>
const POLL_MS = 1500;

function mdiIcon(name, px, color) {
  return `<span class="mdi mdi-${name}" style="font-size:${px}px;line-height:1;display:inline-flex;flex:0 0 auto${
    color ? ";color:" + color : ""
  }"></span>`;
}

const root = document.getElementById("app");
let fails = 0;
let model = null;
let pollTimer = null;

async function cmd(topic, value = "") {
  await fetch("/api/cmd/" + topic, { method: "POST", body: String(value) });
  setTimeout(poll, 250);
}

ensureFonts();
const view = new EspJblView(root, {
  icon: mdiIcon,
  handlers: {
    stop: () => cmd("stop"),
    setVolume: (v) => cmd("volume/set", v),
    setLoop: (on) => cmd("loop/set", on ? "ON" : "OFF"),
    play: (name) => cmd("play", name),
    playUrl: (url) => cmd("play", url),
    selectSound: (name) => cmd("select/set", name),
    deleteSelected: (name) => cmd("sound/delete", name),
    addSound: (name, url, type) => cmd("sound/add", `${name}|${url}|${type}`),
    setBass: (v) => cmd("bass/set", v),
    setTreble: (v) => cmd("treble/set", v),
    scan: () => cmd("bt/scan"),
    selectSpeaker: (_name, mac) => cmd("bt/mac/set", mac),
    setMac: (mac) => cmd("bt/mac/set", mac),
    sdSync: () => cmd("sd/sync"),
    sdFormatPress: () => cmd("sd/format"),
    playPlaylist: (name) => cmd("playlist/play", name),
    next: () => cmd("media/next"),
    prev: () => cmd("media/prev"),
    resume: () => cmd("media/playpause"),
    setSpeakerButtons: (on) => cmd("speaker/buttons/set", on ? "ON" : "OFF"),
    uploadFile: (file, name, onProgress) =>
      xhrUpload(`/api/upload?name=${encodeURIComponent(name)}`, file, onProgress).then((r) => {
        setTimeout(poll, 300);
        return r;
      }),
    setShuffle: (on) => cmd("shuffle/set", on ? "ON" : "OFF"),
    createPlaylist: (name) => cmd("playlist/create", name),
    addToPlaylist: (pl, sound) => cmd("playlist/add", `${pl}|${sound}`),
    removeFromPlaylist: (pl, i) => cmd("playlist/remove", `${pl}|${i + 1}`),
    movePlaylistItem: (pl, from, to) => cmd("playlist/move", `${pl}|${from + 1}|${to + 1}`),
    deletePlaylist: (name) => cmd("playlist/delete", name),
  },
});

const dark = window.matchMedia("(prefers-color-scheme: dark)");
const applyTheme = () => {
  view.setDark(dark.matches);
  document.documentElement.style.cssText = view.host.getAttribute("style");
};
dark.addEventListener("change", applyTheme);
applyTheme();

async function poll() {
  clearTimeout(pollTimer);
  try {
    const r = await fetch("/api/state", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    const s = await r.json();
    fails = 0;
    model = {
      offline: false,
      playing: s.playing || "",
      btStreaming: s.bt_streaming,
      volume: s.volume,
      loop: s.loop,
      sounds: s.sounds || [],
      types: Object.fromEntries((s.sounds || []).map((n, i) => [n, (s.sound_types || [])[i]]).filter(([, t]) => t)),
      selected: s.selected || "",
      message: s.message || "",
      bass: s.bass,
      treble: s.treble,
      scanning: s.bt_scanning,
      devices: s.bt_devices || [],
      mac: s.mac || "",
      sdReady: s.sd_ready,
      sdBusy: s.sd_busy,
      sdFree: s.sd_free_mb,
      sdJob: s.sd_job || "",
      sdPct: s.sd_pct ?? -1,
      rssi: s.rssi,
      heap: s.heap,
      psram: s.psram,
      cache: s.cache,
      playlists: s.playlists || [],
      playlist: s.playlist || "",
      plPos: s.pl_pos,
      plLen: s.pl_len,
      shuffle: s.shuffle,
      spkButtons: s.spk_buttons,
      posMs: s.pos_ms,
      durMs: s.dur_ms,
      plTotalMs: s.pl_total_ms,
      plLeftMs: s.pl_left_ms,
      plApprox: s.pl_approx,
      posAt: Date.now(),
    };
    const ip = document.getElementById("ip");
    if (ip) ip.textContent = (s.ip || location.host) + (s.mqtt ? "" : " · MQTT offline");
    view.setModel(model);
  } catch (e) {
    if (++fails >= 2) view.setModel({ ...(model || { sounds: [], devices: [] }), offline: true });
  }
  pollTimer = setTimeout(poll, document.hidden ? POLL_MS * 4 : POLL_MS);
}

document.addEventListener("visibilitychange", () => !document.hidden && poll());
poll();
