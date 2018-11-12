// System configuration
let PORT = process.env.PORT || 8080;
let mongoUrl = process.env.DB_ENDPOINT || `mongodb://mongo/pdc-collector?authSource=admin`;
const secret = process.env.SECRET || "not-so-secret";

console.log(`ENV : ${process.env.NODE_ENV}`);
console.log(`PORT : ${PORT}`);
console.log(`MONGO : ${mongoUrl}`);

module.exports = {
  mongoUrl,
  PORT,
  secret
};
