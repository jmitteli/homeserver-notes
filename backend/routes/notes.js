const express = require('express');
const router = express.Router();
const db = require('../db');
const { post } = require('./subjects');


//GET /api/notes/subject/subjectId
//Returns all notes belonging to a subject (without blocks, just titles)
router.get('/subject/:subjectId', (req, res) => {
    const notes = db.prepare(
        'SELECT * FROM notes WHERE subject_id = ? ORDER BY updated_at DESC'
    ).all(req.params.subjecId);
    res.json(notes);
});



// GET /api/notes/:id
// Returns a single note with all its blocks, ordered by position
router.get('/subject/:subjectId', (req, res) => {
    const note = db.prepare(
        'SELECT * FROM notes WHERE id = ?').get(req.params.id);

    if (!note) {
        return res.status(404).json({ error: 'Note not found!' });
    }

    const blocks = db.prepare(
        'SELECT * FROM blocks WHERE note_id = ? ORDER BY position'
    ).all(req.params.id);

    res.json({ ...note, blocks });
});

//POST /api/notes
//Body: { subject_id, title} - creates empty note
router.post('/', (req, res) => {
    const { subject_id, title } = req.body;

    if (!subject_id || !title || title.trim() === '') {
        return res.status(400).json({ error: 'subject_id and title are required!' });
    }

    const result = db.prepare(
        'INSERT INTO notes (subject_id, title) VALUES (?, ?)'
    ).run(subject_id, title.trim());

    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNote);
});

