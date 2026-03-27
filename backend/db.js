const Database = require('better-sqlite3');
const path = require('path');

//Creates DB if it doesnt exist
const db = new Database(path.join(__dirname, 'notes.db'));

//Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        parent_id  INTEGER,                          -- NULL means top-level subject
        created_at TEXT    DEFAULT (datetime('now')),
        FOREIGN KEY (parent_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        title      TEXT    NOT NULL,
        created_at TEXT    DEFAULT (datetime('now')),
        updated_at TEXT    DEFAULT (datetime('now')),
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocks (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id  INTEGER NOT NULL,
        type     TEXT    NOT NULL,                   -- 'text' | 'header' | 'code' | 'image'
        content  TEXT    NOT NULL DEFAULT '',
        position INTEGER NOT NULL DEFAULT 0,         -- order of blocks within a note
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );
`);

module.exports = db;
