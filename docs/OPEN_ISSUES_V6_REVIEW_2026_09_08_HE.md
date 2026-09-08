# סקירת Issues ו־PRs לקראת 6.0.0 — 2026-09-08

עדכון GitHub מאוחר: PRs #89 (גרמנית), #84 (תור גדול במסלול 5.9) ו־#90 (בדיקות גרמנית וקובצי הפצה) מוזגו לאחר בדיקה. הרכב main עבר 232 בדיקות. #82 נסגר על סמך אישור המדווח. ב־6.0 נוסף תיקון לשגיאות חיפוש ספקים בתוך לשוניות הספרייה; בדיקות המועמד עברו 392/34 דילוגים. תיקון נוסף זה חדש יותר מההתקנה QA102. יתר ה־Issues אינם מסומנים כפתורים ללא השלמת האימות.

נסקרו כל 18 ה־Issues ושני ה־PRs הפתוחים ב־r11a/homeii-music-flow, כולל הדיונים והדיפים של שני ה־PRs. ההשוואה היא מול עותק העבודה המקומי של הכרטיס ו־HOMEII FLOW ENGINE, הכולל שינויים שטרם פורסמו. אין כאן אישור להפצה או לכך שהתיקונים כבר זמינים ב־GitHub/HACS.

## סבב תיקונים נדרש

עדכון יישום מקומי מאוחר יותר באותו יום: #85 תוקן ונבדק; #86 מומש כהגדרת YAML; #87 מומש בכרטיס וב־Engine 0.7.21 ונבדק עם 691 פריטים; #83 קיבל טיפול בכשלי חיפוש/תגובות מאוחרות אך עדיין דורש בדיקת ספק חיה; #75 תוקן גם במסך הנגנים ובדיקת Stop הופעלה מחדש. PR #89 שולב עם קרדיט, התאמת מפתחות/placeholders ובדיקות זיהוי שפה. הרשימות שלהלן מתעדות את ממצאי הסקירה המקורית. כל השינויים עדיין מקומיים, ללא סגירת דיונים או merge. בדיקות אחרונות: 390 עברו, 34 דילוגים, lint ובנייה נקייה עברו.

