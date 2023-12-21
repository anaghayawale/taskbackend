const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        unique: true,
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
        Selection: false
    }

},
{timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;