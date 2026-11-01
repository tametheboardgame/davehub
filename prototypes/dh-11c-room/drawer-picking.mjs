// DH-11C: pick a real drawer by its parent group in the scene graph.
// Works with both the procedural cabinet and Blender-exported GLB rigs.
// A cabinet case or unrelated mesh deliberately returns null, never drawer 0.
export function drawerIndexForMesh(mesh, drawerGroups) {
 if (!mesh || !Array.isArray(drawerGroups)) return null;
 const indexByGroup = new Map();
 drawerGroups.forEach((group, index) => {
  if (group) indexByGroup.set(group, index);
 });
 const seen = new Set();
 for (let node = mesh; node && !seen.has(node); node = node.parent) {
  seen.add(node);
  if (indexByGroup.has(node)) return indexByGroup.get(node);
 }
 return null;
}
