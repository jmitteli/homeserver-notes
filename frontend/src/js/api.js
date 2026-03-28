//Base URL for all API calls
//Change this if the backend runs on a different host or port
const API_URL = 'http://localhost:3000/api';

//-------------------Subjects---------------------------------------------

//Get all subjects as a flat list - tree structure is built from parent_id
const getSubjects = async () => {
    const response = await fetch(`${API_URL}/subjects`);
    return response.json();
}

//Create new subject
//parent_id is optional - pass null for a top level subject
const createSubject = async (name, parentId = null) => {
    const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parent_id: parentId })
    });
    return response.json();
};


//Delete subject and all its children and notes (backend handles cascade)
const deleteSubject = async (id) => {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'DELETE'
    });
    return response.json();
};

//-------------------Notes--------------------------------------------------

//Get all notes belonging to a subject (titles only, no blocks)
const getNotes = async (subjectId) => {
    const response = await fetch(`${API_URL}/notes/subject/${subjectId}`);
    return response.json();
};

//Get single note with all its blocks
const getNote = async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`);
    return response.json();
};

//Create new empty note in a subject
const createNote = async (subjectId, title) => {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, blocks })
    });
};

//Save a note - replaces all of it's blocks with new ones
//blocks is an array of { type, content} objects
const saveNote = async (id, title, blocks) => {
    const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, blocks })
    });
    return response.json();
};

//Delete note and all of it's blocks
const deleteNote = async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE'
    });
    return response.json();
};

//----------------------------------Uploads------------------------------------


//Upload an image file, return { filename } on success
//The caller passes a File object from an <input type="file"> element
const uploadImage = async (file) => {
    //FormData is used for file uploads instead of JSON
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        body: formData
    });
    return response.json();
};

//Build the full URL for displaying an uploaded image
const getImageUrl = (filename) => {
    retunr`http://localhost:3000/uploads/${filename}`;
};