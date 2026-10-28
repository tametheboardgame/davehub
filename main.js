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
  // DH-06D: use the transparent animation where alpha VP9 playback is supported.
  // Keep the existing still for reduced motion, data saver, Safari and failures.
  const daveStage = document.getElementById('dave-stage');
  const daveVideo = document.getElementById('dave-stage-motion');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const safari = /Safari/i.test(navigator.userAgent) && !/(Chrome|Chromium|CriOS|Edg|OPR)/i.test(navigator.userAgent);
  const ios = /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const saveData = navigator.connection?.saveData === true;
  const playable = daveVideo?.canPlayType('video/webm; codecs="vp9"') !== '';
  if (daveStage && daveVideo && playable && !safari && !ios && !saveData) {
    let replay;
    const staticFallback = () => {
      daveStage.classList.remove('dave-stage--motion-ready');
      window.clearTimeout(replay);
    };
    const play = () => {
      if (reduced.matches || document.hidden) return;
      daveVideo.play().catch(staticFallback);
    };
    daveVideo.addEventListener('playing', () => daveStage.classList.add('dave-stage--motion-ready'));
    daveVideo.addEventListener('error', staticFallback);
    daveVideo.addEventListener('ended', () => {
      // Hold Dave's resting pose rather than continuously repeating the gesture.
      replay = window.setTimeout(() => {
        daveVideo.currentTime = 0;
        play();
      }, 10000);
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) { daveVideo.pause(); staticFallback(); }
      else play();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) daveVideo.pause();
      else play();
    });
    if (!reduced.matches) {
      daveVideo.preload = 'auto';
      play();
    }
  }
})();
