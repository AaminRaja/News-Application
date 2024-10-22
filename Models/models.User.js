const { Schema, model } = require('mongoose');

let userSchema = new Schema({
    Username: {
        type: String,
        required: { value: true, message: "Username is mandatory" }
    },
    EmailAddress: {
        type: String,
        required: { value: true, message: "Emai address is mandatory" }
    },
    PhoneNumber: {
        type: Number,
        required: { value: true, message: "Phone number is mandatory" }
    },
    Password: {
        type: String,
        required: { value: true, message: "Password is mandatory" }
    },
    Preferences: {
        type: Array
    },
    Role: {
        type: String,
        // enum: ['Editor', 'Reader'],
        default: "Reader",
        required: { value: true, message: "User role is mandatory" }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedNews: {
        type: Array,
    }

})

module.exports = model('user', userSchema)