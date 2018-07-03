const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};



var token = jwt.sign(data, '123abc');
console.log(`token: ${token}`);

var decoded=jwt.verify(token, '123abc');

console.log(decoded);
// var message = ' I am user no 3 ';
// var hash=  SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
// var data ={
//   id: 4
// };
//
// var token ={
//   data,
//   hash: SHA256(JSON.stringify(data)+ 'some secret').toString()
// }
// token.data.id=4;
// var resultHash = SHA256(JSON.stringify(token.data)+ 'some secret').toString();
//
// if(resultHash === token.hash){
//   console.log('data not changed');
// }else{
//   console.log('data changed');
// }
