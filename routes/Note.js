const express = require('express');
const router = express.Router();

const Note = require('./../models/Note');

router.post('/list/:userid', async (req, res) => {  
    try {
        var notes = await Note.find({ userid: req.body.userid });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
});

router.post('/add', async (req, res) => {
    
    await Note.deleteOne({id: req.body.id});

    const newNote = new Note({
        id: req.body.id,
        userid: req.body.userid,
        title: req.body.title,
        content: req.body.content,
        dateadded: Date.now()
    });
    await newNote.save();
    const response = {success: true, message: "Note added successfully! " + ` id: ${req.body.id}`};
    res.json(response);
    
});

router.post('/delete', async (req, res) => {
    await Note.deleteOne(req.body.id);
    const response = {success: true, message: "Note deleted successfully! " + ` id: ${req.body.id}`};
    res.json(response);
    
});

module.exports = router;