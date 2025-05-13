const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    FirstName : {
        type: String
    },
    LastName : {
        type: String 
    },
    emailId : {
        type: String
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