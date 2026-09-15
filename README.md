# ESP JBL Card

Karta Lovelace do sterowania **ESP JBL**, czyli ESP32 (WROVER z PSRAM), które odtwarza dźwięki i radio internetowe na głośniku Bluetooth. Urządzenie jest sterowane przez MQTT z automatycznym wykrywaniem w Home Assistant.

Sekcje karty:
- **Teraz gra:** co jest odtwarzane, stan głośnika Bluetooth, Stop, głośność, zapętlanie.
- **Dźwięki i radio:** kafelki z zakładkami Efekty/Radio, odtwarzanie z adresu URL, usuwanie z potwierdzeniem.
- **Dodaj dźwięk / stację:** nazwa i URL; plik sam pobiera się na kartę SD.
- **Brzmienie:** bas i soprany w zakresie −12…+12 dB.
- **Głośnik Bluetooth:** skanowanie i wybór głośnika.
- **Karta SD i diagnostyka:** pobieranie brakujących plików, formatowanie (dwa naciśnięcia w ciągu 10 s), Wi-Fi, RAM, PSRAM, cache.

Karta sama przełącza jasny i ciemny motyw, a na szerokim ekranie układa się w dwie kolumny.

## Instalacja (HACS)

1. HACS → menu ⋮ → **Custom repositories**.
2. Wklej adres tego repozytorium i wybierz typ **Dashboard**.
3. Zainstaluj **ESP JBL Card** i odśwież przeglądarkę.
4. Dodaj kartę do dashboardu:

```yaml
type: custom:esp-jbl-card
```

## Konfiguracja

| Opcja | Domyślnie | Opis |
|---|---|---|
| `entity_prefix` | `esp_jbl` | Wspólny początek identyfikatorów encji (`sensor.esp_jbl_odtwarzane` itd.) |
| `theme` | `auto` | `auto`, `light` albo `dark` |
| `entities` | – | Nadpisanie pojedynczych encji, gdy HA nadał im inne identyfikatory |

Przykład z nadpisaniem encji, która dostała przyrostek `_2`:

```yaml
type: custom:esp-jbl-card
entities:
  volume: number.esp_jbl_glosnosc_2
```

Klucze w `entities`: `playing`, `bt`, `stop`, `volume`, `loop`, `sounds`, `play_url`, `select`, `play_selected`, `delete_selected`, `form_name`, `form_url`, `form_save`, `message`, `bass`, `treble`, `bt_scan`, `bt_devices`, `bt_mac`, `sd`, `sd_sync`, `sd_format`, `rssi`, `heap`, `psram`, `cache`.

Pozycja jest traktowana jako **stacja radiowa**, gdy jej nazwa zaczyna się od `radio_` albo zawiera `fm`.

## Panel WWW na ESP

Ten sam interfejs jest wbudowany w firmware i działa pod adresem `http://IP-ESP/`, także bez Home Assistant. `python build.py` tworzy:

- `dist/esp-jbl-card.js`: kartę do HACS,
- `dist/esp-jbl-web.html`: panel WWW. Opcja `--esp ścieżka/do/src/web/index.html` od razu kopiuje go do projektu firmware.

API panelu:

| Metoda | Adres | Opis |
|---|---|---|
| GET | `/api/state` | Pełny stan w JSON |
| POST | `/api/cmd/<temat>` | Komenda jak z MQTT, np. `/api/cmd/volume/set` z treścią `40` |
| GET | `/snd/<nazwa>.mp3` | Plik dźwięku z karty SD (np. dla Google Home) |

## Licencja

MIT
