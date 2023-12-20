const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Note = require('./models/NoteModel');
const bodyParser = require('body-parser');
require('dotenv').config()



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


const mongodbPath = process.env.MONGO_URI 

mongoose.connect(mongodbPath).then(function (){
    console.log("database connected")
    const noteRouter = require('./routes/NoteRoute');
    app.use('/api', noteRouter)
});

app.get('/', function (req, res){
    res.send('Server is running');
}); 

const PORT = process.env.PORT || 8000;
app.listen(PORT, function (){
    console.log('Server is running on port: ' + PORT);
});