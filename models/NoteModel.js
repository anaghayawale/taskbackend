const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    userId:{
        type: String,
        required:true

    },
    title:{
        type: String,
        required:true
    },
    content:{
        type: String,
        required:true
        
    }  
},
{timestamps: true});

module.exports = mongoose.model("Note", noteSchema);
