const {ObjectId} = require('mongodb');
const {User} = require('./../server/models/user');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// Todo.findOneAndRemove(){
//
// }

Todo.findByIdAndRemove('5b27ab83e41deafbe402d504').then((todo) => {
  console.log(todo);
});
