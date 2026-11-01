// DH-11C.4F interaction targets, shared by the procedural and GLB rigs.
// Pure maths so effects can be regression-tested without a WebGL browser.
export const PAPER_LIMIT = 10;
export const TYPE_KEY_COUNT = 24;
export const FEATURED_BOOK_COUNT = 8;
export function featuredBook(shelf, book) {
 return Number.isInteger(shelf) && Number.isInteger(book) &&
  shelf >= 0 && shelf < 4 && book >= 0 && book < 20 && (book + shelf) % 10 === 0;
}
export function paperPose(home, index, moved) {
 const active = index < moved;
 const direction = index % 2 ? -1 : 1;
 return {
  x: home.x + (active ? direction * .32 : 0),
  y: home.y + (active ? .075 + index % 3 * .012 : 0),
  z: home.z + (active ? (index % 3 - 1) * .19 : 0),
  yaw: home.yaw + (active ? direction * .28 : 0),
  tilt: home.tilt + (active ? direction * .105 : 0)
 };
}
export function pressDepth(ageSeconds, isSelected, reducedMotion = false) {
 if (!isSelected) return 0;
 if (reducedMotion) return .055;
 if (!Number.isFinite(ageSeconds) || ageSeconds < 0 || ageSeconds >= .55) return 0;
 // Strong keystroke with visible return motion, independently triggered per press.
 return .075 * Math.sin(Math.PI * ageSeconds / .55);
}
export function paperAdvance(typed) {
 return Math.min(Math.max(typed, 0), 60) * .006;
}
export function typedKeyIndex(nodeName) {
 const match = /^typewriter_key_([012])_([0-7])$/.exec(nodeName || '');
 return match ? Number(match[1]) * 8 + Number(match[2]) : null;
}
