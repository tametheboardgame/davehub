// DH-11C.4F interaction targets, shared by the procedural and GLB rigs.
// Pure maths so effects can be regression-tested without a WebGL browser.
export const PAPER_LIMIT = 10;
export const TYPE_KEY_COUNT = 24;
export const FEATURED_BOOK_COUNT = 8;
export function featuredBook(shelf, book) {
 return Number.isInteger(shelf) && Number.isInteger(book) &&
  shelf >= 0 && shelf < 4 && book >= 0 && book < 20 && (book + shelf) % 10 === 0;
}
// Papers are rigid flat sheets resting on the writing surface. Move them
// IN the tabletop plane: X/Z slide, Y-axis yaw. Never lift or roll a sheet,
// which previously made it appear to float or clip through the desk.
export function paperPose(home, index, moved) {
 const active = index < moved;
 // Sheets at the left edge always travel inwards, not off the tabletop.
 const direction = index % 5 === 0 ? 1 : (index % 2 ? -1 : 1);
 return {
  x: home.x + (active ? direction * .23 : 0),
  y: home.y,
  z: home.z + (active ? (index % 3 - 1) * .10 : 0),
  yaw: home.yaw + (active ? direction * .17 : 0),
  tilt: home.tilt
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
