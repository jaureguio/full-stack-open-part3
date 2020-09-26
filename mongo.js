const mongoose = require("mongoose");

if(process.argv.length < 3) {
  console.error('Please provide a password')
  process.exit(1)
}

const password = process.argv[2]

const URI =
  `mongodb+srv://phonebook-dba:${password}@phonebook-cluster.joiwh.mongodb.net/phonebook?retryWrites=true&w=majority`;

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

const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 3) {
  Person.find({}).then(people => {
    const peopleList = people.map(({ name, number }) => `${name} ${number}`).join('\n')

    console.log(`phonebook:\n${peopleList}`)
    
    mongoose.connection.close()
  })
} else {

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person
    .save()
    .then(({ name, number }) => {
      console.log(`added ${name} number ${number} to phonebook`);

      mongoose.connection.close();
    });
}