window.App = window.App || {};
App.Main = (function () {
  'use strict';
  const S = App.Strings,
    V = App.Validation;
  let db,
    sortKey = 'yearRead',
    sortDirection = -1,
    noticeTimer,
    searchQuery = '',
    pages = { readings: 1, books: 1, authors: 1 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value =>
    String(value ?? '').replace(
      /[&<>"']/g,
      char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  function notify(message) {
    const el = $('#notice');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  async function refresh() {
    db = await App.Store.getAll();
    render();
  }
  function render() {
    App.Render.all(db, sortKey, sortDirection, searchQuery, pages);
  }
  function field(label, id, control, full = false) {
    return `<div class="field${full ? ' full' : ''}" data-field="${id}"><label for="${id}">${label}</label>${control}<small data-error="${id}"></small></div>`;
  }
  function selectOptions(options, selected) {
    return options
      .map(
        o =>
          `<option value="${esc(o.value)}" ${selected === o.value ? 'selected' : ''}>${esc(o.label)}</option>`,
      )
      .join('');
  }
  function selectList(id, list, selected, multiple = false) {
    return `<select id="${id}" ${multiple ? 'multiple' : ''}>${multiple ? '' : '<option value="">— Select —</option>'}${list.map(o => `<option value="${o.id}" ${(multiple ? (selected || []).includes(o.id) : selected === o.id) ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>`;
  }
  function openForm(kind, record = {}, extra = {}) {
    const editing = Boolean(record.id),
      fields = [];
    let title;
    if (kind === 'author') {
      title = editing ? 'Edit author' : 'Add author';
      fields.push(
        field(
          'Name *',
          'name',
          `<input id="name" maxlength="160" required value="${esc(record.name || '')}">`,
          true,
        ),
      );
      fields.push(
        field(
          'Nationality',
          'countryId',
          selectList('countryId', db.countries, record.countryId || ''),
        ),
      );
      fields.push(
        field(
          'Birth date',
          'birthDate',
          `<input id="birthDate" type="date" value="${esc(record.birthDate || '')}">`,
        ),
      );
      fields.push(
        field(
          'Death date',
          'deathDate',
          `<input id="deathDate" type="date" value="${esc(record.deathDate || '')}">`,
        ),
      );
    } else if (kind === 'book') {
      title = editing ? 'Edit book' : 'Add book';
      fields.push(
        field(
          'Title *',
          'title',
          `<input id="title" maxlength="250" required value="${esc(record.title || '')}">`,
          true,
        ),
      );
      fields.push(
        field(
          'Authors',
          'authorIds',
          selectList('authorIds', db.authors, record.authorIds || [], true),
          true,
        ),
      );
      fields.push(
        field(
          'Original publication year',
          'publicationYear',
          `<input id="publicationYear" type="number" step="1" placeholder="Negative years mean BC" value="${esc(record.publicationYear ?? '')}">`,
        ),
      );
      fields.push(
        field(
          'Form',
          'form',
          `<select id="form"><option value="">— Select —</option>${selectOptions(
            S.forms.map(x => ({ value: x, label: x })),
            record.form || '',
          )}</select>`,
        ),
      );
      fields.push(
        field(
          'Mode of expression',
          'mode',
          `<select id="mode"><option value="">— Select —</option>${selectOptions(
            S.modes.map(x => ({ value: x, label: x })),
            record.mode || '',
          )}</select>`,
        ),
      );
      fields.push(
        field(
          'Content',
          'content',
          `<select id="content"><option value="">— Select —</option>${selectOptions(
            S.contents.map(x => ({ value: x, label: x })),
            record.content || '',
          )}</select>`,
        ),
      );
      fields.push(
        field(
          'Themes',
          'themeIds',
          selectList('themeIds', db.themes, record.themeIds || [], true),
          true,
        ),
      );
      fields.push(
        field(
          'Create theme(s), comma separated',
          'newThemes',
          '<input id="newThemes" placeholder="e.g. Memory, Family">',
          true,
        ),
      );
      if (!editing) {
        fields.push('<div class="section-title">Optional first reading</div>');
        fields.push(
          field(
            'Create a first reading',
            'firstReading',
            '<select id="firstReading"><option value="no">No</option><option value="yes">Yes</option></select>',
          ),
        );
        fields.push(readingFields({ status: 'Want to read' }, 'first-'));
      }
    } else {
      title = editing ? 'Edit reading' : 'Add reading';
      fields.push(
        field(
          'Book *',
          'bookId',
          selectList(
            'bookId',
            db.books.map(b => ({ id: b.id, name: b.title })),
            record.bookId || extra.bookId || '',
          ),
          true,
        ),
      );
      fields.push(readingFields(record));
    }
    $('#form-kicker').textContent = kind.toUpperCase();
    $('#form-title').textContent = title;
    $('#form-fields').innerHTML = fields.join('');
    const form = $('#editor-form');
    form.dataset.kind = kind;
    form.dataset.id = record.id || '';
    form.dataset.first = kind === 'book' && !editing ? 'true' : 'false';
    if (kind === 'book' && !editing) toggleFirstReading();
    if (kind === 'reading') {
      updateReadingFields(record.status || 'Want to read', '');
      $('#status').dataset.previousStatus = record.status || 'Want to read';
    }
    if (kind === 'book' && !editing) $('#first-status').dataset.previousStatus = 'Want to read';
    $('#editor').showModal();
  }
  function readingFields(record = {}, prefix = '') {
    const status = record.status || 'Want to read';
    return (
      `<div class="section-title">${prefix ? 'First reading details' : 'Reading details'}</div>` +
      field(
        'Status *',
        `${prefix}status`,
        `<select id="${prefix}status">${selectOptions(
          S.statuses.map(x => ({ value: x, label: x })),
          status,
        )}</select>`,
      ) +
      field(
        'Year read',
        `${prefix}yearRead`,
        `<input id="${prefix}yearRead" type="number" step="1" value="${esc(record.yearRead ?? '')}">`,
      ) +
      field(
        'Grade',
        `${prefix}grade`,
        `<input id="${prefix}grade" type="number" min="0" max="10" step="0.5" value="${esc(record.grade ?? '')}">`,
      ) +
      field(
        'Priority',
        `${prefix}priority`,
        `<select id="${prefix}priority"><option value="">— Select —</option>${selectOptions(
          S.priorities.map(x => ({ value: x, label: x })),
          record.priority || '',
        )}</select>`,
      ) +
      field(
        'Recommended by',
        `${prefix}recommendedBy`,
        `<input id="${prefix}recommendedBy" maxlength="160" value="${esc(record.recommendedBy || '')}">`,
      ) +
      field(
        'Notes',
        `${prefix}notes`,
        `<textarea id="${prefix}notes" rows="2">${esc(record.notes || '')}</textarea>`,
        true,
      )
    );
  }
  function toggleFirstReading() {
    const show = $('#firstReading').value === 'yes';
    document.querySelectorAll('#form-fields [id^="first-"]').forEach(el => {
      const box = el.closest('.field,.section-title');
      if (box) box.hidden = !show;
    });
  }
  function updateReadingFields(status, prefix) {
    const allowYear = ['Read', 'Abandoned'].includes(status),
      allowGrade = allowYear,
      allowPriority = status === 'Want to read';
    const set = (suffix, visible) => {
      const el = $(`#${prefix}${suffix}`);
      const box = el?.closest('.field');
      if (box) box.hidden = !visible;
    };
    set('yearRead', allowYear);
    set('grade', allowGrade);
    set('priority', allowPriority);
  }
  function onStatusChange(select, prefix) {
    const next = select.value,
      previous = select.dataset.previousStatus || 'Want to read';
    const year = $(`#${prefix}yearRead`),
      grade = $(`#${prefix}grade`),
      priority = $(`#${prefix}priority`);
    if (!['Read', 'Abandoned'].includes(next) && ((year && year.value) || (grade && grade.value))) {
      if (!confirm(S.messages.clearReadingFields)) {
        select.value = previous;
        return;
      }
      if (year) year.value = '';
      if (grade) grade.value = '';
    }
    if (previous === 'Want to read' && next !== 'Want to read' && priority) priority.value = '';
    select.dataset.previousStatus = next;
    updateReadingFields(next, prefix);
  }
  function readForm(kind) {
    const get = id => $('#' + id)?.value ?? '';
    if (kind === 'author')
      return {
        name: get('name').trim(),
        countryId: get('countryId') ? Number(get('countryId')) : null,
        birthDate: get('birthDate') || null,
        deathDate: get('deathDate') || null,
      };
    if (kind === 'book') {
      const names = get('newThemes')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      return {
        title: get('title').trim(),
        authorIds: [...$('#authorIds').selectedOptions].map(o => Number(o.value)),
        publicationYear: get('publicationYear') === '' ? null : Number(get('publicationYear')),
        form: get('form') || null,
        mode: get('mode') || null,
        content: get('content') || null,
        themeIds: [...$('#themeIds').selectedOptions].map(o => Number(o.value)),
        newThemes: names,
      };
    }
    const p = kind === 'first-reading' ? 'first-' : '';
    return {
      bookId: Number(get('bookId')),
      status: get(p + 'status'),
      yearRead: get(p + 'yearRead') === '' ? null : Number(get(p + 'yearRead')),
      grade: get(p + 'grade') === '' ? null : Number(get(p + 'grade')),
      priority: get(p + 'priority') || null,
      recommendedBy: get(p + 'recommendedBy').trim() || null,
      notes: get(p + 'notes').trim() || null,
    };
  }
  function showErrors(errors) {
    document.querySelectorAll('[data-error]').forEach(el => (el.textContent = ''));
    document.querySelectorAll('.field').forEach(el => el.classList.remove('invalid'));
    for (const [key, msg] of Object.entries(errors)) {
      const hint = $(`[data-error="${key}"]`);
      if (hint) {
        hint.textContent = msg;
        hint.closest('.field').classList.add('invalid');
      }
    }
  }
  // Shows an error from the store (same format as the API): 400 next to the fields, others in a message
  function showStoreError(error, prefix = '') {
    if (error.status === 400 && error.errors && error.errors.length) {
      const fieldErrors = {};
      for (const item of error.errors) fieldErrors[prefix + item.field] = item.message;
      showErrors(fieldErrors);
    } else {
      alert(error.message);
    }
  }
  async function submitForm(event) {
    event.preventDefault();
    const form = $('#editor-form'),
      kind = form.dataset.kind,
      id = Number(form.dataset.id) || null;
    let value;
    let newThemeNames = [];
    if (kind === 'book') {
      value = readForm('book');
      newThemeNames = value.newThemes;
      delete value.newThemes;
    } else value = readForm(kind);
    if (id) value.id = id;
    let errors = V.validate(kind, value, db);
    let firstReading = null;
    if (kind === 'book' && !id && $('#firstReading').value === 'yes') {
      firstReading = readForm('first-reading');
      firstReading.bookId = -1;
      const candidate = { ...value, id: -1 };
      const readingErrors = V.validate('reading', firstReading, {
        ...db,
        books: [...db.books, candidate],
      });
      errors = {
        ...errors,
        ...Object.fromEntries(
          Object.entries(readingErrors).map(([key, msg]) => [`first-${key}`, msg]),
        ),
      };
    }
    let priorReading = null;
    if (kind === 'reading' && id) {
      priorReading = db.readings.find(r => r.id === id);
      const yearNotAllowed = !['Read', 'Abandoned'].includes(value.status);
      const gradeNotAllowed = !['Read', 'Abandoned'].includes(value.status);
      const mustClear =
        (yearNotAllowed && value.yearRead != null) || (gradeNotAllowed && value.grade != null);
      if (mustClear && !confirm(S.messages.clearReadingFields)) return;
      if (yearNotAllowed) value.yearRead = null;
      if (gradeNotAllowed) value.grade = null;
      if (priorReading.status === 'Want to read' && value.status !== 'Want to read')
        value.priority = null;
    }
    if (kind === 'reading' && value.status !== 'Want to read') value.priority = null;
    if (kind === 'reading') errors = V.validate('reading', value, db);
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }
    let saved;
    try {
      if (kind === 'book') {
        for (const name of newThemeNames) {
          let theme = db.themes.find(t => t.name.toLocaleLowerCase() === name.toLocaleLowerCase());
          if (!theme) {
            theme = await App.Store.saveRecord('themes', { name });
            db = await App.Store.getAll();
          }
          value.themeIds.push(theme.id);
        }
        value.themeIds = [...new Set(value.themeIds)];
      }
      const collection = kind === 'author' ? 'authors' : kind === 'book' ? 'books' : 'readings';
      const record = id ? { ...db[collection].find(x => x.id === id), ...value, id } : value;
      saved = await App.Store.saveRecord(collection, record);
    } catch (error) {
      showStoreError(error);
      return;
    }
    if (kind === 'book' && firstReading) {
      firstReading.bookId = saved.id;
      try {
        await App.Store.saveRecord('readings', firstReading);
      } catch (error) {
        showStoreError(error, 'first-');
        return;
      }
    }
    $('#editor').close();
    await refresh();
    notify(S.messages.saved);
  }
  async function handleAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id),
      action = button.dataset.action;
    if (action === 'edit-author')
      openForm(
        'author',
        db.authors.find(x => x.id === id),
      );
    if (action === 'edit-book')
      openForm(
        'book',
        db.books.find(x => x.id === id),
      );
    if (action === 'edit-reading')
      openForm(
        'reading',
        db.readings.find(x => x.id === id),
      );
    if (action === 'add-book-reading') openForm('reading', {}, { bookId: id });
    if (action === 'delete-author') {
      const author = db.authors.find(x => x.id === id);
      if (!confirm(`Delete author “${author.name}”?`)) return;
      try {
        await App.Store.deleteRecord('authors', id);
        await refresh();
        notify(S.messages.deleted);
      } catch (error) {
        alert(error.message);
      }
    }
    if (action === 'delete-book') {
      const readings = db.readings.filter(r => r.bookId === id);
      if (!confirm(S.messages.deleteBook.replace('{count}', readings.length))) return;
      try {
        await App.Store.deleteRecord('books', id);
        await refresh();
        notify(S.messages.deleted);
      } catch (error) {
        alert(error.message);
      }
    }
    if (action === 'delete-reading') {
      if (!confirm('Delete this reading?')) return;
      try {
        await App.Store.deleteRecord('readings', id);
        await refresh();
        notify(S.messages.deleted);
      } catch (error) {
        alert(error.message);
      }
    }
  }
  function switchPage(page) {
    document
      .querySelectorAll('.page')
      .forEach(el => el.classList.toggle('active', el.id === `page-${page}`));
    document
      .querySelectorAll('.nav-button')
      .forEach(el => el.classList.toggle('active', el.dataset.page === page));
    const input = $('#global-search');
    input.placeholder = `Search ${page === 'readings' ? 'readings' : page}…`;
    input.setAttribute('aria-label', `Search ${page === 'readings' ? 'readings' : page}`);
  }
  async function resetData() {
    if (!confirm('Delete all changes and restore the instructor seed data?')) return;
    db = await App.Store.reset();
    render();
    notify(S.messages.reset);
  }
  function bind() {
    document.addEventListener('click', handleAction);
    for (const [id, key] of [
      ['reading-pager', 'readings'],
      ['book-pager', 'books'],
      ['author-pager', 'authors'],
    ]) {
      const pager = $(`#${id}`);
      pager.addEventListener('click', event => {
        const button = event.target.closest('button[data-page]');
        if (!button || button.disabled) return;
        const next = Number(button.dataset.page);
        if (!Number.isInteger(next) || next < 1) return;
        pages[key] = next;
        render();
      });
    }
    $('#global-search').addEventListener('input', event => {
      searchQuery = event.target.value;
      pages = { readings: 1, books: 1, authors: 1 };
      render();
    });
    document
      .querySelectorAll('.nav-button')
      .forEach(b => b.addEventListener('click', () => switchPage(b.dataset.page)));
    $('#add-author').addEventListener('click', () => openForm('author'));
    $('#add-book').addEventListener('click', () => openForm('book'));
    $('#add-reading').addEventListener('click', () => openForm('reading'));
    $('#reset-data').addEventListener('click', resetData);
    $('#editor-form').addEventListener('submit', submitForm);
    $('#cancel-editor').addEventListener('click', () => $('#editor').close());
    $('#close-editor').addEventListener('click', () => $('#editor').close());
    $('#form-fields').addEventListener('change', e => {
      if (e.target.id === 'firstReading') toggleFirstReading();
      if (e.target.id === 'status') onStatusChange(e.target, '');
      if (e.target.id === 'first-status') onStatusChange(e.target, 'first-');
    });
    document.querySelectorAll('.sort').forEach(b =>
      b.addEventListener('click', () => {
        if (sortKey === b.dataset.sort) sortDirection *= -1;
        else {
          sortKey = b.dataset.sort;
          sortDirection = sortKey === 'yearRead' ? -1 : 1;
        }
        App.Render.readings(db, sortKey, sortDirection, searchQuery, pages.readings);
      }),
    );
  }
  async function init() {
    bind();
    db = await App.Store.initialize();
    render();
  }
  return { init };
})();
document.addEventListener('DOMContentLoaded', () =>
  App.Main.init().catch(error => {
    console.error(error);
    const n = document.querySelector('#notice');
    n.textContent = `Could not start the app: ${error.message} Start it with a local web server.`;
    n.classList.add('show');
  }),
);
