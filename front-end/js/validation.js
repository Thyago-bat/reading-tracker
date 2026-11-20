window.App = window.App || {};
App.Validation = (function () {
  'use strict';
  const now = new Date().getFullYear();
  const statuses = App.Strings.statuses;
  function validate(type, value, state) {
    const errors = {};
    const required = (key, label) => { if (!String(value[key] ?? '').trim()) errors[key] = `${label} is required.`; };
    const year = (key, label, min = 1, max = now) => {
      if (value[key] !== '' && value[key] != null) {
        const n = Number(value[key]);
        if (!Number.isInteger(n) || n === 0 || n < min || n > max) errors[key] = `${label} must be a valid year (${min}–${max}; no year 0).`;
      }
    };
    if (type === 'author') {
      required('name', 'Name');
      const same = state.authors.find(a => a.name.toLocaleLowerCase() === String(value.name).trim().toLocaleLowerCase() && a.id !== value.id);
      if (same) errors.name = 'An author with this name already exists.';
      if (value.birthDate && value.birthDate > new Date().toISOString().slice(0, 10)) errors.birthDate = 'Birth date cannot be in the future.';
      if (value.deathDate && value.birthDate && value.deathDate <= value.birthDate) errors.deathDate = 'Death date must be after birth date.';
      if (value.deathDate && value.deathDate > new Date().toISOString().slice(0, 10)) errors.deathDate = 'Death date cannot be in the future.';
      if (value.countryId && !state.countries.some(c => c.id === Number(value.countryId))) errors.countryId = 'Choose a country from the list.';
    }
    if (type === 'book') {
      required('title', 'Title');
      year('publicationYear', 'Publication year', Number.MIN_SAFE_INTEGER, now);
      if (value.publicationYear !== '' && value.publicationYear != null && Number(value.publicationYear) === 0) errors.publicationYear = 'Year 0 does not exist.';
      if ((value.authorIds || []).some(id => !state.authors.some(a => a.id === Number(id)))) errors.authorIds = 'Choose existing authors.';
      if ((value.themeIds || []).some(id => !state.themes.some(t => t.id === Number(id)))) errors.themeIds = 'Choose existing themes.';
    }
    if (type === 'reading') {
      if (!state.books.some(b => b.id === Number(value.bookId))) errors.bookId = 'Choose a book.';
      if (!statuses.includes(value.status)) errors.status = 'Choose a valid status.';
      if (value.status === 'Read' && (value.yearRead === '' || value.yearRead == null)) errors.yearRead = App.Strings.messages.needReadYear;
      year('yearRead', 'Year read', 1, now);
      const book = state.books.find(b => b.id === Number(value.bookId));
      if (book?.publicationYear && value.yearRead && Number(value.yearRead) < book.publicationYear) errors.yearRead = 'Year read cannot be earlier than publication year.';
      if (!['Read', 'Abandoned'].includes(value.status) && value.yearRead !== '' && value.yearRead != null) errors.yearRead = 'Year read is allowed only for Read or Abandoned.';
      if (value.grade !== '' && value.grade != null) {
        const grade = Number(value.grade);
        if (!Number.isFinite(grade) || grade < 0 || grade > 10 || Math.round(grade * 2) !== grade * 2) errors.grade = 'Grade must be from 0 to 10 in steps of 0.5.';
      }
      if (!['Read', 'Abandoned'].includes(value.status) && value.grade !== '' && value.grade != null) errors.grade = 'Grade is allowed only for Read or Abandoned.';
      if (value.status !== 'Want to read' && value.priority) errors.priority = 'Priority is allowed only for Want to read.';
    }
    return errors;
  }
  return { validate };
})();
