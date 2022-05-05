const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

        //verify jwt 
        function verifyJwt(req, res, next) {
            const authorization = req.headers.authorization;
            if (authorization) {
                const token = authorization.split(' ')[1]
                jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                    req.decoded = decoded;
                })
            }
            next()
        }

        //get product couunt 
        app.get('/count', async (req, res) => {
            const result = await laptopCollection.countDocuments();
            console.log(result)
            res.send({ count: result })
        })

        //get  data for homepage
        app.get('/allproducts', async (req, res) => {
            const skip = parseInt(req.query.skip);
            const limit = parseInt(req.query.limit);
            const cursor = laptopCollection.find({})
            const result = await cursor.skip(skip).limit(limit).toArray();
            res.send(result)
            console.log(result.length)
        })

        //get my items 
        app.get('/myitems', verifyJwt, async (req, res) => {
            const author = req.query.email;
            const query = { author }
            if (req.decoded === author) {
                const cursor = laptopCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
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

        //delete items
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await laptopCollection.deleteOne(query)
            res.send(result)
        })

        //add items 
        app.post('/inventory/additem', async (req, res) => {
            const newItem = req.body;
            const result = await laptopCollection.insertOne(newItem)
            res.send(result)
        })

        //generate token 
        app.post('/login', (req, res) => {
            console.log(req.body)
            const email = req.body.email;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN)
            res.send({ token })
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