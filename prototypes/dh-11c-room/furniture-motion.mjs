// DH-11C.4F interaction targets, shared by the procedural and GLB rigs.
// Pure maths so effects can be regression-tested without a WebGL browser.
export const PAPER_LIMIT = 13;
// Explicit second position for each paper, in desk-local coordinates.
export const PAPER_END_POSITIONS = Object.freeze([
 [.60,-.22],[.18,-.32],[.86,-.52],[1.41,-.52],
 [-1.95,.86],[-.55,.20],[.08,.30],[-.30,.40],
 [-1.30,.35],[.54,.38],[.64,.08],[.52,.78],[1.22,.78]
].map(pair=>Object.freeze(pair)));
export function paperIndexForMesh(name) {
 const match=/^desk_paper_(0[0-9]|1[0-2])$/.exec(name||'');
 return match ? Number(match[1]) : null;
}
export const TYPE_KEY_COUNT = 24;
export const FEATURED_BOOK_COUNT = 8;
export function featuredBook(shelf, book) {
 return Number.isInteger(shelf) && Number.isInteger(book) &&
  shelf >= 0 && shelf < 4 && book >= 0 && book < 20 && (book + shelf) % 10 === 0;
}
// Sheets have a fixed start and end, without lift or roll on the desktop.
export function paperPose(home,index,moved) {
 const end=PAPER_END_POSITIONS[index];
 return {
  x:moved&&end?end[0]:home.x,
  y:home.y,
  z:moved&&end?end[1]:home.z,
  yaw:home.yaw,
  tilt:home.tilt
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
