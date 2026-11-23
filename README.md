# Reading Tracker
 
A browser-based reading tracker for organizing authors, books, and reading records. This repository is currently being prepared for **Delivery 1 (front-end only)** of the Web Development course assignment at UNIFAL-MG.
 
The first delivery uses vanilla HTML, CSS, and JavaScript. Data is loaded from the instructor-provided seed file and saved in the browser's `localStorage`; there is no back-end or remote database in this delivery.
 
## Delivery schedule
 
| Delivery | Scope | Due date | Git tag |
|---|---|---|---|
| 1 – Front-end | HTML, CSS, JavaScript, seed data, and `localStorage` | Nov 20, 2026, 23:59 (Brasília) | `delivery-1` |
| 2 – Full stack | Spring Boot REST API, persistence, and front-end integration | Dec 11, 2026, 23:59 (Brasília) | `delivery-2` |
 
## Current front-end features
 
- Dashboard metrics for books, authors, readings, and average grade.
- Reading status distribution and grade-range visualizations.
- Reading log sorted by title, authors, status, year read, or grade. Missing values are shown as `-`.
- Search in the current section: readings, books, or authors. Search checks relevant visible data, including book themes and author names.
- Pagination for readings, books, and authors, with up to 25 records per page.
- Create, edit, and delete authors, books, and reading records.
- Optional creation of a first reading while adding a book, including its status, year, grade, priority, recommendation, and notes.
- Existing authors and themes can be selected when creating or editing a book; new themes can also be entered.
- Status-aware reading form and validation for required fields, dates, years, grades, references, and allowed status transitions.
- An author linked to a book cannot be deleted. Deleting a book asks for confirmation and also removes its readings.
- Seed data is loaded on first use. **Reset data** restores the original seed and discards browser-local changes.
- Warm library-inspired interface colors and responsive layout.
 
## Run the application
 
The application must be served over HTTP because it loads `data/seed.json` with `fetch`; opening `index.html` directly with a `file://` URL will not work.
 
1. Open the repository in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `front-end/index.html` and select **Open with Live Server**.
4. Use the address opened by Live Server, usually `http://127.0.0.1:5500/front-end/`.
 
No Java, Node.js, npm, or build step is required for Delivery 1 (Java version: not applicable until Delivery 2). The first launch loads `front-end/data/seed.json` into `localStorage`; subsequent launches use the saved browser data. Use **Reset data** to reload the seed.
 
## Project structure
 
```text
.
├── README.md
├── .gitignore
└── front-end/
    ├── index.html
    ├── css/
    │   └── tracker.css       # Application styles
    ├── data/
    │   └── seed.json         # Instructor-provided initial data
    └── js/
        ├── strings.js        # All interface text, fixed lists and messages
        ├── store.js          # All data access (seed loading, localStorage); errors use the API format
        ├── validation.js     # Form validation rules
        ├── render.js         # Tables, metrics, charts, search, and pagination
        └── main.js           # Forms, event handling, and application flow
```
 
All data access goes through `store.js`. Its functions are asynchronous and, when an operation fails, throw an error with the same structure the API will send in Delivery 2: `{ status, message, errors: [{ field, message }] }` (400 for invalid data, 404 for a missing record, 409 for an author linked to books or a duplicate theme). In Delivery 2 only `store.js` is rewritten to call the API.
 
## Requirement checklist
 
Status: **Implemented**, **Partially implemented** or **Not implemented**.
 
### Core requirements
 
