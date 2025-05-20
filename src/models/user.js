const mongoose = require("mongoose");
const validator = require("validator");

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
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("invalid email address")
            }
        }
    },
    password: {
        type: String,
        required: true,
        // minlength: 6,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("password is weak " + value + " try a strong password")
            }
        }
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
        default: "https://www.iconfinder.com/icons/2662226/account_blank_dummy_face_human_mannequin_profile_icon",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL: " + value)
            }
        }
    },
    about: {
        type: String,
        default: "this a default about of the user",
        maxlength: 500
    },
    skills: {
        type: [String]
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

module.exports = User;