const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  identifier: { type: String, required: true, minlength: 3 },
  name: String,
  authSource: { type: String, required: true },
  routes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)