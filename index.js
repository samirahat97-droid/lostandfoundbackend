require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("lostAndFoundDB");
    const itemsCollection = database.collection("items");

    app.get("/", (req, res) => {
      res.send("Lost and Found server is running");
    });

    app.get("/my-items/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };

      const result = await itemsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const item = req.body;

      const newItem = {
        ...item,
        status: item.status || "open",
        createdAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/items", async (req, res) => {
      const result = await itemsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await itemsCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-items/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };

      const result = await itemsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.patch("/items/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;

      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          type: updatedItem.type,
          title: updatedItem.title,
          category: updatedItem.category,
          description: updatedItem.description,
          location: updatedItem.location,
          date: updatedItem.date,
          image: updatedItem.image,
          contactInfo: updatedItem.contactInfo,
          status: updatedItem.status,
          updatedAt: new Date(),
        },
      };

      const result = await itemsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
