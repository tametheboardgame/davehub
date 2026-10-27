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
    const groups = document.createElement('div');
    groups.className = 'world-directory__groups';
    const views = [
      { id: 'worlds', title: 'The four worlds', summary: 'The main paths through DaveHub.' },
      { id: 'collections', title: 'Elsewhere in DaveHub', summary: 'Different ways to uncover the same creations.' }
    ];
    views.forEach((view) => {
      const matching = catalogue.filter((section) => (section.group || 'worlds') === view.id);
      if (!matching.length) return;
      const group = document.createElement('section');
      group.className = 'world-directory__group';
      const label = document.createElement('h3');
      label.className = 'world-directory__label';
      label.textContent = view.title;
      const summary = document.createElement('p');
      summary.className = 'world-directory__summary';
      summary.textContent = view.summary;
      const grid = document.createElement('nav');
      grid.className = 'world-directory';
      grid.setAttribute('aria-label', view.title);
      matching.forEach((section) => {
        const link = makeLink(section);
        if (view.id === 'collections') link.classList.add('world-directory__item--collection');
        grid.append(link);
      });
      group.append(label, summary, grid);
      groups.append(group);
    });
    return groups;
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
    note.textContent = section.note || 'This is a working navigation prototype. No real project content has been published here.';
    wrapper.append(status, note);
    if (section.links?.length) {
      const label = document.createElement('h3');
      label.className = 'section-details__heading';
      label.textContent = 'Where to next?';
      const list = document.createElement('nav');
      list.className = 'section-details__links';
      list.setAttribute('aria-label', section.title + ' destinations');
      section.links.forEach(({ title, description, href }) => {
        const anchor = document.createElement('a');
        anchor.className = 'section-details__link';
        anchor.href = href;
        const words = document.createElement('span');
        const titleText = document.createElement('strong');
        titleText.textContent = title;
        const sub = document.createElement('small');
        sub.textContent = description;
        words.append(titleText, sub);
        anchor.append(words, icon('arrow'));
        list.append(anchor);
      });
      wrapper.append(label, list);
    }
    const back = document.createElement('a');
    back.href = '#explore';
    back.className = 'section-details__back';
    back.textContent = '← Explore the other worlds';
    wrapper.append(back);
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
        description.textContent = isExplorer ? 'Four worlds, with a few unexpected ways to explore them.' : section.description;
    kicker.textContent = isExplorer ? 'CHOOSE A DESTINATION' : `DESTINATION / ${section.number}`;
    content.replaceChildren(isExplorer ? buildWorldDirectory() : buildSection(section));
    modal.dataset.destination = isExplorer ? 'explore' : section.id;
    if (!modal.open) {
      restoringFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modal.showModal();
      closeButton.focus();
    } else {
      // Hash-based navigation can replace a currently focused link.
      // Move focus to the new destination heading instead of dropping it.
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
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