import { EspJblView, ensureFonts } from "./core.js";

const VERSION = "__VERSION__";

// Klucz -> [domena, sufiks encji]. Identyfikator = domena.<prefix>_<sufiks>
const ENTITIES = {
  playing: ["sensor", "odtwarzane"],
  bt: ["binary_sensor", "glosnik_polaczony"],
  stop: ["button", "stop"],
  volume: ["number", "glosnosc"],
  loop: ["switch", "zapetlaj"],
  sounds: ["sensor", "zapisane_dzwieki"],
  play_url: ["text", "odtworz_url"],
  select: ["select", "wybierz_dzwiek"],
  play_selected: ["button", "odtworz_wybrany"],
  delete_selected: ["button", "usun_wybrany"],
  form_name: ["text", "nowy_dzwiek_nazwa"],
  form_url: ["text", "nowy_dzwiek_url"],
  form_type: ["select", "nowy_dzwiek_kategoria"],
  form_save: ["button", "zapisz_dzwiek"],
  message: ["sensor", "komunikat"],
  bass: ["number", "bas"],
  treble: ["number", "soprany"],
  bt_scan: ["button", "skanuj_bluetooth"],
  bt_devices: ["sensor", "znalezione_urzadzenia_bt"],
  bt_mac: ["text", "mac_glosnika"],
  sd: ["sensor", "karta_sd"],
  sd_sync: ["button", "pobierz_brakujace_na_karte"],
  sd_format: ["button", "formatuj_karte_sd"],
  rssi: ["sensor", "wifi_rssi"],
  heap: ["sensor", "wolny_ram"],
  psram: ["sensor", "wolny_psram"],
  cache: ["sensor", "cache_mp3"],
  playlists: ["sensor", "playlisty"],
  playlist_now: ["sensor", "playlista_teraz"],
  shuffle: ["switch", "losowo"],
  next: ["button", "nastepny"],
};

const BAD = ["unavailable", "unknown", "none", ""];

function haIcon(name, px, color) {
  return `<ha-icon icon="mdi:${name}" style="--mdc-icon-size:${px}px;width:${px}px;height:${px}px;display:inline-flex;flex:0 0 auto${
    color ? ";color:" + color : ""
  }"></ha-icon>`;
}

class EspJblCard extends HTMLElement {
  static getStubConfig() {
    return { entity_prefix: "esp_jbl" };
  }

  setConfig(config) {
    this.config = { entity_prefix: "esp_jbl", theme: "auto", ...config };
    if (this.view) this.update();
  }

  getCardSize() {
    return 14;
  }

  id(key) {
    const over = this.config.entities && this.config.entities[key];
    if (over) return over;
    const [domain, suffix] = ENTITIES[key];
    return `${domain}.${this.config.entity_prefix}_${suffix}`;
  }

  st(key) {
    return this._hass && this._hass.states[this.id(key)];
  }

  val(key) {
    const s = this.st(key);
    return s ? s.state : "unavailable";
  }

  num(key) {
    const n = parseFloat(this.val(key));
    return Number.isFinite(n) ? n : null;
  }

  call(domain, service, key, data = {}) {
    return this._hass.callService(domain, service, { entity_id: this.id(key), ...data });
  }

  // komendy playlist ida bezposrednio przez MQTT (topic_prefix = DEVICE_ID z firmware)
  mqtt(topic, payload = "") {
    const prefix = this.config.topic_prefix || this.config.entity_prefix;
    return this._hass.callService("mqtt", "publish", { topic: `${prefix}/${topic}`, payload: String(payload) });
  }

