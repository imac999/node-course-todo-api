require('./config/config');

const _ = require('lodash');
const {ObjectId} = require('mongodb');

const express=require('express');
const bodyParser=require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app=express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
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

app.delete('/todos/:id', (req, res) => {
if(req.params.id){
  if(ObjectId.isValid(req.params.id)){
    Todo.findByIdAndRemove(req.params.id).then((todo)=>{
      if(todo){
        res.send({todo});
      }else{
        res.status(404).send('No Todo with that Id');
      }
    }, (e) => {
      res.status(400).send();
    });
  }else{
    res.status(404).send('Thats not a valid Id');
  }
}
});

app.patch('/todos/:id', (req, res) => {
  var id= req.params.id;
  if(id){
    if(ObjectId.isValid(id)){
      var body = _.pick(req.body, ['text', 'completed']);
      if (_.isBoolean(body.completed) && body.completed===true){
        body.completedAt = new Date().getTime();
      }else{
        body.completed = false;
        body.completedAt = null;
      }
      Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(todo){
          return res.send({todo});
        }else{
          return res.status(404).send('No Todo with that Id');
        }
      }).catch((e) => {
          return res.setStatus(400).send({e})
      });
    }else{
        return res.status(404).send('The id is invalid');
    }
  }else{
    return res.status(404).send('There is no Id');
  }
});

app.listen(port, () => {
  console.log(`started on port: ${port}`);
});

module.exports = {app};
