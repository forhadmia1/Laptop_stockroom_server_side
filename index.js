const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlt58.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    console.log('db connected')
    // perform actions on the collection object
    client.close();
});


app.get('/', (req, res) => {
    res.send('warehouse server is running')
})

app.listen(port, () => {
    console.log('listening port', port)
})

//root api
// https://protected-atoll-86406.herokuapp.com/