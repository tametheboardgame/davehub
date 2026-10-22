(() => {
  'use strict';
  const catalogue = window.DAVEHUB_CATALOGUE || [];
  const modal = document.getElementById('world-dialog');
  const heading = document.getElementById('dialog-heading');
  const description = document.getElementById('dialog-description');
  const kicker = document.getElementById('dialog-kicker');
  const content = document.getElementById('dialog-content');
  const closeButton = document.getElementById('dialog-close');
  if (!modal || !heading || !description || !kicker || !content || !closeButton) return;

  const icon = (id) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('glyph');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#icon-${id}`);
    svg.appendChild(use);
    return svg;
  };

  const makeLink = (section) => {
    const anchor = document.createElement('a');
    anchor.className = 'world-directory__item';
    anchor.href = `#${section.id}`;
    anchor.dataset.category = section.id;
    anchor.append(icon(section.icon));
    const words = document.createElement('span');
    words.className = 'world-directory__words';
    const title = document.createElement('strong');
    title.textContent = section.title;
    const sub = document.createElement('small');
    sub.textContent = section.description;
    words.append(title, sub);
    anchor.append(words, icon('arrow'));
    return anchor;
  };

  const buildWorldDirectory = () => {
    const grid = document.createElement('nav');
    grid.className = 'world-directory';
    grid.setAttribute('aria-label', 'Choose a destination');
    catalogue.forEach((section) => grid.append(makeLink(section)));
    return grid;
  };

  const buildSection = (section) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'section-details';
    wrapper.dataset.category = section.id;
    const status = document.createElement('p');
    status.className = 'section-details__status';
    status.textContent = section.status;
    const note = document.createElement('p');
    note.className = 'section-details__note';
    note.textContent = 'This is a working navigation prototype. We have not published any projects into this destination yet.';
    const back = document.createElement('a');
    back.href = '#explore';
    back.className = 'section-details__back';
    back.textContent = '← Explore the other worlds';
    wrapper.append(status, note, back);
    return wrapper;
  };

  let restoringFocus = null;
  let closingFromHash = false;
  const showLocation = () => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, '')).toLowerCase();
    const section = catalogue.find((item) => item.id === hash);
    if (hash !== 'explore' && !section) {
      if (modal.open) { closingFromHash = true; modal.close(); }
      return;
    }
    const isExplorer = hash === 'explore';
    heading.textContent = isExplorer ? 'Where shall we go?' : section.title;
    description.textContent = isExplorer ? 'Four parts of one very unreasonable place. Pick somewhere to start.' : section.description;
    kicker.textContent = isExplorer ? 'CHOOSE A DESTINATION' : `DESTINATION / ${section.number}`;
    content.replaceChildren(isExplorer ? buildWorldDirectory() : buildSection(section));
    modal.dataset.destination = isExplorer ? 'explore' : section.id;
    if (!modal.open) {
      restoringFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modal.showModal();
      closeButton.focus();
    }
  };

  const clearHash = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    try {
      history.replaceState(null, '', url.pathname + url.search);
    } catch {
      // Also works when previewed from an opaque local document.
      window.location.hash = '';
    }
  };

  modal.addEventListener('close', () => {
    if (!closingFromHash && window.location.hash) clearHash();
    closingFromHash = false;
    if (restoringFocus && restoringFocus.isConnected) restoringFocus.focus({ preventScroll: true });
  });
  closeButton.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
  window.addEventListener('hashchange', showLocation);
  showLocation();
})();