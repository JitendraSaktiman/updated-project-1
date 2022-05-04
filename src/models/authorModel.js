const mongoose = require("mongoose");


const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: 'first name is required'

    },
    lname: {
        type: String,
        required: 'last name is required'
    },
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: 'title is required'

    },
    email: {
        type: String,
        required:  'email is required',
        unique: true,
        
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);//authors

