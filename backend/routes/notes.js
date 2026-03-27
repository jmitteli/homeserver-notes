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

// PUT /api/notes/:id
//Body : { title, blocks: [{ type, content, position}] }
//Replaces all blocks for the note (simplest update strategy)
router.put('/:id', (req, res) => {
    const { title, blocks } = req.body;
    const noteId = req.params.id;

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    if (!note) {
        return res.status(404).json({ error: 'Note not found!' });
    }

    //Use a transaction so all updates succeed or none do
    const saveNote = db.transaction(() => {
        //Update the note title and updated_at timestamp
        db.prepare(
            "UPDATE notes SET title = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(title, noteId);

        //Delete old blocks and re-insert - simple and reliable
        db.prepare('DELETE FROM blocks WHERE note_id = ?').run(noteId);

        //Insert each block with its position
        const insertBlock = db.prepare(
            'INSERT INTO blocks (note_id, type, content, position) VALUES (?, ?, ?, ?)'
        );
        blocks.forEach((block, insex) => {
            insertBlock.run(noteId, block.type, block.content, index);
        });

    });

    saveNote();//runs whole transaction at once
    res.json({ message: 'Note saved!' });

});

//DELETE /api/notes/:id
router.delete('/:id',(req, res) => {
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').run(req.params.id);
    if (!note){
        return res.status(404).json({ error: 'Note not found!'});
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Note deleted!'});
});

module.exports = router;