| ID | Requirement | Delivery 1 | Notes |
|---|---|---|---|
| FR-01 | Manage authors | Implemented | Create, edit, delete. An author linked to a book cannot be deleted; the message names the books. |
| FR-02 | Manage books | Implemented | Authors and themes selected from existing records; new themes can be created in the book form. |
| FR-03 | Manage readings | Implemented | Readings added from the book list or the log; optional first reading in the book form; deleting a book asks for confirmation and removes its readings. |
| FR-04 | Status workflow | Implemented | Year read required for Read; priority cleared when leaving Want to read; clearing year read and grade asks for confirmation. |
| FR-05 | Reading log | Implemented | Sortable by every column (default: year read, newest first, then ID); missing values shown as `-` and sorted after filled values. |
| FR-06 | Validation | Implemented | Section 4 rules; messages appear next to each field; invalid data is never saved. |
| FR-07 | Seed data | Implemented | `seed.json` loaded on first use; **Reset data** asks for confirmation and restores it; new IDs continue after the highest seed ID. |
 
### Optional exercises (not graded)
 
| ID | Requirement | Status | Notes |
|---|---|---|---|
| FR-08 | Filters and search | Partially implemented | Search (partial, case-insensitive) in readings, books and authors; no filters by status, year, author, form or theme. |
| FR-09 | Wishlist | Not implemented | |
| FR-10 | Books by century | Not implemented | |
| FR-11 | Authors by nationality | Not implemented | |
| FR-12 | Statistics | Partially implemented | Overall totals and average grade only; per-year, nationality, form and top-10 statistics not implemented. |
| FR-13 | Charts | Partially implemented | Reading status distribution and grade ranges (SVG, no library); FR-12 statistics not charted. |
| FR-14 | Autofill from Open Library | Not implemented | |
| FR-15 | Import and export | Not implemented | |
| FR-16 | Users and login | Not implemented | Delivery 2 only. |
| FR-17 | External database with Docker | Not implemented | Delivery 2 only. |
| FR-18 | DTOs and global error handling | Not implemented | Delivery 2 only. |
 
## Delivery 2
 
The Spring Boot API, server-side persistence, and integration with this front-end are not part of the current delivery. Update this section when those features are implemented, including Java version, run instructions, and API endpoint examples.
 
## Libraries
 
Vanilla HTML, CSS and JavaScript only, with no external libraries. The only external resource is Google Fonts (DM Sans and Playfair Display), loaded in `tracker.css`. No library needed instructor approval.
 
## Team members
 

| Name | Student ID | GitHub |
|---|---|---|
| Thyago Pereira de Carvalho | 2024.1.08.039 | [Thyago-bat](https://github.com/Thyago-bat) |
| Wagner Donizete Gonçalves | 2019.1.08.047 | [Wagner2196](https://github.com/Wagner2196) |
| Gustavo Andrade Moreira de Assis | 2024.1.08.012 | [GustavoM-Andrade](https://github.com/GustavoM-Andrade) |
| Gabriel Ramirez Cardoso Rodrigues | 2024.1.08.033 | [Gabrielrzdev](https://github.com/Gabrielrzdev) |
| Bartholomeu Vitor Neto | 2024.1.08.043 | [BartholomeuVitor](https://github.com/BartholomeuVitor) |
| Carlos Augusto Regis Lorim | 2024.1.08.004 |[carlos-lorim] https://github.com/carlos-lorim |

## AI usage
 
Record AI assistance used by each team member in accordance with the assignment instructions.
 
| Tool | Used for | Parts affected |
|---|---|---|
| OpenAI Codex | Assisted with the front-end implementation and README updates. | `front-end/`, `README.md` |
| Claude | Drafted the README; reviewed the front-end against the assignment statement; rewrote `store.js` to throw errors in the API format (400/404/409) and moved the linked-author check and the book cascade delete into it; reformatted the JavaScript; fixed editing an author without changing the name; fixed sorting of books without authors; moved interface text into `strings.js`. | `README.md`, `front-end/js/store.js`, `main.js`, `render.js`, `strings.js`, `validation.js` (formatting only) |
 
## Video
 
Delivery 2 video: _to be added_.
 
## Team workflow
 
- Each team member should commit their own work with a message describing the change.
- Pull the latest changes before starting work and before pushing.
- Tag the commit submitted for each delivery before the deadline. For Delivery 1:
 
  ```bash
  git tag delivery-1
  git push origin delivery-1
  ```
 
