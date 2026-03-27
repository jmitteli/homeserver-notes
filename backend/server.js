const express = require('express');
const cors = require('cors');
const path = require('path');

const subjectsRouter = require('./routes/subjects');
const notesRouter = require('./routes/notes');
const uploadsRouter = require('./routes/uploads');

const app = express();
const PORT = 3000;//Server will be listening to this port

//Allow requests from the frontend (different port during development)
app.use(cors());

//Parse incoming JSON request bodies
app.use(express.json());

//Serve uploaded images as static files at /uploads/filename
app.use('/uploads', express.static(path.join(__dirname,'../uploads')));

//API routes
app.use('/api/subjects', subjectsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/uploads', uploadsRouter);

//Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok'})
});

app.listen(PORT, () => {
    console.log(`Notes server running on http://localhost:${PORT}`);
});
