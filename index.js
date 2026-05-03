require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rococo-dusk-4fdc4e.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let itemsCollection;
let claimsCollection;

async function connectDB() {
  if (db) return;

  await client.connect();

  db = client.db("lostAndFoundDB");
  itemsCollection = db.collection("items");
  claimsCollection = db.collection("claims");

  console.log("MongoDB connected successfully");
}

app.get("/", (req, res) => {
  res.send("Lost and Found Backend is running successfully");
});

app.get("/items", async (req, res) => {
  try {
    await connectDB();

    const result = await itemsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("GET /items error:", error);
    res.status(500).send({ message: "Failed to load items", error: error.message });
  }
});

app.post("/items", async (req, res) => {
  try {
    await connectDB();

    const item = req.body;

    const newItem = {
      ...item,
      status: item.status || "open",
      createdAt: new Date(),
    };

    const result = await itemsCollection.insertOne(newItem);
    res.send(result);
  } catch (error) {
    console.error("POST /items error:", error);
    res.status(500).send({ message: "Failed to add item", error: error.message });
  }
});

app.get("/items/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await itemsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.error("GET /items/:id error:", error);
    res.status(500).send({ message: "Failed to load item", error: error.message });
  }
});

app.get("/my-items/:email", async (req, res) => {
  try {
    await connectDB();

    const email = req.params.email;
    const query = { userEmail: email };

    const result = await itemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("GET /my-items/:email error:", error);
    res.status(500).send({ message: "Failed to load my items", error: error.message });
  }
});

app.patch("/items/:id", async (req, res) => {
  try {
    await connectDB();

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
  } catch (error) {
    console.error("PATCH /items/:id error:", error);
    res.status(500).send({ message: "Failed to update item", error: error.message });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await itemsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("DELETE /items/:id error:", error);
    res.status(500).send({ message: "Failed to delete item", error: error.message });
  }
});

app.post("/claims", async (req, res) => {
  try {
    await connectDB();

    const claim = req.body;

    const newClaim = {
      ...claim,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await claimsCollection.insertOne(newClaim);
    res.send(result);
  } catch (error) {
    console.error("POST /claims error:", error);
    res.status(500).send({ message: "Failed to create claim", error: error.message });
  }
});

app.get("/claims/:email", async (req, res) => {
  try {
    await connectDB();

    const email = req.params.email;
    const query = { claimantEmail: email };

    const result = await claimsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("GET /claims/:email error:", error);
    res.status(500).send({ message: "Failed to load claims", error: error.message });
  }
});

app.get("/owner-claims/:email", async (req, res) => {
  try {
    await connectDB();

    const email = req.params.email;
    const query = { ownerEmail: email };

    const result = await claimsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("GET /owner-claims/:email error:", error);
    res.status(500).send({ message: "Failed to load owner claims", error: error.message });
  }
});

app.patch("/claims/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;
    const { status } = req.body;

    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        status,
        updatedAt: new Date(),
      },
    };

    const result = await claimsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("PATCH /claims/:id error:", error);
    res.status(500).send({ message: "Failed to update claim", error: error.message });
  }
});

module.exports = app;