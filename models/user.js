const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; //{items: []}
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  static findUserById(id) {
    const db = getDb();
    return db.collection("users").findOne({
      _id: new mongodb.ObjectId(id),
    });
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex !== -1) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    return db.collection("users").updateOne(
      {
        _id: mongodb.ObjectId(this._id),
      },
      {
        $set: {
          cart: updatedCart,
        },
      }
    );
  }
  getCart() {
    const db = getDb();
    const productsId = this.cart.items.map((p) => p.productId);
    return db
      .collection("products")
      .find({
        _id: {
          $in: productsId,
        },
      })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          const currentProductQuantity = this.cart.items.find(
            (pd) => pd.productId.toString() === p._id.toString()
          );
          return {
            ...p,
            quantity: currentProductQuantity.quantity,
          };
        });
      });
  }
  deleteCartItem(prodId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (p) => p.productId.toString() !== prodId.toString()
    );
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }
  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
            email: this.email
          },
          date: new Date(Date.now())
        }
        
        return db.collection("orders").insertOne(order)
      })
      .then((res) => {
        this.cart = { items: [] };
        db.collection("users").updateOne(
          { _id: new mongodb.ObjectId(this._id) },
          { $set: { cart: { items: [] } } }
        );
      });
  }
  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({'user._id': new mongodb.ObjectId(this._id)})
      .toArray();
  }
}
module.exports = User;
