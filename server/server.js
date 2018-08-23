require('./config/config');

const _ = require('lodash');
const {ObjectId} = require('mongodb');

const express=require('express');
const bodyParser=require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var {authenticate} = require('./middleware/authenticate');

var app=express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo=new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos)=>{
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  if(req.params.id){
    if(ObjectId.isValid(req.params.id)){
      Todo.findOne({
        _id: req.params.id,
        _creator: req.user._id
      }).then((todo)=>{
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

app.delete('/todos/:id', authenticate, (req, res) => {
if(req.params.id){
  if(ObjectId.isValid(req.params.id)){
    Todo.findOneAndRemove({
      _id: req.params.id,
      _creator: req.user._id
    }).then((todo)=>{
      if(todo){
        res.send({todo});
      }else{
        res.status(404).send('No Todo with that Id');
      }
    }, (e) => {
      res.status(400).send(e);
    });
  }else{
    res.status(404).send('Thats not a valid Id');
  }
}
});

app.patch('/todos/:id', authenticate, (req, res) => {
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
      Todo.findOneAndUpdate({
          _id: id,
          _creator: req.user._id
        }
        , {$set: body}, {new: true}).then((todo) => {
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



app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user=new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res
      .header('x-auth', token)
      .send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res
        .header('x-auth', token)
        .send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });

});

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`started on port: ${port}`);
});

module.exports = {app};
