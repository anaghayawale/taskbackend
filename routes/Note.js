const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Note = require('./../models/Note');
const User = require('./../models/user');

//sign up
router.post("/signup", async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success:"false",message: "User already exists"});
        } 
        const hashedPassword = await bcryptjs.hash(password, 8);
        let user = new User({ 
            name,
            email, 
            password: hashedPassword
        });
        user = await user.save();
        res.json(user);

    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
});

//sign in 
router.post("/signin", async (req, res) => {
    try{

        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:"false",message: "User does not exist"});
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success:"false",message: "Incorrect password"});
        }

        const token = jwt.sign({id: user._id}, "passwordKey", { expiresIn: '365d' });
        res.json({token, ...user._doc});

    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
});

//list
router.get('/list', async (req, res) => {  
    try {

        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, "passwordKey");
        const userId = decodedToken.id;

        var notes = await Note.find({ userid: userId });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
    
});

//add
router.post('/add', async (req, res) => {
    
    try {

    const token = req.headers.authorization;
    const splitToken = token.split(" ")[1];
    console.log("token",token)
    const decodedToken = jwt.verify(splitToken, "passwordKey");
    console.log("decoded",decodedToken)

    const userId = decodedToken.id;
    
    const deleted = await Note.deleteOne({ id: req.body.id, userid: userId });
    console.log("deleted",deleted)  
    const newNote = new Note({
            id: req.body.id,
            userid: userId, // Use the obtained user ID
            title: req.body.title,
            content: req.body.content,
            dateadded: Date.now()
    });
    

    await newNote.save();
    console.log("newNote",newNote)
    const response = {success: true, message: "Note added successfully! " + ` id: ${req.body.id}`};
    res.json(response);
    
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ success: false, error: error.message });
    }
    
});

//delete
router.delete('/delete', async (req, res) => {
    try {

        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, "passwordKey");
        const userId = decodedToken.id;

        const idToDelete = req.body.id;

        if (!idToDelete) {
            return res.status(400).json({ success: false, error: 'Incomplete' });
        }

        const result = await Note.deleteOne({ id: idToDelete, userid: userId });
    
        if (result) {
        const response = { success: true, message: 'Note deleted successfully!' + ` id: ${idToDelete}` };
        res.json(response);
        } else {
        res.status(404).json({ success: false, error: 'Note not found' });
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, error: error.message });
    }
    
});

module.exports = router;
