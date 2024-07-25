
/**   INIT new users **/

let user1 = new User({
    email: "admin@gmail.com",
    username: "admin",
    password: "admin@123",
});

user1.save().then((res)=>{
    console.log(res)
});

/**   INIT new posts **/

const initPost = (userId, content)=>{
    User.findById(userId)
        .then((user)=>{
            if(!user) throw new Error("User not found!");

            const newPost = new Post({
                username: user.username,   //form user collection
                content: content,
                userId: user._id         //reference to the User 
            });

        return newPost.save();  //return a promise
        })
        
        .then(post => console.log(post))
        .catch(err => console.log(err));
}

initPost('669001bd2a44488486cf47de', "Laughter is sunshine for the soul! Share a laugh with someone today and spread the joy. 😄💫 #SpreadSmiles" );



