const express = require('express');
const router = express.Router();

const Note = require('./../models/Note');

router.post('/list', async (req, res) => {  
    try {
        var notes = await Note.find({ userid: req.body.userid });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
});

router.post('/add', async (req, res) => {
    
    try {
    
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
    
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
});

router.post('/delete', async (req, res) => {
    try {
        const idToDelete = req.body.id;

        if (!idToDelete) {
            return res.status(400).json({ success: false, error: 'Incomplete' });
        }

        const result = await Note.deleteOne({ id: idToDelete });
    
        if (result) {
        const response = { success: true, message: 'Note deleted successfully!' + ` id: ${idToDelete}` };
        res.json(response);
        } else {
        res.status(404).json({ success: false, error: 'Note not found' });
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
});

module.exports = router;
