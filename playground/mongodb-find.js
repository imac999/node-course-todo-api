//const MongoClient=require('mongodb').MongoClient;
const {MongoClient, ObjectID}=require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if(err){
    return console.log('Unable to connect to mongodb server');
  }
  console.log('connected');

  var db=database.db('TodoApp');

  // db.collection('Todos').find(
  //   {
  //       _id: new ObjectID('5a5a23eed23b653b14354721')
  //   }
  // ).toArray().then((docs) => {
  //
  //     console.log('Todos');
  //     console.log(JSON.stringify(docs, undefined, 2));
  //
  // }, (err) => {
  //   console.log('Unable to fetch', err);
  // });

  db.collection('User').find({ name: 'Iain'}).count().then((count) => {
      console.log(`User: ${count}`);
  }, (err) => {
    console.log('Unable to fetch', err);
  });

  //database.close();

});
