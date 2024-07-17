const express = require("express");
const app = express();
const path = require("path");   //for ejs [1]
const methodOverride = require('method-override');
const mongoose= require("mongoose");
const User = require("./models/user.js");
const Post = require("./models/post.js");

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


/**   INIT new users **/

// let user1 = new User({
//     email: "admin@gmail.com",
//     username: "admin",
//     password: "admin@123",
// });

// user1.save().then((res)=>{
//     console.log(res)
// });



/**   INIT new posts **/

// const initPost = (userId, content)=>{
//     User.findById(userId)
//         .then((user)=>{
//             if(!user) throw new Error("User not found!");

//             const newPost = new Post({
//                 username: user.username,   //form user collection
//                 content: content,
//                 userId: user._id         //reference to the User 
//             });

//         return newPost.save();  //return a promise
//         })
        
//         .then(post => console.log(post))
//         .catch(err => console.log(err));
// }

// initPost('669001bd2a44488486cf47de', "Laughter is sunshine for the soul! Share a laugh with someone today and spread the joy. 😄💫 #SpreadSmiles" );






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
                // main page after login

                let id = data._id; 
                // let posts = await Post.find({userId: id});    // find post through userId not postId(default)
                // res.render("./posts/allPost.ejs", {posts, id});    // show all the posts after login     *** MORE SECURE, anyone can't get access

                res.redirect(`/posts/${id}`);   // less secure anyone can get access through user id
                
                
            }
        }
        res.send("Enter valid email or password"); 
}catch(err){
    console.log(err);
}

});


// show app posts through user id
app.get("/posts/:id", async(req, res)=>{
    let id = req.params.id;     // because it gave an object id
    // console.log(id.id);
    let posts = await Post.find({userId: id});    // find post through userId not postId(default)
    res.render("./posts/allPost.ejs", {posts, id}); 

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
    User.findOneAndUpdate({email: email}, { password: password}).then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
      

    res.send("password change successfully");
});






// generate form for a new comment 
app.get("/comment/:id/new", (req,res)=>{
    let { id } = req.params;
    res.render("./posts/comment.ejs", {id});
});

//accept comment text
app.post("/comment", async(req,res)=> {

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

app.get("/post/:id/new", async(req,res)=>{
    let {id}=req.params;
    let user   = await User.findById(id);    // find post through userId not postId(default)
    // console.log(user);

    res.render("./posts/new.ejs", { user});

});

//get new post
app.post("/post/new", async(req, res)=>{
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
app.get("/post/:id/edit",async(req,res)=>{
    let {id} = req.params;
    let post = await Post.findById(id);
  
    res.render("./posts/edit.ejs", {post});
});


//update path(patch request)
app.patch("/post/:id", async(req, res)=>{
    let {id} = req.params;  //post id
    let {content} = req.body;
    
    let post = await Post.findById(id);
    let userId = post.userId;
    
    await Post.findByIdAndUpdate( id, {content: content});

    res.redirect(`/posts/${userId}`);
});





// ======= DELETE new posts ============

app.delete("/post/:id",async(req, res)=>{
    let {id} = req.params;
    let post = await Post.findById(id);
    let userId = post.userId;   
    
    await Post.findByIdAndDelete(id);
    res.redirect(`/posts/${userId}`);
});