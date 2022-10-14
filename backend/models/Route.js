const mongoose = require('mongoose')

const routeSchema = new mongoose.Schema({
  start: String,
  end: String,
  authSource: { type: String, required: true },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    }
  ]
})

routeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Route', routeSchema)