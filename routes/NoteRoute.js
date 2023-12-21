const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Note = require('../models/NoteModel');
const User = require('../models/UserModel');


//sign up
router.post("/signup", async (req, res) => {
    try{
        const {name, email, password} = req.body;
        if(!email || !name || !password){
            return res.status(400).json({success:"false", error: "Incomplete Data"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success:"false", error: "User already exists"});
        } 
        const hashedPassword = await bcryptjs.hash(password, 8);
        let user = new User({ 
            name,
            email, 
            password: hashedPassword
        });

        user = await user.save();
        if(!user){
            return res.status(400).json({success:"false", error: "Error creating user"});
        }
        res.json(user);

    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
});

//sign in 
router.post("/signin", async (req, res) => {
    try{

        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({success:"false", error: "Incomplete Data"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:"false",error: "User does not exist"});
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success:"false",error: "Incorrect password"});
        }

        const token = jwt.sign({id: user._id}, process.env.SECRET_KEY, { expiresIn: '365d' });
        res.json({success:"true", data: {
            token,
            user
        }});

    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
});

//list
router.get('/list', async (req, res) => {  
    try {
        const token = req.headers.authorization;
        const splitToken = token.split(" ")[1];
        const decodedToken = jwt.verify(splitToken, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        if(!userId){
            return res.status(400).json({success:"false", error: "Incomplete Data"});
        }
        
        const notes = await Note.find({ userId });
        if(!notes){
            return res.status(400).json({success:"false", error: "No notes found"});
        }
        res.json({success: true, data: {notes}});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    
});

//add
router.post('/add', async (req, res) => {
    
    try {

    const token = req.headers.authorization;
    const splitToken = token.split(" ")[1];
    const decodedToken = jwt.verify(splitToken, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    if(!userId){
        return res.status(400).json({success:"false", error: "Incomplete Data"});
    }
     
    const newNote = new Note({
            userId: userId,
            title: req.body.title,
            content: req.body.content,
    });
    const addedNote = await newNote.save();
    if(!addedNote){
        return res.status(400).json({success:"false", error: "Error adding note"});
    }
    res.json({success: true, message: "Note added successfully! "});
    
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    
});

//update
router.put('/update', async (req, res) => {
    try {

        const token = req.headers.authorization;
        const splitToken = token.split(" ")[1];
        const decodedToken = jwt.verify(splitToken, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        if(!userId){
            return res.status(400).json({success:"false", error: "Incomplete Data"});
        }

        const idToUpdate = req.body.id;
        const title = req.body.title;
        const content = req.body.content;
        console.log( decodedToken);
        if (!idToUpdate || !title || !content) {
            return res.status(400).json({ success: false, error: 'Incomplete Data' });
        }

        const result = await Note.findOneAndUpdate({ _id: idToUpdate, userId: userId }, { title: title, content: content },{new: true});
    
        if (result) {
        res.json({ success: true, message: 'Note updated successfully!' });
        } else {
        res.status(404).json({ success: false, error: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    
});

//delete
router.delete('/delete', async (req, res) => {
    try {

        const token = req.headers.authorization;
        const splitToken = token.split(" ")[1];
        const decodedToken = jwt.verify(splitToken, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        if(!userId){
            return res.status(400).json({success:"false", error: "Incomplete Data"});
        }

        const idToDelete = req.body.id;

        if (!idToDelete) {
            return res.status(400).json({ success: false, error: 'Incomplete Data' });
        }

        const result = await Note.deleteOne({ _id: idToDelete, userId: userId });
    
        if (result) {
        res.json({ success: true, message: 'Note deleted successfully!' });
        } else {
        res.status(404).json({ success: false, error: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    
});

module.exports = router;
