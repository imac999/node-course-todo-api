//const MongoClient=require('mongodb').MongoClient;
const {MongoClient, ObjectID}=require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if(err){
    return console.log('Unable to connect to mongodb server');
  }
  console.log('connected');

  var db=database.db('TodoApp');

  db.collection('Todos').findOneAndUpdate(
    {_id: new ObjectID('5a5a23eed23b653b14354721')},
    {
      $set: {
        completed: true
      }
    },
    {
      returnOriginal: false
    }
  ).then((result) => {
      console.log(JSON.stringify(result, undefined, 2));
  }, (err) => {
    console.log('Unable to update', err);
  });

  //database.close();

});
