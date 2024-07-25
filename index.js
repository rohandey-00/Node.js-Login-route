const express = require("express");
const app = express();
const path = require("path");   //for ejs [1]
const methodOverride = require('method-override');
const mongoose= require("mongoose");
const User = require("./models/user.js");
const Post = require("./models/post.js");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const auth = require("./middleware/auth.js");


app.set("view engin", "ejs");  //for ejs [2]
app.set("views", path.join(__dirname, "/views")); //for ejs runs outside the directory [3]
app.use(express.static(path.join(__dirname, "public"))); // to send css, js (static file by default public folder) with ejs from any directory.. [4]
app.use(express.urlencoded({ extended: true}));  //for POST requiest [1]
app.use(express.json());                         // for POST, json data [2]
app.use(methodOverride('_method'));
app.use(cookieParser());




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



//============================================================================================================
//============================================================================================================



//Home route
app.get("/login",(req, res)=>{
   res.render("login.ejs");
});



// User -- Login
app.post("/user", async(req, res)=>{

try{
    //get all data from frontend(user)
    let {email, password} = req.body;

    //check user or email
    if(!(email && password)){
        res.status(400).send("Please enter all the fields!");
    }

    // find user in database
    const user = await User.findOne({email: email});
    
    //if user is not there
    // if (!user){
    //     res.send("Enter valid email or password"); 
    // }

    //match the password
    if(user){
            if(password === user.password && email === user.email){   
                
                let id = user._id; 
               
                //generate a token
                const token = jwt.sign(
                    {id: user._id},
                    'shhhhh',
                    {
                        expiresIn: "4h"
                    }
                );       
                
                user.token = token;
                user.password = undefined;  //dont send password
                // send token in user cookies
                 //cookie section
                    const options = {
                        expires: new Date(Date.now() + 5* 24* 60* 60* 1000),
                    };

                    res.status(200).cookie("token", token, options).redirect(`/posts/${id}`);


                
                  
            }
    }
  res.send("Enter valid email or password");    
}catch(err){
    console.log(err);
}
});





// show app posts through user id
app.get("/posts/:id", auth, async(req, res)=>{
    let id = req.params.id;     // because it gave an object id
    // console.log(id.id);
    let posts = await Post.find({userId: id});    // find post through userId not postId(default)
    res.render("./posts/allPost.ejs", {posts, id}); 

});




//New User -- Signup
app.get("/user/new", (req, res)=>{
    res.render("newUser.ejs");
});

app.post("/user/new", async(req,res)=>{

try{
    let{username,email, password, otp} = req.body;

    // if all info are not present
    if (!(username && email && password && otp)){
        res.status(400).send("Please enter all the fields!");
    }

    //if user already exist -email
    let existUser = await User.findOne({ email });
    if(existUser){
        res.status(400).send("User already exist");
    }

    // encript the passWord {optional}

    //save the user into database    
    const u1 = new User({email: email, username: username, password: password});
    await u1.save();


    //generate a token for the user {not storing in database}
    const token = jwt.sign(
        {id: u1._id, email: u1.email},
        'shhhhh',
        {
            expiresIn: "4h"
        }
    );

    //send into the frontend
    u1.token = token;
    u1.password = undefined; 
    res.status(201).json(u1);

    // res.send("Thank You For joining Us!");
}catch(err){
    console.log(err);
    }  
});



app.get("/user/forget", (req,res)=>{
try{
    res.render("forget.ejs"); 
}catch(err){
    res.send("Invalid OTP");
} 
});



// check email is valid or not
app.post("./user/forget",async(req,res)=>{
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
    User.findOneAndUpdate({email: email}, { password: password})
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
      
    res.send("password change successfully");
});






// generate form for a new comment 
app.get("/comment/:id/new",auth, (req,res)=>{
    let { id } = req.params;
    res.render("./posts/comment.ejs", {id});
});

//accept comment text
app.post("/comment",auth, async(req,res)=> {

    let{ id, text} = req.body;                 // here id is post's _id

        async function inserting(id, text) {
            await Post.updateOne({ _id: id }, { $push: { comments: text } });
            console.log('Inserted Successfully.')
        }
  
        inserting(`${id}`, text);

    let post = await Post.findById(id);   //use to find user id
    let userId = post.userId;   
    res.redirect(`/posts/${userId}`);
});





// CREATE  new posts

app.get("/post/:id/new",auth, async(req,res)=>{
    let {id}=req.params;
    let user   = await User.findById(id);    // find post through userId not postId(default)
    // console.log(user);

    res.render("./posts/new.ejs", { user});

});

//get new post
app.post("/post/new",auth, async(req, res)=>{
    let { username, content, userId} = req.body;
    
    const post1 = new Post({
        username: username,
        content: content,
        userId: userId,
    });

    await post1.save();

    res.redirect(`/posts/${userId}`);
});




// ======= UPDATE new posts ============

//get edit form
app.get("/post/:id/edit", auth,async(req,res)=>{
    let {id} = req.params;
    let post = await Post.findById(id);
  
    res.render("./posts/edit.ejs", {post});
});


//update path(patch request)
app.patch("/post/:id", auth,async(req, res)=>{
    let {id} = req.params;  //post id
    let {content} = req.body;
    
    let post = await Post.findById(id);
    let userId = post.userId;
    
    await Post.findByIdAndUpdate( id, {content: content});

    res.redirect(`/posts/${userId}`);
});





// ======= DELETE new posts ============

app.delete("/post/:id", auth, async(req, res)=>{
    let {id} = req.params;
    let post = await Post.findById(id);
    let userId = post.userId;   
    
    await Post.findByIdAndDelete(id);
    res.redirect(`/posts/${userId}`);
});







app.listen("8080",()=>{
    console.log("app listining on port 8080");
});
