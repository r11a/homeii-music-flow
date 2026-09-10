# דו״ח תאימות HOMEii Flow 6.0.0 מול Music Assistant 2.10.0b11

> מסמך זה הוא דו״ח המחקר המקורי ששימש לתכנון המעבר. המימוש המקומי העדכני הוא HOMEii Flow Engine `0.7.2`, דורש API schema `65` ומעלה, וכולל חוזה ישיר ומאומת לתור, ספרייה, חיפוש, נגנים ועטיפות. לבדיקת המימוש העדכני יש להשתמש במסמך `MA_2.10.0B11_LOCAL_INSTALL_AND_TEST_HE.md`.

תאריך בדיקה: 6 באוגוסט 2026  
גרסת Music Assistant שנבדקה: `2.10.0b11`  
Commit רשמי שנבדק: `ce9438e12952dea5645d66fd1b44cf0448aa9000`  
API schema בגרסה שנבדקה: `43` (השרת מצהיר על minimum supported schema `28`)  
גרסת הכרטיס המקומית: `6.0.0`  
גרסת HOMEii Flow Engine המקומית: `0.5.2`

## תקציר מנהלים

HOMEii Flow 6.0.0 כבר מכסה היטב את מסלול השימוש היומיומי: גילוי נגנים, Play/Pause/Next/Previous, עוצמה, Seek, Shuffle/Repeat בסיסיים, תור, העברה בין נגנים, קבוצות, ספרייה, חיפוש, מועדפים, המלצות, פודקאסטים, היסטוריה, הכרזות, Sendspin, תזמונים ואבחון HOMEii.

עם זאת, אי אפשר להגדיר את המצב הנוכחי כ״התאמה מלאה ל־2.10.0b11״. הפער איננו בעיקר אצל ספקי מוזיקה חדשים; רובם זורמים דרך מודל המדיה הגנרי. הפערים העיקריים הם בחוזה ה־API ובסוגי היכולת החדשים:

1. מודל התור החדש: Autoplay, Smart Shuffle, Crossfade ברמת תור, Overlay, מצב Dynamic/Finished ו־Playback Speed.
2. Audiobooks, Collections, Authors/Narrators, Chapters והמשך האזנה לפי משתמש.
3. DSP מלא: קריאה ושמירה של שרשרת DSP, Presets, Impulse Responses ופילטרים חדשים.
4. Setup/Reconfigure Flows, Config Actions וסטטוס ספקים.
5. Dashboards, Party, Music Quiz ו־AI Radio.
6. מטא־דאטה מתקדם: BPM, Key, Waveform, Audio Processing, External IDs ו־Album Artist מלא.
7. אבטחת API, Scopes, זיהוי גרסת שרת ו־Contract Tests מול `2.10.0b11`.
8. חיבור אירועים מתמשך בין ה־Engine ל־Music Assistant במקום הסתמכות בעיקר על HTTP ופולינג.

המסקנה: אפשר להגיע לתאימות ליבה גבוהה מאוד בתוך 6.0.0, אבל ״שכפול מלא של כל ממשק Music Assistant״ אינו יעד נכון לכרטיס HOMEii. עדיף להגדיר שני יעדים:

- **תאימות פרוטוקול מלאה:** כל היכולות הרלוונטיות עובדות נכון מול 2.10.0b11, גם אם אין להן מסך HOMEii ייעודי.
- **תאימות מוצר נבחרת:** HOMEii מציג ושולט ביכולות החשובות למשתמש ביתי, ומשאיר ניהול ספקים, משתמשים ותשתית למסך הרשמי של Music Assistant.

## היקף ואמינות הבדיקה

הבדיקה כללה:

