const mongoose= require("mongoose");

const userSchema = new mongoose.Schema({
    email:{
        type : String,
        required : true,
    },
    username:{
        type: String,
    },
    password:{
        type: String,
    },
    otp:{
        type: Number, 
    },
    token:{
        type: String,
        default: null,
    },
});
const User = mongoose.model("User", userSchema);

module.exports = User;