(() => {
  'use strict';
  // DH-08B compatibility: old bookmarked homepage modal hashes now resolve
  // to the corresponding permanent, statically rendered world destinations.
  // The homepage no longer has a second, competing Explore menu.
  const routes = new Set([
    'projects', 'writing', 'games', 'experiments',
    'music', 'unfinished', 'memory-lane'
  ]);
  const redirectOldHash = () => {
    let name;
    try { name = decodeURIComponent(location.hash.slice(1)).toLowerCase(); }
    catch { return; }
    if (name === 'explore') location.replace('/worlds/');
    else if (routes.has(name)) location.replace('/worlds/' + name + '/');
  };
  window.addEventListener('hashchange', redirectOldHash);
  redirectOldHash();
})();
