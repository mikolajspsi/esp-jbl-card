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
| `topic_prefix` | = `entity_prefix` | Początek tematów MQTT (`DEVICE_ID` z firmware), używany przez komendy playlist |
| `esp_host` | IP z atrybutów | Adres ESP do wgrywania plików, np. `192.168.100.50` |
| `entities` | – | Nadpisanie pojedynczych encji, gdy HA nadał im inne identyfikatory |

Przykład z nadpisaniem encji, która dostała przyrostek `_2`:

```yaml
type: custom:esp-jbl-card
entities:
  volume: number.esp_jbl_glosnosc_2
```

Klucze w `entities`: `playing`, `bt`, `stop`, `volume`, `loop`, `sounds`, `play_url`, `select`, `play_selected`, `delete_selected`, `form_name`, `form_url`, `form_type`, `form_save`, `message`, `bass`, `treble`, `bt_scan`, `bt_devices`, `bt_mac`, `sd`, `sd_sync`, `sd_format`, `rssi`, `heap`, `psram`, `cache`, `playlists`, `playlist_now`, `shuffle`, `next`, `prev`, `playpause`, `spk_buttons`.

Kategorię wybierasz przy dodawaniu: **Auto** (domyślnie), **Efekt** albo **Radio**. W trybie Auto ESP sam otwiera link: transmisja na żywo (bez rozmiaru pliku) staje się radiem, zwykły plik — efektem. Stacje nie są pobierane na kartę SD, grają z sieci. Dźwięki dodane przed wprowadzeniem kategorii ESP rozpoznaje przy synchronizacji karty albo przy pierwszym odtworzeniu.

## Playlisty

- Sekcja **Playlisty** służy do tworzenia playlist, odtwarzania ich jednym dotknięciem i edycji pozycji: dodawania, usuwania i zmiany kolejności.
- **Przytrzymanie kafelka dźwięku** otwiera menu **Dodaj do playlisty** (można tam też od razu utworzyć nową) oraz **Usuń dźwięk**.
- Podczas odtwarzania playlisty obok Stop pojawia się **Następny**. **Losowa kolejność** miesza pozycje, a **Zapętlaj** powtarza całą playlistę.
- Limity to 8 playlist po 24 pozycje. Usunięty dźwięk znika też ze wszystkich playlist.
- Komendy playlist karta wysyła usługą `mqtt.publish`, więc w Home Assistant musi być skonfigurowana integracja MQTT.

## Przyciski głośnika

ESP zgłasza się głośnikowi jako pilot (AVRCP), więc przyciski na JBL działają tak jak przy telefonie:

| Przycisk na głośniku | Działanie |
|---|---|
| Play / Pause | zatrzymuje albo wznawia ostatnio grane (playlistę od bieżącej pozycji) |
| Następny | kolejna pozycja playlisty, a poza playlistą kolejna stacja lub efekt z tej samej kategorii |
| Poprzedni | poprzednia pozycja / stacja; przy losowej kolejności odtwarza bieżącą pozycję od początku |

- Karta ma przyciski ⏮ **Stop** ⏭, a gdy nic nie gra: **Wznów**.
- Każde naciśnięcie trafia też do Home Assistant jako zdarzenie encji **Przycisk głośnika** (`playpause`, `stop`, `next`, `prev`), więc można je wykorzystać w automatyzacjach.
- Przełącznik **Przyciski głośnika sterują ESP** wyłącza sterowanie odtwarzaniem. Zdarzenia dla automatyzacji nadal są wysyłane.
- Nie każdy głośnik wysyła polecenia pilota. W logu ESP naciśnięcie widać jako `bt: Przycisk glosnika: 0x..`.

## Czas odtwarzania

- „Teraz gra” pokazuje pasek postępu z czasem, który minął, pozostałym czasem i długością utworu. Czas liczony jest z dźwięku faktycznie wysłanego do głośnika.
- Radio pokazuje „na żywo” i czas słuchania.
- Przy playliście widać długość całości i czas do końca. Znak `~` oznacza, że długość którejś pozycji jest nieznana, np. stacji radiowej albo pliku, którego nie ma na karcie.

## Wgrywanie plików z urządzenia

- W sekcji „Dodaj dźwięk / stację” wybierz **Z pliku**, wskaż MP3 z komputera lub telefonu i naciśnij **Wyślij na kartę SD**. Plik trafia prosto na kartę w ESP, bez serwera i linku.
- Karta w Home Assistant wysyła plik bezpośrednio do ESP (`http://IP/api/upload`). Jeśli HA działa przez HTTPS, przeglądarka zablokuje wysyłanie do ESP po HTTP. Wtedy wgraj plik przez panel ESP (`http://IP-ESP/`).
- Limit rozmiaru to 20 MB. Wymagana jest karta SD.

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
| POST | `/api/upload?name=<nazwa>` | Wgranie pliku MP3 (treść żądania = plik) na kartę SD |

## Licencja

MIT
