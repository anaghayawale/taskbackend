const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Note = require('./../models/Note');
const User = require('./../models/user');
const auth = require('./../middleware/auth');

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

        const token = jwt.sign({id: user._id}, "passwordKey");
        res.json({token, ...user._doc});



    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
});

router.post("/tokenIsValid", async (req, res) => {
    try{

        const token = req.header("x-auth-token");
        if(!token){
            return res.json(false);
        }
        const verified = jwt.verify(token, "passwordKey");
        if(!verified){
            return res.json(false);
        }
        const user = await User.findById(verified.id);
        if(!user){
            return res.json(false);
        }
        return res.json(true);

    }catch(e){
        res.status(500).json({success:"false", error: e.message});
    }
})

//get user data
router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({...user._doc, token: req.token});
});

//list
router.post('/list', async (req, res) => {  
    try {
        var notes = await Note.find({ userid: req.body.userid });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
});

//add
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

//delete
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