| עדיפות | דיון | ממצא ופעולה נדרשת |
|---|---|---|
| גבוהה | [#83 — חיפוש קר](https://github.com/r11a/homeii-music-flow/issues/83) | `_search` מחזיר תוצאות ריקות גם בכשל. timeout החיפוש אצל הספק עשוי להסתיים לפני בקשת Engine. להפריד טעינה/כשל/timeout/ריק; לבדוק תוצאה מאוחרת, סגירה ופתיחה ושינוי שאילתה. |
| גבוהה | [#87 — מגבלת הספרייה](https://github.com/r11a/homeii-music-flow/issues/87) | `limitMap` במסך הספרייה עדיין מגביל פלייליסטים ל־250. נתיב CORS טופל דרך Engine, אך אין בכך הסרה של המגבלה. להוסיף pagination מקצה לקצה ולבדוק מאות פלייליסטים ללא כפילויות או חוסרים. |
| גבוהה | [#85 — סדר אלבום](https://github.com/r11a/homeii-music-flow/issues/85) | `_sortLibraryDetailTracks` עדיין משתמש ב־localeCompare כשחסרים מספרי דיסק/רצועה. לשמר סדר MA כברירת מחדל, לבדוק metadata בעטיפות ובשדות חסרים חלקית, ולהוסיף כיסוי אלבומים מרובי דיסקים. |
| גבוהה | [#69 — entity](https://github.com/r11a/homeii-music-flow/issues/69) | לוגיקת ברירת מחדל קיימת, אבל הדיווח האחרון מציין שההגדרה כלל אינה מגיעה ל־runtime. לבדוק editor → save → reload → מעבר דשבורדים, קדימות URL, נגנים לא פעילים והבהוב; לתקן לפי השחזור. |
| גבוהה | [#65 — מועדפי רדיו](https://github.com/r11a/homeii-music-flow/issues/65) | קיימים תיקוני Engine, revisions ולחיצות תפריט. עדיין יש לבדוק את רצף התחנה המדווחת בין Search/Radio/Liked ואת ההבחנה בין מזהה ספק לא־מספרי למזהה ספרייה, בלי רענון ידני. |
| גבוהה — שחזור חומרה | [#77 — קריסת DLNA](https://github.com/r11a/homeii-music-flow/issues/77) | איחוד הפקודות ב־Engine אינו הוכחת תיקון. לשחזר pause/resume בין שלושת הממשקים באותו נגן ולצליב לוגים וזהות נגן. חסרים דגם/firmware ולוגים מהחומרה המדווחת. |

## שיפורים שטרם הושלמו

| דיון | מה נותר |
|---|---|
| [#86](https://github.com/r11a/homeii-music-flow/issues/86) | סדר מקטעי תוצאות חיפוש ניתן להגדרה; לשמור על ברירת המחדל הקיימת. |
| [#78](https://github.com/r11a/homeii-music-flow/issues/78) | מסנן Album Artists only, כולל התאמה לספק ובדיקת Plex גדולה. |
| [#76](https://github.com/r11a/homeii-music-flow/issues/76) | שורת 3–5 תחנות רדיו מוצמדות מתחת לנגן. הדיון הקודם מייעד זאת לאחר 6.0.0. |
| [#72](https://github.com/r11a/homeii-music-flow/issues/72) | בחירת ספרייה/מקור אחסון במסך הספרייה. בנוסף, שחזור נפרד של הפעלת My Media for Alexa אחרי סיום שיר. גילוי לפי ספק/ז׳אנר אינו פתרון מלא לבקשה. |
| [#73](https://github.com/r11a/homeii-music-flow/issues/73) | הכפתור משתמש ב־ma_interface_url וברירת מחדל /music-assistant; כתובת עם פורט מפורש עובדת לפי החוזה. הסקת כתובת מה־Engine אינה ממומשת. סעיף ישן ב־CHANGELOG על הסקת ma_url אינו תיאור נכון של הקוד הנוכחי. |
| [PR #89 — גרמנית](https://github.com/r11a/homeii-music-flow/pull/89) | טרם שולב; אין de ברישום הנוכחי. להשוות מפתחות/placeholders מול אנגלית 6.0.0, לשלב, לבדוק de וזיהוי אוטומטי ולבנות dist. |
| [PR #84 — תורים גדולים](https://github.com/r11a/homeii-music-flow/pull/84) | פתרון mass_queue מיועד לנתיב 5.x שהוחלף ב־Engine. לא למזג ללא התאמה. להחליט אם נדרש backport ל־5.x ולשמר תרחיש קבלה של 691 פריטים ומיקום 101. |

## תיקונים קיימים ואימות שנותר

| דיון | ראיות והגבלה |
|---|---|
| [#88 — סדר פלייליסט](https://github.com/r11a/homeii-music-flow/issues/88) | מסלול פלייליסט עוקף מיון אלבום; בדיקה פעילה ב־podcast-detail.test.js מאמתת זאת. נותר אישור בפלייליסט Apple Music המדווח. |
| [#68](https://github.com/r11a/homeii-music-flow/issues/68), [#79](https://github.com/r11a/homeii-music-flow/issues/79) | Engine קורא תור פעיל ופריטים בדפים של 500 עד למספר הפריטים הצפוי, ודוחה תמונה חלקית/משתנה. יש כיסוי מעבר ל־500 ושמירת תור בזמן רענון. יש לאמת את התקנות המדווחים ותרחיש PR #84. |
| [#82 — OPTIONS](https://github.com/r11a/homeii-music-flow/issues/82) | קריאות הליבה עברו לשרת; המדווח כבר אישר היעלמות ב־MA 2.10 ללא פרטי Direct. אין צורך להבטיח תיקון חדש של מצב שכבר הסתדר אצלו. |
| [#81 — Sendspin](https://github.com/r11a/homeii-music-flow/issues/81) | relay מאומת דרך HA/Engine וטוקן MA בצד השרת. בדיקות auth בכרטיס עוברות; QA מקומי קודם מתעד ניגון דפדפן. Safari/macOS המדווח, רקע ואיכות שמע פיזית עדיין דורשים אימות. |
| [#75 — Stop](https://github.com/r11a/homeii-music-flow/issues/75) | בחירת אייקון ופקודת stop קיימות כאשר הנגן מדווח stop ללא pause. בדיקת ה־HA הישנה מדולגת; יש להתאים בדיקת runtime ל־Engine ולבדוק capabilities מהספק בפועל. |
| [#74 — רקע בטאבלט](https://github.com/r11a/homeii-music-flow/issues/74) | שינויי עיצוב קיימים אך אין אישור ספציפי ל־Lenovo/WebView ברוחב 853×533. לבדוק Subtle/Strong, בהיר/כהה וקריאות הפקדים. Off הוא מעקף שאושר בדיון. |

## בדיקות שבוצעו בסקירה

- `npm run check`: lint עבר; 48 קובצי בדיקה עברו, 369 בדיקות עברו, 35 דילוגים קיימים.
- `python -B ../HOMEII FLOW ENGINE/tests/test_reliability.py`: כל 17 הבדיקות עברו, כולל טעינת תור מעבר ל־500 פריטים ובעלות התור הפעיל.
- לא שונה קוד מוצר ולא בוצעו merge, סגירת Issues, פריסה או הפצה. לא הורץ build חדש משום שהסקירה לא שינתה קוד.
- לא בוצעו בסקירה הנוכחית בדיקות חומרה/דפדפן חיות של התקנות המדווחים. ראיות QA קודמות מזוהות ככאלה ולא כבדיקה חדשה.
- יש ליישר לפני ההפצה תיעוד ישן וסותר בנושא Sendspin, פונטים, כתובות MA וגרסת Engine נדרשת מול המועמד הסופי.

## עדכונים ב־GitHub

פורסמו 20 תגובות פרטניות: הודעה על 6.0.0 המתוכננת בקרוב, סטטוס אמיתי לכל דיון, והבהרה שמדובר במועמד שטרם פורסם ושדורש HOMEii Flow Engine. כל דיון נשאר פתוח.

- [תגובה ל־#65](https://github.com/r11a/homeii-music-flow/issues/65#issuecomment-5583848450)
- [תגובה ל־#68](https://github.com/r11a/homeii-music-flow/issues/68#issuecomment-5583848650)
- [תגובה ל־#69](https://github.com/r11a/homeii-music-flow/issues/69#issuecomment-5583848817)
- [תגובה ל־#72](https://github.com/r11a/homeii-music-flow/issues/72#issuecomment-5583848989)
- [תגובה ל־#73](https://github.com/r11a/homeii-music-flow/issues/73#issuecomment-5583849179)
- [תגובה ל־#74](https://github.com/r11a/homeii-music-flow/issues/74#issuecomment-5583849352)
- [תגובה ל־#75](https://github.com/r11a/homeii-music-flow/issues/75#issuecomment-5583849498)
- [תגובה ל־#76](https://github.com/r11a/homeii-music-flow/issues/76#issuecomment-5583849660)
- [תגובה ל־#77](https://github.com/r11a/homeii-music-flow/issues/77#issuecomment-5583849867)
- [תגובה ל־#78](https://github.com/r11a/homeii-music-flow/issues/78#issuecomment-5583850076)
- [תגובה ל־#79](https://github.com/r11a/homeii-music-flow/issues/79#issuecomment-5583850305)
- [תגובה ל־#81](https://github.com/r11a/homeii-music-flow/issues/81#issuecomment-5583850538)
- [תגובה ל־#82](https://github.com/r11a/homeii-music-flow/issues/82#issuecomment-5583850703)
- [תגובה ל־#83](https://github.com/r11a/homeii-music-flow/issues/83#issuecomment-5583850885)
- [תגובה ל־#84](https://github.com/r11a/homeii-music-flow/pull/84#issuecomment-5583851171)
- [תגובה ל־#85](https://github.com/r11a/homeii-music-flow/issues/85#issuecomment-5583851393)
- [תגובה ל־#86](https://github.com/r11a/homeii-music-flow/issues/86#issuecomment-5583851625)
- [תגובה ל־#87](https://github.com/r11a/homeii-music-flow/issues/87#issuecomment-5583851812)
- [תגובה ל־#88](https://github.com/r11a/homeii-music-flow/issues/88#issuecomment-5583852086)
- [תגובה ל־#89](https://github.com/r11a/homeii-music-flow/pull/89#issuecomment-5583852284)
