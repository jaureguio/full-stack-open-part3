const mongoose = require("mongoose")
const URI = process.env.URI

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (_, returnedDoc) => {
    returnedDoc.id = returnedDoc._id.toString()
    delete returnedDoc._id
    delete returnedDoc._v
  }
})
 
module.exports = mongoose.model("Person", personSchema)
