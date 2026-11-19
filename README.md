# קברי צדיקים: אתר, אפליקציית ניווט ושלוחה טלפונית

מסד נתונים אחד (Supabase) שמזין שלושה ערוצים:

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
cp .env.example .env.local   # אפשר להשאיר ריק: האתר ירוץ על נתוני דוגמה
npm run dev
```

בלי משתני Supabase האתר מציג את נתוני הדוגמה מ-`src/data/seed.ts` (התאריכים והקואורדינטות שם משוערים ויש לאמת אותם).

## חיבור Supabase

1. פותחים פרויקט ב-[supabase.com](https://supabase.com).
2. SQL Editor: מריצים את `supabase/schema.sql`, ואם רוצים נתוני התחלה גם את `supabase/seed.sql`.
3. Authentication → Users: יוצרים משתמש למנהל, ואז מריצים:
   `insert into admins (user_id) select id from auth.users where email = 'המייל שלך';`
4. ממלאים ב-`.env.local` (ובהגדרות CapRover) את שלושת המשתנים מ-Project Settings → API.

## פריסה ל-CapRover (אוטומטית מגיטהאב)

כל push ל-`main` מפעיל את `.github/workflows/deploy-caprover.yml`: הוא בונה Docker image בגיטהאב, דוחף אותו ל-`ghcr.io/27180781/kivrei-tzadikim`, ומבקש מ-CapRover להריץ אותו.

הגדרה חד-פעמית:
1. **ב-CapRover:** Apps → יוצרים אפליקציה (למשל `kivrei-tzadikim`).
2. **App Configs → Environmental Variables:** מוסיפים את המשתנים מ-`.env.example`. הם נקראים בזמן ריצה, כך ששינוי שלהם דורש רק Save & Restart.
3. **HTTP Settings:** מחברים דומיין ומפעילים HTTPS. פורט הקונטיינר הוא 80 (ברירת המחדל).
4. **Deployment → Method 1 → Enable App Token:** מעתיקים את הטוקן.
5. **בגיטהאב:** Settings → Secrets and variables → Actions, שלושה סודות: `CAPROVER_SERVER` (למשל `https://captain.example.com`), `CAPROVER_APP`, `CAPROVER_APP_TOKEN`.
6. אחרי ההרצה הראשונה: בדף החבילה בגיטהאב (Packages → kivrei-tzadikim → Package settings) משנים את ה-visibility ל-Public, כדי ש-CapRover יוכל למשוך את ה-image.

## חיבור המרכזייה (Technoline)

בשלוחה מסוג API מגדירים את הכתובת: `https://<הדומיין>/api/ivr`.
המרכזייה פונה בכל שלב בשיחה וקוראת את הנתונים החיים מהמאגר בהקראה ממוחשבת.
כל קריאה נרשמת בטבלה `ivr_call_log`, כדי לראות בדיוק אילו פרמטרים המרכזייה שולחת (למשל שם הפרמטר של מספר המתקשר).

**שלב ב׳: שיחה יוצאת יומית לנרשמים.** `campaignRun` של טכנוליין דורש כתובת IP קבועה שאושרה אצלם. לשרת CapRover יש IP קבוע, ולכן אפשר לאשר אותו אצל טכנוליין ולהריץ ממנו משימה ששולחת כל ערב את הילולות היום לרשימת `ivr_subscribers`.
