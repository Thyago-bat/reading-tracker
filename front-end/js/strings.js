/* All interface text in one place */
window.App = window.App || {};
App.Strings = {
  // Fixed lists (Section 4)
  statuses: ['Want to read', 'Reading', 'Paused', 'Read', 'Abandoned'],
  forms: [
    'Novel',
    'Novella',
    'Short Story',
    'Short Story Collection',
    'Play',
    'Essay',
    'Treatise',
    'Diary',
    'Graphic Novel',
  ],
  modes: ['Prose', 'Drama', 'Poetry', 'Sequential Art'],
  contents: ['Fiction', 'Non-fiction'],
  priorities: ['Low', 'Medium', 'High'],
 
  // Form titles
  titles: {
    addAuthor: 'Add author',
    editAuthor: 'Edit author',
    addBook: 'Add book',
    editBook: 'Edit book',
    addReading: 'Add reading',
    editReading: 'Edit reading',
  },
 
  // Form field labels
  labels: {
    name: 'Name *',
    nationality: 'Nationality',
    birthDate: 'Birth date',
    deathDate: 'Death date',
    title: 'Title *',
    authors: 'Authors',
    publicationYear: 'Original publication year',
    form: 'Form',
    mode: 'Mode of expression',
    content: 'Content',
    themes: 'Themes',
    newThemes: 'Create theme(s), comma separated',
    firstReading: 'Create a first reading',
    book: 'Book *',
    status: 'Status *',
    yearRead: 'Year read',
    grade: 'Grade',
    priority: 'Priority',
    recommendedBy: 'Recommended by',
    notes: 'Notes',
  },
 
  // Other form text
  form: {
    select: '— Select —',
    yes: 'Yes',
    no: 'No',
    publicationYearHint: 'Negative years mean BC',
    newThemesHint: 'e.g. Memory, Family',
    optionalFirstReading: 'Optional first reading',
    firstReadingDetails: 'First reading details',
    readingDetails: 'Reading details',
  },
 
  // Tables and pagination
  table: {
    edit: 'Edit',
    delete: 'Delete',
    addReading: 'Add reading',
    noRecords: 'No matching records',
    noReadings: 'No matching readings.',
    noBooks: 'No matching books.',
    noAuthors: 'No matching authors.',
    showing: 'Showing {start}–{end} of {total}',
    page: 'Page {page} of {pages}',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    search: 'Search {page}…',
  },
 
  // Summary cards and charts
  metrics: {
    books: 'Books',
    booksNote: 'in your catalog',
    authors: 'Authors',
    authorsNote: 'in your index',
    readings: 'Readings',
    readingsNote: 'logged in total',
    averageGrade: 'Average grade',
    ratedReadings: '{count} rated readings',
    average: '/ 10 average',
    statusChart: 'Reading status distribution',
  },
 
  // Messages and confirmations
  messages: {
    saved: 'Record saved.',
    deleted: 'Record deleted.',
    reset: 'Seed data restored.',
    deleteAuthor: 'Delete author “{name}”?',
    deleteBook: 'Delete this book and its {count} reading(s)?',
    deleteReading: 'Delete this reading?',
    resetConfirm: 'Delete all changes and restore the instructor seed data?',
    clearReadingFields: 'Changing status clears year read and grade. Continue?',
    needReadYear: 'A year read is required when status is Read.',
    startError: 'Could not start the app: {error} Start it with a local web server.',
  },
};
 
