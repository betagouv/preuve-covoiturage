var mongoose = require("mongoose");
const { mongoUrl } = require("./config.js");

mongoose.connect(mongoUrl, { useNewUrlParser: true }); // Get Mongoose to use the global promise library
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise; // Get the default connection
let db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connection OK");
});

module.exports = db;
