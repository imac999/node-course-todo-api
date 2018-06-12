const {ObjectId} = require('mongodb');
const {User} = require('./../server/models/user');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = '5b2003be96d3b62324382899n';

// Todo.find({
//     _id: id
// }).then((todos) => {
//   console.log('Todos: ',todos);
// })
//
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//   console.log('Todo: ',todo);
// })

if (!ObjectId.isValid(id)){
  console.log('id not valid');
}else{

Todo.findById({
    _id: id
}).then((todo) => {
  if(!todo){
    return console.log('id not found');
  }
  console.log('Todo: ',todo);
}).catch((e) => console.log(e));
}


var uid='5b2011adc0ad36bc57f523e7';
User.findById({
    _id: uid
}).then((user) => {
  if(!user){
    return console.log('uid not found');
  }
  console.log('User: ',user);
}).catch((e) => console.log(e));
