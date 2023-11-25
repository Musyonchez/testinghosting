const express = require("express");
const axios = require("axios"); // Add this line

const app = express();

require("dotenv").config();

app.use(express.json());

const connectDB = require("./connectMongo");

connectDB();

const BookModel = require("./models/book.model");
// Remove the line that requires the 'redis' module

const deleteKeys = async (pattern) => {
  // ... (unchanged)
};

app.get("/api/v1/books", async (req, res) => {
  // ... (unchanged)

  const key = `Book::${JSON.stringify({query, page, limit, orderBy, sortBy})}`;
  let response = null;

  try {
    const cache = await axios.get(`http://localhost:5000/cache/${key}`); // Change the URL accordingly

    if (cache.data) {
      response = JSON.parse(cache.data);
    } else {
      // ... (unchanged)
      redis.setex(key, 600, JSON.stringify(response));
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.get("/api/v1/books/:id", async (req, res) => {
  try {
    const data = await BookModel.findById(req.params.id);

    if (data) {
      return res.status(200).json({
        msg: "Ok",
        data,
      });
    }

    return res.status(404).json({
      msg: "Not Found",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.post("/api/v1/books", async (req, res) => {
  try {
    const { name, author, price, description } = req.body;
    const book = new BookModel({
      name,
      author,
      price,
      description,
    });
    const data = await book.save();
    deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.put("/api/v1/books/:id", async (req, res) => {
  try {
    const { name, author, price, description } = req.body;
    const { id } = req.params;

    const data = await BookModel.findByIdAndUpdate(
      id,
      {
        name,
        author,
        price,
        description,
      },
      { new: true }
    );
    deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    await BookModel.findByIdAndDelete(req.params.id);
    deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000; // Use 5000 as the default port if not provided
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});