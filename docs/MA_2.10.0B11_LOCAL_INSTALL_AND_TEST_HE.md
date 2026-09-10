# התקנה ובדיקת HOMEii Flow 6 מול Music Assistant 2.10.x

## ארכיטקטורה נדרשת

להתאמה מלאה נדרשים שני חיבורים:

1. אינטגרציית Music Assistant הרשמית ב־Home Assistant — גילוי ישויות, שירותי HA ומצב נגנים.
2. HOMEii Flow Engine 0.7.2 מול ה־Web API של MA — תור מלא, ספרייה, עטיפות, חיפוש, פקודות ואירועים בזמן אמת.

ה־Token נשמר ב־Config Entry של Home Assistant. הוא אינו נשלח לכרטיס, ל־JavaScript או ל־localStorage.

## התקנה

1. העתק את `custom_components/homeii_flow` ממאגר HOMEii FLOW ENGINE אל:
   `/config/custom_components/homeii_flow`
2. הפעל מחדש את Home Assistant.
3. ודא שאינטגרציית Music Assistant הרשמית מותקנת, Loaded, ושיש לפחות `media_player` אחד של MA.
4. עבור אל Settings → Devices & services → HOMEii Flow Engine → Configure → General settings.
5. הזן:
   - Music Assistant server URL, כולל פורט. לדוגמה: `http://192.168.1.10:8095`
   - Music Assistant API token
6. שמור והמתן מספר שניות להתחברות `WebSocket /ws`.
7. התקן/עדכן את קובץ הכרטיס הבנוי `dist/homeii-music-flow.js` כ־Lovelace JavaScript Module.
8. בצע Hard Refresh לדפדפן.

## בדיקת חיבור

במסך Diagnostics של הכרטיס יש לוודא:

- Card: `6.0.0`
- Engine: `0.7.2`
- Music Assistant server: `2.10.x`
- API schema: `65` ומעלה
- Required connections: Healthy
- Command bridge: Connected + token configured
- Realtime events: Connected + authenticated
- לפחות נגן MA אחד
- Queue provider, Library provider ו־Search provider: Connected

## בדיקת תור

1. הפעל אלבום או פלייליסט עם 20 פריטים לפחות.
2. פתח את התור בכרטיס והשווה את הסדר והפריט הפעיל ל־MA.
3. בדוק Play item, Remove, Move up, Move down וגרירה למיקום אחר.
4. שנה Shuffle, Repeat ו־Autoplay ב־MA ובדוק שהמצב מתעדכן בכרטיס, כולל `smart_shuffle_active` כאשר MA מפעיל Smart Shuffle.
5. עבור לנגן אחר ובחזרה. אסור שיופיע התור של הנגן הקודם.
6. בצע שינוי בתור ישירות ב־MA. הכרטיס אמור להתעדכן בלי רענון דף.

## בדיקת ספרייה ועטיפות

1. פתח Artists, Albums, Tracks, Playlists, Radio, Podcasts ו־Audiobooks.
2. בדוק חיפוש ספרייה מיידי ולאחריו חיפוש בכל Providers; בחיפוש חוזר רשימת הספקים צריכה להגיע ממטמון ה־Engine.
3. הוסף והסר Favorite ובדוק עדכון בשני הצדדים.
4. פתח פרטי Artist/Album/Playlist ובדוק רשימות מלאות ועמודים נוספים.
5. ודא שאין עטיפות שבורות במעבר מהיר בין נגנים, תור וספרייה.
6. ודא שב־Network של הדפדפן אין בקשות ישירות ל־MA עבור תור/ספרייה ואין Authorization של MA בדפדפן.

## בדיקת נגנים, קבוצות והתאוששות

1. בדוק Play/Pause/Stop/Next/Previous, Seek, Volume ו־Mute.
2. צור ופזר קבוצה ובדוק בעלים, חברים ועוצמה קבוצתית.
3. עצור את MA ל־30 שניות והפעל מחדש.
4. בזמן הניתוק הכרטיס צריך להישאר יציב ולהציג אבחון ברור.
5. לאחר חזרת MA, ה־Engine צריך להתחבר אוטומטית והכרטיס צריך להשלים מצב ללא Reload.
6. הפעל מחדש את Home Assistant ובדוק שה־Token נשמר ושזרם האירועים חוזר.

## קריטריון מעבר

הבדיקה עוברת כאשר אין ערבוב תורים בין נגנים, אין פעולות כפולות, עטיפות אינן חושפות Token, שינויי MA מגיעים לכרטיס בזמן אמת, וכל פקודות התור והספרייה חוזרות לאותו מצב בשני הממשקים.
