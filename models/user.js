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
        
    }
});
const User = mongoose.model("User", userSchema);

module.exports = User;