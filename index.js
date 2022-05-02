const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(express.json())
app.use(cors())

//database connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlt58.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const laptopCollection = client.db('laptop-stockroom').collection('laptops');

        //get 6 data for homepage
        app.get('/laptops', async (req, res) => {
            const cursor = laptopCollection.find({})
            const result = await cursor.limit(6).toArray();
            res.send(result)
        })
        //get products by id 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await laptopCollection.findOne(query)
            res.send(result)
        })
        //update data 
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updatepd = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...updatepd
                }
            }
            const result = await laptopCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

    } finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('warehouse server is running')
})

app.listen(port, () => {
    console.log('listening port', port)
})

//root api
// https://protected-atoll-86406.herokuapp.com/