const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    FirstName : {
        type: String,
        required: true
    },
    LastName : {
        type: String 
    },
    emailId : {
        type: String,
        required: true
    },
    password : {
        type: String
    },
    age : {
        type: Number
    },
    Gender : {
        type: String
    }
})

const User = mongoose.model("User" , userSchema);

module.exports = User;