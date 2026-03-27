const express = require('express');
const router = express.Router();
const db = require('../db');

//Get /api/subjects
// Return all subjects as flat list - frontend builds the tree from parent id
router.get('/', (req, res) => {
    const subjects = db.prepare('SELECT * FROM subjects ORDER BY name').all();
    res.json(subjects);
});

//POST /api/subjects
//Body: { name, parent_id} parent_id is optional - omit for top level

router.post('/',(req,res) => {
    const {name, parent_id} = req.body;

    if (!name || name.trim() == ''){
        return res.status(400).json({ error: 'Subject name is required!'});
    }    

    //Insert values to database
    const result = db.prepare(
        'INSERT INTO subjects (name, parent_id) VALUES (?, ?)'
    ).run(name.trim(), parent_id || null);

    //return the newly created subject
    const newSubject = db.prepare('SELECT * FROM subjects WHERE id=?').get(result.lastInsertRowid);
    res.status(201).json(newSubject);
});

//DELETE /api/subjects/:id
//Deletes subject and all its children/notes (cascade handles this in database)
router.delete('/:id',(req, res) => {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(req.params.id);

    if (!subject){
        return res.status(404).json({ error: 'Subject not found!'});
    }

    db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Subject deleted!'})

});

module.exports = router;
