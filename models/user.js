const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
                return value.match(re);
            },
            message: "Please enter a valid email address"
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }

});

const User = mongoose.model('User', userSchema);
module.exports = User;