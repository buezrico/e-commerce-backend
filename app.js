const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");

const app = express();

require("dotenv/config");
const api = process.env.API_URL;
const PORT = process.env.PORT;
const db = process.env.DB_URL;

app.use(cors());
app.options("*", cors());

//Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt);

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose
  .connect(db)
  .then(() => {
    console.log("DATABASE CONNECTED SUCCESFULY");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
