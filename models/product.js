const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }
  save(){
    const db = getDb();
    let dbOperation;
    if(this._id){
      //update the product
      dbOperation = db.collection('products')
      .updateOne({_id: new mongodb.ObjectId(this._id)}, { $set: this });
    }else{
      console.log('🌎')
      dbOperation = db.collection('products').insertOne(this);
    }
    return dbOperation
      .then(res => {
        console.log(res)
      })
      .catch(err => console.log(err, '🍎'))
  }

  static fetchAll(){
    const db = getDb();
    //toArray -> only with less than 100 documents
    //use pagination in the other case
    return db
      .collection('products')
      .find()
      .toArray() //this returns a promise
  }
  static fetchSingleProductById(id){
    const db = getDb();
    return db
      .collection('products')
      .find({_id: new mongodb.ObjectId(id)})
      .next() //to get the next and last document that was returned by find here
  }
  static deleteProductById(id){
    const db = getDb();
    return db
    .collection('products')
    .deleteOne({_id: new mongodb.ObjectId(id)})
  }
  static deleteProductById(id){
    const db = getDb();
    return db.collection('products')
      .deleteOne({_id: new mongodb.ObjectId(id)})
  }
}


module.exports = Product;
