const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    LastName: {
        type: String,
        maxlength: 50,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    Gender: {
        type: String,
        // validate(value){
        //     if(!["male", "female", "others"].includes(value)){
        //         throw new Error("Gender data is not valid")
        //     }
        // },
        enum: ["male", "female", "others"]
    },
    photoUrl: {
        type: String,
        default: "https://www.iconfinder.com/icons/2662226/account_blank_dummy_face_human_mannequin_profile_icon"
    },
    about: {
        type: String,
        default: "this a default about of the user",
        maxlength: 500
    },
    skill: {
        type: [String]
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

module.exports = User;