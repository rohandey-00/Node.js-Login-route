const mongoose =  require("mongoose");


// const commentSchema = new mongoose.Schema({
//     username: {
//       type: String,
//       default: 'Guest'
//     },
//     text: {
//       type: String,
//       required: true
//     },
//   });


const postSchema = new mongoose.Schema({
    username: {
        type: String,
        default: "Guest",
    },
    content: {
        type: String,
        required: true,
    },
    like: {
        type: Number,
        default: 0,
    },
    comments: {
        type: [String],
        default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;