- סקירת קוד מלאה של הכרטיס המקומי ושל HOMEii Flow Engine.
- סקירת כל גרסאות הבטא הציבוריות `2.10.0b0`–`2.10.0b11`. לא פורסמה `2.10.0b8`.
- בדיקת קוד המקור הרשמי של Music Assistant בתג `2.10.0b11`.
- בדיקת פקודות ה־API שהכרטיס וה־Engine שולחים מול הפקודות הרשומות בשרת.
- הרצת בדיקות מקומיות ו־lint.

לא בוצעה בדיקת End-to-End מול שרת Music Assistant החי של המשתמש, ולכן זהו **Audit סטטי ו־Contract Review**, לא אישור סופי שהתקנה מסוימת עוברת את כל התרחישים.

מקורות רשמיים:

- [Music Assistant 2.10.0b11 release](https://github.com/music-assistant/server/releases/tag/2.10.0b11)
- [Music Assistant API documentation](https://www.music-assistant.io/api/)
- [API source at tag 2.10.0b11](https://github.com/music-assistant/server/tree/2.10.0b11/music_assistant/controllers)
- [Queue controller at 2.10.0b11](https://github.com/music-assistant/server/blob/2.10.0b11/music_assistant/controllers/player_queues/controller.py)
- [Dashboard controller at 2.10.0b11](https://github.com/music-assistant/server/blob/2.10.0b11/music_assistant/controllers/dashboard/controller.py)
- [Player configuration API at 2.10.0b11](https://github.com/music-assistant/server/blob/2.10.0b11/music_assistant/controllers/config/players.py)
- [User management](https://www.music-assistant.io/settings/user-management/)

## הגדרה נכונה של ״התאמה מלאה״

יש כאן הנחה שדורשת תיקון: כל שינוי שמופיע ב־release notes אינו בהכרח משהו שצריך להוסיף לכרטיס.

שלוש קבוצות שונות מופיעות בגרסאות הבטא:

1. **שינויים פנימיים בשרת או בספק** — לדוגמה תיקוני AirPlay, שיפור ביצועי DB או ספק Overcast. בדרך כלל הכרטיס אינו צריך שינוי.
2. **שינויי חוזה API או Schema** — לדוגמה Summary Items, Scopes, Queue Fields ופקודות חדשות. אלה כן מחייבים התאמה.
3. **יכולות UI חדשות** — לדוגמה Music Quiz או DSP editor. כאן צריך להחליט אם HOMEii רוצה להציג אותן, להפנות לממשק הרשמי, או להתעלם מהן.

לכן הקריטריון המומלץ הוא:

| רמה | פירוש | יעד ל־6.0.0 |
|---|---|---|
| Protocol Compatible | אין פקודות שבורות, schema מוכר, שגיאות ברורות, הרשאות נכונות | חובה |
| Core Feature Compatible | נגנים, תור, ספרייה, חיפוש, קבוצות, פודקאסטים, ספרי שמע ו־DSP בסיסי | חובה |
| Extended Feature Compatible | Party, Quiz, Dashboards, AI Radio, Setup Flows | רצוי לפי סדר עדיפויות |
| UI Parity | כל מסך ופעולה מהממשק הרשמי קיימים ב־HOMEii | לא מומלץ כיעד |

## מצב מקומי קיים

### מה כבר בנוי היטב

| תחום | מצב | הערה |
|---|---|---|
| Engine-first architecture | קיים | הכרטיס דורש Engine והליבה אינה נופלת למסלול Direct ישן |
| Handshake ו־Capabilities | קיים | הכרטיס דורש Engine `0.5.2+` ורשימת יכולות |
| Player discovery/control | קיים | Play, Pause, Stop, Next, Previous, Seek, Volume, Mute |
| Queue read/actions | קיים חלקית | Snapshot, Play Index, Delete, Move, Transfer |
| Library/Search | קיים | מסלול HA ובנוסף MA server command bridge |
| Favorites | קיים | Add/Remove ומצב UI |
| Recommendations | קיים | `music/recommendations` ו־similar tracks |
| Podcasts | קיים בסיסית | ספרייה וחיפוש; אין Episode/Chapter experience מלא |
| Grouping | קיים | Engine group orchestration |
| Announcements | קיים | דרך Engine ו־Music Assistant/HA |
| Sendspin browser player | קיים | אך דורש בדיקות התאמה ייעודיות ל־2.10 |
| Artwork proxy | קיים | יתרון חשוב לחיבור מרחוק ול־CORS |
| Diagnostics | קיים | HOMEii diagnostics טובים, אך חסרה תמונת MA מלאה |
| Localization/RTL | קיים | יתרון ברור של HOMEii |

### ארכיטקטורה נוכחית

הנתיב בפועל הוא:

`HOMEii Flow Card 6.0.0 → Home Assistant WebSocket → HOMEii Flow Engine 0.5.2 → HA services + Music Assistant POST /api ו־WebSocket /ws`

זהו כיוון נכון. עם זאת, ה־Engine עדיין מתפקד בחלקו כמתאם ניסיונות מרובה־וריאציות ולא כלקוח API קשיח לגרסה ידועה. כדי לקבל תאימות אמיתית צריך להפוך אותו ל־typed adapter עם חוזה וגרסאות.

## ממצאים קריטיים

### P0.1 — הכרטיס אינו יודע בפועל איזו גרסת Music Assistant מחוברת

הכרטיס שומר `maServerVersion` ו־`maSchemaVersion` רק מ־Direct WebSocket greeting. ב־6.0.0 מסלול Direct ליבה מבוטל, ולכן ברוב ההתקנות המידע הזה לא יגיע.

נדרש:

- ה־Engine יקרא `info` בזמן handshake.
- ה־Engine יחזיר `music_assistant.server_version`, `schema_version`, `api_commands_hash` ו־capabilities.
- הכרטיס יציג מצב: supported, newer-untested, older-unsupported.
- לקבוע טווח מפורש, לדוגמה `>=2.9.0 <2.11.0`, ובדיקת יעד מיוחדת ל־`2.10.0b11`.

### P0.2 — ה־API הרשמי דורש token לכל בקשה, אבל ה־Engine מנסה גם ללא token

התיעוד הרשמי קובע שכל בקשה צריכה Long-Lived Access Token ב־Bearer header. כרגע ה־Engine בונה:

`auth_candidates = tokens + [""]`

כלומר הוא מנסה בסוף גם בקשה אנונימית. ב־2.10 זה אינו חוזה תקין, מוסיף שגיאות 401 ועלול להסתיר תצורה חסרה.

נדרש:

- לא לבצע ניסיון אנונימי מול `/api`.
- להחזיר שגיאת `missing_music_assistant_token` ברורה.
- לא לשמור או להחזיר token ללקוח.
- להוסיף בדיקת token/scopes בזמן setup של ה־Engine.

### P0.3 — גשר `ma/command` כללי מדי

ה־Engine מאפשר להעביר שם פקודה ו־args כמעט ללא allowlist. המשמעות היא שכל משתמש Home Assistant שיכול לקרוא לפקודת ה־WebSocket של האינטגרציה עשוי להפעיל כל פקודת MA שה־token מאפשר.

נדרש:

- allowlist לפי capability, לא arbitrary command.
- הפרדה בין פקודות read, queue control, player control ו־config write.
- חסימה מוחלטת של user management, token management, provider delete ופעולות אדמין מהכרטיס.
- רישום audit ללא token/Authorization header.
- רצוי token ייעודי ל־HOMEii עם מינימום scopes.

### P0.4 — ה־Engine אינו מחזיק חיבור MA WebSocket מתמשך

פקודות מתקדמות עוברות דרך `POST /api`, בעוד state נשען על HA entities, קריאות snapshot ופולינג. הדבר עובד לשימוש בסיסי, אך אינו מספק:

- Queue change events מיידיים.
- Provider/config status updates.
- Setup-flow progress.
- Dashboard/Party/Quiz events.
- עדכון חלק של metadata, waveform או analysis.
- זיהוי reconnect ושינוי schema בזמן אמת.

נדרש MA client יחיד ב־Engine עם reconnect, event subscription, backoff ו־state cache. הכרטיס צריך לקבל אירועים מאוחדים דרך HA WebSocket.

### P0.5 — ניסיון Queue fallback כולל args שאינם תקינים ל־2.10

ב־`2.10.0b11`, הפקודה `player_queues/get` מקבלת `queue_id`. ה־Engine מנסה גם:

- `{ player_id: entity_id }`
- `{ entity_id: entity_id }`

ניסיונות אלה אינם חלק מהחוזה הנוכחי. הם ייכשלו אם לא נמצא `queue_id`.

נדרש:

1. `players/get` או player snapshot.
2. פתרון `active_group` / `synced_to`.
3. `player_queues/get_active_queue(player_id)`.
4. שימוש ב־`queue_id` שהוחזר עבור `player_queues/get/items`.

### P0.6 — אין Contract Tests אמיתיים מול API 2.10.0b11

הבדיקות המקומיות בודקות foundations ו־helpers, אך אינן טוענות schema רשמי או מריצות adapter מול שרת MA.

נדרש:

- Fixture של `info`, `players/all`, `player_queues/all/get/items`, library summary/full, search, recommendations ו־events.
- בדיקת כל command/args מול `/api-docs` של 2.10.0b11.
- Matrix מול 2.9 stable, 2.10.0b11 ו־latest nightly כ־informational.
- Golden fixtures ל־PlayerQueue, QueueItem, Audiobook, PodcastEpisode, Collection ו־DSP.

### P0.7 — קיימת כרגע בדיקת Vitest נכשלת

הרצת `npm test` עברה את רוב הבדיקות אך נכשלה בבדיקה:

`tests/settings-accordion.test.js`  
`explains that direct Music Assistant access does not replace the HA integration`

הטקסט בפועל השתנה למסך Engine-required, אך הציפייה הישנה נשארה. זה כנראה כשל בדיקה מיושנת, לא בהכרח כשל runtime, אבל אסור לסמן את 6.0.0 כ־release-ready לפני יישור החוזה והבדיקה.

`npm run lint` עבר בהצלחה.  
`HOMEii Flow Engine scripts/validate_repo.py` עבר בהצלחה.

## פערי יכולת לפי תחום

### 1. Queue ו־Playback — עדיפות P0

Music Assistant 2.10 הוסיף והרחיב:

- `player_queues/autoplay`
- מצבי Autoplay דומים/ספרייה/playlist
- `player_queues/crossfade`
- Smart Shuffle ו־`smart_shuffle_active`
- Dynamic/Endless Mix queues
- `player_queues/overlay`
- `player_queues/set_playback_speed`
- `start_from_beginning` ל־podcast episode
- finished queue שנשמר וניתן להפעיל שוב
- מצב queue banner והסבר מקור דינמי

HOMEii כרגע מציג Shuffle/Repeat בסיסיים בלבד. ה־sleep timer המקומי מבוסס דפדפן ועצירת נגן, ולא ה־native player sleep timer של MA.

מומלץ להוסיף ל־Engine:

| HOMEii command | Music Assistant command |
|---|---|
| `queue/autoplay` | `player_queues/autoplay` |
| `queue/crossfade` | `player_queues/crossfade` |
| `queue/overlay` | `player_queues/overlay` |
| `queue/playback_speed` | `player_queues/set_playback_speed` |
| `queue/active` | `player_queues/get_active_queue` |
| `player/sleep_timer/get` | `players/sleep_timer/get` |
| `player/sleep_timer/set` | `players/sleep_timer/set` |
| `player/sleep_timer/clear` | `players/sleep_timer/clear` |

בכרטיס:

- Queue mode badge: Normal / Autoplay / Endless Mix / Finished.
- Smart Shuffle indicator, ולא רק shuffle boolean.
- Crossfade toggle שמבין מצב Global/Override.
- Playback speed `0.5–3.0` רק לפודקאסטים וספרי שמע.
- Start from beginning.
- Native sleep timer עם fallback מקומי רק אם השרת אינו תומך.
- Overlay picker ממדיה מסוג `sound_effect`.

### 2. Audiobooks, Podcasts ו־Collections — עדיפות P0/P1

הכרטיס אינו מכיל `audiobook` כ־media type. זהו הפער הפונקציונלי הגדול ביותר בספרייה.

API נדרש:

- `music/audiobooks/library_items`
- `music/audiobooks/get`
- `music/audiobooks/get_collection`
- `music/audiobooks/audiobook_versions`
- `music/artists/artist_audiobooks`
- `music/podcasts/podcast_episodes`
- `music/podcasts/podcast_episode`
- `music/podcasts/get_collection`
- `music/in_progress_items`
- `music/mark_played` / `music/mark_unplayed`

UI נדרש:

- לשונית Audiobooks.
- Authors ו־Narrators, לא להניח שכל `artist` הוא אמן מוזיקה.
- Collections מתקפלות.
- Resume position ו־progress per user.
- Chapters לפודקאסטים וספרי שמע.
- Play from beginning.
- Playback speed.
- הפרדה בין Podcast container ל־PodcastEpisode.

הערת אבטחה/פרטיות: ב־2.10 progress הוא תלוי משתמש. אסור ל־Engine לשטח resume state של משתמש אחד לכל כרטיסי HOMEii.

### 3. Library Summary Items — עדיפות P0

מ־2.10 רשימות ספרייה מחזירות summary items דקים כברירת מחדל. זה שיפור ביצועים, אך summary אינו חוזה מלא למסך פרטים.

האסטרטגיה הנכונה:

- רשימה: `summary: true`.
- פתיחת פריט: hydrate דרך `music/{type}/get` או `music/item_by_uri`.
- cache נפרד ל־summary ול־full item.
- אין להסיק שדות חסרים כערך ריק קבוע.
- מיזוג full item לתוך summary מבלי למחוק favorite/progress עדכניים.

הקוד המקומי כבר מבצע hydration בחלק מהמסכים, אך אין חוזה אחיד לכל media type ואין Audiobook/Collection.

### 4. DSP ו־Audio Analysis — עדיפות P1

2.10 כולל:

- Gain, Balance, High/Low-pass, Transpose.
- Stereo Width ו־Crossfeed.
- Convolution עם Impulse Response library.
- Safety Limiter ו־Compressor.
- Presets.
- BPM, musical key, waveform ו־audio processing details.
- Smart Fades משופרים.

API נדרש:

- `config/players/dsp/get`
- `config/players/dsp/save`
- `config/players/dsp/apply_preset`
- `config/dsp_presets/get/save/remove`
- `config/dsp_irs/list/upload/remove`
- `audio_analysis/wave_form`
- player/current media audio processing fields

מומלץ לפצל:

1. **P1A — Read-only DSP:** הצגת active preset, processing chain ו־bit-perfect status.
2. **P1B — Preset selection:** החלפת preset בטוחה.
3. **P1C — Full editor:** עריכת פילטרים והעלאת IR; זה מסך מורכב וסיכון גבוה יותר.

לא מומלץ להתחיל מעורך DSP מלא. קריאה ו־Preset selection יתנו רוב הערך בפחות סיכון.

### 5. Player/Provider Setup Flows — עדיפות P1

2.10 עבר ל־guided setup/reconfigure flows ול־`invoke_action`.

API רלוונטי:

- `config/flows/get`
- `config/flows/submit`
- `config/flows/abort`
- `config/providers/setup`
- `config/providers/reconfigure`
- `config/providers/invoke_action`
- `config/players/setup`
- `config/players/invoke_action`
- `config/core/invoke_action`

המלצה: לא לשכפל את כל wizard בתוך הכרטיס ב־6.0.0. הוסף:

- סטטוס ״דורש setup/reconfigure״.
- כפתור עמוק לממשק MA הרשמי.
- רק לאחר ייצוב 6.0 — wrapper ל־setup flow במסך HOMEii.

### 6. Dashboards, Party ו־Music Quiz — עדיפות P2

2.10 הוסיף dashboard controller ויכולת cast למסכי TV/Apple TV/Android TV, וכן Party ו־Music Quiz מורחבים.

Dashboard API:

- `dashboard/dashboards`
- `dashboard/register`
- `dashboard/unregister`
- `dashboard/show`
- `dashboard/hide`
- `dashboard/sessions`
- `dashboard/get_url`

מומלץ ל־HOMEii:

- תחילה כפתור “Show Now Playing on display”.
- אחר כך selector של display + hide.
- Party/Quiz כ־deep link או iframe/route רשמי, לא מימוש מחדש.
- אם מוסיפים host controls, לקבל state דרך event bridge ולא polling.

### 7. Provider additions — ברובם אין צורך בקוד ייעודי

נוספו לאורך הבטאות:

- Amplipi
- Sveriges Radio
- Pocket Casts
- Playlist Metadata
- Bose SoundTouch
- Profiler
- Rainy Mood
- Music Quiz
- Ambient Sounds
- Google Drive filesystem
- Yandex Station
- teddyCloud
- OneDrive filesystem
- AI Radio
- Overcast
- OpenAI Compatible AI
- OpenAI TTS
- ABC Radio Network

המשמעות ל־HOMEii:

- ספקי תוכן רגילים צריכים לעבוד דרך `media_type`, `uri`, images ו־provider mappings.
- אין להוסיף if/else לפי שם ספק.
- כן צריך לתמוך בסוגי תוכן חדשים: `audiobook`, `podcast_episode`, `sound_effect`, collections ו־dynamic sources.
- Plugins עם UI עצמאי — Music Quiz, Party, AI Radio — צריכים adapter ייעודי או deep link.

### 8. Metadata ו־Now Playing — עדיפות P1

שדות שכדאי להוסיף למודל HOMEii:

- `album_artist`
- `artist_type` — artist/author/narrator
- `bpm`
- `key`
- `waveform`
- `playback_speed`
- `chapters`
- `fully_played`
- `resume_position_ms`
- `smart_shuffle_active`
- `smart_fades_active`
- `is_dynamic`
- `finished`
- `overlay_enabled/source/volume`
- `audio_processing`
- `external_ids`
- `palette`

יש להוסיף normalizer יחיד ב־Engine ו־presentation model יחיד בכרטיס. כרגע הנרמול מפוזר בין HA shapes, MA shapes ומסכי כרטיס שונים.

### 9. Sendspin — עדיפות P0 לבדיקה, לא בהכרח לשכתוב

הכרטיס כבר כולל לקוח Sendspin מקומי, אך 2.10 שינה:

- encryption support.
- clock correction.
- faster web-player start.
- virtual players.
- remote access fixes.
- seek controller commands.
- announcement support לחלק מנגני Sendspin.

נדרש Test Matrix:

- HTTP/WS מקומי.
- HTTPS/WSS.
- encrypted Sendspin.
- reconnect.
- browser sleep/wake.
- seek.
- group with Cast/AirPlay.
- announcement interruption/resume.
- clock offset.

אין מספיק ראיות סטטיות כדי להצהיר שהלקוח המקומי תואם encryption ו־clock correction של 2.10.

## מפת API: קיים, תקין וחסר

### פקודות קיימות בכרטיס שנמצאו תקינות ב־2.10.0b11

- `players/all`
- `players/get`
- `player_queues/get`
- `player_queues/items`
- `player_queues/play_media`
- `player_queues/play_index`
- `player_queues/delete_item`
- `player_queues/move_item`
- `player_queues/shuffle`
- `music/search`
- `music/item_by_uri`
- `music/in_progress_items`
- `music/recently_played_items`
- `music/recommendations`
- `music/tracks/similar_tracks`
- `music/albums/album_tracks`
- `music/artists/artist_albums`
- `music/artists/artist_tracks`
- `music/playlists/playlist_tracks`
- `music/favorites/add_item`
- `music/favorites/remove_item`

הערה: ״שם פקודה קיים״ אינו מספיק. עדיין צריך לאמת args, scopes, response schema ו־error codes.

### פקודות שחסרות ליעד 6.0.0

#### P0

- `info`
- `player_queues/all`
- `player_queues/get_active_queue`
- `player_queues/autoplay`
- `player_queues/crossfade`
- `player_queues/overlay`
- `player_queues/set_playback_speed`
- `players/sleep_timer/get/set/clear`
- audiobook/podcast episode/collection commands

#### P1

- `config/player_queues/get/get_entries/get_value/save`
- `config/players/dsp/*`
- `config/dsp_presets/*`
- `config/dsp_irs/*`
- `audio_analysis/wave_form`
- `metadata/get_track_lyrics`
- `metadata/get_image_palette`
- setup/reconfigure/invoke_action commands
- `diagnostics/get`

#### P2

- `dashboard/*`
- Party/Music Quiz plugin commands, לאחר discovery דרך `providers`/manifest.
- `music/sound_effects`

## תכנון שינוי מומלץ

### שלב 0 — הגדרת חוזה

- להגדיר `MACompatibilityAdapter` ב־Engine.
- input/output typed dictionaries לכל command.
- `server_info`, `capabilities`, `supported_commands`, `scope_failures`.
- לאפשר feature detection ולא בדיקת גרסה בלבד.
- להגדיר במפורש אילו פקודות הכרטיס רשאי להפעיל.

תוצר: דו״ח diagnostics שמראה עבור כל capability: supported / denied / unavailable / incompatible.

### שלב 1 — תאימות ליבה 2.10

- תקן auth ו־allowlist.
- הוסף `info` וגרסה ל־handshake.
- תקן active queue resolution.
- הוסף queue fields ופקודות חדשות.
- הוסף native sleep timer.
- הוסף summary/full hydration.
- הוסף contract fixtures של b11.
- תקן את בדיקת Vitest הכושלת.

תוצר: Core Compatibility badge ירוק מול 2.10.0b11.

### שלב 2 — Audiobooks/Podcast Pro

- media types ו־tabs חדשים.
- collections, episodes, chapters.
- progress, played state, playback speed, start from beginning.
- author/narrator presentation.

תוצר: חוויית long-form מלאה.

### שלב 3 — DSP Read + Presets

- הצגת processing chain.
- בחירת preset.
- waveform/BPM/key.
- רק לאחר מכן editor מלא.

### שלב 4 — Realtime Event Bridge

- MA WebSocket connection בבעלות ה־Engine.
- cache ו־event reducer.
- HA event subscription אחד לכרטיס.
- reconnect, sequence/version, stale state detection.

### שלב 5 — Extended Experiences

- Dashboards casting.
- AI Radio.
- Party/Music Quiz deep links או host controls.
- Setup/Reconfigure status.

## הצעת Capability Contract חדש

ה־Engine צריך להחזיר ב־`get_context` מבנה דומה:

```json
{
  "engine_version": "0.5.0",
  "music_assistant": {
    "server_version": "2.10.0b11",
    "schema_version": 43,
    "connected": true,
    "authenticated": true,
    "scopes": [
      "players_read",
      "players_control",
      "queues_read",
      "queues_control",
      "library_read"
    ]
  },
  "capabilities": {
    "queue_autoplay": true,
    "queue_crossfade": true,
    "queue_overlay": true,
    "queue_playback_speed": true,
    "native_sleep_timer": true,
    "audiobooks": true,
    "collections": true,
    "dsp_read": true,
    "dsp_write": false,
    "dashboards": true,
    "setup_flows": false,
    "sendspin_encryption": true
  }
}
```

הכרטיס צריך להסתיר פעולה שאינה נתמכת, לא להציג כפתור שמנסה פקודה ונכשל.

## Acceptance Matrix ל־6.0.0

### חובה לפני Release

- [ ] Engine מזהה `2.10.0b11` ומציג schema/version.
- [ ] אין בקשת MA API אנונימית.
- [ ] arbitrary `ma/command` חסום או מוגבל ב־allowlist.
- [ ] כל command קיים עובר contract test.
- [ ] Active queue נפתר דרך API תקין.
- [ ] Queue state כולל dynamic/autoplay/smart/finished fields.
- [ ] Summary item נפתח ל־full details.
- [ ] כל בדיקות Vitest עוברות.
- [ ] Sendspin smoke tests עוברים ב־WS וב־WSS.
- [ ] שגיאות 401/403/unknown_command/schema מוצגות בצורה מובנת.

### מומלץ מאוד

- [ ] Native sleep timer.
- [ ] Audiobooks ו־Podcast Episodes.
- [ ] Playback speed ו־start from beginning.
- [ ] DSP read-only + preset selection.
- [ ] Realtime MA event bridge.
- [ ] Server diagnostics passthrough עם redaction.

### אפשר לדחות ל־6.1+

- [ ] Full DSP editor.
- [ ] Provider setup wizard מלא בתוך HOMEii.
- [ ] Music Quiz UI מלא.
- [ ] Party guest UI מלא.
- [ ] Dashboard session administration.
- [ ] AI Radio editor מלא.

## הערכת סיכונים

| סיכון | חומרה | הסתברות | טיפול |
|---|---:|---:|---|
| Token חסר או scopes לא מספיקים | גבוהה | גבוהה | setup validation + explicit errors |
| API command עובד אך response schema השתנה | גבוהה | בינונית | typed normalizer + fixtures |
| Queue id שונה מ־entity/player id בקבוצה | גבוהה | גבוהה | get_active_queue |
| Summary item נתפס כפריט מלא | בינונית | גבוהה | hydration contract |
| פגיעה בפרטיות resume בין משתמשים | גבוהה | בינונית | user-scoped tokens/state |
| Sendspin encryption/clock mismatch | גבוהה | בינונית | protocol tests |
| שכפול UI של MA יוצר תחזוקה בלתי סבירה | בינונית | גבוהה | deep links + selective UI |
| Beta ממשיכה להשתנות אחרי b11 | בינונית | גבוהה | capability detection + nightly CI |

## המלצה סופית

הכיוון של 6.0.0 נכון, אבל השם ״Engine-first״ עדיין מקדים מעט את המימוש: ה־Engine כבר שער חובה, אך עדיין חסרים לו client contract קשיח, realtime state, auth/scopes מדויקים וחשיפה מלאה של יכולות 2.10.

הסדר הנכון הוא:

1. קודם להפוך את ה־Engine ללקוח Music Assistant 2.10 מאומת ומוגבל הרשאות.
2. אחר כך להשלים Queue + Audiobooks + Podcasts.
3. לאחר מכן DSP ו־metadata.
4. לבסוף חוויות נלוות כמו Dashboards, Party ו־Music Quiz.

אם מבצעים רק את שלבים 0–2, אפשר להגדיר את 6.0.0 כ־**fully compatible for core playback and library use with Music Assistant 2.10.0b11**. כדי לטעון ל־feature parity מלאה נדרשים גם שלבים 3–5, וזה כבר היקף מוצר גדול יותר ולא רק תיקון תאימות.
