//const MongoClient=require('mongodb').MongoClient;
const {MongoClient, ObjectID}=require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if(err){
    return console.log('Unable to connect to mongodb server');
  }
  console.log('connected');

  var db=database.db('TodoApp');

  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
  //     console.log(`Result: ${result}`);
  // }, (err) => {
  //   console.log('Unable to delete', err);
  // });
  //
  // db.collection('Todos').deleteOne({text: 'Eat Lunch'}).then((result) => {
  //     console.log(`Result: ${result}`);
  // }, (err) => {
  //   console.log('Unable to delete', err);
  // });

  db.collection('Todos').findOneAndDelete({text: 'Walk the dog'}).then((result) => {
      console.log(JSON.stringify(result));
  }, (err) => {
    console.log('Unable to delete', err);
  });

  //database.close();

});
