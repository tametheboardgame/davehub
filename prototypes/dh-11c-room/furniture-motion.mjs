// DH-11C.4F interaction targets, shared by the procedural and GLB rigs.
// Pure maths so effects can be regression-tested without a WebGL browser.
export const PAPER_LIMIT = 13;
// Exactly the physical lamp meshes may toggle the desk light. Paper sheets,
// desk surface, typewriter and other furniture are never switches.
export function lampPartForMesh(name) {
 const match=/^desk_lamp_(shade|cap|stem|bulb|base)$/.exec(name||'');
 return match?match[1]:null;
}

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
// Nine named physical crumples have independent destinations on the floor,
// arranged around the front/sides of the bin. These never overlap the bin body.
export const BIN_PAPER_COUNT=9;
export const BIN_PAPER_FLOOR=Object.freeze([
 [-.72,.68],[-.30,.85],[.12,.95],[.54,.85],[.93,.62],
 [-1.05,.37],[.96,.20],[-.82,1.22],[.62,1.23]
].map(pair=>Object.freeze(pair)));
export function binPaperIndexForMesh(name){
 const match=/^bin_paper_([0-8])$/.exec(name||'');
 return match?Number(match[1]):null;
}
// Pure reversible path: out and back trace exactly the same arc. The floor
// landing sits one centimetre above the lowest point of the crumpled mesh.
export function binPaperPose(home,index,progress){
 const t=Math.min(1,Math.max(0,Number.isFinite(progress)?progress:0));
 const goal=BIN_PAPER_FLOOR[index];
 if(!goal)return {...home};
 const radius=.15+(index%3)*.028;
 // A quadratic lift-and-toss arc clears the actual bin rim before the
 // paper travels outwards, then settles on the floor without sinking through.
 const y=(1-t)*(1-t)*home.y+2*(1-t)*t*2.4+t*t*(radius+.015);
 return {
  x:home.x+(goal[0]-home.x)*t,
  y,
  z:home.z+(goal[1]-home.z)*t,
  rx:home.rx+.42*t,
  ry:home.ry+1.1*t,
  rz:home.rz+.34*t
 };
}
export const TYPE_KEY_COUNT = 24;
export const FEATURED_BOOK_COUNT = 8;
export function featuredBook(shelf, book) {
 return Number.isInteger(shelf) && Number.isInteger(book) &&
  shelf >= 0 && shelf < 4 && book >= 0 && book < 20 && (book + shelf) % 10 === 0;
}
// Stable mapping from one physical mesh to one of exactly eight independent
// toggles. All other 72 volumes are deliberately non-interactive.
export function featuredBookIndexForMesh(name) {
 const match=/^book_([0-3])_(0[0-9]|1[0-9])$/.exec(name||'');
 if(!match)return null;
 const shelf=Number(match[1]),book=Number(match[2]);
 return featuredBook(shelf,book)?shelf*2+(book>=10?1:0):null;
}
export const BOOK_PULL_DISTANCE=.37;
export function bookPosition(homeZ,pulled) {
 return homeZ+(pulled?BOOK_PULL_DISTANCE:0);
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
export const TYPE_PAPER_HEIGHT = .58;
export const TYPE_PLATEN_RADIUS = .056;
// The sheet is fed UP through the horizontal roller: its bottom edge stays
// at its original roller contact height while the visible page gets longer.
// The roller rotation is computed from the same linear feed distance.
export function typewriterFeed(typed) {
 const advance=paperAdvance(typed);
 return {
  scale:1+advance/TYPE_PAPER_HEIGHT,
  centreLift:advance/2,
  rollerAngle:advance/TYPE_PLATEN_RADIUS
 };
}
export function typedKeyIndex(nodeName) {
 const match = /^typewriter_key_([012])_([0-7])$/.exec(nodeName || '');
 return match ? Number(match[1]) * 8 + Number(match[2]) : null;
}
