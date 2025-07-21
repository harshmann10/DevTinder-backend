const validator = require("validator");

const validateSignUp = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Full name is required");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("EmailId is not valid");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("password is weak");
    }
};

const validateLogin = (req) => {
    const { emailId } = req.body;
    if (!validator.isEmail(emailId)) {
        throw new Error("EmailId is not valid");
    }
};

const validateEditprofile = (req) => {
    const allowedEditFields = [
        "firstName",
        "lastName",
        "emailId",
        "photoUrl",
        "about",
        "gender",
        "age",
        "skills",
        "socialLinks",
    ];

    const isAllowed = Object.keys(req.body).every((field) =>
        allowedEditFields.includes(field)
    );
    return isAllowed;
};

const validateEditPassword = (req) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new Error("currentPassword and newPassword are required");
    }
    if (!validator.isStrongPassword(newPassword)) {
        throw new Error("new Password is weak");
    }
};

const validateResetPassword = (req) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        throw new Error("New password is required.");
    }
    if (!validator.isStrongPassword(newPassword)) {
        throw new Error("New password is too weak.");
    }
};

module.exports = {
    validateSignUp,
    validateLogin,
    validateEditprofile,
    validateEditPassword,
    validateResetPassword,
};