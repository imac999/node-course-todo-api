const {ObjectId} = require('mongodb');

var express=require('express');
var bodyParser=require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app=express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body);
  var todo=new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos)=>{
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {

if(req.params.id){
  if(ObjectId.isValid(req.params.id)){
    Todo.findById(req.params.id).then((todo)=>{
      if(todo){
        res.send({todo});
      }else{
        res.status(404).send('No Todo with that Id');
      }
    }, (e) => {
      res.status(404).send();
    });
  }else{
    res.status(404).send('Thats not a valid Id');
  }
}
});

app.listen(3000, () => {
  console.log('started on 3000');
});

module.exports = {app};
