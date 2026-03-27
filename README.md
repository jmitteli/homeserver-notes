# homeserver-notes

A self-hosted personal notes web application. Allows creating structured notes with nested subjects, rich content blocks (text, headers, code, images), and Markdown support. Runs on a home server and is accessible over LAN/VLAN only.

## Features

- Nested subject tree (unlimited depth)
- Notes with mixed content blocks: text, headers, code, images
- Markdown support
- Image uploads with magic byte validation
- File-based SQLite database — no separate database server needed
- REST API backend

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** SQLite via `better-sqlite3`
- **File uploads:** Multer + `file-type`
- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks)

## Project Structure

```
homeserver-notes/
├── backend/
│   ├── server.js           # Express app entry point
│   ├── db.js               # SQLite database setup and table creation
│   └── routes/
│       ├── subjects.js     # Subject tree API endpoints
│       ├── notes.js        # Note CRUD API endpoints
│       └── uploads.js      # Image upload endpoint
├── frontend/               # Plain HTML/CSS/JS frontend (in development)
├── uploads/                # Uploaded images stored here (not committed to git)
├── .gitignore
└── package.json
```

## Database Schema

```sql
subjects ( id, name, parent_id, created_at )
notes    ( id, subject_id, title, created_at, updated_at )
blocks   ( id, note_id, type, content, position )
-- block types: 'text' | 'header' | 'code' | 'image'
```

Subjects are self-referencing via `parent_id` — a `NULL` parent means top-level. Notes belong to a subject and contain an ordered list of blocks stored as rows.

## API Endpoints

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects as a flat list |
| POST | `/api/subjects` | Create a subject `{ name, parent_id? }` |
| DELETE | `/api/subjects/:id` | Delete subject and all its children/notes |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes/subject/:subjectId` | Get all notes in a subject |
| GET | `/api/notes/:id` | Get a single note with its blocks |
| POST | `/api/notes` | Create a note `{ subject_id, title }` |
| PUT | `/api/notes/:id` | Save note blocks `{ title, blocks[] }` |
| DELETE | `/api/notes/:id` | Delete a note |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads` | Upload an image, returns `{ filename }` |

Uploaded images are served as static files at `/uploads/<filename>`.

## Setup

### Prerequisites

- Node.js
- npm

### Install

```bash
git clone git@github.com:jmitteli/homeserver-notes.git
cd homeserver-notes
npm install
```

### Run

```bash
cd backend
node server.js
```

Server starts on `http://localhost:3000`.

### Health check

```bash
curl http://localhost:3000/api/health
```

## Notes

- The database file (`notes.db`) is created automatically on first run inside the `backend/` folder
- The `uploads/` folder must exist before starting the server — create it with `mkdir uploads` in the project root
- SQLite WAL mode is enabled for better read performance
- Database uses `ON DELETE CASCADE` — deleting a subject deletes all its children and notes automatically
- Image uploads are validated against actual file magic bytes, not just the file extension

## Network

Accessible over LAN/VLAN only. Not exposed to the public internet.
