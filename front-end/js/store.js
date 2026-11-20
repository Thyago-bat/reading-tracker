/* ============================================================
   store.js — All data access (localStorage in Delivery 1).
   Keeps the seed.json shapes. Errors use the same format as the
   API of Delivery 2: { status, message, errors: [{ field, message }] }
   ============================================================ */
window.App = window.App || {};

App.Store = (function () {
  'use strict';

  const KEY = 'reading-tracker:data:v1';
  const SEED_URL = 'data/seed.json';
  const COLLECTIONS = ['countries', 'authors', 'themes', 'books', 'readings'];
  // Which validation rules apply to each collection
  const TYPES = { authors: 'author', books: 'book', readings: 'reading' };
  let data = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Creates an error with the same structure the API will send (Section 7)
  function apiError(status, message, fieldErrors) {
    const error = new Error(message);
    error.status = status;
    error.errors = [];
    for (const field in fieldErrors || {}) {
      error.errors.push({ field: field, message: fieldErrors[field] });
    }
    return error;
  }

  function validateData(value) {
    const errors = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.data = 'Seed data must be a JSON object.';
    } else {
      COLLECTIONS.forEach(name => {
        if (!Array.isArray(value[name])) errors[name] = 'Expected an array.';
      });
    }
    if (Object.keys(errors).length) {
      throw apiError(400, 'The seed data has an invalid format.', errors);
    }
    return value;
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (cause) {
      throw apiError(500, 'Could not save data in localStorage.');
    }
  }

  async function initialize() {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) {
      try {
        data = validateData(JSON.parse(saved));
        return clone(data);
      } catch (cause) {
        if (cause.status) throw cause;
        throw apiError(500, 'Saved data in localStorage is not valid JSON.');
      }
    }

    const response = await fetch(SEED_URL);
    if (!response.ok) {
      throw new Error(`Could not load ${SEED_URL} (HTTP ${response.status}).`);
    }
    data = validateData(await response.json());
    persist();
    return clone(data);
  }

  function requireData() {
    if (!data) throw new Error('Call initialize() before using the store.');
  }

  function requireCollection(name) {
    if (!COLLECTIONS.includes(name)) throw new Error(`Unknown collection: ${name}`);
  }

  async function getAll() {
    requireData();
    return clone(data);
  }

  async function getCollection(name) {
    requireData();
    requireCollection(name);
    return clone(data[name]);
  }

  async function nextId(name) {
    requireData();
    requireCollection(name);
    const records = data[name];
    return records.reduce((highest, record) => Math.max(highest, Number(record.id) || 0), 0) + 1;
  }

  async function saveRecord(name, record) {
    requireData();
    requireCollection(name);

    // Countries are a fixed list (Section 4)
    if (name === 'countries') {
      throw apiError(400, 'Countries cannot be changed.');
    }

    // Same rules the server will check in Delivery 2 (400)
    const type = TYPES[name];
    if (type) {
      const fieldErrors = App.Validation.validate(type, record, data);
      if (Object.keys(fieldErrors).length) {
        throw apiError(400, 'Validation failed', fieldErrors);
      }
    }

    // Theme names are unique, ignoring upper/lower case (409)
    if (name === 'themes') {
      const newName = String(record.name || '')
        .trim()
        .toLowerCase();
      const exists = data.themes.some(t => t.name.toLowerCase() === newName && t.id !== record.id);
      if (exists) throw apiError(409, 'A theme with this name already exists');
    }

    const records = data[name];
    const savedRecord = clone(record);
    if (!Number.isInteger(Number(savedRecord.id)) || Number(savedRecord.id) < 1) {
      savedRecord.id = await nextId(name);
    } else {
      savedRecord.id = Number(savedRecord.id);
    }
    const index = records.findIndex(item => item.id === savedRecord.id);
    if (index === -1) records.push(savedRecord);
    else records[index] = savedRecord;
    persist();
    return clone(savedRecord);
  }

  async function deleteRecord(name, id) {
    requireData();
    requireCollection(name);
    id = Number(id);

    if (name === 'countries') {
      throw apiError(400, 'Countries cannot be changed.');
    }
    if (!data[name].some(record => record.id === id)) {
      throw apiError(404, 'Record not found');
    }

    // An author linked to a book cannot be deleted (409)
    if (name === 'authors') {
      const linked = data.books.filter(book => (book.authorIds || []).includes(id));
      if (linked.length) {
        const titles = linked.map(book => book.title).join(', ');
        throw apiError(409, `Author is linked to ${linked.length} book(s): ${titles}`);
      }
    }

    // Deleting a book also deletes its readings
    if (name === 'books') {
      data.readings = data.readings.filter(reading => reading.bookId !== id);
    }

    data[name] = data[name].filter(record => record.id !== id);
    persist();
  }

  async function reset() {
    localStorage.removeItem(KEY);
    data = null;
    return initialize();
  }

  return {
    KEY,
    COLLECTIONS: [...COLLECTIONS],
    initialize,
    getAll,
    getCollection,
    nextId,
    saveRecord,
    deleteRecord,
    reset,
  };
})();
