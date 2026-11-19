// בדיקות ידניות ללוגיקת התאריך העברי: node --experimental-strip-types scripts/check-hebrew.mts
import assert from "node:assert/strict";
import { currentHebrewDate, observedHillula, isHillulaOn, spokenHebrewDate, HDate } from "../src/lib/hebrew.ts";

// 19.11.2026: שקיעה בירושלים ~16:38 שעון ישראל (14:38 UTC)
assert.equal(currentHebrewDate(new Date("2026-11-19T14:00:00Z")).toString(), "9 Kislev 5787");
assert.equal(currentHebrewDate(new Date("2026-11-19T15:00:00Z")).toString(), "10 Kislev 5787");
// אחרי חצות UTC אבל לפני חצות בישראל (22:30 UTC = 00:30 ישראל) → עדיין 10 כסלו
assert.equal(currentHebrewDate(new Date("2026-11-19T22:30:00Z")).toString(), "10 Kislev 5787");
// קיץ (שעון קיץ): 10.7.2026, שקיעה ~19:48 ישראל = 16:48 UTC
assert.equal(currentHebrewDate(new Date("2026-07-10T16:30:00Z")).getDate(), new HDate(new Date(2026, 6, 10, 12)).getDate());
assert.equal(currentHebrewDate(new Date("2026-07-10T17:10:00Z")).getDate(), new HDate(new Date(2026, 6, 10, 12)).next().getDate());

// אדר: שנה פשוטה ↔ מעוברת (5787 מעוברת, 5786 פשוטה)
assert.deepEqual(observedHillula(12, 7, 5787), { month: 13, day: 7 });
assert.deepEqual(observedHillula(13, 7, 5786), { month: 12, day: 7 });
// ל׳ חשוון בשנה עם 29 ימים
const y = [5785, 5786, 5787, 5788].find((yy) => HDate.daysInMonth(8, yy) === 29)!;
assert.deepEqual(observedHillula(8, 30, y), { month: 9, day: 1 });
assert.ok(isHillulaOn(2, 18, new HDate(18, 2, 5787)));
assert.equal(spokenHebrewDate(new HDate(9, 9, 5787)), "9 בכסלו");
console.log("all hebrew checks passed");
