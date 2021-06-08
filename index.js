const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()


// Connection URL
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8pac6.mongodb.net/organicdb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//express app
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

//frontend connect
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})


// Use connect method to connect to the Server
client.connect(err => {
  const productCollection = client.db("organicdb").collection("products");


  //Create Product To Database
  app.post('/addProduct', (req, res) => {
    const product = req.body;
    //console.log(product)
    productCollection.insertOne(product)
    .then(result => {
      console.log("Added Successfully");
      res.redirect('/')
    })
  })

  //Read Products from Database
  app.get('/products', (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    })
  })

  //single product load
  app.get('/product/:id', (req, res) => {
    productCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })

  app.patch('/update/:id', (req, res) => {
    productCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {price: req.body.price, quantity: req.body.quantity}
    })
    .then (result => {
      res.send(result.modifiedCount > 0)
    })
  })


  //Delete Product from Database
  app.delete('/delete/:id', (req, res) => {
    productCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result);
        res.send(result.deletedCount > 0);
      })
  })

  console.log('database connected');
});


app.listen(3000);