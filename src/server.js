const express = require('express');
const app = express();

const mongoose = require('mongoose');
const Note = require('./models/Note');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const mongodbPath = 'mongodb+srv://anaghayawale:tonystark123@cluster0.7rm3blw.mongodb.net/notesdb';
mongoose.connect(mongodbPath).then(function (){
    app.get('/', (req, res) => {
        const response = {success: true, message: "Server is running!"};
        res.json(response);
    });
    
    const noteRouter = require('./routes/Note');
    app.use('/api', noteRouter)
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, function (){
    console.log('Server is running on port: ' + PORT);
});