  press(key) {
    return this.call("button", "press", key);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.view) this.init();
    this.update();
  }

  init() {
    ensureFonts();
    const root = this.attachShadow({ mode: "open" });
    const text = (key, value) => this.call("text", "set_value", key, { value });
    this.view = new EspJblView(root, {
      icon: haIcon,
      extraCss: ":host{display:block}",
      handlers: {
        stop: () => this.press("stop"),
        setVolume: (v) => this.call("number", "set_value", "volume", { value: v }),
        setLoop: (on) => this.call("switch", on ? "turn_on" : "turn_off", "loop"),
        play: async (name) => {
          await this.call("select", "select_option", "select", { option: name });
          await this.press("play_selected");
        },
        playUrl: (url) => text("play_url", url),
        selectSound: (name) => this.call("select", "select_option", "select", { option: name }),
        deleteSelected: async (name) => {
          await this.call("select", "select_option", "select", { option: name });
          await this.press("delete_selected");
        },
        addSound: async (name, url, type) => {
          // encja kategorii istnieje od firmware z kategoriami
          if (this.st("form_type")) {
            const option = type === "radio" ? "Radio" : type === "efekt" ? "Efekt" : "Auto";
            await this.call("select", "select_option", "form_type", { option });
          }
          await text("form_name", name);
          await text("form_url", url);
          await this.press("form_save");
        },
        setBass: (v) => this.call("number", "set_value", "bass", { value: v }),
        setTreble: (v) => this.call("number", "set_value", "treble", { value: v }),
        scan: () => this.press("bt_scan"),
        selectSpeaker: (_name, mac) => text("bt_mac", mac),
        setMac: (mac) => text("bt_mac", mac),
        sdSync: () => this.press("sd_sync"),
        sdFormatPress: () => this.press("sd_format"),
        playPlaylist: (name) => this.mqtt("playlist/play", name),
        next: () => this.press("next"),
        setShuffle: (on) => this.call("switch", on ? "turn_on" : "turn_off", "shuffle"),
        createPlaylist: (name) => this.mqtt("playlist/create", name),
        addToPlaylist: (pl, sound) => this.mqtt("playlist/add", `${pl}|${sound}`),
        removeFromPlaylist: (pl, i) => this.mqtt("playlist/remove", `${pl}|${i + 1}`),
        movePlaylistItem: (pl, from, to) => this.mqtt("playlist/move", `${pl}|${from + 1}|${to + 1}`),
        deletePlaylist: (name) => this.mqtt("playlist/delete", name),
      },
    });
  }

  update() {
    if (!this._hass || !this.view) return;
    const theme = this.config.theme;
    this.view.setDark(theme === "dark" || (theme !== "light" && !!(this._hass.themes && this._hass.themes.darkMode)));

    const playingState = this.val("playing");
    const offline = !this.st("playing") || playingState === "unavailable";

    const soundsSt = this.st("sounds");
    const sounds = (soundsSt && Array.isArray(soundsSt.attributes.sounds)) ? soundsSt.attributes.sounds : [];
    const typeList = (soundsSt && Array.isArray(soundsSt.attributes.types)) ? soundsSt.attributes.types : [];
    const devSt = this.st("bt_devices");
    const devices = ((devSt && devSt.attributes.devices) || []).map((line) => {
      const p = String(line).split("|").map((x) => x.trim());
      return { name: p[0] === "(bez nazwy)" ? "" : p[0], mac: p[1] || "", rssi: parseInt(p[2], 10) || 0, audio: p[3] === "audio" };
    });
    const sd = this.val("sd");
    const sdFree = (sd.match(/(-?\d+)\s*MB/) || [])[1];
    // "pobieranie halloween 35% · 30185 MB wolne"
    const sdJobM = sd.match(/^pobieranie\s*(.*?)(?:\s+(\d+)%)?\s*·/);
    const selected = this.val("select");
    const message = this.val("message");
    const mac = this.val("bt_mac");
    // "straszne 2/5" albo "brak"
    const plNowM = this.val("playlist_now").match(/^(.*) (\d+)\/(\d+)$/);
    const plSt = this.st("playlists");

    this.view.setModel({
      offline,
      playing: ["cisza", ...BAD].includes(playingState) ? "" : playingState,
      btStreaming: this.val("bt") === "on",
      volume: Math.round(this.num("volume") ?? 0),
      loop: this.val("loop") === "on",
      sounds,
      types: Object.fromEntries(sounds.map((n, i) => [n, typeList[i]]).filter(([, t]) => t)),
      selected: sounds.includes(selected) ? selected : "",
      message: BAD.includes(message) ? "" : message,
      bass: Math.round(this.num("bass") ?? 0),
      treble: Math.round(this.num("treble") ?? 0),
      scanning: !!(devSt && devSt.attributes.scanning),
      devices,
      mac: BAD.includes(mac) ? "" : mac,
      sdReady: !BAD.includes(sd) && sd !== "brak karty",
      sdBusy: sd.startsWith("pobieranie"),
      sdFree: sdFree != null ? Number(sdFree) : 0,
      sdJob: sdJobM ? sdJobM[1] : "",
      sdPct: sdJobM && sdJobM[2] != null ? Number(sdJobM[2]) : -1,
      rssi: this.num("rssi"),
      heap: this.num("heap"),
      psram: this.num("psram"),
      cache: this.num("cache"),
      playlists: (plSt && Array.isArray(plSt.attributes.playlists)) ? plSt.attributes.playlists : [],
      playlist: plNowM ? plNowM[1] : "",
      plPos: plNowM ? Number(plNowM[2]) : 0,
      plLen: plNowM ? Number(plNowM[3]) : 0,
      shuffle: this.val("shuffle") === "on",
    });
  }
}

customElements.define("esp-jbl-card", EspJblCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "esp-jbl-card",
  name: "ESP JBL",
  description: "Sterowanie ESP32 z głośnikiem Bluetooth: dźwięki, radio, brzmienie, karta SD.",
  preview: false,
  documentationURL: "https://github.com/__REPO__",
});
console.info(`%c ESP-JBL-CARD %c ${VERSION} `, "background:#e8620a;color:#fff;font-weight:700", "background:#1c1f24;color:#fff");
