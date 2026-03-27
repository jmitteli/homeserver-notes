const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileTypeFromFile } = require('file-type');

//Configure where and how uploaded files are stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        //Prefix with timestamp to avoid filename collisions
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }//10Mb max file size
});

// POST /api/uploads
router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided!' });
    }

    const filePath = req.file.path;

    //Check the actual file magic bytes, makes sure it's a image
    const type = await fileTypeFromFile(filePath);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!type || !allowedTypes.includes(type.mime)) {
        //Delete file if it's not a real image
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Only image files allowed!' })
    }

    res.json({ filename: req.file.filename });

});

module.exports = router;