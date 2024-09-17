const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nkfm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // CREATE: send user input data from server to database. client: Join As HR
    const UsersCollection = client.db("Assets").collection("Users");
    const AssetsCollection = client.db("Assets").collection("AllAssets");
    app.post("/addUser", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await UsersCollection.insertOne(newUser);
      res.send(result);
    });

    // READ: get data from db. 
    app.get('/users', async(req,res) => {
      const cursor = UsersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // load data by email 
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log('requested email',email);
      let query = { email : email };
      const result = await UsersCollection.findOne(query);
      res.json(result);
      console.log("email query",result);
    });

     // READ: get data from db. 
     app.get('/allAssets', async(req,res) => {
      const cursor = AssetsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //
    app.patch('/allAssets/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };  // filter select the particular document that needs to be updated
      const updatedAsset = req.body;
      console.log(updatedAsset);
      const updateDoc = {
        $set: {
          Status : updatedAsset.Status
        }
      };
      const result = await AssetsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Asset Management server is running");
});
app.listen(port, () => {
  console.log(`Asset Management is running on port ${port}`);
});
