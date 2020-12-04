const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  id: { type: String, required: true, index: { unique: true } },
  username: { type: String, required: true },
  data: { type: String, required: true },
  filename: { type: String, required: true },
});

module.exports = mongoose.model("Files", FileSchema);

// Reference on user authentication with Mongoose
// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1

// **Important Note**
// Mongoose middleware is not invoked on update() operations,
// so you must use a save() if you want to update user passwords.
