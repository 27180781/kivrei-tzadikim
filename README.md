# קברי צדיקים: אתר, אפליקציית ניווט ושלוחה טלפונית

מסד נתונים אחד (Postgres, רץ ב-CapRover) שמזין שלושה ערוצים:

| ערוץ | כתובת | מה יש בו |
|---|---|---|
| אתר | `/` `/tzadikim` `/tzadik/<slug>` `/hillulot` `/seudot` | הילולות היום, לוח הילולות, דף לכל צדיק (אודות, תמונות, דרכי הגעה), סעודות הילולה |
| אפליקציית ניווט (PWA) | `/app` | חיפוש, 3 ההילולות של היום הקרובות ראשונות ואחריהן הקברים לפי קרבה, כפתור "מחוץ לעיר", מפה, ניווט ב-Waze / Google Maps |
| שלוחה טלפונית (Technoline Module API) | `/api/ivr` | הילולות היום/השבוע, חיפוש צדיק לפי מספר, סעודות קרובות, הרשמה לעדכון יומי |
| ניהול | `/admin` | עריכת צדיקים, מקומות ציון, סעודות ותמונות |

## תאריך עברי

כל החישובים לפי ארץ ישראל (`src/lib/hebrew.ts`): אזור זמן ירושלים, והיום העברי מתחלף **בשקיעה בירושלים** ולא בחצות.
אדר בשנה פשוטה נחשב אדר ב׳ בשנה מעוברת, ול׳ בחודש שאין בו ל׳ עובר לא׳ בחודש הבא.
בדיקות: `node --experimental-strip-types scripts/check-hebrew.mts`

## הרצה מקומית

```bash
npm install
npm run dev          # בלי DATABASE_URL האתר רץ על נתוני הדוגמה
```

עם מסד נתונים: `DATABASE_URL=postgres://... ADMIN_PASSWORD=... npm run dev`.

## מסד נתונים

- Postgres. בעלייה הראשונה האפליקציה יוצרת לבד את הטבלאות מ-`db/schema.sql`, ואם המאגר ריק היא טוענת את נתוני הדוגמה מ-`src/data/seed.ts` (התאריכים והקואורדינטות שם משוערים ויש לאמת אותם).
- תמונות נשמרות בתוך מסד הנתונים ומוגשות מ-`/api/photos/<id>`, כך שגיבוי של ה-DB כולל הכול.
- ממשק הניהול (`/admin`) נכנס בסיסמה מ-`ADMIN_PASSWORD`. החלפת הסיסמה מנתקת את כל החיבורים.

## פריסה ל-CapRover (אוטומטית מגיטהאב)

כל push ל-`main` מפעיל את `.github/workflows/deploy-caprover.yml`: הוא בונה Docker image בגיטהאב, דוחף אותו ל-`ghcr.io/27180781/kivrei-tzadikim`, ומבקש מ-CapRover להריץ אותו.

הגדרה חד-פעמית:
1. **ב-CapRover:** Apps → יוצרים אפליקציה (למשל `kivrei-tzadikim`).
2. **מסד נתונים:** Apps → One-Click Apps → PostgreSQL, בשם `kivrei-db` ועם סיסמה חזקה.
3. **App Configs → Environmental Variables** של אפליקציית האתר: `DATABASE_URL` ו-`ADMIN_PASSWORD` (ראו `.env.example`). הם נקראים בזמן ריצה, כך ששינוי שלהם דורש רק Save & Restart.
4. **HTTP Settings:** מחברים דומיין ומפעילים HTTPS. פורט הקונטיינר הוא 80 (ברירת המחדל).
5. **Deployment → Method 1 → Enable App Token:** מעתיקים את הטוקן.
6. **בגיטהאב:** Settings → Secrets and variables → Actions, שלושה סודות: `CAPROVER_SERVER` (למשל `https://captain.example.com`), `CAPROVER_APP`, `CAPROVER_APP_TOKEN`.
7. אחרי ההרצה הראשונה: בדף החבילה בגיטהאב (Packages → kivrei-tzadikim → Package settings) משנים את ה-visibility ל-Public, כדי ש-CapRover יוכל למשוך את ה-image.

## חיבור המרכזייה (Technoline)

בשלוחה מסוג API מגדירים את הכתובת: `https://<הדומיין>/api/ivr`.
המרכזייה פונה בכל שלב בשיחה וקוראת את הנתונים החיים מהמאגר בהקראה ממוחשבת.
כל קריאה נרשמת בטבלה `ivr_call_log`, כדי לראות בדיוק אילו פרמטרים המרכזייה שולחת (למשל שם הפרמטר של מספר המתקשר).

**שלב ב׳: שיחה יוצאת יומית לנרשמים.** `campaignRun` של טכנוליין דורש כתובת IP קבועה שאושרה אצלם. לשרת CapRover יש IP קבוע, ולכן אפשר לאשר אותו אצל טכנוליין ולהריץ ממנו משימה ששולחת כל ערב את הילולות היום לרשימת `ivr_subscribers`.
