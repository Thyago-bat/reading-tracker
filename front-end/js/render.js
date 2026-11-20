window.App = window.App || {};
App.Render = (function () {
  'use strict';
  const esc = value =>
    String(value ?? '').replace(
      /[&<>"']/g,
      char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  const empty = value => (value === null || value === undefined || value === '' ? '-' : value);
  const authorNames = (ids, authors) =>
    (ids || [])
      .map(id => authors.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join(', ') || '-';
  const bookName = (id, books) => books.find(b => b.id === id)?.title || '-';
  const PAGE_SIZE = 25;
  function pageRecords(records, query, page) {
    const q = (query || '').trim().toLocaleLowerCase();
    const filtered = q
      ? records.filter(r => r.searchText.toLocaleLowerCase().includes(q))
      : records;
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
      current = Math.min(Math.max(1, page || 1), pages);
    const start = (current - 1) * PAGE_SIZE;
    return {
      records: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      page: current,
      pages,
      start,
    };
  }
  function pager(id, result) {
    const el = document.querySelector(id),
      { total, page, pages, start } = result;
    if (!total) {
      el.innerHTML = '<span>No matching records</span>';
      return;
    }
    const end = Math.min(start + PAGE_SIZE, total);
    el.innerHTML = `<span>Showing ${start + 1}–${end} of ${total}</span><div class="pager-controls"><button type="button" data-pager="${id}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button><span>Page ${page} of ${pages}</span><button type="button" data-pager="${id}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">›</button></div>`;
  }
  function readings(db, sortKey = 'yearRead', sortDirection = -1, query = '', page = 1) {
    const records = db.readings.map(r => ({
      ...r,
      title: bookName(r.bookId, db.books),
      authors: authorNames(db.books.find(b => b.id === r.bookId)?.authorIds, db.authors),
    }));
    records.sort((a, b) => {
      const av = a[sortKey],
        bv = b[sortKey],
        ma = av === null || av === undefined || av === '',
        mb = bv === null || bv === undefined || bv === '';
      if (ma !== mb) return ma ? 1 : -1;
      if (!ma) {
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
        if (cmp) return cmp * sortDirection;
      }
      return a.id - b.id;
    });
    records.forEach(
      r => (r.searchText = [r.title, r.authors, r.status, r.yearRead, r.grade].join(' ')),
    );
    const result = pageRecords(records, query, page);
    pager('#reading-pager', result);
    document.querySelector('#reading-rows').innerHTML = result.total
      ? result.records
          .map(
            r =>
              `<tr><td><strong>${esc(r.title)}</strong></td><td>${esc(r.authors)}</td><td><span class="pill">${esc(r.status)}</span></td><td>${esc(empty(r.yearRead))}</td><td>${esc(empty(r.grade))}</td><td><div class="actions"><button class="text-button" data-action="edit-reading" data-id="${r.id}">Edit</button><button class="text-button danger" data-action="delete-reading" data-id="${r.id}">Delete</button></div></td></tr>`,
          )
          .join('')
      : '<tr><td class="empty" colspan="6">No matching readings.</td></tr>';
  }
  function books(db, query = '', page = 1) {
    const records = db.books.map(b => {
      const themes = (b.themeIds || [])
        .map(id => db.themes.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return {
        ...b,
        themes,
        authors: authorNames(b.authorIds, db.authors),
        searchText: [
          b.title,
          authorNames(b.authorIds, db.authors),
          b.publicationYear,
          b.form,
          b.mode,
          b.content,
          themes,
        ].join(' '),
      };
    });
    const result = pageRecords(records, query, page);
    pager('#book-pager', result);
    document.querySelector('#book-rows').innerHTML = result.total
      ? result.records
          .map(
            b =>
              `<tr><td><strong>${esc(b.title)}</strong></td><td>${esc(b.authors)}</td><td>${esc(empty(b.publicationYear))}</td><td>${esc(empty(b.form))}</td><td>${esc(b.themes || '-')}</td><td><div class="actions"><button class="text-button" data-action="edit-book" data-id="${b.id}">Edit</button><button class="text-button" data-action="add-book-reading" data-id="${b.id}">Add reading</button><button class="text-button danger" data-action="delete-book" data-id="${b.id}">Delete</button></div></td></tr>`,
          )
          .join('')
      : '<tr><td class="empty" colspan="6">No matching books.</td></tr>';
  }
  function authors(db, query = '', page = 1) {
    const records = db.authors.map(a => ({
      ...a,
      nationality: db.countries.find(c => c.id === a.countryId)?.name || '-',
      searchText: [
        a.name,
        db.countries.find(c => c.id === a.countryId)?.name,
        a.birthDate,
        a.deathDate,
      ].join(' '),
    }));
    const result = pageRecords(records, query, page);
    pager('#author-pager', result);
    document.querySelector('#author-rows').innerHTML = result.total
      ? result.records
          .map(
            a =>
              `<tr><td><strong>${esc(a.name)}</strong></td><td>${esc(a.nationality)}</td><td>${esc(empty(a.birthDate))}</td><td>${esc(empty(a.deathDate))}</td><td><div class="actions"><button class="text-button" data-action="edit-author" data-id="${a.id}">Edit</button><button class="text-button danger" data-action="delete-author" data-id="${a.id}">Delete</button></div></td></tr>`,
          )
          .join('')
      : '<tr><td class="empty" colspan="5">No matching authors.</td></tr>';
  }
  function metrics(db) {
    const graded = db.readings.filter(r => typeof r.grade === 'number');
    const average = graded.length
      ? (graded.reduce((sum, r) => sum + r.grade, 0) / graded.length).toFixed(1)
      : '—';
    const cards = [
      ['Books', db.books.length, 'in your catalog'],
      ['Authors', db.authors.length, 'in your index'],
      ['Readings', db.readings.length, 'logged in total'],
      ['Average grade', average, `${graded.length} rated readings`],
    ];
    document.querySelector('#metrics').innerHTML = cards
      .map(
        (c, i) =>
          `<article class="metric metric-${i + 1}"><span class="metric-label">${c[0]}</span><strong>${esc(c[1])}</strong><span class="metric-note">${esc(c[2])}</span></article>`,
      )
      .join('');
    const statuses = ['Read', 'Reading', 'Paused', 'Want to read', 'Abandoned'];
    const counts = statuses.map(status => db.readings.filter(r => r.status === status).length),
      total = Math.max(1, db.readings.length);
    let offset = 0;
    const segments = statuses
      .map((s, i) => {
        const width = (counts[i] / total) * 100;
        const x = offset;
        offset += width;
        return `<rect class="status-${i}" x="${x}" y="0" width="${width}" height="12"><title>${esc(s)}: ${counts[i]}</title></rect>`;
      })
      .join('');
    document.querySelector('#status-chart').innerHTML =
      `<svg class="bar-stack" viewBox="0 0 100 12" preserveAspectRatio="none" role="img" aria-label="Reading status distribution">${segments}</svg>`;
    document.querySelector('#status-legend').innerHTML = statuses
      .map(
        (s, i) =>
          `<span><i class="legend-dot status-${i}"></i>${esc(s)} <b>${counts[i]}</b></span>`,
      )
      .join('');
    const bins = [
      ['0–4.5', r => r < 5],
      ['5–6.5', r => r >= 5 && r < 7],
      ['7–8.5', r => r >= 7 && r < 9],
      ['9–10', r => r >= 9],
    ];
    document.querySelector('#rating-snapshot').innerHTML =
      `<div class="rating-summary"><strong>${average}</strong><span>/ 10 average</span></div><div class="rating-bars">${bins
        .map(([label, test]) => {
          const n = graded.filter(r => test(r.grade)).length,
            width = graded.length ? (n / graded.length) * 100 : 0;
          return `<div class="rating-row"><span>${label}</span><svg class="rating-track" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="0" width="100" height="8" rx="4" class="rating-track-bg"/><rect x="0" y="0" width="${width}" height="8" rx="4" class="rating-fill"/></svg><b>${n}</b></div>`;
        })
        .join('')}</div>`;
  }
  function all(db, sortKey, sortDirection, query = '', pages = {}) {
    metrics(db);
    readings(db, sortKey, sortDirection, query, pages.readings);
    books(db, query, pages.books);
    authors(db, query, pages.authors);
  }
  return { all, readings };
})();
