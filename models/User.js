const mongoose = require('mongoose')
const SALT_WORK_FACTOR = 10

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  email : {type:String, required: true}
})



module.exports = mongoose.model('User', UserSchema)

// Reference on user authentication with Mongoose
// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1

// **Important Note**
// Mongoose middleware is not invoked on update() operations,
// so you must use a save() if you want to update user passwords.
