const validator = require("validator");

const validateSignUp = (req) => {
    const { FirstName, LastName, emailId, password } = req.body;

    if (!FirstName || !LastName) {
        throw new Error("Name is not valid");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("EmailId is not valid");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("password is weak");
    }
}

module.exports = { validateSignUp };