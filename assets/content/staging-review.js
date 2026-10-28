'use strict';
/*
 * DaveHub staging navigation bridge.
 * Staging davehub.pages.dev shows layout-only first-wave candidate cards in
 * the existing /worlds/ routes. Actual creative works remain absent from the
 * validated public catalogue until the owner explicitly approves them.
 * Never redirect an independent live custom-domain installation.
 */
(() => {
  const loc = window.location;
  if (!loc || loc.hostname !== 'davehub.pages.dev') return;
  // The review is public-safe names and placeholders ONLY.
  // Do not match any /previews path: this avoids redirect loops.
  if (!/^\/worlds(?:\/(?:projects|writing|games|experiments|music|unfinished|memory-lane))?\/?$/.test(loc.pathname)) return;
  const route = loc.pathname.endsWith('/') ? loc.pathname : loc.pathname + '/';
  loc.replace('/previews/dh-08c' + route);
})();
