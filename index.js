const ApplyMiddleware = require("./middlewares");
const ApplyRoutes = require("./routes");
const express = require("express");

const app = express();

ApplyMiddleware(app);
ApplyRoutes(app);

app.listen(3100);
console.log("Listen 3100");