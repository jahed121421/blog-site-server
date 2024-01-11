const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.databaseuser}:${process.env.databasepassword}@cluster0.7bfhsu6.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("blog");
    const alldata = database.collection("all-blog");

    app.get("/all-blog", async (req, res) => {
      const result = await alldata.find().toArray();
      res.send(result);
    });
    app.get("/single-blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await alldata.findOne(query);
      res.send(result);
    });
    app.post("/send-blog", async (req, res) => {
      const body = req.body;
      const result = await alldata.insertOne(body);
      res.send(result);
    });
    app.put("/increse/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const updatedoc = {
        $inc: {
          views: +1,
        },
      };
      const options = {
        upsert: true,
      };
      const result = await alldata.updateOne(query, updatedoc, options);
      res.send(result);
    });
    app.get("/own-blog/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await alldata.find(query).toArray();
      res.send(result);
    });
    app.put("/update-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedoc = {
        $set: {
          title: body.title,
          content: body.content,
        },
      };
      const result = await alldata.updateOne(query, updatedoc);
      res.send(result);
    });
    app.delete("/delete-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await alldata.deleteOne(query);
      res.send(result);
    });
    app.put("/appoved-blog/:id", async (req, res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const updatedoc = {
        $set: {
          status: "appoved",
        },
        $unset: {
          message: 1,
        },
      };
      const options = {
        upsert: true,
      };
      const result = await alldata.updateOne(query, updatedoc, options);
      res.send(result);
    });
    app.put("/decline-blog/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedoc = {
        $set: {
          status: "Decline",
          message: body.message,
        },
      };
      const options = {
        upsert: true,
      };
      const result = await alldata.updateOne(query, updatedoc, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`<h1>Welcome to blog site</h1>`);
});

app.listen(port, () => {
  console.log("Blog site is running");
});
