const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const user1ID=new ObjectID();
const user2ID=new ObjectID();

const users = [{
    _id: user1ID,
    email: 'iain_macaulay@hotmail.com',
    password: 'pwd1abc',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: user1ID, access: 'auth'}, 'abc123').toString()
    }]
  },{
    _id: user2ID,
    email: 'jonny_norman@hotmail.com',
    password: 'pwd2abc'
  }];

const testTodos=[{
  _id: new ObjectID(),
  text: 'first text todo',
  completed: true,
},{
  _id: new ObjectID(),
  text: 'second text todo',
  completed: true,
  completedAt: '123'
}]

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(testTodos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var user1=new User(users[0]).save();
    var user2=new User(users[1]).save();
    return Promise.all([user1, user2]);
  }).then(() => done());
};

module.exports={testTodos, populateTodos, users, populateUsers};
