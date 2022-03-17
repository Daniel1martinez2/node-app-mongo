const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dotenv = require('dotenv').config();

const dataBaseName = 'shop';
let _db;

const mongodbUri = process.env.MONGODB_URI;

const mongoConnect = (callback) => {
  MongoClient.connect(`${mongodbUri}${dataBaseName}?retryWrites=true&w=majority`)
    .then(client => {
      console.log('Connected ✨');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err, '🍎');
      throw err;
    });
};

const getDb = () => {
  if (_db){
    return _db;
  }
  throw 'No database found';
}

exports.mongoConnect = mongoConnect; 
exports.getDb = getDb; 
