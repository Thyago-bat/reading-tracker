window.App = window.App || {};
App.Strings = {
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
  messages: {
    saved: 'Record saved.',
    deleted: 'Record deleted.',
    reset: 'Seed data restored.',
    linkedAuthor: 'This author is linked to these books and cannot be deleted: ',
    deleteBook: 'Delete this book and its {count} reading(s)?',
    clearReadingFields: 'Changing status clears year read and grade. Continue?',
    needReadYear: 'A year read is required when status is Read.',
  },
};
