const express = require("express");
const app = express();
const path = require("path");   //for ejs [1]
const methodOverride = require('method-override');
const mongoose= require("mongoose");
const User=require("./models/user.js");

let port = 8080;


app.set("view engin", "ejs");  //for ejs [2]
app.set("views", path.join(__dirname, "/views")); //for ejs runs outside the directory [3]
app.use(express.static(path.join(__dirname, "public"))); // to send css, js (static file by default public folder) with ejs from any directory.. [4]
app.use(express.urlencoded({ extended: true}));  //for POST requiest [1]
app.use(express.json());                         // for POST, json data [2]
app.use(methodOverride('_method'));



app.listen(port,()=>{
    console.log("app listining on port 8080");
});


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/user');
}
main()
.then((res)=>{
    console.log("connection successfully");
})
.catch((err)=>{
    console.log(err);
})


//inserting data
// let user1 = new User({
//     email: "admin@gmail.com",
//     username: "admin",
//     password: "admin@123",
// });

// user1.save().then((res)=>{
//     console.log(res)
// });


//Home route
app.get("/login",(req, res)=>{
   res.render("login.ejs");
});


app.post("/user", async(req,res)=>{
let {email, password} = req.body;
try{
    let data = await User.findOne({email: email});
    
        if(data){
            if(password === data.password && email ===data.email){            
               res.send("Welcome to the admin page");
            }
        }
        res.send("Enter valid email or password"); 
}catch(err){
    console.log(err);
}

});




//New user
app.get("/user/new", (req, res)=>{
    res.render("newUser.ejs");
});

app.post("/user/new",(req,res)=>{
    let{username,email, password, otp} = req.body;

    console.log(email, username, password, otp);
    
    const u1 = new User({email: email, username:username, password: password});
    u1.save();

    res.send("Thank You For joining Us!");

});


app.get("/user/forget", (req,res)=>{
    // let newOtp = Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111; // Generate OTP
try{
    res.render("forget.ejs"); 
}catch(err){
    res.send("Invalid OTP");
} 
});



// check email is valid or not
app.post("/user/forget",async(req,res)=>{
    let{email} = req.body;
    try{
        let data = await User.findOne({email: email});
        
            if(data){
                if(email ===data.email){            
                    res.render("newPass.ejs",{ email });
                }
            }
            res.send("Enter valid email or password"); 
    }catch(err){
        console.log(err);
    }

});


// finally new password update to data base

app.post("/user/password",(req,res)=>{
    let {email, password } = req.body;
    
    //update in dataBase
    User.findOneAndUpdate({email: email}, { password: password}).then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
      

    res.send("password change successfully");
});

